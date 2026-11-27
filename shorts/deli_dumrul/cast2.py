"""Deli Dumrul — hikâyenin geri kalan kadrosu: baba, ana, eş, iki oğlancık, Dede Korkut, yas tutanlar, yolcu, at, doğan.
Ortak yüz kurucu (gface) her kişiye ayrı kafatası, burun ve kaş verir; ifadeler ortaktır."""
import math
from ..kit import *
from . import cast as C0
from .cast import COBALT, SKIN, SKIN_D, SKIN_L, PALE, GOLD, RED, COAT, LEATHER, hand, stud, strap

EX = {
    'neutral': dict(b=0.0, by=0, open=0.85, m='line'),
    'blink':   dict(b=0.0, by=1, open=0.0, m='line'),
    'grief':   dict(b=-0.6, by=-3, open=0.45, m='frown', tear=True),
    'fear':    dict(b=-0.45, by=-12, open=1.0, m='o', shock=True),
    'anger':   dict(b=0.6, by=8, open=0.7, m='snarl'),
    'joy':     dict(b=-0.12, by=-5, open=0.5, m='smile'),
    'refuse':  dict(b=-0.35, by=-7, open=0.0, m='purse'),
    'scold':   dict(b=0.5, by=6, open=0.85, m='frown'),            # çatık kaş, sıkılmış ağız: öfke ama diş göstermeden
    'shock':   dict(b=-0.3, by=-18, open=1.0, m='gape', shock=True),
}
DROP = {'o': 0.07, 'gape': 0.2, 'snarl': 0.05, 'grin': 0.04}


def gface(name, w, h, jaw=1.0, nose=(60, 22, 0.0), eye=(0.27, -0.14, 13, 9), brow=(INK, 10), mth=(0.44, 0.34), expr='neutral', bags=2, wrinkles=2, lash=False):
    """Kişiye özgü kafatası + ortak ifade takımı. (svg, çene düşüşü) döndürür; saç, sakal ve başlık sonradan eklenir."""
    e = EX[expr]; drop = DROP.get(e['m'], 0) * h
    reseed(name + '-skull')
    sk = []
    for i in range(16):
        a = 6.283 * i / 16 - 1.571
        sy = math.sin(a); k = 1 + (jaw - 1) * max(0.0, sy) + R(-0.025, 0.025)
        y = h * sy
        sk.append((w * math.cos(a) * k, y + (drop * min(1.0, max(0.0, (y / h - 0.2) / 0.6)))))
    cid = name + '-c'
    s = clipdef(cid, sk)
    for sx in (-1, 1):
        ear = [(sx * w * 0.94, -h * 0.2), (sx * (w + 22), -h * 0.26), (sx * (w + 28), -h * 0.02), (sx * (w + 16), h * 0.14), (sx * w * 0.94, h * 0.1)]
        s += blob(ear, SKIN_D if sx < 0 else SKIN, 3.0)
    s += fill(sk, SKIN, 1.2)
    s += fill([(-w * 1.4, -h * 1.2), (-w * 0.45, -h * 1.1), (-w * 0.62, -h * 0.2), (-w * 0.7, h * 0.4), (-w * 0.2, h * 1.1 + drop), (-w * 1.4, h * 1.3 + drop)], SKIN_D, 1.0, clip=cid)
    s += fill(ellipse(w * 0.5, h * 0.1, w * 0.24, h * 0.13, 8, 0.12), SKIN_L, 0.8, clip=cid) + fill(ellipse(w * 0.2, -h * 0.62, w * 0.3, h * 0.08, 8, 0.1), SKIN_L, 0.8, clip=cid)
    s += ink(sk, 3.4, closed=True, press=0.5)
    reseed(name + '-marks')
    for k in range(wrinkles): s += ink([(-w * 0.3, -h * (0.6 - k * 0.1)), (0, -h * (0.64 - k * 0.1)), (w * 0.32, -h * (0.6 - k * 0.1))], 1.9, wob=0.4)
    ex, ey, rx, ry = eye[0] * w, eye[1] * h, eye[2], eye[3]
    for cx in (-ex, ex):
        for k in range(bags): s += ink([(cx - rx + k, ey + ry + 5 + k * 6), (cx, ey + ry + 10 + k * 6), (cx + rx - k, ey + ry + 4 + k * 6)], 1.9, wob=0.2)
        s += eye_(cx, ey, rx, ry, e, lash)
        if e.get('tear'): s += blob([(cx + 2, ey + ry + 6), (cx + 9, ey + ry + 26), (cx + 2, ey + ry + 36), (cx - 5, ey + ry + 26)], PALE, 2.2) + fill(ellipse(cx + 2, ey + ry + 27, 3, 5, 6), COBALT, 0.3, op=0.35)
    reseed(name + '-brows')
    for sx, cx in ((-1, -ex), (1, ex)):
        b = e['b']; y0 = ey - ry - 14 + e['by']
        p = [(cx - sx * (rx + 5), y0 + b * 20), (cx, y0 - 6 + abs(b) * 4), (cx + sx * (rx + 12), y0 - b * 9 + 2)]
        if brow[0] != INK: s += ink(p, brow[1] + 4, col=INK, taper=(0.06, 0.4), press=0.2, wob=0.4)
        s += ink(p, brow[1], col=brow[0], taper=(0.06, 0.45), press=0.2, wob=0.4, op=1)
    reseed(name + '-nose')
    L, nw, hook = nose
    top = ey - 4
    npts = [(-nw * 0.3, top), (nw * 0.25, top - 2), (nw * 0.7, top + L * 0.55), (nw, top + L * 0.85), (nw * 0.5 - hook * nw, top + L + hook * 16), (-nw * 0.3 - hook * nw * 0.6, top + L * 0.98), (-nw * 0.8, top + L * 0.8), (-nw * 0.4, top + L * 0.4)]
    s += fill(npts, SKIN_L, 0.9) + ink([npts[1], npts[2], npts[3], npts[4], npts[5]], 3.2, wob=0.3, taper=(0.3, 0.25)) + ink([npts[7], npts[6], (npts[5][0] + 4, npts[5][1] - 3)], 2.2, wob=0.2)
    s += fill(ellipse(-nw * 0.35, top + L * 0.88, 4.2, 2.8, 6), INK, 0.3)
    s += ink([(-nw - 4, top + L * 0.8), (-w * 0.42, h * mth[1] - 4), (-w * 0.46, h * mth[1] + 22 + drop)], 2.2, wob=0.4, taper=(0.2, 0.5)) + ink([(nw + 8, top + L * 0.84), (w * 0.44, h * mth[1] - 4), (w * 0.48, h * mth[1] + 22 + drop)], 2.2, wob=0.4, taper=(0.2, 0.5))
    reseed(name + '-mouth')
    my = h * mth[1] + drop * 0.45; mw = w * mth[0]; m = e['m']
    if m == 'line': s += ink([(-mw, my + 1), (0, my + 4), (mw, my)], 2.9, wob=0.3) + ink([(-mw * 0.5, my + 15), (0, my + 18), (mw * 0.5, my + 14)], 1.8, wob=0.2)
    elif m == 'frown': s += ink([(-mw, my + 12), (0, my), (mw, my + 13)], 3.0, wob=0.3) + ink([(-mw * 0.4, my + 20), (0, my + 16), (mw * 0.4, my + 20)], 1.8, wob=0.2)
    elif m == 'purse': s += fill(ellipse(0, my + 4, mw * 0.36, 8, 8), SKIN_D, 0.5) + ink([(-mw * 0.4, my + 4), (0, my + 2), (mw * 0.4, my + 5)], 2.8, wob=0.2) + ''.join(ink([(k * mw * 0.2, my - 6), (k * mw * 0.26, my + 14)], 1.7, wob=0, smooth=False) for k in (-1, 0, 1))
    elif m == 'o': s += mouth_(0, my + 8, mw * 0.5, 8, 22, 0, 4, 4)
    elif m == 'gape': s += mouth_(0, my + 10, mw * 0.8, 12, h * 0.3, 0, 6, 5)
    elif m == 'snarl': s += mouth_(0, my + 6, mw * 1.15, 6, 20, -8, 7, 6)
    elif m == 'smile': s += ink([(-mw * 1.1, my - 6), (-mw * 0.5, my + 6), (0, my + 9), (mw * 0.5, my + 6), (mw * 1.1, my - 7)], 3.0, wob=0.3) + ink([(-mw * 1.25, my - 14), (-mw * 1.1, my - 2)], 2.0, wob=0, smooth=False) + ink([(mw * 1.25, my - 15), (mw * 1.1, my - 3)], 2.0, wob=0, smooth=False)
    elif m == 'grin': s += mouth(0, my + 2, mw * 1.25, 2, 22, 14, SKIN_D, FINE, RED, PALE, gum=RED, top=7, bot=6)
    return s, drop


