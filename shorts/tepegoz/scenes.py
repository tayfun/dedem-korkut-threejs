"""Basat ile Tepegöz — "Tek Gözlü Devi Kör Eden Yiğit": on iki sahnenin çekim listeleri.
Metin, onaylanan kısaltılmış anlatıdır (özgün site metninden seçilip sıkıştırılmış; uydurma yok)."""
import math, os
from ..kit import *
from . import cast as T, sets as S
from ..deli_dumrul import cast as C0, cast2 as K, sets as S0, film as F, engine as E, voice as V
from ..deli_dumrul.engine import lerp, ease, spring, at
from ..deli_dumrul.scenes import fx_impact, fx_rays, fx_pale, fx_red, fx_big, fx_stars, both

ORDER = ['aslan', 'peri', 'dogum', 'buyume', 'savas', 'kesim', 'karar', 'oklar', 'sis', 'koc', 'kilic', 'son']
TITLES = {s: f'{i + 1}. {s}' for i, s in enumerate(ORDER)}

# ----------------------------------------------------------------------------- oyuncu türleri
g = lambda p, k, d=0: p.get(k, d)


def _kepenek(p, e):
    reseed('kepenek-prop')
    kep = [(-190, -40), (190, -40), (210, 60), (150, 150), (0, 120), (-150, 150), (-210, 60)]
    return blob(kep, T.PALE, 4.0, 1.8) + ticks(kep, 40, (6, 12), 1.5, 0.5, 2.0)


E.KINDS.update({
    'tepegoz': (712, lambda p, e: T.tepegoz(e, g(p, 'armL', 10), g(p, 'armR', -10), g(p, 'hr'), g(p, 'poseR', 'open'), g(p, 'child', False))),
    'basat': (480, lambda p, e: T.basat(e, g(p, 'armL', 10), g(p, 'armR', -10), g(p, 'hr'), g(p, 'poseR', 'open'), g(p, 'bow', False), g(p, 'sword', False))),
    'aruz': (602, lambda p, e: T.aruz(e, g(p, 'armL', 12), g(p, 'armR', -12), g(p, 'hr'))),
    'peri': (470, lambda p, e: T.peri(e, g(p, 'armL', 20), g(p, 'armR', -20), g(p, 'hr'), 0.5 + 0.5 * math.sin(F.NOW * 7))),
    'coban': (522, lambda p, e: T.coban(e, g(p, 'armL', 10), g(p, 'armR', -10), g(p, 'hr'), g(p, 'cloak', True))),
    'koca0': (420, lambda p, e: T.koca(0, e)), 'koca1': (420, lambda p, e: T.koca(1, e)),
    'kadin': (470, lambda p, e: T.kadin(g(p, 'who', 'ana'), g(p, 'col', None), e, g(p, 'armL', 14), g(p, 'armR', -14), g(p, 'hr'))),
    'alp0': (480, lambda p, e: T.alp(0, e)), 'alp1': (480, lambda p, e: T.alp(1, e)), 'alp2': (480, lambda p, e: T.alp(2, e)),
    'lion': (250, lambda p, e: T.lion(g(p, 'roar', False))),
    'sheep': (130, lambda p, e: T.sheep()), 'ram': (130, lambda p, e: T.sheep(True, g(p, 'peek', None))),
    'yiginak': (0, lambda p, e: T.yiginak(g(p, 'k', 1.0), g(p, 'cracked', False))),
    'boot': (0, lambda p, e: T.boot_with_basat(e, g(p, 'cut', False))),
    'chain': (0, lambda p, e: T.chain_sword(0.5 + 0.5 * math.sin(F.NOW * 6))),
    'spit': (0, lambda p, e: T.spit(g(p, 'hot', True))), 'ring': (0, lambda p, e: T.ring()), 'dagger': (0, lambda p, e: T.dagger()),
    'bebek': (0, lambda p, e: T.bebek(e, math.sin(F.NOW * 9) if p.get('crawl') else 0)), 'yumurta': (0, lambda p, e: T.yumurta(max(0.0, g(p, 'open', 0.0)))),
    'arrow': (0, lambda p, e: T.arrow(g(p, 'broken', False))), 'sword': (0, lambda p, e: C0.sword()), 'kepenek': (0, _kepenek),
})
E.STILL += ['yumurta', 'lion', 'sheep', 'ram', 'yiginak', 'boot', 'chain', 'spit', 'ring', 'dagger', 'arrow', 'sword', 'kepenek', 'alp']
E.HEADS += ['tepegoz', 'basat', 'aruz', 'peri', 'coban', 'kadin']
E.TEMPO.update({'tepegoz': (1.3, 3.4), 'basat': (2.6, 5.2), 'aruz': (1.4, 3.6), 'peri': (2.0, 4.5), 'coban': (1.8, 4.2), 'kadin': (2.0, 4.5), 'lion': (1.8, 4.5)})
E.EXTRA_MOTION.update({
    'peri': lambda p, t, i: (0, 14 * math.sin(t * 2.2 + i), 2 * math.sin(t * 1.3)),                 # havada süzülür
    'sheep': lambda p, t, i: (0, -abs(math.sin(t * 5 + i * 2)) * 8, 3 * math.sin(t * 2.5 + i)),      # kıpır kıpır
    'ram': lambda p, t, i: (0, -abs(math.sin(t * 5 + i * 2)) * 6, 2 * math.sin(t * 2.5 + i)),
    'lion': lambda p, t, i: (0, 3 * math.sin(t * 1.6), 0),
    'koca0': lambda p, t, i: (0, 0, 1.5 * math.sin(t * 9)), 'koca1': lambda p, t, i: (0, 0, 1.5 * math.sin(t * 10 + 1)),   # korkudan titrerler
    'tepegoz': lambda p, t, i: (0, 6 * math.sin(t * 1.5), 0),                                         # ağır ağır solur
    'yiginak': lambda p, t, i: (0, 0, 2 * math.sin(t * 3)),
})


