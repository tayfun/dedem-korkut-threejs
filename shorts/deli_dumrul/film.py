"""Azrail'e Kılıç Çeken Adam — çekim listesi, kare kurucu ve temas sayfası.
Her çekim: kim ekranda, ifade, beden hareketi, kamera. draw(shot, u) çekimin u (0–1) anındaki kareyi kurar."""
import math, sys, os
from PIL import Image, ImageDraw, ImageFont
from ..kit import *
from . import cast as C, sets as S

FW, FH = 1080, 1920
FONT = '/usr/share/fonts/truetype/noto/NotoSansDisplay-Black.ttf'
DEFS = S.HALO + '<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>'

# Dünyadaki yerler (sahne 1500×1920)
DUM = (880, 1215, 0.6)
AZ = (480, 1110, 0.6)
lerp = lambda a, b, u: a + (b - a) * u
ease = lambda u: u * u * (3 - 2 * u)


def spring(u, n=2.2, d=5.0):
    """Tek karede oturan, yay gibi taşan geçiş (0 → 1)."""
    return 1 - math.exp(-d * u * 4) * math.cos(n * 6.283 * u) if u > 0 else 0.0


def at(body, x, y, s=1.0, rot=0, flip=False):
    return group(body, x, y, rot, -s if flip else s, s)


def crowd(fear=False, skip=()):
    """Sofradaki yiğitler: üç yapı, renk ve yön değiştirilerek çoğaltılır."""
    spots = [(0, 620, 1340, 0.62, C.GOLD, False), (1, 1180, 1420, 0.66, C.COBALT, True), (2, 110, 1668, 0.72, C.PALE, False), (3, 1390, 1330, 0.56, C.RED, True),
             (4, 1090, 1270, 0.5, C.GOLD, True), (5, 560, 1262, 0.46, C.COBALT, False), (6, 1320, 1640, 0.74, C.COBALT, True)]
    kinds = [1, 0, 2, 2, 1, 0, 1]
    out = {}
    for i, x, y, s, robe, flip in spots:
        if i in skip: continue
        out[i] = (y, at(C.extra(kinds[i], robe, fear), x, y + math.sin(NOW * 2.1 + i * 1.7) * 3.5, s, math.sin(NOW * 1.3 + i) * 1.2, flip))   # nefes
    return out


NOW = 0.0   # filmin o anki saniyesi: ateş, kıvılcım ve nefes buna göre kıpırdar


def camera(cx, cy, z):
    cy += 150 / z                                # özne karenin üst yarısında dursun: altyazı yüzü ve elleri kapatmasın
    hw, hh = FW / 2 / z, FH / 2 / z            # kamera sahnenin kenarını göstermesin
    return (min(max(cx, hw), S.W - hw), min(max(cy, hh), S.H - hh), z)


def layer(body, cam, p=1.0, blur=False):
    """Bir derinlik katmanını kamera matrisiyle çizer; p paralaks oranı."""
    cx, cy, z = cam
    lx, ly, lz = 750 + (cx - 750) * p, 960 + (cy - 960) * p, 1 + (z - 1) * (0.35 + 0.65 * p if p < 1 else p)
    f = ' filter="url(#soft)"' if blur else ''
    return f'<g transform="translate({FW / 2:.1f},{FH / 2:.1f}) scale({lz:.4f}) translate({-lx:.2f},{-ly:.2f})"{f}>{body}</g>'


def world(cam, actors, t=0.0, blur=False, sofra=True):
    """Gök, arka, orta (mekân + oyuncular, derinliğe göre sıralı), ön."""
    cam = camera(*cam)
    s = layer(S.sky(), cam, 0.12, blur) + layer(S.back(), cam, 0.45, blur)
    mid = S.yurt() + S.ground()
    items = sorted(actors + [(1640, S.fire(300, 1640, NOW * 2.3) + S.embers(300, 1470, NOW * 1.5))], key=lambda a: a[0])
    s += layer(mid, cam, 1.0, blur) + layer(''.join(b for _, b in items), cam, 1.0, False)
    if sofra: s += layer(S.sofra(), cam, 1.18, blur)
    return s


def dumrul(expr, x=None, y=None, s=None, rot=0, armL=8, armR=-8, hr=0, poseR='open', sword=False):
    x = DUM[0] if x is None else x; y = DUM[1] if y is None else y; s = DUM[2] if s is None else s
    return (y + 330 * s, at(C.dumrul(expr, armL, armR, hr, poseR, sword), x, y, s, rot))


