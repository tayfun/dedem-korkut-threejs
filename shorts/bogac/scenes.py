"""Boğaç Han — "Babasının Okladığı Oğul": on üç sahnenin çekim listeleri.
Metin, onaylanan kısaltılmış anlatıdır (özgün site metninden seçilip sıkıştırılmış; uydurma yok)."""
import math, os
from ..kit import *
from . import cast as B, sets as S
from ..tepegoz import cast as T
from ..deli_dumrul import cast as C0, cast2 as K, sets as S0, film as F, engine as E, voice as V
from ..deli_dumrul.engine import lerp, ease, spring, at
from ..deli_dumrul.scenes import fx_impact, fx_rays, fx_big

ORDER = ['otag', 'hatun', 'dilek', 'meydan', 'boga', 'iftira', 'av', 'ok', 'hizir', 'merhem', 'tutsak', 'kavga', 'son']
TITLES = {s: f'{i + 1}. {s}' for i, s in enumerate(ORDER)}
TEXT = ["Bayındır Han toy etti; bir yere ak otağ, bir yere kızıl otağ, bir yere kara otağ kurdurdu: “Oğlu olanı ak otağa, kızı olanı kızıl otağa, oğlu kızı olmayanı kara otağa kondurun.” Dirse Han’ı kara otağa kondurdular: “Oğlu kızı olmayanı Tanrı Teala kargamıştır, biz de kargarız.”",
        "Dirse Han kalkıp evine gitti; hatununa öfkelendi: “Han kızı, bu ayıp senden midir, benden midir?” Hatun dedi: “Bana kızma. Ulu toy eyle; aç görsen doyur, çıplak görsen donat. Olur ki bir ağzı dualının alkışıyla Tanrı bize bir evlat verir.”",
        "Dirse Han ulu toy eyledi, hacet diledi. Bir ağzı dualının alkışıyla Allah Teala bir evlat verdi: hatunu bir oğlan doğurdu. At ayağı külük, ozan dili çevik olur; oğlan on beş yaşına girdi.",
        "Bayındır Han’ın bir boğası vardı; katı taşa boynuz ursa un gibi öğütürdü. Bir yaz boğayı meydanın ortasında koyuverdiler. Dirse Han’ın oğlu üç oğlanla aşık oynuyordu. “Kaçın!” dediler. Üç oğlan kaçtı; Dirse Han’ın oğlu kaçmadı.",
        "Boğa oğlanın üstüne sürdü. Oğlan yumruğunu alnına dayadı, meydanın başına dek sürdü. Sonra yumruğunu çekip yolundan savuldu; boğa tepesinin üstüne düştü. Oğlan bıçağıyla başını kesti. Dedem Korkut geldi: “Hey Dirse Han, senin oğlunun adı Boğaç olsun.”",
        "Dirse Han oğlana beylik verdi, taht verdi. Oğlan babasının kırk yiğidini anmaz oldu. Kırk yiğit haset eyledi, Dirse Han’a vardı: “Oğlun kötü koptu; ak sakallı kocanın ağzına sövdü, atasına kast eyledi.” Dirse Han, “Getirin, öldüreyim” dedi.",
        "Kırk namert dedi: “Ava çık; av avlarken oğlunu okla vur, öldür.” Avda oğlan geyiği kovup babasının önüne getirdi. Namertler dedi: “Görüyor musun, atıp seni vuracak. O seni öldürmeden sen onu öldür.”",
        "Dirse Han katı yayını çekti, oğlanı iki küreğinin arasından vurdu. Alaca kanı şorladı; oğlan atının boynunu kucakladı, yere düştü. Dirse Han oğlancığının üstüne kapanmak istedi; kırk namert bırakmadı.",
        "Hatunu baktı: iki giden bir geliyor. “Yavrum hani?” dedi; Dirse Han ses vermedi. Hatun kırk ince belli kızı aldı, oğlunu aramaya gitti. Oğlan yıkılmış yatarken boz atlı Hızır geldi, yarasını üç kez sıvazladı: “Korkma oğlan. Dağ çiçeği ile ananın sütü sana merhemdir.”",
        "Anası oğlunu al kana bulanmış buldu, üstüne kapandı. Kızlar dağ çiçeği topladı. Anası memesini bir sıktı, sütü gelmedi; iki sıktı, gelmedi; üçüncüde kendine vurdu, kanla karışık süt geldi. Yarasına sürdüler; kırk günde yarası sağaldı.",
        "Kırk namert bunu duydu: “Dirse Han oğlunu görürse bizi hep kırar.” Dirse Han’ı tuttular, ak ellerini ardına bağladılar, kâfir ellerine yöneldiler. Hatun oğluna vardı: “Baban sana kıydıysa sen babana kıyma!” Oğlan kılıcını kuşandı, kırk yiğidiyle ardlarınca gitti.",
        "Dirse Han oğlunu tanımadı; kopuzunu aldı: “Yiğit, bu savaşı bırak! Benim bir oğlum vardı, öldürdüm; günahı benim boynuma.” Oğlan dedi: “Aklı şaşmış bir babayı komam kırk namerde!” Kiminin boynunu vurdu, kimini tutsak eyledi; babasını kurtardı.",
        "Dirse Han oğlunun sağ olduğunu burada bildi. Dedem Korkut gelip boy boyladı, soy soyladı: “Yerli kara dağların yıkılmasın, gölgeli ulu ağacın kesilmesin.”"]

# ----------------------------------------------------------------------------- oyuncu türleri
g = lambda p, k, d=0: p.get(k, d)
_dirse = lambda p, e: B.dirse(e, g(p, 'armL', 12), g(p, 'armR', -12), g(p, 'hr'), g(p, 'bow', False), g(p, 'bound', False), g(p, 'kopuz', False))
_bogac = lambda p, e: B.bogac(e, g(p, 'armL', 10), g(p, 'armR', -10), g(p, 'hr'), g(p, 'poseR', 'open'), g(p, 'sword', False), g(p, 'knife', False))


def _kan(p, e):
    reseed('kan')
    return fill(ellipse(0, 0, 150, 34, 12, 0.12), B.RED, 1.0) + fill(ellipse(-110, 20, 50, 14, 8, 0.2), B.RED, 0.8) + fill(ellipse(40, -6, 60, 10, 8, 0.1), B.SKIN_L, 0.5, op=0.35)