def _fire(x, y):
    return lambda t: [(y + 20, S0.fire(x, y, t * 2.3) + S0.embers(x, y - 170, t * 1.5))]


E.SETS.update({
    'reeds': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.reeds, fore=S.reeds_fore, life=lambda t: [(-10, E.birds(t, 5))]),
    'spring': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.spring, life=lambda t: [(-10, E.birds(t, 4))]),
    'camp': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.camp, life=lambda t: [(-10, E.birds(t, 3)), (5000, E.dust(t, 1560, 5))]),
    'campn': dict(bg=S.NIGHT, sky=lambda: S.sky(True), back=lambda: S.peaks(True), mid=lambda: S.camp(True), life=_fire(760, 1560)),
    'rock': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.rock, life=lambda t: [(-10, E.birds(t, 7, 420)), (5000, E.dust(t, 1540, 6))]),
    'cave': dict(bg=S.NIGHT, sky=None, back=None, mid=S.cave, life=_fire(780, 1510)),
})


# ----------------------------------------------------------------------------- ekran uzayı çizimleri
def fx_arrows(n=6):
    """Kırılıp savrulan oklar."""
    def fx(u):
        reseed('fx-arrows')
        spec = [(R(120, 960), R(520, 1100), R(-40, 40), R(0.0, 0.5)) for _ in range(n)]
        s = ''
        for x, y, r, t0 in spec:
            k = max(0.0, min(1.0, (u - t0) / 0.35))
            if k > 0: s += at(T.arrow(True), x + k * 80, y + k * k * 420, 2.2, r + k * 160)
        return s
    return fx


def fx_blood(x=540, y=800):
    def fx(u):
        reseed('fx-blood')
        k = ease(min(1, u * 1.6)); s = ''
        for _ in range(9):
            a = R(-2.6, -0.5); d = R(80, 320) * k
            s += fill(ellipse(x + math.cos(a) * d, y + math.sin(a) * d + 260 * u * u, R(10, 22), R(14, 30), 7, 0.2), T.RED, 0.6)
        return s
    return fx


def fx_zzz(x=300, y=700):
    def fx(u):
        s = ''
        for i in range(3):
            k = (F.NOW * 0.5 + i / 3) % 1; zx, zy, sz = x - k * 120, y - k * 260, 26 + k * 44
            s += ink([(zx, zy), (zx + sz, zy), (zx, zy + sz), (zx + sz, zy + sz)], 7, col=T.PALE, op=1 - k, wob=0, taper=(0, 0), smooth=False)
        return s
    return fx


def fx_shake_red():
    """Göz kör olurken: kızıl parlama."""
    return lambda u: f'<rect width="1080" height="1920" fill="{T.RED}" opacity="{0.5 * math.exp(-u * 5):.2f}"/>'


# ----------------------------------------------------------------------------- yerler
CAMP_B = dict(x=560, y=1230, s=0.5)            # obada Basat
CAMP_A = dict(x=900, y=1170, s=0.5)            # obada Aruz
RK_T = dict(x=760, y=1000, s=0.5)              # kayanın önünde Tepegöz
RK_B = dict(x=280, y=1240, s=0.46)             # kayanın önünde Basat
CV_T = dict(x=1060, y=1010, s=0.5)             # mağarada ayakta Tepegöz
CV_TL = dict(x=1000, y=1420, s=0.5, rot=-90, z=1500)   # mağarada yatan Tepegöz (baş solda)
CV_B = dict(x=520, y=1260, s=0.46)             # mağarada Basat
SP_C = dict(x=380, y=1250, s=0.5)              # pınarda çoban
SCENES = {}

SCENES['aslan'] = [
    dict(n='Geniş: gece baskını', c='Bir gece Oğuz’un üstüne|yağı geldi;', set='campn', cam=[(760, 1040, 1.0), (760, 1060, 1.15)],
         a=[('aruz', dict(x=560, y=1150, s=0.5, e='neutral'), dict(e='fear', armL=80, armR=-80), 0.3), ('alp0', dict(x=1060, y=1260, s=0.5, e='fear')), ('kadin', dict(x=300, y=1290, s=0.5, e='fear'))]),
    dict(n='Geniş: el göçer', c='el ürktü,|göçtü.', set='campn', cam=[(760, 1100, 1.1), (900, 1100, 1.1)],
         a=[('aruz', dict(x=560, y=1150, s=0.5, e='fear', walk=True, flip=False), dict(x=1500, glide=True), 0.0), ('alp0', dict(x=900, y=1260, s=0.5, e='fear', walk=True), dict(x=1800, glide=True), 0.0),
            ('kadin', dict(x=300, y=1290, s=0.5, e='fear', walk=True), dict(x=1300, glide=True), 0.0)]),
    dict(n='Yakın: oğlancık düşer', c='Kaçarken Aruz Koca’nın|oğlancığı düştü.', set='campn', cam=[(640, 1600, 2.0), (660, 1620, 2.3)], punch=True,
         a=[('bebek', dict(x=900, y=1300, s=0.42, e='fear', rot=-40), dict(x=640, y=1660, rot=0, land=0.6, arc=120), 0.1)]),
    dict(n='Geniş: aslan bulur', c='Onu bir aslan buldu,|götürüp besledi.', set='reeds', cam=[(760, 1250, 1.2), (780, 1260, 1.4)],
         a=[('lion', dict(x=1400, y=1300, s=0.6, walk=True), dict(x=900, glide=True), 0.0), ('bebek', dict(x=440, y=1420, s=0.42, e='fear', crawl=True), dict(x=600, e='joy', glide=True), 0.0)]),
    dict(n='Geniş: beyler yatağı basar', c='Zaman geçti; beyler|aslan yatağını bastılar,', set='reeds', cam=[(820, 1250, 1.1), (760, 1250, 1.25)],
         a=[('lion', dict(x=470, y=1290, s=0.6, flip=True), dict(roar=True), 0.4), ('basat', dict(x=790, y=1300, s=0.4, e='anger', rot=10)),
            ('alp0', dict(x=1700, y=1260, s=0.5, e='anger', flip=True, walk=True), dict(x=1010, glide=True), 0.0), ('alp2', dict(x=1900, y=1300, s=0.5, e='anger', flip=True, walk=True), dict(x=1150, glide=True), 0.0)]),
    dict(n='İkili: oğlanı getirirler', c='oğlanı tutup getirdiler.', set='camp', cam=[(740, 1180, 1.4), (760, 1180, 1.5)],
         a=[('alp0', dict(x=200, y=1250, s=0.5, e='neutral', walk=True), dict(x=520, glide=True), 0.0), ('basat', dict(x=320, y=1270, s=0.44, e='anger', walk=True, shake=0.6), dict(x=640, glide=True), 0.0),
            ('aruz', dict(CAMP_A, x=980, e='grief'), dict(e='joy', armL=70, armR=-70), 0.5)]),
    dict(n='İkili: Dede Korkut ad verir', c='Dedem Korkut ad verdi:|“Senin adın|Basat olsun.”', set='camp', cam=[(700, 1160, 1.5), (700, 1150, 1.7)], hold=0.5,
         a=[('dede', dict(x=900, y=1150, s=0.5, e='joy', flip=True)), ('basat', dict(CAMP_B, x=540, e='anger'), dict(e='joy'), 0.55)], fx=fx_rays(0.3)),
]

