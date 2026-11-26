import * as THREE from 'three';
import type { Stage } from '../../engine/stage';
import { elderMan, lady, villager, warrior } from '../../procedural/cast';
import type { Human, HumanOpts } from '../../procedural/human';
import { P, mat, mesh, rng } from '../../procedural/palette';
import { addBanner, addFire } from '../../procedural/props';
import { placeTent, steppeSet } from '../../procedural/sets';
import type { Sky, SkyPreset } from '../../procedural/sky';
import { tree } from '../../procedural/terrain';

/** Boğaç Han hikâyesine özel mekânlar ve kişiler: Bayındır Han'ın toyu, Dirse Han'ın yurdu, Kazılık Dağı, namertlerin konağı. */

/* ----------------------------- Mekânlar ---------------------------- */

export const TENTS = { ak: [-10, -8] as const, kizil: [0, -10] as const, kara: [10, -8] as const };

/** Bayındır Han'ın toyu: ak, kızıl ve kara otağ; önlerinde geniş bir meydan. */
export function toySet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 51);
  placeTent(stage, ...TENTS.ak, 0.25, P.white, P.ochre, 1.5);
  placeTent(stage, ...TENTS.kizil, 0, P.red, P.ochre, 1.5);
  placeTent(stage, ...TENTS.kara, -0.25, P.black, P.stoneDark, 1.5);
  addBanner(stage, -15, -5, P.red, 4.2);
  addBanner(stage, 15, -5, P.red, 4.2);
  return s;
}

/** Dirse Han'ın yurdu: büyük bir otağ, yanında iki küçük çadır ve ateş. */
export function homeSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 61);
  placeTent(stage, 0, -7, 0, P.cream, P.indigo, 1.5);
  placeTent(stage, -9, -9, 0.4, P.white, P.red, 1.1);
  placeTent(stage, 9.5, -8.5, -0.5, P.white, P.teal, 1.1);
  addFire(stage, 6, 0, 1);
  return s;
}

/** Kazılık Dağı: ağaçlık, kayalık av yeri. */
export function dagSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 71);
  const r = rng(8);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + r() * 0.4;
    const d = 13 + r() * 9;
    const t = tree(1.1 + r() * 0.9);
    t.position.set(Math.cos(a) * d * 1.2, 0, -Math.abs(Math.sin(a)) * d * 0.7 - 6); // ağaçlar geride kalır, olayı örtmez
    stage.add(t);
    stage.keepClear(t.position.x, t.position.z, 1);
  }
  const geo = new THREE.DodecahedronGeometry(1, 0);
  for (const [x, z, sc] of [[-12, -9, 3], [-7, -12, 4], [9, -11, 3.6], [14, -8, 2.6]]) {
    const m = mesh(geo, mat(P.stoneDark));
    m.position.set(x, sc * 0.5, z);
    m.scale.set(sc, sc * 0.8, sc * 0.8);
    m.rotation.set(x, z, 0.4);
    stage.add(m);
    stage.keepClear(x, z, sc);
  }
  return s;
}

/** Namertlerin konağı: iki küçük koyu çadır ve bir ateş. */
export function konakSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 81);
  placeTent(stage, -6, -7, 0.3, P.stoneDark, P.crimson, 1);
  placeTent(stage, 3, -8.5, -0.2, P.brown, P.black, 1);
  addFire(stage, 0, 0, 1.1);
  return s;
}

/** Dağ çiçekleri: bir alana serpiştirilmiş küçük renkli çiçekler. */
export function flowers(stage: Stage, x: number, z: number, radius: number, count: number, seed = 4): void {
  const r = rng(seed);
  const stem = new THREE.CylinderGeometry(0.012, 0.012, 0.3, 3);
  const bloom = new THREE.IcosahedronGeometry(0.07, 0);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * radius;
    const g = new THREE.Group();
    g.position.set(x + Math.cos(a) * d, 0, z + Math.sin(a) * d);
    const st = mesh(stem, mat(P.green), false);
    st.position.y = 0.15;
    const bl = mesh(bloom, mat([P.red, P.ochre, P.white, P.crimson][i % 4]), false);
    bl.position.y = 0.33;
    g.add(st, bl);
    stage.add(g);
  }
}

/** Yere serili sofra: kilim üstünde tabaklar. */
export function sofra(stage: Stage, x: number, z: number, color: number = P.crimson): void {
  const rug = mesh(new THREE.BoxGeometry(3.2, 0.05, 2), mat(color));
  rug.position.set(x, 0.03, z);
  stage.add(rug);
  for (const dx of [-1, 0, 1]) {
    const dish = mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.1, 8), mat(P.ochre));
    dish.position.set(x + dx, 0.11, z);
    const food = mesh(new THREE.IcosahedronGeometry(0.15, 0), mat(P.brown));
    food.position.set(x + dx, 0.2, z);
    stage.add(dish);
    stage.add(food);
  }
  stage.keepClear(x, z, 2.2);
}

/* ------------------------------ Kişiler ---------------------------- */

export const bayindir = () => warrior({ robe: P.indigo, trim: P.gold, hat: 'kalpak', hatColor: P.ochre, beard: P.black, cloak: P.crimson });

/** Dirse Han: orta yaşlı, kara sakallı bey. */
export const dirse = (o: HumanOpts = {}) => warrior({ robe: P.green, trim: P.ochre, hatColor: P.crimson, beard: P.black, cloak: P.brown, ...o });

export const hatun = (o: HumanOpts = {}) => lady({ robe: P.crimson, trim: P.gold, hatColor: P.white, ...o });

/** Boğaç: on beş yaşında, bıyıksız oğlan; `scale` ile çocukluğu da kurulur. */
export const bogac = (o: HumanOpts = {}) => warrior({ robe: P.ochre, trim: P.red, hatColor: P.teal, moustache: undefined, cloak: undefined, scale: 0.95, ...o });

/** Kırk namertten biri: koyu giysili, kara sakallı. */
export const namert = (i: number, o: HumanOpts = {}) =>
  villager(i, { robe: [P.stoneDark, P.black, P.darkBrown, P.crimson][i % 4], trim: P.stone, hat: 'bork', hatColor: P.black, beard: P.black, long: false, hair: undefined, blush: false, face: 'man', mood: 'smug', ...o });

/** Boğaç'ın kırk yiğidinden biri. */
export const yigit = (i: number) => warrior({ robe: [P.teal, P.indigo, P.red, P.green][i % 4], cloak: undefined, scale: 1 });

/** Kırk ince belli kızdan biri. */
export const kiz = (i: number) => lady({ robe: [P.teal, P.ochre, P.indigo, P.green][i % 4], hatColor: [P.cream, P.white][i % 2] });

/** Boz atlı Hızır. */
export const hizir = () => elderMan({ robe: P.green, trim: P.gold, hat: 'turban', hatColor: P.white, cloak: P.white, mood: 'happy', scale: 1.1 });

/** Elleri ardına bağlı duruş. */
export function bound(m: Human): Human {
  m.armL.rotation.set(0.7, 0, 0.5);
  m.armR.rotation.set(0.7, 0, -0.5);
  m.head.rotation.x = 0.35;
  m.armSwing = 0;
  return m;
}
