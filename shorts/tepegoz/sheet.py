"""Tasarım sayfası: Basat ile Tepegöz'ün kadrosu ve kilitli paleti."""
import sys
from ..kit import *
from . import cast as T
from ..deli_dumrul import cast2 as K, sets as S0
from . import sets as S
from .. import palette

PAPER = '#eadfc8'


def label(x, y, text, size=30, bold=False):
    return f'<text x="{x}" y="{y}" font-family="DejaVu Sans, sans-serif" font-size="{size}" {"font-weight=\"bold\"" if bold else ""} fill="{INK}">{text}</text>'


def sheet(out):
    W, H = 3600, 4300
    b = label(60, 80, 'TEK GÖZLÜ DEVİ KÖR EDEN YİĞİT — tasarım sayfası: kadro', 46, True)
    for i, (n, key) in enumerate((('mavi', 'COBALT'), ('ten', 'SKIN'), ('ten gölge', 'SKIN_D'), ('ten ışık', 'SKIN_L'), ('krem', 'PALE'), ('yeşil', 'GREEN'), ('kırmızı', 'RED'), ('altın', 'GOLD'), ('deri', 'LEATHER'), ('gece', 'NIGHT'), ('toprak', 'EARTH'))):
        reseed('pal' + n)
        b += fill([(1900 + i * 150, 30), (2030 + i * 150, 30), (2030 + i * 150, 100), (1900 + i * 150, 100)], palette.get()[key], 1.5, smooth=False) + label(1900 + i * 150, 128, n, 20)
    row = lambda x0, y0, fn, names, dx, sc, ly: ''.join(group(fn(n), x0 + i * dx, y0, 0, sc) + label(x0 + i * dx - 50, y0 + ly, n, 22) for i, n in enumerate(names))
    b += label(60, 190, 'TEPEGÖZ — tek koca göz, azı dişleri, siğiller, post etek, dev çizmeler', 30, True)
    b += group(T.tepegoz('neutral'), 400, 560, 0, 0.62) + row(950, 440, T.tepegoz_head, ['neutral', 'sleep', 'laugh', 'anger', 'shock', 'blind', 'weep'], 370, 0.6, 230)
    b += group(T.tepegoz('laugh', child=True), 1000, 900, 0, 0.26) + label(930, 1130, 'çocukken', 22) + group(T.tepegoz('anger', armR=-150, poseR='fist'), 1500, 880, 0, 0.3) + label(1420, 1130, 'öfkeli', 22)
    b += group(T.boot_with_basat('fear'), 2100, 1120, 0, 0.5) + label(2020, 1160, 'çizmenin koncunda', 22) + group(T.ring(), 2500, 960, 0, 1.2) + label(2450, 1080, 'peri yüzüğü', 22)
    b += group(T.spit(True), 2820, 1040, 0, 0.9) + label(2760, 1160, 'kızgın şiş', 22) + group(T.chain_sword(0.3), 3150, 560, 0, 0.62) + label(3090, 1160, 'kınsız kılıç', 22) + group(T.dagger(), 2960, 1090, 0, 1.0)
    b += label(60, 1250, 'BASAT — aslan yelesi saç, al alın bağı, aslan postu, sadak', 30, True)
    b += group(T.basat('neutral'), 300, 1560, 0, 0.8) + row(760, 1500, T.basat_head, ['neutral', 'blink', 'anger', 'joy', 'shock', 'grief', 'fear'], 300, 0.72, 190)
    b += group(T.basat('anger', armL=-80, bow_in_hand=True), 2950, 1560, 0, 0.6) + label(2880, 1900, 'yay çekerken', 22) + group(T.arrow(), 3350, 1760, 0, 1.0) + group(T.arrow(True), 3350, 1860, 0, 1.0)
    b += label(60, 2020, 'ARUZ KOCA — uzun yüz, kabarık kalpak, mahmuz', 30, True) + group(T.aruz('neutral'), 260, 2330, 0, 0.62) + row(640, 2300, T.aruz_head, ['neutral', 'grief', 'fear', 'joy'], 300, 0.56, 200)
    b += label(1850, 2020, 'PERİ — kelebek kanat, yere dek ak saç', 30, True) + group(T.peri('neutral'), 2150, 2300, 0, 0.66) + group(T.peri('anger', flap=1), 2800, 2300, 0, 0.66)
    b += label(60, 2760, 'KONUR KOCA SARI ÇOBAN, YÜNLÜ KOCA, YAPAĞILI KOCA, KADINLAR, ALPLAR', 30, True)
    b += group(T.coban('neutral'), 260, 3000, 0, 0.6) + group(T.coban('fear', cloak=False), 620, 3000, 0, 0.6) + group(T.koca(0), 960, 3040, 0, 0.66) + group(T.koca(1, 'fear'), 1240, 3040, 0, 0.66)
    b += group(T.kadin('ana'), 1600, 3020, 0, 0.6) + group(T.kadin('dadi', T.GOLD, 'fear'), 1940, 3020, 0, 0.6)
    for i in range(3): b += group(T.alp(i, ['neutral', 'fear', 'anger'][i]), 2300 + i * 280, 3010, 0, 0.6)
    b += label(3080, 2020, 'ASLAN, KOYUN, KOÇ, YIĞINAK', 30, True) + group(T.lion(), 3250, 2250, 0, 0.5) + group(T.lion(True), 3250, 2520, 0, 0.5)
    b += group(T.sheep(), 3150, 2830, 0, 0.9) + group(T.sheep(True), 3420, 2830, 0, 0.9) + group(T.sheep(True, 'fear'), 3300, 3080, 0, 1.0) + group(T.yiginak(0.7), 3200, 3380, 0) + group(T.yiginak(0.7, True), 3460, 3380, 0)
    b += group(K.dede('joy'), 3380, 1420, 0, 0.3) + label(3300, 1290, 'Dede Korkut', 22)
    b += label(60, 3560, 'MEKÂNLAR — sazlık, Uzun Pınar, oba (gece baskını ve gündüz), Salahana Kayası, mağara', 30, True)
    th = lambda x, body: f'<svg x="{x}" y="3600" width="340" height="604" viewBox="210 0 1080 1920">{body}</svg>'
    sets_ = [S.sky() + S.peaks() + S.reeds() + group(T.lion(), 800, 1370, 0, 0.6) + S.reeds_fore(),
             S.sky() + S.peaks() + S.spring() + group(T.peri('neutral', flap=0.5), 760, 900, 0, 0.5) + group(T.coban('fear'), 420, 1290, 0, 0.5),
             S.sky(True) + S.peaks(True) + S.camp(True) + group(T.aruz('fear'), 700, 1300, 0, 0.5),
             S.sky() + S.peaks() + S.camp() + group(T.basat('grief'), 620, 1400, 0, 0.56) + group(T.kadin('ana'), 900, 1400, 0, 0.56),
             S.sky() + S.peaks() + S.rock() + group(T.tepegoz('laugh'), 660, 1090, 0, 0.5) + group(T.basat('anger', armL=-80, bow_in_hand=True), 260, 1420, 0, 0.42),
             S.cave() + S0.fire(780, 1510, 0.3) + group(T.tepegoz('sleep'), 1000, 1090, 0, 0.56) + group(T.koca(0), 470, 1330, 0, 0.5) + group(T.koca(1), 610, 1400, 0, 0.5) + group(T.sheep(), 150, 1420, 0, 0.9) + group(T.sheep(True), 300, 1470, 0, 0.9)]
    for i, body in enumerate(sets_): b += th(60 + i * 580, body)
    img = raster(svg(b, W, H, bg=PAPER, defs=S0.HALO), W, H)
    finish(img, grain=0).save(out)


if __name__ == '__main__':
    sheet(sys.argv[1])