SCENES['peri'] = [
    dict(n='Geniş: çoban pınarda', c='Aruz’un çobanı|Uzun Pınar’da', set='spring', cam=[(700, 1150, 1.0), (720, 1180, 1.15)],
         a=[('coban', dict(SP_C, e='neutral')), ('sheep', dict(x=160, y=1500, s=0.9)), ('ram', dict(x=330, y=1580, s=0.9)), ('sheep', dict(x=560, y=1640, s=0.9, flip=True))]),
    dict(n='Geniş: peri kızları', c='peri kızlarını gördü;', set='spring', cam=[(800, 950, 1.2), (820, 900, 1.3)],
         a=[('peri', dict(x=640, y=820, s=0.42, e='joy')), ('peri', dict(x=900, y=760, s=0.46, e='joy')), ('peri', dict(x=1150, y=840, s=0.4, e='joy', flip=True)), ('coban', dict(SP_C, e='neutral'), dict(e='shock'), 0.3)]),
    dict(n='Geniş: kepeneğini atar', c='kepeneğini üzerlerine attı,', set='spring', cam=[(760, 1000, 1.15), (780, 1000, 1.2)],
         a=[('coban', dict(SP_C, e='anger', cloak=True, armR=-10), dict(cloak=False, armR=-150), 0.15), ('peri', dict(x=640, y=820, s=0.42, e='joy'), dict(e='fear', y=300, x=520), 0.45),
            ('peri', dict(x=1150, y=840, s=0.4, e='joy', flip=True), dict(e='fear', y=300, x=1300), 0.45), ('peri', dict(x=900, y=780, s=0.46, e='joy'), dict(e='fear', y=1100), 0.5),
            ('kepenek', dict(x=420, y=1200, s=0.5, z=3000), dict(x=900, y=1000, arc=300), 0.15)]),
    dict(n='İkili: birini tutar', c='birini tuttu,|onunla yattı.', set='spring', cam=[(760, 1120, 1.6), (780, 1110, 1.9)],
         a=[('peri', dict(x=900, y=1250, s=0.46, e='fear', shake=0.8, armL=20, armR=-20, z=2000)), ('kepenek', dict(x=900, y=1215, s=0.4, rot=4, z=2500)),
            ('coban', dict(SP_C, x=640, e='anger', cloak=False, armR=-10, z=3000), dict(armR=-78, x=700), 0.15)]),
    dict(n='Geniş: peri havalanır', c='Peri kanat vurup uçtu:', set='spring', cam=[(800, 1100, 1.3), (820, 880, 1.3)], punch=True,
         a=[('coban', dict(SP_C, x=520, e='neutral', cloak=False)), ('peri', dict(x=860, y=1150, s=0.46, e='anger'), dict(y=720), 0.1)]),
    dict(n='Yakın: peri', c='“Çoban, yıl tamam olunca|bende emanetin var,|gel al.', set='spring', cam=[(860, 650, 2.3), (860, 646, 2.6)], blur=True,
         a=[('peri', dict(x=860, y=720, s=0.46, e='scold'))]),
    dict(n='İkili: lanet', c='Ama Oğuz’un başına|zeval getirdin.”', set='spring', cam=[(700, 980, 1.3), (700, 1000, 1.2)], hold=0.5,
         a=[('peri', dict(x=900, y=720, s=0.46, e='scold', armL=20), dict(armL=110), 0.15), ('coban', dict(SP_C, x=480, e='neutral', cloak=False), dict(e='fear'), 0.4)]),
]

