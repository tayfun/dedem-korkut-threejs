"""Deli Dumrul — "Azrail'e Kılıç Çeken Adam": kadro. Her hikâyenin kadrosu ve paleti kendine özgüdür."""
import math
from ..kit import *

# Kilitli palet: bir mavi, bütün kadro için tek ten, bir soluk, iki vurgu.
COBALT, SKIN, PALE, GOLD, RED = '#2a3fa3', '#ee6f58', '#e7dcf2', '#e3a72c', '#b3231c'
SKIN_D, SKIN_L = '#c0473f', '#f89e84'      # gölgede koyu ten, ışıkta açık ten
COAT, LEATHER = '#23130f', '#8a4b2c'       # Dumrul'un kara deri kaftanı (mürekkebin açığı) ve kayış kahvesi

EXPR = {
    'neutral': dict(brow=0.32, by=4, open=0.9, pupil=4.2, mouth='closed', jaw=0),      # dinlenirken bile çatık
    'blink':   dict(brow=0.32, by=5, open=0.0, pupil=4.2, mouth='closed', jaw=0),
    'anger':   dict(brow=0.7, by=10, open=0.8, pupil=2.8, mouth='snarl', jaw=16, flare=1),
    'smug':    dict(brow=-0.18, by=-3, open=0.62, pupil=4.0, mouth='grin', jaw=8),
    'shock':   dict(brow=-0.3, by=-22, open=1.0, pupil=2.8, mouth='gape', jaw=46, shock=True),
}


def stud(x, y, r=4.2):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r + 1.2:.1f}" fill="{INK}"/><circle cx="{x - 0.6:.1f}" cy="{y - 0.6:.1f}" r="{r:.1f}" fill="{PALE}"/>'


def strap(a, b, w=26, studs=7, shade=False):
    """Zımbalı deri kayış: iki nokta arasında bant."""
    dx, dy = b[0] - a[0], b[1] - a[1]; d = math.hypot(dx, dy) or 1; nx, ny = -dy / d * w / 2, dx / d * w / 2
    q = [(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny), (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)]
    s = fill(q, LEATHER, 0.8, smooth=False) + (fill(q, INK, 0.8, smooth=False, op=0.35) if shade else '')
    s += ink(q, 2.6, closed=True, smooth=False, wob=0.3)
    s += ''.join(stud(a[0] + dx * (i + 0.5) / studs, a[1] + dy * (i + 0.5) / studs, 3.6) for i in range(studs))
    return s


