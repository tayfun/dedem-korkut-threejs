import type { Stage } from '../engine/stage';
import type { StoryMeta } from '../engine/story';
import { buildHomeScene } from './home-scene';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Ana sayfa: tanıtım ve hikâye listesi. Temizleme fonksiyonu döndürür. */
export function showHome(app: HTMLElement, stage: Stage, stories: StoryMeta[]): () => void {
  stage.clear();
  const tl = buildHomeScene(stage);

  const cards = stories
    .map((s, i) => {
      const inner = `<span class="no"><i>${i + 1}</i></span><span class="body"><strong>${esc(s.title)}</strong><span>${esc(s.blurb)}</span></span>`;
      return s.load
        ? `<li><a class="card" href="#/hikaye/${s.slug}">${inner}<span class="go" aria-hidden="true">→</span></a></li>`
        : `<li><div class="card soon">${inner}<span class="tag">Yakında</span></div></li>`;
    })
    .join('');

  app.innerHTML = `
    <main class="home">
      <header class="hero">
        <div class="kilim" aria-hidden="true"></div>
        <h1>Dedem Korkut</h1>
        <p class="lead">Dede Korkut, Oğuzların bilge ozanıdır: kopuzunu çalar, boy boylar, soy soylar, yiğitlere ad koyar. Burada o hikâyeler özgün metne bağlı kalınarak, günümüz Türkçesiyle anlatılıyor; her sahne kodla canlandırılıyor.</p>
        <a class="cta" href="#/hikaye/${stories.find((s) => s.load)?.slug ?? ''}">İlk hikâyeye başla</a>
      </header>
      <section class="list" aria-labelledby="list-title">
        <h2 id="list-title">Hikâyeler</h2>
        <ol class="stories">${cards}</ol>
        <p class="foot">Anlatımlar Dresden nüshasındaki metne dayanır; bütün sahneler kodla çizilir. <a href="#/kaynaklar">Kaynaklar ve uyarlama ilkeleri →</a></p>
      </section>
    </main>`;

  return () => {
    tl.kill();
    stage.clear();
    app.innerHTML = '';
  };
}