def azrail(expr, x=None, y=None, s=None, spread=1.0, armL=10, armR=-10, hr=0, op=1.0):
    x = AZ[0] if x is None else x; y = AZ[1] if y is None else y; s = AZ[2] if s is None else s
    return (y + 380 * s, group(C.azrail(expr, armL, armR, spread, hr), x, y, 0, s, s, op=op))


def blink(u, expr, period=0.9, base=0.35):
    return 'blink' if abs((u + base) % period - period / 2) < 0.03 else expr


# ----------------------------------------------------------------------------- çekimler
# Her çekim: (ad, altyazı parçaları, süre çarpanı) ve kareyi kuran fonksiyon.

def s01(u):   # GENİŞ — şölen: Dumrul ortada, kadeh kaldırır, kahkaha
    b = math.sin(u * 14) * 4
    a = [dumrul('smug' if u > 0.25 else blink(u, 'neutral'), y=DUM[1] + b * 0.4, armR=-118 - 10 * spring(max(0, u - 0.25) * 2), hr=-5 + b * 0.6, poseR='grip')] + list(crowd().values())
    gx, gy = DUM[0] + 190 * 0.6 + math.sin(math.radians(118)) * 300 * 0.6, DUM[1] + 48 * 0.6 - math.cos(math.radians(-118)) * -300 * 0.6
    a.append((2000, at(C.goblet(), DUM[0] + 262, DUM[1] - 86 + b * 0.4, 0.62, 12)))
    return world((lerp(760, 800, u), 1000, lerp(1.0, 1.1, ease(u))), a, u)


def s02(u):   # YAKIN — Azrail karanlıktan çıkar; kanatlar açılır; kamera vurur
    k = spring(u)
    a = [azrail(blink(u, 'stern', 1.3), spread=lerp(0.35, 1.05, k), op=min(1, u * 5 + 0.25), y=AZ[1] + (1 - k) * 30)] + [crowd()[5]]
    return world((AZ[0] + 10, lerp(1010, 960, ease(u)), lerp(1.7, 2.1, k)), a, u, sofra=False)


def s03(u):   # TEPKİ — çavuş ile kapıcı yiyip içer, görmez; Azrail arkalarından geçer; kamera yana kayar
    c = crowd()
    a = [azrail('neutral', x=lerp(330, 560, u), y=1150, s=0.56, spread=0.8), c[0], c[2], c[5]]
    a.append((1400, at(C.goblet(), 690, 1392 - abs(math.sin(u * 9)) * 26, 0.5, -10)))
    return world((lerp(400, 520, u), 1400, 1.55), a, u)


def s04(u):   # YAKIN — Dumrul: şok; baş geri savrulur
    k = spring(u)
    a = [dumrul('shock' if u > 0.08 else 'smug', hr=-9 * k, y=DUM[1] - 8 * k, armL=30 * k, armR=-34 * k), crowd(True)[4], crowd(True)[1]]
    return world((DUM[0], lerp(1090, 1075, u), lerp(2.0, 2.45, k)), a, u, blur=True, sofra=False)


def s05(u):   # EŞYA — el açılır, kadeh düşer, şarap saçılır
    bg = world((DUM[0] + 60, 1300, 1.9), [], u, blur=True, sofra=False)
    k = spring(u)
    fall = ease(min(1, u * 1.5))
    s = bg + at(C.hand(True, 'open', True, 1), 470, lerp(560, 520, k), 4.2, -24 + 6 * k)
    gy = lerp(900, 1560, fall * fall)
    s += at(C.goblet(), lerp(560, 690, fall), gy, 3.0, lerp(10, 130, fall))
    reseed('spill')
    for i in range(7):
        s += fill(ellipse(lerp(600, 760, fall) + i * 34 - 90, gy - 150 + abs(i - 3) * 26 + R(-20, 20), 13, 20, 7, 0.2), C.RED, 0.6)
    for x in (420, 520, 760): s += ink([(x, gy - 420), (x + 10, gy - 300)], 5, col=C.PALE, op=0.8, wob=0, smooth=False)   # hız çizgileri
    return s


