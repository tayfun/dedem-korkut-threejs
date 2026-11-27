"""Basat ile Tepegöz — komutlar.

  python -m shorts.tepegoz.run contact               temas sayfaları → shorts/tepegoz/contact/
  python -m shorts.tepegoz.run voice                 eksik sahne seslerini üretir (ElevenLabs)
  python -m shorts.tepegoz.run draft|final [--reuse] bütün film → shorts/out/tepegoz-taslak.mp4 | tepegoz.mp4"""
import os, subprocess, sys, tempfile
from . import scenes
from .. import credits
from ..deli_dumrul import engine as E, voice as V

HERE = os.path.dirname(__file__)


def contact(only=None):
    os.makedirs(f'{HERE}/contact', exist_ok=True)
    for i, slug in enumerate(scenes.ORDER):
        if only and slug not in only: continue
        E.contact(scenes.SCENES[slug], f'{HERE}/contact/{i + 1:02d}-{slug}.jpg', scenes.TITLES[slug])


def film(mode, reuse=False):
    draft = mode == 'draft'
    d = 'shorts/out/tepegoz-' + ('taslak' if draft else 'son'); os.makedirs(d, exist_ok=True)
    files = []
    with tempfile.TemporaryDirectory() as work:
        for i, slug in enumerate(scenes.ORDER):
            p = f'{d}/{i + 1:02d}-{slug}.mp4'; files.append(p)
            if not (reuse and os.path.exists(p)): E.render(slug, p, f'{work}/{slug}', draft=draft)
        p = f'{d}/99-kapanis.mp4'; credits.render(p, draft); files.append(p)
        open(f'{work}/all.txt', 'w').write(''.join(f"file '{os.path.abspath(f)}'\n" for f in files))
        out = 'shorts/out/tepegoz-taslak.mp4' if draft else 'shorts/out/tepegoz.mp4'
        audio = []
        if os.path.exists(V.path(scenes.ORDER[0])):
            V.track(f'{HERE}/audio/tepegoz-anlati.mp3', credits.SECONDS)
            audio = ['-i', f'{HERE}/audio/tepegoz-anlati.mp3', '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest']
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{work}/all.txt'] + audio + ['-c:v', 'libx264', '-crf', '23' if draft else '17',
                        '-preset', 'veryfast' if draft else 'medium', '-pix_fmt', 'yuv420p', '-r', '15' if draft else '30', '-movflags', '+faststart', out], check=True)
    print('bitti', out)


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'contact': contact(sys.argv[2:] or None)
    elif cmd == 'voice': V.generate()
    else: film(cmd, '--reuse' in sys.argv)
