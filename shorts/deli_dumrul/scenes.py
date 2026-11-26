"""Deli Dumrul — sahnelerin çekim listeleri. Metin, sitedeki sahne metninin aynısıdır; yalnızca altyazı parçalarına bölünmüştür."""
import math
from ..kit import *
from . import cast as C, cast2 as K, film as F
from .engine import lerp, ease, spring, at

TITLES = {'kopru': '1. Köprü', 'ovunme': '2. Övünme', 'oba': '3. Oba', 'soru': '4. Soru', 'buyruk': '5. Buyruk'}


# ----------------------------------------------------------------------------- ekran uzayı çizimleri (eşya çekimleri)
def fx_coins(n=9, big=False, palm=True):
    """Akçeler: avuç açıksa içine birikir, değilse karenin önünden yağar."""
    def fx(u):
        s = at(C.hand(True, 'open', True, 1), 560, 1180, 4.6, 196) if palm else ''
        reseed('coins')
        spots = [(R(-170, 170), R(-40, 60), R(0, 0.75)) for _ in range(n)]
        for dx, dy, t0 in spots:
            k = min(1.0, max(0.0, (u - t0) / 0.18))
            if k <= 0: continue
            y = lerp(-80, (1010 + dy * 0.8) if palm else 2100, ease(k) if palm else k) - (math.sin(k * 3.14) * 40 if k < 1 and palm else 0)
            s += K.coin(540 + dx * (0.7 if palm else 2.4), y, 44 if big else 36)
        return s
    return fx


def fx_impact(x=560, y=760):
    """Darbe: sivri yıldız patlaması ve hız çizgileri."""
    def fx(u):
        k = spring(min(1, u * 1.6)); r = 260 * k
        p = []
        for i in range(16):
            a = i * 0.3927; rr = r if i % 2 == 0 else r * 0.45
            p.append((x + math.cos(a) * rr, y + math.sin(a) * rr))
        s = fill(p, C.PALE, 0, smooth=False, op=max(0, 0.95 - u * 0.5)) + ink(p, 5, closed=True, smooth=False, wob=0)
        for i in range(5): s += fill(ellipse(x + math.cos(i * 1.3) * (r + 60), y + math.sin(i * 1.3) * (r + 60), 16, 16, 5, 0.3), C.GOLD, 0.6)
        return s
    return fx


def fx_rays(strength=0.5):
    """Yukarıdan inen ışık huzmeleri: ilahî bakış (kişi gösterilmez)."""
    def fx(u):
        s = ''
        for i in range(7):
            a = -0.5 + i * 0.166; x1 = 540 + math.sin(a) * 2600
            s += fill([(520, -40), (560, -40), (x1 + 90, 1960), (x1 - 90, 1960)], [C.GOLD, C.PALE][i % 2], 0, smooth=False, op=strength * (0.3 + 0.25 * math.sin(F.NOW * 2.2 + i)))
        return s
    return fx


def fx_fade_beam():
    """Yiğidin üstündeki ışık huzmesi daralır ve söner."""
    def fx(u):
        w = lerp(260, 20, ease(u))
        return fill([(540 - w * 0.4, -40), (540 + w * 0.4, -40), (540 + w, 1200), (540 - w, 1200)], C.PALE, 0, smooth=False, op=max(0.0, 0.5 * (1 - u)))
    return fx


def fx_feather():
    """Al bir kanat tüyü süzülerek kefenin üstüne iner."""
    def fx(u):
        x = 540 + math.sin(u * 7) * 150; y = lerp(-100, 1020, ease(u))
        return at(C.feather(), x, y, 3.0, math.sin(u * 7) * 40 + 20)
    return fx


def fx_pale():
    """Benzi sararır: yüzün üstüne soluk bir perde iner."""
    return lambda u: f'<rect width="1080" height="1920" fill="{C.PALE}" opacity="{0.42 * ease(min(1, u * 1.4)):.2f}"/>'


D = dict(x=750, y=820, s=0.5)              # Dumrul köprünün ortasında
SCENES = {}