def eye_(cx, cy, rx, ry, e, lash=False):
    s = eye(cx, cy, rx, ry, PALE, SKIN_D, e['open'], 3.6, (1, 1.5), lid=0.3, shock=e.get('shock', False), lash=5.5 if lash else 4.6)
    if lash and e['open'] > 0.1 and not e.get('shock'):
        for k in (0.5, 0.85, 1.15): s += ink([(cx + rx * k, cy - ry * 0.5), (cx + rx * k + 6, cy - ry - 5)], 1.9, col=INK, op=1, taper=(0, 0.7), wob=0, smooth=False)
    return s


def mouth_(cx, cy, hw, up, down, lift, top, bot):
    return mouth(cx, cy, hw, up, down, lift, SKIN_D, FINE, RED, PALE, top=top, bot=bot)


def barbed(points, col, w=2.6, shade=None):
    s = fill(points, col, 0.8, smooth=False)
    if shade: s += fill(shade, COBALT, 0.6, smooth=False, op=0.3)
    return s + ink(points, w, closed=True, smooth=False, wob=0.2)


def robe(w0, w1, h, col, name, shade=INK, pattern=None, hem=None, belt=None):
    """Düz kaftan gövdesi: boyun kökü (0,0), omuz genişliği w0, etek genişliği w1, boy h."""
    reseed(name + '-robe')
    p = [(-w0 * 0.4, -10), (w0 * 0.4, -10), (w0, 26), (w0 * 1.06, h * 0.45), (w1, h), (-w1, h), (-w0 * 1.06, h * 0.45), (-w0, 26)]
    cid = name + '-r'
    s = clipdef(cid, p) + fill(p, col, 1.4)
    if pattern: s += f'<g clip-path="url(#{cid})">' + ''.join(medallion(-w1 + 30 + j * 62 + (31 if i % 2 else 0), 50 + i * 62, 14, pattern, 1.9) for i in range(int(h / 62) + 1) for j in range(int(w1 * 2 / 62) + 1)) + '</g>'
    s += fill([(-w1 * 1.3, -20), (-w0 * 0.3, -20), (-w0 * 0.45, h * 0.4), (-w1 * 0.3, h + 10), (-w1 * 1.3, h + 10)], shade, 1.0, clip=cid, op=0.36)
    if hem: s += fill([(-w1 - 4, h - 30), (w1 + 4, h - 30), (w1 + 4, h + 4), (-w1 - 4, h + 4)], hem, 0.8, smooth=False, clip=cid) + ink([(-w1, h - 30), (0, h - 27), (w1, h - 30)], 2.2, wob=0.4)
    s += ''.join(ink([(x, h * 0.5 + abs(x) * 0.3), (x * 1.2, h * 0.78), (x * 1.35, h - 34)], 2.0, wob=0.5, taper=(0.3, 0.3)) for x in (-w0 * 0.5, w0 * 0.1, w0 * 0.62))
    s += ink(p, 3.8, closed=True, press=0.45)
    if belt: s += blob([(-w0 * 1.06, h * 0.43), (0, h * 0.46), (w0 * 1.06, h * 0.43), (w0 * 1.08, h * 0.5), (0, h * 0.53), (-w0 * 1.08, h * 0.5)], belt, 2.8)
    return s


