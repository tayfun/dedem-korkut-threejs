"""Basat ile Tepegöz — "Tek Gözlü Devi Kör Eden Yiğit": kadro.
Ortak takım (el, yüz kurucu, kaftan, kol) deli_dumrul modüllerinden gelir; kişiler bu hikâyeye özgü çizilmiştir."""
import math
from ..kit import *
from ..deli_dumrul import cast as C0, cast2 as K
from ..deli_dumrul.cast import COBALT, SKIN, SKIN_D, SKIN_L, PALE, GOLD, RED, COAT, LEATHER, hand, stud, strap
from ..deli_dumrul.cast2 import gface, robe, sleeve, barbed
from .. import palette as _pal
GREEN = _pal.get()['GREEN']

# ----------------------------------------------------------------------------- Tepegöz
TE = {
    'neutral': dict(open=0.72, brow=0.15, m='closed'),
    'blink':   dict(open=0.0, brow=0.15, m='closed'),
    'sleep':   dict(open=0.0, brow=0.0, m='snore'),
    'laugh':   dict(open=0.5, brow=-0.25, m='grin'),
    'anger':   dict(open=0.9, brow=0.7, m='roar'),
    'shock':   dict(open=1.25, brow=-0.5, m='roar', pin=True),
    'blind':   dict(open=0.0, brow=-0.6, m='roar', wound=True),
    'weep':    dict(open=0.0, brow=-0.7, m='frown', wound=True),
}


def tepegoz_head(expr='neutral'):
    """Dev baş: yumru yumru kafatası, tam ortada tek koca göz, domuz burnu, alt çeneden çıkan iki azı dişi."""
    e = TE[expr]; jaw = {'roar': 56, 'grin': 14, 'snore': 22}.get(e['m'], 0)
    J = lambda x, y: (x, y + jaw * max(0.0, min(1.2, (y - 60) / 140)))
    for sx in (-1, 1):
        reseed(f'tg-ear{sx}')
        ear = [(sx * 196, -70), (sx * 268, -150), (sx * 258, -50), (sx * 230, 10), (sx * 198, 4)]
        s0 = blob(ear, SKIN_D if sx < 0 else SKIN, 3.6) + ink([(sx * 214, -56), (sx * 246, -104), (sx * 236, -40)], 2.0, wob=0.2)
        s = s0 if sx < 0 else s + s0
    reseed('tg-skull')
    skull = [J(*p) for p in [(-124, -196), (-60, -236), (20, -222), (84, -240), (156, -180), (200, -84), (216, 20), (206, 124), (158, 204), (60, 240), (-52, 238), (-152, 202), (-206, 122), (-218, 18), (-194, -92)]]
    s += clipdef('tg', skull) + fill(skull, SKIN, 1.6)
    s += fill([J(*p) for p in [(-260, -260), (-80, -250), (-120, -80), (-150, 60), (-90, 170), (0, 230), (120, 250), (60, 320), (-280, 320)]], SKIN_D, 1.2, clip='tg')
    s += fill(ellipse(96, 60, 46, 30, 9, 0.12), SKIN_L, 1.0, clip='tg') + fill(ellipse(40, -190, 60, 16, 8, 0.1), SKIN_L, 1.0, clip='tg')
    s += ink(skull, 4.0, closed=True, press=0.55, wob=1.0)
    reseed('tg-marks')
    for x, y, r in ((-150, 40, 13), (150, -20, 10), (-96, 150, 9), (120, 150, 12), (-170, -70, 8)):                 # siğiller
        s += blob(ellipse(x, y, r, r * 0.9, 7, 0.15), SKIN_D, 2.2) + ink([(x - 2, y - r), (x - 4, y - r - 9)], 1.7, wob=0, smooth=False)
    s += dots([J(*p) for p in [(-170, 130), (170, 130), (120, 230), (-120, 230)]], 60, (1.0, 1.9))
    s += ''.join(ink([(x, -226 + abs(x) * 0.12), (x + dx, -278 + abs(x) * 0.2)], 5, col=INK, op=1, taper=(0, 0.8), wob=0.4, smooth=False) for x, dx in ((-40, -14), (-12, -4), (16, 6), (44, 16), (70, 26)))   # tepede birkaç tel saç
    # --- tek göz
    reseed('tg-eye')
    cy = -72; rx, ry = 66, 48
    s += fill(ellipse(0, cy + 4, rx + 26, ry + 24, 12, 0.04), SKIN_D, 1.0, clip='tg')
    for k in range(3): s += ink([(-rx + k * 6, cy + ry + 12 + k * 9), (0, cy + ry + 22 + k * 9), (rx - k * 6, cy + ry + 11 + k * 9)], 2.1, wob=0.3)   # üst üste torbalar
    op = e['open']
    if op > 0.08:
        r2 = ry * min(op, 1.3)
        s += fill(ellipse(0, cy, rx, r2, 14), PALE, 0.6)
        ir = 12 if e.get('pin') else 27
        s += fill(ellipse(4, cy + 2, ir, min(ir, r2 * 0.92), 12), GOLD, 0.4) + ink(ellipse(4, cy + 2, ir, min(ir, r2 * 0.92), 12), 2.2, closed=True, wob=0.2)
        s += f'<circle cx="4" cy="{cy + 2}" r="{5 if e.get("pin") else 12}" fill="{INK}"/>' + sparkle(-6, cy - 8, 9)
        lidy = cy - r2 + 2 * r2 * (0.0 if e.get('pin') else 0.24)
        s += fill([(-rx - 4, cy - r2 - 8), (0, cy - r2 - 14), (rx + 4, cy - r2 - 8), (rx + 3, lidy - 2), (0, lidy + 5), (-rx - 3, lidy - 2)], SKIN_D, 0.5)
        s += ink([(-rx - 6, lidy - 4), (0, lidy + 6), (rx + 6, lidy - 4)], 7, wob=0.4, taper=(0.12, 0.12)) + ink([(-rx, cy + r2 * 0.5), (0, cy + r2 + 2), (rx, cy + r2 * 0.5)], 2.4, wob=0.3)
    else:
        s += ink([(-rx - 4, cy - 4), (0, cy + 16), (rx + 4, cy - 4)], 7, wob=0.4, taper=(0.1, 0.1))
        s += ''.join(ink([(k * rx * 0.3, cy + 12 - abs(k) * 4), (k * rx * 0.36, cy + 28 - abs(k) * 4)], 2.4, taper=(0, 0.7), wob=0, smooth=False) for k in (-2, -1, 0, 1, 2))
    if e.get('wound'):                                                                                              # kör edilmiş göz: yanık ve kan
        reseed('tg-wound')
        burn = [(R(-1, 1) * 8 + math.cos(a) * (58 + (18 if i % 2 else 0)), cy + 6 + math.sin(a) * (40 + (14 if i % 2 else 0))) for i, a in enumerate([k * 0.524 for k in range(12)])]
        s += fill(burn, INK, 1.0, smooth=False, op=0.9) + fill(ellipse(0, cy + 6, 40, 26, 9, 0.2), RED, 1.2)
        for x, l in ((-30, 90), (-6, 150), (22, 110), (44, 70)):
            s += ink([(x, cy + 24), (x + 3, cy + 24 + l)], 9, col=RED, op=1, taper=(0.05, 0.35), wob=1.0, press=0.3) + fill(ellipse(x + 3, cy + 26 + l, 8, 11, 7), RED, 0.5)
    b = e['brow']                                                                                                   # tek, kalın, dikenli kaş
    by = cy - ry - 36
    bp = [(-104, by - b * 30), (-40, by + b * 22 - 8), (0, by + b * 34), (40, by + b * 22 - 8), (104, by - b * 30)]
    s += ink(bp, 20, taper=(0.06, 0.06), press=0.2, wob=0.6) + ''.join(ink([(x, by + b * 10 - 12), (x + x * 0.08, by + b * 10 - 30)], 3.4, col=INK, op=1, taper=(0, 0.8), wob=0, smooth=False) for x in (-70, -36, 0, 36, 70))
    # --- burun, ağız, azı dişleri
    reseed('tg-nose')
    nose = [(-38, 14), (0, -2), (38, 14), (52, 48), (0, 66), (-52, 48)]
    s += blob(nose, SKIN_L, 3.4) + fill(ellipse(-20, 46, 9, 7, 7), INK, 0.3) + fill(ellipse(20, 46, 9, 7, 7), INK, 0.3) + ink([(-20, 8), (0, 2), (20, 8)], 2.0, wob=0.2)
    s += ink([(-56, 54), J(-110, 104), J(-124, 170)], 3.0, wob=0.5, taper=(0.2, 0.5)) + ink([(56, 54), J(110, 104), J(124, 170)], 3.0, wob=0.5, taper=(0.2, 0.5))
    reseed('tg-mouth')
    my = 128 + jaw * 0.45; m = e['m']
    if m == 'closed': s += ink([(-110, my + 4), (0, my + 14), (110, my + 2)], 3.6, wob=0.5) + ink([(-50, my + 34), (0, my + 40), (50, my + 33)], 2.2, wob=0.3)
    elif m == 'frown': s += ink([(-104, my + 26), (0, my + 2), (104, my + 26)], 3.8, wob=0.5) + ink([(-40, my + 40), (0, my + 34), (40, my + 40)], 2.2, wob=0.3)
    elif m == 'snore': s += mouth(0, my + 10, 44, 8, 30, 0, SKIN_D, FINE, RED, PALE, top=4, bot=4)
    elif m == 'grin': s += mouth(0, my + 4, 128, 2, 40, 22, SKIN_D, FINE, RED, PALE, gum=RED, top=9, bot=8)
    else: s += mouth(0, my + 12, 100, 18, 84, 0, SKIN_D, FINE, RED, PALE, top=8, bot=7)
    ty = my + (30 if m in ('grin', 'roar', 'snore') else 10) + (jaw * 0.3 if m == 'roar' else 0)
    for sx in (-1, 1):
        tusk = [(sx * 62, ty + 10), (sx * 70, ty - 30), (sx * 84, ty - 62), (sx * 96, ty - 24), (sx * 92, ty + 10)]
        s += blob(tusk, PALE, 2.8) + ink([(sx * 76, ty - 6), (sx * 82, ty - 40)], 1.7, wob=0, smooth=False)
    return s


