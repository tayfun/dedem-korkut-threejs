import * as THREE from 'three';
import type { Stage } from '../../engine/stage';
import { child, elderMan, villager, warrior } from '../../procedural/cast';
import { Human, type HumanOpts } from '../../procedural/human';
import { P, mat, mesh, rng } from '../../procedural/palette';
import { addFire, staff } from '../../procedural/props';
import { placeTent, reeds, steppeSet } from '../../procedural/sets';
import type { Sky, SkyPreset } from '../../procedural/sky';

/** Basat ile Tepegöz hikâyesine özel mekânlar ve kişiler: oba, Uzun Pınar, Salahana Kayası; Basat, Aruz, Tepegöz, peri. */

/* ----------------------------- Mekânlar ---------------------------- */

/** Oğuz obası: üç otağ ve bir ateş. */
export function campSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 21);
  placeTent(stage, -7, -7, 0.3, P.white, P.red, 1.2);
  placeTent(stage, 2.5, -9, -0.1, P.cream, P.indigo, 1.4);
  placeTent(stage, 11, -6.5, -0.6, P.white, P.teal, 1.1);
  addFire(stage, 6, -1.5, 1);
  return s;
}

export const POND = { x: 2, z: -3, r: 3.2 };

/** Uzun Pınar: bozkırda küçük bir su, çevresinde taşlar ve kamışlar. */
export function pinarSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 31);
  const water = mesh(new THREE.CircleGeometry(POND.r, 20), mat(P.water), false);
  water.rotation.x = -Math.PI / 2;
  water.position.set(POND.x, 0.04, POND.z);
  water.receiveShadow = true;
  stage.add(water);
  const r = rng(12);
  const rock = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + r() * 0.3;
    const sc = 0.25 + r() * 0.3;
    const m = mesh(rock, mat(i % 2 ? P.stone : P.stoneDark));
    m.position.set(POND.x + Math.cos(a) * (POND.r + 0.1), sc * 0.3, POND.z + Math.sin(a) * (POND.r + 0.1));
    m.scale.set(sc * 1.3, sc * 0.8, sc);
    m.rotation.y = r() * 6;
    stage.add(m);
  }
  reeds(stage, POND.x + 3.4, POND.z - 2.2, 1.6, 26, 3);
  reeds(stage, POND.x - 2.6, POND.z - 3, 1.4, 20, 4);
  stage.keepClear(POND.x, POND.z, POND.r + 0.6);
  return s;
}

export const CAVE = { x: 0, z: -6 };
export const FIRE = { x: 7, z: 1 };

/** Salahana Kayası: kaya yığını, önünde karanlık bir mağara ağzı ve bir ocak. */
export function kayaSet(stage: Stage, sky: SkyPreset): Sky {
  const s = steppeSet(stage, sky, 41);
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const rocks: [number, number, number, number, number, number][] = [
    // x, y, z, en, boy, derinlik
    [0, 7.5, -12, 9, 5, 6],
    [-8, 3, -11.5, 6, 6, 5],
    [8.5, 3.5, -11.5, 6.5, 6.5, 5],
    [-4.2, 2.6, -7.2, 2.2, 5.2, 2.4],
    [4.2, 2.8, -7.2, 2.2, 5.6, 2.4],
    [0, 6.3, -7.4, 4.8, 1.6, 2.6],
    [-14, 1.2, -9, 4, 3, 3.5],
    [14, 1.4, -9.5, 4, 3.2, 3.5],
    [0, 3, -13, 7, 6, 4],
  ];
  rocks.forEach(([x, y, z, w, h, d], i) => {
    const m = mesh(geo, mat(i % 2 ? P.stone : P.stoneDark));
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.rotation.set(i * 0.7, i * 1.3, i * 0.4);
    stage.add(m);
  });
  // Mağaranın karanlığı: kapının hemen ardında siyah bir perde.
  const dark = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6), new THREE.MeshBasicMaterial({ color: 0x0c0806 }));
  dark.position.set(CAVE.x, 3, CAVE.z - 1.6);
  stage.add(dark);
  for (let x = -16; x <= 16; x += 4) stage.keepClear(x, -10, 5);
  addFire(stage, FIRE.x, FIRE.z, 1.1);
  return s;
}

