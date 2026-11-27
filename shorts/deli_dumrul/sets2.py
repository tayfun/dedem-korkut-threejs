"""Deli Dumrul — öbür mekânlar: kuru çay üstünde köprü (gündüz), yas tutan oba, otağ içi, gece bozkırı, ilahî buyruk (yalnızca ışık)."""
import math
from ..kit import *
from .cast import COBALT, SKIN, SKIN_L, SKIN_D, PALE, GOLD, RED, COAT, LEATHER
from . import sets as S
from .cast import strap

DAY = '#b7c4f0'       # gündüz göğü: mavinin açığı
W, H = 1500, 1920


def day_sky():
    reseed('daysky')
    s = f'<rect x="-1500" y="-1500" width="{W + 3000}" height="{H + 3000}" fill="{DAY}"/>'
    s += fill(ellipse(1180, 260, 70, 70, 12, 0.01), PALE, 0.8) + sparkle(1180, 260, 120, '#fff6d8')
    for cx, cy, k in ((300, 330, 1.0), (880, 480, 0.7), (1380, 620, 0.8)):
        s += fill([(cx - 150 * k, cy), (cx - 90 * k, cy - 46 * k), (cx - 10 * k, cy - 70 * k), (cx + 80 * k, cy - 50 * k), (cx + 150 * k, cy), (cx, cy + 14 * k)], PALE, 1.4)
    return s


def day_hills():
    reseed('dayhills')
    far = [(-900, 980), (-300, 860), (0, 940), (220, 820), (480, 900), (700, 800), (980, 890), (1220, 810), (W, 900), (W + 900, 860), (W + 900, 1700), (-900, 1700)]
    s = fill(far, SKIN_L, 1.5, smooth=False)
    for a, b, c in (((220, 820), (480, 900), (300, 900)), ((700, 800), (980, 890), (780, 890)), ((1220, 810), (W, 900), (1300, 900))):
        s += fill([a, b, c, (a[0] - 60, a[1] + 70)], COBALT, 1.0, smooth=False, op=0.5)                             # gölge yüzleri mavi-mor
    return s + ink(far[:-2], 3.0, smooth=False, wob=0.5, taper=(0, 0))


def bridge():
    """Kuru çay ve üstündeki taş köprü; yanında haraç direği ve al bayrak."""
    reseed('bridge-ground')
    s = fill([(-900, 1180), (W + 900, 1170), (W + 900, H + 900), (-900, H + 900)], SKIN, 1.5, smooth=False)
    bed = [(-200, 1560), (200, 1420), (700, 1380), (1300, 1430), (1700, 1560), (1700, 1760), (800, 1700), (-200, 1800)]
    s += fill(bed, SKIN_L, 1.6, smooth=False) + ink(bed[:5], 3.0, smooth=False, wob=0.8, taper=(0, 0))
    for x, y in ((260, 1560), (520, 1500), (820, 1560), (1100, 1520), (680, 1660), (380, 1700), (1280, 1640)): s += cracks(x, y, 120, R(0, 6.28), 2, 2.2)   # çatlamış çay yatağı
    for x, y in ((180, 1640), (960, 1690), (1360, 1560)): s += blob(ellipse(x, y, 34, 20, 7, 0.2), PALE, 2.8) + fill(ellipse(x - 8, y + 6, 22, 9, 6), COBALT, 0.6, op=0.4)
    reseed('bridge')
    deck = [(120, 1250), (420, 1130), (750, 1090), (1080, 1130), (1380, 1250), (1380, 1310), (1080, 1196), (750, 1160), (420, 1196), (120, 1310)]
    wall = [(120, 1310), (420, 1196), (750, 1160), (1080, 1196), (1380, 1310), (1380, 1560), (1220, 1560), (1180, 1420), (1040, 1320), (750, 1290), (460, 1320), (320, 1420), (280, 1560), (120, 1560)]
    s += fill(wall, PALE, 1.4, smooth=False) + fill([(120, 1310), (420, 1196), (640, 1168), (540, 1320), (460, 1320), (320, 1420), (280, 1560), (120, 1560)], COBALT, 1.2, smooth=False, op=0.55)
    hole = [(460, 1320), (750, 1290), (1040, 1320), (1180, 1420), (1220, 1560), (280, 1560), (320, 1420)]
    s += fill(hole, SKIN_L, 1.0, smooth=False) + fill([(460, 1320), (750, 1290), (1040, 1320), (1180, 1420), (1196, 1470), (1030, 1380), (750, 1352), (470, 1380), (304, 1470), (320, 1420)], COBALT, 1.0, smooth=False, op=0.7)   # kemerin iç yüzü gölgede
    s += fill([(280, 1560), (304, 1470), (470, 1500), (760, 1486), (1050, 1500), (1196, 1470), (1220, 1560)], COBALT, 0.8, smooth=False, op=0.35) + ink(hole[:5], 3.0, smooth=False, wob=0.5, taper=(0, 0))
    s += '<g>' + masonry(130, 1210, 1370, 1540, 40, 2.0) + '</g>' + ink(wall, 3.6, closed=True, smooth=False, wob=0.6)
    s += fill(deck, SKIN_L, 1.2, smooth=False) + ink(deck, 3.4, closed=True, smooth=False, wob=0.6) + cracks(900, 1400, 90, 1.3, 2, 2.0) + cracks(300, 1480, 70, 2.0, 1, 2.0)
    s += ink([(1420, 1300), (1424, 900)], 12, col=LEATHER, taper=(0.02, 0.1), wob=0.6, press=0.1, smooth=False) + blob([(1426, 910), (1560, 930), (1530, 980), (1570, 1030), (1426, 1020)], RED, 3.0) + medallion(1480, 968, 20, GOLD, 2.0)
    s += ticks([(-200, 1200), (W + 200, 1200), (W + 200, 1380), (-200, 1380)], 60, (5, 10), 1.57, 0.5, 2.0)
    return s