def tg_arm(side=1, lit=True, pose='open'):
    reseed(f'tg-arm{side}')
    arm = [(-62, -14), (52, -28), (88, 90), (76, 262), (-66, 266), (-90, 90)]
    s = fill(arm, SKIN if lit else SKIN_D, 1.6) + ink(arm, 4.0, closed=True, press=0.45) + ink([(-50, 100), (0, 124), (56, 96)], 2.4, wob=0.4)
    s += ticks([(-60, 120), (60, 120), (60, 230), (-60, 230)], 12, (7, 13), 1.4, 0.4, 1.9)                              # kıllar
    s += blob([(-70, 236), (78, 232), (80, 268), (-72, 272)], LEATHER, 3.0) + ''.join(stud(x, 252, 4) for x in (-44, -8, 28, 60))
    return s + group(hand(lit, pose, True, side), 0, 276, 0, 1.45)


def tepegoz(expr='neutral', armL=10, armR=-10, hr=0, poseR='open', child=False):
    """Dev: fıçı göğüs, sarkık karın, post etek, koca çizmeler. Boyun kökü (0,0); ayak tabanı y=710.
    child=True: yeni doğmuş/çocuk hâli (çıplak ayak, baş gövdeye göre daha iri)."""
    s = group(tg_arm(-1, False), -252, 64, armL)
    for sx in (-1, 1):
        reseed(f'tg-boot{sx}')
        if child:
            s += blob([(sx * 60, 440), (sx * 180, 440), (sx * 190, 660), (sx * 250, 690), (sx * 240, 712), (sx * 50, 712)], SKIN_D if sx < 0 else SKIN, 3.6)
        else:
            boot = [(sx * 44, 430), (sx * 210, 430), (sx * 214, 640), (sx * 286, 668), (sx * 284, 712), (sx * 36, 712)]
            s += blob(boot, LEATHER, 3.8) + (fill(boot, INK, 1.0, op=0.35) if sx < 0 else '') + blob([(sx * 36, 430), (sx * 218, 430), (sx * 222, 476), (sx * 32, 476)], COAT, 3.0)
            s += ''.join(stud(sx * (60 + k * 34), 453, 4.4) for k in range(5)) + ticks([(sx * 50, 490), (sx * 210, 490), (sx * 270, 700), (sx * 44, 700)], 16, (7, 13), 0.2 * sx, 0.5, 2.0)
    reseed('tg-torso')
    torso = [(-92, -22), (92, -22), (232, 30), (284, 200), (276, 370), (214, 474), (-214, 474), (-276, 370), (-284, 200), (-232, 30)]
    s += clipdef('tgb', torso) + fill(torso, SKIN, 1.6)
    s += fill([(-320, -40), (-70, -40), (-120, 160), (-90, 330), (-140, 490), (-320, 490)], SKIN_D, 1.2, clip='tgb') + fill(ellipse(80, 250, 110, 90, 10, 0.08), SKIN_L, 1.2, clip='tgb', op=0.7)
    s += ink([(-150, 110), (-70, 150), (0, 120), (70, 150), (150, 110)], 2.6, wob=0.5) + ink([(-190, 300), (0, 372), (190, 300)], 2.8, wob=0.6) + fill(ellipse(4, 290, 9, 12, 7), INK, 0.4)
    s += ticks([(-120, 30), (120, 30), (90, 120), (-90, 120)], 22, (8, 15), 1.5, 0.5, 2.0)                               # göğüs kılı
    s += ink(torso, 4.2, closed=True, press=0.5)
    reseed('tg-hide')
    hide = [(-282, 330), (0, 352), (282, 330), (262, 500), (190, 462), (130, 528), (60, 478), (0, 540), (-60, 478), (-130, 528), (-190, 462), (-262, 500)]
    s += barbed(hide, LEATHER, 3.0) + fur(hide, 5, 15, 14, 0.3, 2.3) + blob([(-286, 326), (0, 346), (286, 326), (284, 364), (0, 386), (-284, 364)], COAT, 3.2) + ''.join(stud(x, 350 + (1 - abs(x) / 286) * 16, 4.6) for x in range(-250, 260, 50))
    if not child: s += strap((-210, 12), (190, 336), 32, 9, False) + blob(ellipse(-20, 168, 26, 26, 9), PALE, 3.0) + ink([(-34, 160), (-8, 176)], 2.0, wob=0, smooth=False)   # omuz kayışı, kemik toka
    s += group(tg_arm(1, True, poseR), 252, 64, armR)
    k = 1.25 if child else 0.92
    s += group(tepegoz_head(expr), 0, -178 * k / 0.92, hr, k, None, 0, 178)
    return s