def dumrul_head(expr='neutral'):
    """Deli Dumrul'un başı: koca çene, kısa gür kara sakal, çatık kaş, kürklü börk."""
    e = EXPR[expr]; jaw = e['jaw']
    J = lambda x, y: (x, y + jaw * max(0.0, min(1.25, (y - 30) / 150)))
    skull = [J(*p) for p in [(-98, -150), (-30, -178), (52, -174), (114, -138), (132, -70), (152, -10), (176, 62), (168, 132), (116, 186), (20, 206), (-76, 196), (-144, 152), (-172, 82), (-162, 10), (-130, -62)]]
    s = clipdef('dh', skull)
    for sx in (-1, 1):
        reseed(f'dumrul-ear{sx}')
        ear = [(sx * 150, -44), (sx * 186, -56), (sx * 198, -20), (sx * 186, 22), (sx * 156, 20)]
        s += blob(ear, SKIN_D if sx < 0 else SKIN, 3.4) + ink([(sx * 166, -30), (sx * 178, -14), (sx * 168, 6)], 2.0, wob=0.2)
    reseed('dumrul-skull')
    s += fill(skull, SKIN, 1.4)
    s += fill([J(*p) for p in [(-200, -160), (-70, -150), (-96, -40), (-118, 40), (-80, 120), (-10, 176), (90, 196), (60, 260), (-220, 260)]], SKIN_D, 1.2, clip='dh')
    s += fill(ellipse(70, 4, 36, 22, 9, 0.12), SKIN_L, 1.0, clip='dh') + fill(ellipse(40, -92, 44, 14, 8, 0.1), SKIN_L, 1.0, clip='dh')
    s += ink(skull, 3.6, closed=True, press=0.5)
    # kısa gür sakal: som kara, dış kenarı dikenli; çeneyle birlikte iner
    reseed('dumrul-beard')
    outer = [(-158, -26), (-172, 52), (-164, 122), (-118, 180), (-46, 208), (20, 214), (82, 206), (126, 180), (166, 124), (176, 52), (158, -26)]
    oc = catmull(outer, False, 5); barbed = []
    for i, (x, y) in enumerate(oc):
        k = 1 + (R(0.02, 0.075) if i % 2 else -0.01) * (1 if 2 < i < len(oc) - 3 else 0)   # kısa, düzensiz dikenler
        barbed.append(J(x * k, 60 + (y - 60) * k))
    inner = [(140, 0), (112, 50), (70, 40), (38, 54), (6, 46), (-26, 54), (-58, 40), (-100, 50), (-130, 0)]
    s += fill(barbed + [J(*p) if p[1] > 50 else p for p in inner], INK, 0.6, smooth=False)
    s += ''.join(ink([J(x, y), J(x + dx, y + 12)], 1.9, col=LEATHER, op=0.9, taper=(0.1, 0.7), wob=0, smooth=False) for x, y, dx in ((-120, 110, -4), (-70, 160, -2), (-10, 180, 0), (60, 172, 3), (118, 124, 5), (-136, 50, -4), (140, 60, 4)))
    # börk: kabarık kürk bant, dikişli deri tepe
    reseed('dumrul-hat')
    dome = [(-108, -160), (-92, -226), (-22, -268), (20, -292), (54, -262), (104, -216), (116, -160)]
    s += blob(dome, COAT, 3.8) + fill([(-108, -160), (-96, -220), (-40, -256), (-40, -160)], INK, 1.0, op=0.4)
    s += ''.join(ink([(18 + k * 2, -280 + k * 22), (22 + k * 2, -268 + k * 22)], 2.0, col=PALE, op=0.85, wob=0, smooth=False) for k in range(5))
    band = [(-176, -150), (-168, -190), (-120, -204), (-60, -212), (10, -206), (80, -212), (140, -198), (178, -176), (184, -132), (160, -100), (90, -92), (0, -86), (-90, -92), (-160, -102), (-186, -124)]
    s += fill(band, LEATHER, 2.4) + fill([(-186, -124), (-176, -150), (-168, -190), (-120, -204), (-70, -208), (-84, -92), (-160, -102)], INK, 1.0, op=0.38)
    s += ink(band, 3.4, closed=True, press=0.6, wob=1.4) + fur(band, 6, 11, 13, 0.6, 2.4) + dashrow([(-176, -150), (-120, -204), (10, -208), (140, -198), (182, -160)], 12, 12, -0.4, 2.2)
    # göz torbaları, gözler
    reseed('dumrul-eyes')
    ex = (-42, 38); ey = -30
    for cx in ex:
        s += ink([(cx - 16, ey + 15), (cx, ey + 21), (cx + 17, ey + 14)], 2.0, wob=0.2) + ink([(cx - 12, ey + 23), (cx + 1, ey + 28), (cx + 13, ey + 23)], 1.8, wob=0.2)
    sh = e.get('shock', False)
    for cx in ex:
        s += eye(cx, ey - (6 if sh else 0), 17, 12.5, PALE, SKIN_D, e['open'], e['pupil'], (1.5, 2 if not sh else 0), lid=0.26, shock=sh)
    # kaşlar: kalın, kara, dikenli; ortada çatık
    reseed('dumrul-brows')
    for sx, cx in ((-1, ex[0]), (1, ex[1])):
        b = e['brow']; y0 = ey - 27 + e['by']
        inner_p = (cx - sx * 24, y0 + b * 24); outer_p = (cx + sx * 34, y0 - b * 12 + 3)
        mid = ((inner_p[0] + outer_p[0]) / 2, min(inner_p[1], outer_p[1]) - 7 + abs(b) * 6)
        s += ink([inner_p, mid, outer_p], 16, taper=(0.05, 0.45), press=0.25, wob=0.5)
        for k in (0.2, 0.42, 0.64):
            px, py = inner_p[0] + (outer_p[0] - inner_p[0]) * k, inner_p[1] + (outer_p[1] - inner_p[1]) * k - 7
            s += ink([(px, py), (px + sx * 6, py - 10)], 3.2, col=INK, taper=(0, 0.8), wob=0, smooth=False)
    if e['brow'] > 0.2:   # kaş arası kırışıkları
        s += ink([(-10, ey - 34), (-6, ey - 12)], 2.4, wob=0, smooth=False) + ink([(6, ey - 36), (4, ey - 14)], 2.4, wob=0, smooth=False)
    s += ink([(-44, -92), (0, -98), (48, -92)], 2.0, wob=0.4) + ink([(-28, -80), (4, -84), (32, -80)], 1.8, wob=0.3)
    s += ink([(70, -64), (84, -30)], 2.2, wob=0, smooth=False) + ''.join(ink([(72 + k * 5, -56 + k * 11), (82 + k * 5, -58 + k * 11)], 1.8, wob=0, smooth=False) for k in range(3))   # yara izi
    # burun: geniş, yumru
    reseed('dumrul-nose')
    fl = e.get('flare', 0) * 5
    nose = [(-12, -44), (8, -46), (24, -6), (42 + fl, 26), (26 + fl, 44), (0, 46), (-26 - fl, 36), (-16, 4)]
    s += fill(nose, SKIN_L, 1.0) + ink([(8, -44), (26, -6), (44 + fl, 26), (28 + fl, 45), (2, 47)], 3.6, wob=0.4, taper=(0.3, 0.2))
    s += ink([(-16, 6), (-28 - fl, 34), (-10, 44)], 2.6, wob=0.3)
    s += fill(ellipse(-11 - fl * 0.5, 39, 5.5 + fl * 0.4, 3.4, 6), INK, 0.3) + fill(ellipse(18 + fl * 0.5, 41, 5.5 + fl * 0.4, 3.4, 6), INK, 0.3)
    # ağız sakalın üstüne çizilir; dudak sakalı yarar
    reseed('dumrul-mouth')
    m = e['mouth']; mx, my = 6, 96 + jaw * 0.45
    if m == 'closed':
        s += fill([(mx - 40, my + 2), (mx, my - 3), (mx + 42, my + 1), (mx + 30, my + 17), (mx, my + 21), (mx - 28, my + 17)], SKIN_D, 0.8)
        s += ink([(mx - 44, my + 6), (mx, my + 1), (mx + 46, my + 5)], 3.2, wob=0.4) + ink([(mx - 26, my + 19), (mx + 2, my + 22), (mx + 28, my + 18)], 2.0, wob=0.2)
    elif m == 'grin':
        s += mouth(mx, my + 4, 82, 2, 30, 18, SKIN_D, FINE, RED, PALE, gum=RED, top=8, bot=7)
        s += fill([(mx + 20, my + 6), (mx + 38, my + 4), (mx + 36, my + 22), (mx + 22, my + 23)], GOLD, 0.4, smooth=False) + sparkle(mx + 32, my + 10, 6)
    elif m == 'snarl':
        s += mouth(mx, my + 6, 72, 8, 26, -10, SKIN_D, FINE, RED, PALE, top=7, bot=7)
    else:
        s += mouth(mx, my + 14, 48, 14, 58, 0, SKIN_D, FINE, RED, PALE, top=6, bot=6)
    return s


