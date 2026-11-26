import * as THREE from 'three';
import { grieve, place, toss } from '../../engine/direct';
import type { Stage } from '../../engine/stage';
import { elderMan, elderWoman, lady, villager, warrior } from '../../procedural/cast';
import { Human } from '../../procedural/human';
import { addFlock } from '../../procedural/life';
import { P, mat, mesh, rng } from '../../procedural/palette';
import { addBanner, addFire, coin, mace } from '../../procedural/props';
import { placeTent } from '../../procedural/sets';
import { addSky, type Sky, type SkyPreset } from '../../procedural/sky';
import { addTerrain, makeGround, scatter } from '../../procedural/terrain';

/** Deli Dumrul hikâyesine özel mekânlar ve kişiler: köprü, oba, Dumrul ve ailesi, Azrail. */

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
    placeTent(stage, x, z, ry, c, a);
  }
  addFire(stage, 23, 1.5, 0.9);
  return s;
}

/* ---------------------------- Kişiler ----------------------------- */

export function dumrul(withMace = false): Human {
  const d = warrior({ mood: 'smug' });
  if (withMace) {
    const m = mace();
    m.rotation.x = Math.PI / 2;
    d.handR.add(m);
    d.armSwing = 0.3;
  }
  return d;
}

export const wife = () => lady({ eyes: 0x7a6a24 });
export const father = () => elderMan({ mood: 'sad' });
export const mother = () => elderWoman({ mood: 'sad' });

/** Azrail: koyu giysili, ak sakallı, al kanatlı. */
export const azrail = () => new Human({ robe: P.black, trim: P.crimson, hat: 'hood', skin: P.pale, beard: P.white, long: true, wings: P.red, scale: 1.15, mood: 'angry', face: 'grim', eyes: 0xb9c6d4 });

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

/** Bir akçeyi havadan bir noktadan ötekine atar. */
export function tossCoin(tl: gsap.core.Timeline, stage: Stage, from: [number, number, number], to: [number, number, number], at: number): void {
  toss(tl, stage.add(coin()), from, to, at);
}
