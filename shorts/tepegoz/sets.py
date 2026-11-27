"""Basat ile Tepegöz — mekânlar: sazlık (aslan yatağı), Uzun Pınar, Oğuz obası (gece/gündüz), Salahana Kayası, Tepegöz'ün mağarası.
Her mekân derinlik katmanlarıyla kurulur (gök, arka, orta, ön); ışık iki düz ton ve sert kenarlıdır."""
import math
from ..kit import *
from ..kit import _scatter
from ..deli_dumrul import sets as S0, sets2 as S2
from ..deli_dumrul.sets2 import cloud, stones, EARTH, EARTH_D, DAY
from .cast import COBALT, SKIN, SKIN_D, SKIN_L, PALE, GOLD, RED, COAT, LEATHER, GREEN

NIGHT = S0.NIGHT
W, H = 1500, 1920
HALO = S0.HALO


def sky(night=False):
    return S0.sky() if night else S2.day_sky()


def peaks(night=False):
    """Sivri dağlar: gündüz güneşli yüz açık ten, gölge mavi, doruklar karlı; gece gövde mavi, aya bakan yüz ten."""
    reseed('peaks')
    line = [(-900, 1000), (-560, 720), (-300, 880), (-60, 560), (190, 830), (420, 640), (650, 890), (870, 520), (1110, 850), (1330, 660), (1570, 900), (1900, 720), (2400, 1000)]
    s = fill(line + [(2400, 1800), (-900, 1800)], COBALT if night else SKIN_L, 1.5, smooth=False)
    for i in range(1, len(line) - 1, 2):
        (x0, y0), (x, y), (x1, y1) = line[i - 1], line[i], line[i + 1]
        side = [(x, y), (x0, y0), (x - 30, y0 + 40), (x + 40, y + (y1 - y) * 0.6)] if not night else [(x, y), (x1, y1), (x1 - 80, y1 + 10), (x + 10, y + (y1 - y) * 0.5)]
        s += fill(side, COBALT if not night else SKIN, 1.2, smooth=False, op=0.5 if not night else 0.9)
        k = 0.3
        cap = [(x, y), (x + (x1 - x) * k, y + (y1 - y) * k), (x + (x1 - x) * k * 0.5, y + (y1 - y) * k * 0.7), (x, y + (y1 - y) * k * 1.1), (x + (x0 - x) * k * 0.5, y + (y0 - y) * k * 0.7), (x + (x0 - x) * k, y + (y0 - y) * k)]
        s += fill(cap, PALE, 1.0, smooth=False) + cracks(x + 20, y + 120, 110, 1.4, 1, 2.0)
    return s + ink(line, 3.0, smooth=False, wob=0.6, taper=(0, 0))


def land(col, shade=None, name='land', marks=EARTH_D):
    reseed(name)
    area = [(-300, 1230), (W + 300, 1230), (W + 300, H + 100), (-300, H + 100)]
    s = fill([(-900, 1190), (W + 900, 1180), (W + 900, H + 900), (-900, H + 900)], col, 1.5, smooth=False)
    if shade: s += fill([(-900, 1190), (W + 900, 1180), (W + 900, 1250), (600, 1264), (-900, 1250)], shade, 1.5, smooth=False, op=0.45)
    return s + ticks(area, 120, (8, 18), 0.05, 0.25, 2.1, marks)


def reed(x, y, h, lean=0.0, head=True):
    s = ink([(x, y), (x + lean * h * 0.4, y - h * 0.6), (x + lean * h, y - h)], 7, col=GREEN, op=1, taper=(0, 0.5), wob=0.6, press=0.15) + ink([(x + 8, y - h * 0.2), (x + 40 + lean * 60, y - h * 0.62)], 5, col=GREEN, op=1, taper=(0, 0.8), wob=0.4, smooth=False)
    if head: s += blob(ellipse(x + lean * h * 0.92, y - h * 0.9, 9, 34, 7, 0.1, lean * 0.4), LEATHER, 2.2)
    return s


