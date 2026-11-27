"""Boğaç Han — mekânlar: Bayındır Han'ın toyu (ak, kızıl, kara otağ), Dirse Han'ın obası, ak meydan, Kazılık Dağı, kâfir eline giden yol.
Gök, dağlar, yer ve otağ kurucuları tepegoz mekânlarından gelir; renkler bu hikâyenin paletinden okunur."""
import math
from ..kit import *
from ..kit import _scatter
from ..deli_dumrul import sets as S0
from ..tepegoz import sets as TS
from ..tepegoz.sets import sky, peaks, land, yurt, tug, camp, EARTH, EARTH_D, DAY, W, H
from .cast import COBALT, SKIN, SKIN_D, SKIN_L, PALE, GOLD, RED, COAT, LEATHER, GREEN

HALO = S0.HALO


def otag(cx, base, k, body, band, rib=INK):
    """Büyük otağ: gövde rengi verilir (ak, kızıl, kara)."""
    reseed(f'otag{cx}')
    w = 250 * k; top = base - 200 * k
    dome = [(cx - w * 1.04, top), (cx - w * 0.8, top - 120 * k), (cx - w * 0.3, top - 196 * k), (cx, top - 214 * k), (cx + w * 0.3, top - 196 * k), (cx + w * 0.8, top - 120 * k), (cx + w * 1.04, top)]
    wall = [(cx - w, base), (cx - w * 1.03, top), (cx + w * 1.03, top), (cx + w, base)]
    s = fill(wall, body, 1.4, smooth=False) + fill(dome, body, 1.4)
    s += fill([(cx - w, base), (cx - w * 1.03, top), (cx - w * 0.8, top - 120 * k), (cx - w * 0.3, top - 196 * k), (cx - w * 0.1, top - 208 * k), (cx - w * 0.3, base)], COBALT if body != COAT else INK, 1.2, smooth=False, op=0.4)
    if body == COAT: s += fill([(cx + w * 0.3, base), (cx + w * 0.2, top - 200 * k), (cx + w * 0.8, top - 120 * k), (cx + w * 1.03, top), (cx + w, base)], LEATHER, 1.2, smooth=False, op=0.45)
    s += fill([(cx - w * 1.03, top), (cx + w * 1.03, top), (cx + w * 1.02, top + 46 * k), (cx - w * 1.02, top + 46 * k)], band, 1.0, smooth=False) + ''.join(scroll(cx - w * 0.9 + i * w * 0.2, top + 23 * k, 13 * k, GOLD if band != GOLD else RED, 2.0, 1 if i % 2 else -1) for i in range(10))
    s += ''.join(ink([(cx + i * w * 0.34, top), (cx + i * w * 0.1, top - 208 * k)], 2.0, col=rib, op=0.8, wob=0.6, taper=(0.05, 0.5), smooth=False) for i in range(-3, 4))
    s += ink(dome, 3.6, wob=0.7, taper=(0, 0)) + ink(wall, 3.6, smooth=False, wob=0.6, taper=(0, 0)) + blob(ellipse(cx, top - 214 * k, 40 * k, 14 * k, 8), LEATHER, 2.6)
    door = [(cx - 54 * k, base), (cx - 54 * k, top + 64 * k), (cx + 54 * k, top + 64 * k), (cx + 54 * k, base)]
    return s + fill(door, INK, 1.0, smooth=False) + ink(door, 8, col=band, op=1, smooth=False, wob=0.4, taper=(0, 0)) + ink(door, 2.4, smooth=False, wob=0.4, taper=(0, 0))


