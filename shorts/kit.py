"""
Cel kısa film takımı: mürekkep çizgisi, elle kesilmiş dolgu, doku, yüz parçaları, eski çizgi film cilası.
Her şey koddan SVG olarak çizilir; librsvg ile resme çevrilir. SVG "stroke" hiç kullanılmaz:
bütün çizgiler ink() ile, kalınlığı değişen dolu çokgen olarak çizilir.
"""
import math, random, zlib
import numpy as np
from PIL import Image, ImageFilter

INK = '#170b08'    # sıcak sepya-siyah
FINE = '#4d140a'   # en ince çizgiler: koyu kırmızı, hafif saydam

_rnd = random.Random(1)


def reseed(name):
    """Her gövde parçasının başında çağrılır: parça her karede aynı çizilir, yalnızca değişen kıpırdar."""
    _rnd.seed(zlib.crc32(str(name).encode()))


def R(a, b):
    return _rnd.uniform(a, b)


def catmull(pts, closed=False, seg=10):
    n = len(pts)
    get = (lambda i: pts[i % n]) if closed else (lambda i: pts[max(0, min(n - 1, i))])
    out = []
    for i in (range(n) if closed else range(n - 1)):
        p0, p1, p2, p3 = get(i - 1), get(i), get(i + 1), get(i + 2)
        for s in range(seg):
            t = s / seg; t2 = t * t; t3 = t2 * t
            out.append(tuple(0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3) for k in (0, 1)))
    if not closed: out.append(tuple(pts[-1]))
    return out


def _d(pts):
    return 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z'


def ink(pts, w=4.0, col=None, taper=(0.2, 0.3), press=0.3, wob=0.7, closed=False, op=None, smooth=True):
    """Nokta dizisini, basınçla şişen, uçları sivrilen, hafifçe titreyen dolu bir çokgene çevirir."""
    c = catmull(pts, closed) if smooth and len(pts) > 2 else list(pts)
    n = len(c)
    if n < 2: return ''
    L = [0.0]
    for i in range(1, n): L.append(L[-1] + math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]))
    total = L[-1] or 1.0
    ph = [R(0, 6.283) for _ in range(4)]
    left, right = [], []
    for i, (x, y) in enumerate(c):
        t = L[i] / total
        a = c[(i - 1) % n] if closed else c[max(i - 1, 0)]
        b = c[(i + 1) % n] if closed else c[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; d = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / d, dx / d
        env = 1.0
        if not closed:
            if taper[0]: env *= min(1.0, (t / taper[0]) ** 0.75)
            if taper[1]: env *= min(1.0, ((1 - t) / taper[1]) ** 0.75)
        pr = 1 + press * (0.6 * math.sin(6.283 * 1.3 * t + ph[0]) + 0.4 * math.sin(6.283 * 3.3 * t + ph[1]))
        hw = max(0.12, w * env * pr / 2)
        off = wob * (0.7 * math.sin(6.283 * 2.1 * t + ph[2]) + 0.3 * math.sin(6.283 * 5.7 * t + ph[3]))
        cx, cy = x + nx * off, y + ny * off
        left.append((cx + nx * hw, cy + ny * hw)); right.append((cx - nx * hw, cy - ny * hw))
    fine = w <= 2.4
    col = col or (FINE if fine else INK)
    op = op if op is not None else (0.82 if fine else 1)
    d = (_d(left) + _d(right)) if closed else _d(left + right[::-1])
    return f'<path d="{d}" fill="{col}" fill-rule="evenodd"' + (f' opacity="{op}"' if op < 1 else '') + '/>'


def fill(pts, color, jit=1.3, smooth=True, clip=None, op=1.0, seg=8):
    """Kapalı, düz renkli biçim; kenarı elle kesilmiş gibi hafifçe oynar."""
    c = catmull(pts, True, seg) if smooth else list(pts)
    c = [(x + R(-jit, jit), y + R(-jit, jit)) for x, y in c]
    return f'<path d="{_d(c)}" fill="{color}"' + (f' clip-path="url(#{clip})"' if clip else '') + (f' opacity="{op}"' if op < 1 else '') + '/>'


def clipdef(cid, pts, smooth=True):
    c = catmull(pts, True, 8) if smooth else pts
    return f'<clipPath id="{cid}"><path d="{_d(c)}"/></clipPath>'


def blob(pts, color, w=4.0, jit=1.3, press=0.3):
    """Dolgu ve çevresinde mürekkep çizgisi."""
    return fill(pts, color, jit) + ink(pts, w, closed=True, press=press)


def ellipse(cx, cy, rx, ry, n=10, irr=0.0, rot=0.0):
    out = []
    for i in range(n):
        a = 6.283 * i / n
        k = 1 + R(-irr, irr)
        x, y = math.cos(a) * rx * k, math.sin(a) * ry * k
        out.append((cx + x * math.cos(rot) - y * math.sin(rot), cy + x * math.sin(rot) + y * math.cos(rot)))
    return out


def inside(p, poly):
    x, y = p; c = False; n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-9) + x1: c = not c
    return c


