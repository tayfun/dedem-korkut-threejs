import * as THREE from 'three';
import { noInk } from '../engine/ink';
import type { Stage } from '../engine/stage';
import { addFlock } from './life';
import { P, mat, rng } from './palette';
import { tent } from './props';
import { addSky, type Sky, type SkyPreset } from './sky';
import { addTerrain, makeGround, scatter } from './terrain';

/** Ortak mekânlar: birçok hikâyede geçen hazır sahne düzenleri. */

/** Düz bozkır: gök, arazi, taş ve çalılar; gündüzse uzakta kuşlar. */
export function steppeSet(stage: Stage, sky: SkyPreset, seed = 5): Sky {
  const s = addSky(stage, sky);
  addTerrain(stage, makeGround({ seed }), seed + 8);
  scatter(stage, { seed: seed + 1, rocks: 26, shrubs: 50, trees: 6, keepOut: 9, radius: 70 });
  if (sky === 'day' || sky === 'dawn') addFlock(stage, 4, seed);
  return s;
}

/** Bir otağı zemine oturtur ve çevresini ottan temizler. Kapısı `ry = 0` iken +z yönüne bakar. */
export function placeTent(stage: Stage, x: number, z: number, ry = 0, color: number = P.white, accent: number = P.red, scale = 1): void {
  const t = tent(color, accent, scale);
  t.position.set(x, stage.ground(x, z), z);
  t.rotation.y = ry;
  stage.add(t);
  stage.keepClear(x, z, 2.5 * scale);
}

/** Sazlık: uzun, ince kamışlardan bir öbek. */
export function reeds(stage: Stage, x: number, z: number, radius: number, count: number, seed = 5): void {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * radius;
    const h = 1.3 + r() * 1.2;
    const reed = noInk(new THREE.Mesh(new THREE.ConeGeometry(0.05, h, 4), mat(r() > 0.5 ? P.green : P.grassDark)));
    reed.position.set(x + Math.cos(a) * d, h / 2, z + Math.sin(a) * d);
    reed.rotation.set((r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25);
    stage.add(reed);
  }
  stage.keepClear(x, z, radius * 0.6);
}