def toy():
    """Bayındır Han'ın toyu: bir yerde ak otağ, bir yerde kızıl otağ, bir yerde kara otağ; kara otağın önünde kara keçe."""
    s = land(EARTH, SKIN, 'toy-land')
    reseed('toy')
    s += otag(760, 1230, 0.72, RED, GOLD) + otag(290, 1290, 0.92, PALE, RED) + otag(1220, 1300, 1.0, COAT, LEATHER, PALE)
    s += tug(540, 1290, 0.9) + tug(980, 1260, 0.8)
    felt = [(960, 1380), (1440, 1370), (1520, 1520), (900, 1540)]
    s += fill(felt, COAT, 1.6, smooth=False) + ink(felt, 3.0, closed=True, smooth=False, wob=0.8) + ticks(felt, 40, (6, 12), 0.4, 0.6, 1.8, LEATHER)
    for x, y in _scatter([(-100, 1340), (880, 1340), (880, 1900), (-100, 1900)], 16): s += blob(ellipse(x, y, R(8, 18), R(5, 10), 6, 0.25), EARTH_D, 2.0)
    return s


def oba():
    """Dirse Han'ın obası: gündüz, üç otağ ve tuğlar."""
    return camp(False)


def meydan():
    """Bayındır Han'ın ak meydanı: arkada saray duvarı ve kapısı, önde ak kumlu alan."""
    s = land(EARTH, SKIN, 'meydan-land')
    reseed('meydan')
    wall = [(-300, 1230), (-300, 930), (1800, 930), (1800, 1230)]
    s += fill(wall, PALE, 1.4, smooth=False) + fill([(-300, 1230), (-300, 1130), (1800, 1130), (1800, 1230)], COBALT, 1.0, smooth=False, op=0.3) + masonry(-300, 930, 1800, 1230, 50, 1.8)
    for x in range(-280, 1800, 130): s += blob([(x, 932), (x, 880), (x + 70, 880), (x + 70, 932)], PALE, 3.0)
    s += ink([(-300, 930), (1800, 930)], 3.4, smooth=False, wob=0.6, taper=(0, 0))
    gate = [(1010, 1232), (1010, 1040), (1070, 960), (1150, 934), (1230, 960), (1290, 1040), (1290, 1232)]
    s += fill(gate, INK, 1.2) + ink(gate, 10, col=RED, op=1, wob=0.5, taper=(0, 0)) + ink(gate, 2.6, wob=0.5, taper=(0, 0))
    for x in (300, 700):
        s += ink([(x, 930), (x, 700)], 9, col=LEATHER, op=1, taper=(0, 0.1), wob=0.5, smooth=False) + blob([(x + 4, 706), (x + 150, 730), (x + 96, 770), (x + 160, 820), (x + 4, 800)], RED, 2.8) + blob(ellipse(x, 694, 12, 12, 7), GOLD, 2.0)
    arena = ellipse(750, 1580, 860, 300, 20, 0.02)
    s += fill(arena, PALE, 1.4) + fill(ellipse(700, 1640, 700, 190, 18, 0.03), SKIN_L, 1.2, op=0.35) + ink(arena, 3.0, closed=True, wob=0.8) + ticks(arena, 60, (8, 16), 0.05, 0.3, 1.9, EARTH_D)
    return s


def pine(x, y, h):
    reseed(f'pine{x}')
    s = ink([(x, y + 20), (x, y - h * 0.3)], 16, col=COAT, op=1, taper=(0, 0.3), wob=0.5, smooth=False)
    for i in range(3):
        b = y - h * (0.16 + i * 0.26); w = h * (0.34 - i * 0.08); t = b - h * 0.36
        tri = [(x - w, b), (x - w * 0.3, b - h * 0.1), (x, t), (x + w * 0.3, b - h * 0.1), (x + w, b), (x, b + h * 0.05)]
        s += blob(tri, GREEN, 3.0) + fill([tri[0], tri[1], tri[2], (x - 4, b + h * 0.04)], COBALT, 0.8, smooth=False, op=0.4)
    return s