def reeds():
    """Sazlık: su birikintileri, kamışlar, ortada aslan yatağı."""
    s = land(EARTH, SKIN, 'reeds-land')
    reseed('reeds')
    for x, y, rx in ((240, 1380, 190), (1180, 1460, 230), (700, 1700, 280)):
        s += fill(ellipse(x, y, rx, rx * 0.22, 12, 0.08), COBALT, 1.4) + ink(ellipse(x, y, rx, rx * 0.22, 12, 0.08), 2.6, closed=True, wob=0.6) + ''.join(ink([(x - rx * 0.5 + k * 70, y + k * 6 - 8), (x - rx * 0.5 + k * 70 + 60, y + k * 6 - 8)], 3, col=PALE, op=0.8, wob=0, taper=(0.2, 0.3), smooth=False) for k in range(3))
    for x, y in sorted(_scatter([(-100, 1200), (W + 100, 1200), (W + 100, 1330), (-100, 1330)], 46), key=lambda p: p[1]): s += reed(x, y, R(190, 330), R(-0.12, 0.12), R(0, 1) > 0.4)
    nest = ellipse(760, 1470, 300, 74, 14, 0.06)
    s += blob(nest, GOLD, 3.2) + fill(ellipse(760, 1482, 240, 46, 12, 0.05), EARTH_D, 1.0, op=0.5) + ticks(nest, 60, (16, 34), 0.0, 0.5, 2.2) + ''.join(blob(ellipse(x, y, 20, 9, 6, 0.2, a), PALE, 2.0) for x, y, a in ((560, 1500, 0.3), (930, 1512, -0.4), (1000, 1450, 0.2)))   # yatak ve kemikler
    return s


def reeds_fore():
    reseed('reeds-fore')
    return ''.join(reed(x, 1990, R(360, 560), R(-0.14, 0.14)) for x in (-60, 40, 130, 1330, 1420, 1520, 1600)).replace(f'fill="{GREEN}"', f'fill="{COAT}"')


def spring():
    """Uzun Pınar: çayır, kaynaktan dolan gölcük, kavak; perilerin konduğu yer."""
    s = land(GREEN, PALE, 'spring-land', COAT)
    reseed('spring')
    s += fill([(-200, 1500), (300, 1360), (900, 1330), (1500, 1400), (1800, 1560), (1800, 1900), (-200, 1900)], GREEN, 1.4, smooth=False) + fill([(-200, 1500), (300, 1360), (900, 1330), (1500, 1400), (1800, 1560), (1800, 1900), (-200, 1900)], PALE, 1.4, smooth=False, op=0.22)
    rock = [(980, 1250), (1020, 1080), (1130, 1000), (1260, 1040), (1340, 1170), (1330, 1260)]                              # kaynak kayası
    s += fill(rock, PALE, 1.4, smooth=False) + fill([(980, 1250), (1020, 1080), (1130, 1000), (1150, 1250)], COBALT, 1.2, smooth=False, op=0.45) + ink(rock, 3.4, closed=True, smooth=False, wob=0.7) + cracks(1200, 1100, 110, 1.3, 2, 2.2)
    s += ink([(1160, 1150), (1150, 1240), (1100, 1330)], 16, col=COBALT, op=1, taper=(0.1, 0.05), wob=0.8, press=0.1) + ink([(1160, 1150), (1150, 1240), (1100, 1330)], 3, col=PALE, op=0.9, wob=0.8, taper=(0.1, 0.3))
    pool = ellipse(820, 1400, 430, 96, 16, 0.05)
    s += fill(pool, COBALT, 1.4) + fill(ellipse(900, 1380, 250, 40, 12, 0.06), DAY, 1.2, op=0.45) + ink(pool, 3.2, closed=True, wob=0.8)
    s += ''.join(ink([(x, y), (x + 50, y - 5), (x + 100, y)], 3.2, col=PALE, op=0.9, wob=0, taper=(0.2, 0.3)) for x, y in ((520, 1400), (700, 1440), (960, 1420), (840, 1370), (1080, 1390))) + sparkle(900, 1392, 24)
    for x, y in ((420, 1420), (520, 1480), (1160, 1470), (1250, 1400), (700, 1500)): s += blob(ellipse(x, y, R(26, 44), R(16, 24), 7, 0.2), PALE, 2.8) + fill(ellipse(x - 8, y + 6, 22, 8, 6), COBALT, 0.6, op=0.4)
    for x, hh in ((200, 560), (310, 430)):                                                                                   # kavaklar
        tree = [(x - 60, 1240), (x - 76, 1240 - hh * 0.5), (x - 30, 1240 - hh), (x + 40, 1240 - hh * 0.9), (x + 70, 1240 - hh * 0.4), (x + 56, 1240)]
        s += ink([(x, 1300), (x, 1240 - hh * 0.3)], 18, col=COAT, op=1, taper=(0, 0.4), wob=0.6, smooth=False) + blob(tree, GREEN, 3.2) + fill([tree[0], tree[1], tree[2], (x - 10, 1240)], COBALT, 1.0, op=0.35) + ticks(tree, 26, (10, 18), 1.3, 0.4, 2.0)
    for x, y in _scatter([(-100, 1500), (W + 100, 1500), (W + 100, 1900), (-100, 1900)], 40): s += fill(ellipse(x, y, 7, 7, 6), RED if R(0, 1) > 0.5 else PALE, 0.4) + ink([(x, y + 6), (x + 2, y + 24)], 1.8, col=COAT, wob=0, smooth=False)   # çiçekler
    return s


