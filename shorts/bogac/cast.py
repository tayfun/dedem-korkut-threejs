"""Boğaç Han — "Babasının Okladığı Oğul": kadro.
Ortak takım (el, yüz kurucu, kaftan, kol, at) deli_dumrul modüllerinden, alplar ve kızlar tepegoz kadrosundan gelir.
Renk dili: oğul çini mavisi, baba al, ana ak, namertler kara, han safran."""
import math
from ..kit import *
from ..deli_dumrul import cast as C0, cast2 as K
from ..deli_dumrul.cast import COBALT, SKIN, SKIN_D, SKIN_L, PALE, GOLD, RED, COAT, LEATHER, hand, stud, strap
from ..deli_dumrul.cast2 import gface, robe, sleeve, barbed
from ..tepegoz import cast as T
from .. import palette as _pal
GREEN = _pal.get()['GREEN']


def _boots(name, w, y0, y1, col=LEATHER):
    s = ''
    for sx in (-1, 1):
        reseed(f'{name}-boot{sx}')
        s += blob([(sx * 16, y0), (sx * w, y0), (sx * (w + 2), y1 - 44), (sx * (w + 38), y1 - 28), (sx * (w + 36), y1), (sx * 12, y1)], col, 3.2) + ink([(sx * 20, y0 + 40), (sx * (w - 2), y0 + 44)], 1.9, wob=0.3, smooth=False)
    return s


# ----------------------------------------------------------------------------- Boğaç
def bogac_head(expr='neutral'):
    """On beşinde oğlan: sakalsız, iri gözlü, alnına dökülen kara perçem; ak kürk kuşaklı al börk."""
    f, d = gface('bogac', 88, 98, 0.92, (44, 16, 0.0), (0.33, -0.08, 15, 13), (INK, 9), (0.33, 0.5), expr, bags=0, wrinkles=0, folds=False)
    reseed('bogac-hair')
    s = fill([(-100, 40), (-96, -60), (96, -60), (100, 40), (84, 10), (86, -30), (-86, -30), (-84, 10)], INK, 0.8, smooth=False) + f
    s += fill([(-90, -26), (-90, -66), (90, -66), (90, -26), (64, -46), (36, -30), (8, -48), (-22, -30), (-54, -46)], INK, 0.8, smooth=False)
    reseed('bogac-cap')
    dome = [(-94, -62), (-74, -138), (0, -170), (74, -138), (94, -62), (0, -82)]
    s += blob(dome, RED, 3.2) + fill([(-94, -62), (-74, -138), (-20, -162), (-30, -76)], INK, 0.8, op=0.3) + blob([(-10, -168), (0, -200), (10, -168)], GOLD, 2.2)
    band = [(-104, -62), (0, -84), (104, -62), (102, -30), (0, -52), (-102, -30)]
    return s + blob(band, PALE, 3.0) + fur(band, 2, 12, 10, 1.4, 1.8)


def bogac(expr='neutral', armL=10, armR=-10, hr=0, poseR='open', sword_in_hand=False, knife_in_hand=False):
    """İnce, uzun boyunlu delikanlı; çini mavisi kısa kaftan, al kuşak. Boyun kökü (0,0); ayak tabanı y=480."""
    s = group(sleeve(190, 26, COBALT, 'bogac', False, 0.7, 'open', -1, GOLD), -82, 40, armL) + _boots('bogac', 76, 300, 480)
    s += robe(84, 102, 320, COBALT, 'bogac', hem=GOLD, belt=RED)
    s += ink([(-30, -6), (0, 40), (30, -6)], 5, col=GOLD, op=1, wob=0.2, taper=(0, 0), smooth=False)
    held = group(C0.sword(), 0, 290, 180, 0.9) if sword_in_hand else (group(T.dagger(), 0, 290, 180, 1.0) if knife_in_hand else '')
    s += group(held + sleeve(190, 26, COBALT, 'bogac', True, 0.7, 'grip' if held else poseR, 1, GOLD), 82, 40, armR)
    return s + group(bogac_head(expr), 0, -98, hr, 0.86, None, 0, 100)