SCENES['dogum'] = [
    dict(n='Geniş: yığınak', c='Zaman geçti; pınarda|bir yığınak yatıyordu.', set='spring', cam=[(700, 1250, 1.2), (720, 1300, 1.4)],
         a=[('yumurta', dict(x=720, y=1570, s=0.8))]),
    dict(n='İkili: Aruz teper', c='Aruz Koca tepti;', set='spring', cam=[(600, 1300, 1.4), (620, 1320, 1.5)], punch=True,
         a=[('yumurta', dict(x=780, y=1570, s=0.8, rot=0), dict(rot=7), 0.45), ('aruz', dict(x=300, y=1230, s=0.5, e='anger'), dict(rot=-16, x=430), 0.25)]),
    dict(n='Eşya: yumurta gibi yarılır', c='yığınak yarıldı.', set='spring', cam=[(780, 1400, 1.7), (780, 1390, 1.8)], punch=True,
         a=[('tepegoz', dict(x=780, y=1560, s=0.22, e='blink', child=True, z=1400)), ('yumurta', dict(x=780, y=1570, s=0.8, open=0.0, z=1500), dict(open=1.0), 0.12)], fx=fx_impact(540, 820)),
    dict(n='Geniş: içinden oğlan çıkar', c='İçinden bir oğlan çıktı:', set='spring', cam=[(700, 1320, 1.4), (700, 1300, 1.5)],
         a=[('yumurta', dict(x=780, y=1570, s=0.8, open=1.0, z=1300)), ('tepegoz', dict(x=780, y=1560, s=0.22, e='blink', child=True, z=1400), dict(e='neutral', s=0.25, y=1540), 0.15),
            ('aruz', dict(x=380, y=1230, s=0.5, e='neutral'), dict(e='shock'), 0.3)]),
    dict(n='Çok yakın: tek göz', c='gövdesi adam,|tepesinde bir gözü var.', set='spring', cam=[(780, 1450, 3.4), (780, 1446, 4.0)], blur=True,
         a=[('tepegoz', dict(x=780, y=1540, s=0.25, e='neutral', child=True))]),
    dict(n='Geniş: Aruz alır, Basat’la büyür', c='Aruz onu aldı,|oğlu Basat’la besledi.', set='camp', cam=[(760, 1200, 1.3), (760, 1220, 1.45)], hold=0.4,
         a=[('aruz', dict(CAMP_A, x=760, e='joy')), ('tepegoz', dict(x=1010, y=1330, s=0.24, e='laugh', child=True)), ('basat', dict(x=520, y=1340, s=0.3, e='neutral'), dict(e='fear'), 0.6)]),
]

DADI = dict(x=640, y=1230, s=0.5, who='dadi', col=T.GOLD)
SCENES['buyume'] = [
    dict(n='İkili: dadı emzirir', c='Tepegöz dadısını bir sordu|sütünü aldı,', set='camp', cam=[(660, 1220, 1.6), (660, 1220, 1.8)],
         a=[('kadin', dict(DADI, e='joy'), dict(e='fear'), 0.5), ('tepegoz', dict(x=660, y=1300, s=0.17, e='laugh', child=True, z=3000))]),
    dict(n='Yakın: benzi atar', c='iki sordu|kanını aldı,', set='camp', cam=[(650, 1150, 2.2), (650, 1150, 2.5)], blur=True,
         a=[('kadin', dict(DADI, e='fear', shake=1)), ('tepegoz', dict(x=660, y=1300, s=0.17, e='laugh', child=True, z=3000))], fx=fx_pale()),
    dict(n='Geniş: dadı yere serilir', c='üç sordu|canını aldı.', set='camp', cam=[(700, 1320, 1.4), (720, 1380, 1.6)],
         a=[('kadin', dict(DADI, e='fear'), dict(e='blink', rot=-86, y=1560, x=520, land=0.6, arc=40), 0.15), ('tepegoz', dict(x=860, y=1380, s=0.2, e='laugh', child=True, z=3000))]),
    dict(n='Geniş: oğlancıkları kovalar', c='Oğlancıkların kiminin burnunu,|kiminin kulağını yedi.', set='camp', cam=[(700, 1340, 1.3), (900, 1340, 1.3)],
         a=[('tepegoz', dict(x=260, y=1250, s=0.32, e='laugh', child=True, walk=True, armL=70, armR=-70), dict(x=760, glide=True), 0.0),
            ('boy0', dict(x=760, y=1620, s=0.5, e='fear', walk=True), dict(x=1300, glide=True), 0.0), ('boy1', dict(x=940, y=1560, s=0.5, e='fear', walk=True), dict(x=1500, glide=True), 0.0)]),
    dict(n='İkili: Aruz kovar', c='Aruz onu evinden kovdu.', set='camp', cam=[(700, 1180, 1.4), (640, 1180, 1.4)],
         a=[('aruz', dict(CAMP_A, e='anger', flip=True, armL=12), dict(armL=96), 0.15), ('tepegoz', dict(x=560, y=1160, s=0.4, e='anger', flip=True, walk=True), dict(x=60, glide=True), 0.3)]),
    dict(n='İkili: peri anası', c='Peri anası parmağına|bir yüzük geçirdi:', set='spring', cam=[(740, 1050, 1.3), (760, 1050, 1.45)],
         a=[('tepegoz', dict(x=560, y=1040, s=0.46, e='neutral', armR=-10), dict(armR=-70), 0.2), ('peri', dict(x=1000, y=900, s=0.46, e='neutral', armL=20), dict(armL=80, x=940), 0.2)]),
    dict(n='Eşya: yüzük', c='“Oğul, sana ok batmasın,|tenini kılıç kesmesin.”', set='spring', cam=[(760, 1100, 2.0), (760, 1100, 2.2)], blur=True, hold=0.4,
         a=[], fx=fx_big(T.ring, 540, 860, 4.2, 0, 10)),
]

