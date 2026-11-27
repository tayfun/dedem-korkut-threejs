"""Tasarım sayfası: Boğaç Han'ın kadrosu, kilitli paleti ve mekânları."""
import sys
from ..kit import *
from . import cast as B, sets as S
from ..deli_dumrul import cast2 as K, sets as S0
from ..tepegoz import cast as T
from .. import palette

PAPER = '#eadfc8'


def label(x, y, text, size=30, bold=False):
    return f'<text x="{x}" y="{y}" font-family="DejaVu Sans, sans-serif" font-size="{size}" {"font-weight=\"bold\"" if bold else ""} fill="{INK}">{text}</text>'


def sheet(out):
    W, H = 3600, 4300
    b = label(60, 80, 'BABASININ OKLADIĞI OĞUL — tasarım sayfası: kadro', 46, True)
    for i, (n, key) in enumerate((('çini', 'COBALT'), ('ten', 'SKIN'), ('ten gölge', 'SKIN_D'), ('ten ışık', 'SKIN_L'), ('fildişi', 'PALE'), ('yeşil', 'GREEN'), ('al', 'RED'), ('safran', 'GOLD'), ('deri', 'LEATHER'), ('kara', 'COAT'), ('toprak', 'EARTH'))):
        reseed('pal' + n)
        b += fill([(1900 + i * 150, 30), (2030 + i * 150, 30), (2030 + i * 150, 100), (1900 + i * 150, 100)], palette.get()[key], 1.5, smooth=False) + label(1900 + i * 150, 128, n, 20)
    row = lambda x0, y0, fn, names, dx, sc, ly: ''.join(group(fn(n), x0 + i * dx, y0, 0, sc) + label(x0 + i * dx - 50, y0 + ly, n, 22) for i, n in enumerate(names))
    b += label(60, 190, 'BOĞAÇ — on beşinde oğlan: al börk, çini mavisi kaftan', 30, True)
    b += group(B.bogac('neutral'), 300, 470, 0, 0.8) + row(760, 420, B.bogac_head, ['neutral', 'blink', 'anger', 'joy', 'shock', 'grief', 'fear'], 300, 0.74, 170)
    b += group(B.bogac('anger', armR=-150, poseR='fist'), 2950, 470, 0, 0.6) + label(2880, 800, 'yumruk', 22) + group(B.bogac('anger', armR=-120, sword_in_hand=True), 3330, 520, 0, 0.6) + label(3260, 850, 'kılıçlı', 22)
    b += label(60, 950, 'DİRSE HAN — kürek kara sakal, altın kuşaklı kara börk, al kaftan', 30, True)
    b += group(B.dirse('neutral'), 300, 1270, 0, 0.66) + row(760, 1240, B.dirse_head, ['neutral', 'anger', 'grief', 'shock', 'joy', 'scold'], 330, 0.62, 230)
    b += group(B.dirse('anger', armL=-80, bow_in_hand=True), 2760, 1300, 0, 0.5) + label(2690, 1650, 'katı yayıyla', 22) + group(B.dirse('grief', bound=True), 3080, 1300, 0, 0.5) + label(3010, 1650, 'bağlı', 22) + group(B.dirse('grief', kopuz_in_hand=True), 3400, 1300, 0, 0.5) + label(3330, 1650, 'kopuzla', 22)
    b += label(60, 1760, 'HATUN — al sivri başlık, duvak, iki örgü, ak kaftan', 30, True)
    b += group(B.hatun('neutral'), 280, 2060, 0, 0.66) + row(700, 2040, B.hatun_head, ['neutral', 'grief', 'scold', 'joy', 'fear'], 290, 0.66, 190)
    b += label(2150, 1760, 'BAYINDIR HAN, DEDE KORKUT, HIZIR', 30, True) + group(B.bayindir('scold', armR=-70), 2360, 2060, 0, 0.6) + group(K.dede('joy'), 2860, 2040, 0, 0.56) + group(B.hizir('joy'), 3340, 2080, 0, 0.6)
    b += label(60, 2480, 'KIRK NAMERT — kara kaftan, sivri külah, burma bıyık', 30, True)
    for i in range(3): b += group(B.namert(i, ['joy', 'scold', 'anger'][i], i == 2), 230 + i * 300, 2700, 0, 0.62)
    b += label(1150, 2480, 'YİĞİTLER, OĞLANLAR, KIZLAR', 30, True)
    for i in range(2): b += group(T.alp(i, 'neutral'), 1280 + i * 260, 2700, 0, 0.56)
    for i in range(2): b += group(K.boy(i, 'fear'), 1800 + i * 200, 2980, 0, 0.62)
    for i in range(3): b += group(B.kiz(i, ['neutral', 'grief', 'joy'][i]), 2200 + i * 200, 2700, 0, 0.56)
    b += group(B.kundak(), 2900, 2760, 0, 0.9) + label(2800, 2860, 'kundak', 22) + group(B.asik(), 2900, 2940, 0, 1.0) + label(2800, 3000, 'aşık', 22) + group(B.cicek(), 3200, 2800, 0, 1.0) + label(3140, 2860, 'dağ çiçeği', 22) + group(B.taht(), 3420, 2880, 0, 0.5) + label(3360, 3000, 'taht', 22)
    b += label(60, 3080, 'BOĞA, GEYİK, ATLILAR', 30, True)
    b += group(B.bull(), 330, 3270, 0, 0.6) + group(B.bull(True, snort=1), 880, 3270, 0, 0.6) + label(760, 3470, 'saldırırken', 22) + group(B.bull(head=False), 1380, 3270, 0, 0.5) + label(1280, 3470, 'başı kesilmiş', 22) + group(B.deer(), 1800, 3300, 0, 0.6)
    b += group(B.mounted(B.dirse('anger'), 'dirse', B.RED, 300, B.LEATHER), 2300, 3330, 0, 0.4) + group(B.mounted(B.bogac('joy'), 'bogac', B.COBALT, 250), 2760, 3330, 0, 0.4) + group(B.mounted(B.hizir('joy'), 'hizir', B.PALE, 280), 3260, 3330, 0, 0.4)
    b += label(60, 3560, 'MEKÂNLAR — toy (ak, kızıl, kara otağ), Dirse Han’ın obası, ak meydan, Kazılık Dağı, kâfir eline giden yol', 30, True)
    th = lambda x, body: f'<svg x="{x}" y="3600" width="340" height="604" viewBox="210 0 1080 1920">{body}</svg>'
    sets_ = [S.sky() + S.peaks() + S.toy() + group(B.dirse('anger'), 1180, 1250, 0, 0.5) + group(T.alp(0, 'scold'), 880, 1380, 0, 0.5),
             S.sky() + S.peaks() + S.oba() + group(B.dirse('anger'), 560, 1340, 0, 0.5) + group(B.hatun('scold'), 900, 1400, 0, 0.52),
             S.sky() + S.peaks() + S.meydan() + group(B.bull(True, snort=1), 980, 1420, 0, 0.6) + group(B.bogac('anger', armR=-150, poseR='fist'), 480, 1330, 0, 0.5),
             S.sky() + S.peaks() + S.dag() + group(B.deer(), 520, 1420, 0, 0.5) + group(B.mounted(B.dirse('anger'), 'dirse2', B.RED, 300, B.LEATHER), 1000, 1420, 0, 0.5),
             S.sky() + S.peaks() + S.yol() + group(B.dirse('grief', bound=True), 700, 1320, 0, 0.5) + group(B.namert(0, 'joy'), 420, 1420, 0, 0.5) + group(B.namert(2, 'joy', True), 980, 1440, 0, 0.5)]
    for i, body in enumerate(sets_): b += th(60 + i * 700, body)
    img = raster(svg(b, W, H, bg=PAPER, defs=S0.HALO), W, H)
    finish(img, grain=0).save(out)


if __name__ == '__main__':
    sheet(sys.argv[1])
