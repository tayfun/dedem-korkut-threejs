import type { Stage } from './stage';

/** Bir sahnenin metni. `note`, eski sözcükler için kısa açıklamadır. */
export interface SceneText {
  text: string;
  note?: string;
}

/** Bir sahnenin 3B kurulumu: nesneleri yerleştirir ve animasyon zaman çizelgesini döndürür. */
export interface SceneDef {
  id: string;
  build(stage: Stage): gsap.core.Timeline;
}

export interface Story {
  slug: string;
  title: string;
  texts: Record<string, SceneText>;
  scenes: SceneDef[];
}

export interface StoryMeta {
  slug: string;
  title: string;
  blurb: string;
  load?: () => Promise<Story>;
}
