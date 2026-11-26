import * as THREE from 'three';
import type { Stage } from '../../engine/stage';
import { elderMan, elderWoman, lady, villager, warrior } from '../../procedural/cast';
import type { Human, HumanOpts } from '../../procedural/human';
import { P, mat, mesh, rng } from '../../procedural/palette';
import { addBanner, addFire, kopuz } from '../../procedural/props';
import { placeTent, steppeSet } from '../../procedural/sets';
import type { Sky, SkyPreset } from '../../procedural/sky';

/** Bamsı Beyrek hikâyesine özel mekânlar ve kişiler; iki bölüm de bunları kullanır. */

/* ----------------------------- Mekânlar ---------------------------- */

/** Bayındır Han'ın divanı: büyük ak otağ, iki yanında çadırlar. */
export function divanSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 91);
  placeTent(stage, 0, -9, 0, P.white, P.gold, 1.7);
  placeTent(stage, -11, -8, 0.4, P.cream, P.red, 1.1);
  placeTent(stage, 11, -8, -0.4, P.cream, P.indigo, 1.1);
  addBanner(stage, -5, -5, P.red, 4.2);
  addBanner(stage, 5, -5, P.red, 4.2);
  return s;
}

/** Pay Püre Bey'in yurdu. */
export function yurtSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 101);
  placeTent(stage, -1, -7, 0.1, P.cream, P.teal, 1.5);
  placeTent(stage, 9, -8.5, -0.5, P.white, P.red, 1.1);
  addFire(stage, 6.5, 0.5, 1);
  return s;
}

/** Yeşil çayırda Banı Çiçek'in kırmızı otağı. */
export function cayirSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 111);
  placeTent(stage, 6, -6, -0.4, P.red, P.gold, 1.4);
  return s;
}

/** Kayalık geçit: Kara Derbent. */
export function derbentSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 121);
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const r = rng(6);
  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    const sc = 3 + r() * 3;
    const m = mesh(geo, mat(i % 3 ? P.stoneDark : P.stone));
    m.position.set(side * (11 + r() * 6), sc * 0.5, -10 + i * 1.6);
    m.scale.set(sc, sc * 1.2, sc);
    m.rotation.set(i, i * 2, 0.3);
    stage.add(m);
    stage.keepClear(m.position.x, m.position.z, sc);
  }
  return s;
}

export const GATE = { x: 0, z: -9 };

/** Bayburt Hisarı: burçlu taş sur, ortada kapı, üstünde çardak. */
export function hisarSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 131);
  const wall = mat(P.stone);
  const dark = mat(P.stoneDark);
  for (const x of [-9, 9]) {
    const w = mesh(new THREE.BoxGeometry(10, 6, 2), wall);
    w.position.set(x, 3, GATE.z);
    stage.add(w);
  }
  const lintel = mesh(new THREE.BoxGeometry(8, 2.4, 2), wall);
  lintel.position.set(0, 4.8, GATE.z);
  stage.add(lintel);
  const door = mesh(new THREE.BoxGeometry(4, 3.6, 0.3), mat(P.darkBrown));
  door.position.set(0, 1.8, GATE.z + 0.4);
  stage.add(door);
  for (const x of [-14, -4.6, 4.6, 14]) {
    const tower = mesh(new THREE.CylinderGeometry(1.7, 1.9, 8.4, 8), dark);
    tower.position.set(x, 4.2, GATE.z + 0.4);
    const cap = mesh(new THREE.ConeGeometry(2.1, 2.2, 8), mat(P.crimson));
    cap.position.set(x, 9.5, GATE.z + 0.4);
    stage.add(tower);
    stage.add(cap);
  }
  for (let x = -12; x <= 12; x += 1.6) {
    if (Math.abs(x) < 4) continue;
    const merlon = mesh(new THREE.BoxGeometry(0.8, 0.8, 2), wall);
    merlon.position.set(x, 6.4, GATE.z);
    stage.add(merlon);
  }
  // Çardak: kapının üstünde, tutsağın çıkarıldığı balkon.
  const deck = mesh(new THREE.BoxGeometry(5, 0.3, 2.4), mat(P.brown));
  deck.position.set(0, 6.1, GATE.z + 1.2);
  stage.add(deck);
  for (let x = -18; x <= 18; x += 4) stage.keepClear(x, GATE.z, 4);
  return s;
}

/** Çardağın üstündeki bir figür için yükseklik. */
export const DECK_Y = 6.25;

/** Küçük bir su: pınar ya da gölcük. */
export function pond(stage: Stage, x: number, z: number, r = 2.6): void {
  const water = mesh(new THREE.CircleGeometry(r, 18), mat(P.water), false);
  water.rotation.x = -Math.PI / 2;
  water.position.set(x, 0.04, z);
  water.receiveShadow = true;
  stage.add(water);
  const rock = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const m = mesh(rock, mat(i % 2 ? P.stone : P.stoneDark));
    m.position.set(x + Math.cos(a) * r, 0.1, z + Math.sin(a) * r);
    m.scale.set(0.4, 0.25, 0.3);
    stage.add(m);
  }
  stage.keepClear(x, z, r + 0.5);
}