def yurt(cx, base, k=1.0, band=RED, night=False):
    """Kubbeli Oğuz otağı: keçe gövde, kolon bağları, işlemeli kuşak."""
    reseed(f'tg-yurt{cx}')
    w = 250 * k; top = base - 190 * k
    dome = [(cx - w * 1.04, top), (cx - w * 0.8, top - 110 * k), (cx - w * 0.3, top - 180 * k), (cx, top - 196 * k), (cx + w * 0.3, top - 180 * k), (cx + w * 0.8, top - 110 * k), (cx + w * 1.04, top)]
    wall = [(cx - w, base), (cx - w * 1.03, top), (cx + w * 1.03, top), (cx + w, base)]
    lit, dark = (SKIN, COBALT) if night else (PALE, COBALT)
    s = fill(wall, lit, 1.4, smooth=False) + fill(dome, lit, 1.4)
    s += fill([(cx - w, base), (cx - w * 1.03, top), (cx - w * 0.8, top - 110 * k), (cx - w * 0.3, top - 180 * k), (cx - w * 0.1, top - 190 * k), (cx - w * 0.3, base)], dark, 1.2, smooth=False, op=0.85 if night else 0.4)
    s += fill([(cx - w * 1.03, top), (cx + w * 1.03, top), (cx + w * 1.02, top + 44 * k), (cx - w * 1.02, top + 44 * k)], band, 1.0, smooth=False) + ''.join(scroll(cx - w * 0.9 + i * w * 0.2, top + 22 * k, 13 * k, GOLD, 2.0, 1 if i % 2 else -1) for i in range(10))
    s += ''.join(ink([(cx + i * w * 0.34, top), (cx + i * w * 0.1, top - 190 * k)], 2.0, wob=0.6, taper=(0.05, 0.5), smooth=False) for i in range(-3, 4))
    s += ink(dome, 3.6, wob=0.7, taper=(0, 0)) + ink(wall, 3.6, smooth=False, wob=0.6, taper=(0, 0)) + blob(ellipse(cx, top - 196 * k, 40 * k, 14 * k, 8), COAT, 2.6)
    door = [(cx - 50 * k, base), (cx - 50 * k, top + 60 * k), (cx + 50 * k, top + 60 * k), (cx + 50 * k, base)]
    return s + fill(door, INK, 1.0, smooth=False) + ink(door, 8, col=band, op=1, smooth=False, wob=0.4, taper=(0, 0)) + ink(door, 2.4, smooth=False, wob=0.4, taper=(0, 0))


def tug(x, base, k=1.0):
    """Tuğ: ucunda at kuyruğu ve altın alem olan sırık."""
    reseed(f'tug{x}')
    s = ink([(x, base), (x + 4, base - 520 * k)], 10, col=LEATHER, op=1, taper=(0, 0.1), wob=0.6, smooth=False) + blob(ellipse(x + 4, base - 530 * k, 16 * k, 16 * k, 8), GOLD, 2.4) + sparkle(x + 8, base - 536 * k, 9)
    tail = [(x + 4, base - 500 * k), (x + 40 * k, base - 470 * k), (x + 56 * k, base - 380 * k), (x + 30 * k, base - 300 * k), (x + 14 * k, base - 380 * k), (x - 8 * k, base - 310 * k), (x - 6 * k, base - 420 * k)]
    return s + fill(tail, RED, 0.8) + ink(tail, 2.6, closed=True, wob=0.5) + fur(tail, 5, 12, 14, 1.3, 1.9)


