"""Deli Dumrul — sahnelerin çekim listeleri. Metin, sitedeki sahne metninin aynısıdır; yalnızca altyazı parçalarına bölünmüştür."""
import math
from ..kit import *
from . import cast as C, cast2 as K, film as F
from .engine import lerp, ease, spring, at

TITLES = {'kopru': '1. Köprü', 'ovunme': '2. Övünme', 'oba': '3. Oba', 'soru': '4. Soru', 'buyruk': '5. Buyruk', 'at': '7. At', 'yalvaris': '8. Yalvarış', 'dua': '9. Dua', 'baba': '10. Baba',
          'ana': '11. Ana', 'veda': '12. Veda', 'es': '13. Eş', 'ikinci-dua': '14. İkinci dua', 'bagis': '15. Bağış', 'dede': '16. Dede Korkut'}


# ----------------------------------------------------------------------------- ekran uzayı çizimleri (eşya çekimleri)
def fx_coins(n=9, big=False, palm=True, small=False):
    """Akçeler: avuç açıksa içine birikir, değilse karenin önünden yağar."""
    def fx(u):
        s = at(C.hand(True, 'open', True, 1), 560, 1180, 4.6, 196) if palm else ''
        reseed('coins')
        spots = [(R(-170, 170), R(-40, 60), R(0, 0.75)) for _ in range(n)]
        for dx, dy, t0 in spots:
            k = min(1.0, max(0.0, (u - t0) / 0.18))
            if k <= 0: continue
            y = lerp(-80, (1010 + dy * 0.8) if palm else 2100, ease(k) if palm else k) - (math.sin(k * 3.14) * 40 if k < 1 and palm else 0)
            s += K.coin(540 + dx * (0.7 if palm else 2.4), y, 44 if big else 24 if small else 36)
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
    dict(n='Eşya: otuz üç akçe', c='otuz üç akçe alır,', set='bridge', cam=[(700, 1000, 2.2), (720, 1000, 2.3)], blur=True, a=[], fx=fx_coins(33, small=True)),
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
         a=[('dead', dict(DEAD[1], sick=True)), ('mourner1', dict(M[1], x=820, e='neutral'), dict(e='fear'), 0.5)]),
    dict(n='Geniş: ışık söner', c='Allah’ın buyruğuyla öldü.', set='oba', cam=[(760, 1560, 1.5), (760, 1580, 1.6)],
         a=[('dead', dict(DEAD[1], sick=True), dict(sick=False), 0.55), ('mourner1', dict(M[1], x=820, e='fear'), dict(e='shock'), 0.6)], fx=fx_fade_beam()),
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


# ============================================================================= sahne 7–16
def fx_big(fn, x=540, y=900, s=3.0, rot=0, bob=0.0):
    """Bir eşyayı karenin ortasında iri gösterir (eşya çekimi)."""
    return lambda u: at(fn(), x, y + math.sin(F.NOW * 3) * bob, s * (0.85 + 0.15 * spring(min(1, u * 1.5))), rot)


def fx_falcon():
    def fx(u):
        s = at(C.hand(True, 'fist', False, 1), 500, 1180, 4.0, 150)
        return s + at(K.falcon(), 560, 1010 + math.sin(F.NOW * 3) * 6, 3.4 * (0.85 + 0.15 * spring(min(1, u * 1.5))), -4)
    return fx


def fx_stars(x=540, y=560, n=5, r=230):
    """Başının çevresinde dönen yıldızlar: sersemlik."""
    def fx(u):
        s = ''
        for i in range(n):
            a = F.NOW * 4 + i * 6.283 / n
            s += sparkle(x + math.cos(a) * r, y + math.sin(a) * r * 0.32, 42, C.GOLD)
        return s
    return fx


def grapes():
    reseed('grapes')
    s = ink([(0, -150), (10, -90)], 9, col=C.LEATHER, wob=0.4, taper=(0, 0.2), smooth=False) + blob([(10, -110), (90, -150), (130, -90), (70, -60)], C.GOLD, 2.8) + ink([(20, -106), (110, -104)], 1.8, wob=0.3, smooth=False)
    for r in range(5):
        for k in range(5 - r):
            cx = (k - (4 - r) / 2) * 44; cy = -50 + r * 40
            s += blob(ellipse(cx, cy, 24, 24, 8, 0.05), C.COBALT, 2.6) + fill(ellipse(cx - 6, cy + 6, 14, 12, 6), INK, 0.4, op=0.45) + fill(ellipse(cx + 7, cy - 8, 5, 4, 5), C.PALE, 0.3, op=0.8)
    return s


def fx_pour():
    """Üzümün al şarabı: kadehe dolan kırmızı akış."""
    def fx(u):
        k = ease(min(1, u * 1.3))
        s = ink([(700, -40), (640, 300), (580, 640 + 60 * k)], 30, col=C.RED, wob=0, taper=(0, 0.05), press=0.1)
        return s + at(C.goblet(), 560, 1020, 4.2, 0) + fill(ellipse(560, 836, 104 * k + 6, 26, 9), C.RED, 0.5) + sparkle(640, 930, 34)
    return fx


def fx_glow(x=540, y=980):
    """Gönüldeki ışık: göğsün üstünde atan sıcak hale."""
    def fx(u):
        p = 0.5 + 0.5 * math.sin(F.NOW * 5)
        return ''.join(fill(ellipse(x, y, r * (1 + 0.08 * p), r * (1 + 0.08 * p), 12), C.GOLD, 0, op=o) for r, o in ((230, 0.14), (160, 0.2), (96, 0.34))) + sparkle(x, y, 70 + 16 * p)
    return fx