# ----------------------------------------------------------------------------- Dirse Han
def dirse_head(expr='neutral'):
    """Geniş çeneli bey: kürek gibi kara sakal, pala bıyık, gür çatık kaş; altın kuşaklı kara börk, al sorguç."""
    f, d = gface('dirse', 104, 112, 1.18, (66, 26, 0.25), (0.3, -0.14, 13, 9), (INK, 14), (0.4, 0.44), expr, bags=2, wrinkles=2)
    reseed('dirse-beard')
    beard = [(-112, 30), (-84, 96 + d), (0, 112 + d), (84, 96 + d), (112, 30), (124, 150 + d), (96, 240 + d), (40, 286 + d), (0, 270 + d), (-40, 286 + d), (-96, 240 + d), (-124, 150 + d)]
    s = f + group(fill(beard, INK, 0.9, smooth=False) + ''.join(ink([(x, 150 + d), (x * 0.9, 250 + d)], 2.2, col=COBALT, op=0.8, wob=0.5, taper=(0.2, 0.5)) for x in (-80, -40, 0, 40, 80)), 0, 0, C0.SWAY * 0.5, 1, None, 0, 80)
    for sx in (-1, 1): s += fill([(0, 52), (sx * 36, 44), (sx * 84, 64), (sx * 118, 120 + d), (sx * 76, 100 + d * 0.5), (sx * 50, 86), (sx * 22, 78), (0, 72)], INK, 0.8, smooth=False)
    reseed('dirse-hat')
    dome = [(-112, -84), (-96, -180), (0, -226), (96, -180), (112, -84), (0, -106)]
    s += blob(dome, COAT, 3.4) + fill([(20, -200), (90, -170), (104, -96), (40, -110)], LEATHER, 0.8, op=0.6)
    band = [(-122, -84), (0, -108), (122, -84), (120, -44), (0, -68), (-120, -44)]
    s += blob(band, GOLD, 3.0) + ''.join(medallion(x, -72 - (1 - abs(x) / 100) * 14, 11, RED, 1.8) for x in (-80, -40, 0, 40, 80))
    return s + blob([(-8, -220), (-30, -300), (10, -330), (40, -290), (12, -220)], RED, 2.8) + ink([(2, -224), (6, -310)], 1.8, wob=0.3)


def dirse(expr='neutral', armL=12, armR=-12, hr=0, bow_in_hand=False, bound=False, kopuz_in_hand=False):
    """İri, geniş omuzlu; altın benekli al kaftan, kara kuşak. Boyun kökü (0,0); ayak tabanı y=600.
    bound: eller arkada bağlı, boyunda kıl sicim. kopuz_in_hand: kopuz kucakta."""
    s = ''
    if not bound and not kopuz_in_hand:
        held = group(T.bow(), 0, 250, 0, 1.5) if bow_in_hand else ''
        s += group(held + sleeve(230, 38, RED, 'dirse', False, 0.84, 'grip' if bow_in_hand else 'open', -1, GOLD), -122, 44, armL)
    s += _boots('dirse', 96, 500, 602, COAT) + robe(124, 160, 540, RED, 'dirse', pattern=GOLD, hem=GOLD, belt=COAT)
    if bound:
        reseed('dirse-rope')
        for y in (150, 186): s += ink([(-130, y), (0, y + 14), (130, y)], 9, col=LEATHER, op=1, wob=0.5, taper=(0, 0)) + ink([(-130, y), (0, y + 14), (130, y)], 1.8, wob=0.5, taper=(0, 0))
        s += group(dirse_head(expr), 0, -118, hr, 0.84, None, 0, 120)
        return s + ink([(-60, 6), (0, 30), (60, 6)], 9, col=LEATHER, op=1, wob=0.4, taper=(0, 0)) + ink([(60, 6), (150, 60), (300, 40)], 8, col=LEATHER, op=1, wob=0.8, taper=(0, 0.1))
    if kopuz_in_hand:
        s += group(dirse_head(expr), 0, -118, hr, 0.84, None, 0, 120) + group(K.kopuz(), -30, 330, 0, 1.0)
        return s + group(sleeve(230, 38, RED, 'dirse', False, 0.84, 'grip', -1, GOLD), -122, 44, -14) + group(sleeve(120, 38, RED, 'dirse', True, 0.84, 'grip', 1, GOLD), 122, 44, -60)
    s += group(sleeve(230, 38, RED, 'dirse', True, 0.84, 'open', 1, GOLD), 122, 44, armR)
    return s + group(dirse_head(expr), 0, -118, hr, 0.84, None, 0, 120)


