"""ElevenLabs ile seslendirme. Anahtar ELEVENLABS_API_KEY ortam değişkeninden ya da depo kökündeki .env dosyasından okunur (.env git'e girmez).

  python -m shorts.tts <ses_kimliği> <çıktı.mp3> "metin"

Ses dosyasının yanına <çıktı>.json yazılır: metin, ses, model ve harf harf zamanlama (altyazıyı sese oturtmak için)."""
import base64, json, os, sys, urllib.request

MODEL = 'eleven_multilingual_v2'
SETTINGS = dict(stability=0.45, similarity_boost=0.8, style=0.35, use_speaker_boost=True)


def key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k and os.path.exists('.env'):
        for line in open('.env'):
            if line.startswith('ELEVENLABS_API_KEY='): k = line.split('=', 1)[1].strip()
    if not k: raise SystemExit('ELEVENLABS_API_KEY yok')
    return k


def synth(text, voice, out, model=MODEL, settings=SETTINGS, previous=None):
    body = dict(text=text, model_id=model, voice_settings=settings)
    if previous: body['previous_text'] = previous
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128',
                                 data=json.dumps(body).encode(), headers={'xi-api-key': key(), 'Content-Type': 'application/json'})
    try: d = json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e: raise SystemExit(f'ElevenLabs {e.code}: {e.read().decode()[:400]}')
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    open(out, 'wb').write(base64.b64decode(d['audio_base64']))
    al = d.get('alignment') or {}
    json.dump(dict(text=text, voice=voice, model=model, settings=settings, alignment=al), open(os.path.splitext(out)[0] + '.json', 'w'), ensure_ascii=False)
    return al.get('character_end_times_seconds', [0])[-1]


if __name__ == '__main__':
    print('süre %.2f sn' % synth(sys.argv[3], sys.argv[1], sys.argv[2]))