def fx_years():
    """Yüz kırk yıl: güneş ile ay art arda dönerek geçer."""
    def fx(u):
        s = ''
        for i in range(6):
            a = F.NOW * 2.6 + i * 1.047; x = 540 + math.cos(a) * 420; y = 520 - abs(math.sin(a)) * 300 + (0 if math.sin(a) > 0 else 2000)
            s += (sparkle(x, y, 90, C.GOLD) + fill(ellipse(x, y, 44, 44, 10), C.GOLD, 0.5)) if i % 2 == 0 else (fill(ellipse(x, y, 46, 46, 10), C.PALE, 0.5) + fill(ellipse(x + 18, y - 8, 40, 40, 10), C.COBALT, 0.5, op=0.9))
        return s
    return fx


def fx_red():
    return lambda u: f'<rect width="1080" height="1920" fill="{C.RED}" opacity="{0.34 * ease(min(1, u * 1.3)):.2f}"/>'


def both(*fns):
    return lambda u: ''.join(f(u) for f in fns)


FD = dict(x=880, y=1215, s=0.6)                 # Dumrul sofrada
LIE = dict(x=560, y=1400, s=0.5, rot=-90, z=1700)   # Dumrul sırtüstü yerde; başı solda
AZC = dict(x=700, y=1080, s=0.34, z=1800)       # Azrail göğsünün üstünde
CROWD = [('extra1', dict(x=620, y=1340, s=0.62, robe=C.GOLD)), ('extra0', dict(x=1180, y=1420, s=0.66, robe=C.COBALT, flip=True)), ('extra2', dict(x=110, y=1668, s=0.72)), ('extra2', dict(x=1390, y=1330, s=0.56, robe=C.RED, flip=True))]

SCENES['at'] = [
    dict(n='Yakın: el çırpar, güler', c='Dumrul elini eline çaldı,|kah kah güldü:', set='feast', cam=[(880, 1120, 1.7), (880, 1110, 1.95)], punch=True, nofore=True,
         a=[('dumrul', dict(FD, e='smug', armL=30, armR=-30, shake=0.8), dict(armL=-46, armR=46, hr=-8), 0.15)] + CROWD[:2]),
    dict(n='Geniş: yiğitlerine övünür', c='“Yiğitlerim, Azrail’in gözünü|öyle korkuttum ki kaçtı.', set='feast', cam=[(780, 1000, 1.0), (800, 1000, 1.12)],
         a=[('dumrul', dict(FD, e='smug'), dict(armL=110, armR=-110, hr=-6), 0.15)] + CROWD),
    dict(n='Yakın: “bırakır mıyım?”', c='Onu doğana aldırmadan|bırakır mıyım?”', set='feast', cam=[(900, 1090, 1.8), (900, 1080, 2.0)], blur=True, nofore=True,
         a=[('dumrul', dict(FD, e='anger', armR=-96, poseR='fist', hr=6)), ('falcon', dict(x=1100, y=1170, s=0.5, z=3000))]),
    dict(n='Geniş: atına biner', c='Atına bindi,', set='steppe', cam=[(900, 1260, 1.2), (900, 1240, 1.35)], punch=True,
         a=[('rider', dict(x=900, y=1500, s=0.5, e='anger'), dict(y=1400), 0.05)]),
    dict(n='Eşya: doğan yumrukta', c='doğanını eline aldı,', set='steppe', cam=[(900, 1200, 1.8), (900, 1200, 1.9)], blur=True, a=[], fx=fx_falcon()),
    dict(n='Geniş: ardına düşer', c='ardına düştü.', set='steppe', cam=[(1000, 1200, 1.15), (700, 1180, 1.15)],
         a=[('rider', dict(x=1500, y=1400, s=0.5, e='anger', gallop=True, armR=-96, poseR='fist'), dict(x=500, glide=True), 0.0), ('dove', dict(x=420, y=640, s=0.5, flip=True, z=-5), dict(x=120, y=520, glide=True), 0.0)]),
    dict(n='Geniş: eve döner', c='Dönüp evine gelirken', set='steppe', cam=[(600, 1220, 1.15), (800, 1220, 1.15)],
         a=[('rider', dict(x=300, y=1400, s=0.5, e='neutral', flip=True, walk=True), dict(x=900, glide=True), 0.0)]),
    dict(n='Yakın: Azrail atın gözüne görünür', c='Azrail atının|gözüne göründü.', set='steppe', cam=[(1000, 1180, 1.5), (1060, 1170, 1.7)], punch=True,
         a=[('rider', dict(x=900, y=1400, s=0.5, e='neutral', flip=True), dict(spooked=True, e='shock'), 0.2), ('azrail', dict(x=1330, y=1500, s=0.5, e='wrath', spread=0.4), dict(y=1160, spread=1.4, armL=40, armR=-40), 0.1)]),
    dict(n='Geniş: at şaha kalkar', c='At ürktü,', set='steppe', cam=[(900, 1200, 1.3), (880, 1180, 1.45)], punch=True,
         a=[('rider', dict(x=900, y=1400, s=0.5, e='shock', flip=True, spooked=True, armL=120, armR=-120), dict(rot=-26, y=1360), 0.05), ('azrail', dict(x=1330, y=1160, s=0.5, e='wrath', spread=1.4, armL=40, armR=-40))]),
    dict(n='Geniş: yere çarpar', c='Dumrul’u kaldırıp|yere vurdu.', set='steppe', cam=[(700, 1180, 1.3), (640, 1250, 1.5)],
         a=[('horse', dict(x=1080, y=1400, s=0.5, flip=True, spooked=True, rot=-14, gallop=True), dict(x=1500, glide=True), 0.2),
            ('dumrul', dict(x=860, y=1000, s=0.5, e='shock', rot=-30, armL=120, armR=-120, z=1700), dict(LIE, glide=True), 0.0)], fx=fx_impact(470, 1250), still=0.8),
    dict(n='Yakın: sersemlemiş', c='Kara başı bunaldı;', set='steppe', cam=[(500, 1320, 1.9), (500, 1320, 2.1)], blur=True,
         a=[('dumrul', dict(LIE, e='shock', shake=0.6))], fx=fx_stars(470, 760)),
    dict(n='Geniş: Azrail göğsüne konar', c='ak göğsünün üstüne|Azrail basıp kondu.', set='steppe', cam=[(700, 1200, 1.5), (700, 1220, 1.7)], hold=0.8,
         a=[('dumrul', dict(LIE, e='shock', armL=60, armR=-60)), ('azrail', dict(AZC, y=500, e='wrath', spread=1.4), dict(y=1080, spread=1.0), 0.05)]),
]