# ----------------------------------------------------------------------------- Dirse Han'ın hatunu
def hatun_head(expr='neutral'):
    """İnce uzun yüz, kirpikli iri göz; al sivri başlık, alnında altın pullar."""
    f, d = gface('hatun', 80, 98, 0.9, (50, 16, 0.05), (0.33, -0.1, 14, 10), (INK, 6), (0.32, 0.5), expr, bags=0, wrinkles=0, lash=True, folds=False)
    reseed('hatun-hat')
    s = f + fill([(-84, -30), (-82, -70), (82, -70), (84, -30), (40, -52), (0, -40), (-40, -52)], INK, 0.8, smooth=False)
    cone = [(-88, -66), (-62, -180), (0, -250), (62, -180), (88, -66), (0, -88)]
    s += blob(cone, RED, 3.2) + fill([(-88, -66), (-62, -180), (-14, -236), (-24, -84)], INK, 0.8, op=0.3) + ''.join(scroll(x, -130, 10, GOLD, 1.8, 1 if x > 0 else -1) for x in (-30, 30))
    band = [(-94, -66), (0, -90), (94, -66), (92, -44), (0, -68), (-92, -44)]
    s += blob(band, GOLD, 2.8) + ''.join(fill(ellipse(x, -44 - (1 - abs(x) / 80) * 20, 6, 7, 6), GOLD, 0.3) + ink(ellipse(x, -44 - (1 - abs(x) / 80) * 20, 6, 7, 6), 1.4, closed=True) for x in (-66, -40, -14, 14, 40, 66))
    return s + blob(ellipse(0, -252, 12, 12, 7), GOLD, 2.2)


def hatun(expr='neutral', armL=14, armR=-14, hr=0):
    """Uzun boylu, ince belli; altın benekli ak kaftan, al kuşak, omuzlardan dökülen duvak, iki kara örgü. Boyun kökü (0,0); etek ucu y=500."""
    reseed('hatun-veil')
    s = blob([(-70, -230), (-150, -60), (-176, 200), (-150, 380), (-110, 200), (-90, 20), (90, 20), (110, 200), (150, 380), (176, 200), (150, -60), (70, -230)], PALE, 3.0)
    s += group(sleeve(186, 28, PALE, 'hatun', False, 0.72, 'open', -1, RED), -98, 44, armL) + robe(100, 150, 500, PALE, 'hatun', shade=COBALT, pattern=GOLD, hem=RED, belt=RED)
    s += group(sleeve(186, 28, PALE, 'hatun', True, 0.72, 'open', 1, RED), 98, 44, armR)
    for sx in (-1, 1):
        reseed(f'hatun-braid{sx}')
        br = [(sx * 62, -40), (sx * 74, 120), (sx * 60, 270)]
        s += ink(br, 15, col=INK, op=1, wob=0.6, taper=(0, 0.1)) + ''.join(ink([(sx * 62 - 9, 20 + k * 34), (sx * 66 + 9, 34 + k * 34)], 1.6, col=LEATHER, op=1, wob=0, smooth=False) for k in range(7)) + blob(ellipse(sx * 60, 276, 9, 12, 6), RED, 2.0)
    return s + group(hatun_head(expr), 0, -96, hr, 0.86, None, 0, 100)