E.KINDS.update({
    'bogac': (480, _bogac), 'dirse': (602, _dirse),
    'hatun': (500, lambda p, e: B.hatun(e, g(p, 'armL', 14), g(p, 'armR', -14), g(p, 'hr'))),
    'bayindir': (542, lambda p, e: B.bayindir(e, g(p, 'armL', 14), g(p, 'armR', -14), g(p, 'hr'))),
    'namert0': (482, lambda p, e: B.namert(0, e, g(p, 'sword', False), g(p, 'armR', -12))), 'namert1': (482, lambda p, e: B.namert(1, e, g(p, 'sword', False), g(p, 'armR', -12))),
    'namert2': (482, lambda p, e: B.namert(2, e, g(p, 'sword', False), g(p, 'armR', -12))),
    'hizir': (520, lambda p, e: B.hizir(e, g(p, 'armR', -12))),
    'kiz0': (470, lambda p, e: B.kiz(0, e, g(p, 'armL', 14), g(p, 'armR', -14))), 'kiz1': (470, lambda p, e: B.kiz(1, e, g(p, 'armL', 14), g(p, 'armR', -14))), 'kiz2': (470, lambda p, e: B.kiz(2, e, g(p, 'armL', 14), g(p, 'armR', -14))),
    'alp0': (480, lambda p, e: T.alp(0, e)), 'alp1': (480, lambda p, e: T.alp(1, e)), 'alp2': (480, lambda p, e: T.alp(2, e)),
    'bull': (250, lambda p, e: B.bull(g(p, 'charge', False), g(p, 'head', True), g(p, 'snort', 0.0))), 'bullhead': (0, lambda p, e: B.bull(only_head=True)),
    'deer': (210, lambda p, e: B.deer()),
    'at': (330, lambda p, e: B.horse(g(p, 'col', None))),
    'atli_dirse': (330, lambda p, e: B.mounted(_dirse(p, e), 'dirse', B.RED, 300, B.LEATHER)),
    'atli_bogac': (330, lambda p, e: B.mounted(_bogac(p, e), 'bogac', B.COBALT, 250)),
    'atli_hizir': (330, lambda p, e: B.mounted(B.hizir(e), 'hizir', B.PALE, 280)),
    'atli_hatun': (330, lambda p, e: B.mounted(B.hatun(e), 'hatun', B.PALE, 270)),
    'atli_namert': (330, lambda p, e: B.mounted(B.namert(g(p, 'k', 0), e), 'namert', B.COAT, 250, B.EARTH_D if hasattr(B, 'EARTH_D') else B.LEATHER)),
    'asik': (0, lambda p, e: B.asik()), 'cicek': (0, lambda p, e: B.cicek()), 'kundak': (0, lambda p, e: B.kundak()), 'taht': (150, lambda p, e: B.taht()),
    'arrow': (0, lambda p, e: T.arrow()), 'kan': (0, _kan),
})
E.STILL += ['alp', 'bull', 'deer', 'at', 'asik', 'cicek', 'kundak', 'taht', 'arrow', 'kan', 'namert']
E.HEADS += ['bogac', 'dirse', 'hatun', 'bayindir']
E.TEMPO.update({'bogac': (2.6, 5.2), 'dirse': (1.4, 3.6), 'hatun': (2.0, 4.5), 'bayindir': (1.3, 3.4), 'bull': (1.5, 3.6), 'hizir': (1.2, 4.5), 'atli_dirse': (1.5, 3.8)})
E.EXTRA_MOTION.update({
    'bull': lambda p, t, i: (0, 5 * math.sin(t * 2.2), 0),                                           # solur
    'deer': lambda p, t, i: (0, -abs(math.sin(t * 6)) * 5, 0),
    'namert0': lambda p, t, i: (0, 0, 1.5 * math.sin(t * 1.3)), 'namert1': lambda p, t, i: (0, 0, 1.5 * math.sin(t * 1.5 + 1)), 'namert2': lambda p, t, i: (0, 0, 1.5 * math.sin(t * 1.1 + 2)),
    'hizir': lambda p, t, i: (0, 4 * math.sin(t * 1.4), 0),
    'kundak': lambda p, t, i: (0, 0, 3 * math.sin(t * 2.4)),
})

_life = lambda n, dy: (lambda t: [(-10, E.birds(t, n)), (5000, E.dust(t, dy, 5))])
E.SETS.update({
    'toy': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.toy, life=_life(4, 1580)),
    'oba': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.oba, life=_life(3, 1560)),
    'meydan': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.meydan, life=_life(5, 1700)),
    'dag': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.dag, life=lambda t: [(-10, E.birds(t, 6))]),
    'yol': dict(bg=S.DAY, sky=S.sky, back=S.peaks, mid=S.yol, life=_life(4, 1600)),
})


# ----------------------------------------------------------------------------- ekran uzayı çizimleri
def after(fx, t0):
    """Bir efekti çekimin t0 anından sonra başlatır."""
    return lambda u: fx((u - t0) / (1 - t0)) if u > t0 else ''


def fx_spurt(x=540, y=800, n=18):
    """Yaradan fışkıran kan."""
    def fx(u):
        reseed('fx-spurt'); k = ease(min(1, u * 2.2)); s = ''
        for _ in range(n):
            a = R(-2.7, -0.4); d = R(100, 420) * k; r = R(9, 24) * (1 - 0.4 * u)
            s += fill(ellipse(x + math.cos(a) * d, y + math.sin(a) * d + 600 * u * u, r, r * R(1.1, 1.9), 7, 0.2, a + 1.57), B.RED, 0.6)
        return s
    return fx


def fx_touch(x=540, y=900):
    """Hızır'ın eli yarayı üç kez sıvazlar: üç ışık halkası."""
    def fx(u):
        k = (u * 3) % 1
        return fill(ellipse(x, y, 60 + 200 * k, 40 + 130 * k, 14), B.PALE, 0, op=0.55 * (1 - k)) + sparkle(x, y, 50 + 30 * math.sin(F.NOW * 9), B.GOLD)
    return fx


def fx_milk():
    """Avuçta kanla karışık süt."""
    def fx(u):
        k = ease(min(1, u * 1.5))
        s = at(C0.hand(True, 'open', False, 1), 560, 1180, 4.6, 196)
        pool = ellipse(540, 1110, 150 * k + 8, 70 * k + 4, 14, 0.07)
        s += fill(pool, B.PALE, 0.8) + ink(pool, 3, closed=True, wob=0.4)
        s += ink([(440, 1100), (510, 1130), (580, 1096), (650, 1124)], 16 * k + 0.5, col=B.RED, op=0.9, wob=0.6, taper=(0.2, 0.4)) + ink([(480, 1140), (540, 1150), (600, 1136)], 9 * k + 0.5, col=B.RED, op=0.8, wob=0.6, taper=(0.2, 0.4))
        return s + fill(ellipse(545, 640 + 430 * min(1, u * 2.5), 12, 20, 7), B.PALE, 0.4)
    return fx


fx_red = lambda u: f'<rect width="1080" height="1920" fill="{B.RED}" opacity="{0.45 * math.exp(-u * 6):.2f}"/>'
scr = lambda cam, x, y: (540 + (x - cam[0]) * cam[2], 960 + (y - cam[1]) * cam[2])