SCENES['yalvaris'] = [
    dict(n='Yakın: “aman!”', c='“Bre Azrail, aman!', set='steppe', cam=[(500, 1320, 1.9), (500, 1320, 2.2)], punch=True, blur=True,
         a=[('dumrul', dict(LIE, e='shock', shake=1))]),
    dict(n='İkili: göğsünde Azrail', c='Ben seni böyle bilmezdim,', set='steppe', cam=[(680, 1200, 1.6), (700, 1190, 1.75)],
         a=[('dumrul', dict(LIE, e='shock', armL=70, armR=-70)), ('azrail', dict(AZC, e='stern'))]),
    dict(n='Yakın: Azrail, kıpırtısız', c='uğrulayın can aldığını|duymazdım.', set='steppe', cam=[(700, 1030, 3.2), (700, 1026, 3.5)], blur=True,
         a=[('azrail', dict(AZC, e='stern'))]),
    dict(n='Geniş: dağlar, bağlar', c='Bizim dağlarımızın bağları,', set='bridge', cam=[(300, 860, 1.6), (1100, 840, 1.6)], a=[], fx=fx_big(grapes, 820, 1040, 1.6, 8, 8)),
    dict(n='Eşya: kara salkım', c='o bağların|kara salkımlı üzümü,', set='bridge', cam=[(700, 860, 1.8), (720, 850, 1.9)], blur=True, a=[], fx=fx_big(grapes, 540, 900, 3.6, 0, 10)),
    dict(n='Eşya: al şarap', c='o üzümün|al şarabı olur.', set='feast', cam=[(700, 1200, 1.8), (700, 1200, 1.9)], blur=True, nofore=True, a=[], fx=fx_pour()),
    dict(n='Yakın: sarhoş bahanesi', c='Şaraplıydım,|ne söylediğimi bilmedim.', set='steppe', cam=[(500, 1320, 1.9), (510, 1320, 2.1)], blur=True,
         a=[('dumrul', dict(LIE, e='smug', shake=0.5))], fx=fx_stars(470, 760, 3, 200)),
    dict(n='İkili: iki eliyle yalvarır', c='Beyliğe usanmadım,|yiğitliğe doymadım;', set='steppe', cam=[(680, 1220, 1.6), (680, 1210, 1.75)],
         a=[('dumrul', dict(LIE, e='shock', armL=40, armR=-40), dict(armL=130, armR=-130), 0.15), ('azrail', dict(AZC, e='stern'))]),
    dict(n='Çok yakın: korku', c='canımı alma!”', set='steppe', cam=[(470, 1350, 3.0), (470, 1350, 3.5)], punch=True, blur=True,
         a=[('dumrul', dict(LIE, e='shock', shake=1))]),
    dict(n='Yakın: Azrail konuşur', c='Azrail dedi:|“Bre deli kavat,', set='steppe', cam=[(700, 1030, 3.0), (700, 1026, 3.3)], blur=True,
         a=[('azrail', dict(AZC, e='stern'), dict(e='speak'), 0.3)]),
    dict(n='Geniş: göğü gösterir', c='bana ne yalvarırsın?|Allah’a yalvar.', set='steppe', cam=[(700, 1180, 1.5), (700, 980, 1.5)],
         a=[('dumrul', dict(LIE, e='shock')), ('azrail', dict(AZC, e='speak', armR=-10), dict(armR=-168), 0.15)], fx=fx_rays(0.35)),
    dict(n='Yakın: boş eller', c='Benim elimde ne var;', set='steppe', cam=[(700, 1100, 2.4), (700, 1096, 2.6)], blur=True,
         a=[('azrail', dict(AZC, e='neutral', armL=10, armR=-10), dict(armL=62, armR=-62), 0.15)]),
    dict(n='Geniş: buyruk kulu', c='ben de bir|yumuş oğlanıyım.”', set='steppe', cam=[(700, 1200, 1.6), (700, 1140, 1.4)], hold=0.6,
         a=[('dumrul', dict(LIE, e='shock')), ('azrail', dict(AZC, e='neutral', armL=62, armR=-62), dict(hr=16, spread=0.6), 0.2)], fx=fx_rays(0.4)),
]