# ----------------------------------------------------------------------------- Basat
def basat_head(expr='neutral'):
    """Aslanların büyüttüğü yiğit: aslan yelesi gibi kabarık kara saç, geniş çene, alnında al bağ."""
    reseed('basat-mane')
    mane = []
    for i in range(30):
        a = math.radians(-212 + i * (244 / 29)); r = (176 if i % 2 else 128) + R(-10, 10)
        mane.append((math.cos(a) * r * 0.92, -20 + math.sin(a) * r))
    s = group(fill(mane, INK, 0.8, smooth=False), 0, 0, C0.SWAY * 0.5, 1, None, 0, -20)
    f, d = gface('basat', 92, 104, 0.96, (52, 18, 0.1), (0.31, -0.1, 14, 10), (INK, 11), (0.36, 0.48), expr, bags=0, wrinkles=0)
    s += f
    reseed('basat-hair')
    s += fill([(-96, -30), (-90, -96), (-30, -122), (40, -120), (92, -92), (96, -30), (70, -62), (44, -44), (20, -70), (-8, -48), (-36, -72), (-62, -50)], INK, 0.8, smooth=False)
    s += blob([(-94, -74), (0, -92), (94, -74), (92, -56), (0, -74), (-92, -56)], RED, 2.6) + ink([(-60, -76), (-56, -62)], 1.6, wob=0, smooth=False) + ink([(40, -82), (44, -68)], 1.6, wob=0, smooth=False)
    return s


def bow():
    """Yay: sapı (0,0)'da, dik durur."""
    reseed('bow')
    limb = [(0, -150), (34, -110), (40, -40), (14, 0), (40, 40), (34, 110), (0, 150)]
    return ink(limb, 11, col=LEATHER, op=1, taper=(0.1, 0.1), wob=0.4, press=0.15) + ink(limb, 2.2, wob=0.4, taper=(0.1, 0.1)) + ink([(0, -150), (0, 150)], 1.7, col=PALE, op=1, wob=0, taper=(0, 0), smooth=False) + blob([(6, -18), (24, -18), (24, 18), (6, 18)], RED, 2.2)


def arrow(broken=False):
    """Ok: yatay, ucu sağda; ortası (0,0). broken: ikiye kırılmış."""
    reseed('arrow')
    tip = blob([(70, -10), (104, 0), (70, 10)], PALE, 2.2); fl = ''.join(blob([(-100 + k * 12, 0), (-112 + k * 12, -14 * sy), (-92 + k * 12, -14 * sy), (-80 + k * 12, 0)], RED, 1.8) for k in (0, 1) for sy in (-1, 1))
    if not broken: return ink([(-100, 0), (72, 0)], 6, col=LEATHER, op=1, taper=(0, 0), wob=0.2, smooth=False) + tip + fl
    return group(ink([(-100, 0), (-10, 0), (-2, -6)], 6, col=LEATHER, op=1, taper=(0, 0.1), wob=0.2, smooth=False) + fl, -8, 10, 24) + group(ink([(8, 4), (16, 0), (72, 0)], 6, col=LEATHER, op=1, taper=(0.1, 0), wob=0.2, smooth=False) + tip, 10, -8, -18)


def basat(expr='neutral', armL=10, armR=-10, hr=0, poseR='open', bow_in_hand=False, sword_in_hand=False):
    """İnce, çevik; yeşil kısa kaftan, omzunda aslan postu, sırtında sadak. Boyun kökü (0,0); ayak tabanı y=480."""
    reseed('basat-quiver')
    s = group(blob([(-20, -40), (24, -40), (30, 150), (-26, 150)], LEATHER, 3.0) + ''.join(blob([(x, -40), (x - 8, -86), (x + 8, -92), (x + 12, -40)], RED, 1.8) for x in (-12, 2, 14)) + ''.join(stud(2, y, 3.2) for y in (0, 60, 120)), -70, 0, -24)
    held = group(bow(), 0, 300, 0, 1.3) if bow_in_hand else ''
    s += group(held + sleeve(196, 27, GREEN, 'basat', False, 0.72, 'grip' if bow_in_hand else 'open', -1, LEATHER), -84, 40, armL)
    for sx in (-1, 1):
        reseed(f'basat-boot{sx}')
        s += blob([(sx * 16, 300), (sx * 78, 300), (sx * 80, 436), (sx * 116, 452), (sx * 114, 480), (sx * 12, 480)], LEATHER, 3.2) + ink([(sx * 20, 340), (sx * 76, 344)], 1.9, wob=0.3, smooth=False)
    s += robe(86, 104, 320, GREEN, 'basat', hem=GOLD, belt=LEATHER)
    reseed('basat-pelt')                                                                                               # aslan postu: bir omuzdan çapraz
    pelt = [(-96, -6), (-30, -22), (40, 30), (100, 150), (112, 230), (70, 216), (58, 262), (26, 226), (-20, 150), (-80, 90)]
    s += barbed(pelt, GOLD, 2.8) + fur(pelt, 6, 15, 12, 0.5, 2.1) + blob([(84, 222), (116, 232), (124, 268), (104, 286), (78, 262)], GOLD, 2.6) + ''.join(ink([(92 + k * 9, 276), (92 + k * 9, 292)], 2.4, col=INK, op=1, taper=(0, 0.6), wob=0, smooth=False) for k in range(3))
    held = group(C0.sword(), 0, 300, 180, 0.9) if sword_in_hand else ''
    s += group(held + sleeve(196, 27, GREEN, 'basat', True, 0.72, poseR, 1, LEATHER), 84, 40, armR)
    s += group(basat_head(expr), 0, -96, hr, 0.86, None, 0, 100)
    return s


