"""Kapanış kartı: "made by Claude & tayfunsen.com". Koyu gece zemini, ince altın çizgiler, serif yazı; yavaşça belirir ve söner.

  python -m shorts.credits out.mp4 [draft]
"""
import math, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from .kit import raster, svg, medallion, reseed

W, H, FPS, SECONDS = 1080, 1920, 30, 5.0
NIGHT, GOLD, PALE = (25, 36, 107), (227, 167, 44), (231, 220, 242)
LINES = ('made by', 'Claude', '&', 'tayfunsen.com')
_N = '/usr/share/fonts/truetype/noto/NotoSerifDisplay-'
_FALLBACK = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'


def font(style, size):
    p = _N + style + '.ttf'
    return ImageFont.truetype(p if os.path.exists(p) else _FALLBACK, size)


def text_layer(text, f, color, tracking=0.0):
    """Harf aralığı ayarlanabilen, saydam zeminli tek satır."""
    d = ImageDraw.Draw(Image.new('L', (1, 1)))
    widths = [d.textlength(ch, font=f) for ch in text]
    gap = f.size * tracking
    w = int(sum(widths) + gap * (len(text) - 1)) + 8; h = int(f.size * 1.5)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); x = 4
    for ch, cw in zip(text, widths):
        d.text((x, h * 0.12), ch, font=f, fill=color + (255,)); x += cw + gap
    return im


def build(scale=1.0):
    """Durağan parçaları bir kez hazırlar: (resim, merkez y, belirme sırası)."""
    k = scale
    parts = [
        (text_layer(LINES[0].upper(), font('Regular', int(30 * k)), PALE, 0.42), 800, 1),
        (text_layer(LINES[1], font('Medium', int(104 * k)), PALE, 0.02), 910, 2),
        (text_layer(LINES[2], font('Italic', int(62 * k)), GOLD), 1016, 3),
        (text_layer(LINES[3], font('Regular', int(70 * k)), PALE, 0.03), 1112, 4),
    ]
    reseed('credits')
    orn = raster(svg(medallion(60, 60, 34, '#e3a72c', 2.6), 120, 120), 120, 120).resize((int(96 * k), int(96 * k)), Image.LANCZOS)
    yy, xx = np.mgrid[0:int(H * k), 0:int(W * k)]
    vig = 1 - 0.42 * (((xx - W * k / 2) / (W * k / 2)) ** 2 + ((yy - H * k / 2) / (H * k / 2)) ** 2) ** 1.1
    dither = np.random.RandomState(3).uniform(-1.2, 1.2, vig.shape + (1,))        # geçişte halka halka bantlaşmayı önler
    bg = Image.fromarray((np.array(NIGHT, np.float32)[None, None] * vig[:, :, None] + dither).clip(0, 255).astype(np.uint8), 'RGB')
    return parts, orn, bg, k


def frame(t, built):
    parts, orn, bg, k = built
    ease = lambda u: 0 if u <= 0 else 1 if u >= 1 else u * u * (3 - 2 * u)
    im = bg.copy().convert('RGBA'); cx = im.width // 2
    def paste(layer, y, a, dy=0):
        if a <= 0: return
        l = layer.copy(); l.putalpha(l.getchannel('A').point(lambda v: int(v * a)))
        im.alpha_composite(l, (cx - l.width // 2, int(y * k - l.height / 2 + dy)))
    paste(orn, 660, ease((t - 0.3) / 0.7))
    d = ImageDraw.Draw(im)
    g = ease((t - 0.5) / 1.0)                                       # altın çizgiler ortadan iki yana açılır
    for y in (730, 1210):
        hw = 170 * k * g
        if hw > 1: d.line([(cx - hw, y * k), (cx + hw, y * k)], fill=GOLD + (255,), width=max(1, int(2 * k)))
    for layer, y, order in parts:
        a = ease((t - 0.7 - order * 0.22) / 0.7)
        paste(layer, y, a, (1 - a) * 14 * k)                          # her satır hafifçe yükselerek belirir
    out = ease(t / 0.5) * (1 - ease((t - (SECONDS - 0.7)) / 0.7))    # baştan belirir, sonda kararır
    black = Image.new('RGB', im.size, (10, 12, 30))
    return Image.blend(black, im.convert('RGB'), out)


def render(out, draft=False):
    scale, step = (0.5, 2) if draft else (1.0, 1)
    built = build(scale)
    with tempfile.TemporaryDirectory() as d:
        for n, f in enumerate(range(0, int(SECONDS * FPS), step)):
            frame(f / FPS, built).save(f'{d}/{n:04d}.png')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS // step), '-i', f'{d}/%04d.png', '-c:v', 'libx264', '-crf', '22' if draft else '15',
                        '-preset', 'veryfast' if draft else 'medium', '-pix_fmt', 'yuv420p', '-r', str(FPS // step), out], check=True)


if __name__ == '__main__':
    if sys.argv[1] == 'still': frame(float(sys.argv[3]), build(1.0)).save(sys.argv[2])
    else: render(sys.argv[1], len(sys.argv) > 2 and sys.argv[2] == 'draft')