def s06(u):   # İKİLİ — Dumrul ayağa kalkar, parmağını uzatır; Azrail kıpırtısız durur; kamera döner
    k = spring(u)
    a = [dumrul('anger' if u > 0.1 else 'shock', x=DUM[0] - 60 * k, armR=-62 - 44 * k, hr=6 * k, rot=-4 * k), azrail(blink(u, 'stern', 1.1), x=AZ[0] + 40, spread=0.9)] + [v for i, v in crowd(True).items() if i in (0, 1, 3, 4)]
    return world((lerp(600, 680, u), 1140, lerp(1.2, 1.32, ease(u))), a, u)


def s07(u):   # YAKIN — Azrail'in ağarmış sakalı; kamera sakaldan aşağı süzülür
    a = [azrail(blink(u, 'neutral', 1.2), x=AZ[0] + 40, spread=0.9, hr=math.sin(u * 6) * 2)]
    return world((AZ[0] + 44, lerp(950, 1040, ease(u)), 3.1), a, u, blur=True, sofra=False)


def s08(u):   # ÇOK YAKIN — feri sönmüş gözler; yavaş itiş
    a = [azrail('blink' if 0.74 < u < 0.84 else 'dull', x=AZ[0] + 40, spread=0.9)]
    return world((AZ[0] + 42, 1050, lerp(3.9, 4.5, ease(u))), a, u, blur=True, sofra=False)


def s09(u):   # TEPKİ — Dumrul çenesini kaldırır, "kimsin?"; arkada bir yiğit korkuyla bakar
    k = spring(u)
    a = [dumrul('smug' if u > 0.12 else 'anger', x=DUM[0] - 60, hr=-10 * k, armR=-40, armL=20), crowd(True)[1], crowd(True)[3], crowd(True)[4]]
    return world((DUM[0] + 30, 1040, lerp(1.85, 2.0, ease(u))), a, u, blur=True, sofra=False)


def s10(u):   # YAKIN — Azrail kendini bildirir: kanatlar gerilir, gözler iri disk; yiğitler geri çekilir
    k = spring(u)
    a = [azrail('wrath' if u > 0.1 else 'speak', x=AZ[0] + 40, spread=lerp(0.9, 1.42, k), y=AZ[1] - 26 * k, armL=44 * k, armR=-44 * k, s=AZ[2] * (1 + 0.06 * k))] + [crowd(True)[5], crowd(True)[0]]
    return world((AZ[0] + 40, lerp(1130, 1100, k), lerp(1.45, 1.75, k)), a, u, sofra=False)


def s11(u):   # GENİŞ — Dumrul kara kılıcını sıyırır, üstüne atılır; kamera peşinden kayar
    k = spring(u * 1.2)
    x = lerp(DUM[0] - 60, 640, ease(u))
    a = [dumrul('anger', x=x, y=DUM[1] - abs(math.sin(u * 6.283)) * 26, rot=lerp(0, -14, k), armR=lerp(-20, -152, k), armL=lerp(10, 46, k), hr=8, poseR='grip', sword=u > 0.12),
         azrail('wrath', x=AZ[0] + 40, spread=1.35, y=AZ[1] - 20)] + [v for i, v in crowd(True).items() if i in (1, 3, 4, 6)]
    return world((lerp(700, 560, ease(u)), 1150, 1.28), a, u)


def s12(u):   # EŞYA — kılıç boşluğu biçer; kanat tüyleri savrulur; içinden bir güvercin çıkar
    bg = world((AZ[0] + 60, 1040, 1.7), [], u, blur=True, sofra=False)
    k = spring(u)
    s = bg
    arc = [(980, 1500), (700, 1180), (420, 1000), (120, 940)]
    s += ink(arc, 70 * (1 - u * 0.6), col=C.PALE, op=0.55 * (1 - u * 0.5), taper=(0.1, 0.6), wob=0)                       # kılıcın izi
    sw = ease(min(1, u * 1.6))
    s += at(C.sword(), lerp(1150, 420, sw), lerp(1800, 1330, sw), 3.0, lerp(-10, -62, sw))
    reseed('puff')
    for i in range(7):                                                                                                   # kaybolduğu yerde soluk bir bulut
        a0 = i * 0.9; d = 60 + 120 * k
        s += fill(ellipse(540 + math.cos(a0) * d, 800 + math.sin(a0) * d * 0.7, 90 * (1.2 - u * 0.5), 70 * (1.2 - u * 0.5), 9, 0.12), C.PALE, 1.0, op=max(0.0, 0.8 - u * 0.75))
    reseed('feathers')
    fs = [(R(0, 6.283), R(120, 520), R(1.2, 2.0), R(0, 360), R(120, 320)) for _ in range(18)]      # tüy çizimi tohumu sıfırlar; önce yerleri seç
    for a0, d0, sc, r0, rv in fs:
        s += at(C.feather(), 540 + math.cos(a0) * d0 * k, 820 + math.sin(a0) * d0 * k + 220 * u * u, sc, r0 + u * rv)
    s += at(C.dove(int(NOW * 9) % 2), lerp(520, 640, k), lerp(840, 560, ease(u)), 2.6 * min(1, 0.4 + k), -12)
    return s