def kiz(i=0, expr='neutral', armL=14, armR=-14):
    """Kırk ince belli kızdan biri: ince, uzun; küçük al takke, iki örgü. Boyun kökü (0,0); etek ucu y=470."""
    name = f'kiz{i % 3}'; col = [GOLD, COBALT, GREEN][i % 3]
    s = group(sleeve(176, 24, col, name, False, 0.66, 'open', -1, PALE), -78, 40, armL) + robe(78, 124, 470, col, name, hem=PALE, belt=RED) + group(sleeve(176, 24, col, name, True, 0.66, 'open', 1, PALE), 78, 40, armR)
    for sx in (-1, 1):
        reseed(f'{name}-braid{sx}')
        s += ink([(sx * 56, -50), (sx * 66, 90), (sx * 56, 220)], 13, col=INK, op=1, wob=0.6, taper=(0, 0.1)) + blob(ellipse(sx * 56, 226, 8, 11, 6), RED, 1.8)
    f, d = gface(name, [74, 70, 78][i % 3], [88, 94, 84][i % 3], 0.9, (40, 14, 0.0), (0.33, -0.08, 13, 10), (INK, 5), (0.3, 0.5), expr, bags=0, wrinkles=0, lash=True, folds=False)
    reseed(name + '-cap')
    hd = fill([(-84, 30), (-80, -64), (80, -64), (84, 30), (70, 0), (72, -30), (-72, -30), (-70, 0)], INK, 0.8, smooth=False) + f + fill([(-78, -26), (-76, -66), (76, -66), (78, -26), (30, -50), (0, -36), (-30, -50)], INK, 0.8, smooth=False)
    hd += blob([(-66, -64), (-50, -110), (0, -124), (50, -110), (66, -64), (0, -80)], RED, 2.8) + ''.join(fill(ellipse(x, -66 - (1 - abs(x) / 60) * 12, 5, 6, 6), GOLD, 0.3) for x in (-44, -22, 0, 22, 44))
    return s + group(hd, 0, -88, 0, 0.86)


# ----------------------------------------------------------------------------- Bayındır Han
def bayindir(expr='neutral', armL=14, armR=-14, hr=0):
    """Hanlar hanı: tombul, ak top sakal; al benekli safran kaftan, ak kürklü al taç-börk. Boyun kökü (0,0); ayak tabanı y=540."""
    s = group(sleeve(200, 40, GOLD, 'bayindir', False, 0.86, 'open', -1, RED), -136, 44, armL) + _boots('bayindir', 100, 450, 542, RED)
    s += robe(140, 184, 480, GOLD, 'bayindir', shade=LEATHER, pattern=RED, hem=RED, belt=COAT) + group(sleeve(200, 40, GOLD, 'bayindir', True, 0.86, 'open', 1, RED), 136, 44, armR)
    f, d = gface('bayindir', 112, 104, 1.25, (58, 30, 0.1), (0.3, -0.12, 13, 8), (PALE, 13), (0.42, 0.46), expr, bags=3, wrinkles=2)
    reseed('bayindir-beard')
    beard = [(-126, 30), (-96, 90 + d), (0, 104 + d), (96, 90 + d), (126, 30), (140, 130 + d), (100, 210 + d), (0, 240 + d), (-100, 210 + d), (-140, 130 + d)]
    hd = f + barbed(beard, PALE, 2.6, [(-126, 30), (-96, 90 + d), (-30, 100 + d), (-20, 236 + d), (-100, 210 + d), (-140, 130 + d)]) + fur(beard, 5, 13, 11, 0.1, 1.9)
    for sx in (-1, 1): hd += barbed([(0, 50), (sx * 34, 42), (sx * 80, 62), (sx * 104, 110 + d), (sx * 60, 92), (sx * 24, 76), (0, 70)], PALE, 2.2)
    reseed('bayindir-crown')
    hd += blob([(-116, -80), (-90, -170), (0, -206), (90, -170), (116, -80), (0, -100)], RED, 3.4) + ''.join(blob([(x - 16, -150), (x, -250 - (20 if x == 0 else 0)), (x + 16, -150)], GOLD, 2.4) + sparkle(x, -236, 7) for x in (-60, 0, 60))
    band = [(-132, -80), (0, -104), (132, -80), (130, -36), (0, -60), (-130, -36)]
    hd += blob(band, PALE, 3.2) + fur(band, 3, 13, 11, 1.4, 1.9)
    return s + group(hd, 0, -104, hr, 0.86, None, 0, 110)