# ----------------------------------------------------------------------------- yerler: ayak tabanının bastığı yer verilir
def P(kind, x, feet=1480, s=0.5, **kw):
    return dict(x=x, y=feet - E.KINDS[kind][0] * s, s=s, **kw)


def Q(kind, feet=None, s=0.5, **kw):
    if feet is not None: kw['y'] = feet - E.KINDS[kind][0] * s
    return kw


LIE = dict(x=760, y=1640, s=0.5, rot=-88, e='blink', z=1650)        # vurulmuş oğlan: baş solda, ayak sağda
ARW = dict(x=820, y=1560, s=0.9, rot=80, z=1660)                    # sırtındaki ok
SCENES = {}

SCENES['otag'] = [
    dict(n='Geniş: Bayındır Han’ın toyu', c='Bayındır Han|toy etti;', set='toy', cam=[(750, 1150, 1.0), (750, 1200, 1.12)],
         a=[('bayindir', P('bayindir', 700, 1560, e='joy'), dict(armL=110, armR=-110), 0.25), ('alp0', P('alp0', 380, 1600, e='joy')), ('alp2', P('alp2', 1040, 1620, e='joy')), ('alp1', P('alp1', 180, 1680, e='neutral'))]),
    dict(n='Kaydırma: üç otağ', c='bir yere ak otağ,|bir yere kızıl otağ,|bir yere kara otağ|kurdurdu:', set='toy', cam=[(290, 1120, 1.9), (1230, 1130, 1.9)], a=[]),
    dict(n='Yakın: Bayındır buyurur', c='“Oğlu olanı ak otağa,|kızı olanı kızıl otağa,', set='toy', cam=[(700, 1330, 2.0), (700, 1326, 2.2)], blur=True,
         a=[('bayindir', P('bayindir', 700, 1560, e='neutral', armL=95, armR=-14), dict(armL=14, armR=-150), 0.5)]),
    dict(n='Orta: kara otağ buyruğu', c='oğlu kızı olmayanı|kara otağa kondurun.”', set='toy', cam=[(860, 1280, 1.5), (960, 1280, 1.5)], punch=True,
         a=[('bayindir', P('bayindir', 700, 1560, e='scold', armR=-14), dict(armR=-96), 0.15), ('alp0', P('alp0', 420, 1600, e='neutral'))]),
    dict(n='Geniş: Dirse Han’ı kara otağa kondururlar', c='Dirse Han’ı|kara otağa kondurdular:', set='toy', cam=[(1000, 1280, 1.3), (1140, 1290, 1.4)],
         a=[('dirse', P('dirse', 560, 1500, e='neutral', walk=True), dict(x=1200, glide=True), 0.0), ('alp0', P('alp0', 380, 1540, e='scold', walk=True), dict(x=900, glide=True), 0.0)]),
    dict(n='İkili: “biz de kargarız”', c='“Oğlu kızı olmayanı|Tanrı Teala kargamıştır,|biz de kargarız.”', set='toy', cam=[(1060, 1250, 1.7), (1080, 1246, 1.9)], hold=0.4,
         a=[('dirse', P('dirse', 1200, 1500, e='shock'), dict(e='anger', shake=0.5), 0.55), ('alp0', P('alp0', 900, 1540, e='scold'))]),
]

SCENES['hatun'] = [
    dict(n='Geniş: evine döner', c='Dirse Han kalkıp|evine gitti;', set='oba', cam=[(700, 1180, 1.1), (720, 1200, 1.2)],
         a=[('dirse', P('dirse', -160, 1500, e='anger', walk=True), dict(x=520, glide=True), 0.0), ('hatun', P('hatun', 940, 1500, e='neutral', flip=True))]),
    dict(n='İkili: öfkelenir', c='hatununa öfkelendi:', set='oba', cam=[(720, 1230, 1.5), (730, 1230, 1.7)], punch=True,
         a=[('dirse', P('dirse', 520, 1500, e='anger', armR=-12), dict(armR=-120, shake=0.5), 0.1), ('hatun', P('hatun', 940, 1500, e='neutral', flip=True), dict(e='fear'), 0.2)]),
    dict(n='Yakın: Dirse Han', c='“Han kızı,|bu ayıp senden midir,|benden midir?”', set='oba', cam=[(540, 1200, 2.2), (540, 1196, 2.5)], blur=True,
         a=[('dirse', P('dirse', 520, 1500, e='anger', armR=-120, armL=12, shake=0.4), dict(armR=-12, armL=100), 0.6)]),
    dict(n='Yakın: hatun', c='Hatun dedi:|“Bana kızma.', set='oba', cam=[(940, 1250, 2.3), (940, 1246, 2.5)], blur=True,
         a=[('hatun', P('hatun', 940, 1500, e='grief', flip=True), dict(e='neutral', armL=70, armR=-70), 0.4)]),
    dict(n='İkili: öğüt', c='Ulu toy eyle;|aç görsen doyur,|çıplak görsen donat.', set='oba', cam=[(730, 1240, 1.6), (740, 1240, 1.7)],
         a=[('dirse', P('dirse', 520, 1500, e='scold'), dict(e='neutral'), 0.5), ('hatun', P('hatun', 940, 1500, e='neutral', flip=True, armR=-14), dict(armR=-100), 0.15)]),
    dict(n='Yakın: umut', c='Olur ki bir ağzı dualının|alkışıyla Tanrı bize|bir evlat verir.”', set='oba', cam=[(940, 1240, 2.1), (940, 1200, 2.4)], blur=True, hold=0.4, fx=fx_rays(0.3),
         a=[('hatun', P('hatun', 940, 1500, e='joy', flip=True, armL=14, armR=-14), dict(armL=130, armR=-130), 0.3)]),
]

