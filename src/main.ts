import './styles/main.css';
import { Stage } from './engine/stage';
import { stories } from './stories';
import { showHome } from './ui/home';
import { showReader } from './ui/reader';
import { showSources } from './ui/sources';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const app = document.getElementById('app') as HTMLElement;
const stage = new Stage(canvas);

let cleanup: (() => void) | undefined;

/** Adres çubuğundaki `#/hikaye/<slug>/<sahne>` yoluna göre sayfayı kurar. */
async function route(): Promise<void> {
  const [, kind, slug, sceneNo] = location.hash.replace(/^#/, '').split('/');
  cleanup?.();
  cleanup = undefined;
  const meta = kind === 'hikaye' ? stories.find((s) => s.slug === slug && s.load) : undefined;
  if (meta?.load) {
    app.innerHTML = '<p class="loading">Yükleniyor…</p>';
    const story = await meta.load();
    cleanup = showReader(app, stage, story, Math.max(0, (parseInt(sceneNo, 10) || 1) - 1));
    document.title = `${story.title} — Dedem Korkut`;
  } else if (kind === 'kaynaklar') {
    cleanup = showSources(app, stage);
    document.title = 'Kaynaklar — Dedem Korkut';
  } else {
    cleanup = showHome(app, stage, stories);
    document.title = 'Dedem Korkut';
  }
  window.scrollTo(0, 0);
}

let lastPath = '';
window.addEventListener('hashchange', () => {
  // Sahne numarası değişiminde (aynı hikâye) sayfayı yeniden kurma.
  const path = location.hash.split('/').slice(0, 3).join('/');
  if (path === lastPath && history.state?.scene) return;
  lastPath = path;
  void route();
});
lastPath = location.hash.split('/').slice(0, 3).join('/');
void route();

// Geliştirme kolaylığı: konsoldan zaman çizelgesini hızlandırmak için.
if (import.meta.env.DEV) {
  void import('gsap').then((m) => ((window as unknown as { gsap: unknown }).gsap = m.default));
  (window as unknown as { stage: Stage }).stage = stage;
}