# ----------------------------------------------------------------------------- kırk namert
def namert(kind=0, expr='joy', sword_in_hand=False, armR=-12):
    """Kırk namert: kara kaftanlı, sivri külahlı, burma bıyıklı; üç yapı. Boyun kökü (0,0); ayak tabanı y=480."""
    k = kind % 3; name = f'namert{k}'; w = [96, 74, 112][k]
    s = group(sleeve(180, 28, COAT, name, False, 0.72, 'open', -1, RED), -w * 0.94, 42, 14) + _boots(name, 78, 400, 482, LEATHER)
    s += robe(w, w * 1.2, 420, COAT, name, shade=COBALT, hem=RED, belt=RED) + ink([(-w * 0.3, -6), (0, 60), (w * 0.3, -6)], 4, col=RED, op=1, wob=0.2, taper=(0, 0), smooth=False)
    held = group(C0.sword(), 0, 280, 180, 0.8) if sword_in_hand else ''
    s += group(held + sleeve(180, 28, COAT, name, True, 0.72, 'grip' if held else 'open', 1, RED), w * 0.94, 42, armR)
    f, d = gface(name, [84, 68, 98][k], [100, 108, 88][k], [0.8, 0.7, 1.15][k], ([70, 84, 50][k], [18, 14, 26][k], 0.4), (0.3, -0.1, 12, 7), (INK, 11), (0.4, 0.46), expr, bags=2, wrinkles=1)
    reseed(name + '-hat')
    hw = [90, 72, 102][k]
    hd = f + ''.join(ink([(0, 44), (sx * 40, 40), (sx * 86, 10), (sx * 100, -14)], 6, col=INK, op=1, taper=(0, 0.8), wob=0.3) for sx in (-1, 1))            # burma bıyık
    hd += blob([(-10, 100 + d), (0, 150 + d), (10, 100 + d)], INK, 0) if k != 2 else ''
    hd += blob([(-hw, -44), (-hw * 0.7, -130), (20, -230), (hw * 0.7, -130), (hw, -44), (0, -64)], COAT, 3.2) + blob([(4, -196), (20, -236), (34, -196)], RED, 2.0)
    hd += blob([(-hw - 6, -48), (0, -70), (hw + 6, -48), (hw + 4, -24), (0, -46), (-hw - 4, -24)], RED, 2.6)
    return s + group(hd, 0, -84, 0, 0.88)


# ----------------------------------------------------------------------------- Hızır
def hizir(expr='joy', armR=-12):
    """Boz atlı Hızır: ak sakallı, yeşil sarıklı, ak giyimli ermiş; ardında ışık halesi. Boyun kökü (0,0); etek ucu y=520."""
    reseed('hizir-halo')
    s = fill(ellipse(0, -110, 250, 250, 20, 0.02), PALE, 0.5, op=0.35) + fill(ellipse(0, -110, 180, 180, 18, 0.02), PALE, 0.5, op=0.5)
    s += ''.join(ink([(math.cos(a) * 270, -110 + math.sin(a) * 270), (math.cos(a) * 330, -110 + math.sin(a) * 330)], 5, col=PALE, op=0.9, wob=0, taper=(0, 0.6), smooth=False) for a in [i * 6.283 / 16 for i in range(16)])
    s += group(sleeve(200, 30, PALE, 'hizir', False, 0.74, 'open', -1, GREEN), -100, 44, 12) + robe(100, 150, 520, PALE, 'hizir', shade=COBALT, hem=GREEN, belt=GREEN)
    for sx in (-1, 1): s += blob([(sx * 40, -12), (sx * 108, 24), (sx * 146, 300), (sx * 160, 520), (sx * 112, 520), (sx * 96, 300), (sx * 60, 60)], GREEN, 3.0)
    s += group(sleeve(200, 30, PALE, 'hizir', True, 0.74, 'open', 1, GREEN), 100, 44, armR)
    f, d = gface('hizir', 90, 112, 0.9, (60, 18, 0.1), (0.3, -0.12, 13, 8), (PALE, 10), (0.36, 0.46), expr, bags=1, wrinkles=2)
    reseed('hizir-beard')
    beard = [(-90, 30), (-62, 84 + d), (0, 98 + d), (62, 84 + d), (90, 30), (96, 160 + d), (60, 280 + d), (0, 340 + d), (-60, 280 + d), (-96, 160 + d)]
    hd = f + barbed(beard, PALE, 2.6, [(-90, 30), (-62, 84 + d), (-20, 96 + d), (-10, 330 + d), (-60, 280 + d), (-96, 160 + d)]) + fur(beard, 8, 13, 12, 0.1, 1.9)
    for sx in (-1, 1): hd += barbed([(0, 54), (sx * 30, 46), (sx * 66, 64), (sx * 84, 106 + d), (sx * 50, 90), (sx * 22, 78), (0, 72)], PALE, 2.2)
    reseed('hizir-turban')
    tb = [(-136, -70), (-126, -150), (-60, -206), (20, -220), (100, -190), (140, -124), (136, -64), (50, -48), (-50, -50)]
    hd += blob(tb, GREEN, 3.4) + fill([(-136, -70), (-126, -150), (-60, -206), (-30, -208), (-60, -54)], INK, 1.0, op=0.3) + ''.join(ink([(-126 + k * 10, -80 - k * 24), (-10 + k * 14, -134 - k * 18), (128 - k * 6, -90 - k * 20)], 2.2, wob=0.6, taper=(0.2, 0.3)) for k in range(5))
    return s + group(hd, 0, -108, 0, 0.86)