def s13(u):   # GENİŞ — güvercin aya doğru uçar; aşağıda Dumrul kılıcı havada kalakalır; kamera göğe kalkar
    a = [dumrul('shock', x=640, armR=-150, armL=30, hr=-14, poseR='grip', sword=True)] + [v for i, v in crowd(True).items() if i in (0, 1, 5)]
    dx, dy = lerp(560, 1000, ease(u)), lerp(820, 380, ease(u))
    a.append((3000, at(C.dove(int(NOW * 9) % 2), dx, dy + math.sin(NOW * 9) * 10, lerp(1.0, 0.5, u), -24)))
    return world((lerp(700, 860, ease(u)), lerp(1000, 700, ease(u)), 1.32), a, u, sofra=False)


SHOTS = [
    ('Geniş: şölen', ['Deli Dumrul', 'kırk yiğidiyle', 'yiyip içip otururken'], s01),
    ('Yakın: Azrail belirir', ['Azrail çıkageldi.'], s02),
    ('Tepki: görmeyenler', ['Onu ne çavuş', 'gördü ne kapıcı.'], s03),
    ('Yakın: Dumrul şokta', ['Dumrul’un görür gözü', 'görmez,'], s04),
    ('Eşya: düşen kadeh', ['tutar eli', 'tutmaz oldu.'], s05),
    ('İkili: meydan okuma', ['“Bre, ne heybetli', 'kocasın!'], s06),
    ('Yakın: ağarmış sakal', ['Sakalcığı ağarmış,'], s07),
    ('Çok yakın: sönük gözler', ['gözceğizi çöngelmiş koca,'], s08),
    ('Tepki: “kimsin?”', ['kimsin?” dedi.'], s09),
    ('Yakın: Azrail kendini bildirir', ['Azrail kendini bildirince'], s10),
    ('Geniş: kılıç çekilir', ['Dumrul kara kılıcını', 'sıyırıp saldırdı.'], s11),
    ('Eşya: kılıç, tüyler, güvercin', ['Azrail bir güvercin', 'oldu,'], s12),
    ('Geniş: gökte güvercin', ['uçtu gitti.'], s13),
]
CHUNK = 1.1   # altyazı parçası başına saniye (seslendirme yok)


def caption(img, text, dim=False):
    """Altyazı ciladan sonra basılır: kalın sarı, koyu kenar, karenin alt ortası."""
    d = ImageDraw.Draw(img)
    w, h = img.size
    f = ImageFont.truetype(FONT, int(w * 0.074))
    tw = d.textlength(text, font=f)
    x, y = (w - tw) / 2, h * 0.705
    col = (255, 226, 26) if not dim else (150, 132, 30)
    d.text((x, y), text, font=f, fill=col, stroke_width=max(3, int(w * 0.009)), stroke_fill=(23, 11, 8))
    return img


HOLD = {12: 1.0}   # son çekim, son altyazıdan sonra bir saniye daha durur
FPS = 30


def frames_of(i):
    return round((len(SHOTS[i][1]) * CHUNK + HOLD.get(i, 0)) * FPS)