def hand(lit=True, pose='open', ring=True, flip=1):
    """El: avuç, boğumlu dolgun parmaklar, boğum çentikleri, parmak ucunda biten kısa koyu tırnak, yüzük.
    Bilek (0,0)'dadır, parmaklar aşağı uzanır. pose: open | fist | grip."""
    reseed(f'hand-{lit}-{pose}-{flip}')
    c = SKIN if lit else SKIN_D
    s = ''
    palm = [(-34, -4), (0, -12), (34, -4), (40, 40), (30, 66), (-28, 68), (-40, 38)]
    curl = {'open': 1.0, 'fist': 0.36, 'grip': 0.5}[pose]
    fingers = [(-27, 62, 46, -0.10), (-9, 68, 54, -0.03), (9, 68, 52, 0.04), (26, 62, 42, 0.12)]
    if pose != 'open': s += blob(palm, c, 3.2)
    for i, (fx, fy, fl, fa) in enumerate(fingers):
        l = fl * curl; ca, sa = math.cos(fa + 1.571), math.sin(fa + 1.571)
        tip = (fx + ca * l, fy + sa * l); nx, ny = -sa, ca
        f = [(fx - nx * 9, fy - ny * 9), (fx + ca * l * 0.5 - nx * 10.5, fy + sa * l * 0.5 - ny * 10.5), (tip[0] - nx * 8, tip[1] - ny * 8), (tip[0] + ca * 7, tip[1] + sa * 7),
             (tip[0] + nx * 8, tip[1] + ny * 8), (fx + ca * l * 0.5 + nx * 10.5, fy + sa * l * 0.5 + ny * 10.5), (fx + nx * 9, fy + ny * 9)]
        s += blob(f, c, 3.0)
        for k in ((0.45, 0.48) if pose == 'open' else (0.5,)):   # boğum çentikleri
            mx, my = fx + ca * l * k, fy + sa * l * k
            s += ink([(mx - nx * 6, my - ny * 6), (mx + nx * 6, my + ny * 6 + 1)], 1.8, wob=0, smooth=False)
        nb = (tip[0] - ca * 5, tip[1] - sa * 5)   # tırnak: parmak ucunu geçmez
        s += fill([(nb[0] - nx * 5, nb[1] - ny * 5), (tip[0] + ca * 2 - nx * 4, tip[1] + sa * 2 - ny * 4), (tip[0] + ca * 2 + nx * 4, tip[1] + sa * 2 + ny * 4), (nb[0] + nx * 5, nb[1] + ny * 5)], SKIN_D if lit else FINE, 0.3, smooth=False)
        if ring and i == 1: s += fill([(fx - 11, fy + 6), (fx + 11, fy + 7), (fx + 11, fy + 15), (fx - 11, fy + 14)], GOLD, 0.4, smooth=False) + sparkle(fx + 3, fy + 10, 5)
    if pose == 'open': s += blob(palm, c, 3.2)
    for kx in (-26, -9, 9, 25): s += ink([(kx - 6, 60), (kx, 55), (kx + 6, 60)], 1.8, wob=0)   # boğum tümsekleri
    th = [(flip * 30, 2), (flip * 56, 14), (flip * 64, 40), (flip * 52, 52), (flip * 36, 36)]
    s += blob(th, c, 3.0) + fill([(flip * 55, 36), (flip * 63, 40), (flip * 57, 50), (flip * 50, 46)], SKIN_D if lit else FINE, 0.3, smooth=False)
    s += ink([(-18, 20), (4, 30), (22, 22)], 1.8, wob=0.2)
    return s


def sword():
    """Kara kılıç: eğri namlu, haç balçak. Kabza (0,0)'da, namlu yukarı uzanır."""
    reseed('sword')
    edge = [(-12, -16), (-18, -140), (-8, -270), (30, -380), (74, -440)]
    back = [(60, -410), (30, -300), (20, -150), (14, -16)]
    blade = catmull(edge, False, 6) + catmull(back, False, 6)
    s = fill(blade, COBALT, 0.8, smooth=False) + fill(catmull([(2, -16), (4, -150), (18, -290), (56, -410)], False, 6) + catmull(back, False, 6), INK, 0.6, smooth=False, op=0.8)
    s += ink(blade, 3.0, closed=True, smooth=False, wob=0.3) + ink([(-8, -40), (-12, -150), (-2, -260), (30, -360)], 1.9, col=PALE, op=0.9, wob=0.2) + sparkle(-6, -230, 13)
    s += blob([(-54, -18), (-40, -30), (0, -22), (40, -30), (54, -18), (40, -4), (0, 4), (-40, -4)], PALE, 3.0) + stud(0, -13, 5)
    s += blob([(-11, 2), (11, 2), (13, 64), (-13, 64)], LEATHER, 2.8) + ''.join(ink([(-11, y), (11, y + 5)], 1.8, wob=0, smooth=False) for y in (14, 26, 38, 50))
    s += blob(ellipse(2, 74, 15, 13, 7), PALE, 2.8)
    return s


