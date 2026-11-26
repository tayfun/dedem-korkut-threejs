import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import type { GroundFn, Stage } from '../engine/stage';
import { addDust, addGrass } from './life';
import { P, mat, mesh, rng } from './palette';

/** Arazi: ortası düz bozkır, uzakta tepeler; taş, çalı ve ağaç serpiştirme. */

const smooth = (a: number, b: number, v: number) => THREE.MathUtils.smoothstep(v, a, b);

export interface GroundOpts {
  seed?: number;
  /** Kuru çay yatağı: z ekseni boyunca uzanır, x = 0 çevresinde. */
  river?: boolean;
}

export const RIVER = { half: 4.6, depth: 2.3 };

/** Ortası düz bozkır, uzakta tepeler; isteğe bağlı kuru çay yatağı. */
export function makeGround(opts: GroundOpts = {}): GroundFn & { riverT: (x: number, z: number) => number } {
  const noise = createNoise2D(rng(opts.seed ?? 3));
  const riverT = (x: number, z: number) => {
    if (!opts.river) return 0;
    const cx = Math.sin(z * 0.045) * 3.2 * smooth(8, 30, Math.abs(z));
    return 1 - smooth(RIVER.half * 0.45, RIVER.half, Math.abs(x - cx));
  };
  const fn = (x: number, z: number) => {
    const dist = Math.hypot(x, z);
    const far = smooth(34, 130, dist);
    let y = (noise(x * 0.012, z * 0.012) * 0.5 + 0.5) * 26 * far * far;
    y += noise(x * 0.05, z * 0.05) * 1.4 * smooth(28, 60, dist);
    y -= riverT(x, z) * RIVER.depth * (1 - far);
    return y;
  };
  return Object.assign(fn, { riverT });
}

export function addTerrain(stage: Stage, ground: ReturnType<typeof makeGround>, seed = 11): void {
  stage.ground = ground;
  const size = 420;
  const seg = 140;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const noise = createNoise2D(rng(seed));
  const cA = new THREE.Color(P.grass);
  const cB = new THREE.Color(P.grassDark);
  const cSand = new THREE.Color(P.sand);
  const cRock = new THREE.Color(P.stone);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = ground(x, z);
    pos.setY(i, y);
    c.lerpColors(cA, cB, noise(x * 0.06, z * 0.06) * 0.5 + 0.5);
    c.lerp(cRock, smooth(9, 22, y) * 0.8);
    c.lerp(cSand, Math.min(1, ground.riverT(x, z) * 1.3));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
  m.receiveShadow = true;
  stage.add(m);
  // Ot, sahnedeki öteki nesneler yerleştikten sonra ekilir; çadır ve ateşin içine girmez.
  stage.afterBuild(() => addGrass(stage, { seed: seed + 3, skip: (x, z) => ground.riverT(x, z) > 0.05 }));
  addDust(stage);
}

/** Taş, çalı ve ağaç serpiştirir. `keepOut` yarıçapındaki orta alan boş kalır. */
export function scatter(stage: Stage, opts: { seed?: number; rocks?: number; shrubs?: number; trees?: number; keepOut?: number; radius?: number } = {}): void {
  const r = rng(opts.seed ?? 21);
  const radius = opts.radius ?? 60;
  const keepOut = opts.keepOut ?? 0;
  const spot = (): [number, number] => {
    for (;;) {
      const x = (r() * 2 - 1) * radius;
      const z = (r() * 2 - 1) * radius;
      if (Math.hypot(x, z) >= keepOut) return [x, z];
    }
  };
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < (opts.rocks ?? 30); i++) {
    const [x, z] = spot();
    const s = 0.15 + r() * 0.5;
    const m = mesh(rockGeo, mat(r() > 0.5 ? P.stone : P.stoneDark));
    m.position.set(x, stage.ground(x, z) + s * 0.25, z);
    m.scale.set(s * (0.8 + r() * 0.6), s * (0.5 + r() * 0.4), s * (0.8 + r() * 0.6));
    m.rotation.set(r() * 3, r() * 3, r() * 3);
    stage.add(m);
  }
  for (let i = 0; i < (opts.shrubs ?? 40); i++) {
    const [x, z] = spot();
    const s = 0.25 + r() * 0.35;
    const m = mesh(rockGeo, mat(r() > 0.4 ? P.green : P.grassDark));
    m.position.set(x, stage.ground(x, z) + s * 0.4, z);
    m.scale.set(s * 1.3, s * 0.8, s * 1.3);
    m.rotation.y = r() * 3;
    stage.add(m);
  }
  for (let i = 0; i < (opts.trees ?? 0); i++) {
    const [x, z] = spot();
    const t = tree(0.8 + r() * 0.6);
    t.position.set(x, stage.ground(x, z), z);
    t.rotation.y = r() * 6;
    stage.add(t);
  }
}

export function tree(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.2, 2, 5), mat(P.darkBrown));
  trunk.position.y = 1;
  const crown = mesh(new THREE.IcosahedronGeometry(1.2, 0), mat(P.green));
  crown.position.y = 2.9;
  crown.scale.set(0.8, 1.5, 0.8);
  g.add(trunk, crown);
  g.scale.setScalar(scale);
  return g;
}
