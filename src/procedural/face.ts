import * as THREE from 'three';
import { noInk } from '../engine/ink';
import { dir, headPoint } from './head';
import { toonRamp } from './palette';

/**
 * Çizilmiş yüz: gözler, kaşlar, bıyık ve ağız 2B olarak (eğrilerle) bir tuvale çizilir,
 * başın ön yüzünü izleyen ince bir yamaya doku olarak giydirilir. İfade değişince yeniden çizilir.
 * Çizim birimi radyandır: x = yaw (sağ-sol), y = pitch (yukarı-aşağı); (0, 0) burun kökünün hizasıdır.
 */

const YAW = 0.98;
const P0 = -0.9;
const P1 = 0.62;
const SIZE = 384;

export type Mood = 'neutral' | 'happy' | 'smug' | 'angry' | 'sad' | 'fear';

/** Yüz tipi: göz büyüklüğü, kaş kalınlığı, kirpik, dudak ve kırışıklıkları belirler. */
export type FaceKind = 'man' | 'woman' | 'child' | 'elder' | 'grim';

export interface FaceStyle {
  kind: FaceKind;
  skin: number;
  brow: number;
  iris?: number;
  moustache?: number;
  blush?: boolean;
  /** true ise ağız çizilmez (sakal örtüyor). */
  noMouth?: boolean;
}

interface KindDef {
  eye: number;
  brow: number;
  mouth: number;
  lashes: number;
  lips: boolean;
  wrinkles: boolean;
  /** İkinci, büyük ışıltı: daha "anime" bir bakış. */
  sparkle: boolean;
}

const KINDS: Record<FaceKind, KindDef> = {
  man: { eye: 1.42, brow: 1, mouth: 1.5, lashes: 0, lips: false, wrinkles: false, sparkle: false },
  woman: { eye: 1.62, brow: 0.6, mouth: 1.35, lashes: 3, lips: true, wrinkles: false, sparkle: true },
  child: { eye: 1.8, brow: 0.55, mouth: 1.3, lashes: 0, lips: false, wrinkles: false, sparkle: true },
  elder: { eye: 1.22, brow: 1.5, mouth: 1.4, lashes: 0, lips: false, wrinkles: true, sparkle: false },
  grim: { eye: 1.25, brow: 1.7, mouth: 1.4, lashes: 0, lips: false, wrinkles: true, sparkle: false },
};

let patchGeo: THREE.BufferGeometry | undefined;