DS = dict(x=560, y=1300, s=0.5)                 # Dumrul bozkırda ayakta
SCENES['dua'] = [
    dict(n='İkili: Azrail’i kenara iter', c='Dumrul, “Öyleyse sen|aradan çık;', set='steppe', cam=[(760, 1300, 1.4), (760, 1290, 1.5)],
         a=[('dumrul', dict(DS, e='anger', armR=-10), dict(armR=-84, hr=6), 0.15), ('azrail', dict(x=900, y=1250, s=0.5, e='stern', spread=0.8), dict(x=1080, spread=0.5), 0.3)]),
    dict(n='Yakın: göğe döner', c='ben Allah’la|söyleşeyim” dedi.', set='steppe', cam=[(560, 1220, 2.2), (560, 1200, 2.4)], blur=True,
         a=[('dumrul', dict(DS, e='neutral'), dict(hr=-16), 0.3)], fx=fx_rays(0.3)),
    dict(n='Geniş: gökler', c='“Yücelerden yücesin,|kimse bilmez nicesin,', set='heaven', cam=[(750, 1400, 1.0), (750, 700, 1.2)], a=[]),
    dict(n='Yakın: kollar göğe', c='görklü Tanrı!', set='steppe', cam=[(560, 1240, 1.9), (560, 1220, 2.1)], punch=True, blur=True,
         a=[('dumrul', dict(DS, e='neutral', hr=-16), dict(armL=150, armR=-150), 0.1)], fx=fx_rays(0.5)),
    dict(n='Tepki: gökte arayan, yerde arayan', c='Nice cahiller seni|gökte arar, yerde ister;', set='steppe', cam=[(900, 1380, 1.4), (1100, 1380, 1.4)],
         a=[('extra1', dict(x=980, y=1420, s=0.62, e='fear', rot=-14)), ('extra2', dict(x=1260, y=1480, s=0.62, rot=22))]),
    dict(n='Eşya: gönüldeki ışık', c='sen müminlerin|gönlündesin.', set='steppe', cam=[(560, 1380, 2.6), (560, 1376, 2.8)], blur=True,
         a=[('dumrul', dict(DS, e='neutral', armL=-40, armR=40))], fx=fx_glow(540, 840)),
    dict(n='Yakın: başı eğik', c='Canımı alacaksan|sen al,', set='steppe', cam=[(560, 1230, 2.3), (560, 1226, 2.5)], blur=True,
         a=[('dumrul', dict(DS, e='neutral', hr=-10), dict(hr=14), 0.2)]),
    dict(n='İkili: Azrail’i gösterir', c='Azrail’e bırakma.”', set='steppe', cam=[(780, 1300, 1.4), (800, 1296, 1.5)],
         a=[('dumrul', dict(DS, e='anger', armR=-10), dict(armR=-92), 0.15), ('azrail', dict(x=1080, y=1250, s=0.5, e='stern', spread=0.5))]),
    dict(n='Geniş: ışık çoğalır', c='Bu söz Hak Teala’ya|hoş geldi:', set='heaven', cam=[(750, 900, 1.1), (750, 760, 1.25)], a=[], fx=fx_rays(0.6)),
    dict(n='Yakın: huzmenin altında', c='“Deli Dumrul can yerine|can bulsun,', set='steppe', cam=[(560, 1240, 2.0), (560, 1236, 2.2)], blur=True,
         a=[('dumrul', dict(DS, e='shock', hr=-12), dict(e='smug'), 0.5)], fx=fx_rays(0.8)),
    dict(n='Geniş: Azrail kanat indirir', c='kendi canı azat olsun.”', set='steppe', cam=[(820, 1300, 1.3), (820, 1300, 1.2)], hold=0.6,
         a=[('dumrul', dict(DS, e='smug')), ('azrail', dict(x=1080, y=1250, s=0.5, e='stern', spread=1.2), dict(spread=0.4, e='neutral', hr=10), 0.2)], fx=fx_rays(0.4)),
]