SCENES['savas'] = [
    dict(n='Geniş: dağda Tepegöz', c='Tepegöz yüce bir dağa vardı,|yol kesti,', set='rock', cam=[(760, 1000, 1.0), (760, 1040, 1.2)],
         a=[('tepegoz', dict(RK_T, x=200, e='anger', walk=True), dict(x=760, glide=True), 0.0)]),
    dict(n='Yakın: adam yer', c='Oğuz’dan adam|yemeye başladı.', set='rock', cam=[(800, 900, 1.9), (800, 900, 2.1)], blur=True,
         a=[('tepegoz', dict(RK_T, e='laugh', armR=-120, poseR='fist', shake=0.6)), ('alp1', dict(x=990, y=900, s=0.2, e='fear', rot=170, shake=2, z=3000))]),
    dict(n='Geniş: Oğuz üstüne varır', c='Oğuz üstüne vardı;', set='rock', cam=[(600, 1150, 1.15), (640, 1150, 1.25)],
         a=[('tepegoz', dict(RK_T, x=900, e='anger', flip=True)), ('alp0', dict(x=-100, y=1260, s=0.48, e='anger', walk=True), dict(x=420, glide=True), 0.0),
            ('alp1', dict(x=-240, y=1300, s=0.48, e='anger', walk=True), dict(x=270, glide=True), 0.0), ('alp2', dict(x=-380, y=1240, s=0.48, e='anger', walk=True), dict(x=570, glide=True), 0.0)]),
    dict(n='Eşya: oklar kırılır', c='ok batmadı,|kılıç kesmedi.', set='rock', cam=[(900, 1130, 2.4), (900, 1130, 2.6)], blur=True,
         a=[('tepegoz', dict(RK_T, x=900, e='laugh', flip=True))], fx=fx_arrows(8)),
    dict(n='İkili: Aruz’a vurur', c='Aruz Koca’ya|kan kusturdu;', set='rock', cam=[(640, 1120, 1.4), (600, 1140, 1.5)], punch=True,
         a=[('tepegoz', dict(RK_T, x=900, e='anger', flip=True, armL=10), dict(armL=110, x=820), 0.1), ('aruz', dict(x=440, y=1190, s=0.5, e='anger'), dict(e='shock', rot=-84, x=300, y=1480, arc=90, land=0.8), 0.25)], fx=fx_impact(430, 800)),
    dict(n='Yakın: Kıyan Selçuk', c='oğlu Kıyan Selçuk’un|ödü yarıldı.', set='rock', cam=[(300, 1260, 1.9), (300, 1380, 2.0)], blur=True,
         a=[('alp1', dict(x=300, y=1280, s=0.5, e='fear', shake=1), dict(e='blink', rot=88, y=1520, land=0.75, arc=40, shake=0), 0.35)]),
    dict(n='Geniş: yedi kez kaçar, yedi kez önünü alır', c='Oğuz yedi kez kaçtı;|Tepegöz yedi kez|önünü aldı.', set='rock', cam=[(800, 1150, 1.05), (620, 1150, 1.05)], hold=0.4,
         a=[('alp0', dict(x=1000, y=1260, s=0.48, e='fear', flip=True, walk=True), dict(x=640, glide=True), 0.0), ('alp2', dict(x=1160, y=1300, s=0.48, e='fear', flip=True, walk=True), dict(x=800, glide=True), 0.0),
            ('tepegoz', dict(RK_T, x=1500, y=1100, e='laugh'), dict(x=300, arc=520, land=0.8), 0.25)]),
]

SCENES['kesim'] = [
    dict(n='İkili: Dede elçi gider', c='Dedem Korkut’u gönderdiler,|kesim verdiler:', set='rock', cam=[(640, 1100, 1.2), (660, 1100, 1.3)],
         a=[('tepegoz', dict(RK_T, x=880, e='neutral', flip=True)), ('dede', dict(x=360, y=1220, s=0.44, e='neutral'), dict(hr=-10), 0.3)]),
    dict(n='Geniş: iki adam, beş yüz koyun', c='günde iki adam ile|beş yüz koyun.', set='rock', cam=[(560, 1300, 1.2), (760, 1300, 1.2)],
         a=[('koca0', dict(x=-100, y=1290, s=0.5, e='fear', walk=True), dict(x=760, glide=True), 0.0), ('koca1', dict(x=-240, y=1340, s=0.5, e='fear', walk=True), dict(x=600, glide=True), 0.0)]
           + [('sheep', dict(x=-380 - i * 150, y=1500 + (i % 3) * 70, s=0.8, flip=True, walk=True), dict(x=900 - i * 150, glide=True), 0.0) for i in range(6)]),
    dict(n='İkili: sıra kalan oğula gelir', c='Sıra Kapak Kan’ın|kalan oğluna geldi.', set='camp', cam=[(700, 1200, 1.5), (720, 1200, 1.6)],
         a=[('kadin', dict(x=560, y=1230, s=0.5, e='fear', armR=-60)), ('alp2', dict(x=800, y=1220, s=0.46, e='neutral'), dict(e='fear', x=980), 0.3), ('alp0', dict(x=1180, y=1230, s=0.5, e='neutral', flip=True))]),
    dict(n='Geniş: Basat’a varır', c='Anası ağladı,|akından dönen Basat’a vardı:', set='camp', cam=[(760, 1200, 1.2), (800, 1200, 1.3)],
         a=[('basat', dict(x=1600, y=1230, s=0.5, e='neutral', flip=True, walk=True, sword=True, poseR='grip'), dict(x=1040, glide=True), 0.0), ('kadin', dict(x=300, y=1240, s=0.5, e='grief', walk=True), dict(x=780, glide=True), 0.2)]),
    dict(n='Yakın: “bana medet!”', c='“Hanım Basat,|bana medet!', set='camp', cam=[(780, 1160, 2.2), (780, 1156, 2.5)], punch=True, blur=True,
         a=[('kadin', dict(x=780, y=1240, s=0.5, e='grief', shake=0.8, armL=14, armR=-14), dict(armL=130, armR=-130), 0.1)]),
    dict(n='İkili: haber', c='Kardeşin Kıyan Selçuk|can verdi.”', set='camp', cam=[(900, 1200, 1.6), (920, 1200, 1.7)],
         a=[('kadin', dict(x=780, y=1240, s=0.5, e='grief')), ('basat', dict(x=1040, y=1230, s=0.5, e='neutral', flip=True), dict(e='shock'), 0.35)]),
    dict(n='Yakın: Basat ağlar', c='Basat’ın gözleri|yaşla doldu.', set='camp', cam=[(1040, 1150, 2.6), (1040, 1146, 3.0)], blur=True, hold=0.4,
         a=[('basat', dict(x=1040, y=1230, s=0.5, e='grief', flip=True, hr=10))]),
]