SCENES['dilek'] = [
    dict(n='Geniş: ulu toy', c='Dirse Han|ulu toy eyledi,', set='oba', cam=[(740, 1200, 1.05), (740, 1220, 1.15)],
         a=[('dirse', P('dirse', 620, 1480, e='joy'), dict(armL=100, armR=-100), 0.2), ('hatun', P('hatun', 900, 1490, e='joy')), ('alp0', P('alp0', 250, 1560, e='joy')), ('kiz0', P('kiz0', 1180, 1560, e='joy')), ('alp1', P('alp1', 60, 1640, e='joy')), ('kiz1', P('kiz1', 1380, 1640, e='joy'))]),
    dict(n='Geniş: el kaldırırlar', c='hacet diledi.', set='oba', cam=[(740, 1200, 1.3), (740, 1120, 1.3)],
         a=[('dirse', P('dirse', 620, 1480, e='grief', armL=100, armR=-100), dict(armL=160, armR=-160), 0.1), ('hatun', P('hatun', 900, 1490, e='grief', armL=14, armR=-14), dict(armL=150, armR=-150), 0.2)]),
    dict(n='Alt açı: gökten ışık', c='Bir ağzı dualının alkışıyla|Allah Teala|bir evlat verdi:', set='oba', cam=[(760, 1100, 1.5), (760, 1000, 1.6)], fx=fx_rays(0.6),
         a=[('dirse', P('dirse', 620, 1480, e='joy', armL=160, armR=-160)), ('hatun', P('hatun', 900, 1490, e='joy', armL=150, armR=-150))]),
    dict(n='İkili: kundak', c='hatunu bir oğlan|doğurdu.', set='oba', cam=[(780, 1270, 1.9), (780, 1266, 2.2)], punch=True, blur=True,
         a=[('hatun', P('hatun', 860, 1500, e='joy', armL=50, armR=-50)), ('kundak', dict(x=880, y=1400, s=0.62, z=3000)), ('dirse', P('dirse', 560, 1500, e='joy'), dict(armR=-70), 0.2)]),
    dict(n='Geniş: yıllar geçer', c='At ayağı külük,|ozan dili çevik olur;', set='oba', cam=[(700, 1250, 1.1), (820, 1250, 1.1)],
         a=[('at', P('at', -300, 1560, 0.5, flip=True, gallop=True), dict(x=1900, glide=True), 0.0), ('dede', P('dede', 1000, 1680, 0.46, e='joy'))]),
    dict(n='Orta: on beşinde', c='oğlan on beş yaşına|girdi.', set='oba', cam=[(740, 1250, 1.4), (740, 1240, 1.6)], punch=True, hold=0.4,
         a=[('dirse', P('dirse', 520, 1490, e='joy')), ('bogac', P('bogac', 750, 1540, e='joy'), dict(armR=-150, poseR='fist'), 0.2), ('hatun', P('hatun', 970, 1490, e='joy', flip=True))]),
]

BG = dict(x=1150, feet=1420)
SCENES['meydan'] = [
    dict(n='Orta: kapıda boğa', c='Bayındır Han’ın|bir boğası vardı;', set='meydan', cam=[(1050, 1230, 1.6), (1030, 1240, 1.8)],
         a=[('bull', P('bull', 1160, 1440, 0.7, snort=1))]),
    dict(n='Yakın: taşa boynuz', c='katı taşa boynuz ursa|un gibi öğütürdü.', set='meydan', cam=[(900, 1290, 1.9), (880, 1290, 2.0)], punch=True, blur=True, fx=after(fx_impact(330, 900), 0.2),
         a=[('bull', P('bull', 1200, 1460, 0.7, charge=True, snort=1), dict(x=960), 0.1)]),
    dict(n='Geniş: meydana koyuverirler', c='Bir yaz boğayı|meydanın ortasında|koyuverdiler.', set='meydan', cam=[(820, 1380, 1.0), (780, 1400, 1.1)],
         a=[('bull', P('bull', 1160, 1400, 0.7, snort=1, walk=True), dict(Q('bull', 1600, 0.7), x=900, glide=True), 0.0), ('alp0', P('alp0', 900, 1330, e='fear')), ('alp2', P('alp2', 1420, 1340, e='fear', flip=True))]),
    dict(n='Orta: aşık oynayanlar', c='Dirse Han’ın oğlu|üç oğlanla|aşık oynuyordu.', set='meydan', cam=[(400, 1530, 1.7), (400, 1530, 1.9)],
         a=[('bogac', P('bogac', 260, 1640, e='joy', armR=-40)), ('boy0', dict(x=470, y=1680, s=0.5, e='joy')), ('boy1', dict(x=620, y=1640, s=0.5, e='joy')), ('boy0', dict(x=120, y=1720, s=0.5, e='joy', flip=True)), ('asik', dict(x=400, y=1730, s=0.9, z=1731))]),
    dict(n='Geniş: “Kaçın!”', c='“Kaçın!” dediler.', set='meydan', cam=[(680, 1500, 1.15), (700, 1500, 1.25)], punch=True,
         a=[('bogac', P('bogac', 260, 1640, e='joy'), dict(e='neutral'), 0.2), ('boy0', dict(x=470, y=1680, s=0.5, e='joy'), dict(e='fear'), 0.15), ('boy1', dict(x=620, y=1640, s=0.5, e='joy'), dict(e='fear'), 0.2),
            ('boy0', dict(x=120, y=1720, s=0.5, e='joy', flip=True), dict(e='fear'), 0.25), ('asik', dict(x=400, y=1730, s=0.9, z=1731)),
            ('bull', P('bull', 1160, 1600, 0.7, charge=True, snort=1)), ('alp0', P('alp0', 1010, 1380, e='fear'), dict(shake=1), 0.05)]),
    dict(n='Geniş: üç oğlan kaçar', c='Üç oğlan kaçtı;', set='meydan', cam=[(420, 1540, 1.4), (400, 1540, 1.4)],
         a=[('bogac', P('bogac', 260, 1640, e='neutral')), ('boy0', dict(x=470, y=1680, s=0.5, e='fear', flip=True, walk=True), dict(x=-300, glide=True), 0.0), ('boy1', dict(x=620, y=1640, s=0.5, e='fear', flip=True, walk=True), dict(x=-200, glide=True), 0.05),
            ('boy0', dict(x=120, y=1720, s=0.5, e='fear', flip=True, walk=True), dict(x=-500, glide=True), 0.0), ('asik', dict(x=400, y=1730, s=0.9, z=1731))]),
    dict(n='Yakın: kaçmaz', c='Dirse Han’ın oğlu|kaçmadı.', set='meydan', cam=[(270, 1430, 2.3), (270, 1426, 2.7)], blur=True, hold=0.4,
         a=[('bogac', P('bogac', 260, 1640, e='neutral', armR=-10, poseR='fist'), dict(e='anger', armR=-150), 0.3)]),
]