def sleeve(L, w, col, name, lit=True, hs=0.8, pose='open', side=1, cuff=None):
    """Kol: omuz (0,0), aşağı sarkar; ucunda el."""
    reseed(name + f'-arm{side}')
    a = [(-w * 0.8, -8), (w * 0.6, -14), (w, L * 0.4), (w * 0.9, L), (-w * 0.8, L), (-w, L * 0.4)]
    s = fill(a, col, 1.2) + (fill(a, INK, 1.2, op=0.38) if not lit else '') + ink(a, 3.4, closed=True, press=0.4) + ink([(-w * 0.4, L * 0.5), (0, L * 0.56), (w * 0.4, L * 0.48)], 1.9, wob=0.3)
    if cuff: s += blob([(-w * 0.86, L - 22), (w * 0.94, L - 22), (w * 0.98, L + 4), (-w * 0.9, L + 4)], cuff, 2.6)
    return s + group(hand(lit, pose, False, side), 0, L + 2, 0, hs)


# ----------------------------------------------------------------------------- Duha Koca (baba)
def father_head(expr='neutral'):
    """Küçük, kambur ihtiyar: dev kaşlar, uzun kanca burun, bele inen ak sakal, yüksek kalpak."""
    s, d = gface('father', 104, 122, 0.92, (78, 28, 0.55), (0.3, -0.16, 12, 8), (PALE, 13), (0.4, 0.5), expr, bags=3, wrinkles=3)
    reseed('father-beard')
    beard = [(-100, 30), (-70, 78 + d), (0, 96 + d), (70, 78 + d), (100, 30), (112, 150 + d), (86, 140 + d), (92, 250 + d), (58, 226 + d), (44, 330 + d), (16, 286 + d), (0, 372 + d), (-20, 290 + d), (-46, 326 + d), (-58, 226 + d), (-92, 252 + d), (-84, 140 + d), (-112, 150 + d)]
    s += group(barbed(beard, PALE, 2.6, [(-100, 30), (-70, 78 + d), (-30, 92 + d), (-30, 330 + d), (-112, 252 + d), (-112, 150 + d)]) + fur(beard, 8, 13, 12, 0.1, 1.9), 0, 0, C0.SWAY * 0.6, 1, None, 0, 60)
    for sx in (-1, 1): s += barbed([(0, 52), (sx * 30, 46), (sx * 62, 70), (sx * 70, 120 + d), (sx * 48, 96 + d * 0.5), (sx * 22, 76), (0, 70)], PALE, 2.2)
    reseed('father-hat')
    dome = [(-84, -96), (-66, -200), (-10, -262), (40, -230), (80, -150), (90, -96)]
    s += blob(dome, COBALT, 3.4) + fill([(-84, -96), (-66, -200), (-30, -240), (-20, -96)], INK, 1.0, op=0.38) + ''.join(ink([(-40 + k * 26, -230 + abs(k - 1) * 30), (-52 + k * 40, -110)], 1.9, wob=0.4) for k in range(4))
    band = [(-118, -92), (-100, -122), (0, -134), (100, -122), (120, -92), (104, -62), (0, -52), (-104, -62)]
    s += blob(band, PALE, 3.2) + fur(band, 3, 11, 9, 0.5, 2.0)
    return s


def father(expr='neutral', armL=10, armR=-24, hr=6):
    """Kambur gövde, asaya dayanır. Boyun kökü (0,0)."""
    s = group(sleeve(170, 34, GOLD, 'father', False, 0.7, 'open', -1, RED), -92, 40, armL)
    s += robe(96, 132, 430, GOLD, 'father', hem=RED, belt=RED)
    reseed('father-staff')
    s += ink([(150, 470), (146, 200), (150, -60), (176, -100), (204, -84)], 11, col=LEATHER, taper=(0.02, 0.15), wob=1.0, press=0.15) + ink([(150, 470), (146, 200), (150, -60)], 2.2, wob=1.0, taper=(0, 0))
    s += group(sleeve(170, 34, GOLD, 'father', True, 0.7, 'grip', 1, RED), 92, 40, armR)
    s += group(father_head(expr), 14, -96, hr, 0.86, None, 0, 100)
    return s


