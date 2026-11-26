"""Tasarım sayfası: kadro, ifadeler, eller, eşyalar, mekân ve kilitli palet."""
import sys
from PIL import Image
from ..kit import *
from . import cast, sets

PAPER = '#eadfc8'


def label(x, y, text, size=30, bold=False):
    return f'<text x="{x}" y="{y}" font-family="DejaVu Sans, sans-serif" font-size="{size}" {"font-weight=\"bold\"" if bold else ""} fill="{INK}">{text}</text>'


def sheet(out):
    W, H = 3200, 2500
    b = label(60, 80, 'AZRAİL’E KILIÇ ÇEKEN ADAM — tasarım sayfası', 46, True)
    # palet
    pal = [('kobalt', cast.COBALT), ('ten', cast.SKIN), ('ten gölge', cast.SKIN_D), ('ten ışık', cast.SKIN_L), ('soluk', cast.PALE), ('altın', cast.GOLD), ('kırmızı', cast.RED), ('gece', sets.NIGHT), ('mürekkep', INK), ('ince çizgi', FINE)]
    for i, (n, c) in enumerate(pal):
        reseed('pal' + n)
        b += fill([(1500 + i * 150, 30), (1630 + i * 150, 30), (1630 + i * 150, 100), (1500 + i * 150, 100)], c, 1.5, smooth=False) + label(1500 + i * 150, 128, n, 20)
    # Deli Dumrul
    b += label(60, 190, 'DELİ DUMRUL — koca çene, pala bıyık, altın diş', 30, True)
    b += group(cast.dumrul('neutral'), 330, 520, 0, 0.72)
    for i, n in enumerate(cast.EXPR):
        b += group(cast.dumrul_head(n), 860 + i * 300, 440, 0, 0.62) + label(790 + i * 300, 640, n, 24)
    b += group(cast.dumrul('anger', armL=14, armR=-150, poseR='grip', sword_in_hand=True), 1050, 990, 0, 0.42) + label(930, 1250, 'kılıç çekmiş', 24)
    b += group(cast.hand(True, 'open'), 1420, 780, 0, 1.3) + group(cast.hand(False, 'open', flip=-1), 1640, 780, 0, 1.3) + group(cast.hand(True, 'fist'), 1860, 790, 0, 1.3) + group(cast.hand(True, 'grip'), 2060, 790, 0, 1.3)
    b += label(1370, 1010, 'eller: ışıkta, gölgede, yumruk, kavrama', 24)
    b += group(cast.sword(), 2260, 1200, 0, 0.72) + label(2190, 1290, 'kara kılıç', 24)
    # Azrail
    b += label(60, 1330, 'AZRAİL — kanca burun, sönük çukur göz, ağarmış sakal, al kanat', 30, True)
    b += group(cast.azrail('neutral'), 360, 1700, 0, 0.74)
    for i, n in enumerate(cast.AZ):
        b += group(cast.azrail_head(n), 880 + i * 290, 1560, 0, 0.72) + label(820 + i * 290, 1850, n, 24)
    b += group(cast.dove(0), 950, 2060, 0, 1.1) + group(cast.dove(1), 1280, 2040, 0, 1.1) + label(860, 2180, 'güvercin: kanat yukarı, aşağı', 24)
    # yiğitler
    b += label(1560, 1990, 'YİĞİTLER — iri, sıska, kısa', 30, True)
    for i in range(3): b += group(cast.extra(i), 1700 + i * 300, 2290, 0, 0.8)
    # mekân
    b += label(2420, 190, 'ŞÖLEN YERİ — gece, otağ önü', 30, True)
    scene = (sets.sky() + sets.back() + sets.yurt() + sets.ground() + group(cast.azrail('stern'), 420, 1010, 0, 0.5) + group(cast.extra(1), 640, 1330, 0, 0.62) + group(cast.extra(0), 1200, 1420, 0, 0.66)
             + group(cast.dumrul('shock', armL=30, armR=-30), 900, 1210, 0, 0.6) + sets.fire(flick=0.2) + sets.embers(t=0.2) + group(cast.extra(2), 250, 1640, 0, 0.7) + sets.sofra())
    b += f'<svg x="2420" y="220" width="700" height="{700 * 1920 / 1080:.0f}" viewBox="210 0 1080 1920">{scene}</svg>'
    b += label(2420, 1500, 'Işık iki düz ton: ateşin vurduğu yer somon,', 22) + label(2420, 1530, 'gölge kobalt; aralarında sert çapraz kenar.', 22)
    img = raster(svg(b, W, H, bg=PAPER, defs=sets.HALO), W, H)
    finish(img).save(out)
    return img


if __name__ == '__main__':
    sheet(sys.argv[1])