def _scatter(poly, n):
    xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
    out = []; tries = 0
    while len(out) < n and tries < n * 30:
        tries += 1
        p = (R(min(xs), max(xs)), R(min(ys), max(ys)))
        if inside(p, poly): out.append(p)
    return out


def ticks(poly, n, length=(4, 9), ang=None, spread=0.5, w=2.0, col=None):
    """Kısa çentikler: ten, kumaş, ahşap damarı. Uzun tarama yok."""
    s = ''
    for x, y in _scatter(poly, n):
        a = (ang if ang is not None else R(0, 3.14)) + R(-spread, spread); l = R(*length) / 2
        s += ink([(x - math.cos(a) * l, y - math.sin(a) * l), (x + math.cos(a) * l, y + math.sin(a) * l)], w, col, taper=(0.3, 0.5), wob=0, smooth=False)
    return s


def dots(poly, n, r=(0.8, 1.6), col=FINE, op=0.8):
    return ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{R(*r):.1f}" fill="{col}" opacity="{op}"/>' for x, y in _scatter(poly, n))


def dashrow(path, spacing=9, length=8, lean=0.5, w=2.2, col=None, smooth=True):
    """Bir yol boyunca kısa çizgi sırası: kürk, yün, örgü."""
    c = catmull(path, False, 12) if smooth and len(path) > 2 else path
    s = ''; acc = 0.0
    for i in range(1, len(c)):
        dx, dy = c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]; d = math.hypot(dx, dy)
        acc += d
        if acc >= spacing:
            acc = 0
            a = math.atan2(dy, dx) + 1.57 + lean + R(-0.25, 0.25); l = length * R(0.7, 1.25)
            x, y = c[i]
            s += ink([(x, y), (x + math.cos(a) * l, y + math.sin(a) * l)], w, col, taper=(0.1, 0.7), wob=0, smooth=False)
    return s


def fur(poly, rows, spacing=10, length=9, lean=0.5, w=2.2):
    """Bir alanı üst üste kısa çizgi sıralarıyla doldurur."""
    ys = [p[1] for p in poly]; xs = [p[0] for p in poly]
    s = ''
    for r in range(rows):
        y = min(ys) + (max(ys) - min(ys)) * (r + 0.5) / rows
        row = [(x, y + R(-2, 2)) for x in np.arange(min(xs), max(xs), spacing / 2) if inside((x, y), poly)]
        if len(row) > 1: s += dashrow(row, spacing, length, lean, w, smooth=False)
    return s


def medallion(cx, cy, r, col, w=2.2):
    """Kumaş deseni: içi çiçekli madalyon."""
    s = ink(ellipse(cx, cy, r, r, 8), w, col, closed=True, wob=0.3)
    for i in range(4):
        a = i * 1.571 + 0.78
        s += fill(ellipse(cx + math.cos(a) * r * 0.45, cy + math.sin(a) * r * 0.45, r * 0.22, r * 0.22, 6), col, 0.4)
    return s + fill(ellipse(cx, cy, r * 0.18, r * 0.18, 6), col, 0.3)


def scroll(x, y, r, col, w=2.2, flip=1):
    """Kıvrım motifi (brokar)."""
    pts = [(x + flip * math.cos(a) * r * (1 - a / 9), y + math.sin(a) * r * (1 - a / 9)) for a in np.arange(0, 7.5, 0.6)]
    return ink(pts, w, col, taper=(0.1, 0.6), wob=0.2)


def cracks(x, y, length, ang, depth=2, w=2.0):
    """Dallanan çatlak (taş)."""
    pts = [(x, y)]; a = ang
    for _ in range(4):
        a += R(-0.6, 0.6); x += math.cos(a) * length / 4; y += math.sin(a) * length / 4; pts.append((x, y))
    s = ink(pts, w, taper=(0.05, 0.7), wob=0.3, smooth=False)
    if depth > 0:
        bx, by = pts[R(1, 3).__int__()]
        s += cracks(bx, by, length * 0.55, a + R(0.6, 1.2) * _rnd.choice([-1, 1]), depth - 1, w * 0.8)
    return s


def masonry(x0, y0, x1, y1, course=38, w=2.0):
    """Kırık sıra çizgileri ve derzler (taş duvar)."""
    s = ''
    y = y0 + course
    while y < y1:
        x = x0
        while x < x1:
            l = R(30, 90)
            if R(0, 1) > 0.25: s += ink([(x, y + R(-1.5, 1.5)), (min(x + l, x1), y + R(-1.5, 1.5))], w, taper=(0.2, 0.3), wob=0.3, smooth=False)
            if R(0, 1) > 0.5: s += ink([(x + l * 0.5, y), (x + l * 0.5 + R(-2, 2), y - course * R(0.5, 1))], w * 0.9, taper=(0.1, 0.6), wob=0, smooth=False)
            x += l + R(12, 30)
        y += course
    return s