# ----------------------------------------------------------------------------- ana
def mother_head(expr='neutral'):
    """Yusyuvarlak yüz, pembe yanak, yumru burun; başı ve boynu saran örtü, alnında altın pullar."""
    reseed('mother-scarf-back')
    back = [(-176, -40), (-150, -150), (-60, -196), (60, -196), (150, -150), (176, -40), (168, 110), (120, 196), (0, 226), (-120, 196), (-168, 110)]
    s = blob(back, PALE, 3.6) + fill([(-176, -40), (-150, -150), (-70, -192), (-90, 0), (-110, 190), (-168, 110)], COBALT, 1.0, op=0.3)
    f, d = gface('mother', 128, 118, 1.14, (50, 30, 0.0), (0.3, -0.12, 13, 9), (INK, 8), (0.36, 0.42), expr, bags=2, wrinkles=2)
    s += f
    for sx in (-1, 1): s += fill(ellipse(sx * 78, 30, 26, 18, 8, 0.1), RED, 0.8, op=0.3)                     # al yanak
    reseed('mother-scarf')
    wrap = [(-140, -40), (-120, -128), (0, -150), (120, -128), (140, -40), (96, -84), (0, -100), (-96, -84)]
    s += blob(wrap, PALE, 3.2) + blob([(-124, -70), (0, -104), (124, -70), (118, -46), (0, -78), (-118, -46)], RED, 2.8) + ''.join(blob(ellipse(x, -70 + abs(x) * 0.22, 9, 9, 7), GOLD, 2.0) for x in range(-90, 100, 30)) + sparkle(4, -76, 6)
    chin = [(-132, 40), (-96, 118 + d), (0, 150 + d), (96, 118 + d), (132, 40), (150, 150), (0, 214 + d), (-150, 150)]
    s += blob(chin, PALE, 3.2) + ''.join(ink([(x, 150 + d), (x * 0.9, 200 + d)], 1.9, wob=0.4) for x in (-70, -20, 40, 84))
    return s


def mother(expr='neutral', armL=16, armR=-16, hr=0):
    s = group(sleeve(190, 44, RED, 'mother', False, 0.82, 'open', -1, GOLD), -150, 50, armL)
    s += robe(158, 214, 470, RED, 'mother', pattern=GOLD, hem=GOLD)
    reseed('mother-apron')
    ap = [(-96, 150), (96, 150), (120, 440), (-120, 440)]
    s += blob(ap, PALE, 3.0) + ''.join(scroll(x, 400, 13, COBALT, 1.9) for x in range(-90, 100, 44)) + ink([(-150, 150), (0, 164), (150, 150)], 6, col=COBALT, wob=0.5, taper=(0.05, 0.05))
    s += group(sleeve(190, 44, RED, 'mother', True, 0.82, 'open', 1, GOLD), 150, 50, armR)
    s += group(mother_head(expr), 0, -104, hr, 0.86, None, 0, 110)
    return s


# ----------------------------------------------------------------------------- eş
def wife_head(expr='neutral'):
    """İnce uzun yüz, kirpikli iri göz; yüksek altın başlık, arkadan dökülen duvak, iki uzun kara örgü."""
    reseed('wife-veil')
    veil = [(-70, -230), (0, -250), (70, -230), (130, -60), (150, 160), (110, 330), (40, 300), (-40, 300), (-110, 330), (-150, 160), (-130, -60)]
    s = group(blob(veil, PALE, 3.0) + fill([(-70, -230), (-130, -60), (-150, 160), (-110, 330), (-70, 300), (-90, 0)], COBALT, 1.0, op=0.3) + ''.join(ink([(x, -40), (x * 1.15, 300)], 1.8, wob=0.6) for x in (-104, 100)), 0, 0, C0.SWAY * 0.5, 1, None, 0, -230)
    s += blob([(-26, 80), (26, 80), (30, 190), (-30, 190)], SKIN_D, 3.0)                                            # uzun boyun
    f, d = gface('wife', 88, 112, 0.84, (56, 16, 0.0), (0.34, -0.1, 15, 11), (INK, 6), (0.32, 0.5), expr, bags=0, wrinkles=0, lash=True)
    s += f + fill(ellipse(0, 62 + d * 0.45, 22, 7, 7), RED, 0.5, op=0.55 if EX[expr]['m'] in ('line', 'frown', 'purse') else 0)
    reseed('wife-hair')
    s += fill([(-92, -30), (-78, -96), (0, -118), (78, -96), (92, -30), (60, -70), (0, -84), (-60, -70)], INK, 0.8)
    for sx in (-1, 1):                                                                                                # örgüler
        br = ''
        for k in range(9):
            br += fill(ellipse(sx * (96 - k * 2), 10 + k * 40, 17 - k * 0.6, 22, 7, 0.1), INK, 0.6)
        br += ''.join(ink([(sx * (84 - k * 2), 20 + k * 40), (sx * (108 - k * 2), 34 + k * 40)], 1.8, col=PALE, op=0.5, wob=0, smooth=False) for k in range(9)) + blob(ellipse(sx * 78, 376, 12, 14, 7), GOLD, 2.2)
        s += group(br, 0, 0, C0.SWAY * 0.9, 1, None, sx * 96, 10)
    reseed('wife-hat')
    hat = [(-74, -92), (-52, -200), (-24, -292), (24, -292), (52, -200), (74, -92), (0, -80)]
    s += blob(hat, GOLD, 3.2) + fill([(-74, -92), (-52, -200), (-24, -292), (-8, -292), (-18, -88)], COBALT, 0.8, op=0.3)
    s += ''.join(medallion(0, y, 13, RED, 1.9) for y in (-250, -200, -150)) + blob([(-84, -100), (0, -120), (84, -100), (80, -76), (0, -92), (-80, -76)], RED, 2.6) + ''.join(stud(x, -96 + abs(x) * 0.12, 3.6) for x in range(-66, 70, 22)) + sparkle(6, -260, 8)
    return s