def dumrul_body():
    """Gövde: fıçı gibi; boyun kökü (0,0). Kara deri kaftan, çapraz zımbalı kayışlar, omuzluk, geniş kemer, belde kın."""
    reseed('dumrul-body')
    torso = [(-70, -14), (70, -14), (176, 22), (214, 150), (222, 300), (200, 440), (-200, 440), (-222, 300), (-214, 150), (-176, 22)]
    s = clipdef('db', torso)
    for sx in (-1, 1):   # çizmeler
        reseed(f'dumrul-boot{sx}')
        boot = [(sx * 36, 430), (sx * 136, 430), (sx * 142, 506), (sx * 180, 526), (sx * 178, 556), (sx * 30, 556)]
        s += blob(boot, LEATHER, 3.4) + (fill(boot, INK, 1.0, op=0.35) if sx < 0 else '')
        s += blob([(sx * 32, 446), (sx * 140, 446), (sx * 142, 474), (sx * 30, 474)], COAT, 2.6) + ''.join(stud(sx * (48 + k * 26), 460, 3.2) for k in range(4))
        s += ticks([(sx * 40, 480), (sx * 136, 480), (sx * 170, 548), (sx * 36, 548)], 10, (5, 9), 0.2 * sx, 0.5, 1.9)
    reseed('dumrul-coat')
    s += fill(torso, COAT, 1.5)
    s += fill([(-10, 330), (10, 330), (60, 446), (-60, 446)], INK, 1.0, clip='db')                    # etek yırtmacı: içi koyu
    s += fill([(-240, -20), (-60, -20), (-96, 140), (-70, 300), (-110, 450), (-240, 450)], INK, 1.2, clip='db', op=0.42)   # gölge yanı
    s += '<g clip-path="url(#db)">' + dots(torso, 150, (1.0, 1.8), PALE, 0.22) + '</g>'                 # deri gözenekleri
    for sx in (-1, 1):   # ön kenar şeritleri: yakadan eteğe, kemerin altında açılır
        band = [(sx * 34, -14), (sx * 8, -14), (sx * 10, 290), (sx * 62, 440), (sx * 100, 440), (sx * 44, 290)]
        s += fill(band, LEATHER, 1.0, smooth=False, clip='db') + ink(band, 2.6, closed=True, smooth=False, wob=0.3)
        s += ''.join(stud(sx * 22, y, 3.4) for y in range(20, 280, 34)) + ''.join(stud(sx * (34 + (y - 300) * 0.36), y, 3.4) for y in range(350, 430, 30))
    s += fill([(-204, 410), (204, 410), (200, 440), (-200, 440)], LEATHER, 1.0, smooth=False, clip='db') + ink([(-204, 410), (0, 414), (204, 410)], 2.4, wob=0.4) + ''.join(stud(x, 426, 3.2) for x in range(-180, 190, 36))
    s += ink(torso, 4.0, closed=True, press=0.45)
    s += strap((-150, 4), (140, 262), 28, 8, False) + strap((150, 4), (-140, 262), 28, 8, True)       # çapraz kayışlar
    for sx in (-1, 1):   # omuzluklar: perçinli çelik
        reseed(f'dumrul-pauldron{sx}')
        p = [(sx * 222, 70), (sx * 204, 2), (sx * 130, -40), (sx * 62, -22), (sx * 84, 52), (sx * 150, 92)]
        s += fill(p, PALE, 1.2) + fill(p, COBALT, 1.2, op=0.5 if sx < 0 else 0.18) + ink(p, 3.4, closed=True, press=0.4)
        s += ink([(sx * 204, 30), (sx * 140, 6), (sx * 78, 14)], 2.0, wob=0.3) + ''.join(stud(sx * x, y, 3.4) for x, y in ((196, 52), (160, 72), (110, 60), (90, 30), (120, -18), (176, -4)))
        s += dashrow([(sx * 222, 70), (sx * 150, 92), (sx * 84, 52)], 12, 7, 0.2, 2.0)
    reseed('dumrul-belt')
    belt = [(-222, 262), (0, 280), (224, 262), (228, 322), (0, 342), (-226, 322)]
    s += blob(belt, LEATHER, 3.4) + fill([(-226, 322), (-222, 262), (-90, 272), (-100, 334)], INK, 0.8, op=0.35) + ''.join(stud(x, 280 + (1 - abs(x) / 230) * 14, 3.6) + stud(x, 316 + (1 - abs(x) / 230) * 16, 3.6) for x in range(-200, 210, 40) if abs(x) > 50)
    s += blob(ellipse(0, 310, 40, 36, 10, 0.02), PALE, 3.4) + medallion(0, 310, 22, INK, 2.2) + sparkle(16, 294, 9)
    s += strap((-200, 330), (80, 372), 20, 6, True)                                                   # kılıç kayışı
    # belde kın
    reseed('dumrul-scabbard')
    sc = catmull([(-150, 330), (-190, 420), (-250, 500), (-322, 540)], False, 6) + catmull([(-300, 562), (-222, 520), (-160, 440), (-116, 344)], False, 6)
    s += fill(sc, LEATHER, 0.8, smooth=False) + fill(sc, INK, 0.8, smooth=False, op=0.3) + ink(sc, 3.0, closed=True, smooth=False, wob=0.3)
    s += blob([(-158, 322), (-108, 336), (-116, 362), (-166, 348)], PALE, 2.6) + blob([(-248, 474), (-216, 500), (-232, 520), (-262, 494)], PALE, 2.4)
    s += blob([(-176, 290), (-150, 256), (-120, 262), (-112, 300), (-150, 318)], PALE, 2.8) + blob([(-158, 262), (-170, 214), (-148, 208), (-136, 258)], LEATHER, 2.6)
    # kürk yaka
    reseed('dumrul-collar')
    col = [(-78, -30), (0, -12), (78, -30), (62, 14), (0, 30), (-62, 14)]
    s += blob(col, LEATHER, 3.2) + fur(col, 2, 11, 9, 0.4, 2.1)
    return s


