"""Çekim motoru: çekimler veri olarak yazılır (mekân, kamera, oyuncular, altyazı); motor kareyi kurar, temas sayfasını ve videoyu üretir.

Çekim sözlüğü:
  n    ad                         c    altyazı parçaları ("a|b|c")
  set  mekân adı                  cam  [(cx, cy, z) baş, (cx, cy, z) son]; punch=True ise yay gibi oturur
  a    oyuncular: (tür, başlangıç duruşu, [bitiş duruşu], [geçiş anı 0–1])
  fx   ekran uzayında çizim: fx(u) → svg (eşya çekimleri, ışık huzmeleri)
  blur arka planı odak dışına atar"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFont
from ..kit import *
from . import cast as C, cast2 as K, sets as S, sets2 as S2, film as F
from ..kit import cv2

lerp, ease, spring, at = F.lerp, F.ease, F.spring, F.at
FW, FH, FPS, CHUNK = F.FW, F.FH, F.FPS, F.CHUNK


def _rider(p, e):
    """Atlı Dumrul: at sola bakar; binici belden yukarı görünür."""
    h = K.horse(p.get('spooked', False))
    d = '<clipPath id="rc"><rect x="-500" y="-700" width="1000" height="1040"/></clipPath><g clip-path="url(#rc)">' + C.dumrul(e, p.get('armL', 30), p.get('armR', -30), p.get('hr', 0), p.get('poseR', 'open'), p.get('sword', False)) + '</g>'
    reseed('rider-leg')
    skirt = blob([(-104, -150), (96, -150), (124, -70), (70, -6), (-64, -14), (-124, -76)], C.COAT, 3.4) + ''.join(C.stud(x, -30 + abs(x) * 0.1, 3.4) for x in range(-90, 100, 36))   # atın sırtına yayılan etek
    thigh = blob([(-10, -120), (60, -96), (10, 10), (-70, 40), (-110, 6), (-60, -70)], C.COAT, 3.2)                      # öne uzanan uyluk
    boot = blob([(-112, 0), (-52, 18), (-50, 120), (-64, 150), (-150, 156), (-164, 132), (-108, 116)], C.LEATHER, 3.2) + ink([(-110, 40), (-54, 52)], 2.0, wob=0.3, smooth=False) + C.stud(-84, 30, 3.4)
    return h + group(d, 0, -330, p.get('lean', 0), 0.62, None, 0, 330) + skirt + thigh + boot


KINDS = {
    'dumrul': (548, lambda p, e: C.dumrul(e, p.get('armL', 8), p.get('armR', -8), p.get('hr', 0), p.get('poseR', 'open'), p.get('sword', False))),
    'azrail': (640, lambda p, e: C.azrail(e, p.get('armL', 10), p.get('armR', -10), p.get('spread', 1.0), p.get('hr', 0))),
    'father': (470, lambda p, e: K.father(e, p.get('armL', 10), p.get('armR', -24), p.get('hr', 6))),
    'mother': (470, lambda p, e: K.mother(e, p.get('armL', 16), p.get('armR', -16), p.get('hr', 0))),
    'wife': (620, lambda p, e: K.wife(e, p.get('armL', 12), p.get('armR', -12), p.get('hr', 0))),
    'dede': (600, lambda p, e: K.dede(e, p.get('hr', 0))),
    'boy0': (0, lambda p, e: K.boy(0, e)), 'boy1': (0, lambda p, e: K.boy(1, e)),
    'mourner0': (250, lambda p, e: K.mourner(0, e)), 'mourner1': (250, lambda p, e: K.mourner(1, e)), 'mourner2': (250, lambda p, e: K.mourner(2, e)),
    'trav': (430, lambda p, e: K.traveller(e)),
    'dead': (30, lambda p, e: K.dead_youth(p.get('sick', False))),
    'horse': (330, lambda p, e: K.horse(p.get('spooked', False))),
    'rider': (330, _rider),
    'falcon': (0, lambda p, e: K.falcon()),
    'dove': (0, lambda p, e: C.dove(int(F.NOW * 9) % 2)),
    'goblet': (40, lambda p, e: C.goblet()),
    'extra0': (230, lambda p, e: C.extra(0, p.get('robe'), e == 'fear')), 'extra1': (230, lambda p, e: C.extra(1, p.get('robe'), e == 'fear')), 'extra2': (230, lambda p, e: C.extra(2, p.get('robe'), e == 'fear')),
}
BLINKERS = ('neutral', 'smug', 'stern', 'joy', 'grief', 'anger')
STILL = ['extra', 'dead', 'horse', 'falcon', 'trav', 'dove', 'goblet', 'rider']     # göz kırpmayanlar (ad ön eki); hikâyeler ekleyebilir
HEADS = ['dumrul', 'azrail', 'father', 'mother', 'wife', 'dede']                    # başı gövdenin ardından gelenler
EXTRA_MOTION = {}                                                                   # hikâyeye özgü ikincil hareket: tür → fn(p, t, idx) → (dx, dy, drot)
BLINK = {'dumrul': 'blink', 'azrail': 'blink'}


# Zamanlama: her kişinin kendi temposu (yay sıklığı, sönüm). Ağır Dumrul geç oturur, Azrail taşmadan durur, oğlancıklar çabuktur.
TEMPO = {'dumrul': (1.7, 4.0), 'rider': (1.7, 4.0), 'father': (1.3, 3.2), 'mother': (1.6, 4.0), 'azrail': (0.9, 6.5), 'boy0': (3.0, 5.5), 'boy1': (3.0, 5.5),
         'dede': (1.2, 4.0), 'wife': (2.2, 5.0), 'trav': (2.6, 5.0), 'horse': (1.6, 4.0)}
clamp = lambda v, lo, hi: max(lo, min(hi, v))


def pose(spec, u, nfr):
    """Oyuncunun u anındaki duruşu. Hazırlık (anticipation): harekete geçmeden birkaç kare önce ters yöne hafifçe çekilir.
    Yay (arc): 'arc' verilmişse yer değiştirme düz çizgide değil kavis üstünde olur."""
    kind, p0 = spec[0], spec[1]
    p1 = spec[2] if len(spec) > 2 else None
    t0 = spec[3] if len(spec) > 3 else 0.12
    p = dict(p0); k = 0.0
    if p1:
        d = max(1e-6, 1 - t0)
        if p1.get('glide'): k = ease((u - t0) / d) if u > t0 else 0.0
        else:
            ant = min(t0, 5.0 / nfr)
            if u > t0: k = spring((u - t0) / d, *TEMPO.get(kind, (2.2, 5.0)))
            elif ant > 0 and u > t0 - ant: k = -0.16 * math.sin(math.pi * (u - (t0 - ant)) / ant)
        for key, v in p1.items():
            if isinstance(v, bool) or not isinstance(v, (int, float)): p[key] = v if u > t0 else p0.get(key, v)
            else: p[key] = lerp(p0.get(key, v), v, k)
        arc = p1.get('arc', 0.18 * abs(p1.get('x', p0['x']) - p0['x']) if kind == 'dove' else 0)
        if arc: p['y'] -= arc * math.sin(math.pi * clamp(k, 0, 1))
    p['_t0'] = t0 if p1 else None
    return p


def actor(spec, u, idx=0, nfr=45):
    kind = spec[0]
    p = pose(spec, u, nfr); q = pose(spec, u - 4.0 / nfr, nfr)            # dört kare önceki duruş: hız buradan çıkar
    vx, vy, vr = p['x'] - q['x'], p['y'] - q['y'], p.get('rot', 0) - q.get('rot', 0)
    e = p.get('e', 'neutral')
    still = kind.startswith(tuple(STILL))
    if e in BLINKERS and abs((F.NOW * 0.52 + idx * 0.37) % 1 - 0.5) < 0.03 and not still: e = 'blink'
    s = p.get('s', 0.6); t = F.NOW
    foot, fn = KINDS[kind]
    x, y, rot = p['x'], p['y'], p.get('rot', 0)
    y -= math.sin(t * 2.1 + idx * 1.7) * 2.5 * s                                         # nefes
    sx = sy = 1.0
    # --- ikincil hareket: herkesin kendi küçük işi
    if kind.startswith('extra'):
        if e == 'fear': rot += math.sin(t * 31 + idx) * 1.3                               # korkudan titrer
        else:
            rot += 2.5 * math.sin(t * 1.1 + idx * 2)
            ph = (t * 0.23 + idx * 0.31) % 1
            if ph < 0.14: w = math.sin(math.pi * ph / 0.14); rot -= 9 * w; y -= 9 * w * s   # kadehinden bir yudum
    elif kind.startswith('mourner'): rot += 5 * math.sin(t * 2.4 + idx * 1.3); y += 6 * s * math.sin(t * 4.8 + idx)   # ağıtla sallanır
    elif kind.startswith('boy'): y -= abs(math.sin(t * 3 + idx)) * 7 * s                   # yerinde duramaz
    elif kind == 'falcon': rot += 7 * round(math.sin(t * 1.4))                             # başını bir o yana bir bu yana eğer
    elif kind == 'azrail': y += 5 * math.sin(t * 1.2)                                      # ağır ağır süzülür
    elif kind == 'dede': rot += 2 * math.sin(t * 3)                                        # kopuzla sallanır
    if kind in EXTRA_MOTION:
        dx, dy, dr = EXTRA_MOTION[kind](p, t, idx); x += dx; y += dy * s; rot += dr
    # --- yürüyüş, dörtnal: basarken ezilir, havadayken uzar
    if p.get('walk'):
        c = abs(math.sin(t * 9 + idx)); y -= c * 22 * s; sy *= 0.95 + 0.09 * c
    if p.get('gallop'):
        c = abs(math.sin(t * 13)); y -= c * 40 * s; rot += math.sin(t * 13) * 5; sy *= 0.93 + 0.12 * c
    rot += math.sin(t * 26) * 2.5 * p.get('shake', 0)
    # --- ezilme ve uzama: hızlı düşey harekette uzar; 'land' anında yere çarpıp ezilir, sonra toparlanır
    st = min(0.16, abs(vy) / (700 * s)); sy *= 1 + st
    if 'land' in p:
        n = (u - p['land']) * nfr
        if 0 <= n < 14:
            sq = 0.24 * math.exp(-n / 3.5) * math.cos(n * 0.8)
            if abs(rot) > 45: sx *= 1 - sq                                                   # yatan gövdede yere dik eksen gövdenin enidir
            else: sy *= 1 - sq
    if p['_t0'] is not None and e in ('shock', 'fear', 'wrath') and u > p['_t0']:        # abartı: irkilirken bir an uzar
        sy *= 1 + 0.12 * math.exp(-(u - p['_t0']) * nfr / 4)
    sx /= sy ** 0.5 if abs(rot) <= 45 else 1; 
    # --- ardından gelme: sarkan parçalar gövdeden geç kalır, durunca bir iki kez sallanıp oturur
    sw = clamp(vx * 0.3 / s + vr * 0.9 + (p.get('hr', 0) - q.get('hr', 0)) * 0.9, -24, 24) + 2.5 * math.sin(t * 1.7 + idx)
    if kind in ('horse', 'rider'): sw += 9 * math.sin(t * (13 if p.get('gallop') else 2.3))
    C.SWAY = -sw if p.get('flip') else sw
    if 'hr' in p or kind in HEADS:
        p['hr'] = p.get('hr', 0) + clamp(vx * 0.1 / s - vy * 0.08 / s, -9, 9)             # baş, gövdenin ardından gelir
    body = group(fn(p, e), 0, 0, 0, sx, sy, 0, foot)
    return (p.get('z', p['y'] + foot * s), at(body, x, y, s, rot, p.get('flip', False)))


# ----------------------------------------------------------------------------- arka plan canlılığı
def birds(t, n=6, y0=560, size=1.0):
    """Gökte kuş sürüsü: iki kanat çizgisi, kanat çırparak geçer."""
    reseed('birds')
    s = ''
    for i in range(n):
        ph = R(0, 1); x = (t * R(50, 90) + ph * 1900) % 1900 - 200; y = y0 + R(-140, 140) + math.sin(t * 2 + i) * 14
        f = math.sin(t * 9 + i * 2) * 10 * size
        s += ink([(x - 20 * size, y - f), (x, y), (x + 20 * size, y - f)], 3.0 * size, wob=0, taper=(0.2, 0.2), smooth=False)
    return s


def flag(t):
    reseed('flagwave')
    f = math.sin(t * 5) * 14
    p = [(1426, 910), (1500 + f * 0.3, 924 + f * 0.5), (1570, 930 - f), (1540 + f, 980), (1580, 1030 + f), (1500, 1026 - f * 0.5), (1426, 1020)]
    return blob(p, C.RED, 3.0) + medallion(1484 + f * 0.3, 970, 20, C.GOLD, 2.0)


def dust(t, y=1500, n=7):
    reseed('dust')
    s = ''
    for i in range(n):
        ph = R(0, 1); x = (t * R(30, 70) + ph * 1700) % 1700 - 100; yy = y + R(-60, 200)
        s += fill(ellipse(x, yy, R(24, 50), R(8, 14), 7, 0.2), C.PALE, 0.6, op=0.3)
    return s


def motes(t):
    reseed('motes')
    s = ''
    for i in range(22):
        ph = R(0, 1); x = 640 + R(0, 420) + math.sin(t * 0.8 + i) * 20; y = 300 + ((t * R(18, 40) + ph * 1200) % 1200)
        s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{R(1.5, 3.5):.1f}" fill="{C.PALE}" opacity="{R(0.4, 0.9):.2f}"/>'
    return s


def shimmer(t):
    """Göksel ışık kıpırtısı: huzmeler sırayla parlar."""
    s = ''
    for i in range(5):
        a = -0.7 + i * 0.35 + math.sin(t * 0.6 + i) * 0.05; x1 = 750 + math.sin(a) * 2400
        s += fill([(740, 60), (760, 60), (x1 + 50, 2100), (x1 - 50, 2100)], C.PALE, 0, smooth=False, op=0.12 + 0.12 * (0.5 + 0.5 * math.sin(t * 2.4 + i * 1.3)))
    return s


SETS = {
    'feast': dict(bg=S.NIGHT, sky=S.sky, back=S.back, mid=lambda: S.yurt() + S.ground(), fore=S.sofra, life=lambda t: [(1640, S.fire(300, 1640, t * 2.3) + S.embers(300, 1470, t * 1.5))]),
    'bridge': dict(bg=S2.DAY, sky=S2.day_sky, back=S2.day_hills, mid=S2.bridge, life=lambda t: [(-10, birds(t)), (5000, dust(t, 1520))]),
    'oba': dict(bg=S2.DAY, sky=S2.day_sky, back=S2.day_hills, mid=S2.oba, life=lambda t: [(-10, birds(t, 4)), (5000, dust(t, 1560, 5))]),
    'inside': dict(bg=C.COBALT, sky=None, back=None, mid=S2.tent_inside, life=lambda t: [(5000, motes(t))]),
    'steppe': dict(bg=S.NIGHT, sky=None, back=None, mid=S2.steppe_night, life=lambda t: [(5000, S.embers(1100, 1700, t * 0.7))]),
    'heaven': dict(bg=S.NIGHT, sky=None, back=None, mid=S2.heaven, life=lambda t: [(-10, shimmer(t))]),
    'river': dict(bg=S2.DAY, sky=S2.day_sky, back=S2.day_hills, mid=S2.bridge, life=lambda t: [(-10, birds(t)), (-5, S2.water(t))]),
}


# ----------------------------------------------------------------------------- odak dışı arka plan: önbellekli katmanlar
RECT = (-300, -200, 2100, 2400)     # katmanların önbelleğe alındığı dünya dikdörtgeni
KB = 0.6                            # önbellek ölçeği (bulanık olduğu için düşük çözünürlük yeter)
_layers = {}


def cached(setname, key):
    """Bir mekân katmanını bir kez çizer, bulanıklaştırır ve saklar (önceden çarpılmış RGBA)."""
    if (setname, key) not in _layers:
        w, h = int(RECT[2] * KB), int(RECT[3] * KB)
        s = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{RECT[0]} {RECT[1]} {RECT[2]} {RECT[3]}"><defs>{S.HALO}</defs>{SETS[setname][key]()}</svg>'
        a = np.asarray(raster(s, w, h)).astype(np.float32)
        a[:, :, :3] *= a[:, :, 3:4] / 255
        _layers[(setname, key)] = cv2.GaussianBlur(a, (0, 0), 7 * KB)
    return _layers[(setname, key)]


def over(dst, src):
    """Önceden çarpılmış RGBA'yı alttaki resmin üstüne bindirir."""
    dst[:, :, :3] = src[:, :, :3] + dst[:, :, :3] * (1 - src[:, :, 3:4] / 255)
    return dst