def camp(night=False):
    """Oğuz obası: üç otağ, tuğlar. Gece baskınında ateş ışığı ten, gölge mavi."""
    s = land(COBALT if night else EARTH, None if night else SKIN, 'camp-land')
    reseed('camp')
    if night: s += fill([(200, 1560), (360, 1320), (760, 1250), (1180, 1300), (1380, 1500), (1200, 1740), (640, 1800), (300, 1740)], SKIN, 1.6, smooth=False) + fill([(480, 1540), (600, 1400), (860, 1370), (1040, 1460), (960, 1620), (640, 1660)], SKIN_L, 1.4, smooth=False)
    s += yurt(1180, 1250, 0.8, GREEN, night) + yurt(330, 1270, 0.95, RED, night) + yurt(770, 1220, 0.7, COBALT if not night else RED, night)
    s += tug(590, 1290, 0.9) + tug(1010, 1270, 0.8)
    if not night: s += fill([(560, 1270), (760, 1270), (640, 1350), (400, 1350)], COBALT, 0.8, smooth=False, op=0.4) + fill([(1380, 1250), (1540, 1250), (1460, 1320), (1280, 1320)], COBALT, 0.8, smooth=False, op=0.4)
    for x, y in _scatter([(-100, 1320), (W + 100, 1320), (W + 100, 1900), (-100, 1900)], 22): s += blob(ellipse(x, y, R(8, 18), R(5, 10), 6, 0.25), EARTH_D if not night else COAT, 2.0)
    return s


def bones(x, y, k=1.0):
    reseed(f'bones{x}')
    s = ''
    for i in range(6):
        a = R(0, 3.14); l = R(50, 90) * k; bx, by = x + R(-110, 110) * k, y + R(-26, 26) * k
        s += ink([(bx - math.cos(a) * l / 2, by - math.sin(a) * l * 0.3), (bx + math.cos(a) * l / 2, by + math.sin(a) * l * 0.3)], 11 * k, col=PALE, op=1, taper=(0, 0), wob=0.3, smooth=False) + ink([(bx - math.cos(a) * l / 2, by - math.sin(a) * l * 0.3), (bx + math.cos(a) * l / 2, by + math.sin(a) * l * 0.3)], 2.0, wob=0.3, smooth=False)
    skull = ellipse(x + 30 * k, y - 30 * k, 34 * k, 30 * k, 9, 0.06)
    return s + blob(skull, PALE, 2.8) + fill(ellipse(x + 18 * k, y - 34 * k, 8 * k, 10 * k, 6), INK, 0.3) + fill(ellipse(x + 42 * k, y - 34 * k, 8 * k, 10 * k, 6), INK, 0.3) + ''.join(ink([(x + (20 + j * 8) * k, y - 8 * k), (x + (20 + j * 8) * k, y + 2 * k)], 1.7, wob=0, smooth=False) for j in range(4))


def rock():
    """Salahana Kayası: yalçın kaya, dibinde mağara ağzı, çevrede kemikler ve kuru bir ağaç."""
    s = land(EARTH, SKIN, 'rock-land')
    reseed('rock')
    crag = [(380, 1290), (420, 900), (540, 640), (700, 500), (860, 380), (1040, 440), (1200, 600), (1330, 860), (1420, 1100), (1460, 1290)]
    s += clipdef('crag', crag, smooth=False) + fill(crag, PALE, 1.6, smooth=False) + fill(crag, SKIN_L, 1.6, smooth=False, op=0.35)
    s += fill([(380, 1290), (420, 900), (540, 640), (700, 500), (860, 380), (900, 700), (800, 1000), (860, 1290)], COBALT, 1.4, smooth=False, op=0.55)        # gölge yüz, sert kenar
    s += '<g clip-path="url(#crag)">' + ''.join(cracks(x, y, 170, a, 2, 2.4) for x, y, a in ((560, 760, 1.2), (900, 520, 1.8), (1140, 700, 1.3), (1260, 980, 1.6), (700, 1050, 1.0), (1000, 900, 2.0)))
    s += ''.join(ink([(x, y), (x + R(60, 160), y + R(-10, 10))], 2.4, wob=0.6, taper=(0.2, 0.4), smooth=False) for x, y in _scatter(crag, 26)) + '</g>'
    s += ink(crag, 4.0, smooth=False, wob=0.9, taper=(0, 0))
    mouth_ = [(900, 1290), (910, 1100), (980, 990), (1090, 960), (1190, 1010), (1250, 1130), (1260, 1290)]
    s += fill(mouth_, INK, 1.2) + ink(mouth_, 3.6, wob=0.8, taper=(0, 0)) + fill([(960, 1290), (980, 1170), (1060, 1120), (1140, 1160), (1180, 1290)], RED, 1.0, op=0.3)         # içeride ateşin kızıllığı
    s += fill([(1460, 1290), (1640, 1290), (1560, 1380), (1300, 1380)], COBALT, 0.8, smooth=False, op=0.4)
    s += ink([(180, 1300), (176, 1040), (200, 900)], 22, col=COAT, op=1, taper=(0, 0.4), wob=1.2, press=0.2) + ''.join(ink([(184, 1080 - k * 56), (184 + (-1) ** k * (80 + k * 18), 1000 - k * 60)], 8, col=COAT, op=1, taper=(0.02, 0.8), wob=1.0, smooth=False) for k in range(4))
    return s + bones(640, 1420) + bones(1240, 1520, 0.8) + bones(300, 1640, 1.1)


