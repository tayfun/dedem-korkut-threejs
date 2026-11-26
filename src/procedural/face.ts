import * as THREE from 'three';
import { noInk } from '../engine/ink';
import { type Mood, dir, headPoint } from './figures';
import { toonRamp } from './palette';

/**
 * Çizilmiş yüz: gözler, kaşlar, bıyık ve ağız 2B olarak (eğrilerle) bir tuvale çizilir,
 * başın ön yüzünü izleyen ince bir yamaya doku olarak giydirilir. İfade değişince yeniden çizilir.
 * Çizim birimi radyandır: x = yaw (sağ-sol), y = pitch (yukarı-aşağı); (0, 0) burun kökünün hizasıdır.
 */

const YAW = 0.98;
const P0 = -0.9;
const P1 = 0.62;
const SIZE = 512;

export interface FaceStyle {
  skin: number;
  brow: number;
  iris?: number;
  moustache?: number;
  blush?: boolean;
  /** true ise ağız çizilmez (sakal örtüyor). */
  noMouth?: boolean;
}

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

function drawEye(c: Ctx, s: FaceStyle, mood: Mood, blink: boolean): void {
  const ink = '#1c120c';
  const skin = css(s.skin);
  const look = LOOK[mood];
  c.lineCap = 'round';
  c.lineJoin = 'round';

  if (blink) {
    c.strokeStyle = ink;
    c.lineWidth = 0.032;
    c.beginPath();
    c.moveTo(-0.17, 0.0);
    c.quadraticCurveTo(0.0, -0.085, 0.185, 0.02);
    c.stroke();
  } else {
    eyePath(c);
    c.fillStyle = '#fffaf1';
    c.fill();
    c.save();
    eyePath(c);
    c.clip();
    // İris: kenarı koyu, alt yarısı aydınlık.
    const iris = s.iris ?? 0x6b4423;
    const g = c.createRadialGradient(0.0, -0.035, 0.01, 0.0, 0.0, 0.125);
    g.addColorStop(0, shade(iris, 1.5));
    g.addColorStop(0.65, css(iris));
    g.addColorStop(1, shade(iris, 0.35));
    c.fillStyle = g;
    c.beginPath();
    c.arc(0.0, 0.0, 0.118, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#120a06';
    c.beginPath();
    c.arc(0.0, 0.005, 0.052, 0, Math.PI * 2);
    c.fill();
    // Üst kapağın göze düşürdüğü gölge.
    c.fillStyle = 'rgba(30, 14, 8, 0.28)';
    c.fillRect(-0.25, 0.075, 0.5, 0.2);
    // Işıltılar.
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(-0.04, 0.055, 0.036, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(0.05, -0.05, 0.017, 0, Math.PI * 2);
    c.fill();
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
      c.strokeStyle = ink;
      c.lineWidth = 0.026;
      c.beginPath();
      c.moveTo(-0.26, inner);
      c.lineTo(0.26, outer);
      c.stroke();
    }
    c.restore();
    // Üst kirpik çizgisi ve dış köşede kirpik.
    c.strokeStyle = ink;
    c.lineWidth = 0.03;
    upperLid(c);
    c.stroke();
    c.lineWidth = 0.022;
    c.beginPath();
    c.moveTo(0.175, 0.045);
    c.quadraticCurveTo(0.215, 0.06, 0.235, 0.1);
    c.stroke();
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

  // Kaş: iç ucu kalın, dış ucu sivri.
  c.save();
  c.translate(0.0, 0.25 + look.lift);
  c.rotate(look.brow);
  c.fillStyle = css(s.brow);
  c.beginPath();
  c.moveTo(-0.2, -0.045);
  c.quadraticCurveTo(-0.215, 0.0, -0.19, 0.03);
  c.quadraticCurveTo(0.02, 0.085, 0.235, -0.015);
  c.quadraticCurveTo(0.03, 0.02, -0.2, -0.045);
  c.fill();
  c.restore();

  if (s.blush) {
    const b = c.createRadialGradient(0.2, -0.27, 0, 0.2, -0.27, 0.13);
    b.addColorStop(0, 'rgba(226, 110, 92, 0.6)');
    b.addColorStop(1, 'rgba(226, 110, 92, 0)');
    c.fillStyle = b;
    c.fillRect(0.0, -0.45, 0.4, 0.36);
  }
}

function drawMouth(c: Ctx, s: FaceStyle, mood: Mood): void {
  const y = s.moustache !== undefined ? -0.67 : -0.58;
  const lip = '#6e2a22';
  c.save();
  c.translate(0, y);
  c.scale(1.3, 1.3);
  c.lineCap = 'round';
  c.strokeStyle = lip;
  c.lineWidth = 0.02;
  const open = (path: () => void, teeth: boolean) => {
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
    if (teeth) {
      c.fillStyle = '#fffaf1';
      c.fillRect(-0.2, 0.0, 0.4, 0.05);
    }
    c.restore();
    path();
    c.stroke();
  };
  if (mood === 'happy') {
    open(() => {
      c.beginPath();
      c.moveTo(-0.12, 0.03);
      c.quadraticCurveTo(0, 0.0, 0.12, 0.03);
      c.bezierCurveTo(0.1, -0.13, -0.1, -0.13, -0.12, 0.03);
    }, true);
  } else if (mood === 'fear') {
    open(() => {
      c.beginPath();
      c.ellipse(0, -0.02, 0.06, 0.08, 0, 0, Math.PI * 2);
    }, true);
  } else if (mood === 'angry') {
    open(() => {
      c.beginPath();
      c.moveTo(-0.1, -0.04);
      c.quadraticCurveTo(0, 0.07, 0.1, -0.04);
      c.quadraticCurveTo(0, -0.02, -0.1, -0.04);
    }, true);
  } else if (mood === 'smug') {
    c.beginPath();
    c.moveTo(-0.09, -0.01);
    c.bezierCurveTo(-0.03, -0.055, 0.06, -0.05, 0.125, 0.04);
    c.stroke();
    c.beginPath();
    c.moveTo(0.115, 0.055);
    c.lineTo(0.14, 0.03);
    c.stroke();
  } else {
    const k = mood === 'sad' ? 1 : -1;
    c.beginPath();
    c.moveTo(-0.075, -0.02 * k);
    c.quadraticCurveTo(0, 0.045 * k, 0.075, -0.02 * k);
    c.stroke();
  }
  c.restore();
}

function draw(c: Ctx, s: FaceStyle, mood: Mood, blink: boolean): void {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, SIZE, SIZE);
  // Radyan birimine geç: x sağa, y yukarı.
  c.setTransform(SIZE / (2 * YAW), 0, 0, -SIZE / (P1 - P0), SIZE / 2, (SIZE * P1) / (P1 - P0));

  for (const sx of [-1, 1]) {
    c.save();
    c.translate(sx * 0.46, 0.035);
    c.scale(sx * 1.42, 1.42);
    drawEye(c, s, mood, blink);
    c.restore();
  }

  // Burun altı: iki küçük gölge.
  c.strokeStyle = shade(s.skin, 0.62);
  c.lineWidth = 0.016;
  c.lineCap = 'round';
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
  if (!s.noMouth) drawMouth(c, s, mood);
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