DI = dict(x=470, y=1259, s=0.55)                # Dumrul otağın içinde
FA = dict(x=860, y=1278, s=0.6)
MO = dict(x=1140, y=1287, s=0.58)
SCENES['baba'] = [
    dict(n='Geniş: el öper', c='Dumrul babasına vardı,|elini öptü:', set='inside', cam=[(700, 1250, 1.15), (720, 1260, 1.3)],
         a=[('dumrul', dict(DI, x=120, e='neutral', walk=True), dict(x=560, rot=22, glide=True), 0.0), ('father', dict(FA, e='neutral'), dict(e='joy', armL=60), 0.5)]),
    dict(n='Yakın: baba', c='“Ak sakallı,|aziz babam!', set='inside', cam=[(870, 1200, 2.4), (870, 1196, 2.6)], blur=True,
         a=[('father', dict(FA, e='joy'))]),
    dict(n='Yakın: başı önünde', c='Küfür söz söyledim,|Hak Teala’ya hoş gelmedi.', set='inside', cam=[(470, 1180, 2.2), (470, 1176, 2.4)], blur=True,
         a=[('dumrul', dict(DI, e='neutral', hr=14))], fx=fx_rays(0.2)),
    dict(n='Tepki: kapıda Azrail', c='Azrail ak göğsüme kondu,', set='inside', cam=[(420, 1220, 1.4), (380, 1220, 1.5)],
         a=[('dumrul', dict(DI, e='shock', armL=-40, armR=40)), ('azrail', dict(x=140, y=1200, s=0.5, e='stern', spread=0.5, z=100))]),
    dict(n='Eşya: el göğüste', c='tatlı canımı alır oldu.', set='inside', cam=[(470, 1360, 2.8), (470, 1356, 3.0)], blur=True,
         a=[('dumrul', dict(DI, e='neutral', armL=-44, armR=44))], fx=fx_glow(540, 860)),
    dict(n='İkili: can diler', c='Senden can dilerim,|verir misin?”', set='inside', cam=[(680, 1250, 1.5), (690, 1250, 1.6)],
         a=[('dumrul', dict(DI, e='neutral', armL=20, armR=-20), dict(armR=-80, armL=60), 0.15), ('father', dict(FA, e='joy'), dict(e='fear'), 0.4)]),
    dict(n='Yakın: “canımın parçası”', c='Babası dedi:|“Canımın parçası oğul!', set='inside', cam=[(870, 1200, 2.4), (870, 1196, 2.6)], blur=True,
         a=[('father', dict(FA, e='grief', shake=0.5))]),
    dict(n='Geniş: dağlarını sayar', c='Kara dağım gerekse söyle,|Azrail’in yaylası olsun;', set='steppe', cam=[(500, 900, 1.5), (1100, 880, 1.5)], a=[]),
    dict(n='Eşya: tavla tavla atlar', c='tavla tavla atlarım,|katar katar develerim,', set='oba', cam=[(500, 1400, 1.3), (1000, 1400, 1.3)],
         a=[('horse', dict(x=360, y=1380, s=0.42)), ('horse', dict(x=760, y=1420, s=0.46)), ('horse', dict(x=1180, y=1390, s=0.42, flip=True))]),
    dict(n='Eşya: altın, gümüş', c='altınım gümüşüm|onun olsun.', set='inside', cam=[(1230, 1200, 2.2), (1230, 1196, 2.4)], a=[], fx=fx_coins(18, True, False)),
    dict(n='Yakın: yüz çevirir', c='Ama dünya şirin,|can aziz;', set='inside', cam=[(870, 1200, 2.4), (870, 1196, 2.6)], blur=True,
         a=[('father', dict(FA, e='grief'), dict(e='refuse', hr=-10), 0.35)]),
    dict(n='Yakın: kendine sarılır', c='canıma kıyamam.', set='inside', cam=[(860, 1300, 1.9), (860, 1296, 2.1)], punch=True, blur=True,
         a=[('father', dict(FA, e='refuse'), dict(armL=-46, armR=30), 0.1)]),
    dict(n='Geniş: anayı gösterir', c='Benden sevgili anan var,|ona git.”', set='inside', cam=[(820, 1260, 1.3), (860, 1260, 1.25)], hold=0.6,
         a=[('dumrul', dict(DI, e='shock')), ('father', dict(FA, e='refuse', armR=-24), dict(armR=-92), 0.15), ('mother', dict(MO, e='neutral'), dict(e='fear'), 0.5)]),
]

SCENES['ana'] = [
    dict(n='Geniş: anasına varır', c='Dumrul anasına vardı:', set='inside', cam=[(900, 1260, 1.3), (960, 1260, 1.4)],
         a=[('dumrul', dict(DI, e='neutral', walk=True), dict(x=780, glide=True), 0.0), ('mother', dict(MO, e='fear')), ('father', dict(FA, x=300, e='refuse', flip=True))]),
    dict(n='Yakın: “ana”', c='“Ana, senden|can dilerim.', set='inside', cam=[(780, 1180, 2.2), (780, 1176, 2.4)], blur=True,
         a=[('dumrul', dict(DI, x=780, e='neutral', armR=-70, armL=50))]),
    dict(n='Yakın: ananın yüzü', c='Verir misin, yoksa|‘oğul Deli Dumrul’ diye|ağlar mısın?”', set='inside', cam=[(1140, 1200, 2.3), (1140, 1196, 2.6)], blur=True,
         a=[('mother', dict(MO, e='fear'), dict(e='grief'), 0.4)]),
    dict(n='İkili: “ay oğul”', c='Anası dedi:|“Oğul, oğul, ay oğul!', set='inside', cam=[(980, 1260, 1.6), (980, 1256, 1.7)],
         a=[('dumrul', dict(DI, x=780, e='neutral')), ('mother', dict(MO, e='grief', shake=0.6), dict(armL=80, armR=-80), 0.1)]),
    dict(n='Yakın: eller karında', c='Dokuz ay dar karnımda|taşıdığım,', set='inside', cam=[(1140, 1330, 2.0), (1140, 1326, 2.2)], blur=True,
         a=[('mother', dict(MO, e='grief'), dict(armL=-30, armR=30), 0.1)]),
    dict(n='Yakın: gözyaşı', c='ak sütümü doya doya|emzirdiğim oğul!', set='inside', cam=[(1140, 1200, 2.8), (1140, 1196, 3.1)], blur=True,
         a=[('mother', dict(MO, e='grief', shake=0.8, armL=-30, armR=30))]),
    dict(n='Yakın: yüz çevirir', c='Dünya şirin,|can aziz;', set='inside', cam=[(1140, 1200, 2.4), (1140, 1196, 2.6)], blur=True,
         a=[('mother', dict(MO, e='grief'), dict(e='refuse', hr=12), 0.3)]),
    dict(n='İkili: sırtını döner', c='canıma kıyamam,|bunu böyle bil.”', set='inside', cam=[(980, 1260, 1.5), (980, 1260, 1.6)],
         a=[('dumrul', dict(DI, x=780, e='neutral'), dict(e='shock'), 0.4), ('mother', dict(MO, e='refuse'), dict(x=1220, hr=14), 0.2)]),
    dict(n='Geniş: ışıkta tek başına', c='Anası da|canını vermedi.', set='inside', cam=[(800, 1300, 1.3), (800, 1280, 1.1)],
         a=[('dumrul', dict(DI, x=800, e='neutral', hr=16)), ('mother', dict(MO, x=1260, e='refuse', hr=14)), ('father', dict(FA, x=300, e='refuse', flip=True))]),
    dict(n='Geniş: Azrail içeri girer', c='Azrail, Deli Dumrul’un|canını almaya geldi.', set='inside', cam=[(600, 1240, 1.3), (560, 1230, 1.5)], punch=True, hold=0.8,
         a=[('dumrul', dict(DI, x=800, e='shock', armL=60, armR=-60)), ('azrail', dict(x=-100, y=1180, s=0.56, e='wrath', spread=0.5, z=3000), dict(x=330, spread=1.4, armL=40, armR=-40), 0.05)]),
]

