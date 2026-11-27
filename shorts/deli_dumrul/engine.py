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

lerp, ease, spring, at = F.lerp, F.ease, F.spring, F.at
FW, FH, FPS, CHUNK = F.FW, F.FH, F.FPS, F.CHUNK


def _rider(p, e):
    """Atlı Dumrul: at sola bakar; binici belden yukarı görünür."""
    h = K.horse(p.get('spooked', False))
    d = '<clipPath id="rc"><rect x="-500" y="-700" width="1000" height="1040"/></clipPath><g clip-path="url(#rc)">' + C.dumrul(e, p.get('armL', 30), p.get('armR', -30), p.get('hr', 0), p.get('poseR', 'open'), p.get('sword', False)) + '</g>'
    boot = blob([(-40, 20), (20, 20), (30, 120), (70, 140), (66, 170), (-40, 170)], C.LEATHER, 3.0)
    return group(d, 0, -330, p.get('lean', 0), 0.62, None, 0, 330) + h + group(boot, -10, -20)


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
    'dead': (30, lambda p, e: K.dead_youth()),
    'horse': (330, lambda p, e: K.horse(p.get('spooked', False))),
    'rider': (330, _rider),
    'falcon': (0, lambda p, e: K.falcon()),
    'dove': (0, lambda p, e: C.dove(int(F.NOW * 9) % 2)),
    'goblet': (40, lambda p, e: C.goblet()),
    'extra0': (230, lambda p, e: C.extra(0, p.get('robe'), e == 'fear')), 'extra1': (230, lambda p, e: C.extra(1, p.get('robe'), e == 'fear')), 'extra2': (230, lambda p, e: C.extra(2, p.get('robe'), e == 'fear')),
}
BLINKERS = ('neutral', 'smug', 'stern', 'joy', 'grief', 'anger')
BLINK = {'dumrul': 'blink', 'azrail': 'blink'}


def actor(spec, u, idx=0):
    kind, p0 = spec[0], spec[1]
    p1 = spec[2] if len(spec) > 2 else None
    t0 = spec[3] if len(spec) > 3 else 0.12
    p = dict(p0)
    if p1:
        k = (ease if p1.get('glide') else spring)((u - t0) / max(1e-6, 1 - t0)) if u > t0 else 0.0
        for key, v in p1.items():
            if isinstance(v, bool) or not isinstance(v, (int, float)): p[key] = v if u > t0 else p0.get(key, v)
            else: p[key] = lerp(p0.get(key, v), v, k)
    e = p.get('e', 'neutral')
    if e in BLINKERS and abs((F.NOW * 0.52 + idx * 0.37) % 1 - 0.5) < 0.03 and not kind.startswith(('extra', 'dead', 'horse', 'falcon', 'trav', 'dove', 'goblet', 'rider')): e = 'blink'
    s = p.get('s', 0.6)
    foot, fn = KINDS[kind]
    bob = math.sin(F.NOW * 2.1 + idx * 1.7) * 2.5 * s                                    # nefes
    if p.get('walk'): bob += abs(math.sin(F.NOW * 9 + idx)) * 22 * s                      # yürüyüş, koşu
    rot = p.get('rot', 0) + (math.sin(F.NOW * 13) * 5 if p.get('gallop') else 0) + (math.sin(F.NOW * 26) * 2.5 * p.get('shake', 0))
    if p.get('gallop'): bob += abs(math.sin(F.NOW * 13)) * 40 * s
    return (p.get('z', p['y'] + foot * s), at(fn(p, e), p['x'], p['y'] - bob, s, rot, p.get('flip', False)))


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


def draw(shot, u):
    st = SETS[shot['set']]
    c0, c1 = shot['cam']
    k = spring(u) if shot.get('punch') else ease(u)
    cam = F.camera(*(lerp(a, b, k) for a, b in zip(c0, c1)))
    blur = shot.get('blur', False)
    s = ''
    if st['sky']: s += F.layer(st['sky'](), cam, 0.12, blur) + F.layer(st['back'](), cam, 0.45, blur)
    s += F.layer(st['mid'](), cam, 1.0, blur)
    items = [actor(a, u, i) for i, a in enumerate(shot.get('a', []))] + st['life'](F.NOW)
    s += F.layer(''.join(b for _, b in sorted(items, key=lambda it: it[0])), cam, 1.0, False)
    if st.get('fore') and not shot.get('nofore'): s += F.layer(st['fore'](), cam, 1.18, blur)
    if shot.get('fx'): s += shot['fx'](u)
    return s


def chunks(shot):
    return shot['c'].split('|')


def frames_of(shot):
    return round((len(chunks(shot)) * CHUNK + shot.get('hold', 0)) * FPS)


def frame(shots, i, u=0.6, scale=1.0, f=None):
    shot = shots[i]; n = frames_of(shot); ch = chunks(shot)
    if f is not None: u = f / max(1, n - 1)
    start = sum(frames_of(x) for x in shots[:i])
    F.NOW = (start + (f if f is not None else u * n)) / FPS
    w, h = int(FW * scale), int(FH * scale)
    bg = SETS[shot['set']]['bg']
    body = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {FW} {FH}"><defs>{F.DEFS}</defs><rect width="{FW}" height="{FH}" fill="{bg}"/>{draw(shot, u)}</svg>'
    img = finish(raster(body, w, h), int(F.NOW * FPS), grain=4.0 * max(scale, 0.6))
    if f is None: return F.caption(img, ch[min(len(ch) - 1, int(u * len(ch)))])
    if f < 3 and i > 0: img = F.whip(img, (3 - f) / 3 * 0.9)
    if f >= n - 3 and i < len(shots) - 1: img = F.whip(img, (f - (n - 4)) / 3 * 0.9)
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
    slug, i, f, d = args
    from . import scenes
    frame(scenes.SCENES[slug], i, f=f).save(f'{d}/s{i:02d}/{f:04d}.jpg', quality=96, subsampling=0)


def render(slug, out, work):
    import multiprocessing as mp, subprocess
    from . import scenes
    shots = scenes.SCENES[slug]
    jobs = []
    for i, shot in enumerate(shots):
        os.makedirs(f'{work}/s{i:02d}', exist_ok=True)
        jobs += [(slug, i, f, work) for f in range(frames_of(shot))]
    with mp.Pool(min(11, os.cpu_count() or 4)) as pool:
        for k, _ in enumerate(pool.imap_unordered(_job, jobs, chunksize=4)):
            if k % 150 == 0: print('kare', k, '/', len(jobs), flush=True)
    files = []
    for i in range(len(shots)):
        p = f'{work}/s{i:02d}.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{work}/s{i:02d}/%04d.jpg', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', str(FPS), p], check=True)
        files.append(p)
    with open(f'{work}/list.txt', 'w') as fh: fh.write(''.join(f"file '{os.path.abspath(p)}'\n" for p in files))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{work}/list.txt', '-c', 'copy', out], check=True)
    print('bitti', out, len(jobs) / FPS, 'sn')


if __name__ == '__main__':
    from . import scenes
    cmd, slug = sys.argv[1], sys.argv[2]
    if cmd == 'contact': contact(scenes.SCENES[slug], sys.argv[3], scenes.TITLES.get(slug, slug))
    elif cmd == 'render': render(slug, sys.argv[3], sys.argv[4])
    elif cmd == 'f': frame(scenes.SCENES[slug], int(sys.argv[3]), f=int(sys.argv[4])).save(sys.argv[5])
