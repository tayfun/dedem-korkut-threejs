import * as THREE from 'three';

/** Ortak renk paleti: minyatür ve kilim renklerinden esinlenmiştir. */
export const P = {
  grass: 0xb9a857,
  grassDark: 0x8f8f47,
  earth: 0x9a7448,
  sand: 0xcdb98c,
  stone: 0x9a9384,
  stoneDark: 0x6f6a60,
  red: 0xa8322a,
  crimson: 0x7a1f1f,
  indigo: 0x27406b,
  teal: 0x2f6f6a,
  ochre: 0xd49a2a,
  cream: 0xf0e2c0,
  white: 0xf5f0e6,
  black: 0x26211f,
  brown: 0x6b4428,
  darkBrown: 0x3d2817,
  skin: 0xd9a87c,
  pale: 0xcfc8c0,
  green: 0x4f6b3a,
  gold: 0xf2c230,
  steel: 0xb8bcc2,
  flame: 0xff8a1e,
  flameCore: 0xffd75a,
} as const;

const cache = new Map<string, THREE.Material>();
const shared = new Set<THREE.Material>();

/** Paylaşılan, düz gölgelendirmeli malzeme. Aynı renk için tek malzeme üretilir. */
export function mat(color: number, opts: { side?: THREE.Side; emissive?: number } = {}): THREE.MeshStandardMaterial {
  const key = `${color}|${opts.side ?? 0}|${opts.emissive ?? 0}`;
  let m = cache.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      flatShading: true,
      roughness: 0.92,
      metalness: 0,
      side: opts.side ?? THREE.FrontSide,
      emissive: opts.emissive ?? 0x000000,
    });
    cache.set(key, m);
    shared.add(m);
  }
  return m;
}

/** Işıktan etkilenmeyen, paylaşılan malzeme (alev, ışık hüzmesi vb.). */
export function glow(color: number, opacity = 1): THREE.MeshBasicMaterial {
  const key = `glow|${color}|${opacity}`;
  let m = cache.get(key) as THREE.MeshBasicMaterial | undefined;
  if (!m) {
    m = new THREE.MeshBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 1,
      blending: opacity < 1 ? THREE.AdditiveBlending : THREE.NormalBlending,
      side: THREE.DoubleSide,
      fog: opacity >= 1,
    });
    cache.set(key, m);
    shared.add(m);
  }
  return m;
}

export function isSharedMaterial(m: THREE.Material): boolean {
  return shared.has(m);
}

/** Tohumlu rastgele sayı üreteci; sahneler her açılışta aynı görünür. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mesh(geo: THREE.BufferGeometry, material: THREE.Material, shadow = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  return m;
}

const kilimCache = new Map<string, THREE.MeshStandardMaterial>();

/** Kilim şeridi: kodla çizilen zikzak ve baklava motifli, paylaşılan malzeme. */
export function kilim(a: number = P.red, b: number = P.ochre, c: number = P.indigo): THREE.MeshStandardMaterial {
  const key = `${a}|${b}|${c}`;
  let m = kilimCache.get(key);
  if (!m) {
    const cv = document.createElement('canvas');
    cv.width = 32;
    cv.height = 16;
    const g = cv.getContext('2d')!;
    const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
    g.fillStyle = hex(a);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle = hex(b);
    for (const x of [0, 16]) {
      g.beginPath();
      g.moveTo(x + 8, 1);
      g.lineTo(x + 15, 8);
      g.lineTo(x + 8, 15);
      g.lineTo(x + 1, 8);
      g.fill();
    }
    g.fillStyle = hex(c);
    for (const x of [0, 16]) {
      g.beginPath();
      g.moveTo(x + 8, 5);
      g.lineTo(x + 11, 8);
      g.lineTo(x + 8, 11);
      g.lineTo(x + 5, 8);
      g.fill();
    }
    g.fillRect(0, 0, 32, 1);
    g.fillRect(0, 15, 32, 1);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.set(8, 1);
    tex.magFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    m = new THREE.MeshStandardMaterial({ map: tex, flatShading: true, roughness: 0.92 });
    kilimCache.set(key, m);
    shared.add(m);
  }
  return m;
}