SCENES['karar'] = [
    dict(n='Geniş: karar', c='“Kardeşim uğruna|Tepegöz’le buluşurum” dedi.', set='camp', cam=[(700, 1180, 1.4), (700, 1170, 1.6)], punch=True,
         a=[('basat', dict(CAMP_B, e='grief'), dict(e='anger', armR=-160, poseR='fist'), 0.15), ('aruz', dict(CAMP_A, e='fear', flip=True))]),
    dict(n='Yakın: baba ağlar', c='Babası ağladı:|“Oğul, ocağımı ıssız koma,|varma.”', set='camp', cam=[(900, 1060, 2.0), (900, 1056, 2.3)], blur=True,
         a=[('aruz', dict(CAMP_A, e='grief', flip=True, shake=0.5, armL=12, armR=-12), dict(armL=90, armR=-90), 0.2)]),
    dict(n='Yakın: dinlemez', c='Basat dinlemedi;', set='camp', cam=[(560, 1150, 2.3), (560, 1146, 2.5)], blur=True,
         a=[('basat', dict(CAMP_B, e='anger'), dict(e='refuse', hr=-12), 0.25)]),
    dict(n='Geniş: kılıç kuşanır, yola çıkar', c='kılıcını kuşandı,|helalleşti.', set='camp', cam=[(700, 1200, 1.3), (620, 1200, 1.2)], hold=0.4,
         a=[('basat', dict(CAMP_B, e='anger', sword=True, poseR='grip', armR=-10), dict(armR=-150), 0.1), ('aruz', dict(CAMP_A, e='grief', flip=True, armL=90, armR=-90)), ('kadin', dict(x=1220, y=1250, s=0.5, e='grief'))]),
]

SCENES['oklar'] = [
    dict(n='Geniş: Salahana Kayası', c='Salahana Kayası’na geldi.', set='rock', cam=[(640, 1050, 1.05), (640, 1100, 1.15)],
         a=[('tepegoz', dict(RK_T, x=880, e='neutral', flip=True)), ('basat', dict(RK_B, x=-100, e='anger', walk=True), dict(x=280, glide=True), 0.0)]),
    dict(n='Geniş: ok atar', c='Tepegöz’ün bağrına|ok attı;', set='rock', cam=[(600, 1150, 1.3), (640, 1150, 1.3)],
         a=[('tepegoz', dict(RK_T, x=880, e='neutral', flip=True)), ('basat', dict(RK_B, e='anger', bow=True, armL=-30), dict(armL=-86), 0.1),
            ('arrow', dict(x=360, y=1100, s=0.7, rot=-22, z=3000), dict(x=830, y=960, glide=True), 0.45)]),
    dict(n='Eşya: ok paralanır', c='ok paralandı.', set='rock', cam=[(880, 980, 2.4), (880, 980, 2.6)], punch=True, blur=True,
         a=[('tepegoz', dict(RK_T, x=880, e='neutral', flip=True)), ('arrow', dict(x=840, y=960, s=0.9, broken=True, z=3000), dict(y=1100, x=800, rot=40, arc=120), 0.1)], fx=fx_impact(500, 880)),
    dict(n='İkili: güler, yakalar', c='Tepegöz kah kah güldü;|Basat’ı tuttu,', set='rock', cam=[(580, 1100, 1.4), (580, 1020, 1.5)], punch=True,
         a=[('tepegoz', dict(RK_T, x=860, e='laugh', flip=True, armL=10, shake=0.6), dict(armL=60, x=700), 0.45), ('basat', dict(RK_B, x=300, e='fear', bow=True, z=3000), dict(x=480, y=940, rot=24, shake=1), 0.55)]),
    dict(n='Eşya: çizmenin koncunda', c='çizmesinin koncuna soktu:', set='rock', cam=[(700, 1300, 1.8), (700, 1300, 2.0)], blur=True,
         a=[('boot', dict(x=640, y=1560, s=0.9, e='fear', shake=0.4))]),
    dict(n='Geniş: kocalara buyurur', c='“Bre kocalar,|ikindi vakti bunu çevirin,|yiyeyim.”', set='cave', cam=[(740, 1150, 1.1), (740, 1180, 1.2)], hold=0.4,
         a=[('tepegoz', dict(CV_T, x=980, e='laugh', flip=True, armL=10), dict(armL=80), 0.2), ('koca0', dict(x=420, y=1300, s=0.5, e='fear')), ('koca1', dict(x=590, y=1370, s=0.5, e='fear'))]),
]

SCENES['sis'] = [
    dict(n='Geniş: Tepegöz uyur', c='Tepegöz uyudu.', set='cave', cam=[(820, 1250, 1.2), (840, 1280, 1.3)],
         a=[('tepegoz', dict(CV_TL, e='sleep')), ('koca0', dict(x=380, y=1300, s=0.5, e='fear')), ('koca1', dict(x=540, y=1370, s=0.5, e='fear'))], fx=fx_zzz(560, 900)),
    dict(n='Eşya: çizmeyi yarar', c='Basat hançeriyle|çizmeyi yardı, çıktı.', set='cave', cam=[(1200, 1400, 1.9), (1200, 1380, 2.1)], punch=True, blur=True,
         a=[('boot', dict(x=1230, y=1640, s=0.8, e='fear'), dict(cut=True, e='anger'), 0.35)]),
    dict(n='İkili: kocalar söyler', c='Kocalar, “Gözünden başka yerinde|et yoktur” dediler.', set='cave', cam=[(480, 1260, 1.7), (500, 1260, 1.85)],
         a=[('koca0', dict(x=380, y=1300, s=0.5, e='fear')), ('koca1', dict(x=540, y=1370, s=0.5, e='fear')), ('basat', dict(x=690, y=1290, s=0.46, e='anger', flip=True))]),
    dict(n='Yakın: şişi kızdırır', c='Basat şişi ocakta|kızdırdı;', set='cave', cam=[(740, 1380, 1.8), (740, 1370, 2.0)],
         a=[('basat', dict(x=540, y=1280, s=0.46, e='anger', armR=-70, poseR='grip')), ('spit', dict(x=700, y=1470, s=0.6, rot=64, hot=False, z=1500), dict(hot=True), 0.5)]),
    dict(n='Geniş: sıçrar', c='Tepegöz’ün gözüne|öyle bastı ki', set='cave', cam=[(820, 1300, 1.3), (860, 1320, 1.5)], punch=True,
         a=[('tepegoz', dict(CV_TL, e='sleep')), ('basat', dict(x=520, y=1260, s=0.46, e='anger', armR=-150, poseR='grip', z=3000), dict(x=860, y=1200, arc=200, land=0.7, armR=-40), 0.15),
            ('spit', dict(x=600, y=1150, s=0.6, rot=20, z=3100), dict(x=900, y=1330, rot=170, arc=200), 0.15)]),
    dict(n='Çok yakın: göz', c='gözü helak oldu.', set='cave', cam=[(900, 1420, 2.6), (900, 1420, 3.0)], punch=True, blur=True,
         a=[('tepegoz', dict(CV_TL, e='sleep'), dict(e='blind'), 0.1)], fx=both(fx_shake_red(), fx_impact(520, 760))),
    dict(n='Geniş: haykırış', c='Tepegöz öyle haykırdı ki|dağ taş yankılandı.', set='cave', cam=[(900, 1100, 1.3), (900, 1060, 1.5)], punch=True, hold=0.5,
         a=[('tepegoz', dict(CV_T, e='blind', shake=1.5, armL=10, armR=-10), dict(armL=140, armR=-140), 0.05), ('koca0', dict(x=380, y=1300, s=0.5, e='fear')), ('koca1', dict(x=540, y=1370, s=0.5, e='fear')),
            ('basat', dict(x=700, y=1320, s=0.46, e='fear', flip=True))]),
]

