import gsap from 'gsap';
import type { Stage } from './stage';
import type { SceneText, Story } from './story';

// Zaman çizelgesi ileri sarıldığında (ör. azaltılmış hareket) değerler sırayla yazılsın.
gsap.defaults({ lazy: false });

export interface PlayerEvents {
  onScene(index: number, total: number, text: SceneText): void;
}

/** Bir hikâyeyi sahne sahne oynatır. */
export class StoryPlayer {
  index = -1;
  private tl?: gsap.core.Timeline;
  private fade?: gsap.core.Tween;

  constructor(private stage: Stage, private story: Story, private events: PlayerEvents) {}

  get total(): number {
    return this.story.scenes.length;
  }

  go(i: number): void {
    if (i < 0 || i >= this.total) return;
    this.index = i;
    const def = this.story.scenes[i];
    this.tl?.kill();
    this.stage.clear();
    this.tl = def.build(this.stage);
    if (this.stage.reducedMotion) {
      // Hareket azaltılmışsa sahnenin son hâli gösterilir.
      this.tl.progress(1).pause();
    } else {
      const canvas = this.stage.renderer.domElement;
      this.fade?.kill();
      this.fade = gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' });
    }
    this.events.onScene(i, this.total, this.story.texts[def.id] ?? { text: '' });
  }

  next(): void {
    this.go(this.index + 1);
  }

  prev(): void {
    this.go(this.index - 1);
  }

  replay(): void {
    this.go(this.index);
  }

  dispose(): void {
    this.tl?.kill();
    this.fade?.kill();
    this.stage.renderer.domElement.style.opacity = '1';
    this.stage.clear();
  }
}