# ----------------------------------------------------------------------------- hayvanlar
def horse(col=None):
    """At (deli_dumrul'daki çizim); col verilirse donu o renge boyanır."""
    h = K.horse()
    return h if not col else h.replace(f'fill="{PALE}"', f'fill="{col}"')


def mounted(rider, name, col, seat=250, horse_col=None, dy=0):
    """Atlı: at sola bakar; binici belden yukarı görünür, yakın bacağı eyerden sarkar. Atın sırt ortası (0,0); nal y=330."""
    cid = f'mount-{name}'
    s = horse(horse_col) + f'<defs><clipPath id="{cid}"><rect x="-700" y="-1200" width="1400" height="{1200 + seat}"/></clipPath></defs>'
    s += group(f'<g clip-path="url(#{cid})">{rider}</g>', 10, -108 - seat + dy)
    reseed(cid)
    s += blob([(-44, -112 + dy), (24, -114 + dy), (10, 20), (-34, 40), (-58, 10)], col, 3.2) + fill([(-44, -112 + dy), (-58, 10), (-34, 40), (-30, -100)], INK, 0.8, op=0.3)
    return s + blob([(-64, 30), (-16, 44), (-30, 130), (-96, 140), (-100, 116), (-66, 106)], LEATHER, 3.0)


def bull(charge=False, head=True, snort=0.0, only_head=False):
    """Bayındır Han'ın boğası: yandan, sola bakar; kara, koca hörgüç, ak boynuz, kızıl göz, burnunda halka. Sırtın ortası (0,0); tırnak y=250.
    charge: baş eğik, saldırır. head=False: başı kesilmiş."""
    if only_head: return _bull_head(snort)
    reseed('bull')
    s = ''
    for x, back in ((-130, True), (180, True), (-190, False), (120, False)):
        leg = [(x - 34, 60), (x + 38, 60), (x + 24, 190), (x + 30, 226), (x + 34, 252), (x - 34, 252), (x - 30, 226), (x - 22, 190)]
        s += fill(leg, COAT, 1.0) + (fill(leg, COBALT, 1.0, op=0.35) if back else fill([leg[1], leg[2], leg[3], (x + 8, 226), (x + 6, 60)], LEATHER, 0.8, op=0.5)) + ink(leg, 3.0, closed=True) + blob([(x - 36, 226), (x + 36, 226), (x + 38, 254), (x - 38, 254)], PALE, 2.4)
    tail = [(262, -60), (320, -40), (334, 60), (320, 150)]
    s += group(ink(tail, 10, col=COAT, op=1, taper=(0.05, 0.1), wob=0.6, press=0.1) + barbed([(306, 140), (340, 150), (336, 220), (316, 196), (300, 216)], COAT, 0), 0, 0, C0.SWAY * 1.4, 1, None, 262, -60)
    body = [(-262, -30), (-220, -130), (-120, -176), (-20, -130), (120, -112), (230, -110), (272, -50), (276, 50), (210, 112), (0, 100), (-200, 116), (-270, 50)]
    s += blob(body, COAT, 3.8) + fill([(-220, -130), (-120, -176), (-20, -130), (120, -112), (230, -110), (190, -66), (40, -70), (-110, -110)], LEATHER, 1.0, op=0.6) + fill([(-270, 50), (-200, 116), (0, 100), (210, 112), (276, 50), (150, 70), (-150, 76)], COBALT, 1.0, op=0.35)
    s += ink([(-150, -100), (-140, -20), (-170, 60)], 2.4, col=LEATHER, op=0.9, wob=0.4) + ink([(180, -70), (206, 0), (190, 70)], 2.4, col=LEATHER, op=0.9, wob=0.4)
    if not head:
        return s + blob(ellipse(-268, 0, 34, 70, 10, 0.06), RED, 3.0) + fill(ellipse(-272, 0, 16, 34, 8, 0.08), SKIN_L, 0.5)
    return s + group(_bull_head(snort), -250, -40, -34 if charge else 0, 1, None, 40, 0)


