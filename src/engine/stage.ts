import * as THREE from 'three';
import { isSharedMaterial } from '../procedural/palette';
import { InkPipeline } from './ink';

export type TickFn = (t: number, dt: number) => void;
export type GroundFn = (x: number, z: number) => number;

/** Sahnede yürüyen, zemine basan her şeyin (insan, at) ortak tabanı. */
export class Mover {
  group = new THREE.Group();
  /** 0: duruyor, 1: tam adımla yürüyor. */
  walkAmp = 0;
  walkSpeed = 8;
  /** Zeminden yükseklik farkı (oturma, diz çökme için). */
  yOffset = 0;
  /** true ise yükseklik zemine bağlanmaz (uçan ya da binili figürler). */
  freeY = false;
  /** Zaman çizelgesi kurulurken izlenen mantıksal konum. */
  plan = { x: 0, z: 0, ry: 0 };
  update(_t: number, _dt: number): void {}
}

/** Renderer, kamera ve kare döngüsünü yönetir; her sahne için temizlenip yeniden kurulur. */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1200);
  readonly look = new THREE.Vector3(0, 1, 0);
  readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root = new THREE.Group();
  ground: GroundFn = () => 0;

  private ticks: TickFn[] = [];
  movers: Mover[] = [];
  private zones: [number, number, number][] = [];
  private pending: (() => void)[] = [];
  private last = performance.now();
  private time = 0;
  private baseFov = 42;
  private inset = 0;
  private ink: InkPipeline;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.ink = new InkPipeline(this.renderer);
    this.scene.add(this.root);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.renderer.setAnimationLoop(() => this.frame());
  }

  /** Sahneyi boşaltır; paylaşılmayan geometri ve malzemeleri serbest bırakır. */
  clear(): void {
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mt of mats) if (!isSharedMaterial(mt)) mt.dispose();
      const l = o as THREE.DirectionalLight;
      if (l.isLight) l.dispose();
    });
    this.scene.remove(this.root);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.scene.fog = null;
    this.ticks = [];
    this.movers = [];
    this.zones = [];
    this.pending = [];
    this.ground = () => 0;
    this.time = 0;
  }

  add<T extends THREE.Object3D>(obj: T): T {
    this.root.add(obj);
    return obj;
  }

  /** Bir figürü kare döngüsüne bağlar; ebeveyni yoksa sahneye de ekler. */
  track<T extends Mover>(m: T, addToRoot = true): T {
    this.movers.push(m);
    if (addToRoot) this.root.add(m.group);
    return m;
  }

  /** Bir alanı (çadır, ateş, kilim) ot gibi serpiştirmelerden uzak tutar. */
  keepClear(x: number, z: number, r: number): void {
    this.zones.push([x, z, r]);
  }

  isClear(x: number, z: number): boolean {
    return this.zones.some(([zx, zz, r]) => (x - zx) ** 2 + (z - zz) ** 2 < r * r);
  }

  /** Sahne kurulumu bittikten sonra, ilk kareden önce çalışacak iş ekler. */
  afterBuild(fn: () => void): void {
    this.pending.push(fn);
  }

  /** Bekleyen kurulum işlerini hemen çalıştırır. */
  flush(): void {
    const jobs = this.pending;
    this.pending = [];
    for (const fn of jobs) fn();
  }

  onTick(fn: TickFn): void {
    this.ticks.push(fn);
  }

  setCamera(pos: [number, number, number], look: [number, number, number]): void {
    this.camera.position.set(...pos);
    this.look.set(...look);
  }

  /** Ekranın altını kaplayan metin panelinin yüksekliği; görüntü o kadar yukarı kaydırılır. */
  setBottomInset(px: number): void {
    if (px === this.inset) return;
    this.inset = px;
    this.resize();
  }

  private resize(w = window.innerWidth, h = window.innerHeight): void {
    this.renderer.setSize(w, h, false);
    this.ink.setSize(w, h, this.renderer.getPixelRatio());
    const aspect = w / h;
    this.camera.aspect = aspect;
    // Dar (dikey) ekranlarda yatay görüş alanını korumak için dikey açıyı büyüt.
    const ref = 1.5;
    if (aspect < ref) {
      const hTan = Math.tan(THREE.MathUtils.degToRad(this.baseFov / 2)) * ref;
      this.camera.fov = Math.min(78, THREE.MathUtils.radToDeg(2 * Math.atan(hTan / aspect)));
    } else {
      this.camera.fov = this.baseFov;
    }
    if (this.inset > 0) this.camera.setViewOffset(w, h, 0, Math.min(this.inset, h * 0.5) / 2, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.step(dt);
    this.ink.render(this.scene, this.camera);
  }

  private step(dt: number): void {
    this.time += dt;
    if (this.pending.length) this.flush();
    for (const m of this.movers) {
      if (!m.freeY) {
        const p = m.group.position;
        p.y = this.ground(p.x, p.z) + m.yOffset;
      }
      m.update(this.time, dt);
    }
    for (const fn of this.ticks) fn(this.time, dt);
    this.camera.lookAt(this.look);
  }

  /** Sahnenin o anki hâlini verilen boyutta bir resme (data URL) çevirir. */
  snapshot(w: number, h: number): string {
    const inset = this.inset;
    this.inset = 0;
    this.renderer.setPixelRatio(1);
    this.resize(w, h);
    this.step(0);
    this.ink.render(this.scene, this.camera);
    const url = this.canvas.toDataURL('image/jpeg', 0.86);
    this.inset = inset;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resize();
    return url;
  }
}
