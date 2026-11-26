import { StoryPlayer } from '../engine/player';
import type { Stage } from '../engine/stage';
import type { Story } from '../engine/story';

/** Hikâye okuyucu: metin paneli, ileri/geri düğmeleri, klavye kısayolları. */
export function showReader(app: HTMLElement, stage: Stage, story: Story, startAt = 0): () => void {
  app.innerHTML = `
    <div class="reader">
      <header class="topbar">
        <a class="back" href="#/">← Hikâyeler</a>
        <h1>${story.title}</h1>
        <a class="back src" href="#/kaynaklar">Kaynaklar</a>
      </header>
      <section class="panel" aria-live="polite">
        <div class="kilim" aria-hidden="true"></div>
        <div class="words">
          <p class="text"></p>
          <p class="note"></p>
        </div>
        <nav class="controls" aria-label="Sahne gezinme">
          <button class="prev" type="button" aria-label="Önceki sahne">← Geri</button>
          <span class="count"></span>
          <button class="replay" type="button" aria-label="Sahneyi yeniden oynat" title="Yeniden oynat">↻</button>
          <button class="next" type="button">İleri →</button>
        </nav>
      </section>
    </div>`;

  const q = <T extends HTMLElement>(sel: string) => app.querySelector(sel) as T;
  const words = q('.words');
  const text = q('.text');
  const note = q('.note');
  const count = q('.count');
  const prev = q<HTMLButtonElement>('.prev');
  const next = q<HTMLButtonElement>('.next');

  const player = new StoryPlayer(stage, story, {
    onScene(i, total, t) {
      text.textContent = t.text;
      note.textContent = t.note ?? '';
      note.hidden = !t.note;
      count.textContent = `${i + 1} / ${total}`;
      prev.disabled = i === 0;
      const last = i === total - 1;
      next.textContent = !last ? 'İleri →' : story.next ? `${story.next.label} →` : 'Hikâyeler ↩';
      next.setAttribute('aria-label', !last ? 'Sonraki sahne' : story.next ? `${story.next.label}e geç` : 'Hikâye listesine dön');
      words.classList.remove('in');
      void words.offsetWidth; // animasyonu yeniden başlat
      words.classList.add('in');
      history.replaceState({ scene: i + 1 }, '', `#/hikaye/${story.slug}/${i + 1}`);
    },
  });

  // Panel sahnenin altını kapatır; görüntüyü panelin yarısı kadar yukarı kaydır.
  const panel = q('.panel');
  const ro = new ResizeObserver(() => stage.setBottomInset(panel.offsetHeight));
  ro.observe(panel);

  const goNext = () => {
    if (player.index === player.total - 1) location.hash = story.next ? `#/hikaye/${story.next.slug}` : '#/';
    else player.next();
  };
  prev.addEventListener('click', () => player.prev());
  next.addEventListener('click', goNext);
  q('.replay').addEventListener('click', () => player.replay());

  const onKey = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const onControl = (e.target as HTMLElement).closest?.('button, a');
    if (e.key === 'ArrowRight' || ((e.key === ' ' || e.key === 'Enter') && !onControl)) {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      player.prev();
    } else if (e.key === 'r' || e.key === 'R') {
      player.replay();
    } else if (e.key === 'Escape') {
      location.hash = '#/';
    }
  };
  window.addEventListener('keydown', onKey);

  player.go(Math.min(startAt, player.total - 1));

  return () => {
    window.removeEventListener('keydown', onKey);
    ro.disconnect();
    stage.setBottomInset(0);
    player.dispose();
    app.innerHTML = '';
  };
}