def dumrul_arm(side=1, lit=True, pose='open'):
    """Kol: omuz (0,0)'da, aşağı sarkar; el ucunda. Kaldırmak için omuzdan döndürülür."""
    reseed(f'dumrul-arm{side}')
    arm = [(-44, -10), (30, -22), (56, 60), (52, 170), (40, 236), (-36, 236), (-52, 160), (-60, 60)]
    s = fill(arm, COAT, 1.4)
    if not lit: s += fill(arm, INK, 1.4, op=0.42)
    s += dots(arm, 36, (1.0, 1.8), PALE, 0.22) + ink(arm, 3.8, closed=True, press=0.45) + ink([(-30, 118), (-6, 128), (22, 116)], 2.0, col=PALE, op=0.5, wob=0.3)
    s += strap((-60, 74), (58, 66), 24, 5, not lit)                                                   # pazı bandı
    br = [(-52, 150), (52, 146), (46, 244), (-42, 248)]                                                # kolçak: çelik, kıvrım işlemeli
    s += fill(br, PALE, 1.0, smooth=False) + fill(br, COBALT, 1.0, smooth=False, op=0.5 if not lit else 0.16) + ink(br, 3.2, closed=True, smooth=False, wob=0.4)
    s += scroll(-8, 196, 18, INK, 2.0) + scroll(20, 200, 12, INK, 1.9, -1) + ''.join(stud(x, y, 3.2) for x, y in ((-40, 160), (40, 157), (-32, 236), (36, 234)))
    s += group(hand(lit, pose, True, side), 0, 262)
    return s


def dumrul(expr='neutral', armL=8, armR=-8, hr=0, poseR='open', sword_in_hand=False):
    """Bütün figür (tasarım sayfası ve tek kare için). Boyun kökü (0,0)."""
    s = group(dumrul_arm(-1, False), -190, 48, armL)
    s += dumrul_body()
    extra = group(sword(), 0, 318, 180) if sword_in_hand else ''   # namlu, kolun uzantısında
    s += group(extra + dumrul_arm(1, True, poseR), 190, 48, armR)
    s += group(dumrul_head(expr), 0, -150, hr, 0.86, None, 0, 150)
    return s


AZ = {
    'neutral': dict(brow=0.1, open=0.55, mouth='line', jaw=0),
    'blink':   dict(brow=0.1, open=0.0, mouth='line', jaw=0),
    'stern':   dict(brow=0.5, open=0.4, mouth='frown', jaw=0),
    'speak':   dict(brow=0.2, open=0.6, mouth='open', jaw=26),
    'wrath':   dict(brow=0.55, open=1.0, mouth='open', jaw=40, shock=True),
}