GATE = dict(x=1330, y=950, s=0.5, flip=True)       # mağara ağzında Tepegöz
SCENES['koc'] = [
    dict(n='Geniş: koyunların içine', c='Basat mağaraya,|koyunların içine düştü.', set='cave', cam=[(360, 1300, 1.4), (340, 1340, 1.6)],
         a=[('sheep', dict(x=120, y=1480, s=0.9)), ('ram', dict(x=420, y=1540, s=0.9, flip=True)), ('sheep', dict(x=260, y=1620, s=0.9)),
            ('basat', dict(x=700, y=1200, s=0.46, e='fear', flip=True), dict(x=280, y=1330, arc=220, land=0.75), 0.1)]),
    dict(n='Geniş: kapıya durur', c='Tepegöz kapıya durdu,', set='cave', cam=[(1250, 1100, 1.3), (1280, 1100, 1.45)], punch=True,
         a=[('tepegoz', dict(GATE, x=900, e='blind', walk=True), dict(x=1330, glide=True), 0.0)]),
    dict(n='İkili: başları yoklar', c='her gelenin başını|yokladı.', set='cave', cam=[(1200, 1300, 1.5), (1220, 1300, 1.6)],
         a=[('tepegoz', dict(GATE, e='blind', armL=30, armR=-30)), ('sheep', dict(x=700, y=1470, s=0.9, flip=True, walk=True, z=3000), dict(x=1700, glide=True), 0.0),
            ('sheep', dict(x=420, y=1510, s=0.9, flip=True, walk=True, z=3000), dict(x=1420, glide=True), 0.0)]),
    dict(n='İkili: koçun postuna girer', c='Basat bir koçu boğazlayıp|derisini yüzdü, içine girdi.', set='cave', cam=[(380, 1420, 1.9), (400, 1420, 2.1)],
         a=[('basat', dict(x=250, y=1290, s=0.46, e='anger', armR=-80, poseR='grip', z=1000), dict(x=470, y=1470, s=0.3, armR=-10), 0.55), ('ram', dict(x=470, y=1520, s=1.1, flip=True, z=3000)),
            ('dagger', dict(x=330, y=1420, s=0.6, rot=60, z=3100), dict(x=380, y=1470, rot=120), 0.15)]),
    dict(n='Yakın: boynuzundan tutar', c='Tepegöz boynuzundan tuttu;', set='cave', cam=[(1240, 1380, 1.7), (1240, 1340, 1.8)], punch=True,
         a=[('tepegoz', dict(GATE, e='blind', armL=30, armR=-30), dict(armL=-20), 0.1), ('ram', dict(x=1180, y=1500, s=1.0, flip=True, peek='fear', z=3000), dict(y=1420, rot=-12), 0.3)]),
    dict(n='İkili: post elinde kalır', c='boynuz deriyle|elinde kaldı,', set='cave', cam=[(1260, 1200, 1.5), (1260, 1160, 1.5)],
         a=[('tepegoz', dict(GATE, e='blind', armL=-20), dict(armL=60), 0.15), ('ram', dict(x=1180, y=1420, s=1.0, flip=True, z=3000), dict(y=1040, rot=-50), 0.15),
            ('basat', dict(x=1180, y=1420, s=0.46, e='fear', rot=70, z=2900))]),
    dict(n='Geniş: bacaklarının arasından', c='Basat bacaklarının arasından|sıçrayıp çıktı.', set='cave', cam=[(1280, 1300, 1.3), (1300, 1300, 1.3)], hold=0.4,
         a=[('tepegoz', dict(GATE, e='blind', armL=60, armR=-60)), ('basat', dict(x=1100, y=1440, s=0.4, e='fear', rot=70, z=3000), dict(x=1420, y=1440, arc=110), 0.25)]),
]