def sparkle(x, y, r, col='#fff6d8'):
    """Lamba, para ya da kılıç üstünde tek parıltı."""
    p = []
    for i in range(8):
        a = i * 0.7854; k = r if i % 2 == 0 else r * 0.22
        p.append((x + math.cos(a) * k, y + math.sin(a) * k))
    return f'<path d="{_d(p)}" fill="{col}"/>'


def eye(cx, cy, rx, ry, white, lidcol, open=1.0, pupil=4.5, look=(0, 0), lid=0.42, shock=False, lash=5.0):
    """Küçük göz: eflatun ak, sarkık kapak, kalın kirpik çizgisi. shock: iri disk, toplu iğne başı gözbebeği."""
    if shock:
        r = rx * 1.5
        return (fill(ellipse(cx, cy, r, r, 10), white, 0.6) + ink(ellipse(cx, cy, r, r, 10), 3.2, closed=True, wob=0.4)
                + f'<circle cx="{cx + look[0]:.1f}" cy="{cy + look[1]:.1f}" r="2.8" fill="{INK}"/>')
    if open <= 0.08:
        s = ink([(cx - rx - 2, cy - 2), (cx, cy + ry * 0.5), (cx + rx + 2, cy - 2)], lash, wob=0.3)
        for k in (-0.6, 0, 0.6):
            s += ink([(cx + k * rx, cy + ry * 0.35), (cx + k * rx * 1.25, cy + ry * 0.35 + 5)], 1.8, taper=(0.1, 0.7), wob=0, smooth=False)
        return s
    ro = ry * open
    s = fill(ellipse(cx, cy, rx, ro, 10), white, 0.5)
    s += f'<circle cx="{cx + look[0]:.1f}" cy="{cy + look[1]:.1f}" r="{pupil:.1f}" fill="{INK}"/>'
    yl = cy - ro + 2 * ro * lid
    s += fill([(cx - rx - 3, cy - ro - 5), (cx, cy - ro - 8), (cx + rx + 3, cy - ro - 5), (cx + rx + 2, yl - 1), (cx, yl + 2), (cx - rx - 2, yl - 1)], lidcol, 0.4)
    s += ink([(cx - rx - 4, yl - 2), (cx, yl + 2.5), (cx + rx + 4, yl - 2)], lash, wob=0.3, taper=(0.15, 0.15))
    s += ink([(cx - rx, cy + ro * 0.5), (cx, cy + ro + 1), (cx + rx, cy + ro * 0.5)], 1.8, wob=0.2)
    return s


def mouth(cx, cy, hw, up, down, lift, rim, inner, tongue, tooth, gum=None, top=6, bot=6, tw=1.9):
    """Açık ağız: dudak kenarı, koyu iç, dil, tek tek çizilmiş iki sıra diş; sırıtışta diş eti.
    up/down: üst ve alt kenarın orta noktadaki açıklığı; lift: köşelerin yukarı kalkması."""
    yt = lambda u: cy - up * (1 - u * u) - lift * u * u
    yb = lambda u: cy + down * (1 - u * u) - lift * u * u
    us = [i / 8 for i in range(-8, 9)]
    outer = [(cx + u * (hw + 7), yt(u) - 7 * (1 - u * u * 0.6)) for u in us] + [(cx + u * (hw + 7), yb(u) + 8 * (1 - u * u * 0.6)) for u in reversed(us)]
    hole = [(cx + u * hw, yt(u)) for u in us] + [(cx + u * hw, yb(u)) for u in reversed(us)]
    s = fill(outer, rim, 0.8, smooth=False) + ink(outer, 3.2, closed=True, wob=0.4, smooth=False)
    s += fill(hole, inner, 0.5, smooth=False)
    if down > 16:
        s += fill(ellipse(cx + hw * 0.08, cy + down * 0.72, hw * 0.5, down * 0.34, 8), tongue, 0.6)
        s += ink([(cx + hw * 0.05, cy + down * 0.5), (cx + hw * 0.1, cy + down * 0.85)], 1.8, wob=0)
    def row(n, edge, sign, h):
        r = ''
        for i in range(n):
            u0 = -0.82 + 1.64 * i / n; u1 = -0.82 + 1.64 * (i + 1) / n; um = (u0 + u1) / 2
            th = h * (1 - um * um) ** 0.5 + 2
            q = [(cx + u0 * hw + 0.8, edge(u0)), (cx + u1 * hw - 0.8, edge(u1)), (cx + u1 * hw - 1.4, edge(u1) + sign * th), (cx + um * hw, edge(um) + sign * (th + 1.5)), (cx + u0 * hw + 1.4, edge(u0) + sign * th)]
            r += fill(q, tooth, 0.5, smooth=False) + ink(q, tw, closed=True, wob=0, press=0.15, smooth=False)
        return r
    gap = up + down
    if gum: s += fill([(cx + u * hw * 0.86, yt(u) - 1) for u in us] + [(cx + u * hw * 0.86, yt(u) + 5) for u in reversed(us)], gum, 0.4, smooth=False)
    off = 4 if gum else 0
    s += row(top, lambda u: yt(u) + off, 1, min(13, gap * 0.36))
    s += row(bot, yb, -1, min(10, gap * 0.26))
    return s