# ----------------------------------------------------------------------------- Aruz Koca
def aruz_head(expr='neutral'):
    """Uzun at yüzü, sarkık ak bıyık, kısa köşeli sakal, kabarık kürk kalpak."""
    f, d = gface('aruz', 98, 140, 1.12, (88, 26, 0.3), (0.3, -0.2, 13, 8), (PALE, 13), (0.4, 0.5), expr, bags=3, wrinkles=3)
    s = f
    reseed('aruz-beard')
    beard = [(-104, 60), (-80, 120 + d), (0, 136 + d), (80, 120 + d), (104, 60), (110, 150 + d), (90, 210 + d), (40, 226 + d), (0, 216 + d), (-40, 226 + d), (-90, 210 + d), (-110, 150 + d)]
    s += group(barbed(beard, PALE, 2.6, [(-104, 60), (-80, 120 + d), (-30, 132 + d), (-40, 226 + d), (-90, 210 + d), (-110, 150 + d)]) + fur(beard, 4, 13, 11, 0.1, 1.9), 0, 0, C0.SWAY * 0.5, 1, None, 0, 80)
    for sx in (-1, 1): s += barbed([(0, 58), (sx * 34, 50), (sx * 76, 74), (sx * 96, 170 + d), (sx * 70, 130 + d * 0.5), (sx * 54, 100), (sx * 24, 84), (0, 78)], PALE, 2.2)
    reseed('aruz-hat')
    hat = [(-150, -110), (-140, -200), (-70, -250), (30, -262), (120, -226), (158, -150), (150, -100), (0, -76)]
    s += blob(hat, LEATHER, 3.6, 2.4) + fill([(-150, -110), (-140, -200), (-70, -250), (-40, -252), (-70, -90)], INK, 1.0, op=0.35) + fur(hat, 7, 12, 15, 0.6, 2.4)
    s += dashrow([(-150, -110), (-140, -200), (-70, -250), (30, -262), (120, -226), (158, -150)], 13, 13, -0.5, 2.4) + blob([(-40, -250), (10, -310), (60, -250)], RED, 3.0)      # kabarık kürk kalpak, al tepelik
    return s


def aruz(expr='neutral', armL=12, armR=-12, hr=0):
    """Uzun boylu, iri kemikli koca; al kaftan, mahmuzlu çizme. Boyun kökü (0,0); ayak tabanı y=600."""
    s = group(sleeve(230, 36, RED, 'aruz', False, 0.82, 'open', -1, GOLD), -112, 44, armL)
    for sx in (-1, 1):
        reseed(f'aruz-boot{sx}')
        s += blob([(sx * 20, 520), (sx * 96, 520), (sx * 100, 566), (sx * 146, 580), (sx * 142, 602), (sx * 16, 602)], COAT, 3.2)
        s += ink([(sx * 18, 584), (sx * -8, 590)], 5, col=PALE, op=1, taper=(0, 0.3), wob=0, smooth=False) + sparkle(sx * -12, 590, 9, PALE)       # mahmuz
    s += robe(116, 150, 540, RED, 'aruz', pattern=GOLD, hem=GOLD, belt=COAT)
    s += group(sleeve(230, 36, RED, 'aruz', True, 0.82, 'open', 1, GOLD), 112, 44, armR)
    s += group(aruz_head(expr), 0, -130, hr, 0.84, None, 0, 130)
    return s


# ----------------------------------------------------------------------------- peri
def peri_wing(side=1):
    reseed(f'peri-wing{side}')
    up = [(0, 0), (side * 60, -150), (side * 170, -250), (side * 280, -230), (side * 300, -120), (side * 220, -20), (side * 90, 20)]
    lo = [(0, 20), (side * 110, 40), (side * 230, 110), (side * 240, 220), (side * 150, 250), (side * 50, 150)]
    s = ''
    for p in (up, lo):
        s += fill(p, PALE, 1.4, op=0.9) + fill(p, COBALT, 1.4, op=0.22 if side > 0 else 0.4) + ink(p, 2.8, closed=True, wob=0.6)
    for a, b in (((side * 20, -10), (side * 250, -200)), ((side * 20, 0), (side * 270, -110)), ((side * 20, 30), (side * 200, 190))): s += ink([a, b], 1.9, wob=0.5, taper=(0.1, 0.7), smooth=False)
    return s + ''.join(fill(ellipse(side * x, y, 12, 12, 7), GOLD, 0.4, op=0.9) for x, y in ((230, -190), (250, -110), (190, 200)))


def peri(expr='neutral', armL=20, armR=-20, hr=0, flap=0.0):
    """Peri kızı: ince uzun, yere dek ak saç, krem entari, kelebek kanatlar. Boyun kökü (0,0); etek ucu y=470."""
    s = group(peri_wing(-1), -30, 60, -flap * 22 + C0.SWAY * 0.6) + group(peri_wing(1), 30, 60, flap * 22 + C0.SWAY * 0.6)
    reseed('peri-hair')
    hair = [(-86, -150), (0, -196), (86, -150), (120, 40), (150, 300), (96, 420), (60, 300), (30, 380), (-30, 380), (-60, 300), (-96, 420), (-150, 300), (-120, 40)]
    s += group(blob(hair, PALE, 3.0) + fill([(-86, -150), (-120, 40), (-150, 300), (-96, 420), (-60, 300), (-70, 0)], COBALT, 1.0, op=0.28) + ''.join(ink([(x, -60), (x * 1.3, 300)], 1.8, wob=0.8) for x in (-96, -70, 74, 100)), 0, 0, C0.SWAY * 0.7, 1, None, 0, -150)
    s += group(sleeve(210, 22, PALE, 'peri', False, 0.62, 'open', -1, GOLD), -62, 36, armL)
    s += robe(62, 124, 470, PALE, 'peri', shade=COBALT, hem=GOLD, belt=GREEN)
    s += group(sleeve(210, 22, PALE, 'peri', True, 0.62, 'open', 1, GOLD), 62, 36, armR)
    s += blob([(-20, -70), (20, -70), (22, 4), (-22, 4)], SKIN_D, 2.6)
    f, d = gface('peri', 74, 86, 0.8, (36, 12, 0.0), (0.34, -0.06, 15, 11), (INK, 5), (0.3, 0.5), expr, bags=0, wrinkles=0, lash=True)
    reseed('peri-crown')
    hd = f + fill([(-78, -20), (-70, -74), (0, -96), (70, -74), (78, -20), (44, -54), (0, -64), (-44, -54)], PALE, 0.8) + ink([(-78, -20), (-44, -54), (0, -64), (44, -54), (78, -20)], 2.2, wob=0.4)
    hd += blob([(-72, -62), (0, -84), (72, -62), (70, -48), (0, -70), (-70, -48)], GOLD, 2.2) + blob(ellipse(0, -84, 10, 12, 7), GREEN, 2.0) + sparkle(3, -88, 6)
    return s + group(hd, 0, -138, hr, 0.86, None, 0, 100)


