import * as THREE from 'three';
import { noInk } from '../engine/ink';
import type { Stage } from '../engine/stage';
import { Bird } from './animals';
import { P, glow, mat, rng } from './palette';

/** Sahneye canlılık katan küçük şeyler: ot, toz, duman, kıvılcım, kuş sürüsü. */

/* ------------------------------- Ot -------------------------------- */

/**
 * Rüzgârda sallanan ot öbekleri (tek draw call). `skip` true döndürdüğü yerlere ot ekilmez;
 * ayrıca `stage.keepClear` ile işaretlenen alanlar (çadır, ateş, kilim) boş bırakılır.
 */
export function addGrass(stage: Stage, opts: { seed?: number; count?: number; radius?: number; skip?: (x: number, z: number) => boolean } = {}): void {
  const count = opts.count ?? 2600;
  const radius = opts.radius ?? 52;
  const r = rng(opts.seed ?? 77);

  // Bir öbek: yelpaze gibi açılan üç ince yaprak.
  const v: number[] = [];
  for (const [a, lean, h] of [[0, 0.1, 1], [2.1, -0.16, 0.8], [4.2, 0.2, 0.65]]) {
    const dx = Math.cos(a) * 0.05;
    const dz = Math.sin(a) * 0.05;
    v.push(-dx, 0, -dz, dx, 0, dz, Math.cos(a + 1.5) * lean, h, Math.sin(a + 1.5) * lean);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  // Normaller yukarı bakar: otlar zeminle aynı ışığı alır, yan dönünce kararmaz.
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(Array(9).fill([0, 1, 0]).flat(), 3));

  const uTime = { value: 0 };
  const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         #ifdef USE_INSTANCING
           float gw = uTime * 1.7 + instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.27;
           transformed.x += (sin(gw) * 0.16 + sin(gw * 2.3) * 0.05) * position.y;
           transformed.z += cos(gw * 0.8) * 0.07 * position.y;
         #endif`,
      );
    // Yaprağın arka yüzü de yukarı bakan normalle aydınlansın; yoksa yarısı kararır.
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', 'vec3 normal = normalize(vNormal);\nvec3 nonPerturbedNormal = normal;');
  };

  const im = new THREE.InstancedMesh(geo, material, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const cA = new THREE.Color(P.grassDark);
  const cB = new THREE.Color(P.green);
  const cC = new THREE.Color(P.grass);
  const c = new THREE.Color();
  let n = 0;
  for (let tries = 0; n < count && tries < count * 4; tries++) {
    // Ortaya yakın yerler daha sık.
    const d = Math.pow(r(), 0.7) * radius;
    const a = r() * Math.PI * 2;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (opts.skip?.(x, z) || stage.isClear(x, z)) continue;
    const s = 0.28 + r() * 0.3;
    q.setFromAxisAngle(up, r() * Math.PI * 2);
    m.compose(new THREE.Vector3(x, stage.ground(x, z) - 0.02, z), q, new THREE.Vector3(s * 1.4, s, s * 1.4));
    im.setMatrixAt(n, m);
    c.lerpColors(cA, r() > 0.5 ? cB : cC, r() * 0.7);
    im.setColorAt(n, c);
    n++;
  }
  im.count = n;
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.frustumCulled = false;
  stage.add(noInk(im));
  if (!stage.reducedMotion) stage.onTick((t) => (uTime.value = t));
}

/* --------------------------- Parçacıklar --------------------------- */

interface Puff {
  mesh: THREE.Mesh;
  life: number;
  dur: number;
  size: number;
  vx: number;
  vy: number;
  vz: number;
}

/** Büyüyüp sönen küçük öbekler için havuz (toz, duman, kıvılcım). */
class Puffs {
  private items: Puff[] = [];
  private next = 0;