def whip(img, amount):
    """Bulanık savrulma geçişi: kare yatayda kayar ve sürünür. amount: -1…1."""
    a = np.asarray(img).astype(np.float32)
    k = int(abs(amount) * 260) | 1
    if k > 1:
        c = np.cumsum(np.pad(a, ((0, 0), (k // 2 + 1, k // 2), (0, 0)), mode='edge'), axis=1)
        a = (c[:, k:] - c[:, :-k]) / k
    sh = int(amount * 520); w = a.shape[1]                                   # kaydır; açılan kenar son sütunla dolar (sarmaz)
    a = np.pad(a, ((0, 0), (abs(sh), abs(sh)), (0, 0)), mode='edge')[:, abs(sh) - sh: abs(sh) - sh + w]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def frame(i, u, scale=1.0, frame_no=0, f=None):
    """Bir kare: SVG'yi kur, resme çevir, cilala, (geçişteyse) savur, en son altyazıyı bas."""
    global NOW
    name, chunks, fn = SHOTS[i]
    n = frames_of(i)
    if f is not None: u = f / max(1, n - 1)
    start = sum(frames_of(j) for j in range(i))
    NOW = (start + (f if f is not None else u * n)) / FPS
    w, h = int(FW * scale), int(FH * scale)
    body = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {FW} {FH}"><defs>{DEFS}</defs><rect width="{FW}" height="{FH}" fill="{S.NIGHT}"/>{fn(u)}</svg>'
    img = finish(raster(body, w, h), frame_no or int(NOW * FPS), grain=4.0 * max(scale, 0.6))
    if f is not None:
        if f < 3 and i > 0: img = whip(img, (3 - f) / 3 * 0.9)                    # çekime girerken
        if f >= n - 3 and i < len(SHOTS) - 1: img = whip(img, -(f - (n - 4)) / 3 * 0.9)   # çıkarken
        per = CHUNK * FPS
        ci = min(len(chunks) - 1, int(f / per))
        return caption(img, chunks[ci], dim=(f - ci * per) < 3 and f < len(chunks) * per + 3)
    return caption(img, chunks[min(len(chunks) - 1, int(u * len(chunks)))])


def _job(args):
    i, f, d = args
    frame(i, 0, 1.0, f=f).save(f'{d}/s{i:02d}/{f:04d}.jpg', quality=96, subsampling=0)
    return i


def render(out, work, only=None):
    """Bütün kareleri paralel çizer; her çekimi ayrı mp4 yapar (libx264, CRF 17), sonra kopyalayarak birleştirir."""
    import multiprocessing as mp, subprocess
    shots = range(len(SHOTS)) if only is None else only
    jobs = []
    for i in shots:
        os.makedirs(f'{work}/s{i:02d}', exist_ok=True)
        jobs += [(i, f, work) for f in range(frames_of(i))]
    with mp.Pool(min(11, os.cpu_count() or 4)) as pool:
        for k, _ in enumerate(pool.imap_unordered(_job, jobs, chunksize=4)):
            if k % 100 == 0: print('kare', k, '/', len(jobs), flush=True)
    files = []
    for i in shots:
        p = f'{work}/s{i:02d}.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{work}/s{i:02d}/%04d.jpg', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', str(FPS), p], check=True)
        files.append(p)
    with open(f'{work}/list.txt', 'w') as fh: fh.write(''.join(f"file '{os.path.abspath(p)}'\n" for p in files))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{work}/list.txt', '-c', 'copy', out], check=True)
    print('bitti', out, sum(frames_of(i) for i in shots) / FPS, 'sn')


def contact(out):
    tw, th = 432, 768
    cols = 5; rows = math.ceil(len(SHOTS) / cols)
    sheet = Image.new('RGB', (cols * (tw + 24) + 24, rows * (th + 96) + 24), (234, 223, 200))
    d = ImageDraw.Draw(sheet); f = ImageFont.truetype(FONT, 22); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    for i, (name, chunks, fn) in enumerate(SHOTS):
        im = frame(i, 0.62, 0.4).resize((tw, th))
        x, y = 24 + (i % cols) * (tw + 24), 24 + (i // cols) * (th + 96)
        sheet.paste(im, (x, y))
        d.text((x, y + th + 8), f'{i + 1}. {name}', font=f, fill=(23, 11, 8))
        d.text((x, y + th + 40), f'{len(chunks) * CHUNK:.1f} sn — ' + ' / '.join(chunks), font=f2, fill=(77, 20, 10))
    sheet.save(out, quality=90)
    print('toplam', sum(len(c) for _, c, _ in SHOTS) * CHUNK, 'sn')


if __name__ == '__main__':
    if sys.argv[1] == 'contact': contact(sys.argv[2])
    elif sys.argv[1] == 'render': render(sys.argv[2], sys.argv[3], [int(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 else None)
    elif sys.argv[1] == 'f': frame(int(sys.argv[2]), 0, 1.0, f=int(sys.argv[3])).save(sys.argv[4])
    else: frame(int(sys.argv[1]), float(sys.argv[2]), 1.0).save(sys.argv[3])