# ----------------------------------------------------------------------------- Konur Koca Sarı Çoban
def coban(expr='neutral', armL=10, armR=-10, hr=0, cloak=True):
    """Çoban: köşeli omuzlu koca kepenek, sarı pala bıyık, keçe külah, değnek. Boyun kökü (0,0); ayak tabanı y=520."""
    for sx in (-1, 1):
        reseed(f'coban-foot{sx}')
        b = blob([(sx * 18, 470), (sx * 84, 470), (sx * 120, 498), (sx * 116, 522), (sx * 14, 522)], LEATHER, 3.0) + ''.join(ink([(sx * (26 + k * 14), 478), (sx * (36 + k * 14), 512)], 1.8, wob=0, smooth=False) for k in range(4))
        s = b if sx < 0 else s + b
    s += group(sleeve(190, 30, COBALT, 'coban', False, 0.78, 'open', -1), -96, 44, armL)
    s += robe(100, 118, 480, COBALT, 'coban', belt=RED)
    reseed('coban-crook')
    s += ink([(150, 520), (146, 100), (150, -150), (176, -200), (216, -196), (226, -160)], 11, col=LEATHER, op=1, taper=(0.02, 0.2), wob=1.0, press=0.15)
    s += group(sleeve(190, 30, COBALT, 'coban', True, 0.78, 'grip', 1), 96, 44, armR)
    if cloak:
        reseed('coban-kepenek')
        kep = [(-196, -30), (196, -30), (206, 20), (170, 440), (60, 460), (40, 60), (-40, 60), (-60, 460), (-170, 440), (-206, 20)]
        s += blob(kep, PALE, 4.0, 1.8) + fill([(-196, -30), (-206, 20), (-170, 440), (-60, 460), (-40, 60), (-70, -30)], COBALT, 1.0, op=0.28) + ticks(kep, 60, (6, 12), 1.5, 0.5, 2.0)
        s += dashrow([(-196, -30), (196, -30)], 16, 9, 0.2, 2.0, smooth=False)
    f, d = gface('coban', 100, 96, 1.16, (48, 26, 0.0), (0.28, -0.12, 13, 9), (GOLD, 12), (0.36, 0.46), expr, bags=2, wrinkles=2)
    reseed('coban-hat')
    hd = f + ''.join(barbed([(0, 30), (sx * 40, 22), (sx * 96, 40), (sx * 132, 96 + d), (sx * 96, 76), (sx * 70, 92 + d * 0.4), (sx * 44, 62), (sx * 20, 70), (0, 54)], GOLD, 2.4) for sx in (-1, 1))
    hd += blob([(-104, -50), (-80, -150), (-10, -212), (40, -170), (100, -110), (108, -50), (0, -34)], PALE, 3.4) + ticks([(-90, -60), (-70, -140), (20, -180), (90, -70)], 14, (6, 11), 1.5, 0.5, 1.9)
    return s + group(hd, 0, -92, hr, 0.86, None, 0, 100)


# ----------------------------------------------------------------------------- Yünlü Koca ile Yapağılı Koca
def koca(i=0, expr='neutral'):
    """Tepegöz'e yemek pişiren iki koca: biri sırık gibi, öbürü bodur ve kel; ikisi de tiftik tiftik yün postlu. Boyun kökü (0,0); ayak y=420."""
    name = f'koca{i}'; tall = i == 0
    w, h = (74, 420) if tall else (130, 420)
    top = 0 if tall else 150
    reseed(name + '-coat')
    body = [(-w * 0.5, top - 10), (w * 0.5, top - 10), (w, top + 30), (w * 1.1, h - 20), (-w * 1.1, h - 20), (-w, top + 30)]
    s = ''.join(blob([(sx * 10, h - 30), (sx * (w * 0.8), h - 30), (sx * (w * 0.8 + 34), h - 4), (sx * (w * 0.8 + 30), h), (sx * 8, h)], LEATHER, 2.8) for sx in (-1, 1))
    s += blob(body, PALE, 3.6, 2.2) + fill([body[5], body[0], (-w * 0.1, top - 10), (-w * 0.3, h - 20), body[4]], COBALT, 1.0, op=0.28) + fur(body, 9 if tall else 6, 13, 13, 0.5, 2.2)
    s += blob([(-w * 1.06, top + (h - top) * 0.5), (0, top + (h - top) * 0.54), (w * 1.06, top + (h - top) * 0.5), (w * 1.08, top + (h - top) * 0.58), (0, top + (h - top) * 0.62), (-w * 1.08, top + (h - top) * 0.58)], RED, 2.6)
    for sx in (-1, 1): s += group(sleeve(150 if tall else 110, 22 if tall else 28, PALE, name, sx > 0, 0.6, 'open', sx), sx * w * 0.92, top + 40, sx * -14)
    if tall:
        f, d = gface(name, 62, 100, 0.86, (64, 16, 0.5), (0.34, -0.14, 11, 7), (PALE, 9), (0.4, 0.5), expr, bags=2, wrinkles=3)
        reseed(name + '-hair')
        hd = f + barbed([(-64, 40), (-40, 80 + d), (0, 90 + d), (40, 80 + d), (64, 40), (50, 170 + d), (20, 150 + d), (0, 230 + d), (-20, 150 + d), (-50, 170 + d)], PALE, 2.4) + blob([(-66, -60), (-40, -150), (0, -120), (40, -150), (66, -60), (0, -44)], COBALT, 3.0)
        return s + group(hd, 0, -96, 0, 0.86)
    f, d = gface(name, 108, 90, 1.2, (40, 26, 0.0), (0.26, -0.08, 12, 8), (PALE, 10), (0.34, 0.48), expr, bags=2, wrinkles=2)
    reseed(name + '-hair')
    hd = f + ''.join(barbed([(sx * 104, -30), (sx * 138, -50), (sx * 132, 10), (sx * 144, 40), (sx * 106, 30)], PALE, 2.2) for sx in (-1, 1)) + barbed([(-50, 30), (0, 22), (50, 30), (70, 56), (30, 46), (0, 52), (-30, 46), (-70, 56)], PALE, 2.2)
    return s + group(hd, 0, top - 80, 0, 0.86)


