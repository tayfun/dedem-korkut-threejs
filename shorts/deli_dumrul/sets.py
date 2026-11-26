"""Deli Dumrul — şölen yeri: gece, ay altında otağ önü, ateş ve sofra. Derinlik katmanları: gök, arka, orta, ön."""
import math
from ..kit import *
from .cast import COBALT, SKIN, SKIN_L, SKIN_D, PALE, GOLD, RED

NIGHT = '#19246b'     # gök: mavinin koyu tonu
W, H = 1500, 1920     # kamera kaysın diye sahne kareden geniştir (kare 1080×1920)


def sky():
    reseed('sky')
    s = f'<rect x="-1500" y="-1500" width="{W + 3000}" height="{H + 3000}" fill="{NIGHT}"/>'
    s += f'<circle cx="1010" cy="330" r="250" fill="url(#halo)"/>' + fill(ellipse(1010, 330, 74, 74, 12, 0.01), PALE, 0.8)
    s += fill(ellipse(990, 312, 16, 12, 7), COBALT, 0.4, op=0.25) + fill(ellipse(1034, 352, 10, 9, 7), COBALT, 0.4, op=0.25)
    for _ in range(60):
        x, y = R(0, W), R(0, 760); r = R(1.2, 3.2)
        s += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{PALE}" opacity="{R(0.4, 0.95):.2f}"/>'
    return s


HALO = f'<radialGradient id="halo"><stop offset="0.28" stop-color="{PALE}" stop-opacity="0.5"/><stop offset="1" stop-color="{PALE}" stop-opacity="0"/></radialGradient>'


def back():
    """Uzak sırtlar: gölgede kobalt, aya bakan yüzler somon; sert çapraz kenar."""
    reseed('hills')
    s = ''
    far = [(-900, 900), (-500, 780), (-200, 860), (0, 900), (160, 800), (330, 850), (520, 740), (720, 830), (900, 760), (1100, 850), (1300, 780), (W, 860), (W + 300, 790), (W + 900, 880), (W + 900, 1700), (-900, 1700)]
    s += fill(far, COBALT, 1.5, smooth=False) + fill([(520, 740), (720, 830), (640, 830), (560, 790)], SKIN_L, 1, smooth=False) + fill([(900, 760), (1100, 850), (1010, 846), (930, 800)], SKIN_L, 1, smooth=False)
    s += fill([(1300, 780), (W, 860), (1420, 860), (1330, 820)], SKIN_L, 1, smooth=False) + ink(far[:-2], 3.0, smooth=False, wob=0.5, taper=(0, 0))
    for x, y in ((230, 870), (470, 860), (800, 880), (1180, 900)): s += cracks(x, y, 70, 1.2, 1, 2.0)
    return s


