import * as THREE from 'three';
import gsap from 'gsap';
import type { Stage } from '../../engine/stage';
import { place } from '../../engine/direct';
import { Human, type HumanOpts } from '../../procedural/figures';
import { addFlock } from '../../procedural/life';
import { P, mat, mesh, rng } from '../../procedural/palette';
import { addBanner, addFire, addSky, addTerrain, coin, mace, makeGround, scatter, tent, type Sky, type SkyPreset } from '../../procedural/world';

/** Deli Dumrul hikâyesine özel mekânlar, kılıklar ve küçük yardımcılar. */

type TL = gsap.core.Timeline;

/* ----------------------------- Köprü ------------------------------ */

export const BR = { L: 7.5, h: 1.35, halfW: 1.5 };
const deckY = (x: number) => BR.h * (1 - (x / BR.L) ** 2);

function bridge(): THREE.Group {
  const g = new THREE.Group();
  const N = 14;
  const body = new THREE.Shape();
  body.moveTo(-BR.L, -3);
  for (let i = 0; i <= N; i++) {
    const x = -BR.L + (2 * BR.L * i) / N;
    body.lineTo(x, deckY(x));
  }
  body.lineTo(BR.L, -3);
  body.lineTo(3.4, -3);
  body.lineTo(3.4, -2.4);
  body.absarc(0, -2.4, 3.4, 0, Math.PI, false);
  body.lineTo(-3.4, -3);
  body.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(body, { depth: BR.halfW * 2, bevelEnabled: false, curveSegments: 10 });
  bodyGeo.translate(0, 0, -BR.halfW);
  g.add(mesh(bodyGeo, mat(P.stone)));

  const rail = new THREE.Shape();
  rail.moveTo(-BR.L, 0);
  for (let i = 0; i <= N; i++) {
    const x = -BR.L + (2 * BR.L * i) / N;
    rail.lineTo(x, deckY(x) + 0.42);
  }
  for (let i = N; i >= 0; i--) {
    const x = -BR.L + (2 * BR.L * i) / N;
    rail.lineTo(x, deckY(x) - 0.05);
  }
  rail.closePath();
  const railGeo = new THREE.ExtrudeGeometry(rail, { depth: 0.24, bevelEnabled: false });
  for (const z of [-BR.halfW - 0.12, BR.halfW - 0.12]) {
    const r = mesh(railGeo, mat(P.stoneDark));
    r.position.z = z;
    g.add(r);
  }
  return g;
}

/** Kuru çay ve üstündeki köprü. */
export function bridgeSet(stage: Stage, sky: SkyPreset = 'day'): Sky {
  const s = addSky(stage, sky);
  const g = makeGround({ river: true, seed: 3 });
  addTerrain(stage, g);
  scatter(stage, { seed: 4, rocks: 30, shrubs: 45, trees: 7, keepOut: 11, radius: 70 });
  // Çay yatağına taşlar
  const r = rng(17);
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 46; i++) {
    const z = (r() * 2 - 1) * 45;
    const x = (r() * 2 - 1) * 2.6 + Math.sin(z * 0.045) * 3.2 * THREE.MathUtils.smoothstep(Math.abs(z), 8, 30);
    const sc = 0.15 + r() * 0.4;
    const m = mesh(rockGeo, mat(r() > 0.5 ? P.stone : P.stoneDark));
    m.position.set(x, g(x, z) + sc * 0.3, z);
    m.scale.set(sc * 1.2, sc * 0.7, sc);
    m.rotation.y = r() * 6;
    stage.add(m);
  }
  stage.add(bridge());
  for (let x = -9; x <= 9; x += 1.5) stage.keepClear(x, 0, 2);
  if (sky === 'day') addFlock(stage);
  stage.ground = (x, z) => (Math.abs(z) < BR.halfW && Math.abs(x) < BR.L ? Math.max(g(x, z), deckY(x)) : g(x, z));
  addBanner(stage, -8.6, -2.3, P.red);
  addBanner(stage, 8.6, -2.3, P.red);
  return s;
}