_c2 = [(560, 1500, 1.7), (570, 1500, 1.8)]
SCENES['boga'] = [
    dict(n='Geniş: boğa sürer', c='Boğa oğlanın|üstüne sürdü.', set='meydan', cam=[(760, 1500, 1.1), (620, 1500, 1.15)],
         a=[('bogac', P('bogac', 260, 1640, e='anger', poseR='fist', armR=-150)), ('bull', P('bull', 1700, 1640, 0.7, charge=True, snort=1, walk=True), dict(x=760, glide=True), 0.0)]),
    dict(n='İkili: yumruk alında', c='Oğlan yumruğunu|alnına dayadı,', set='meydan', cam=_c2, punch=True, fx=after(fx_impact(*scr(_c2[1], 470, 1470)), 0.12),
         a=[('bogac', P('bogac', 300, 1640, e='anger', poseR='fist', armR=-150), dict(armR=-92, x=330), 0.1), ('bull', P('bull', 860, 1640, 0.7, charge=True, snort=1), dict(x=700, shake=0.6), 0.1)]),
    dict(n='Geniş: meydanın başına dek sürer', c='meydanın başına dek|sürdü.', set='meydan', cam=[(560, 1500, 1.3), (1000, 1500, 1.3)],
         a=[('bogac', P('bogac', 330, 1640, e='anger', poseR='fist', armR=-92, walk=True), dict(x=780, glide=True), 0.0), ('bull', P('bull', 700, 1640, 0.7, charge=True, snort=1, shake=0.5), dict(x=1150, glide=True), 0.0)]),
    dict(n='Orta: yolundan savulur', c='Sonra yumruğunu çekip|yolundan savuldu;', set='meydan', cam=[(920, 1520, 1.4), (880, 1540, 1.4)],
         a=[('bogac', P('bogac', 780, 1640, e='anger', poseR='fist', armR=-92), dict(Q('bogac', 1800), x=700, armR=-10, e='joy', arc=90), 0.3), ('bull', P('bull', 1150, 1640, 0.7, charge=True, snort=1), dict(x=880), 0.42)]),
    dict(n='Geniş: boğa tepesinin üstüne düşer', c='boğa tepesinin üstüne|düştü.', set='meydan', cam=[(760, 1500, 1.2), (700, 1500, 1.3)], punch=True, fx=after(fx_impact(520, 1050), 0.5),
         a=[('bogac', P('bogac', 980, 1800, e='joy')), ('bull', P('bull', 900, 1640, 0.7, charge=True), dict(x=520, y=1470, rot=-172, arc=240, land=0.62), 0.1)]),
    dict(n='Orta: başını keser', c='Oğlan bıçağıyla|başını kesti.', set='meydan', cam=[(620, 1480, 1.5), (640, 1480, 1.6)], fx=after(fx_spurt(680, 980, 14), 0.5),
         a=[('bull', dict(x=520, y=1470, s=0.7, rot=-172, head=True, z=1500), dict(head=False), 0.5), ('bullhead', dict(x=720, y=1520, s=0.01, rot=-170, z=1900), dict(x=880, y=1600, s=0.7, rot=-200, arc=80), 0.5),
            ('bogac', P('bogac', 760, 1700, e='anger', knife=True, armR=-160, z=1800), dict(armR=-30), 0.45)]),
    dict(n='Geniş: Dede Korkut oğlanı babasına götürür', c='Dedem Korkut geldi:', set='oba', cam=[(680, 1240, 1.2), (720, 1240, 1.3)],
         a=[('dede', P('dede', -200, 1500, 0.46, e='joy', walk=True), dict(x=600, glide=True), 0.0), ('bogac', P('bogac', -420, 1540, e='joy', walk=True), dict(x=380, glide=True), 0.0), ('dirse', P('dirse', 960, 1500, e='neutral', flip=True))]),
    dict(n='Orta: ad verir', c='“Hey Dirse Han,|senin oğlunun adı|Boğaç olsun.”', set='oba', cam=[(650, 1240, 1.35), (660, 1236, 1.45)], punch=True, hold=0.4,
         a=[('dede', P('dede', 600, 1500, 0.46, e='joy'), dict(hr=-10), 0.2), ('bogac', P('bogac', 380, 1540, e='joy'), dict(armR=-150, poseR='fist'), 0.5), ('dirse', P('dirse', 960, 1500, e='neutral', flip=True), dict(e='joy', armL=80, armR=-80), 0.5)]),
]

TH = dict(x=820, y=1500 - 75, s=0.5, z=1400)
NM = [('namert0', 300, 1560), ('namert1', 130, 1620), ('namert2', 470, 1640)]
SCENES['iftira'] = [
    dict(n='Geniş: beylik ve taht', c='Dirse Han oğlana|beylik verdi,|taht verdi.', set='oba', cam=[(700, 1230, 1.3), (740, 1230, 1.45)],
         a=[('taht', TH), ('bogac', P('bogac', 820, 1500, e='joy')), ('dirse', P('dirse', 480, 1500, e='joy', armR=-12), dict(armR=-84), 0.2)]),
    dict(n='Geniş: kırk yiğidi anmaz olur', c='Oğlan babasının|kırk yiğidini|anmaz oldu.', set='oba', cam=[(600, 1280, 1.3), (540, 1290, 1.4)],
         a=[('taht', TH), ('bogac', P('bogac', 820, 1500, e='joy'), dict(e='refuse', hr=16), 0.3)] + [(k, P(k, x, f, e='neutral'), dict(e='scold'), 0.5) for k, x, f in NM]),
    dict(n='Yakın: haset', c='Kırk yiğit|haset eyledi,', set='oba', cam=[(300, 1320, 2.0), (300, 1316, 2.3)], blur=True,
         a=[(k, P(k, x, f, e='scold'), dict(e='anger'), 0.4) for k, x, f in NM]),
    dict(n='Geniş: Dirse Han’a varırlar', c='Dirse Han’a vardı:', set='oba', cam=[(960, 1260, 1.3), (1000, 1260, 1.4)],
         a=[('dirse', P('dirse', 1220, 1500, e='neutral', flip=True)), ('namert1', P('namert1', 300, 1520, e='joy', walk=True), dict(x=940, glide=True), 0.0), ('namert0', P('namert0', 120, 1580, e='joy', walk=True), dict(x=740, glide=True), 0.0), ('namert2', P('namert2', -60, 1640, e='joy', walk=True), dict(x=560, glide=True), 0.0)]),
    dict(n='İkili: iftira', c='“Oğlun kötü koptu;|ak sakallı kocanın|ağzına sövdü,|atasına kast eyledi.”', set='oba', cam=[(1060, 1250, 1.8), (1080, 1246, 2.0)],
         a=[('dirse', P('dirse', 1220, 1500, e='neutral', flip=True), dict(e='shock'), 0.45), ('namert1', P('namert1', 940, 1520, e='joy', rot=0), dict(rot=10, x=980), 0.1), ('namert0', P('namert0', 740, 1580, e='joy'))]),
    dict(n='Yakın: “Getirin, öldüreyim”', c='Dirse Han,|“Getirin, öldüreyim”|dedi.', set='oba', cam=[(1220, 1200, 2.3), (1220, 1196, 2.7)], punch=True, blur=True, hold=0.4,
         a=[('dirse', P('dirse', 1220, 1500, e='anger', flip=True, shake=0.6, armL=12), dict(armL=150), 0.3)]),
]