def cave():
    """Mağaranın içi: serin ve karanlık; sağdaki ağızdan tek bir ışık huzmesi girer, ortada ocak yanar, solda koyun ağılı."""
    reseed('cave')
    s = f'<rect x="-1500" y="-1500" width="{W + 3000}" height="{H + 3000}" fill="{NIGHT}"/>'
    wall = [(-200, 1300), (-200, 200), (300, 120), (760, 60), (1200, 140), (1700, 220), (1700, 1300)]
    s += fill(wall, COBALT, 1.6, smooth=False) + fill([(-200, 1300), (-200, 200), (300, 120), (520, 600), (360, 1300)], NIGHT, 1.4, smooth=False, op=0.6)
    s += ''.join(cracks(x, y, 200, a, 2, 2.6) for x, y, a in ((300, 500, 1.3), (700, 300, 1.7), (1000, 700, 1.2), (500, 900, 1.9), (1250, 420, 1.4)))
    for x, l in ((120, 260), (330, 160), (520, 330), (760, 200), (930, 290), (1140, 180), (1330, 250)):                    # sarkıtlar
        st = [(x - 46, 60), (x + 46, 60), (x + 14, 60 + l * 0.6), (x, 60 + l), (x - 16, 60 + l * 0.6)]
        s += fill(st, NIGHT, 1.2, smooth=False) + ink(st[1:], 3.0, smooth=False, wob=0.6, taper=(0, 0.2)) + fill([(x + 46, 60), (x + 14, 60 + l * 0.6), (x, 60 + l), (x + 12, 60)], COBALT, 0.8, smooth=False, op=0.6)
    opening = [(1260, 1300), (1250, 900), (1330, 720), (1460, 660), (1700, 700), (1700, 1300)]                               # mağara ağzı
    s += fill(opening, DAY, 1.4) + fill([(1380, 1300), (1420, 1040), (1560, 940), (1700, 980), (1700, 1300)], SKIN_L, 1.2, smooth=False) + ink(opening[:5], 4.0, wob=0.9, taper=(0, 0))
    s += fill([(-200, 1270), (1700, 1260), (1700, H + 500), (-200, H + 500)], EARTH_D, 1.6, smooth=False) + fill([(-200, 1270), (1700, 1260), (1700, H + 500), (-200, H + 500)], NIGHT, 1.6, smooth=False, op=0.55)
    s += fill([(1250, 1290), (1500, 1280), (1100, 1900), (420, 1900)], SKIN_L, 0, smooth=False, op=0.32)                       # içeri düşen ışık huzmesi
    s += fill([(420, 1560), (560, 1400), (800, 1350), (1040, 1400), (1140, 1540), (1020, 1680), (760, 1720), (520, 1680)], SKIN, 1.6, smooth=False) + fill([(600, 1540), (680, 1440), (820, 1420), (940, 1470), (960, 1570), (820, 1630), (680, 1620)], SKIN_L, 1.4, smooth=False)   # ocağın aydınlattığı yer
    for i in range(9):
        a = i * 0.698; x, y = 780 + math.cos(a) * 130, 1520 + math.sin(a) * 44
        s += blob(ellipse(x, y, 30, 20, 7, 0.2), PALE, 2.6) + fill(ellipse(x - 6, y + 6, 18, 8, 6), COBALT, 0.5, op=0.5)      # ocak taşları
    for x in range(-60, 430, 70): s += ink([(x, 1500), (x + 6, 1250)], 12, col=LEATHER, op=1, taper=(0, 0.05), wob=0.6, smooth=False) + ink([(x, 1500), (x + 6, 1250)], 2.0, wob=0.6, smooth=False, taper=(0, 0))
    s += ink([(-80, 1320), (430, 1310)], 12, col=LEATHER, op=1, taper=(0, 0), wob=0.8, smooth=False) + ink([(-80, 1430), (430, 1420)], 12, col=LEATHER, op=1, taper=(0, 0), wob=0.8, smooth=False)          # ağıl çiti
    return s + bones(1180, 1640, 0.9) + bones(300, 1760, 1.2) + ticks([(-200, 1300), (1700, 1300), (1700, 1900), (-200, 1900)], 70, (7, 14), 0.1, 0.4, 2.0)