def azrail_head(expr='neutral'):
    """Azrail: uzun dar yüz, kanca burun, feri sönmüş çukur gözler, ağarmış dikenli sakal, kukuleta."""
    e = AZ[expr]; jaw = e['jaw']
    J = lambda x, y: (x, y + jaw * max(0.0, min(1.3, (y - 50) / 90)))
    reseed('az-hood')
    hood = [(-128, -110), (-70, -214), (16, -236), (104, -196), (146, -96), (150, 60), (118, 210), (40, 150), (-40, 150), (-112, 210), (-140, 60)]
    s = blob(hood, COBALT, 3.8) + fill([(-128, -110), (-70, -214), (0, -234), (-30, -100), (-60, 60), (-112, 210), (-140, 60)], INK, 1.0, op=0.38)
    s += ''.join(ink([(x, -214 + abs(x) * 0.25), (x + 6, -150)], 1.9, wob=0.3) for x in (-62, 28, 84))
    reseed('az-skull')
    skull = [J(*p) for p in [(-58, -146), (0, -166), (60, -146), (86, -80), (84, 0), (72, 70), (44, 128), (0, 150), (-44, 128), (-74, 70), (-88, 0), (-88, -80)]]
    s += clipdef('ah', skull) + fill(skull, SKIN, 1.3)
    s += fill([(-120, -180), (-30, -170), (-52, -60), (-58, 40), (-20, 160), (-120, 180)], SKIN_D, 1.0, clip='ah')
    s += fill(ellipse(-34, -22, 26, 20, 8, 0.1), SKIN_D, 0.8, clip='ah') + fill(ellipse(36, -22, 26, 20, 8, 0.1), SKIN_D, 0.8, clip='ah')   # göz çukurları
    s += fill(ellipse(46, 34, 22, 14, 8, 0.1), SKIN_L, 0.8, clip='ah') + fill(ellipse(10, -104, 34, 12, 8, 0.1), SKIN_L, 0.8, clip='ah')   # elmacık, alın
    s += ink(skull, 3.4, closed=True, press=0.5)
    s += ''.join(ink([(-40, y), (4, y - 5), (46, y)], 1.9, wob=0.4) for y in (-118, -104, -90))
    reseed('az-eyes')
    sh = e.get('shock', False)
    for cx in (-34, 36):
        for k in range(3): s += ink([(cx - 15 + k, -6 + k * 7), (cx, 1 + k * 7), (cx + 16 - k, -7 + k * 7)], 1.9, wob=0.2)   # üst üste torbalar
        s += eye(cx, -24, 15, 10, PALE, SKIN_D, e['open'], 2.6, (0, 2), lid=0.5, shock=sh)
    reseed('az-brows')
    for sx, cx in ((-1, -34), (1, 36)):
        b = e['brow']; inner = (cx - sx * 20, -44 + b * 22); outer = (cx + sx * 28, -52 - b * 6)
        pts = [inner, ((inner[0] + outer[0]) / 2, min(inner[1], outer[1]) - 10), outer, (outer[0] + sx * 10, outer[1] + 12), ((inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 + 6)]
        s += blob(pts, PALE, 2.6) + ''.join(ink([(inner[0] + sx * k, inner[1] - 4), (inner[0] + sx * (k + 6), inner[1] - 15)], 1.8, wob=0, smooth=False) for k in (8, 20, 32))
    reseed('az-nose')
    nose = [(-10, -44), (8, -46), (26, 6), (34, 44), (16, 70), (-6, 66), (-2, 48), (-18, 40), (-12, 0)]
    s += fill(nose, SKIN_L, 0.9) + ink([(8, -46), (28, 6), (36, 44), (16, 72), (-6, 66), (0, 50)], 3.4, wob=0.3, taper=(0.3, 0.3)) + ink([(-12, 4), (-20, 40), (-6, 48)], 2.4, wob=0.2)
    s += fill(ellipse(-10, 44, 4.5, 3, 6), INK, 0.3)
    s += ink([(-30, 36), J(-52, 70), J(-56, 104)], 2.6, wob=0.4, taper=(0.2, 0.5)) + ink([(40, 40), J(56, 72), J(58, 104)], 2.6, wob=0.4, taper=(0.2, 0.5))
    reseed('az-mouth')
    my = 96 + jaw * 0.5
    if e['mouth'] == 'open': s += mouth(4, my, 30, 4, 14 + jaw * 0.7, 0, SKIN_D, FINE, RED, PALE, top=5, bot=4)
    elif e['mouth'] == 'frown': s += ink([(-30, my + 8), (4, my - 2), (38, my + 9)], 3.0, wob=0.3)
    else: s += ink([(-28, my + 2), (4, my), (36, my + 3)], 2.8, wob=0.3)
    reseed('az-beard')
    beard = [J(*p) for p in [(-78, 56), (-58, 92), (-34, 110), (0, 118), (36, 110), (60, 92), (80, 56), (72, 130), (84, 196), (58, 186), (52, 270), (30, 236), (14, 330), (-4, 262), (-24, 312), (-36, 224), (-62, 252), (-58, 176), (-82, 196), (-72, 130)]]
    s += fill(beard, PALE, 1.0, smooth=False) + fill([J(*p) for p in [(-78, 56), (-58, 92), (-30, 112), (-30, 300), (-62, 252), (-58, 176), (-82, 196), (-72, 130)]], COBALT, 0.8, smooth=False, op=0.3)
    s += ink(beard, 2.8, closed=True, smooth=False, wob=0.2) + fur(beard, 7, 13, 12, 0.1, 2.0)
    for sx in (-1, 1):   # sarkık ak bıyık
        m = [(4, 76), (4 + sx * 30, 70), (4 + sx * 58, 90), (4 + sx * 70, 140), (4 + sx * 54, 120), (4 + sx * 46, 102), (4 + sx * 22, 92), (4, 90)]
        s += fill([(x, y) for x, y in m], PALE, 0.8, smooth=False) + ink(m, 2.4, closed=True, smooth=False, wob=0.2)
    return s


def wing(side=1, spread=1.0):
    """Al kanat: kök (0,0)'da; yukarı ve yana açılır."""
    reseed(f'wing{side}')
    k = spread
    pts = [(0, 0), (side * 70 * k, -150), (side * 190 * k, -250), (side * 300 * k, -230), (side * 268 * k, -150), (side * 318 * k, -70), (side * 250 * k, -30), (side * 286 * k, 60), (side * 206 * k, 60), (side * 220 * k, 170), (side * 140 * k, 130), (side * 130 * k, 250), (side * 60 * k, 190), (0, 150)]
    s = fill(pts, RED, 1.2, smooth=False)
    if side < 0: s += fill(pts, COBALT, 1.2, smooth=False, op=0.4)
    s += ink(pts, 3.4, closed=True, smooth=False, wob=0.3)
    for a, b in (((side * 60 * k, -90), (side * 250 * k, -200)), ((side * 50 * k, -20), (side * 240 * k, -60)), ((side * 40 * k, 50), (side * 190 * k, 30)), ((side * 30 * k, 110), (side * 120 * k, 110))):
        s += ink([a, b], 2.2, wob=0.4, taper=(0.1, 0.6), smooth=False) + dashrow([a, b], 22, 16, 0.9 * side, 2.0, smooth=False)
    return s


def azrail_body():
    """Uzun, sıska gövde: boyun kökü (0,0). Kobalt cübbe, kemikli eller."""
    reseed('az-body')
    robe = [(-46, -10), (46, -10), (96, 30), (104, 200), (128, 520), (140, 640), (-140, 640), (-128, 520), (-104, 200), (-96, 30)]
    s = clipdef('ab', robe) + fill(robe, COBALT, 1.4) + fill([(-160, -20), (-10, -20), (-30, 300), (-10, 650), (-160, 650)], INK, 1.0, clip='ab', op=0.4)
    s += ''.join(ink([(x, 120 + abs(x) * 0.6), (x * 1.25, 400), (x * 1.5, 630)], 2.2, wob=0.6, taper=(0.3, 0.2)) for x in (-60, -14, 34, 74))
    s += ink(robe, 3.8, closed=True, press=0.45)
    s += blob([(-100, 236), (0, 250), (102, 236), (104, 262), (0, 276), (-102, 262)], GOLD, 3.0) + ''.join(ink([(x, 244), (x + 4, 268)], 1.8, wob=0, smooth=False) for x in range(-88, 96, 18))
    hem = [(-140, 600), (140, 600), (142, 640), (-142, 640)]
    s += fill(hem, RED, 1.0, clip='ab') + ''.join(scroll(x, 620, 11, GOLD, 2.0) for x in range(-120, 130, 34))
    return s


def azrail_arm(side=1, lit=True):
    reseed(f'az-arm{side}')
    arm = [(-26, -8), (22, -14), (40, 80), (58, 250), (-34, 262), (-40, 90)]
    s = fill(arm, COBALT, 1.2)
    if not lit: s += fill(arm, INK, 1.2, op=0.4)
    s += ink(arm, 3.4, closed=True, press=0.4) + ink([(-10, 60), (4, 150), (20, 240)], 2.0, wob=0.5)
    s += group(hand(lit, 'open', False, side), 12, 262, 0, 0.78, 1.05)
    return s


def azrail(expr='neutral', armL=10, armR=-10, spread=1.0, hr=0):
    s = group(wing(-1, spread), -40, 60) + group(wing(1, spread), 40, 60)
    s += group(azrail_arm(-1, False), -84, 40, armL) + azrail_body() + group(azrail_arm(1, True), 84, 40, armR)
    s += group(azrail_head(expr), 0, -118, hr, 0.9, None, 0, 118)
    return s


def dove(flap=0):
    """Güvercin: Azrail'in büründüğü kuş. flap: 0 kanat yukarı, 1 kanat aşağı."""
    reseed('dove')
    body = [(-70, 0), (-30, -26), (30, -24), (64, -40), (86, -28), (70, -8), (40, 18), (-20, 24)]
    s = blob([(-70, 0), (-128, -22), (-120, 12), (-134, 30), (-64, 14)], PALE, 2.8)
    wy = -110 if flap == 0 else 70
    s += blob([(-26, -10), (-60, wy * 0.6), (-30, wy), (10, wy * 0.9), (36, wy * 0.45), (30, -10)], PALE, 3.0)
    s += ''.join(ink([(x, -6), (x * 1.4 - 6, wy * 0.75)], 1.9, wob=0.3) for x in (-14, 4, 20))
    s += blob(body, PALE, 3.0) + fill([(-70, 0), (-20, 24), (40, 18), (60, 0), (0, 6)], COBALT, 0.8, op=0.3)
    s += blob([(86, -30), (106, -24), (86, -18)], GOLD, 2.2) + f'<circle cx="70" cy="-28" r="3.2" fill="{INK}"/>'
    return s


def extra(kind=0, robe=None, fear=False):
    """Yiğitler: aynı çizgi, daha az iz. Oturur hâlde, belden yukarı tek çizim. Boyun kökü (0,0)."""
    reseed(f'extra{kind}')
    robe = robe or [COBALT, GOLD, PALE][kind % 3]
    w = [150, 96, 124][kind % 3]
    torso = [(-w * 0.5, -6), (w * 0.5, -6), (w, 40), (w * 1.12, 230), (-w * 1.12, 230), (-w, 40)]
    s = blob(torso, robe, 3.4) + fill([(-w * 1.12, 230), (-w, 40), (-w * 0.5, -6), (-w * 0.2, -6), (-w * 0.4, 230)], INK, 1.0, op=0.3)
    s += ink([(0, 0), (4, 226)], 2.0, wob=0.4) + ''.join(ink([(-w * 0.5, y), (w * 0.5, y + 4)], 1.8, wob=0.5, taper=(0.3, 0.3)) for y in (110, 170))
    hy = -86
    if kind % 3 == 0:    # iri, yuvarlak, kel; minik takke
        head = ellipse(0, hy, 104, 96, 12, 0.05)
        s += blob(head, SKIN, 3.4) + fill(ellipse(-44, hy + 20, 52, 70, 8), SKIN_D, 1.0, op=0.9) + ink(head, 3.2, closed=True)
        s += blob([(-40, hy - 86), (0, hy - 120), (42, hy - 86), (0, hy - 78)], RED, 3.0)
        s += ink([(-64, hy + 46), (0, hy + 66), (66, hy + 44)], 2.2, wob=0.3) + ink([(-70, hy + 66), (0, hy + 84), (70, hy + 64)], 2.0, wob=0.3)
        mo = [(-50, hy + 16), (0, hy + 4), (50, hy + 16), (40, hy + 30), (0, hy + 20), (-40, hy + 30)]
    elif kind % 3 == 1:  # sıska, uzun boyun, sivri kalpak
        s += blob([(-22, -70), (22, -70), (26, 6), (-26, 6)], SKIN_D, 3.0)
        head = [(-52, hy - 110), (0, hy - 126), (54, hy - 110), (62, hy - 40), (40, hy + 20), (0, hy + 34), (-38, hy + 20), (-60, hy - 40)]
        s += blob(head, SKIN, 3.4) + blob([(-60, hy - 100), (0, hy - 250), (62, hy - 100), (0, hy - 88)], COBALT, 3.2) + blob([(-70, hy - 96), (0, hy - 112), (72, hy - 96), (70, hy - 76), (0, hy - 70), (-68, hy - 76)], PALE, 3.0)
        mo = [(-38, hy - 14), (0, hy - 22), (40, hy - 14), (58, hy + 16), (30, hy - 2), (0, hy - 8), (-28, hy - 2), (-56, hy + 16)]
        hy -= 46
    else:                # kısa, köşeli, koca kaşlı
        head = [(-84, hy - 60), (0, hy - 76), (86, hy - 60), (96, hy + 30), (60, hy + 76), (-58, hy + 76), (-94, hy + 30)]
        s += blob(head, SKIN, 3.4) + blob([(-90, hy - 54), (-60, hy - 110), (60, hy - 110), (92, hy - 54), (0, hy - 40)], GOLD, 3.2) + fur([(-80, hy - 60), (80, hy - 60), (60, hy - 100), (-60, hy - 100)], 2, 14, 8, 0.4, 1.9)
        s += ink([(-70, hy - 26), (-10, hy - 12)], 13, taper=(0.05, 0.4), wob=0.3, smooth=False) + ink([(72, hy - 26), (12, hy - 12)], 13, taper=(0.05, 0.4), wob=0.3, smooth=False)
        mo = [(-44, hy + 34), (0, hy + 26), (46, hy + 34), (36, hy + 48), (0, hy + 40), (-34, hy + 48)]
    # kadeh tutan el ve kuşak: figürü "oturan adam" yapan birkaç iz
    s += blob([(-w * 1.05, 156), (0, 164), (w * 1.05, 156), (w * 1.07, 176), (0, 186), (-w * 1.07, 176)], RED, 2.8)
    s += blob([(w * 0.34, 96), (w * 0.34 + 44, 96), (w * 0.34 + 36, 140), (w * 0.34 + 8, 140)], GOLD, 2.8) + sparkle(w * 0.34 + 30, 108, 6)
    s += blob(ellipse(w * 0.34 + 22, 138, 30, 22, 8, 0.08), SKIN, 3.0) + ''.join(ink([(w * 0.34 + 4 + k * 12, 130), (w * 0.34 + 6 + k * 12, 146)], 1.8, wob=0, smooth=False) for k in range(4))
    for cx in (-26, 28):
        if fear: s += fill(ellipse(cx, hy - 10, 15, 15, 9), PALE, 0.4) + ink(ellipse(cx, hy - 10, 15, 15, 9), 2.6, closed=True, wob=0.3) + f'<circle cx="{cx}" cy="{hy - 10}" r="2.4" fill="{INK}"/>'
        else: s += fill(ellipse(cx, hy - 8, 10, 7, 8), PALE, 0.4) + f'<circle cx="{cx + 1}" cy="{hy - 7}" r="3" fill="{INK}"/>' + ink([(cx - 13, hy - 13), (cx, hy - 16), (cx + 13, hy - 13)], 3.6, wob=0.2)
    s += ink([(2, hy - 8), (10, hy + 14), (0, hy + 20)], 2.8, wob=0.3) + fill(mo, INK, 0.8, smooth=False)
    if fear: s += fill(ellipse(2, mo[1][1] + 34, 13, 17, 8), FINE, 0.4) + ink(ellipse(2, mo[1][1] + 34, 13, 17, 8), 2.4, closed=True, wob=0.3)
    return s


def goblet():
    """Altın kadeh; ağzı yukarı, (0,0) gövdenin ortası."""
    reseed('goblet')
    s = blob([(-30, -46), (30, -46), (18, 18), (34, 40), (-34, 40), (-18, 18)], GOLD, 3.2) + fill(ellipse(0, -45, 26, 8, 8), RED, 0.4)
    s += fill([(-30, -46), (-8, -46), (-10, 40), (-34, 40), (-18, 18)], COBALT, 0.6, op=0.3) + ink([(-22, -8), (22, -8)], 2.0, wob=0.3) + sparkle(14, -24, 9)
    return s


def feather(col=RED):
    reseed('feather' + col)
    f = [(0, -60), (16, -30), (14, 20), (0, 60), (-14, 20), (-16, -30)]
    return blob(f, col, 2.6) + ink([(0, -56), (2, 58)], 1.8, wob=0.3) + dashrow([(0, -40), (0, 40)], 14, 10, 0.9, 1.8, smooth=False)