/** Kümbet: kubbeli, taş bir hazine yapısı. Kapısı +z yönüne bakar. */
export function kumbet(): THREE.Group {
  const g = new THREE.Group();
  const wall = mesh(new THREE.CylinderGeometry(2.1, 2.3, 3.2, 8), mat(P.sand));
  wall.position.y = 1.6;
  const band = mesh(new THREE.CylinderGeometry(2.16, 2.16, 0.3, 8), mat(P.teal));
  band.position.y = 3.0;
  const roof = mesh(new THREE.ConeGeometry(2.4, 2.6, 8), mat(P.stoneDark));
  roof.position.y = 4.5;
  const door = mesh(new THREE.BoxGeometry(1.1, 2, 0.2), mat(P.darkBrown));
  door.position.set(0, 1, 2.14);
  g.add(wall, band, roof, door);
  return g;
}

/** Yığınak: perinin bıraktığı, parıldayan biçimsiz küme. */
export function yiginak(stage: Stage): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({ color: P.cream, emissive: P.ochre, emissiveIntensity: 0.7, flatShading: true, roughness: 0.6 });
  const m = mesh(new THREE.IcosahedronGeometry(0.5, 1), material);
  m.scale.y = 0.78;
  if (!stage.reducedMotion) stage.onTick((t) => (material.emissiveIntensity = 0.6 + Math.sin(t * 5) * 0.35));
  return m;
}

/* ------------------------------ Kişiler ---------------------------- */

/** Basat: Aruz Koca'nın oğlu; genç, bıyıksız yiğit. */
export const basat = (o: HumanOpts = {}) => warrior({ robe: P.teal, hatColor: P.red, cloak: P.crimson, moustache: undefined, ...o });

/** Aslan yatağında büyüyen oğlan. */
export const wildBoy = (o: HumanOpts = {}) => child(0, { hat: 'none', robe: P.earth, trim: P.brown, hair: P.black, blush: false, ...o });

/** At ağızlı Aruz Koca: Basat'ın babası. */
export const aruz = (o: HumanOpts = {}) => elderMan({ robe: P.crimson, trim: P.ochre, hatColor: P.brown, scale: 1.12, cloak: P.brown, ...o });

export const bayindir = () => warrior({ robe: P.indigo, trim: P.gold, hat: 'kalpak', hatColor: P.ochre, beard: P.black, cloak: P.crimson });
export const kazan = (o: HumanOpts = {}) => warrior({ robe: P.crimson, hatColor: P.ochre, cloak: P.teal, ...o });

/** Yünlü Koca ile Yapağılı Koca: Tepegöz'e aşçı verilen iki yaşlı. */
export const koca = (i: number) => elderMan({ robe: i ? P.stoneDark : P.green, hatColor: i ? P.red : P.brown, mood: 'sad' });

/** Konur Koca Sarı Çoban: sarı sakallı, kepenekli, değnekli. */
export function shepherd(): Human {
  const s = villager(1, { beard: 0xc9a24a, hair: 0xc9a24a, cloak: P.cream, hatColor: P.brown });
  s.handR.add(staff());
  s.armSwing = 0.3;
  return s;
}

/** Peri kızı: ak giysili, ak kanatlı. */
export const peri = () => new Human({ robe: P.white, trim: P.gold, hat: 'none', hair: P.ochre, long: true, wings: P.white, blush: true, face: 'woman', skin: 0xf0d2b4, eyes: 0x3f7a8a });

/** Tepegöz: tepesinde tek gözü olan dev. `scale` yaşına göre değişir (bebek 0,5; yetişkin 2,6). */
export const tepegoz = (scale = 2.6, o: HumanOpts = {}) =>
  new Human({ robe: P.earth, trim: P.stoneDark, hat: 'none', hair: P.black, skin: P.ogre, face: 'cyclops', eyes: 0xc9a020, mood: 'angry', scale, ...o });