/** Nişan direği: ucunda yüzük. Yüzük nesnesini döndürür. */
export function target(stage: Stage, x: number, z: number): THREE.Mesh {
  const pole = mesh(new THREE.CylinderGeometry(0.05, 0.06, 3, 5), mat(P.darkBrown));
  pole.position.set(x, 1.5, z);
  stage.add(pole);
  const hoop = mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 14), mat(P.gold, { emissive: 0x6a4a00 }));
  hoop.position.set(x, 3.2, z);
  hoop.rotation.y = Math.PI / 2;
  stage.add(hoop);
  return hoop;
}

/** Çit: bir çemberin çevresine kazıklar (ağıl). */
export function pen(stage: Stage, x: number, z: number, r: number): void {
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const post = mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.2, 5), mat(P.darkBrown));
    post.position.set(x + Math.cos(a) * r, 0.6, z + Math.sin(a) * r);
    stage.add(post);
  }
  stage.keepClear(x, z, r);
}

/* ------------------------------ Kişiler ---------------------------- */

export const bayindir = () => warrior({ robe: P.indigo, trim: P.gold, hat: 'kalpak', hatColor: P.ochre, beard: P.black, cloak: P.crimson });
export const kazan = (o: HumanOpts = {}) => warrior({ robe: P.crimson, hatColor: P.ochre, cloak: P.teal, ...o });
export const payPure = (o: HumanOpts = {}) => elderMan({ robe: P.teal, trim: P.gold, hatColor: P.crimson, cloak: P.brown, scale: 1.08, ...o });
export const payPicen = (o: HumanOpts = {}) => warrior({ robe: P.brown, trim: P.cream, hatColor: P.green, beard: P.black, cloak: undefined, ...o });
export const ana = (o: HumanOpts = {}) => elderWoman({ robe: P.teal, ...o });

/** Bamsı Beyrek: `robe` ile güveylik kırmızı kaftanı da giydirilir. */
export const beyrek = (o: HumanOpts = {}) => warrior({ robe: P.indigo, trim: P.gold, hatColor: P.red, cloak: undefined, moustache: undefined, ...o });

/** On altı yıl tutsak kalmış Beyrek: sakallı, başı açık. */
export const captive = (o: HumanOpts = {}) => beyrek({ hat: 'none', beard: P.black, robe: P.stoneDark, trim: P.stone, mood: 'sad', ...o });

/** Deli ozan kılığındaki Beyrek: sırtında deve çuvalı, elinde kopuz. */
export function deliOzan(o: HumanOpts = {}): Human {
  const b = captive({ robe: P.sand, trim: P.earth, mood: 'smug', ...o });
  const k = kopuz();
  k.position.set(0.08, 1.1, 0.2);
  k.rotation.z = 1.05;
  b.rig.add(k);
  b.armR.rotation.set(-0.95, 0, -0.35);
  b.armL.rotation.set(-1.1, 0, -0.5);
  b.armSwing = 0;
  return b;
}

export const bani = (o: HumanOpts = {}) => lady({ robe: P.red, trim: P.gold, hatColor: P.white, eyes: 0x4f6a3a, ...o });
export const yenge = (o: HumanOpts = {}) => lady({ robe: P.green, hatColor: P.ochre, blush: false, ...o });
export const sister = (i: number) => lady({ robe: [P.teal, P.ochre, P.indigo][i % 3], hatColor: P.cream, mood: 'sad' });
export const karcar = (o: HumanOpts = {}) => warrior({ robe: P.black, trim: P.crimson, hatColor: P.crimson, beard: P.black, cloak: P.crimson, scale: 1.25, mood: 'angry', ...o });
export const yaltacuk = (o: HumanOpts = {}) => warrior({ robe: P.green, trim: P.ochre, hatColor: P.ochre, cloak: undefined, scale: 0.98, mood: 'smug', ...o });
export const yigit = (i: number, o: HumanOpts = {}) => warrior({ robe: P.white, trim: [P.teal, P.indigo, P.red, P.green][i % 4], hatColor: [P.teal, P.indigo, P.red, P.green][i % 4], cloak: undefined, scale: 1, ...o });

/** Bezirgân: sarıklı, uzun kaftanlı tüccar. */
export const bezirgan = (i: number, o: HumanOpts = {}) => villager(5, { robe: i ? P.crimson : P.ochre, trim: P.indigo, hat: 'turban', hatColor: P.cream, beard: i ? P.white : P.black, long: true, ...o });

/** Kâfir askeri ya da beyi: koyu zırh renkli, sivri başlıklı. */
export const kafir = (i: number, o: HumanOpts = {}) => warrior({ robe: [P.stoneDark, P.steel, P.darkBrown][i % 3], trim: P.stone, hat: 'kalpak', hatColor: P.steel, beard: [P.brown, P.black, 0xc9a24a][i % 3], hair: undefined, cloak: undefined, mood: 'angry', scale: 1.05, ...o });

/** Kâfir beyinin kızı: başı açık, sarı saçlı. */
export const beyKizi = (o: HumanOpts = {}) => lady({ robe: P.indigo, trim: P.gold, hat: 'none', hair: P.ochre, eyes: 0x3f6a7a, ...o });