RD = P('atli_dirse', 330, 1560, flip=True)
SCENES['av'] = [
    dict(n='İkili: tuzak', c='Kırk namert dedi:|“Ava çık;|av avlarken oğlunu|okla vur, öldür.”', set='oba', cam=[(1060, 1250, 1.6), (1080, 1250, 1.8)],
         a=[('dirse', P('dirse', 1220, 1500, e='anger', flip=True), dict(e='scold'), 0.5), ('namert2', P('namert2', 940, 1530, e='joy'), dict(rot=8, x=980), 0.2), ('namert0', P('namert0', 720, 1580, e='joy'))]),
    dict(n='Geniş: oğlan geyiği kovar', c='Avda oğlan|geyiği kovup', set='dag', cam=[(900, 1400, 1.1), (760, 1400, 1.1)],
         a=[('deer', P('deer', 1700, 1560, gallop=True), dict(x=700, glide=True), 0.0), ('atli_bogac', P('atli_bogac', 2000, 1600, e='joy', gallop=True), dict(x=1100, glide=True), 0.0)]),
    dict(n='Geniş: babasının önüne getirir', c='babasının önüne|getirdi.', set='dag', cam=[(700, 1400, 1.15), (640, 1400, 1.2)],
         a=[('atli_dirse', dict(RD, e='scold')), ('deer', P('deer', 1200, 1600, gallop=True), dict(x=620, glide=True), 0.0), ('atli_bogac', P('atli_bogac', 1500, 1620, e='joy', gallop=True), dict(x=960, glide=True), 0.0)]),
    dict(n='İkili: namert fısıldar', c='Namertler dedi:|“Görüyor musun,|atıp seni vuracak.', set='dag', cam=[(260, 1260, 1.8), (260, 1256, 2.0)], blur=True,
         a=[('atli_dirse', dict(RD, e='scold'), dict(e='shock'), 0.5), ('atli_namert', P('atli_namert', 80, 1620, e='joy', flip=True, k=1))]),
    dict(n='Yakın: “sen onu öldür”', c='O seni öldürmeden|sen onu öldür.”', set='dag', cam=[(90, 1250, 2.6), (90, 1246, 3.0)], punch=True, blur=True, hold=0.3,
         a=[('atli_namert', P('atli_namert', 80, 1620, e='anger', flip=True, k=1))]),
]

RB = P('atli_bogac', 1020, 1620, flip=True)
_c8 = [(1020, 1300, 2.0), (1020, 1296, 2.2)]
SCENES['ok'] = [
    dict(n='Yakın: katı yayını çeker', c='Dirse Han|katı yayını çekti,', set='dag', cam=[(340, 1230, 1.9), (340, 1226, 2.2)], blur=True,
         a=[('atli_dirse', dict(RD, e='anger', bow=True, armL=10), dict(armL=-70), 0.25)]),
    dict(n='Geniş: ok sırtından vurur', c='oğlanı iki küreğinin|arasından vurdu.', set='dag', cam=[(680, 1380, 1.1), (690, 1380, 1.12)], punch=True, fx=after(lambda u: group(fx_impact(0, 0)(u), *scr((690, 1380, 1.12), 960, 1300), 0, 0.5), 0.42),
         a=[('atli_dirse', dict(RD, e='anger', bow=True, armL=-70)), ('atli_bogac', dict(RB, e='joy'), dict(e='shock', shake=0.6), 0.42), ('arrow', dict(x=420, y=1260, s=0.9, z=3000), dict(x=950, y=1290, glide=True), 0.0)]),
    dict(n='Yakın: alaca kanı şorlar', c='Alaca kanı şorladı;', set='dag', cam=_c8, blur=True, fx=fx_spurt(*scr(_c8[1], 990, 1300)),
         a=[('atli_bogac', dict(RB, e='shock', shake=0.5)), ('arrow', dict(x=940, y=1290, s=0.9, rot=8, z=3000))]),
    dict(n='Orta: atının boynunu kucaklar, yere düşer', c='oğlan atının boynunu|kucakladı,|yere düştü.', set='dag', cam=[(1000, 1420, 1.4), (900, 1480, 1.4)],
         a=[('at', P('at', 1020, 1620, flip=True)), ('bogac', dict(x=1050, y=1300, s=0.5, rot=38, e='blink', z=3000), dict(LIE, land=0.8, arc=40), 0.45)]),
    dict(n='Geniş: üstüne kapanmak ister', c='Dirse Han oğlancığının|üstüne kapanmak istedi;', set='dag', cam=[(620, 1460, 1.15), (600, 1470, 1.2)],
         a=[('bogac', LIE), ('arrow', ARW), ('dirse', P('dirse', -100, 1640, e='grief', walk=True, armL=12, armR=-12), dict(x=380, armL=90, armR=-90, glide=True), 0.0)]),
    dict(n='İkili: kırk namert bırakmaz', c='kırk namert|bırakmadı.', set='dag', cam=[(360, 1400, 1.6), (320, 1400, 1.7)], hold=0.4,
         a=[('bogac', LIE), ('arrow', ARW), ('dirse', P('dirse', 380, 1640, e='grief', armL=90, armR=-90, shake=0.6), dict(x=250), 0.2), ('namert0', P('namert0', 60, 1680, e='scold'), dict(x=110), 0.2), ('namert2', P('namert2', 520, 1700, e='scold', flip=True), dict(x=420), 0.2)]),
]

_c9 = [(820, 1520, 1.7), (800, 1520, 1.8)]
SCENES['hizir'] = [
    dict(n='Geniş: iki giden bir gelir', c='Hatunu baktı:|iki giden bir geliyor.', set='oba', cam=[(700, 1260, 1.15), (720, 1260, 1.2)],
         a=[('hatun', P('hatun', 1000, 1500, e='joy', flip=True), dict(e='fear'), 0.4), ('atli_dirse', P('atli_dirse', -300, 1560, e='grief', flip=True, walk=True), dict(x=460, glide=True), 0.0)]),
    dict(n='Yakın: “Yavrum hani?”', c='“Yavrum hani?” dedi;', set='oba', cam=[(1000, 1250, 2.2), (1000, 1246, 2.5)], punch=True, blur=True,
         a=[('hatun', P('hatun', 1000, 1500, e='grief', flip=True, armL=14, armR=-14), dict(armL=110, armR=-110), 0.15)]),
    dict(n='Yakın: ses vermez', c='Dirse Han|ses vermedi.', set='oba', cam=[(470, 1230, 2.2), (470, 1226, 2.4)], blur=True,
         a=[('atli_dirse', P('atli_dirse', 460, 1560, e='grief', flip=True), dict(e='refuse', hr=-16), 0.3)]),
    dict(n='Geniş: kızlarla aramaya çıkar', c='Hatun kırk ince belli|kızı aldı,|oğlunu aramaya gitti.', set='oba', cam=[(700, 1300, 1.1), (900, 1300, 1.1)],
         a=[('atli_hatun', P('atli_hatun', 500, 1560, e='grief', flip=True, gallop=True), dict(x=1700, glide=True), 0.15)] + [(f'kiz{i}', P(f'kiz{i}', 240 - i * 190, 1600 + i * 40, e='grief', walk=True), dict(x=1400 - i * 190, glide=True), 0.15) for i in range(3)]),
    dict(n='Geniş: boz atlı Hızır gelir', c='Oğlan yıkılmış yatarken|boz atlı Hızır geldi,', set='dag', cam=[(900, 1480, 1.15), (860, 1480, 1.25)],
         a=[('kan', dict(x=800, y=1670, s=1.0, z=1500)), ('bogac', LIE), ('arrow', ARW), ('atli_hizir', P('atli_hizir', 1650, 1640, e='joy', walk=True), dict(x=1120, glide=True), 0.0)]),
    dict(n='İkili: yarasını üç kez sıvazlar', c='yarasını üç kez|sıvazladı:', set='dag', cam=_c9, fx=fx_touch(*scr(_c9[1], 830, 1660)),
         a=[('kan', dict(x=800, y=1670, s=1.0, z=1500)), ('bogac', LIE), ('hizir', P('hizir', 1010, 1700, e='joy', flip=True, armR=-12), dict(armR=-50), 0.1)]),
    dict(n='Yakın: Hızır', c='“Korkma oğlan.|Dağ çiçeği ile|ananın sütü|sana merhemdir.”', set='dag', cam=[(1010, 1440, 2.2), (1010, 1436, 2.5)], blur=True, hold=0.4,
         a=[('hizir', P('hizir', 1010, 1700, e='joy', flip=True))]),
]