/** Köprünün doğusuna konan oba: çadırlar ve bir ateş. */
export const CAMP = { x: 18, z: 4 };

export function campSet(stage: Stage, sky: SkyPreset = 'day'): Sky {
  const s = bridgeSet(stage, sky);
  const tents: [number, number, number, number, number][] = [
    [14, -6, 0.3, P.white, P.red],
    [21, -7, -0.1, P.cream, P.indigo],
    [27, -3, -0.7, P.white, P.teal],
    [28, 6, -1.3, P.cream, P.red],
    [33, -9, -0.3, P.white, P.ochre],
  ];
  for (const [x, z, ry, c, a] of tents) {
    const t = tent(c, a);
    t.position.set(x, stage.ground(x, z), z);
    t.rotation.y = ry;
    stage.add(t);
    stage.keepClear(x, z, 2.5);
  }
  addFire(stage, 23, 1.5, 0.9);
  return s;
}

/** Düz bozkır: çadır önü sahneleri için. */
export function steppeSet(stage: Stage, sky: SkyPreset, seed = 5): Sky {
  const s = addSky(stage, sky);
  addTerrain(stage, makeGround({ seed }), seed + 8);
  scatter(stage, { seed: seed + 1, rocks: 26, shrubs: 50, trees: 6, keepOut: 9, radius: 70 });
  if (sky === 'day' || sky === 'dawn') addFlock(stage, 4, seed);
  return s;
}

export function addTent(stage: Stage, x: number, z: number, ry = 0, color: number = P.white, accent: number = P.red, scale = 1): void {
  const t = tent(color, accent, scale);
  t.position.set(x, stage.ground(x, z), z);
  t.rotation.y = ry;
  stage.add(t);
  stage.keepClear(x, z, 2.5 * scale);
}

/* ---------------------------- Kişiler ----------------------------- */

export function dumrul(withMace = false): Human {
  const d = new Human({ robe: P.red, trim: P.ochre, hat: 'bork', hatColor: P.indigo, scale: 1.1, moustache: P.black, hair: P.black, cloak: P.indigo, mood: 'smug' });
  if (withMace) {
    const m = mace();
    m.rotation.x = Math.PI / 2;
    d.handR.add(m);
    d.armSwing = 0.3;
  }
  return d;
}

export const wife = () => new Human({ robe: P.teal, trim: P.ochre, hat: 'scarf', hatColor: P.cream, long: true, hair: P.black, blush: true, eyes: 0x7a6a24 });
export const father = () => new Human({ robe: P.brown, trim: P.cream, hat: 'kalpak', hatColor: P.indigo, beard: P.white, mood: 'sad' });
export const mother = () => new Human({ robe: P.indigo, trim: P.cream, hat: 'scarf', hatColor: P.white, long: true, hair: P.pale, mood: 'sad', face: 'elder' });
export const child = (i: number) => new Human({ robe: i ? P.ochre : P.green, trim: P.red, hat: 'bork', hatColor: P.red, scale: i ? 0.55 : 0.66, blush: true, hair: P.darkBrown });

const LOOKS: HumanOpts[] = [
  { robe: P.teal, trim: P.cream, hat: 'bork', hatColor: P.red, moustache: P.black },
  { robe: P.brown, trim: P.ochre, hat: 'kalpak', hatColor: P.indigo, hair: P.darkBrown, eyes: 0x4f6a3a },
  { robe: P.indigo, trim: P.cream, hat: 'scarf', hatColor: P.cream, long: true, hair: P.darkBrown, blush: true, eyes: 0x3f6a7a },
  { robe: P.green, trim: P.ochre, hat: 'bork', hatColor: P.ochre, moustache: P.darkBrown, hair: P.darkBrown },
  { robe: P.crimson, trim: P.cream, hat: 'scarf', hatColor: P.ochre, long: true, hair: P.black, blush: true },
  { robe: P.ochre, trim: P.indigo, hat: 'kalpak', hatColor: P.red, beard: P.black },
  { robe: P.stoneDark, trim: P.red, hat: 'bork', hatColor: P.teal, beard: P.white },
  { robe: P.indigo, trim: P.ochre, hat: 'bork', hatColor: P.green, beard: P.black },
];
export const villager = (i: number) => new Human(LOOKS[i % LOOKS.length]);