def wife(expr='neutral', armL=12, armR=-12, hr=0):
    s = group(sleeve(250, 28, COBALT, 'wife', False, 0.7, 'open', -1, GOLD), -84, 40, armL)
    s += robe(88, 140, 620, COBALT, 'wife', pattern=GOLD, hem=RED, belt=GOLD)
    s += group(sleeve(250, 28, COBALT, 'wife', True, 0.7, 'open', 1, GOLD), 84, 40, armR)
    s += group(wife_head(expr), 0, -196, hr, 0.82, None, 0, 190)
    return s


# ----------------------------------------------------------------------------- oğlancıklar
def boy(i=0, expr='neutral'):
    """İki oğlancık: koca başlı, börkü gözüne inen ufaklıklar; babalarının küçüğü. Ayak tabanı (0,0)."""
    name = f'boy{i}'
    s = robe(54, 74, 150, COAT if i == 0 else LEATHER, name, hem=LEATHER if i == 0 else COAT, belt=GOLD)
    s = group(s, 0, -170)
    for sx in (-1, 1): s += blob([(sx * 14, -24), (sx * 60, -24), (sx * 66, 0), (sx * 10, 0)], LEATHER, 2.8)
    s += group(sleeve(86, 22, COAT if i == 0 else LEATHER, name, False, 0.5, 'open', -1), -54, -150, 14) + group(sleeve(86, 22, COAT if i == 0 else LEATHER, name, True, 0.5, 'open', 1), 54, -150, -14)
    f, d = gface(name, 92, 84, 1.1, (30, 20, 0.0), (0.34, -0.02, 14, 11), (INK, 12), (0.3, 0.52), expr, bags=0, wrinkles=0)
    reseed(name + '-hat')
    band = [(-112, -40), (-96, -76), (0, -90), (96, -76), (114, -40), (96, -8), (0, 0), (-96, -8)]
    hat = blob([(-74, -66), (-40, -128), (10, -150), (56, -120), (78, -66)], COAT, 3.0) + blob(band, LEATHER if i == 0 else PALE, 3.0) + fur(band, 3, 11, 9, 0.5, 2.0)
    s += group(f + hat, 0, -250, (-6, 7)[i], 0.9)
    return s


# ----------------------------------------------------------------------------- Dede Korkut
def dede_head(expr='joy'):
    """Uzun ince yüz, kocaman sarık, iki çatallı ak sakal, gülen kısık gözler."""
    f, d = gface('dede', 96, 126, 0.86, (66, 20, 0.2), (0.3, -0.12, 13, 8), (PALE, 11), (0.36, 0.46), expr, bags=2, wrinkles=3)
    s = f
    reseed('dede-beard')
    beard = [(-92, 30), (-62, 84 + d), (0, 100 + d), (62, 84 + d), (92, 30), (96, 170 + d), (70, 300 + d), (40, 420 + d), (24, 300 + d), (0, 250 + d), (-24, 300 + d), (-40, 420 + d), (-70, 300 + d), (-96, 170 + d)]
    s += group(barbed(beard, PALE, 2.6, [(-92, 30), (-62, 84 + d), (-20, 98 + d), (-24, 300 + d), (-40, 420 + d), (-70, 300 + d), (-96, 170 + d)]) + fur(beard, 9, 13, 12, 0.1, 1.9), 0, 0, C0.SWAY * 0.6, 1, None, 0, 60)
    for sx in (-1, 1): s += barbed([(0, 56), (sx * 30, 48), (sx * 66, 66), (sx * 86, 110 + d), (sx * 52, 92 + d * 0.5), (sx * 22, 80), (0, 74)], PALE, 2.2)
    reseed('dede-turban')
    tb = [(-150, -80), (-140, -170), (-70, -236), (20, -256), (110, -220), (156, -140), (150, -70), (60, -52), (-60, -56)]
    s += blob(tb, PALE, 3.6) + fill([(-150, -80), (-140, -170), (-70, -236), (-40, -240), (-70, -60)], COBALT, 1.0, op=0.3)
    s += ''.join(ink([(-140 + k * 10, -90 - k * 26), (-20 + k * 16, -150 - k * 20), (140 - k * 6, -100 - k * 22)], 2.2, wob=0.6, taper=(0.2, 0.3)) for k in range(5)) + blob(ellipse(10, -256, 22, 18, 8, 0.1), RED, 2.8)
    return s