def warp(setname, key, cam, p, w, h):
    lx, ly, lz = F.layer_cam(cam, p)
    k = w / FW
    m = np.float32([[lz / KB * k, 0, ((RECT[0] - lx) * lz + FW / 2) * k], [0, lz / KB * k, ((RECT[1] - ly) * lz + FH / 2) * k]])
    return cv2.warpAffine(cached(setname, key), m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))


def compose(shot, u, w, h):
    """Kareyi kurar (cilasız RGB). Odak dışı çekimlerde mekân önbellekten gelir ve yalnızca oyuncular çizilir;
    öbür çekimlerde bütün sahne tek SVG olarak çizilir."""
    st = SETS[shot['set']]
    head = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {FW} {FH}">'
    if not shot.get('blur') or cv2 is None:
        s = head + f'<defs>{F.DEFS}</defs><rect width="{FW}" height="{FH}" fill="{st["bg"]}"/>{draw(shot, u)}</svg>'
        return raster(s, w, h).convert('RGB')
    c0, c1 = shot['cam']
    k = spring(u) if shot.get('punch') else ease(u)
    cam = F.camera(*(lerp(a, b, k) for a, b in zip(c0, c1)))
    bg = tuple(int(st['bg'][i:i + 2], 16) for i in (1, 3, 5))
    out = np.empty((h, w, 3), np.float32); out[:] = bg
    if st['sky']:
        over(out, warp(shot['set'], 'sky', cam, 0.12, w, h)); over(out, warp(shot['set'], 'back', cam, 0.45, w, h))
    over(out, warp(shot['set'], 'mid', cam, 1.0, w, h))
    items = [actor(a, u, i, frames_of(shot)) for i, a in enumerate(shot.get('a', []))] + st['life'](F.NOW)
    body = F.layer(''.join(b for _, b in sorted(items, key=lambda it: it[0])), cam, 1.0, False) + (shot['fx'](u) if shot.get('fx') else '')
    fg = np.asarray(raster(head + f'<defs>{S.HALO}</defs>{body}</svg>', w, h)).astype(np.float32)
    fg[:, :, :3] *= fg[:, :, 3:4] / 255
    over(out, fg)
    if st.get('fore') and not shot.get('nofore'): over(out, warp(shot['set'], 'fore', cam, 1.18, w, h))
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGB')