def small_tent(cx, base, k=1.0, col=PALE):
    reseed(f'tent{cx}')
    w = 170 * k
    wall = [(cx - w, base), (cx - w, base - 110 * k), (cx + w, base - 110 * k), (cx + w, base)]
    roof = [(cx - w * 1.1, base - 110 * k), (cx, base - 250 * k), (cx + w * 1.1, base - 110 * k)]
    s = fill(wall, col, 1.2, smooth=False) + fill([(cx - w, base), (cx - w, base - 110 * k), (cx - w * 0.1, base - 110 * k), (cx - w * 0.4, base)], COBALT, 1.0, smooth=False, op=0.5)
    s += fill(roof, SKIN_L, 1.2, smooth=False) + fill([roof[0], roof[1], (cx - w * 0.2, base - 110 * k)], COBALT, 1.0, smooth=False, op=0.5)
    s += ink(wall, 3.2, smooth=False, wob=0.5, taper=(0, 0)) + ink(roof, 3.2, smooth=False, wob=0.5, taper=(0, 0)) + fill([(cx - 30 * k, base), (cx - 30 * k, base - 80 * k), (cx + 30 * k, base - 80 * k), (cx + 30 * k, base)], INK, 0.8, smooth=False)
    s += ''.join(medallion(cx - w * 0.8 + i * w * 0.4, base - 96 * k, 9 * k, RED, 1.7) for i in range(5))
    return s


def oba():
    """Köprünün yamacına konmuş oba: üç çadır, yas yeri."""
    reseed('oba-ground')
    s = fill([(-900, 1180), (W + 900, 1170), (W + 900, H + 900), (-900, H + 900)], SKIN, 1.5, smooth=False)
    s += fill([(-900, 1500), (300, 1420), (900, 1470), (W + 900, 1400), (W + 900, H + 900), (-900, H + 900)], SKIN_L, 1.4, smooth=False)
    s += small_tent(260, 1300, 1.0) + small_tent(1220, 1280, 0.9, GOLD) + small_tent(760, 1230, 0.75)
    s += fill([(430, 1300), (600, 1300), (520, 1380), (300, 1380)], COBALT, 0.8, smooth=False, op=0.45) + fill([(1373, 1280), (1500, 1280), (1440, 1350), (1260, 1350)], COBALT, 0.8, smooth=False, op=0.45)   # çadır gölgeleri
    s += ticks([(-200, 1320), (W + 200, 1320), (W + 200, H), (-200, H)], 110, (5, 10), 1.57, 0.5, 2.0)
    kilim = [(420, 1640), (1100, 1640), (1160, 1790), (360, 1790)]
    s += fill(kilim, RED, 1.2, smooth=False) + ink(kilim, 3.2, closed=True, smooth=False, wob=0.5) + ''.join(medallion(470 + i * 80, 1716, 22, GOLD, 2.0) for i in range(9))
    return s