WI = dict(x=920, y=1250, s=0.5)
B0 = dict(x=1100, y=1600, s=0.5); B1 = dict(x=1250, y=1610, s=0.5)
SCENES['veda'] = [
    dict(n='İkili: “aman!”', c='Dumrul, “Bre Azrail,|aman!', set='inside', cam=[(580, 1240, 1.5), (590, 1236, 1.6)],
         a=[('dumrul', dict(DI, x=800, e='shock', armL=70, armR=-70, shake=0.6)), ('azrail', dict(x=330, y=1180, s=0.56, e='wrath', spread=1.4, armL=40, armR=-40))]),
    dict(n='Yakın: eş', c='Yad kızı helalim,', set='inside', cam=[(920, 1180, 2.4), (920, 1176, 2.6)], blur=True, a=[('wife', dict(WI, e='neutral'))]),
    dict(n='Yakın: iki oğlancık', c='ondan iki|oğlancığım var.', set='inside', cam=[(1175, 1420, 2.4), (1175, 1416, 2.6)], blur=True, a=[('boy0', dict(B0)), ('boy1', dict(B1))]),
    dict(n='İkili: mühlet ister', c='Emanetimi ısmarlayayım,|canımı ondan sonra al” dedi.', set='inside', cam=[(580, 1240, 1.5), (580, 1240, 1.6)],
         a=[('dumrul', dict(DI, x=800, e='neutral', armL=70, armR=-20)), ('azrail', dict(x=330, y=1180, s=0.56, e='stern', spread=1.2), dict(spread=0.6, hr=10), 0.3)]),
    dict(n='Geniş: eşine varır', c='Eşine vardı:', set='inside', cam=[(780, 1260, 1.3), (840, 1260, 1.4)],
         a=[('dumrul', dict(DI, x=200, e='neutral', walk=True), dict(x=600, glide=True), 0.0), ('wife', dict(WI, e='joy'), dict(e='fear'), 0.6), ('boy0', dict(B0)), ('boy1', dict(B1))]),
    dict(n='Geniş: dağlar', c='“Yüksek kara dağlarım|sana yaylak olsun;', set='steppe', cam=[(500, 900, 1.5), (1100, 880, 1.5)], a=[]),
    dict(n='Eşya: soğuk sular', c='soğuk sularım|sana içecek,', set='river', cam=[(600, 1500, 1.5), (900, 1520, 1.6)], a=[]),
    dict(n='Eşya: atlar', c='tavla tavla atlarım|sana binek olsun.', set='oba', cam=[(500, 1400, 1.3), (1000, 1400, 1.3)],
         a=[('horse', dict(x=360, y=1380, s=0.42)), ('horse', dict(x=760, y=1420, s=0.46)), ('horse', dict(x=1180, y=1390, s=0.42, flip=True))]),
    dict(n='İkili: başka birine var', c='Gözün kimi tutarsa,|gönlün kimi severse|ona var;', set='inside', cam=[(760, 1220, 1.6), (770, 1220, 1.7)],
         a=[('dumrul', dict(DI, x=600, e='neutral', hr=14)), ('wife', dict(WI, e='fear'), dict(e='grief'), 0.3)]),
    dict(n='Geniş: oğlancıklar', c='iki oğlancığı|öksüz koma.”', set='inside', cam=[(1000, 1380, 1.6), (980, 1340, 1.4)], hold=0.6,
         a=[('dumrul', dict(DI, x=600, e='neutral', hr=14)), ('wife', dict(WI, e='grief', armL=40, armR=-40)), ('boy0', dict(B0, x=1000, e='grief')), ('boy1', dict(B1, x=1130, e='fear'))]),
]