# ----------------------------------------------------------------------------- kadınlar: Kapak Kan'ın karısı, dadı
def kadin(name='ana', col=None, expr='grief', armL=14, armR=-14, hr=0):
    """Örtülü kadın; adına göre ayrı yüz. Boyun kökü (0,0); etek ucu y=470."""
    col = col or COBALT
    young = name == 'dadi'
    s = group(sleeve(180, 30, col, name, False, 0.74, 'open', -1, GOLD), -104, 44, armL) + robe(108, 150, 470, col, name, pattern=GOLD if not young else None, hem=RED) + group(sleeve(180, 30, col, name, True, 0.74, 'open', 1, GOLD), 104, 44, armR)
    reseed(name + '-scarf')
    s += blob([(-126, -50), (-104, -176), (0, -214), (104, -176), (126, -50), (140, 70), (0, 110), (-140, 70)], PALE if not young else GREEN, 3.2)
    f, d = (gface(name, 84, 84, 1.12, (36, 20, 0.0), (0.32, -0.08, 13, 9), (INK, 6), (0.34, 0.48), expr, bags=0, wrinkles=0, lash=True) if young
            else gface(name, 80, 92, 0.94, (56, 20, 0.35), (0.32, -0.12, 12, 8), (INK, 8), (0.36, 0.48), expr, bags=2, wrinkles=2))
    hd = f + blob([(-100, -40), (-84, -110), (0, -136), (84, -110), (100, -40), (60, -84), (0, -96), (-60, -84)], PALE if not young else GREEN, 2.8)
    if not young: hd += blob([(-86, -84), (0, -108), (86, -84), (82, -66), (0, -90), (-82, -66)], RED, 2.4)
    return s + group(hd, 0, -84, hr, 0.9, None, 0, 90)


# ----------------------------------------------------------------------------- Oğuz alpları (ayakta)
def alp(kind=0, expr='neutral', fallen=False):
    """Oğuz yiğitleri: üç yapı; miğferli, elinde kılıç ya da yay. Boyun kökü (0,0); ayak y=480."""
    name = f'alp{kind % 3}'; col = [COBALT, RED, GREEN][kind % 3]; w = [108, 78, 96][kind % 3]
    s = ''.join(blob([(sx * 14, 400), (sx * 80, 400), (sx * 110, 456), (sx * 106, 480), (sx * 10, 480)], LEATHER, 3.0) for sx in (-1, 1))
    s += group(sleeve(180, 28, col, name, False, 0.72, 'grip', -1), -w * 0.94, 42, 20) + robe(w, w * 1.2, 420, col, name, hem=GOLD, belt=LEATHER)
    held = group(C0.sword(), 0, 280, 180, 0.8) if kind % 3 != 1 else group(bow(), 0, 280, 0, 1.1)
    s += group(held + sleeve(180, 28, col, name, True, 0.72, 'grip', 1), w * 0.94, 42, -40 if not fallen else -150)
    f, d = gface(name, [96, 70, 88][kind % 3], [88, 96, 80][kind % 3], [1.15, 0.9, 1.05][kind % 3], ([44, 60, 40][kind % 3], 20, 0.1), (0.3, -0.06, 12, 8), (INK, 10), (0.36, 0.5), expr, bags=1, wrinkles=1)
    reseed(name + '-helm')
    hw = [100, 74, 92][kind % 3]
    hd = f + barbed([(-48, 34), (0, 26), (48, 34), (70, 66), (30, 52), (0, 58), (-30, 52), (-70, 66)], INK, 0) + blob([(-hw, -30), (-hw * 0.86, -100), (0, -150), (hw * 0.86, -100), (hw, -30), (0, -46)], PALE, 3.2)
    hd += fill([(-hw, -30), (-hw * 0.86, -100), (-hw * 0.3, -136), (-hw * 0.3, -40)], COBALT, 0.8, op=0.35) + blob([(-8, -150), (0, -190), (8, -150)], GOLD, 2.2) + blob([(-hw - 4, -40), (0, -58), (hw + 4, -40), (hw + 2, -22), (0, -40), (-hw - 2, -22)], GOLD, 2.4) + sparkle(hw * 0.4, -96, 8)
    return s + group(hd, 0, -78, 0, 0.88)


# ----------------------------------------------------------------------------- hayvanlar
def lion(roar=False):
    """Aslan: yandan, sola bakar; gür yele, püsküllü kuyruk. Sırtın ortası (0,0); pençe y=250."""
    reseed('lion')
    s = ''
    for x, back in ((-120, True), (170, True), (-170, False), (120, False)):
        leg = [(x - 30, 60), (x + 34, 60), (x + 26, 200), (x + 46, 230), (x + 40, 252), (x - 34, 252), (x - 24, 200)]
        s += fill(leg, GOLD, 1.0) + (fill(leg, COBALT, 1.0, op=0.4) if back else '') + ink(leg, 3.2, closed=True) + ''.join(ink([(x - 20 + k * 16, 238), (x - 20 + k * 16, 252)], 1.8, wob=0, smooth=False) for k in range(3))
    tail = [(250, -30), (330, -80), (380, -30), (360, 60)]
    s += group(ink(tail, 12, col=GOLD, op=1, taper=(0.05, 0.1), wob=0.6, press=0.1) + ink(tail, 2.4, wob=0.6, taper=(0, 0)) + barbed([(346, 50), (380, 70), (372, 120), (350, 96), (336, 116), (334, 66)], INK, 0), 0, 0, C0.SWAY * 1.4, 1, None, 250, -30)
    body = [(-230, -50), (-120, -110), (60, -92), (200, -110), (262, -50), (270, 40), (200, 100), (0, 86), (-200, 104), (-262, 40)]
    s += blob(body, GOLD, 3.8) + fill([(-262, 40), (-200, 104), (0, 86), (200, 100), (270, 40), (150, 50), (-150, 56)], COBALT, 1.0, op=0.3) + ticks(body, 20, (7, 13), 0.1, 0.4, 1.9)
    reseed('lion-mane')
    mane = []
    for i in range(26):
        a = i * 6.283 / 26; r = 190 if i % 2 else 140
        mane.append((-250 + math.cos(a) * r * 0.9, -120 + math.sin(a) * r))
    s += fill(mane, LEATHER, 1.0, smooth=False) + ink(mane, 3.0, closed=True, smooth=False, wob=0.4) + ''.join(ink([(-250 + math.cos(a) * 80, -120 + math.sin(a) * 80), (-250 + math.cos(a) * 130, -120 + math.sin(a) * 130)], 2.2, wob=0.3, taper=(0.1, 0.6), smooth=False) for a in [k * 0.52 for k in range(12)])
    face = [(-330, -190), (-250, -216), (-190, -170), (-186, -90), (-230, -40), (-300, -30), (-350, -70), (-362, -130)]
    s += blob(face, GOLD, 3.6) + blob([(-316, -200), (-300, -236), (-276, -206)], GOLD, 2.6) + blob([(-224, -206), (-200, -236), (-192, -196)], GOLD, 2.6)
    s += blob([(-362, -110), (-300, -120), (-286, -70), (-320, -44), (-360, -66)], PALE, 2.8) + blob([(-366, -116), (-340, -122), (-344, -100)], INK, 1.6)
    for ex in (-296, -232): s += fill(ellipse(ex, -146, 12, 9, 8), PALE, 0.3) + f'<circle cx="{ex - 2}" cy="-145" r="4.5" fill="{INK}"/>' + ink([(ex - 16, -162), (ex + 14, -160 + (8 if roar else 0))], 4, wob=0.2, smooth=False)
    s += ''.join(ink([(-340, -84 + k * 8), (-400, -96 + k * 16)], 1.6, wob=0.2, taper=(0, 0.6), smooth=False) for k in range(3))
    if roar: s += group(mouth(0, 0, 34, 6, 34, 0, SKIN_D, FINE, RED, PALE, top=5, bot=4), -326, -52, 14)
    else: s += ink([(-358, -62), (-326, -50), (-300, -58)], 2.6, wob=0.2)
    return s


