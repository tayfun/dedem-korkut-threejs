import type { Stage } from '../engine/stage';
import type { Story, StoryMeta } from '../engine/story';
import { buildHomeScene } from './home-scene';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Tezhip gülü: köşe süsü ve ayraç olarak kullanılan sekiz yapraklı motif. */
const rosette = (size: number) => {
  const petals = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45} 20 20)" d="M20 4c4 5 4 8 0 12c-4-4-4-7 0-12z" fill="${i % 2 ? '#27406b' : '#a8322a'}" stroke="#d49a2a" stroke-width=".8"/>`).join('');
  return `<svg class="rosette" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="#1c1612" stroke="#d49a2a" stroke-width="1"/>${petals}<circle cx="20" cy="20" r="4" fill="#d49a2a"/></svg>`;
};

const covers = new Map<string, string>();

/** Hikâyenin kapak sahnesini kurar, resmini çeker ve sahneyi boşaltır. */
function makeCover(stage: Stage, story: Story, cover: { scene: number; at: number }): string {
  stage.clear();
  const tl = story.scenes[cover.scene].build(stage);
  tl.progress(cover.at).pause();
  const url = stage.snapshot(640, 360);
  tl.kill();
  stage.clear();
  return url;
}

/** Ana sayfa: tanıtım ve hikâye listesi. Temizleme fonksiyonu döndürür. */
export function showHome(app: HTMLElement, stage: Stage, stories: StoryMeta[]): () => void {
  stage.clear();
  let tl = buildHomeScene(stage);
  let alive = true;

  const cards = stories
    .map((s, i) => {
      const inner = `<span class="no"><i>${i + 1}</i></span><span class="body"><strong>${esc(s.title)}</strong><span>${esc(s.blurb)}</span></span>`;
      if (!s.load) return `<li><div class="card soon">${inner}<span class="tag">Yakında</span></div></li>`;
      const img = `<span class="cover" data-cover="${s.slug}">${covers.has(s.slug) ? `<img src="${covers.get(s.slug)}" alt="" />` : ''}</span>`;
      return `<li class="open"><a class="card has-cover" href="#/hikaye/${s.slug}">${img}<span class="row">${inner}<span class="go" aria-hidden="true">→</span></span></a></li>`;
    })
    .join('');

  app.innerHTML = `
    <main class="home">
      <header class="hero">
        <div class="frame" aria-hidden="true">${rosette(34).repeat(4)}</div>
        <div class="kilim" aria-hidden="true"></div>
        <h1>Dedem Korkut</h1>
        <p class="lead">Dede Korkut, Oğuzların bilge ozanıdır: kopuzunu çalar, boy boylar, soy soylar, yiğitlere ad koyar. Burada o hikâyeler özgün metne bağlı kalınarak, günümüz Türkçesiyle anlatılıyor; her sahne kodla canlandırılıyor.</p>
        <a class="cta" href="#/hikaye/${stories.find((s) => s.load)?.slug ?? ''}">İlk hikâyeye başla</a>
      </header>
      <section class="list" aria-labelledby="list-title">
        <div class="divider" aria-hidden="true">${rosette(40)}</div>
        <h2 id="list-title">Hikâyeler</h2>
        <ol class="stories">${cards}</ol>
        <p class="foot">Anlatımlar Dresden nüshasındaki metne dayanır; bütün sahneler kodla çizilir. <a href="#/kaynaklar">Kaynaklar ve uyarlama ilkeleri →</a></p>
      </section>
    </main>`;

  // Kapaklar: hikâye yüklenince kendi sahnesinden bir kare çekilir, sonra ana sahne yeniden kurulur.
  for (const s of stories) {
    if (!s.load || !s.cover || covers.has(s.slug)) continue;
    const cover = s.cover;
    void s.load().then((story) => {
      if (!alive) return;
      tl.kill();
      const url = makeCover(stage, story, cover);
      covers.set(s.slug, url);
      tl = buildHomeScene(stage);
      const slot = app.querySelector(`[data-cover="${s.slug}"]`);
      if (slot) slot.innerHTML = `<img src="${url}" alt="" />`;
    });
  }

  return () => {
    alive = false;
    tl.kill();
    stage.clear();
    app.innerHTML = '';
  };
}