def kopuz():
    """Kopuz: armudi gövde, uzun sap, üç tel, burgular. Gövdenin ortası (0,0), sap sağ yukarı uzanır."""
    reseed('kopuz')
    s = ink([(40, -60), (330, -300)], 26, col=LEATHER, taper=(0.02, 0.03), wob=0.4, press=0.08, smooth=False) + ink([(48, -46), (336, -288)], 2.4, wob=0.3, smooth=False, taper=(0, 0))
    s += blob([(318, -316), (352, -330), (362, -300), (334, -284)], COAT, 2.6) + ''.join(ink([(326 + k * 12, -318 + k * 10), (346 + k * 12, -340 + k * 10)], 5, col=GOLD, op=1, taper=(0, 0.2), wob=0, smooth=False) for k in range(3))
    body = [(-84, 10), (-72, -64), (-10, -96), (62, -64), (88, 10), (62, 84), (0, 108), (-62, 84)]
    s += blob(body, LEATHER, 3.4) + fill([(-84, 10), (-72, -64), (-30, -88), (-36, 96), (-62, 84)], INK, 0.8, op=0.3) + blob(ellipse(4, 14, 24, 24, 8), COAT, 2.4) + ticks(body, 10, (6, 12), 1.2, 0.3, 1.8)
    s += ''.join(ink([(-30 + k * 14, 70 - k * 6), (322 + k * 8, -306 + k * 8)], 1.8, col=PALE, op=0.95, wob=0, smooth=False) for k in range(3)) + blob([(-36, 60), (10, 50), (14, 62), (-32, 72)], COAT, 2.0)
    return s


def dede(expr='joy', hr=0):
    s = robe(104, 150, 600, PALE, 'dede', shade=COBALT, hem=COBALT)
    reseed('dede-cloak')
    for sx in (-1, 1): s += blob([(sx * 40, -12), (sx * 112, 24), (sx * 150, 300), (sx * 168, 600), (sx * 110, 600), (sx * 96, 300), (sx * 60, 60)], COBALT, 3.2)
    s += group(dede_head(expr), 0, -116, hr, 0.86, None, 0, 120)
    s += group(kopuz(), -40, 330, 0, 1.0)                                                              # kopuz kucakta, sakalın önünde
    s += group(sleeve(236, 34, COBALT, 'dede', False, 0.76, 'grip', -1), -100, 44, -16)                # sol el tellerde
    s += group(sleeve(110, 34, COBALT, 'dede', True, 0.76, 'grip', 1), 104, 44, -62)                   # sağ el sapta
    return s


# ----------------------------------------------------------------------------- yas tutan kadın, ölü yiğit, yolcu
def mourner(kind=0, expr='grief'):
    """Yas tutan kadın: örtülü, iki eli yüzünde ya da havada. Tek çizim, belden yukarı. Boyun kökü (0,0)."""
    name = f'mourner{kind}'
    col = [COBALT, RED, GOLD][kind % 3]
    s = robe(96, 132, 250, col, name)
    reseed(name + '-scarf')
    s += blob([(-120, -60), (-96, -170), (0, -200), (96, -170), (120, -60), (128, 60), (0, 96), (-128, 60)], PALE, 3.2)
    f, d = gface(name, [78, 72, 82][kind % 3], [80, 88, 76][kind % 3], [1.0, 0.9, 1.15][kind % 3], ([40, 58, 34][kind % 3], [18, 22, 15][kind % 3], [0.0, 0.5, 0.0][kind % 3]), (0.32, -0.1, 12, 8),
                 ((INK, 7), (PALE, 9), (INK, 6))[kind % 3], (0.36, 0.46), expr, bags=[1, 3, 0][kind % 3], wrinkles=[1, 3, 0][kind % 3], lash=kind % 3 == 2)
    s += group(f, 0, -78)
    s += blob([(-96, -100), (-80, -160), (0, -180), (80, -160), (96, -100), (60, -136), (0, -146), (-60, -136)], PALE, 2.8)
    if kind % 3 == 1:    # yaşlı: sivri tepelikli örtü, alnında al bant
        s += blob([(-60, -168), (0, -250), (60, -168), (0, -150)], PALE, 2.8) + blob([(-84, -128), (0, -150), (84, -128), (80, -110), (0, -130), (-80, -110)], RED if col != RED else COBALT, 2.4)
    elif kind % 3 == 2:  # genç: örtünün altından iki örgü, altın pullar
        for sx in (-1, 1):
            s += ''.join(fill(ellipse(sx * (104 - k * 2), -40 + k * 34, 14, 19, 7, 0.1), INK, 0.5) for k in range(6)) + blob(ellipse(sx * 94, 170, 9, 11, 6), GOLD, 2.0)
        s += ''.join(blob(ellipse(x, -134 + abs(x) * 0.2, 7, 7, 6), GOLD, 1.8) for x in range(-60, 70, 24))
    for sx in (-1, 1): s += group(sleeve(120, 26, col, name, sx > 0, 0.62, 'open', sx), sx * 90, 30, sx * (-150 + kind * 20))
    return s