SCENES['es'] = [
    dict(n='Yakın: “ne dersin?”', c='Kadın dedi:|“Ne dersin, ne söylersin?', set='inside', cam=[(920, 1180, 2.3), (920, 1176, 2.6)], punch=True, blur=True,
         a=[('wife', dict(WI, e='grief'), dict(e='scold'), 0.3)]),
    dict(n='İkili: elini uzatır', c='Göz açıp gördüğüm,|gönül verip sevdiğim|koç yiğidim!', set='inside', cam=[(760, 1220, 1.6), (760, 1216, 1.75)],
         a=[('dumrul', dict(DI, x=600, e='neutral', hr=10)), ('wife', dict(WI, e='grief', armL=12), dict(armL=96, e='joy'), 0.2)]),
    dict(n='Geniş: dağlar', c='Senden sonra kara dağlarını|ben neyleyim?', set='steppe', cam=[(1100, 880, 1.5), (500, 900, 1.5)], a=[]),
    dict(n='Eşya: bozkırda tek taş', c='Yaylarsam|mezarım olsun;', set='steppe', cam=[(520, 1640, 2.6), (520, 1636, 2.9)], a=[]),
    dict(n='Eşya: kızıla dönen su', c='soğuk sularını içersem|kanım olsun.', set='river', cam=[(700, 1520, 1.6), (760, 1520, 1.7)], a=[], fx=fx_red()),
    dict(n='Tepki: sırtını dönen ana baba', c='Senin o muhannet|anan baban', set='inside', cam=[(700, 1260, 1.4), (720, 1260, 1.5)],
         a=[('father', dict(FA, x=480, e='refuse', flip=True)), ('mother', dict(MO, x=900, e='refuse', hr=14))]),
    dict(n='Yakın: öfke', c='bir canda ne var ki|sana kıyamamışlar?', set='inside', cam=[(920, 1180, 2.5), (920, 1176, 2.8)], blur=True,
         a=[('wife', dict(WI, e='scold', shake=0.6))]),
    dict(n='Geniş: yeri, göğü gösterir', c='Yer tanık olsun,|gök tanık olsun,', set='oba', cam=[(760, 1500, 1.3), (760, 1000, 1.3)],
         a=[('wife', dict(x=760, y=1300, s=0.5, e='scold', armR=-12), dict(armR=-170, armL=30), 0.4)]),
    dict(n='Yakın: ışık altında', c='kadir Tanrı|tanık olsun:', set='oba', cam=[(760, 1230, 2.0), (760, 1220, 2.2)], blur=True,
         a=[('wife', dict(x=760, y=1300, s=0.5, e='grief', armL=150, armR=-150))], fx=fx_rays(0.5)),
    dict(n='İkili: canını sunar', c='benim canım|senin canına|kurban olsun!”', set='inside', cam=[(760, 1240, 1.5), (760, 1230, 1.65)], punch=True, hold=0.8,
         a=[('dumrul', dict(DI, x=560, e='neutral'), dict(e='shock'), 0.3), ('wife', dict(WI, e='grief'), dict(e='joy', armL=110, armR=-110), 0.1), ('boy0', dict(B0)), ('boy1', dict(B1))]),
]

SCENES['ikinci-dua'] = [
    dict(n='Geniş: Azrail hatuna yürür', c='Azrail hatunun canını|almaya geldi.', set='inside', cam=[(700, 1240, 1.3), (760, 1240, 1.45)],
         a=[('azrail', dict(x=100, y=1180, s=0.56, e='wrath', spread=1.3, walk=True, z=1400), dict(x=520, glide=True), 0.0), ('wife', dict(WI, e='fear', armL=60, armR=-60)), ('boy0', dict(B0, x=1000, e='fear')), ('boy1', dict(B1, x=1130, e='fear'))]),
    dict(n='İkili: araya girer', c='Dumrul yoldaşına|kıyamadı,', set='inside', cam=[(760, 1240, 1.5), (760, 1236, 1.65)], punch=True,
         a=[('azrail', dict(x=440, y=1180, s=0.56, e='wrath', spread=1.3, z=1400)), ('dumrul', dict(DI, x=1100, e='anger', z=1900), dict(x=700, armL=110, armR=-110), 0.05), ('wife', dict(WI, x=980, e='fear'))]),
    dict(n='Yakın: göğe yalvarır', c='Allah’a yalvardı:', set='inside', cam=[(700, 1180, 2.0), (700, 1160, 2.2)], blur=True,
         a=[('dumrul', dict(DI, x=700, e='neutral', hr=-16), dict(armL=150, armR=-150), 0.15)], fx=fx_rays(0.5)),
    dict(n='Geniş: yol üstünde imaretler', c='“Ulu yollar üstüne|senin için|imaretler yapayım;', set='oba', cam=[(400, 1200, 1.2), (1000, 1200, 1.2)], a=[]),
    dict(n='İkili: açı doyurur', c='aç görsem|senin için doyurayım,', set='oba', cam=[(760, 1300, 1.5), (760, 1296, 1.6)],
         a=[('dumrul', dict(x=920, y=1250, s=0.5, e='smug', armL=10), dict(armL=80), 0.15), ('trav', dict(x=560, y=1330, s=0.42, e='fear'), dict(e='joy'), 0.5), ('goblet', dict(x=742, y=1400, s=0.6, z=3000))]),
    dict(n='İkili: çıplağı giydirir', c='çıplak görsem|senin için giydireyim.', set='oba', cam=[(760, 1300, 1.5), (760, 1296, 1.6)],
         a=[('dumrul', dict(x=920, y=1250, s=0.5, e='smug', armL=80)), ('extra1', dict(x=560, y=1400, s=0.6, robe=C.SKIN_L), dict(robe=C.RED), 0.5)]),
    dict(n='İkili: el ele', c='Alırsan ikimizin canını|birlikte al,', set='inside', cam=[(760, 1240, 1.5), (760, 1236, 1.6)],
         a=[('dumrul', dict(DI, x=640, e='neutral', hr=-12, armR=-50)), ('wife', dict(WI, x=900, e='grief', armL=50, hr=-10))], fx=fx_rays(0.5)),
    dict(n='Yakın: ikisi birden', c='bırakırsan ikimizin canını|birlikte bırak,', set='inside', cam=[(770, 1180, 2.0), (770, 1176, 2.2)], blur=True,
         a=[('dumrul', dict(DI, x=640, e='neutral', hr=-12, armR=-50)), ('wife', dict(WI, x=900, e='grief', armL=50, hr=-10))], fx=fx_rays(0.6)),
    dict(n='Geniş: gökler', c='keremi çok|kadir Tanrı!”', set='heaven', cam=[(750, 1300, 1.0), (750, 760, 1.2)], a=[], hold=0.6),
]