def group(body, tx=0, ty=0, rot=0, sx=1, sy=None, px=0, py=0, op=1):
    sy = sx if sy is None else sy
    t = f'translate({tx:.2f},{ty:.2f}) rotate({rot:.2f},{px:.2f},{py:.2f}) translate({px * (1 - sx):.2f},{py * (1 - sy):.2f}) scale({sx:.4f},{sy:.4f})'
    return f'<g transform="{t}"' + (f' opacity="{op}"' if op < 1 else '') + f'>{body}</g>'


def svg(body, w, h, bg=None, defs=''):
    r = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs>{defs}</defs>{r}{body}</svg>'


def raster(svg_text, w, h):
    """SVG'yi librsvg ile (rsvg-convert'in kullandığı kitaplık) RGBA resme çevirir. SVG'nin kendi boyutu w×h olmalı."""
    import gi
    gi.require_version('Rsvg', '2.0')
    from gi.repository import Rsvg
    pb = Rsvg.Handle.new_from_data(svg_text.encode()).get_pixbuf()
    a = np.frombuffer(pb.get_pixels(), np.uint8)
    stride, ch = pb.get_rowstride(), pb.get_n_channels()
    rows = np.lib.stride_tricks.as_strided(a, (pb.get_height(), pb.get_width() * ch), (stride, 1))
    return Image.fromarray(np.ascontiguousarray(rows).reshape(pb.get_height(), pb.get_width(), ch), 'RGBA' if ch == 4 else 'RGB').convert('RGBA')


_noise = {}


def finish(img, frame=0, grain=4.0, seed=7):
    """Eski çizgi film cilası: yumuşak mürekkep, soluk kenar, benekli dolgu, kayık renk baskısı, sıcak ton, kumlanma."""
    im = img.convert('RGB')
    w, h = im.size
    im = im.filter(ImageFilter.GaussianBlur(0.8))                       # mürekkebi ~1 px yumuşat
    im = im.filter(ImageFilter.UnsharpMask(radius=5, percent=60, threshold=0))   # çizginin çevresinde soluk kenar
    a = np.asarray(im).astype(np.float32)
    key = (w, h, seed)
    if key not in _noise:
        rs = np.random.RandomState(seed)
        low = [np.asarray(Image.fromarray((rs.rand(h // 90 + 2, w // 90 + 2) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255 - 0.5 for _ in range(2)]
        yy, xx = np.mgrid[0:h, 0:w]
        vig = 1 - 0.20 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) ** 1.2
        _noise[key] = (low, vig.astype(np.float32))
    low, vig = _noise[key]
    k = 0.5 + 0.5 * math.sin(frame * 0.05)                                 # benek yavaşça değişir
    a *= (1 + 0.07 * (low[0] * k + low[1] * (1 - k)))[:, :, None]
    ycc = np.asarray(Image.fromarray(a.clip(0, 255).astype(np.uint8)).convert('YCbCr')).astype(np.float32)
    y = ycc[:, :, 0]
    cb = np.roll(np.asarray(Image.fromarray(ycc[:, :, 1].astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))), 2, 1)    # renk kanalları daha bulanık
    cr = np.roll(np.asarray(Image.fromarray(ycc[:, :, 2].astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))), -2, 1)   # ve 2 px kayık
    y = y + np.random.RandomState(seed * 1000 + frame).randn(h, w).astype(np.float32) * grain                               # kum yalnızca parlaklıkta
    a = np.asarray(Image.fromarray(np.stack([y.clip(0, 255), cb, cr], 2).astype(np.uint8), 'YCbCr').convert('RGB')).astype(np.float32)
    glow = np.asarray(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(max(6, w // 110)))).astype(np.float32)
    a = 255 - (255 - a) * (255 - glow * 0.16) / 255                         # hafif parlama
    a *= np.array([1.03, 1.0, 0.93], np.float32)                           # sıcak ton
    lift = np.array([40, 24, 17], np.float32)                              # siyahlar koyu kahveye kalkar
    a = lift + a * (255 - lift) / 255
    a *= vig[:, :, None]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGB')