def dead_youth(sick=False):
    """Yiğit: hastayken altın yorganın altında, gözü açık ve terli; ölünce ak kefen altında. Baş solda, (0,0) gövdenin ortası."""
    reseed('dead')
    if sick:
        bl = [(-250, 0), (-200, -54), (-100, -64), (120, -54), (290, -40), (330, 0), (290, 26), (-240, 26)]
        s = blob([(-330, 6), (-300, -40), (-220, -44), (-200, 20), (-300, 30)], PALE, 3.0)                                # yastık
        s += blob(bl, GOLD, 3.4) + fill([(-250, 0), (-240, 26), (290, 26), (330, 0), (200, 6), (-200, 8)], COBALT, 1.0, op=0.3) + ''.join(medallion(x, -22, 15, RED, 1.9) for x in range(-150, 280, 86))
        f, d = gface('dead', 60, 62, 0.95, (34, 13, 0.0), (0.32, -0.1, 11, 8), (INK, 7), (0.3, 0.5), 'grief', bags=1, wrinkles=0)
        s += group(f + blob([(-70, -30), (-50, -80), (0, -96), (50, -80), (70, -30), (0, -44)], RED, 2.8), -300, -34, -80, 0.9)
        return s + ''.join(blob([(x, y), (x + 7, y + 16), (x, y + 24), (x - 7, y + 16)], PALE, 1.8) for x, y in ((-262, -96), (-236, -84)))   # ter
    sh = [(-300, 0), (-240, -50), (-100, -64), (120, -54), (290, -40), (330, 0), (290, 26), (-280, 26)]
    s = blob(sh, PALE, 3.4) + fill([(-300, 0), (-280, 26), (290, 26), (330, 0), (200, 6), (-200, 8)], COBALT, 1.0, op=0.3) + ''.join(ink([(x, -50), (x + 20, 14)], 2.0, wob=0.6) for x in (-160, -60, 40, 150, 240))
    f, d = gface('dead', 60, 62, 0.95, (34, 13, 0.0), (0.32, -0.1, 11, 8), (INK, 7), (0.3, 0.5), 'blink', bags=0, wrinkles=0)
    s += group(f + blob([(-70, -30), (-50, -80), (0, -96), (50, -80), (70, -30), (0, -44)], RED, 2.8), -330, -34, -80, 0.9)
    return s


def traveller(expr='fear'):
    """Köprüden geçen bezirgân: şişman, sırtında çuval; elinde akçe kesesi. Boyun kökü (0,0)."""
    reseed('trav-sack')
    s = blob([(-190, -40), (-150, -150), (-40, -170), (30, -80), (10, 80), (-120, 120), (-200, 60)], PALE, 3.4) + ticks([(-170, -40), (-130, -130), (-40, -150), (10, -70), (0, 60), (-110, 100)], 16, (5, 9), 0.4, 0.5, 1.9)
    s += group(sleeve(180, 36, GOLD, 'trav', False, 0.76, 'open', -1), -110, 44, 18) + robe(116, 150, 430, GOLD, 'trav', hem=COBALT, belt=COBALT)
    reseed('trav-purse')
    s += group(sleeve(180, 36, GOLD, 'trav', True, 0.76, 'grip', 1), 110, 44, -70)
    s += blob([(230, -52), (270, -62), (296, -20), (270, 14), (232, 6)], LEATHER, 2.8) + ''.join(coin(250 + k * 22, 36 + k * 30, 10) for k in range(3))
    f, d = gface('trav', 108, 96, 1.2, (42, 26, 0.0), (0.26, -0.12, 12, 8), (INK, 8), (0.34, 0.46), expr, bags=2, wrinkles=1)
    reseed('trav-hat')
    s += group(f + blob([(-100, -40), (-80, -110), (0, -130), (80, -110), (100, -40), (0, -60)], COBALT, 3.0) + barbed([(-60, 30), (0, 22), (60, 30), (84, 60), (40, 50), (0, 44), (-40, 50), (-84, 60)], INK, 0), 0, -92, 0, 0.86)
    return s


def coin(x, y, r=12):
    """Akçe: gümüş-altın para, tek parıltı."""
    return blob(ellipse(x, y, r, r, 8), GOLD, 2.2) + ink(ellipse(x, y, r * 0.55, r * 0.55, 6), 1.6, closed=True, wob=0.2) + sparkle(x + r * 0.3, y - r * 0.3, r * 0.5)