def _bull_head(snort=0.0):
    """Boğanın başı: boyun kökü (0,0) sağda, burun solda."""
    reseed('bull-head')
    far = blob([(10, -80), (50, -150), (-20, -210), (-90, -214), (-30, -180), (-10, -130), (-30, -76)], PALE, 2.8) + fill([(10, -80), (50, -150), (20, -170), (-4, -84)], COBALT, 0.6, op=0.4)
    skull = [(60, -80), (-30, -100), (-110, -50), (-170, 30), (-176, 90), (-130, 124), (-60, 110), (0, 70), (70, 20)]
    h = far + blob(skull, COAT, 3.6) + fill([(60, -80), (-30, -100), (-110, -50), (-90, -20), (20, -50)], LEATHER, 0.8, op=0.6)
    h += blob([(-176, 40), (-120, 30), (-96, 80), (-124, 124), (-170, 110)], LEATHER, 2.8) + fill(ellipse(-160, 76, 7, 9, 6), INK, 0.3) + ink(ellipse(-140, 132, 16, 20, 8), 5, col=GOLD, op=1, closed=True, wob=0.2) + ink(ellipse(-140, 132, 16, 20, 8), 1.6, closed=True, wob=0.2)
    h += fill(ellipse(-64, -24, 18, 13, 8), PALE, 0.3) + f'<circle cx="-68" cy="-22" r="7" fill="{RED}"/><circle cx="-69" cy="-22" r="2.6" fill="{INK}"/>' + ink([(-96, -34), (-64, -48), (-34, -52)], 7, col=PALE, op=1, wob=0.2, taper=(0.1, 0.3))
    h += blob([(30, -70), (70, -96), (64, -50)], COAT, 2.4)
    h += blob([(-30, -90), (-10, -160), (-90, -226), (-170, -224), (-104, -190), (-70, -140), (-66, -84)], PALE, 3.0) + ink([(-60, -150), (-100, -196)], 1.8, wob=0.3)
    if snort > 0:
        for k in range(3): h += fill(ellipse(-200 - k * 44 * snort, 96 + k * 16, 16 + k * 8, 12 + k * 6, 8, 0.2), PALE, 0.6, op=0.8 - k * 0.2)
    return h


def deer():
    """Geyik: yandan, sola bakar; çatal boynuz, benekli sırt. Sırtın ortası (0,0); tırnak y=210."""
    reseed('deer')
    s = ''
    for x, back in ((-90, True), (110, True), (-120, False), (80, False)):
        leg = [(x - 14, 30), (x + 16, 30), (x + 8, 120), (x + 12, 210), (x - 8, 210), (x - 6, 120)]
        s += fill(leg, GOLD, 0.8) + (fill(leg, COBALT, 0.8, op=0.4) if back else '') + ink(leg, 2.6, closed=True) + blob([(x - 10, 196), (x + 14, 196), (x + 14, 212), (x - 10, 212)], COAT, 1.8)
    body = [(-160, -10), (-110, -60), (40, -50), (150, -44), (176, 10), (130, 56), (-90, 60), (-160, 30)]
    s += blob(body, GOLD, 3.4) + fill([(-160, 30), (-90, 60), (130, 56), (176, 10), (90, 30), (-90, 34)], PALE, 0.8) + ''.join(fill(ellipse(x, y, 7, 6, 6), PALE, 0.3) for x, y in ((-60, -30), (-10, -34), (40, -26), (90, -28), (14, -8), (-40, -6)))
    s += blob([(170, -30), (196, -50), (200, -14)], PALE, 2.0)
    neck = [(-160, -10), (-110, -60), (-130, -150), (-170, -190), (-210, -170), (-196, -90)]
    s += blob(neck, GOLD, 3.2)
    head = [(-170, -210), (-140, -196), (-136, -160), (-190, -130), (-250, -110), (-262, -130), (-230, -170)]
    s += blob(head, GOLD, 3.0) + blob([(-150, -200), (-120, -230), (-134, -186)], GOLD, 2.2) + fill(ellipse(-190, -168, 6, 6, 6), INK, 0.2) + fill(ellipse(-254, -122, 6, 5, 6), INK, 0.2)
    for dx in (0, 24):
        s += ink([(-164 + dx, -206), (-150 + dx, -280), (-120 + dx, -330)], 6, col=LEATHER, op=1, taper=(0, 0.5), wob=0.4) + ink([(-154 + dx, -260), (-190 + dx, -300)], 5, col=LEATHER, op=1, taper=(0, 0.6), wob=0.3, smooth=False) + ink([(-140 + dx, -300), (-100 + dx, -296)], 5, col=LEATHER, op=1, taper=(0, 0.6), wob=0.3, smooth=False)
    return s


