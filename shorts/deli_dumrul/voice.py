"""Seslendirme: her sahnenin metni ElevenLabs ile okunur (ses: Alp, model: eleven_v4); çekimler ve altyazılar sesin zamanlamasına oturtulur.

  python -m shorts.deli_dumrul.voice generate        eksik sahnelerin sesini üretir (audio/NN-slug.mp3 + .json; var olan yeniden üretilmez)
  python -m shorts.deli_dumrul.voice track out.mp3   bütün filmin anlatı kanalını tek dosyada toplar (videoyla aynı uzunlukta)

Ses dosyaları audio/ klasöründe kalıcı olarak durur. Dosya yoksa film eski, sabit altyazı temposuyla çizilir."""
import json, os, subprocess, sys

VOICE, MODEL = 'HV5rAif1q1ITHdvxqyMw', 'eleven_v4'      # Alp — derin, sinematik bariton
STORY = 'deli_dumrul'    # başka hikâye, kendi scenes.py dosyasında STORY, ORDER ve DIR değerlerini değiştirir
ORDER = ['kopru', 'ovunme', 'oba', 'soru', 'buyruk', 'sofra', 'at', 'yalvaris', 'dua', 'baba', 'ana', 'veda', 'es', 'ikinci-dua', 'bagis', 'dede']
DIR = os.path.join(os.path.dirname(__file__), 'audio')
FPS = 30
LEAD, TAIL, EARLY = 0.25, 0.45, 0.08     # sahne başında sessizlik, sonunda sessizlik, çekimin sözden ne kadar önce açıldığı (sn)


def path(slug, ext='mp3'):
    return os.path.join(DIR, f'{ORDER.index(slug) + 1:02d}-{slug}.{ext}')


def timing(slug, shots, holds):
    """shots: her çekimin altyazı parçaları. Döner: her çekim için (kare sayısı, parçaların çekim içindeki başlangıç kareleri); ses yoksa None.
    Kare sayıları çifttir: taslak (15 kare/sn) ile son çekim (30 kare/sn) aynı uzunlukta olur, ses kaymaz."""
    if not os.path.exists(path(slug, 'json')): return None
    d = json.load(open(path(slug, 'json'))); al = d['alignment']
    text = ' '.join(c for s in shots for c in s)
    st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
    at = (lambda i: st[i]) if len(st) == len(text) and d['text'] == text else (lambda i: st[min(len(st) - 1, int(i * len(st) / len(text)))])
    starts = []; pos = 0
    for s in shots:
        row = []
        for c in s:
            row.append(LEAD + at(pos)); pos += len(c) + 1
        starts.append(row)
    even = lambda sec: 2 * round(sec * FPS / 2)
    cut = [0] + [even(row[0] - EARLY) for row in starts[1:]]                       # çekim sınırları (kare)
    cut.append(max(cut[-1] + 8, even(LEAD + en[-1] + TAIL + holds[-1])))
    out = []
    for k, row in enumerate(starts):
        out.append((cut[k + 1] - cut[k], [max(0, round(t * FPS) - cut[k]) for t in row]))
    return out


def apply(scenes):
    """scenes.SCENES içindeki çekimlere 'nf' (kare sayısı) ve 'starts' (parça başlangıç kareleri) yazar."""
    for slug, shots in scenes.items():
        t = timing(slug, [s['c'].split('|') for s in shots], [s.get('hold', 0) for s in shots])
        if t:
            for s, (nf, starts) in zip(shots, t): s['nf'], s['starts'] = nf, starts


def apply_film(film):
    t = timing('sofra', [c for _, c, _ in film.SHOTS], [film.HOLD.get(i, 0) for i in range(len(film.SHOTS))])
    film.VOICE = t


def _scenes():
    import importlib
    return importlib.import_module(f'shorts.{STORY}.scenes')


def scene_text(slug):
    if STORY == 'deli_dumrul' and slug == 'sofra':
        from . import film
        return ' '.join(' '.join(c) for _, c, _ in film.SHOTS)
    return ' '.join(s['c'].replace('|', ' ') for s in _scenes().SCENES[slug])


def scene_frames(slug):
    from . import engine
    if STORY == 'deli_dumrul' and slug == 'sofra':
        from . import film
        return sum(film.frames_of(i) for i in range(len(film.SHOTS)))
    return sum(engine.frames_of(s) for s in _scenes().SCENES[slug])


def generate():
    from .. import tts
    os.makedirs(DIR, exist_ok=True)
    for slug in ORDER:
        text = scene_text(slug)
        if os.path.exists(path(slug, 'json')) and json.load(open(path(slug, 'json')))['text'] == text: continue
        sec = tts.synth(text, VOICE, path(slug), model=MODEL)
        print(slug, len(text), 'harf', '%.1f sn' % sec, flush=True)


def track(out, tail=5.0):
    """Sahne seslerini videodaki yerlerine oturtup tek kanalda birleştirir; ses düzeyini eşitler. tail: kapanış kartının sessizliği (sn)."""
    import tempfile
    with tempfile.TemporaryDirectory() as w:
        parts = []
        for slug in ORDER:
            p = f'{w}/{slug}.wav'; dur = scene_frames(slug) / FPS
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', path(slug), '-af', f'adelay={int(LEAD * 1000)}:all=1,apad', '-t', f'{dur:.4f}', '-ar', '44100', '-ac', '1', p], check=True)
            parts.append(p)
        open(f'{w}/l.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{w}/l.txt', '-af', f'loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur={tail}',
                        '-ar', '44100', '-ac', '2', '-b:a', '192k', out], check=True)
    print('anlatı', out)


if __name__ == '__main__':
    generate() if sys.argv[1] == 'generate' else track(sys.argv[2])