def dag():
    """Kazılık Dağı: çamlı yamaç, kayalar, dağ çiçekleri; av yeri ve oğlanın vurulduğu yer."""
    s = land(GREEN, PALE, 'dag-land', COAT)
    reseed('dag')
    slope = [(-300, 1420), (300, 1330), (800, 1360), (1300, 1300), (1800, 1380), (1800, 2000), (-300, 2000)]
    s += fill(slope, GREEN, 1.4, smooth=False) + fill(slope, PALE, 1.4, smooth=False, op=0.2)
    for x, y, h in sorted(((80, 1240, 460), (250, 1270, 600), (470, 1230, 380), (1080, 1240, 420), (1260, 1280, 640), (1440, 1250, 480)), key=lambda p: p[1]): s += pine(x, y, h)
    for x, y, k in ((640, 1300, 1.0), (1000, 1480, 0.7), (180, 1560, 0.8)):
        rk = [(x - 110 * k, y), (x - 80 * k, y - 90 * k), (x, y - 130 * k), (x + 90 * k, y - 80 * k), (x + 120 * k, y)]
        s += fill(rk, PALE, 1.2, smooth=False) + fill([rk[0], rk[1], rk[2], (x + 10 * k, y)], COBALT, 1.0, smooth=False, op=0.4) + ink(rk, 3.2, smooth=False, wob=0.7, taper=(0, 0)) + cracks(x + 30 * k, y - 90 * k, 70 * k, 1.4, 1, 2.0)
    for x, y in _scatter([(-100, 1380), (W + 100, 1380), (W + 100, 1900), (-100, 1900)], 60): s += fill(ellipse(x, y, 8, 8, 6), RED if R(0, 1) > 0.45 else PALE, 0.4) + fill(ellipse(x, y, 3, 3, 5), GOLD, 0.2) + ink([(x, y + 7), (x + 2, y + 26)], 1.8, col=COAT, wob=0, smooth=False)
    return s


def yol():
    """Kâfir eline giden yol: çıplak bozkır, uzakta tepede kâfir kalesi, kuru ağaç."""
    s = land(EARTH, SKIN, 'yol-land')
    reseed('yol')
    hill = [(900, 1232), (1040, 1090), (1250, 1020), (1460, 1080), (1700, 1232)]
    s += fill(hill, EARTH_D, 1.4) + ink(hill, 3.0, wob=0.7, taper=(0, 0))
    k = [(1100, 1050), (1100, 900), (1130, 900), (1130, 860), (1160, 860), (1160, 900), (1190, 900), (1190, 820), (1215, 780), (1240, 820), (1240, 900), (1300, 900), (1300, 850), (1330, 850), (1330, 900), (1380, 900), (1380, 840), (1410, 800), (1440, 840), (1440, 1060)]
    s += fill(k, COBALT, 1.2, smooth=False) + fill([(1100, 1050), (1100, 900), (1190, 900), (1190, 820), (1215, 780), (1215, 1040)], INK, 1.0, smooth=False, op=0.35) + ink(k, 3.0, smooth=False, wob=0.5, taper=(0, 0)) + fill([(1250, 1040), (1250, 960), (1270, 940), (1290, 960), (1290, 1040)], INK, 0.6, smooth=False)
    s += ink([(1215, 780), (1215, 720)], 3, wob=0, smooth=False) + blob([(1217, 722), (1262, 734), (1217, 750)], RED, 1.8)
    road = [(1180, 1232), (1260, 1232), (900, 1480), (700, 1900), (200, 1900), (560, 1460)]
    s += fill(road, PALE, 1.6, op=0.55) + ink([(1180, 1232), (560, 1460), (200, 1900)], 2.4, wob=0.8, taper=(0, 0), op=0.6) + ink([(1260, 1232), (900, 1480), (700, 1900)], 2.4, wob=0.8, taper=(0, 0), op=0.6)
    s += ink([(180, 1300), (176, 1040), (200, 900)], 22, col=COAT, op=1, taper=(0, 0.4), wob=1.2, press=0.2) + ''.join(ink([(184, 1080 - i * 56), (184 + (-1) ** i * (80 + i * 18), 1000 - i * 60)], 8, col=COAT, op=1, taper=(0.02, 0.8), wob=1.0, smooth=False) for i in range(4))
    for x, y in _scatter([(-100, 1320), (W + 100, 1320), (W + 100, 1900), (-100, 1900)], 20): s += blob(ellipse(x, y, R(8, 20), R(5, 11), 6, 0.25), EARTH_D, 2.0)
    return s