_c10 = [(700, 1480, 2.4), (700, 1476, 2.6)]
SCENES['merhem'] = [
    dict(n='Geniş: oğlunu bulur', c='Anası oğlunu|al kana bulanmış buldu,', set='dag', cam=[(760, 1500, 1.2), (780, 1500, 1.3)],
         a=[('kan', dict(x=800, y=1670, s=1.0, z=1500)), ('bogac', LIE), ('hatun', P('hatun', -100, 1680, e='fear', walk=True), dict(x=420, glide=True), 0.0)]),
    dict(n='İkili: üstüne kapanır', c='üstüne kapandı.', set='dag', cam=[(700, 1540, 1.7), (720, 1560, 1.9)], punch=True,
         a=[('kan', dict(x=800, y=1670, s=1.0, z=1500)), ('bogac', LIE), ('hatun', P('hatun', 420, 1680, e='grief', armL=14, armR=-14), dict(x=560, y=1500, rot=52, armL=80, armR=-80), 0.1)]),
    dict(n='Geniş: kızlar dağ çiçeği toplar', c='Kızlar dağ çiçeği|topladı.', set='dag', cam=[(500, 1540, 1.4), (760, 1540, 1.4)],
         a=[x for i, (kx, f) in enumerate(((300, 1600), (700, 1700), (1080, 1620))) for x in ((f'kiz{i}', P(f'kiz{i}', kx, f, e='grief', rot=0), dict(rot=24), 0.2 + i * 0.15), ('cicek', dict(x=kx + 90, y=f - 40, s=0.6, z=f + 5)))]),
    dict(n='Yakın: süt gelmez', c='Anası memesini|bir sıktı, sütü gelmedi;|iki sıktı, gelmedi;', set='dag', cam=_c10, blur=True,
         a=[('hatun', P('hatun', 700, 1720, e='grief', shake=0.3))]),
    dict(n='Yakın: kendine vurur', c='üçüncüde kendine vurdu,', set='dag', cam=[(700, 1480, 2.2), (700, 1490, 2.3)], punch=True, blur=True, fx=lambda u: fx_red(u) + group(fx_impact(0, 0)(u), 540, 1010, 0, 0.45),
         a=[('hatun', P('hatun', 700, 1720, e='shock', shake=1.0))]),
    dict(n='Eşya: kanla karışık süt', c='kanla karışık süt|geldi.', set='dag', cam=[(700, 1700, 2.0), (700, 1700, 2.2)], blur=True, fx=fx_milk(), a=[]),
    dict(n='İkili: yarasına sürerler', c='Yarasına sürdüler;', set='dag', cam=[(760, 1560, 1.6), (760, 1560, 1.7)], fx=fx_touch(*scr((760, 1560, 1.7), 830, 1660)),
         a=[('bogac', LIE), ('hatun', dict(P('hatun', 560, 1680), y=1500, rot=52, e='grief', armL=80, armR=-80)), ('kiz0', P('kiz0', 1120, 1700, e='grief', flip=True)), ('cicek', dict(x=1020, y=1560, s=0.6, z=3000))]),
    dict(n='Orta: kırk günde sağalır', c='kırk günde|yarası sağaldı.', set='oba', cam=[(740, 1260, 1.5), (740, 1250, 1.7)], punch=True, hold=0.4,
         a=[('bogac', P('bogac', 660, 1520, e='joy', armR=-10, poseR='fist'), dict(armR=-150), 0.2), ('hatun', P('hatun', 960, 1500, e='joy', flip=True))]),
]

SCENES['tutsak'] = [
    dict(n='Orta: namertler duyar', c='Kırk namert|bunu duydu:', set='oba', cam=[(300, 1330, 1.7), (300, 1330, 1.8)],
         a=[(k, P(k, x, f, e='neutral'), dict(e='fear'), 0.3) for k, x, f in NM]),
    dict(n='Yakın: korku', c='“Dirse Han oğlunu görürse|bizi hep kırar.”', set='oba', cam=[(300, 1300, 2.3), (300, 1296, 2.5)], blur=True,
         a=[('namert0', P('namert0', 300, 1560, e='fear', shake=0.8)), ('namert1', P('namert1', 130, 1620, e='fear', shake=0.6))]),
    dict(n='Geniş: Dirse Han’ı tutarlar', c='Dirse Han’ı tuttular,', set='oba', cam=[(1100, 1260, 1.4), (1120, 1260, 1.5)], punch=True,
         a=[('dirse', P('dirse', 1150, 1500, e='neutral'), dict(e='shock'), 0.25), ('namert0', P('namert0', 600, 1520, e='anger', walk=True), dict(x=950), 0.1), ('namert2', P('namert2', 1700, 1540, e='anger', flip=True, walk=True), dict(x=1360), 0.1)]),
    dict(n='Orta: ellerini bağlarlar', c='ak ellerini|ardına bağladılar,', set='oba', cam=[(1150, 1240, 1.8), (1150, 1236, 2.0)],
         a=[('dirse', P('dirse', 1150, 1500, e='grief', bound=True, shake=0.4)), ('namert0', P('namert0', 950, 1520, e='joy')), ('namert2', P('namert2', 1360, 1540, e='joy', flip=True))]),
    dict(n='Geniş: kâfir ellerine yönelirler', c='kâfir ellerine|yöneldiler.', set='yol', cam=[(700, 1380, 1.1), (800, 1360, 1.15)],
         a=[('dirse', P('dirse', 200, 1640, e='grief', bound=True, walk=True), dict(x=640, glide=True), 0.0), ('atli_namert', P('atli_namert', 520, 1560, e='joy', flip=True, k=0, walk=True), dict(x=960, glide=True), 0.0),
            ('atli_namert', P('atli_namert', -200, 1740, e='joy', flip=True, k=2, walk=True), dict(x=260, glide=True), 0.0)]),
    dict(n='İkili: hatun oğluna varır', c='Hatun oğluna vardı:', set='oba', cam=[(740, 1260, 1.4), (760, 1260, 1.5)],
         a=[('bogac', P('bogac', 980, 1520, e='neutral', flip=True)), ('hatun', P('hatun', 100, 1500, e='grief', walk=True), dict(x=640, glide=True), 0.0)]),
    dict(n='Yakın: “sen babana kıyma”', c='“Baban sana kıydıysa|sen babana kıyma!”', set='oba', cam=[(640, 1250, 2.2), (640, 1246, 2.5)], blur=True,
         a=[('hatun', P('hatun', 640, 1500, e='scold', armL=14, armR=-14), dict(armR=-110, e='grief'), 0.45)]),
    dict(n='Orta: kılıcını kuşanır', c='Oğlan kılıcını|kuşandı,', set='oba', cam=[(980, 1280, 1.8), (980, 1260, 2.0)], punch=True,
         a=[('bogac', P('bogac', 980, 1520, e='neutral', sword=True, armR=-10), dict(e='anger', armR=-150), 0.15)]),
    dict(n='Geniş: kırk yiğidiyle ardlarınca', c='kırk yiğidiyle|ardlarınca gitti.', set='yol', cam=[(600, 1400, 1.1), (760, 1400, 1.1)], hold=0.3,
         a=[('atli_bogac', P('atli_bogac', -200, 1600, e='anger', flip=True, gallop=True, sword=True, armR=-150), dict(x=1250, glide=True), 0.0)] + [(f'alp{i}', P(f'alp{i}', -520 - i * 200, 1640 + i * 50, e='anger', walk=True), dict(x=820 - i * 220, glide=True), 0.0) for i in range(3)]),
]