# ----------------------------------------------------------------------------- eşyalar
def asik():
    """Aşık kemikleri: yerde dört küçük kemik. Ortası (0,0)."""
    reseed('asik')
    return ''.join(blob([(x - 16, y - 8), (x - 6, y - 12), (x + 6, y - 12), (x + 16, y - 8), (x + 14, y + 8), (x + 4, y + 4), (x - 4, y + 4), (x - 14, y + 8)], PALE, 2.2) + ink([(x - 6, y - 4), (x + 6, y - 4)], 1.5, wob=0, smooth=False) for x, y in ((-50, 0), (-10, 14), (34, -4), (70, 12)))


def cicek(n=5):
    """Dağ çiçeği demeti: sapların birleştiği yer (0,0), çiçekler yukarıda."""
    reseed('cicek')
    s = ''
    for i in range(n):
        a = -1.571 + (i - (n - 1) / 2) * 0.34; x, y = math.cos(a) * 120, math.sin(a) * 120
        s += ink([(0, 0), (x * 0.5 + 6, y * 0.5), (x, y)], 4, col=GREEN, op=1, wob=0.4, taper=(0, 0.1)) + ''.join(blob(ellipse(x + math.cos(b) * 14, y + math.sin(b) * 14, 10, 10, 6, 0.1), RED if i % 2 else PALE, 1.8) for b in [k * 1.257 for k in range(5)]) + fill(ellipse(x, y, 7, 7, 6), GOLD, 0.3)
    return s


def kundak(expr='blink'):
    """Kundaktaki oğlan: ak kundak, al bağ, küçük yüz. Ortası (0,0)."""
    reseed('kundak')
    s = blob([(-110, -30), (-60, -56), (60, -50), (120, -10), (110, 40), (0, 60), (-100, 44)], PALE, 3.0) + ''.join(ink([(x, -50), (x + 20, 54)], 5, col=RED, op=1, wob=0.3, taper=(0, 0), smooth=False) for x in (-20, 40))
    f, _ = gface('kundak', 60, 58, 0.86, (14, 8, 0.1), (0.32, 0.04, 10, 8), (INK, 4), (0.3, 0.5), expr, bags=0, wrinkles=0, folds=False)
    return s + group(f + fill([(-56, -20), (-50, -56), (0, -66), (50, -56), (56, -20), (20, -40), (-20, -40)], INK, 0.6, smooth=False), -112, -20, -80, 0.7)


def taht():
    """Taht: yüksek arkalıklı, al minderli, altın işlemeli. Oturağın ortası (0,0); ayaklar y=150."""
    reseed('taht')
    s = blob([(-150, 0), (-170, -330), (0, -400), (170, -330), (150, 0)], GOLD, 3.4) + fill([(-150, 0), (-170, -330), (-60, -376), (-70, 0)], LEATHER, 1.0, op=0.4) + blob([(-112, -30), (-124, -290), (0, -340), (124, -290), (112, -30)], RED, 2.6)
    s += ''.join(medallion(x, y, 16, GOLD, 1.9) for x, y in ((-60, -220), (60, -220), (0, -280), (0, -150), (-60, -90), (60, -90)))
    s += blob([(-176, 0), (176, 0), (184, 44), (-184, 44)], RED, 3.0) + blob([(-170, 44), (170, 44), (160, 150), (120, 150), (110, 80), (-110, 80), (-120, 150), (-160, 150)], GOLD, 3.2)
    return s + ''.join(blob(ellipse(sx * 172, -336, 20, 20, 8), GOLD, 2.4) + sparkle(sx * 168, -342, 8) for sx in (-1, 1))