/** Başın ön yüzünü izleyen yama; UV'ler yaw/pitch ile doğrusal. */
function patchGeometry(): THREE.BufferGeometry {
  if (!patchGeo) {
    const nx = 30;
    const ny = 26;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const d = dir(-YAW + (2 * YAW * i) / nx, P0 + ((P1 - P0) * j) / ny);
        const p = headPoint(d).addScaledVector(d, 0.004);
        pos.push(p.x, p.y, p.z);
        uv.push(i / nx, j / ny);
        if (i < nx && j < ny) {
          const a = j * (nx + 1) + i;
          idx.push(a, a + 1, a + nx + 1, a + 1, a + nx + 2, a + nx + 1);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    patchGeo = g;
  }
  return patchGeo;
}

const css = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
const shade = (n: number, k: number) => css(new THREE.Color(n).multiplyScalar(k).getHex());

type Ctx = CanvasRenderingContext2D;
const INK = '#1c120c';

/** Gözün dış çizgisi; +x gözün dış köşesidir (sağ ve sol göz aynalanarak çizilir). */
function eyePath(c: Ctx): void {
  c.beginPath();
  c.moveTo(-0.17, -0.025);
  c.bezierCurveTo(-0.13, 0.13, 0.09, 0.165, 0.185, 0.035);
  c.bezierCurveTo(0.13, -0.12, -0.08, -0.14, -0.17, -0.025);
}

function upperLid(c: Ctx): void {
  c.beginPath();
  c.moveTo(-0.175, -0.03);
  c.bezierCurveTo(-0.13, 0.13, 0.09, 0.165, 0.185, 0.035);
}

/** Kaş ve göz kapağının ifadeye göre eğimi; artı değer iç ucu aşağı indirir (çatık). */
const LOOK: Record<Mood, { brow: number; lift: number; lid: number }> = {
  neutral: { brow: 0, lift: 0, lid: 0 },
  happy: { brow: -0.1, lift: 0.03, lid: 0 },
  smug: { brow: 0.22, lift: -0.005, lid: 0.35 },
  angry: { brow: 0.42, lift: -0.035, lid: 0.6 },
  sad: { brow: -0.38, lift: 0.01, lid: -0.5 },
  fear: { brow: -0.25, lift: 0.06, lid: 0 },
};

function drawEye(c: Ctx, s: FaceStyle, k: KindDef, mood: Mood, blink: boolean): void {
  const skin = css(s.skin);
  const look = LOOK[mood];
  const grim = s.kind === 'grim';
  c.lineCap = 'round';
  c.lineJoin = 'round';

  if (grim) {
    // Göz çevresinde koyu halka: çukur, gölgeli bir bakış.
    const g = c.createRadialGradient(0, 0.02, 0.05, 0, 0.02, 0.3);
    g.addColorStop(0, 'rgba(40, 20, 50, 0.6)');
    g.addColorStop(1, 'rgba(40, 20, 50, 0)');
    c.fillStyle = g;
    c.fillRect(-0.32, -0.3, 0.64, 0.64);
  }

  if (blink) {
    c.strokeStyle = INK;
    c.lineWidth = 0.032;
    c.beginPath();
    c.moveTo(-0.17, 0.0);
    c.quadraticCurveTo(0.0, -0.085, 0.185, 0.02);
    c.stroke();
    for (let i = 0; i < k.lashes; i++) {
      const x = 0.05 + i * 0.055;
      c.lineWidth = 0.014;
      c.beginPath();
      c.moveTo(x, -0.035 + i * 0.02);
      c.lineTo(x + 0.03, -0.085 + i * 0.02);
      c.stroke();
    }
  } else {
    eyePath(c);
    c.fillStyle = grim ? '#e9e4de' : '#fffaf1';
    c.fill();
    c.save();
    eyePath(c);
    c.clip();
    // İris: kenarı koyu, alt yarısı aydınlık.
    const iris = s.iris ?? 0x6b4423;
    const g = c.createRadialGradient(0.0, -0.04, 0.01, 0.0, 0.0, 0.125);
    g.addColorStop(0, shade(iris, 1.6));
    g.addColorStop(0.6, css(iris));
    g.addColorStop(1, shade(iris, 0.3));
    c.fillStyle = g;
    c.beginPath();
    c.arc(0.0, 0.0, 0.118, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#120a06';
    c.beginPath();
    c.arc(0.0, 0.005, grim ? 0.035 : 0.052, 0, Math.PI * 2);
    c.fill();
    // Üst kapağın göze düşürdüğü gölge.
    c.fillStyle = 'rgba(30, 14, 8, 0.28)';
    c.fillRect(-0.25, 0.075, 0.5, 0.2);
    // Işıltılar.
    if (!grim) {
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(-0.04, 0.055, k.sparkle ? 0.044 : 0.036, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(0.05, -0.05, k.sparkle ? 0.024 : 0.017, 0, Math.PI * 2);
      c.fill();
    }
    // İfadeye göre inen kapak: çatık bakışta iç uç, üzgün bakışta dış uç düşer.
    if (look.lid !== 0) {
      const inner = 0.13 - Math.max(0, look.lid) * 0.13;
      const outer = 0.14 + Math.min(0, look.lid) * 0.2;
      c.fillStyle = skin;
      c.beginPath();
      c.moveTo(-0.26, inner);
      c.lineTo(0.26, outer);
      c.lineTo(0.26, 0.3);
      c.lineTo(-0.26, 0.3);
      c.closePath();
      c.fill();
      c.strokeStyle = INK;
      c.lineWidth = 0.026;
      c.beginPath();
      c.moveTo(-0.26, inner);
      c.lineTo(0.26, outer);
      c.stroke();
    }
    c.restore();
    // Üst kirpik çizgisi ve dış köşede kirpikler.
    c.strokeStyle = INK;
    c.lineWidth = k.lashes ? 0.038 : 0.03;
    upperLid(c);
    c.stroke();
    c.lineWidth = 0.022;
    c.beginPath();
    c.moveTo(0.175, 0.045);
    c.quadraticCurveTo(0.215, 0.06, 0.24, 0.105);
    c.stroke();
    for (let i = 1; i < k.lashes; i++) {
      c.lineWidth = 0.016;
      c.beginPath();
      c.moveTo(0.16 - i * 0.05, 0.075 + i * 0.022);
      c.quadraticCurveTo(0.19 - i * 0.045, 0.12 + i * 0.02, 0.215 - i * 0.04, 0.155 + i * 0.015);
      c.stroke();
    }
    // Alt çizgi ve kapak kıvrımı: ince, soluk.
    c.strokeStyle = 'rgba(60, 30, 18, 0.45)';
    c.lineWidth = 0.011;
    c.beginPath();
    c.moveTo(0.16, -0.02);
    c.bezierCurveTo(0.1, -0.115, -0.06, -0.13, -0.13, -0.075);
    c.stroke();
    c.beginPath();
    c.moveTo(-0.12, 0.13);
    c.quadraticCurveTo(0.03, 0.2, 0.17, 0.115);
    c.stroke();
  }

  if (k.wrinkles) {
    // Göz altı torbası ve kaz ayakları.
    c.strokeStyle = shade(s.skin, 0.6);
    c.lineWidth = 0.012;
    c.beginPath();
    c.moveTo(-0.12, -0.14);
    c.quadraticCurveTo(0.03, -0.2, 0.16, -0.12);
    c.stroke();
    for (const dy of [0.04, -0.02, -0.08]) {
      c.beginPath();
      c.moveTo(0.22, 0.0 + dy * 0.4);
      c.lineTo(0.285, dy);
      c.stroke();
    }
  }

  // Kaş: iç ucu kalın, dış ucu sivri.
  c.save();
  c.translate(0.0, 0.25 + look.lift);
  c.rotate(look.brow);
  c.scale(1, k.brow);
  c.fillStyle = css(s.brow);
  c.beginPath();
  c.moveTo(-0.2, -0.045);
  c.quadraticCurveTo(-0.215, 0.0, -0.19, 0.03);
  c.quadraticCurveTo(0.02, 0.085, 0.235, -0.015);
  c.quadraticCurveTo(0.03, 0.02, -0.2, -0.045);
  c.fill();
  c.restore();
}

function drawMouth(c: Ctx, s: FaceStyle, k: KindDef, mood: Mood): void {
  const y = s.moustache !== undefined ? -0.67 : -0.58;
  const lip = k.lips ? '#a8362f' : '#6e2a22';
  c.save();
  c.translate(0, y);
  c.scale(k.mouth, k.mouth);
  c.lineCap = 'round';
  c.strokeStyle = k.lips ? '#7a221e' : lip;
  c.lineWidth = 0.02;
  const open = (path: () => void) => {
    path();
    c.fillStyle = '#4a1714';
    c.fill();
    c.save();
    path();
    c.clip();
    c.fillStyle = '#d2625a'; // dil
    c.beginPath();
    c.ellipse(0, -0.12, 0.09, 0.06, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fffaf1'; // dişler
    c.fillRect(-0.2, 0.0, 0.4, 0.05);
    c.restore();
    c.lineWidth = k.lips ? 0.028 : 0.02;
    c.strokeStyle = lip;
    path();
    c.stroke();
  };
  if (mood === 'happy') {
    open(() => {
      c.beginPath();
      c.moveTo(-0.12, 0.03);
      c.quadraticCurveTo(0, 0.0, 0.12, 0.03);
      c.bezierCurveTo(0.1, -0.13, -0.1, -0.13, -0.12, 0.03);
    });
  } else if (mood === 'fear') {
    open(() => {
      c.beginPath();
      c.ellipse(0, -0.02, 0.06, 0.08, 0, 0, Math.PI * 2);
    });
  } else if (mood === 'angry' && !k.lips) {
    open(() => {
      c.beginPath();
      c.moveTo(-0.1, -0.04);
      c.quadraticCurveTo(0, 0.07, 0.1, -0.04);
      c.quadraticCurveTo(0, -0.02, -0.1, -0.04);
    });
  } else {
    // Kapalı ağız: uçların yönü ifadeyi verir (yukarı: gülümseme, aşağı: somurtma).
    const bend = mood === 'sad' || mood === 'angry' ? 1 : -1;
    if (k.lips) {
      // Dolgun dudak: üstte yay biçimli çift tepe, altta tek kavis.
      c.fillStyle = lip;
      c.beginPath();
      c.moveTo(-0.085, -0.012 * bend);
      c.quadraticCurveTo(-0.04, 0.05, 0, 0.022);
      c.quadraticCurveTo(0.04, 0.05, 0.085, -0.012 * bend);
      c.quadraticCurveTo(0, -0.085, -0.085, -0.012 * bend);
      c.fill();
    }
    c.beginPath();
    if (mood === 'smug') {
      c.moveTo(-0.09, -0.01);
      c.bezierCurveTo(-0.03, -0.055, 0.06, -0.05, 0.125, 0.04);
    } else {
      c.moveTo(-0.08, -0.016 * bend);
      c.quadraticCurveTo(0, 0.04 * bend - (k.lips ? 0.02 : 0), 0.08, -0.016 * bend);
    }
    c.stroke();
  }
  c.restore();
}

function draw(c: Ctx, s: FaceStyle, mood: Mood, blink: boolean): void {
  const k = KINDS[s.kind];
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, SIZE, SIZE);
  // Radyan birimine geç: x sağa, y yukarı.
  c.setTransform(SIZE / (2 * YAW), 0, 0, -SIZE / (P1 - P0), SIZE / 2, (SIZE * P1) / (P1 - P0));

  if (s.blush) {
    for (const sx of [-1, 1]) {
      const b = c.createRadialGradient(sx * 0.62, -0.3, 0, sx * 0.62, -0.3, 0.2);
      b.addColorStop(0, 'rgba(232, 108, 92, 0.62)');
      b.addColorStop(1, 'rgba(232, 108, 92, 0)');
      c.fillStyle = b;
      c.fillRect(sx * 0.62 - 0.2, -0.5, 0.4, 0.4);
    }
  }

  for (const sx of [-1, 1]) {
    c.save();
    c.translate(sx * 0.46, 0.035);
    c.scale(sx * k.eye, k.eye);
    drawEye(c, s, k, mood, blink);
    c.restore();
  }

  c.lineCap = 'round';
  c.strokeStyle = shade(s.skin, 0.62);
  if (k.wrinkles) {
    // Alın çizgileri ve burundan ağza inen çizgiler.
    c.lineWidth = 0.013;
    for (const [py, w] of [[0.5, 0.3], [0.56, 0.22]]) {
      c.beginPath();
      c.moveTo(-w, py);
      c.quadraticCurveTo(0, py + 0.03, w, py);
      c.stroke();
    }
    for (const sx of [-1, 1]) {
      c.beginPath();
      c.moveTo(sx * 0.17, -0.3);
      c.quadraticCurveTo(sx * 0.27, -0.42, sx * 0.24, -0.6);
      c.stroke();
    }
  }
  // Burun altı: iki küçük gölge.
  c.lineWidth = 0.016;
  for (const sx of [-1, 1]) {
    c.beginPath();
    c.moveTo(sx * 0.03, -0.335);
    c.quadraticCurveTo(sx * 0.075, -0.36, sx * 0.105, -0.315);
    c.stroke();
  }

  if (s.moustache !== undefined) {
    c.fillStyle = css(s.moustache);
    c.save();
    c.translate(0, -0.4);
    c.scale(1.45, 1.45);
    c.translate(0, 0.4);
    for (const sx of [-1, 1]) {
      c.beginPath();
      c.moveTo(0, -0.385);
      c.bezierCurveTo(sx * 0.1, -0.35, sx * 0.2, -0.4, sx * 0.3, -0.37);
      c.bezierCurveTo(sx * 0.22, -0.5, sx * 0.08, -0.5, 0, -0.45);
      c.closePath();
      c.fill();
    }
    c.restore();
  }
  if (!s.noMouth) drawMouth(c, s, k, mood);
}

/** Bir figürün çizilmiş yüzü: yama, tuval ve doku. */
export class DrawnFace {
  readonly mesh: THREE.Mesh;
  private ctx: Ctx;
  private texture: THREE.CanvasTexture;
  private mood: Mood = 'neutral';
  private blink = false;

  constructor(private style: FaceStyle) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    this.ctx = canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    const material = new THREE.MeshToonMaterial({
      map: this.texture,
      gradientMap: toonRamp(),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    this.mesh = noInk(new THREE.Mesh(patchGeometry(), material));
    this.mesh.receiveShadow = true;
    this.redraw();
  }

  set(mood: Mood, blink: boolean): void {
    if (mood === this.mood && blink === this.blink) return;
    this.mood = mood;
    this.blink = blink;
    this.redraw();
  }

  private redraw(): void {
    draw(this.ctx, this.style, this.mood, this.blink);
    this.texture.needsUpdate = true;
  }
}
