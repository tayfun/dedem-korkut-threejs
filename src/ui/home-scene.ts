import gsap from 'gsap';
import { place } from '../engine/direct';
import type { Stage } from '../engine/stage';
import { cast } from '../procedural/figures';
import { P } from '../procedural/palette';
import { addFire, addSky, addTerrain, makeGround, scatter, tent } from '../procedural/world';

/** Ana sayfanın arka planı: gece bozkırında ateş başında kopuz çalan Dede Korkut. */
export function buildHomeScene(stage: Stage): gsap.core.Timeline {
  addSky(stage, 'night');
  addTerrain(stage, makeGround({ seed: 2 }), 6);
  scatter(stage, { seed: 8, rocks: 24, shrubs: 40, trees: 6, keepOut: 8, radius: 60 });
  const spots: [number, number, number, number][] = [
    [-5, -6, 0.5, P.red],
    [4, -8, -0.3, P.indigo],
  ];
  for (const [x, z, ry, accent] of spots) {
    const t = tent(P.cream, accent, 1.2);
    t.position.set(x, 0, z);
    t.rotation.y = ry;
    stage.add(t);
  }
  addFire(stage, 0, 0, 1.2);
  const dede = stage.track(place(cast.dedeKorkut(), -2.4, -0.6, 1.3)).sit();

  const tl = gsap.timeline();
  tl.to(dede.armR.rotation, { x: -1.15, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
  tl.to(dede.head.rotation, { z: 0.12, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);

  // Kamera ateşin çevresinde çok yavaş salınır.
  const place3 = (t: number) => {
    const a = 0.35 + Math.sin(t * 0.07) * 0.5;
    stage.camera.position.set(Math.sin(a) * 13, 3.2, Math.cos(a) * 13);
  };
  stage.look.set(-4.5, 2.4, 0);
  place3(0);
  if (!stage.reducedMotion) stage.onTick(place3);
  return tl;
}