def tent_inside():
    """Otağın içi: serin, loş; tepedeki bacadan düşen tek ışık huzmesi yerde sıcak bir yama bırakır."""
    reseed('inside')
    s = f'<rect x="-1500" y="-1500" width="{W + 3000}" height="{H + 3000}" fill="{COBALT}"/>'
    s += fill([(-200, 1250), (W + 200, 1250), (W + 200, H + 400), (-200, H + 400)], S.NIGHT, 1.0, smooth=False)
    for x in range(-100, W + 200, 150):                                                                           # kafes duvar
        s += ink([(x, 1250), (x + 150, 620)], 2.6, wob=0.6, smooth=False, taper=(0, 0)) + ink([(x + 150, 1250), (x, 620)], 2.6, wob=0.6, smooth=False, taper=(0, 0))
    for x in range(0, W + 1, 125): s += ink([(x, 620), (750, 170)], 3.0, wob=0.6, smooth=False, taper=(0, 0.2))        # çatı çıtaları
    band = [(-200, 590), (W + 200, 590), (W + 200, 660), (-200, 660)]
    s += fill(band, RED, 1.0, smooth=False) + ''.join(medallion(40 + i * 110, 625, 24, GOLD, 2.0) for i in range(14)) + ink([(-200, 660), (W + 200, 660)], 2.6, smooth=False, wob=0.5, taper=(0, 0))
    s += blob(ellipse(750, 170, 120, 46, 12, 0.03), DAY, 3.4)                                                      # baca (tündük)
    beam = [(650, 190), (850, 190), (1120, 1560), (560, 1560)]
    s += fill(beam, SKIN_L, 0, smooth=False, op=0.34) + fill([(520, 1470), (1140, 1460), (1220, 1640), (480, 1660)], SKIN_L, 1.4, smooth=False) + fill([(600, 1500), (1060, 1494), (1100, 1600), (580, 1610)], PALE, 1.2, smooth=False, op=0.5)
    carpet = [(100, 1380), (1400, 1380), (1560, 1860), (-60, 1860)]
    s += fill(carpet, RED, 1.2, smooth=False, op=0.9) + fill([(520, 1470), (1140, 1460), (1220, 1640), (480, 1660)], GOLD, 1.0, smooth=False, op=0.5)
    s += ''.join(medallion(180 + i * 190, 1760 + (i % 2) * 20, 34, GOLD, 2.2) for i in range(7)) + ink(carpet, 3.2, closed=True, smooth=False, wob=0.6)
    chest = [(1080, 1090), (1380, 1090), (1390, 1290), (1070, 1290)]
    s += blob(chest, LEATHER, 3.4) + strap((1070, 1150), (1390, 1150), 22, 8, True) + strap((1070, 1240), (1390, 1240), 22, 8, True) + blob(ellipse(1230, 1196, 24, 26, 8), GOLD, 2.6) + sparkle(1238, 1188, 8)
    s += ticks(chest, 14, (8, 16), 0.0, 0.2, 1.9)
    for i in range(3): s += blob(ellipse(170 + i * 70, 1250 - i * 26, 100 - i * 14, 44, 10, 0.05), [GOLD, PALE, RED][i], 3.0) + ''.join(scroll(120 + i * 70 + k * 44, 1250 - i * 26, 10, COBALT, 1.8) for k in range(3))   # yastıklar
    return s


def heaven():
    """İlahî buyruk: kişi gösterilmez; bulutların üstünden inen ışık huzmeleri."""
    reseed('heaven')
    s = f'<rect x="-1500" y="-1500" width="{W + 3000}" height="{H + 3000}" fill="{S.NIGHT}"/>'
    for i in range(9):
        a = -0.9 + i * 0.225; x1 = 750 + math.sin(a) * 2400; w = 70 + (i % 3) * 40
        s += fill([(750 - 30, 60), (750 + 30, 60), (x1 + w, 2100), (x1 - w, 2100)], [GOLD, PALE, GOLD][i % 3], 0, smooth=False, op=0.26 + 0.1 * (i % 2))
    s += fill(ellipse(750, 80, 220, 120, 12, 0.02), PALE, 0, op=0.9) + sparkle(750, 80, 260, '#fff6d8')
    for cx, cy, k in ((240, 520, 1.3), (1220, 470, 1.4), (700, 640, 1.8), (80, 880, 1.2), (1400, 900, 1.3)):
        cl = [(cx - 150 * k, cy), (cx - 96 * k, cy - 50 * k), (cx - 20 * k, cy - 78 * k), (cx + 70 * k, cy - 56 * k), (cx + 150 * k, cy), (cx + 60 * k, cy + 30 * k), (cx - 70 * k, cy + 30 * k)]
        s += fill(cl, COBALT, 1.6) + fill([cl[1], cl[2], cl[3], (cx, cy - 30 * k)], SKIN_L, 1.2, op=0.9) + ink(cl, 3.0, closed=True, wob=0.8)
    for _ in range(40): s += f'<circle cx="{R(0, W):.0f}" cy="{R(900, 1800):.0f}" r="{R(1.2, 3):.1f}" fill="{PALE}" opacity="{R(0.4, 0.9):.2f}"/>'
    return s