def draw(shot, u):
    st = SETS[shot['set']]
    c0, c1 = shot['cam']
    k = spring(u) if shot.get('punch') else ease(u)
    cam = F.camera(*(lerp(a, b, k) for a, b in zip(c0, c1)))
    blur = shot.get('blur', False)
    s = ''
    if st['sky']: s += F.layer(st['sky'](), cam, 0.12, blur) + F.layer(st['back'](), cam, 0.45, blur)
    s += F.layer(st['mid'](), cam, 1.0, blur)
    items = [actor(a, u, i, frames_of(shot)) for i, a in enumerate(shot.get('a', []))] + st['life'](F.NOW)
    s += F.layer(''.join(b for _, b in sorted(items, key=lambda it: it[0])), cam, 1.0, False)
    if st.get('fore') and not shot.get('nofore'): s += F.layer(st['fore'](), cam, 1.18, blur)
    if shot.get('fx'): s += shot['fx'](u)
    return s


def chunks(shot):
    return shot['c'].split('|')


def frames_of(shot):
    if 'nf' in shot: return shot['nf']                       # seslendirmeden gelen süre
    return round((len(chunks(shot)) * CHUNK + shot.get('hold', 0)) * FPS)


def frame(shots, i, u=0.6, scale=1.0, f=None):
    shot = shots[i]; n = frames_of(shot); ch = chunks(shot)
    if f is not None: u = f / max(1, n - 1)
    start = sum(frames_of(x) for x in shots[:i])
    F.NOW = (start + (f if f is not None else u * n)) / FPS
    w, h = int(FW * scale), int(FH * scale)
    img = finish(compose(shot, u, w, h), int(F.NOW * FPS), grain=F.GRAIN * max(scale, 0.6))
    if 'starts' in shot:                                  # altyazı parçaları sesteki yerlerinde değişir
        ff = f if f is not None else u * n
        ci = max(i_ for i_, s_ in enumerate(shot['starts']) if s_ <= ff or i_ == 0)
        if f is None: return F.caption(img, ch[ci])
    elif f is None: return F.caption(img, ch[min(len(ch) - 1, int(u * len(ch)))])
    if f < 3 and i > 0: img = F.whip(img, (3 - f) / 3 * 0.9)
    if f >= n - 3 and i < len(shots) - 1: img = F.whip(img, (f - (n - 4)) / 3 * 0.9)
    if 'starts' in shot: return F.caption(img, ch[ci], dim=0 <= f - shot['starts'][ci] < 3)
    per = CHUNK * FPS; ci = min(len(ch) - 1, int(f / per))
    return F.caption(img, ch[ci], dim=(f - ci * per) < 3 and f < len(ch) * per + 3)