/** Ölen yiğit ve çevresinde yas tutanlar. */
export function mourners(stage: Stage): { list: Human[] } {
  const rug = mesh(new THREE.BoxGeometry(1.5, 0.06, 2.6), mat(P.crimson));
  rug.position.set(CAMP.x, 0.03, CAMP.z);
  const rugIn = mesh(new THREE.BoxGeometry(1.1, 0.07, 2.2), mat(P.ochre));
  rugIn.position.copy(rug.position);
  stage.add(rug);
  stage.keepClear(CAMP.x, CAMP.z, 1.9);
  stage.add(rugIn);

  const dead = new Human({ robe: P.cream, trim: P.teal, hat: 'none', hair: P.black });
  dead.eyesClosed = true;
  dead.freeY = true;
  dead.rig.rotation.x = -Math.PI / 2;
  place(dead, CAMP.x, CAMP.z + 1.0);
  dead.group.position.y = 0.26;
  stage.track(dead);

  const list: Human[] = [];
  const angles = [65, 110, 155, 205, 250, 295];
  angles.forEach((deg, i) => {
    const a = THREE.MathUtils.degToRad(deg);
    const x = CAMP.x + Math.sin(a) * 2.5;
    const z = CAMP.z + Math.cos(a) * 2.5;
    const m = stage.track(place(villager(i), x, z, a + Math.PI));
    grieve(m);
    list.push(m);
  });
  return { list };
}

/** Yas duruşu: baş öne eğik, eller yüzde. */
export function grieve(m: Human): void {
  m.setMood('sad');
  m.head.rotation.x = 0.45;
  m.armL.rotation.set(-2.2, 0, 0.45);
  m.armR.rotation.set(-2.2, 0, -0.45);
}

/* --------------------------- Yardımcılar -------------------------- */

/** Nesneyi küçükten büyüterek "belirir" kılar. */
export function pop(tl: TL, obj: THREE.Object3D, at: number, scale = 1, dur = 0.6): void {
  tl.fromTo(obj.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: scale, y: scale, z: scale, duration: dur, ease: 'back.out(1.8)' }, at);
}

export function vanish(tl: TL, obj: THREE.Object3D, at: number, dur = 0.35): void {
  tl.to(obj.scale, { x: 0.001, y: 0.001, z: 0.001, duration: dur, ease: 'power2.in' }, at);
}

/** Bir akçeyi havadan bir noktadan ötekine atar. */
export function tossCoin(tl: TL, stage: Stage, from: [number, number, number], to: [number, number, number], at: number): void {
  const c = stage.add(coin());
  c.position.set(...from);
  c.visible = false;
  tl.set(c, { visible: true }, at);
  tl.to(c.position, { x: to[0], z: to[2], duration: 0.6, ease: 'none' }, at);
  tl.to(c.position, { y: Math.max(from[1], to[1]) + 0.7, duration: 0.3, ease: 'power1.out' }, at);
  tl.to(c.position, { y: to[1], duration: 0.3, ease: 'power1.in' }, at + 0.3);
  tl.to(c.rotation, { z: 9, duration: 0.6, ease: 'none' }, at);
  tl.set(c, { visible: false }, at + 0.62);
}

/** Hafif, yinelenen bir sallanma (ağlama, nefes alma). */
export function sway(tl: TL, m: Human, at: number, repeats = 9): void {
  tl.to(m.rig.rotation, { x: 0.1, duration: 0.5 + Math.random() * 0.3, ease: 'sine.inOut', yoyo: true, repeat: repeats }, at);
}

export const newTimeline = () => gsap.timeline();