def steppe_night():
    """Gece bozkırı: ay, uzak sırtlar, tek ağaç; ayın vurduğu yer somon, gerisi kobalt."""
    reseed('steppe')
    s = S.sky() + S.back()
    s += fill([(-900, 1210), (W + 900, 1196), (W + 900, H + 900), (-900, H + 900)], COBALT, 1.5, smooth=False)
    s += fill([(300, 1500), (700, 1300), (1300, 1280), (1700, 1420), (1700, 1700), (900, 1820), (300, 1760)], SKIN, 1.4, smooth=False) + fill([(700, 1500), (1100, 1400), (1400, 1460), (1300, 1640), (860, 1700)], SKIN_L, 1.2, smooth=False)
    # ulu ağaç: kalın gövde, dallar, geniş gölgeli taç; aya bakan yanı somon
    s += ink([(330, 1330), (322, 1100), (340, 900)], 54, col=INK, taper=(0.0, 0.3), wob=1.4, press=0.15) + ink([(300, 1340), (250, 1356)], 16, col=INK, taper=(0, 0.8), wob=0.6, smooth=False) + ink([(356, 1340), (410, 1352)], 16, col=INK, taper=(0, 0.8), wob=0.6, smooth=False)
    s += ''.join(ink([(332, 1080 - k * 50), (332 + (-1) ** k * (130 + k * 26), 960 - k * 74)], 16, col=INK, taper=(0.02, 0.7), wob=1.0, smooth=False) for k in range(4))
    for cx, cy, r in ((330, 660, 220), (150, 780, 150), (520, 770, 160), (240, 560, 150), (440, 560, 150), (330, 860, 150)):
        s += fill(ellipse(cx, cy, r, r * 0.82, 11, 0.1), S.NIGHT, 2.0) + ink(ellipse(cx, cy, r, r * 0.82, 11, 0.1), 3.0, closed=True, wob=1.2, press=0.5)
    for cx, cy, r in ((440, 540, 120), (540, 740, 120), (360, 640, 130)):
        s += fill([(cx + r * 0.2, cy - r * 0.75), (cx + r * 0.8, cy - r * 0.3), (cx + r * 0.9, cy + r * 0.2), (cx + r * 0.5, cy - r * 0.1)], SKIN_L, 1.5, op=0.9)
    s += fur([(60, 480), (640, 480), (640, 930), (60, 930)], 9, 34, 12, 0.7, 2.2).replace(f'fill="{INK}"', f'fill="{COBALT}"')
    s += fill([(120, 1340), (560, 1330), (700, 1420), (200, 1440)], S.NIGHT, 1.2, smooth=False, op=0.6)                 # ağacın gölgesi
    s += ticks([(-200, 1240), (W + 200, 1240), (W + 200, H), (-200, H)], 120, (5, 11), 1.57, 0.5, 2.0)
    for x, y in ((520, 1640), (1180, 1560), (90, 1500)): s += blob(ellipse(x, y, 40, 22, 7, 0.2), COBALT, 2.8) + fill(ellipse(x + 8, y - 6, 20, 8, 6), SKIN_L, 0.6, op=0.8)
    return s


def water(t=0.0):
    """Coşkun akan su: kuru çay yatağını dolduran kobalt akıntı, soluk dalga çizgileri (köprü mekânının üstüne çizilir)."""
    reseed('water')
    bed = [(-200, 1560), (200, 1440), (700, 1400), (1300, 1450), (1700, 1560), (1700, 1780), (800, 1720), (-200, 1820)]
    s = fill(bed, COBALT, 1.6, smooth=False) + fill([(280, 1560), (304, 1470), (760, 1486), (1196, 1470), (1220, 1560)], S.NIGHT, 1.0, smooth=False, op=0.5)
    for i in range(16):
        ph = R(0, 1); y = 1470 + R(0, 300); x = (t * R(120, 220) + ph * 1900) % 1900 - 200
        s += ink([(x, y), (x + 40, y - 8), (x + 80, y), (x + 120, y - 8)], 4, col=PALE, op=0.85, wob=0, taper=(0.2, 0.3))
    return s + ink(bed[:5], 3.0, smooth=False, wob=0.8, taper=(0, 0)) + sparkle(900 + math.sin(t * 3) * 60, 1560, 26)