def sheep(ram=False, peek=None):
    """Koyun: yün yumağı, kara yüz. ram=True: kıvrık boynuzlu koç. peek: postun altından bakan Basat'ın ifadesi. Sırt (0,0); ayak y=130."""
    reseed('sheep' + str(ram))
    s = ''.join(ink([(x, 60), (x + 2, 128)], 11, col=COAT, op=1, taper=(0, 0.05), wob=0.3, smooth=False) for x in (-70, -40, 50, 80))
    wool = [(-110, -10), (-90, -60), (-40, -84), (20, -80), (80, -64), (118, -16), (110, 50), (50, 80), (-40, 82), (-100, 50)]
    lobes = [ellipse(x, y, r, r * 0.9, 9, 0.08) for x, y, r in ((-80, -20, 46), (-36, -52, 46), (22, -50, 48), (78, -20, 46), (70, 34, 44), (10, 46, 50), (-56, 38, 46))]
    s += ''.join(ink(p, 3.0, closed=True, wob=0.8) for p in lobes) + ''.join(fill(p, PALE, 1.2) for p in lobes) + fill(wool, PALE, 1.0) + fill([(-100, 50), (-40, 82), (50, 80), (110, 50), (40, 40), (-40, 44)], COBALT, 1.0, op=0.28)
    s += ''.join(ink([(x - 12, y), (x, y - 9), (x + 12, y)], 1.9, wob=0.3) for x, y in ((-60, -30), (0, -44), (56, -26), (-20, 20), (40, 26)))
    if peek:
        f, d = gface('basat', 92, 104, 0.96, (52, 18, 0.1), (0.31, -0.1, 14, 10), (INK, 11), (0.36, 0.48), peek, bags=0, wrinkles=0)
        s += group(f, -112, 4, -8, 0.5) + fill([(-164, -22), (-150, -56), (-112, -70), (-70, -52), (-62, -22), (-84, -34), (-112, -40), (-140, -32)], PALE, 1.0) + ink([(-164, -22), (-140, -32), (-112, -40), (-84, -34), (-62, -22)], 2.4, wob=0.5)
    else:
        head = [(-150, -50), (-110, -64), (-96, -20), (-120, 20), (-160, 10), (-172, -24)]
        s += blob(head, COAT, 3.0) + fill(ellipse(-134, -30, 6, 5, 6), PALE, 0.3) + f'<circle cx="-135" cy="-30" r="2.4" fill="{INK}"/>' + blob([(-112, -62), (-84, -74), (-92, -48)], COAT, 2.2)
    if ram:
        hx = -96 if peek else -120
        horn = [(hx + math.cos(a) * (46 - a * 5), -72 + math.sin(a) * (40 - a * 4.5)) for a in [k * 0.4 for k in range(16)]]
        s += ink(horn, 15, col=GOLD, op=1, taper=(0.02, 0.5), wob=0.3, press=0.1) + ink(horn, 2.4, wob=0.3, taper=(0, 0.3))
    return s


# ----------------------------------------------------------------------------- eşyalar
def spit(hot=True):
    """Şiş: sapı (0,0)'da, ucu yukarıda; kızdırılmışsa ucu akkor."""
    reseed('spit')
    s = ink([(0, 60), (0, -300)], 12, col=COAT, op=1, taper=(0, 0.25), wob=0.3, smooth=False) + blob([(-14, 40), (14, 40), (16, 110), (-16, 110)], LEATHER, 2.6)
    if hot: s += ink([(0, -130), (0, -300)], 12, col=RED, op=1, taper=(0.3, 0.25), wob=0.3, smooth=False) + ink([(0, -210), (0, -300)], 7, col=GOLD, op=1, taper=(0.3, 0.3), wob=0, smooth=False) + sparkle(0, -292, 22)
    return s


def dagger():
    reseed('dagger')
    return blob([(-9, 0), (-12, -90), (0, -150), (12, -90), (9, 0)], PALE, 2.6) + ink([(0, -10), (0, -130)], 1.7, wob=0, smooth=False) + blob([(-30, 0), (30, 0), (26, 14), (-26, 14)], GOLD, 2.4) + blob([(-9, 14), (9, 14), (10, 60), (-10, 60)], RED, 2.4) + sparkle(-4, -110, 8)


def ring():
    reseed('ring')
    return ink(ellipse(0, 0, 44, 44, 12), 13, col=GOLD, op=1, closed=True, wob=0.3) + ink(ellipse(0, 0, 50, 50, 12), 2.2, closed=True, wob=0.3) + blob(ellipse(0, -48, 20, 18, 8), GREEN, 2.6) + sparkle(6, -54, 12)