def contact(shots, out, title=''):
    tw, th = 378, 672
    cols = 6; rows = math.ceil(len(shots) / cols)
    sheet = Image.new('RGB', (cols * (tw + 20) + 20, rows * (th + 92) + 70), (234, 223, 200))
    d = ImageDraw.Draw(sheet); f = ImageFont.truetype(F.FONT, 20); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
    d.text((20, 14), title + f' — {len(shots)} çekim, {sum(frames_of(s) for s in shots) / FPS:.1f} sn', font=ImageFont.truetype(F.FONT, 30), fill=(23, 11, 8))
    for i, shot in enumerate(shots):
        im = frame(shots, i, shot.get('still', 0.62), 0.35).resize((tw, th))
        x, y = 20 + (i % cols) * (tw + 20), 64 + (i // cols) * (th + 92)
        sheet.paste(im, (x, y))
        d.text((x, y + th + 6), f'{i + 1}. {shot["n"]}', font=f, fill=(23, 11, 8))
        d.text((x, y + th + 34), ' / '.join(chunks(shot))[:52], font=f2, fill=(77, 20, 10))
    sheet.save(out, quality=90)


def _job(args):
    slug, i, f, d, scale, n = args
    scenes = F._voice._scenes()
    frame(scenes.SCENES[slug], i, scale=scale, f=f).save(f'{d}/s{i:02d}/{n:04d}.jpg', quality=96 if scale >= 1 else 90, subsampling=0)


def render(slug, out, work, draft=False):
    """draft=True: yarı çözünürlük, saniyede 15 kare, hızlı kodlama — zamanlamayı ve oyunculuğu görmek için."""
    import multiprocessing as mp, subprocess, shutil
    scenes = F._voice._scenes()
    shots = scenes.SCENES[slug]
    scale, step = (0.5, 2) if draft else (1.0, 1)
    jobs = []
    for i, shot in enumerate(shots):
        shutil.rmtree(f'{work}/s{i:02d}', ignore_errors=True); os.makedirs(f'{work}/s{i:02d}')
        jobs += [(slug, i, f, work, scale, n) for n, f in enumerate(range(0, frames_of(shot), step))]
    with mp.Pool(min(11, os.cpu_count() or 4)) as pool:
        for k, _ in enumerate(pool.imap_unordered(_job, jobs, chunksize=4)):
            if k % 150 == 0: print('kare', k, '/', len(jobs), flush=True)
    files = []
    for i in range(len(shots)):
        p = f'{work}/s{i:02d}.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS // step), '-i', f'{work}/s{i:02d}/%04d.jpg', '-c:v', 'libx264', '-crf', '24' if draft else '17', '-preset', 'veryfast' if draft else 'medium', '-pix_fmt', 'yuv420p', '-r', str(FPS // step), p], check=True)
        files.append(p)
    with open(f'{work}/list.txt', 'w') as fh: fh.write(''.join(f"file '{os.path.abspath(p)}'\n" for p in files))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{work}/list.txt', '-c', 'copy', out], check=True)
    print('bitti', out, len(jobs) * step / FPS, 'sn', '(taslak)' if draft else '')


if __name__ == '__main__':
    from . import scenes
    cmd, slug = sys.argv[1], sys.argv[2]
    if cmd == 'contact': contact(scenes.SCENES[slug], sys.argv[3], scenes.TITLES.get(slug, slug))
    elif cmd == 'render': render(slug, sys.argv[3], sys.argv[4])
    elif cmd == 'draft': render(slug, sys.argv[3], sys.argv[4], draft=True)
    elif cmd == 'f': frame(scenes.SCENES[slug], int(sys.argv[3]), f=int(sys.argv[4])).save(sys.argv[5])