SCENES['kopru'] = [
    dict(n='Geniş: köprü ve sahibi', c='Oğuz’da Duha Koca oğlu|Deli Dumrul derler|bir er vardı.', set='bridge', cam=[(750, 1040, 1.0), (750, 960, 1.3)],
         a=[('dumrul', dict(D, e='neutral'), dict(e='smug', armL=62, armR=-62, hr=-6), 0.3)]),
    dict(n='Eşya: çatlamış çay yatağı', c='Kuru bir çayın üstüne', set='bridge', cam=[(420, 1640, 2.1), (980, 1680, 2.3)], a=[]),
    dict(n='Alt açı: köprüyü okşar', c='köprü yaptırmıştı.', set='bridge', cam=[(760, 1150, 1.45), (760, 1060, 1.7)], punch=True,
         a=[('dumrul', dict(D, e='smug', armR=-20), dict(armR=-96, hr=8), 0.2)]),
    dict(n='İkili: bezirgân köprüde', c='Geçenden', set='bridge', cam=[(560, 1020, 1.6), (620, 1000, 1.8)],
         a=[('dumrul', dict(D, x=800, y=826, e='smug', armL=10), dict(armL=74, hr=-5), 0.3), ('trav', dict(x=300, y=1010, s=0.42, e='fear', walk=True), dict(x=520, y=948, glide=True), 0.0)]),
    dict(n='Eşya: otuz üç akçe', c='otuz üç akçe alır,', set='bridge', cam=[(700, 1000, 2.2), (720, 1000, 2.3)], blur=True, a=[], fx=fx_coins(11)),
    dict(n='Tepki: çayın içinden kaçan', c='geçmeyenden', set='bridge', cam=[(640, 1300, 1.35), (800, 1320, 1.5)],
         a=[('dumrul', dict(D, e='neutral'), dict(e='anger', armL=44, hr=10), 0.35), ('trav', dict(x=420, y=1420, s=0.36, e='fear', walk=True), dict(x=900, y=1400, glide=True), 0.0)]),
    dict(n='Yakın: döve döve', c='döve döve', set='bridge', cam=[(760, 1330, 1.8), (760, 1330, 2.05)], punch=True, still=0.5,
         a=[('dumrul', dict(x=860, y=1160, s=0.5, e='anger', armL=20, armR=-150, poseR='fist', shake=1), dict(armL=96, armR=-40, rot=-8), 0.25), ('trav', dict(x=560, y=1330, s=0.42, e='shock'), dict(rot=-22, x=520), 0.3)],
         fx=fx_impact(430, 800)),
    dict(n='Yakın: kırk akçe, altın diş', c='kırk akçe alırdı.', set='bridge', cam=[(760, 720, 2.3), (760, 715, 2.6)], blur=True,
         a=[('dumrul', dict(D, e='smug', hr=-6), dict(hr=6), 0.5)], fx=fx_coins(16, True, False), hold=0.6),
]

SCENES['ovunme'] = [
    dict(n='Yakın: akçe sayar', c='Bunu neden yapardı?', set='bridge', cam=[(750, 730, 2.0), (750, 720, 2.25)], blur=True,
         a=[('dumrul', dict(D, e='neutral', armR=-70, poseR='grip'), dict(e='smug', hr=-8), 0.5)]),
    dict(n='Geniş: pazı gösterir', c='“Benden deli,|benden güçlü', set='bridge', cam=[(700, 1000, 1.15), (740, 960, 1.4)],
         a=[('dumrul', dict(D, e='smug'), dict(e='anger', armL=150, armR=-150, poseR='fist', hr=-6), 0.2), ('trav', dict(x=380, y=980, s=0.4, e='fear', rot=-8))]),
    dict(n='Yakın: haykırış', c='er var mı ki çıksın,', set='bridge', cam=[(750, 720, 2.2), (750, 715, 2.7)], punch=True, blur=True,
         a=[('dumrul', dict(D, e='anger', hr=8, shake=1))]),
    dict(n='İkili: yumruk havada', c='benimle savaşsın?” derdi.', set='bridge', cam=[(600, 960, 1.5), (620, 950, 1.62)],
         a=[('dumrul', dict(D, e='anger', armR=-40, poseR='fist'), dict(armR=-166, hr=-8), 0.15), ('trav', dict(x=420, y=965, s=0.42, e='fear'), dict(rot=-14, x=380), 0.3)]),
    dict(n='Alt açı: kahraman duruşu', c='“Erliğim, bahadırlığım,|yiğitliğim', set='bridge', cam=[(760, 960, 1.5), (760, 860, 1.75)],
         a=[('dumrul', dict(D, e='smug', armL=62, armR=-62, hr=-10))]),
    dict(n='Eşya: uzak diyarlara uçan kuşlar', c='Rum’a, Şam’a gitsin,', set='bridge', cam=[(300, 700, 1.7), (1150, 660, 1.7)], a=[]),
    dict(n='Yakın: kendinden memnun', c='ün salsın.”', set='bridge', cam=[(750, 725, 2.3), (750, 720, 2.5)], blur=True, hold=0.6,
         a=[('dumrul', dict(D, e='smug', hr=-10), dict(hr=6), 0.4)]),
]