  constructor(stage: Stage, count: number, material: THREE.Material, ink: boolean) {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(i ? geo.clone() : geo, material);
      mesh.visible = false;
      stage.add(ink ? mesh : noInk(mesh));
      this.items.push({ mesh, life: 1, dur: 1, size: 0, vx: 0, vy: 0, vz: 0 });
    }
    stage.onTick((_t, dt) => this.update(dt));
  }

  emit(x: number, y: number, z: number, size: number, dur: number, vx: number, vy: number, vz: number): void {
    const p = this.items[this.next];
    this.next = (this.next + 1) % this.items.length;
    p.mesh.position.set(x, y, z);
    p.mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    p.mesh.scale.setScalar(0.0001); // ilk karede tam boy görünmesin
    p.mesh.visible = true;
    Object.assign(p, { life: 0, dur, size, vx, vy, vz });
  }

  private update(dt: number): void {
    for (const p of this.items) {
      if (p.life >= 1) continue;
      p.life += dt / p.dur;
      if (p.life >= 1) {
        p.mesh.visible = false;
        continue;
      }
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      // Hızla büyür, yavaşça söner.
      p.mesh.scale.setScalar(p.size * Math.sin(Math.PI * Math.pow(p.life, 0.6)));
    }
  }
}

/** Yürüyen figürlerin ayak altından toz kaldırır. */
export function addDust(stage: Stage): void {
  if (stage.reducedMotion) return;
  const puffs = new Puffs(stage, 14, mat(P.sand), true);
  const timers = new WeakMap<object, number>();
  stage.onTick((_t, dt) => {
    for (const m of stage.movers) {
      if (m.freeY || m.walkAmp < 0.6 || !m.group.visible) continue;
      const left = (timers.get(m) ?? 0) - dt * (m.walkSpeed / 8);
      if (left > 0) {
        timers.set(m, left);
        continue;
      }
      timers.set(m, 0.32);
      const p = m.group.position;
      const k = m.group.scale.x;
      puffs.emit(p.x + (Math.random() - 0.5) * 0.3, p.y + 0.06, p.z + (Math.random() - 0.5) * 0.3, (0.09 + Math.random() * 0.06) * k, 0.7, 0, 0.25, 0);
    }
  });
}

/** Ateşten yükselen duman ve kıvılcımlar. */
export function addSmoke(stage: Stage, x: number, y: number, z: number, scale = 1): void {
  if (stage.reducedMotion) return;
  const smoke = new Puffs(stage, 7, mat(P.stone), false);
  const sparks = new Puffs(stage, 10, glow(P.flameCore), false);
  let a = 0;
  let b = 0;
  stage.onTick((t, dt) => {
    a -= dt;
    b -= dt;
    if (a <= 0) {
      a = 0.55;
      smoke.emit(x + Math.sin(t * 3) * 0.1, y + 1.1 * scale, z, 0.16 * scale, 3.6, 0.25 + Math.sin(t) * 0.1, 0.75, 0.05);
    }
    if (b <= 0) {
      b = 0.18 + Math.random() * 0.25;
      sparks.emit(x + (Math.random() - 0.5) * 0.3, y + 0.5 * scale, z + (Math.random() - 0.5) * 0.3, 0.03 * scale, 1.3, (Math.random() - 0.5) * 0.6, 1.5 + Math.random(), (Math.random() - 0.5) * 0.6);
    }
  });
}

/* ------------------------------ Kuşlar ----------------------------- */

/** Uzakta daireler çizen küçük bir kuş sürüsü. */
export function addFlock(stage: Stage, count = 5, seed = 9): void {
  const r = rng(seed);
  const cx = (r() - 0.5) * 60;
  const cz = -50 - r() * 40;
  const birds = Array.from({ length: count }, () => {
    const b = stage.track(new Bird(P.black, 1.6));
    return { b, rad: 14 + r() * 16, h: 24 + r() * 12, sp: 0.16 + r() * 0.1, off: r() * 6.3 };
  });
  const placeAll = (t: number) => {
    for (const { b, rad, h, sp, off } of birds) {
      const a = t * sp + off;
      b.group.position.set(cx + Math.cos(a) * rad, h + Math.sin(a * 2.3) * 1.5, cz + Math.sin(a) * rad);
      b.group.rotation.y = -a;
    }
  };
  placeAll(0);
  if (!stage.reducedMotion) stage.onTick(placeAll);
}