# ----------------------------------------------------------------------------- at ve doğan
def horse(spooked=False):
    """At: yandan, sola bakar; derin göğüs, çekik karın, ince bacak, iri diş. Sırtın ortası (0,0)."""
    reseed('horse')
    s = ''
    def leg(x, back, hind):
        p = ([(x - 30, 40), (x + 32, 40), (x + 20, 150), (x + 44, 226), (x + 30, 300), (x - 2, 300), (x + 8, 226), (x - 18, 150)] if hind
             else [(x - 26, 40), (x + 26, 40), (x + 16, 170), (x + 20, 300), (x - 14, 300), (x - 12, 170)])
        r = fill(p, PALE, 1.0) + (fill(p, COBALT, 1.0, op=0.45) if back else '') + ink(p, 3.2, closed=True) + ink([(p[2][0] - 4, p[2][1] + 6), (p[-1][0] + 4, p[-1][1] + 6)], 1.9, wob=0.2, smooth=False)
        hx = p[4 if hind else 3][0]
        return r + blob([(hx - 40, 296), (hx + 6, 296), (hx + 10, 330), (hx - 44, 330)], COAT, 2.6)
    s += leg(-150, True, False) + leg(210, True, True)
    tail = [(250, -50), (320, -60), (370, 40), (360, 190), (320, 250), (310, 120), (270, 20)]
    s += group(fill(tail, COAT, 0.8) + ink(tail, 3.0, closed=True) + fur(tail, 6, 14, 14, 1.2, 2.0), 0, 0, C0.SWAY * 1.2, 1, None, 250, -50)
    body = [(-246, -60), (-170, -124), (-60, -102), (60, -98), (170, -120), (252, -72), (278, 10), (244, 86), (120, 92), (0, 70), (-120, 104), (-226, 96), (-276, 10)]
    s += blob(body, PALE, 3.8) + fill([(-276, 10), (-226, 96), (-120, 104), (0, 70), (120, 92), (244, 86), (278, 10), (150, 40), (-150, 50)], COBALT, 1.0, op=0.32) + ink([(-210, -20), (-196, 40), (-216, 84)], 2.0, wob=0.3) + ink([(196, -40), (220, 20), (204, 70)], 2.0, wob=0.3)
    s += leg(-210, False, False) + leg(150, False, True)
    s += blob([(-76, -108), (72, -102), (92, 20), (-86, 20)], RED, 3.0) + ''.join(medallion(x, -44, 16, GOLD, 1.9) for x in (-36, 30)) + ''.join(scroll(x, 2, 9, GOLD, 1.7) for x in (-60, -20, 20, 60))
    s += blob([(-64, -118), (-40, -160), (36, -156), (72, -112)], LEATHER, 3.0) + ink([(0, 20), (0, 110)], 5, col=LEATHER, wob=0.3, taper=(0, 0), smooth=False) + blob([(-14, 104), (16, 104), (20, 138), (-18, 138)], GOLD, 2.4)   # eyer, üzengi
    neck = [(-246, -60), (-170, -124), (-176, -230), (-226, -326), (-304, -306), (-312, -210), (-286, -90)]
    s += blob(neck, PALE, 3.6) + fill([(-304, -306), (-312, -210), (-286, -90), (-256, -70), (-280, -200)], COBALT, 0.8, op=0.3)
    mane = [(-226, -330), (-196, -300), (-172, -306), (-170, -258), (-146, -250), (-158, -204), (-134, -186), (-152, -148), (-132, -120), (-170, -124), (-176, -230)]
    s += fill(mane, COAT, 0.8, smooth=False) + ink(mane, 2.8, closed=True, smooth=False, wob=0.3)
    head = [(-230, -340), (-196, -352), (-180, -300), (-236, -246), (-330, -160), (-396, -138), (-420, -170), (-404, -210), (-350, -270), (-300, -318)]
    s += blob(head, PALE, 3.6) + blob([(-222, -344), (-206, -400), (-186, -344)], PALE, 2.8) + fill([(-214, -350), (-206, -384), (-196, -348)], SKIN_D, 0.4) + fill(ellipse(-402, -168, 7, 5, 6), INK, 0.3) + ink([(-330, -160), (-300, -200), (-290, -250)], 2.0, wob=0.3)
    if spooked:
        s += fill(ellipse(-266, -280, 22, 22, 9), PALE, 0.4) + ink(ellipse(-266, -280, 22, 22, 9), 3.0, closed=True) + f'<circle cx="-270" cy="-280" r="3" fill="{INK}"/>'
        s += group(mouth_(0, 0, 34, 4, 26, 0, 5, 4), -372, -132, -24)
    else:
        s += fill(ellipse(-266, -280, 10, 9, 8), INK, 0.3) + ink([(-282, -296), (-266, -302), (-250, -296)], 3.0, wob=0.2) + ink([(-410, -152), (-376, -140), (-350, -150)], 2.6, wob=0.2)
    s += ink([(-350, -250), (-300, -214), (-240, -250)], 5, col=RED, wob=0.3, taper=(0.05, 0.05)) + ink([(-350, -250), (-380, -180)], 4, col=RED, wob=0.2, taper=(0.05, 0.05), smooth=False) + ink([(-300, -214), (-100, -110)], 2.6, col=RED, op=1, wob=0.6, taper=(0, 0), smooth=False)
    return s


def falcon():
    """Doğan: dik duran av kuşu; başında al tomağa, kanca gaga, kısık sert göz. Pençe (0,0)."""
    reseed('falcon')
    s = blob([(-6, -10), (34, 96), (4, 84), (-22, 100), (-30, -6)], COAT, 2.6) + ''.join(ink([(x, 20), (x + 8, 84)], 1.8, col=PALE, op=0.5, wob=0, smooth=False) for x in (-12, 4))
    body = [(-36, 0), (-54, -90), (-34, -166), (8, -186), (42, -156), (50, -84), (32, 0)]
    s += blob(body, PALE, 3.2) + fur([(-30, -130), (36, -130), (34, -14), (-30, -14)], 5, 13, 9, 0.2, 2.0)
    wing = [(-50, -120), (-14, -146), (8, -70), (4, 40), (-18, 96), (-44, 20)]
    s += blob(wing, LEATHER, 3.0) + fill([(-50, -120), (-30, -134), (-22, 80), (-44, 20)], INK, 0.8, op=0.35) + ''.join(ink([(-36 + k * 8, -70 + k * 30), (-20 + k * 4, -20 + k * 34)], 1.9, wob=0.2, smooth=False) for k in range(4))
    head = ellipse(6, -184, 36, 32, 9, 0.04)
    s += blob(head, LEATHER, 3.0) + blob([(-26, -196), (4, -234), (36, -200), (6, -184)], RED, 2.6) + blob(ellipse(6, -238, 7, 7, 6), GOLD, 2.0)
    s += blob([(34, -196), (74, -184), (70, -166), (56, -150), (50, -166), (32, -168)], GOLD, 2.4) + fill(ellipse(22, -184, 6, 5, 6), PALE, 0.3) + f'<circle cx="23" cy="-184" r="2.8" fill="{INK}"/>' + ink([(10, -196), (36, -190)], 3.4, wob=0, smooth=False)
    s += ''.join(ink([(x, -4), (x - 6, 14), (x + 4, 18)], 3.4, col=GOLD, op=1, wob=0, smooth=False, taper=(0, 0.3)) for x in (-18, 0, 18))
    return s