SCENES['bagis'] = [
    dict(n='Geniş: ışık ısınır', c='Hak Teala’ya|Dumrul’un sözü|hoş geldi.', set='heaven', cam=[(750, 900, 1.1), (750, 760, 1.25)], a=[], fx=fx_rays(0.7)),
    dict(n='Yakın: Azrail dinler', c='Azrail’e buyurdu:', set='heaven', cam=[(750, 1240, 2.2), (750, 1236, 2.4)],
         a=[('azrail', dict(AZH, e='neutral', hr=14, spread=0.45), dict(hr=-8), 0.3)]),
    dict(n='Geniş: ana ile baba', c='“Deli Dumrul’un anasının|babasının canını al;', set='inside', cam=[(1000, 1260, 1.4), (1000, 1260, 1.5)],
         a=[('father', dict(FA, e='neutral')), ('mother', dict(MO, e='neutral'))]),
    dict(n='İkili: bağışlanan ömür', c='o iki helalliye|yüz kırk yıl|ömür verdim.”', set='inside', cam=[(770, 1220, 1.6), (770, 1216, 1.75)],
         a=[('dumrul', dict(DI, x=640, e='shock'), dict(e='smug'), 0.4), ('wife', dict(WI, x=900, e='fear'), dict(e='joy'), 0.4)], fx=both(fx_rays(0.6), fx_years())),
    dict(n='Geniş: Azrail ana babanın ardında', c='Azrail, ananın babanın|canını hemen aldı.', set='inside', cam=[(1000, 1240, 1.3), (1000, 1260, 1.45)],
         a=[('azrail', dict(x=1000, y=1100, s=0.6, e='stern', spread=0.4, z=100), dict(spread=1.4), 0.1), ('father', dict(FA, e='fear'), dict(e='blink', rot=-14, hr=16), 0.45), ('mother', dict(MO, e='fear'), dict(e='blink', rot=12, hr=14), 0.5)],
         fx=fx_fade_beam()),
    dict(n='Geniş: yüz kırk yıl', c='Deli Dumrul|yüz kırk yıl daha|yoldaşıyla yaşadı.', set='oba', cam=[(820, 1300, 1.3), (820, 1260, 1.15)], hold=1.0,
         a=[('dumrul', dict(x=640, y=1250, s=0.5, e='smug', armR=-50)), ('wife', dict(x=920, y=1270, s=0.48, e='joy', armL=50)), ('boy0', dict(x=780, y=1620, s=0.5, walk=True)), ('boy1', dict(x=1060, y=1630, s=0.5, walk=True))],
         fx=fx_years()),
]

DK = dict(x=640, y=1230, s=0.56)
SCENES['dede'] = [
    dict(n='Geniş: Dede Korkut ateş başında', c='Dedem Korkut gelip|boy boyladı,|soy soyladı:', set='feast', cam=[(700, 1000, 1.0), (680, 1040, 1.15)],
         a=[('dede', dict(DK, e='joy'))] + CROWD + [('dumrul', dict(x=1040, y=1260, s=0.5, e='smug'))]),
    dict(n='Yakın: Dede', c='“Bu boy|Deli Dumrul’un olsun;', set='feast', cam=[(640, 1130, 2.2), (640, 1126, 2.4)], blur=True, nofore=True,
         a=[('dede', dict(DK, e='joy', hr=-4), dict(hr=4), 0.4)]),
    dict(n='Eşya: kopuz', c='benden sonra|alp ozanlar söylesin,', set='feast', cam=[(640, 1420, 2.6), (660, 1400, 2.8)], blur=True, nofore=True,
         a=[('dede', dict(DK, e='joy'))]),
    dict(n='Tepki: dinleyenler', c='alnı açık cömert erenler|dinlesin.”', set='feast', cam=[(1000, 1340, 1.5), (1150, 1340, 1.5)],
         a=CROWD + [('dumrul', dict(x=1040, y=1260, s=0.5, e='smug'))]),
    dict(n='Yakın: dua', c='Sonra dua etti:', set='feast', cam=[(640, 1130, 2.0), (640, 1100, 2.2)], blur=True, nofore=True,
         a=[('dede', dict(DK, e='neutral', hr=-10))], fx=fx_rays(0.35)),
    dict(n='Geniş: kara dağlar', c='“Yerli kara dağların|yıkılmasın.', set='steppe', cam=[(500, 900, 1.5), (1100, 880, 1.5)], a=[]),
    dict(n='Eşya: ulu ağaç', c='Gölgeli ulu ağacın|kesilmesin.', set='steppe', cam=[(330, 980, 1.25), (330, 880, 1.45)], a=[]),
    dict(n='Eşya: coşkun su', c='Coşkun akan güzel suyun|kurumasın.', set='river', cam=[(560, 1500, 1.4), (940, 1500, 1.5)], a=[]),
    dict(n='Yakın: son söz', c='Kadir Tanrı seni|namerde muhtaç etmesin.”', set='feast', cam=[(640, 1130, 2.0), (640, 1140, 1.7)], nofore=True, hold=1.5,
         a=[('dede', dict(DK, e='joy'))], fx=fx_rays(0.3)),
]