def yurt(cx=760, base=1230, scale=1.0):
    """Otağ: keçe duvar, kilim kuşak, kapı. Ateşe bakan yanı somon, öbür yanı kobalt."""
    reseed('yurt')
    k = scale; w = 330 * k; wall = 250 * k; roof = 230 * k
    top = base - wall
    wallp = [(cx - w, base), (cx - w * 1.02, top), (cx + w * 1.02, top), (cx + w, base)]
    s = fill(wallp, SKIN_L, 1.4, smooth=False)
    s += fill([(cx - w, base), (cx - w * 1.02, top), (cx + w * 0.1, top), (cx - w * 0.28, base)], COBALT, 1.2, smooth=False)        # gölge yanı, çapraz kenarlı
    roofp = [(cx - w * 1.1, top), (cx - w * 0.3, top - roof * 0.82), (cx, top - roof), (cx + w * 0.3, top - roof * 0.82), (cx + w * 1.1, top)]
    s += fill(roofp, COBALT, 1.4, smooth=False) + fill([(cx + w * 0.2, top), (cx + w * 0.02, top - roof * 0.97), (cx + w * 0.3, top - roof * 0.82), (cx + w * 1.1, top)], SKIN, 1.2, smooth=False)
    s += blob([(cx - 40 * k, top - roof), (cx, top - roof - 34 * k), (cx + 40 * k, top - roof), (cx, top - roof + 12 * k)], RED, 3.0)
    band = [(cx - w * 1.03, top), (cx + w * 1.03, top), (cx + w * 1.02, top + 54 * k), (cx - w * 1.02, top + 54 * k)]
    s += fill(band, RED, 1.0, smooth=False) + ''.join(medallion(cx - w * 0.9 + i * w * 0.2, top + 27 * k, 17 * k, GOLD, 2.0) for i in range(10))
    s += fill([(cx - w * 1.03, top), (cx + w * 0.1, top), (cx + w * 0.06, top + 54 * k), (cx - w * 1.02, top + 54 * k)], COBALT, 1.0, smooth=False, op=0.55)
    s += ink(roofp, 3.6, smooth=False, wob=0.6, taper=(0, 0)) + ink(wallp, 3.6, smooth=False, wob=0.6, taper=(0, 0)) + ink(band[2:], 2.4, smooth=False, wob=0.4, taper=(0, 0))
    for i in range(-3, 4): s += ink([(cx + i * w * 0.3, top), (cx + i * w * 0.08, top - roof * 0.9)], 2.0, wob=0.5, smooth=False, taper=(0.1, 0.5))   # çatı çıtaları
    s += fur([(cx - w * 0.95, top + 70 * k), (cx + w * 0.95, top + 70 * k), (cx + w * 0.95, base - 12 * k), (cx - w * 0.95, base - 12 * k)], 6, 30, 9, 0.2, 2.0)    # keçe dokusu
    door = [(cx - 66 * k, base), (cx - 66 * k, top + 74 * k), (cx + 66 * k, top + 74 * k), (cx + 66 * k, base)]
    s += fill(door, INK, 1.0, smooth=False) + ink(door, 9, col=RED, smooth=False, wob=0.4, taper=(0, 0), op=1) + ink(door, 2.6, smooth=False, wob=0.4, taper=(0, 0))
    return s


def ground():
    """Yer: gölgede kobalt; ateşin aydınlattığı yama somon, sert kenarlı."""
    reseed('ground')
    s = fill([(-900, 1210), (W + 900, 1196), (W + 900, H + 900), (-900, H + 900)], COBALT, 1.5, smooth=False)
    lit = [(60, 1640), (150, 1400), (420, 1262), (860, 1236), (1240, 1300), (1400, 1470), (1300, 1720), (700, 1790), (200, 1760)]
    s += fill(lit, SKIN, 1.6, smooth=False) + fill([(60, 1640), (140, 1470), (320, 1410), (530, 1440), (630, 1570), (550, 1720), (310, 1760), (120, 1730)], SKIN_L, 1.4, smooth=False)
    s += ticks([(0, 1230), (W, 1230), (W, H), (0, H)], 120, (5, 11), 1.57, 0.5, 2.0)
    for x, y in ((180, 1400), (1280, 1620), (90, 1700)): s += blob(ellipse(x, y, 30, 18, 7, 0.2), COBALT, 2.8) + ink([(x - 14, y - 4), (x + 8, y - 8)], 1.9, wob=0.2)
    return s


def fire(cx=420, cy=1600, flick=0.0):
    """Ateş: kırmızı dış alev, altın iç, soluk çekirdek, tek parıltı. flick alevi oynatır."""
    reseed('fire-logs')
    s = ''
    for a, b in (((cx - 110, cy + 24), (cx + 96, cy - 6)), ((cx - 96, cy - 4), (cx + 112, cy + 26))):
        s += ink([a, b], 26, col=INK, taper=(0.02, 0.02), wob=0.6, press=0.1, smooth=False) + ink([a, b], 3, col=SKIN_L, taper=(0.2, 0.2), wob=0.6, smooth=False)
    reseed('fire-flame')
    f = lambda k: math.sin(flick * 6.283 + k) * 12
    outer = [(cx - 78, cy), (cx - 96, cy - 70), (cx - 50 + f(0), cy - 150), (cx - 30, cy - 96), (cx + 4 + f(1), cy - 240), (cx + 34, cy - 110), (cx + 70 + f(2), cy - 170), (cx + 92, cy - 60), (cx + 76, cy)]
    inner = [(cx - 46, cy), (cx - 54, cy - 50), (cx - 20 + f(3), cy - 100), (cx + 6 + f(1), cy - 160), (cx + 30, cy - 80), (cx + 52 + f(2), cy - 96), (cx + 48, cy)]
    s += fill(outer, RED, 1.2) + fill(inner, GOLD, 1.0) + fill([(cx - 20, cy), (cx - 16, cy - 40), (cx + 4 + f(1) * 0.5, cy - 86), (cx + 22, cy - 36), (cx + 22, cy)], PALE, 0.8)
    s += ink(outer, 2.8, wob=0.5, taper=(0.1, 0.1)) + sparkle(cx + 6, cy - 60, 18)
    return s