def boot_with_basat(expr='fear', cut=False):
    """Tepegöz'ün çizmesi: koncunda Basat. cut=True: hançerle yarılmış, Basat çıkıyor. Taban ortası (0,0)."""
    reseed('bigboot')
    boot = [(-120, -470), (120, -470), (126, -90), (300, -50), (296, 0), (-130, 0)]
    s = group(basat_head(expr), 0, -560 if not cut else -500, -6, 0.9)
    s += blob(boot, LEATHER, 4.0) + fill([(-130, 0), (-120, -470), (-40, -470), (-50, 0)], INK, 1.0, op=0.3) + blob([(-128, -470), (128, -470), (132, -410), (-132, -410)], COAT, 3.2) + ''.join(stud(x, -440, 6) for x in range(-100, 110, 40))
    s += ticks([(-110, -390), (110, -390), (120, -100), (-120, -20)], 26, (9, 18), 0.2, 0.5, 2.2)
    if cut: s += fill([(20, -400), (60, -300), (34, -200), (70, -110), (40, -110), (6, -200), (30, -300)], INK, 0.8, smooth=False) + group(dagger(), 90, -250, 60, 0.9)
    return s


def chain_sword(swing=0.0):
    """Zincire asılı kınsız kılıç: durmadan iner çıkar. Zincirin tavana bağlandığı nokta (0,0)."""
    reseed('chain')
    L = 300 + swing * 120
    s = ''.join(ink(ellipse(0, y, 9, 14, 8), 4, col=PALE, op=1, closed=True, wob=0.2) + ink(ellipse(0, y, 12, 17, 8), 1.6, closed=True, wob=0.2) for y in range(10, int(L), 26))
    return s + group(C0.sword(), 0, L + 70, 180, 1.2)


def yiginak(k=1.0, cracked=False):
    """Yığınak: parıl parıl, başı kıçı belirsiz yumru. cracked: yarılmış. Taban ortası (0,0)."""
    reseed('yiginak')
    lob = [ellipse(x * k, y * k, r * k, r * 0.86 * k, 10, 0.1) for x, y, r in ((-90, -70, 90), (30, -110, 110), (120, -60, 80), (-20, -40, 110), (70, -30, 90))]
    s = ''.join(ink(p, 3.6, closed=True, wob=1.0) for p in lob) + ''.join(fill(p, SKIN_L, 1.4) for p in lob) + fill([(-180 * k, -30 * k), (0, -60 * k), (190 * k, -30 * k), (150 * k, 30 * k), (-150 * k, 30 * k)], RED, 1.4, op=0.35)
    for x, y, a in ((-120, -60, 0.6), (-20, -150, 1.4), (90, -120, 2.2), (130, -40, 0.3), (-40, -30, 2.6), (40, -70, 1.0)): s += cracks(x * k, y * k, 90 * k, a, 2, 2.2).replace(f'fill="{INK}"', f'fill="{RED}"')   # damarlar
    s += ''.join(fill(ellipse(x * k, y * k, 26 * k, 14 * k, 8, 0.1), PALE, 0.8, op=0.8) for x, y in ((-90, -110), (50, -170), (120, -80))) + ''.join(sparkle(x * k, y * k, 20 * k) for x, y in ((-110, -120), (60, -180), (140, -90), (0, -110), (-40, -20)))
    if cracked: s += fill([(0, -210 * k), (30 * k, -130 * k), (-20 * k, -90 * k), (24 * k, -30 * k), (60 * k, -30 * k), (20 * k, -90 * k), (70 * k, -130 * k), (40 * k, -210 * k)], INK, 0.8, smooth=False)
    return s


# ----------------------------------------------------------------------------- bebek Basat, yumurta gibi yarılan yığınak
def bebek(expr='neutral', ph=0.0):
    """Emekleyen bebek: yüzü sağa dönük, ak zıbınlı. El ve dizlerinin bastığı yer y=0. ph: emekleme evresi (-1..1)."""
    reseed('bebek')
    s = ''
    for x, d in ((-66, -ph), (64, ph)): s += blob(ellipse(x + d * 18, -36, 25, 40, 9, 0.06), C0.SKIN_D, 2.6)          # uzak kol ve bacak
    s += blob(ellipse(0, -88, 106, 62, 14, 0.05), PALE, 3.2) + ink([(-70, -50), (-20, -40), (50, -44)], 1.8, wob=0.4, op=0.5)
    s += blob(ellipse(-96, -96, 40, 44, 10, 0.05), PALE, 3.0)                                                          # bezli kıç
    for x, d in ((-86, ph), (40, -ph)): s += blob(ellipse(x + d * 18, -32, 27, 42, 9, 0.06), C0.SKIN, 2.8)
    f, _ = gface('bebek', 86, 82, 0.84, (20, 10, 0.1), (0.3, 0.06, 16, 12), (INK, 5), (0.3, 0.5), expr, bags=0, wrinkles=0)
    reseed('bebek-hair')
    tuft = fill([(-84, -40), (-70, -88), (-20, -112), (40, -108), (82, -78), (86, -40), (50, -70), (20, -56), (-10, -74), (-44, -56)], INK, 0.8, smooth=False)
    tuft += ink([(0, -108), (10, -140), (30, -128)], 5, taper=(0, 0.7), wob=0.3)
    s += group(f + tuft, 118, -150, 5 * ph, 0.8, None, 0, 60)
    return s


def yumurta(open=0.0):
    """Yığınak: parıl parıl, yumurta gibi; open 0..1 iki yana yarılır. Taban ortası (0,0)."""
    reseed('yumurta')
    arc = [(150 * math.cos(a), -172 + 176 * math.sin(a)) for a in [-math.pi / 2 + math.pi * i / 13 for i in range(14)]]
    zig = [(0, 4), (20, -60), (-18, -120), (22, -180), (-16, -240), (20, -296), (0, -348)]
    shine = lambda sx: fill(ellipse(sx * 78, -250, 30, 16, 8, 0.1, -30 * sx), PALE, 0.8, op=0.8) + sparkle(sx * 90, -130, 20) + sparkle(sx * 50, -290, 14)
    if open < 0.02:
        whole = arc + [(-x, y) for x, y in reversed(arc)]
        return fill(whole, C0.SKIN_L, 1.2) + fill([(-140, -110), (0, -80), (140, -110), (120, -20), (0, 4), (-120, -20)], RED, 1.2, op=0.3) + ink(whole, 3.6, closed=True, wob=0.8) + shine(-1) + shine(1)
    s = ''
    for sx in (-1, 1):
        half = [(sx * x, y) for x, y in arc] + zig
        body = fill(half, C0.SKIN_L, 1.0, smooth=False) + fill([(sx * 140, -110), (sx * 10, -80), (sx * 10, 0), (sx * 120, -20)], RED, 1.0, op=0.3) + ink(half, 3.4, closed=True, wob=0.5, smooth=False) + shine(sx)
        s += group(body, sx * open * 90, 0, sx * open * 46, 1, None, sx * 120, 0)
    return s
