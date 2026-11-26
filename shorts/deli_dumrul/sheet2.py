"""İkinci tasarım sayfası: hikâyenin geri kalan kadrosu ve mekânları."""
import sys
from ..kit import *
from . import cast, cast2 as K, sets, sets2 as S2
from .sheet import label, PAPER


def thumb(x, y, w, body, vb='210 0 1080 1920'):
    return f'<svg x="{x}" y="{y}" width="{w}" height="{w * 1920 / 1080:.0f}" viewBox="{vb}">{body}</svg>'


def sheet(out):
    W, H = 3600, 3300
    b = label(60, 80, 'AZRAİL’E KILIÇ ÇEKEN ADAM — tasarım sayfası 2: aile, oba, mekânlar', 46, True)
    row = lambda x0, y0, fn, names, dx, sc, ly=150: ''.join(group(fn(n), x0 + i * dx, y0, 0, sc) + label(x0 + i * dx - 50, y0 + ly, n, 22) for i, n in enumerate(names))
    b += label(60, 170, 'DUHA KOCA (baba) — kambur, dev ak kaş, kanca burun, bele inen sakal, asa', 28, True)
    b += group(K.father('neutral'), 260, 470, 0, 0.74) + row(720, 330, K.father_head, ['neutral', 'blink', 'grief', 'refuse', 'fear'], 250, 0.6, 270)
    b += label(60, 900, 'ANA — yusyuvarlak, al yanak, baştan boyna örtü, altın pullar', 28, True)
    b += group(K.mother('neutral'), 300, 1180, 0, 0.7) + row(760, 1100, K.mother_head, ['neutral', 'blink', 'grief', 'refuse', 'shock'], 290, 0.6, 170)
    b += label(60, 1640, 'EŞ — ince uzun, yüksek altın başlık, duvak, iki uzun örgü', 28, True)
    b += group(K.wife('neutral'), 240, 2060, 0, 0.66) + row(640, 1960, K.wife_head, ['neutral', 'blink', 'grief', 'joy', 'fear'], 270, 0.6, 290)
    b += group(K.boy(0), 2000, 2420, 0, 0.8) + group(K.boy(1, 'fear'), 2200, 2420, 0, 0.8) + label(1930, 2470, 'iki oğlancık', 22)
    b += label(60, 2560, 'DEDE KORKUT — kocaman sarık, çatallı ak sakal, kopuz', 28, True)
    b += group(K.dede('joy'), 260, 2900, 0, 0.56) + row(640, 2840, K.dede_head, ['joy', 'neutral', 'blink'], 290, 0.52, 270)
    b += label(1500, 2560, 'OBA — yas tutanlar, ölü yiğit, bezirgân, akçe', 28, True)
    for i in range(3): b += group(K.mourner(i), 1560 + i * 250, 2930, 0, 0.72)
    b += group(K.dead_youth(), 2700, 2960, 0, 0.8) + group(K.traveller('fear'), 2400, 2860, 0, 0.6) + ''.join(K.coin(2860 + k * 40, 2760, 16) for k in range(4))
    b += label(2300, 170, 'AT ve DOĞAN', 28, True) + group(K.horse(False), 2620, 520, 0, 0.62) + group(K.horse(True), 3220, 520, 0, 0.62) + group(K.falcon(), 2950, 760, 0, 1.0) + label(3080, 760, 'ürkmüş', 22)
    # mekânlar
    b += label(2300, 900, 'MEKÂNLAR — gündüz: sıcak ışık, mavi-mor gölge; içeride tek ışık huzmesi', 28, True)
    tw = 300
    scenes = [('köprü, kuru çay', S2.day_sky() + S2.day_hills() + S2.bridge() + group(cast.dumrul('smug', armR=-40), 760, 880, 0, 0.42) + group(K.traveller('fear'), 420, 1010, 0, 0.36)),
              ('yas tutan oba', S2.day_sky() + S2.day_hills() + S2.oba() + group(K.dead_youth(), 780, 1690, 0, 0.9) + ''.join(group(K.mourner(i), 480 + i * 280, 1500, 0, 0.6) for i in range(3))),
              ('otağ içi', S2.tent_inside() + group(K.father('refuse'), 560, 1190, 0, 0.62) + group(K.mother('grief'), 980, 1200, 0, 0.6)),
              ('gece bozkırı', S2.steppe_night() + group(K.horse(True), 900, 1330, 0, 0.7)),
              ('ilahî buyruk: yalnızca ışık', S2.heaven() + group(cast.azrail('neutral', spread=0.7), 750, 1330, 0, 0.5))]
    for i, (n, body) in enumerate(scenes):
        x = 2300 + (i % 4) * (tw + 20); y = 940 + (i // 4) * 620
        b += thumb(x, y, tw, body) + label(x, y + tw * 1920 / 1080 + 30, n, 22)
    img = raster(svg(b, W, H, bg=PAPER, defs=sets.HALO), W, H)
    finish(img).save(out)


if __name__ == '__main__':
    sheet(sys.argv[1])