M = [dict(x=480, y=1500, s=0.6), dict(x=760, y=1470, s=0.6), dict(x=1040, y=1500, s=0.6)]
DEAD = ('dead', dict(x=800, y=1700, s=0.9, z=1600))
SCENES['oba'] = [
    dict(n='Geniş: oba', c='Bir gün köprüsünün yamacına|bir bölük oba konmuştu.', set='oba', cam=[(750, 1080, 1.0), (750, 1160, 1.2)],
         a=[('mourner0', dict(x=420, y=1330, s=0.42, e='neutral', walk=True), dict(x=560, glide=True), 0.0), ('extra1', dict(x=1080, y=1340, s=0.44)), ('boy0', dict(x=880, y=1440, s=0.5))]),
    dict(n='Yakın: hasta yiğit', c='O obada iyi, güzel|bir yiğit hastalandı;', set='oba', cam=[(560, 1640, 1.8), (640, 1650, 2.05)],
         a=[DEAD, ('mourner1', dict(M[1], x=820, e='neutral'), dict(e='fear'), 0.5)]),
    dict(n='Geniş: ışık söner', c='Allah’ın buyruğuyla öldü.', set='oba', cam=[(760, 1560, 1.5), (760, 1580, 1.6)],
         a=[DEAD, ('mourner1', dict(M[1], x=820, e='fear'), dict(e='shock'), 0.4)], fx=fx_fade_beam()),
    dict(n='Yakın: “oğul”', c='Kimi “oğul” diye,', set='oba', cam=[(480, 1420, 2.2), (480, 1410, 2.5)], punch=True, blur=True,
         a=[('mourner0', dict(M[0], e='grief', shake=1))]),
    dict(n='Yakın: “kardeş”', c='kimi “kardeş” diye ağladı;', set='oba', cam=[(1040, 1420, 2.2), (1040, 1410, 2.5)], punch=True, blur=True,
         a=[('mourner2', dict(M[2], e='grief', shake=1))]),
    dict(n='Geniş: büyük yas', c='o yiğidin üstüne|büyük bir yas koptu.', set='oba', cam=[(760, 1540, 1.5), (760, 1420, 1.05)], hold=0.6,
         a=[DEAD, ('mourner0', dict(M[0], e='grief', shake=1)), ('mourner1', dict(M[1], e='grief', shake=1)), ('mourner2', dict(M[2], e='grief', shake=1)),
            ('extra0', dict(x=250, y=1470, s=0.5, e='fear')), ('extra2', dict(x=1300, y=1480, s=0.5, e='fear')), ('boy1', dict(x=1180, y=1700, s=0.5, e='grief'))]),
]

RD = dict(x=980, y=1340, s=0.52, flip=False)   # atlı Dumrul obanın sağında, sola bakar
SCENES['soru'] = [
    dict(n='Geniş: dörtnala gelir', c='Deli Dumrul|dörtnala yetişti:', set='oba', cam=[(900, 1300, 1.1), (820, 1320, 1.25)],
         a=[DEAD, ('rider', dict(RD, x=1700, e='anger', gallop=True), dict(x=1060, glide=True), 0.0), ('mourner0', dict(M[0], e='grief')), ('mourner1', dict(M[1], x=700, e='grief'))]),
    dict(n='Yakın: “Bre kavatlar”', c='“Bre kavatlar,|ne ağlarsınız?', set='oba', cam=[(1060, 1100, 3.0), (1060, 1095, 3.5)], punch=True, blur=True,
         a=[('rider', dict(RD, x=1060, e='anger', armR=-60, shake=1))]),
    dict(n='İkili: köprüsünü gösterir', c='Köprümün yanında|bu kavga nedir?”', set='oba', cam=[(820, 1380, 1.2), (800, 1380, 1.3)],
         a=[DEAD, ('rider', dict(RD, x=1060, e='anger', armL=30), dict(armL=100, hr=8), 0.2), ('mourner0', dict(M[0], e='fear')), ('mourner1', dict(M[1], x=700, e='fear'))]),
    dict(n='Yakın: “yiğidimiz öldü”', c='“Hanım, iyi bir|yiğidimiz öldü” dediler,', set='oba', cam=[(520, 1500, 1.9), (640, 1600, 1.8)],
         a=[DEAD, ('mourner0', dict(M[0], e='grief')), ('mourner1', dict(M[1], x=700, e='grief'))]),
    dict(n='Eşya: al kanat tüyü', c='“al kanatlı Azrail|canını aldı.”', set='oba', cam=[(800, 1660, 2.0), (800, 1670, 2.2)],
         a=[DEAD], fx=fx_feather()),
    dict(n='Yakın: küçümser', c='“Azrail dediğiniz|kimdir ki', set='oba', cam=[(1060, 1100, 3.2), (1060, 1096, 3.5)], blur=True,
         a=[('rider', dict(RD, x=1060, e='smug', hr=-8))]),
    dict(n='Yakın: yumruk', c='adamın canını alır?', set='oba', cam=[(1070, 1080, 2.5), (1070, 1070, 2.9)], punch=True, blur=True,
         a=[('rider', dict(RD, x=1060, e='anger', armR=-30, poseR='fist'), dict(armR=-160), 0.15)]),
    dict(n='Geniş: göğe seslenir', c='Ya kadir Allah,|birliğin, varlığın|hakkı için', set='oba', cam=[(960, 1250, 1.3), (960, 900, 1.3)],
         a=[('rider', dict(RD, x=1060, e='anger', armL=20, armR=-20), dict(armL=150, armR=-150, hr=-16), 0.15)], fx=fx_rays(0.25)),
    dict(n='Çok yakın: gözler', c='Azrail’i gözüme göster;', set='oba', cam=[(1060, 1158, 6.0), (1060, 1156, 6.8)], blur=True,
         a=[('rider', dict(RD, x=1060, e='anger', shake=1))]),
    dict(n='Geniş: kılıcı savurur', c='savaşayım, çekişeyim,', set='oba', cam=[(960, 1280, 1.3), (940, 1260, 1.45)],
         a=[DEAD, ('rider', dict(RD, x=1060, e='anger', armR=-40, poseR='grip', sword=True, gallop=True), dict(armR=-150, lean=-8), 0.1), ('mourner1', dict(M[1], x=700, e='fear'))]),
    dict(n='Geniş: kefenin başında', c='yiğidin canını|kurtarayım!”', set='oba', cam=[(860, 1450, 1.25), (860, 1400, 1.1)], hold=0.6,
         a=[DEAD, ('rider', dict(RD, x=1080, e='anger', armR=-158, poseR='grip', sword=True, hr=-8)), ('mourner0', dict(M[0], e='shock')), ('mourner1', dict(M[1], x=690, e='shock')), ('boy0', dict(x=320, y=1700, s=0.5, e='fear'))]),
]