SCENES['kilic'] = [
    dict(n='Yakın: “sana ölüm yokmuş”', c='Tepegöz, “Sana ölüm yokmuş.', set='cave', cam=[(1060, 900, 1.9), (1060, 896, 2.1)], blur=True,
         a=[('tepegoz', dict(CV_T, e='weep', flip=True))]),
    dict(n='Eşya: asılı kılıç', c='Mağarada kınsız|bir kılıç var;', set='cave', cam=[(420, 500, 1.6), (420, 620, 1.6)],
         a=[('chain', dict(x=420, y=260, s=0.8, z=3000))]),
    dict(n='Yakın: boynunu gösterir', c='benim başımı|o keser” dedi.', set='cave', cam=[(1060, 940, 1.7), (1060, 936, 1.85)], blur=True,
         a=[('tepegoz', dict(CV_T, e='weep', flip=True, armL=10), dict(armL=150, poseR='open'), 0.2)]),
    dict(n='İkili: iner çıkar', c='Kılıç durmadan|iner çıkardı.', set='cave', cam=[(480, 900, 1.3), (480, 940, 1.4)],
         a=[('chain', dict(x=420, y=260, s=0.8, z=3000)), ('basat', dict(x=700, y=1260, s=0.46, e='fear', flip=True))]),
    dict(n='Geniş: zinciri okla vurur', c='Basat zincirini|okla vurdu;', set='cave', cam=[(520, 900, 1.2), (500, 860, 1.3)],
         a=[('chain', dict(x=420, y=260, s=0.8, z=3000)), ('basat', dict(x=760, y=1260, s=0.46, e='anger', flip=True, bow=True, armL=-40), dict(armL=-120), 0.1),
            ('arrow', dict(x=700, y=1200, s=0.7, rot=-112, z=3100), dict(x=430, y=380, glide=True), 0.45)]),
    dict(n='Eşya: kılıç düşer', c='kılıç yere düştü,', set='cave', cam=[(420, 1300, 1.6), (420, 1380, 1.8)], punch=True,
         a=[('sword', dict(x=420, y=500, s=0.9, rot=180, z=3000), dict(y=1500, land=0.6), 0.05)], fx=fx_impact(540, 1180)),
    dict(n='İkili: kabzasından tutar', c='kabzasından tutup getirdi.', set='cave', cam=[(620, 1200, 1.4), (760, 1160, 1.4)], hold=0.3,
         a=[('basat', dict(x=420, y=1280, s=0.46, e='anger', sword=True, poseR='grip', armR=-150, walk=True), dict(x=760, glide=True), 0.2), ('tepegoz', dict(CV_T, x=1120, e='weep', flip=True))]),
]

SCENES['son'] = [
    dict(n='Yakın: ağıt', c='Tepegöz ağladı:|“Gözüm, gözüm,|yalnız gözüm!”', set='cave', cam=[(1100, 900, 1.9), (1100, 896, 2.2)], blur=True,
         a=[('tepegoz', dict(CV_T, x=1120, e='weep', flip=True, shake=0.8, armL=10, armR=-10), dict(armL=120, armR=-120), 0.2)]),
    dict(n='İkili: adını söyler', c='Basat adını söyleyince,', set='cave', cam=[(900, 1150, 1.3), (900, 1150, 1.4)],
         a=[('basat', dict(x=700, y=1270, s=0.46, e='anger', sword=True, poseR='grip', armR=-40)), ('tepegoz', dict(CV_T, x=1120, e='weep', flip=True))]),
    dict(n='Yakın: “kardeşiz”', c='“Öyleyse kardeşiz,|kıyma bana!” dedi.', set='cave', cam=[(1100, 940, 1.6), (1080, 940, 1.7)], blur=True,
         a=[('tepegoz', dict(CV_T, x=1120, e='weep', flip=True, armL=10, armR=-10), dict(armL=70, armR=-70, hr=10), 0.15)]),
    dict(n='Yakın: “bırakmam!”', c='Basat, “Kardeşimin kanını|almayınca bırakmam!” dedi;', set='cave', cam=[(700, 1190, 2.4), (700, 1186, 2.7)], punch=True, blur=True,
         a=[('basat', dict(x=700, y=1270, s=0.46, e='anger', shake=0.6, sword=True, poseR='grip', armR=-40), dict(armR=-150), 0.3)]),
    dict(n='Geniş: diz çöktürür', c='Tepegöz’ü dizi üstüne|çökertti,', set='cave', cam=[(920, 1200, 1.3), (920, 1260, 1.4)],
         a=[('basat', dict(x=600, y=1280, s=0.46, e='anger', sword=True, poseR='grip', armR=-150)), ('tepegoz', dict(CV_T, x=1120, e='weep', flip=True), dict(y=1180, hr=16, land=0.5), 0.1)]),
    dict(n='Geniş: boynunu vurur', c='kendi kılıcıyla|boynunu vurdu.', set='cave', cam=[(860, 1280, 1.35), (870, 1300, 1.4)], punch=True,
         a=[('basat', dict(x=580, y=1280, s=0.46, e='anger', sword=True, poseR='grip', armR=-160, z=3000), dict(armR=-30, x=650), 0.2), ('tepegoz', dict(CV_T, x=1120, y=1180, e='weep', flip=True, hr=16), dict(rot=80, y=1400, e='blind', land=0.75), 0.4)],
         fx=fx_shake_red()),
    dict(n='Geniş: Dede Korkut', c='Dedem Korkut gelip|alkış verdi:', set='camp', cam=[(760, 1200, 1.05), (760, 1200, 1.12)],
         a=[('dede', dict(x=960, y=1150, s=0.5, e='joy', flip=True)), ('basat', dict(CAMP_B, x=640, e='joy', sword=True, poseR='grip')), ('aruz', dict(x=400, y=1170, s=0.5, e='joy')), ('koca0', dict(x=1130, y=1320, s=0.5, e='joy')), ('koca1', dict(x=1200, y=1420, s=0.5, e='joy'))]),
    dict(n='Yakın: alkış', c='“Kadir Allah|yüzünü ak etsin!”', set='camp', cam=[(1000, 1060, 2.0), (1000, 1080, 1.7)], hold=1.5,
         a=[('dede', dict(x=1000, y=1150, s=0.5, e='joy', flip=True))], fx=fx_rays(0.3)),
]

# ----------------------------------------------------------------------------- ses: bu hikâyenin kendi klasörü ve sırası
V.STORY, V.ORDER, V.DIR = 'tepegoz', ORDER, os.path.join(os.path.dirname(__file__), 'audio')
V.apply(SCENES)