def embers(cx=420, cy=1430, t=0.0):
    """Havada süzülen kıvılcımlar; t ile yükselir."""
    reseed('embers')
    s = ''
    for i in range(14):
        ph = R(0, 1); x0 = R(-90, 90); sp = R(0.5, 1.1)
        u = (t * sp * 0.35 + ph) % 1
        x = cx + x0 + math.sin(u * 9 + ph * 6) * 26; y = cy - u * 620
        s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{3.4 * (1 - u) + 1:.1f}" fill="{GOLD}" opacity="{1 - u:.2f}"/>'
    return s


def sofra():
    """Ön katman: sofra bezi, tabaklar, et, ekmek, kadehler."""
    reseed('sofra')
    cloth = [(120, 1700), (1380, 1700), (W + 300, H + 400), (-300, H + 400)]
    s = fill(cloth, PALE, 1.5, smooth=False) + fill([(120, 1700), (560, 1700), (300, H + 20), (-60, H + 20)], COBALT, 1.2, smooth=False, op=0.4)
    s += ink(cloth[:2], 3.4, smooth=False, wob=0.6, taper=(0, 0))
    s += ''.join(medallion(170 + i * 96, 1740 + (i % 2) * 6, 20, RED, 2.0) for i in range(13)) + ''.join(scroll(140 + i * 110, 1890, 16, COBALT, 2.0, 1 if i % 2 else -1) for i in range(13))
    for px, py, kind in ((420, 1810, 'meat'), (760, 1830, 'bread'), (1090, 1806, 'meat')):
        s += blob(ellipse(px, py, 120, 34, 12, 0.03), GOLD, 3.2) + ink(ellipse(px, py - 4, 96, 24, 12, 0.03), 2.0, closed=True, wob=0.3)
        if kind == 'meat':
            s += blob([(px - 60, py - 14), (px - 20, py - 62), (px + 44, py - 54), (px + 70, py - 16), (px + 10, py + 2)], RED, 3.0) + ticks([(px - 50, py - 16), (px - 14, py - 54), (px + 40, py - 48), (px + 56, py - 18)], 9, (5, 9), 0.6, 0.4, 1.9)
            s += blob([(px + 60, py - 30), (px + 116, py - 58), (px + 132, py - 46), (px + 122, py - 34), (px + 70, py - 14)], PALE, 2.8)
        else:
            for i in range(3): s += blob(ellipse(px - 56 + i * 56, py - 22 - (i % 2) * 8, 40, 22, 9, 0.08), SKIN_L, 2.8) + ticks(ellipse(px - 56 + i * 56, py - 24 - (i % 2) * 8, 28, 12, 8), 5, (4, 7), 0.3, 0.5, 1.8)
    for cxp in (250, 600, 940, 1260):   # kadehler
        s += blob([(cxp - 26, 1730), (cxp + 26, 1730), (cxp + 16, 1790), (cxp + 30, 1800), (cxp - 30, 1800), (cxp - 16, 1790)], GOLD, 3.0) + fill(ellipse(cxp, 1731, 23, 7, 8), RED, 0.4) + sparkle(cxp + 12, 1752, 8)
    return s


def composite(t=0.0):
    """Bütün katmanlar üst üste (tasarım sayfası ve deneme karesi için)."""
    return sky() + back() + yurt() + ground() + fire(flick=t) + embers(t=t) + sofra()