AZH = dict(x=750, y=1330, s=0.5)
SCENES['buyruk'] = [
    dict(n='Geniş: gök kararır', c='Dumrul’un sözü|Hak Teala’ya|hoş gelmedi.', set='heaven', cam=[(750, 1300, 1.0), (750, 760, 1.25)], a=[]),
    dict(n='Eşya: yukarıdan bakış', c='“Bak bak, bu deli kavat', set='bridge', cam=[(750, 960, 1.0), (750, 940, 1.12)],
         a=[('dumrul', dict(D, e='smug', armL=62, armR=-62))], fx=fx_rays(0.55)),
    dict(n='Yakın: kahkaha', c='benim birliğimi bilmez,|birliğime şükretmez;', set='bridge', cam=[(750, 730, 2.0), (750, 720, 2.3)], blur=True,
         a=[('dumrul', dict(D, e='smug', hr=-10, shake=0.6))], fx=fx_rays(0.8)),
    dict(n='Geniş: ışığın altında gezer', c='ulu dergâhımda gezer,|benlik eder” dedi.', set='bridge', cam=[(600, 1000, 1.2), (860, 990, 1.2)],
         a=[('dumrul', dict(D, x=520, y=848, e='smug', walk=True, armL=62, armR=-62), dict(x=980, y=848, glide=True), 0.0)], fx=fx_rays(0.7)),
    dict(n='Geniş: Azrail huzurda', c='Azrail’e buyurdu:', set='heaven', cam=[(750, 1250, 1.2), (750, 1300, 1.45)],
         a=[('azrail', dict(AZH, e='neutral', spread=0.45), dict(hr=14), 0.2)]),
    dict(n='Yakın: başını kaldırır', c='“Ya Azrail, var,', set='heaven', cam=[(750, 1240, 2.4), (750, 1230, 2.7)], punch=True,
         a=[('azrail', dict(AZH, e='neutral', hr=14, spread=0.45), dict(e='stern', hr=-8), 0.3)]),
    dict(n='Geniş: kanatlar açılır', c='o deli kavatın|gözüne görün;', set='heaven', cam=[(750, 1300, 1.3), (750, 1200, 1.3)],
         a=[('azrail', dict(AZH, e='stern', spread=0.45), dict(spread=1.4, y=1230, armL=40, armR=-40), 0.15)]),
    dict(n='Yakın: benzi sararır', c='benzini sarart,', set='bridge', cam=[(750, 725, 2.3), (750, 720, 2.6)], blur=True,
         a=[('dumrul', dict(D, e='smug'), dict(e='shock', hr=-8), 0.3)], fx=fx_pale()),
    dict(n='Geniş: Azrail süzülür', c='canını hırıldat, al.”', set='heaven', cam=[(750, 1200, 1.2), (750, 1350, 1.7)], hold=0.6,
         a=[('azrail', dict(AZH, y=1100, e='wrath', spread=1.4, armL=40, armR=-40), dict(y=1420, s=0.8, rot=8, glide=True), 0.0)]),
]
