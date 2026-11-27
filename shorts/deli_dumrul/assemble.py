"""Bütün hikâyeyi tek videoda toplar: 16 sahne + kapanış kartı.

  python -m shorts.deli_dumrul.assemble draft [--reuse]    yarı çözünürlük, 15 kare/sn  → shorts/out/deli-dumrul-taslak.mp4
  python -m shorts.deli_dumrul.assemble final [--reuse]    1080×1920, 30 kare/sn        → shorts/out/deli-dumrul.mp4
--reuse: daha önce çizilmiş sahne dosyalarını yeniden çizmez."""
import os, subprocess, sys, tempfile
from .. import credits
from . import engine, film

ORDER = ['kopru', 'ovunme', 'oba', 'soru', 'buyruk', 'sofra', 'at', 'yalvaris', 'dua', 'baba', 'ana', 'veda', 'es', 'ikinci-dua', 'bagis', 'dede']


def main(mode, reuse=False):
    draft = mode == 'draft'
    d = 'shorts/out/' + ('taslak' if draft else 'son'); os.makedirs(d, exist_ok=True)
    files = []
    with tempfile.TemporaryDirectory() as work:
        for i, slug in enumerate(ORDER):
            p = f'{d}/{i + 1:02d}-{slug}.mp4'; files.append(p)
            if reuse and os.path.exists(p): continue
            if slug == 'sofra': film.render(p, f'{work}/{slug}', draft=draft)      # şölen sahnesi kendi kodundadır
            else: engine.render(slug, p, f'{work}/{slug}', draft=draft)
        p = f'{d}/99-kapanis.mp4'; credits.render(p, draft); files.append(p)
        with open(f'{work}/all.txt', 'w') as fh: fh.write(''.join(f"file '{os.path.abspath(f)}'\n" for f in files))
        out = 'shorts/out/deli-dumrul-taslak.mp4' if draft else 'shorts/out/deli-dumrul.mp4'
        fps = '15' if draft else '30'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{work}/all.txt', '-c:v', 'libx264', '-crf', '23' if draft else '17',
                        '-preset', 'veryfast' if draft else 'medium', '-pix_fmt', 'yuv420p', '-r', fps, '-movflags', '+faststart', out], check=True)
    print('bitti', out)


if __name__ == '__main__':
    main(sys.argv[1], '--reuse' in sys.argv)