DY = P('dirse', 1000, 1560)
SCENES['kavga'] = [
    dict(n='Geniş: oğlunu tanımaz', c='Dirse Han oğlunu|tanımadı;', set='yol', cam=[(660, 1380, 1.05), (680, 1380, 1.1)],
         a=[('dirse', dict(DY, e='grief', bound=True)), ('namert0', P('namert0', 1170, 1600, e='fear', sword=True)), ('namert2', P('namert2', 800, 1640, e='fear', sword=True)), ('bogac', P('bogac', -160, 1620, e='anger', sword=True, armR=-150, walk=True), dict(x=300, glide=True), 0.0)]),
    dict(n='Orta: kopuzunu alır', c='kopuzunu aldı:', set='yol', cam=[(1000, 1320, 1.8), (1000, 1316, 2.0)], blur=True,
         a=[('dirse', dict(DY, e='grief', kopuz=True))]),
    dict(n='Yakın: “günahı benim boynuma”', c='“Yiğit,|bu savaşı bırak!|Benim bir oğlum vardı,|öldürdüm;|günahı benim boynuma.”', set='yol', cam=[(1000, 1300, 2.2), (1000, 1290, 2.6)], blur=True,
         a=[('dirse', dict(DY, e='grief', kopuz=True, hr=0), dict(hr=10), 0.5)]),
    dict(n='Yakın: oğul', c='Oğlan dedi:|“Aklı şaşmış bir babayı|komam kırk namerde!”', set='yol', cam=[(300, 1400, 2.2), (300, 1396, 2.5)], punch=True, blur=True,
         a=[('bogac', P('bogac', 300, 1620, e='anger', sword=True, armR=-110), dict(armR=-160), 0.4)]),
    dict(n='Geniş: boynunu vurur', c='Kiminin boynunu vurdu,', set='yol', cam=[(720, 1420, 1.3), (760, 1420, 1.4)], punch=True, fx=after(lambda u: fx_impact(*scr((760, 1420, 1.4), 800, 1330))(u) + fx_spurt(*scr((760, 1420, 1.4), 800, 1340), 12)(u), 0.3),
         a=[('bogac', P('bogac', 300, 1620, e='anger', sword=True, armR=-160), dict(x=640, armR=-40), 0.15), ('namert2', P('namert2', 800, 1640, e='fear', sword=True), dict(x=980, y=1640, rot=86, e='blink', land=0.6, arc=60), 0.3), ('dirse', dict(DY, x=1180, e='shock', kopuz=True))]),
    dict(n='Orta: kimini tutsak eder', c='kimini tutsak eyledi;', set='yol', cam=[(1180, 1400, 1.5), (1200, 1400, 1.6)],
         a=[('namert0', P('namert0', 1160, 1620, e='fear', shake=1.0)), ('namert1', P('namert1', 1340, 1660, e='fear', shake=0.8)), ('alp0', P('alp0', 900, 1640, e='anger')), ('alp2', P('alp2', 1600, 1660, e='anger', flip=True))]),
    dict(n='İkili: babasını kurtarır', c='babasını kurtardı.', set='yol', cam=[(690, 1340, 1.5), (690, 1336, 1.65)], hold=0.4,
         a=[('dirse', P('dirse', 880, 1560, e='shock')), ('bogac', P('bogac', 520, 1580, e='joy', sword=True, armR=-150), dict(armR=-10), 0.2)]),
]

SCENES['son'] = [
    dict(n='İkili: oğlunu tanır', c='Dirse Han oğlunun|sağ olduğunu|burada bildi.', set='yol', cam=[(700, 1320, 1.6), (700, 1316, 1.8)],
         a=[('dirse', P('dirse', 860, 1560, e='shock', armL=12, armR=-12), dict(e='grief', armL=100, armR=-100), 0.35), ('bogac', P('bogac', 540, 1580, e='joy'))]),
    dict(n='Geniş: Dede Korkut boy boylar', c='Dedem Korkut gelip|boy boyladı,|soy soyladı:', set='oba', cam=[(760, 1230, 1.1), (760, 1240, 1.2)],
         a=[('dede', P('dede', 820, 1500, 0.46, e='joy')), ('dirse', P('dirse', 430, 1500, e='joy')), ('bogac', P('bogac', 610, 1590, e='joy')), ('hatun', P('hatun', 1080, 1510, e='joy', flip=True))]),
    dict(n='Yakın: yom', c='“Yerli kara dağların|yıkılmasın,|gölgeli ulu ağacın|kesilmesin.”', set='oba', cam=[(820, 1230, 1.9), (820, 1220, 2.3)], blur=True, hold=1.0,
         a=[('dede', P('dede', 820, 1500, 0.46, e='joy'))]),
]

for _i, _s in enumerate(ORDER):
    _t = ' '.join(x['c'].replace('|', ' ') for x in SCENES[_s])
    assert _t == TEXT[_i], f'{_s}: altyazı metni onaylanan metinle aynı değil\n{_t}\n{TEXT[_i]}'

V.STORY, V.ORDER, V.DIR = 'bogac', ORDER, os.path.join(os.path.dirname(__file__), 'audio')
V.apply(SCENES)
