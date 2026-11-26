import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import type { GroundFn, Stage } from '../engine/stage';
import { noInk } from '../engine/ink';
import { P, glow, mat, mesh, rng } from './palette';

/* ------------------------------------------------------------------ */
/* Gökyüzü ve ışık                                                     */
/* ------------------------------------------------------------------ */

export type SkyPreset = 'day' | 'dusk' | 'night' | 'dawn';

interface SkyDef {
  top: number;
  bottom: number;
  sun: number;
  sunI: number;
  hemiSky: number;
  hemiGround: number;
  hemiI: number;
  dir: [number, number, number];
  stars: number;
}

const SKIES: Record<SkyPreset, SkyDef> = {
  day: { top: 0x4d8fc7, bottom: 0xead9b4, sun: 0xfff1d6, sunI: 2.4, hemiSky: 0xcfe3f5, hemiGround: 0x8a7a55, hemiI: 1.0, dir: [30, 42, 22], stars: 0 },
  dawn: { top: 0x6f9fd0, bottom: 0xffd4a0, sun: 0xffe0b0, sunI: 2.1, hemiSky: 0xd8dcf0, hemiGround: 0x8a7050, hemiI: 0.95, dir: [36, 22, 18], stars: 0 },
  dusk: { top: 0x2d2c5c, bottom: 0xe7854a, sun: 0xffa868, sunI: 1.9, hemiSky: 0x8c82b8, hemiGround: 0x5a4030, hemiI: 0.75, dir: [-38, 16, 14], stars: 0.35 },
  night: { top: 0x0a0f24, bottom: 0x2b3560, sun: 0x9fb4e8, sunI: 1.1, hemiSky: 0x5065a8, hemiGround: 0x24243a, hemiI: 1.0, dir: [-24, 36, 18], stars: 1 },
};

export interface Sky {
  /** Gökyüzünü başka bir hâle yumuşakça geçirir (ör. akşamdan şafağa). */
  tweenTo(tl: gsap.core.Timeline, preset: SkyPreset, dur: number, at: number): void;
}

export function addSky(stage: Stage, preset: SkyPreset): Sky {
  const d = SKIES[preset];
  const uniforms = {
    top: { value: new THREE.Color(d.top) },
    bottom: { value: new THREE.Color(d.bottom) },
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(600, 24, 12),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vPos;
        void main(){
          float h = clamp(normalize(vPos).y * 2.4, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottom, top, pow(h, 0.65)), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  stage.add(dome);

  const fog = new THREE.Fog(d.bottom, 55, 230);
  stage.scene.fog = fog;

  const hemi = new THREE.HemisphereLight(d.hemiSky, d.hemiGround, d.hemiI);
  stage.add(hemi);

  const sun = new THREE.DirectionalLight(d.sun, d.sunI);
  sun.position.set(...d.dir);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera;
  sc.left = -32;
  sc.right = 32;
  sc.top = 32;
  sc.bottom = -32;
  sc.near = 1;
  sc.far = 160;
  sun.shadow.bias = -0.0015;
  sun.shadow.normalBias = 0.04;
  stage.add(sun);
  stage.add(sun.target);

  // Güneş ya da ay: ışığın geldiği yönde, uzakta parlak bir disk.
  const discMat = new THREE.MeshBasicMaterial({ color: d.sun, fog: false });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(preset === 'night' ? 12 : 20, 20), discMat);
  disc.position.set(...d.dir).normalize().multiplyScalar(520);
  disc.lookAt(0, 0, 0);
  stage.add(disc);

  // Yıldızlar
  const r = rng(7);
  const pts: number[] = [];
  for (let i = 0; i < 350; i++) {
    const th = r() * Math.PI * 2;
    const ph = Math.acos(r() * 0.92);
    pts.push(Math.sin(ph) * Math.cos(th) * 560, Math.cos(ph) * 560 + 20, Math.sin(ph) * Math.sin(th) * 560);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: d.stars, fog: false, depthWrite: false });
  stage.add(noInk(new THREE.Points(starGeo, starMat)));

  return {
    tweenTo(tl, to, dur, at) {
      const e = SKIES[to];
      const from = {
        top: uniforms.top.value.clone(),
        bottom: uniforms.bottom.value.clone(),
        sun: sun.color.clone(),
        hs: hemi.color.clone(),
        hg: hemi.groundColor.clone(),
        sunI: sun.intensity,
        hemiI: hemi.intensity,
        stars: starMat.opacity,
        dir: sun.position.clone(),
      };
      const target = {
        top: new THREE.Color(e.top),
        bottom: new THREE.Color(e.bottom),
        sun: new THREE.Color(e.sun),
        hs: new THREE.Color(e.hemiSky),
        hg: new THREE.Color(e.hemiGround),
        dir: new THREE.Vector3(...e.dir),
      };
      const k = { v: 0 };
      tl.to(
        k,
        {
          v: 1,
          duration: dur,
          ease: 'sine.inOut',
          onUpdate: () => {
            uniforms.top.value.lerpColors(from.top, target.top, k.v);
            uniforms.bottom.value.lerpColors(from.bottom, target.bottom, k.v);
            fog.color.copy(uniforms.bottom.value);
            sun.color.lerpColors(from.sun, target.sun, k.v);
            discMat.color.copy(sun.color);
            hemi.color.lerpColors(from.hs, target.hs, k.v);
            hemi.groundColor.lerpColors(from.hg, target.hg, k.v);
            sun.intensity = THREE.MathUtils.lerp(from.sunI, e.sunI, k.v);
            hemi.intensity = THREE.MathUtils.lerp(from.hemiI, e.hemiI, k.v);
            starMat.opacity = THREE.MathUtils.lerp(from.stars, e.stars, k.v);
            sun.position.lerpVectors(from.dir, target.dir, k.v);
            disc.position.copy(sun.position).normalize().multiplyScalar(520);
            disc.lookAt(0, 0, 0);
          },
        },
        at,
      );
    },
  };
}

/* ------------------------------------------------------------------ */
/* Arazi                                                               */
/* ------------------------------------------------------------------ */

const smooth = (a: number, b: number, v: number) => THREE.MathUtils.smoothstep(v, a, b);

export interface GroundOpts {
  seed?: number;
  /** Kuru çay yatağı: z ekseni boyunca uzanır, x = 0 çevresinde. */
  river?: boolean;
}

export const RIVER = { half: 4.6, depth: 2.3 };

/** Ortası düz bozkır, uzakta tepeler; isteğe bağlı kuru çay yatağı. */
export function makeGround(opts: GroundOpts = {}): GroundFn & { riverT: (x: number, z: number) => number } {
  const noise = createNoise2D(rng(opts.seed ?? 3));
  const riverT = (x: number, z: number) => {
    if (!opts.river) return 0;
    const cx = Math.sin(z * 0.045) * 3.2 * smooth(8, 30, Math.abs(z));
    return 1 - smooth(RIVER.half * 0.45, RIVER.half, Math.abs(x - cx));
  };
  const fn = (x: number, z: number) => {
    const dist = Math.hypot(x, z);
    const far = smooth(34, 130, dist);
    let y = (noise(x * 0.012, z * 0.012) * 0.5 + 0.5) * 26 * far * far;
    y += noise(x * 0.05, z * 0.05) * 1.4 * smooth(28, 60, dist);
    y -= riverT(x, z) * RIVER.depth * (1 - far);
    return y;
  };
  return Object.assign(fn, { riverT });
}

export function addTerrain(stage: Stage, ground: ReturnType<typeof makeGround>, seed = 11): void {
  stage.ground = ground;
  const size = 420;
  const seg = 140;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const noise = createNoise2D(rng(seed));
  const cA = new THREE.Color(P.grass);
  const cB = new THREE.Color(P.grassDark);
  const cSand = new THREE.Color(P.sand);
  const cRock = new THREE.Color(P.stone);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = ground(x, z);
    pos.setY(i, y);
    c.lerpColors(cA, cB, noise(x * 0.06, z * 0.06) * 0.5 + 0.5);
    c.lerp(cRock, smooth(9, 22, y) * 0.8);
    c.lerp(cSand, Math.min(1, ground.riverT(x, z) * 1.3));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
  m.receiveShadow = true;
  stage.add(m);
}

/** Taş, çalı ve ağaç serpiştirir. `keepOut` yarıçapındaki orta alan boş kalır. */
export function scatter(stage: Stage, opts: { seed?: number; rocks?: number; shrubs?: number; trees?: number; keepOut?: number; radius?: number } = {}): void {
  const r = rng(opts.seed ?? 21);
  const radius = opts.radius ?? 60;
  const keepOut = opts.keepOut ?? 0;
  const spot = (): [number, number] => {
    for (;;) {
      const x = (r() * 2 - 1) * radius;
      const z = (r() * 2 - 1) * radius;
      if (Math.hypot(x, z) >= keepOut) return [x, z];
    }
  };
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < (opts.rocks ?? 30); i++) {
    const [x, z] = spot();
    const s = 0.15 + r() * 0.5;
    const m = mesh(rockGeo, mat(r() > 0.5 ? P.stone : P.stoneDark));
    m.position.set(x, stage.ground(x, z) + s * 0.25, z);
    m.scale.set(s * (0.8 + r() * 0.6), s * (0.5 + r() * 0.4), s * (0.8 + r() * 0.6));
    m.rotation.set(r() * 3, r() * 3, r() * 3);
    stage.add(m);
  }
  for (let i = 0; i < (opts.shrubs ?? 40); i++) {
    const [x, z] = spot();
    const s = 0.25 + r() * 0.35;
    const m = mesh(rockGeo, mat(r() > 0.4 ? P.green : P.grassDark));
    m.position.set(x, stage.ground(x, z) + s * 0.4, z);
    m.scale.set(s * 1.3, s * 0.8, s * 1.3);
    m.rotation.y = r() * 3;
    stage.add(m);
  }
  for (let i = 0; i < (opts.trees ?? 0); i++) {
    const [x, z] = spot();
    const t = tree(0.8 + r() * 0.6);
    t.position.set(x, stage.ground(x, z), z);
    t.rotation.y = r() * 6;
    stage.add(t);
  }
}

export function tree(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.2, 2, 5), mat(P.darkBrown));
  trunk.position.y = 1;
  const crown = mesh(new THREE.IcosahedronGeometry(1.2, 0), mat(P.green));
  crown.position.y = 2.9;
  crown.scale.set(0.8, 1.5, 0.8);
  g.add(trunk, crown);
  g.scale.setScalar(scale);
  return g;
}

export function cloud(scale = 1, seed = 1): THREE.Group {
  const g = new THREE.Group();
  const r = rng(seed);
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x8f8f8f, flatShading: true, roughness: 1, fog: false });
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(i === 0 ? geo : geo.clone(), i === 0 ? m : m.clone());
    b.position.set((i - 2) * 1.4, r() * 0.6, r() * 1.2);
    b.scale.set(1.3 + r(), 0.7 + r() * 0.5, 1 + r());
    g.add(b);
  }
  g.scale.setScalar(scale);
  return g;
}

/** Gökyüzüne birkaç bulut koyar ve yavaşça sürükler. */
export function addClouds(stage: Stage, count = 6, seed = 5): void {
  const r = rng(seed);
  const list: THREE.Group[] = [];
  for (let i = 0; i < count; i++) {
    const c = cloud(6 + r() * 7, seed + i);
    c.position.set((r() * 2 - 1) * 220, 60 + r() * 40, -150 - r() * 160);
    stage.add(c);
    list.push(c);
  }
  if (!stage.reducedMotion) {
    stage.onTick((_t, dt) => {
      for (const c of list) {
        c.position.x += dt * 0.6;
        if (c.position.x > 240) c.position.x = -240;
      }
    });
  }
}

/* ------------------------------------------------------------------ */
/* Yapılar ve eşyalar                                                  */
/* ------------------------------------------------------------------ */

/** Otağ: keçe çadır. Kapısı +z yönüne bakar. */
export function tent(color: number = P.white, accent: number = P.red, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const wall = mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.5, 12), mat(color));
  wall.position.y = 0.75;
  const band = mesh(new THREE.CylinderGeometry(2.24, 2.24, 0.22, 12), mat(accent));
  band.position.y = 1.3;
  const band2 = mesh(new THREE.CylinderGeometry(2.24, 2.24, 0.1, 12), mat(P.ochre));
  band2.position.y = 1.08;
  const roof = mesh(new THREE.ConeGeometry(2.45, 1.3, 12), mat(color));
  roof.position.y = 2.15;
  const cap = mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.2, 8), mat(accent));
  cap.position.y = 2.75;
  const frame = mesh(new THREE.BoxGeometry(1.0, 1.45, 0.12), mat(accent));
  frame.position.set(0, 0.72, 2.16);
  const door = mesh(new THREE.BoxGeometry(0.72, 1.25, 0.14), mat(P.darkBrown));
  door.position.set(0, 0.63, 2.18);
  g.add(wall, band, band2, roof, cap, frame, door);
  g.scale.setScalar(scale);
  return g;
}

/** Kamp ateşi: odunlar, titreşen alevler ve sıcak bir ışık. */
export function addFire(stage: Stage, x: number, z: number, scale = 1): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, stage.ground(x, z), z);
  for (let i = 0; i < 4; i++) {
    const log = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 5), mat(P.darkBrown));
    log.rotation.set(Math.PI / 2 - 0.25, (i * Math.PI) / 4, 0, 'YXZ');
    log.position.y = 0.12;
    g.add(log);
  }
  const flames: THREE.Mesh[] = [];
  const defs: [number, number, number, number][] = [
    [P.flame, 0.3, 0.95, 0],
    [P.flame, 0.2, 0.7, 0.16],
    [P.flameCore, 0.17, 0.6, -0.05],
  ];
  defs.forEach(([color, rad, h, off], i) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 5), glow(color));
    f.geometry.translate(0, h / 2, 0);
    f.position.set(off, 0.1, i === 1 ? 0.1 : -off);
    flames.push(f);
    g.add(noInk(f));
  });
  const light = new THREE.PointLight(0xff9040, 14 * scale, 22, 1.6);
  light.position.y = 1;
  g.add(light);
  g.scale.setScalar(scale);
  stage.add(g);
  const base = light.intensity;
  if (!stage.reducedMotion) {
    stage.onTick((t) => {
      flames.forEach((f, i) => {
        const s = 1 + Math.sin(t * (9 + i * 3) + i) * 0.18 + Math.sin(t * 23 + i * 2) * 0.08;
        f.scale.set(1 + Math.sin(t * 7 + i) * 0.1, s, 1);
        f.rotation.z = Math.sin(t * 5 + i * 2) * 0.12;
      });
      light.intensity = base * (0.85 + Math.sin(t * 11) * 0.08 + Math.sin(t * 27) * 0.07);
    });
  }
  return g;
}

/** Gökten inen ışık hüzmesi (ilahî buyruk anlatımı için). */
export function lightBeam(height = 40, radius = 3): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(radius * 0.35, radius, height, 16, 1, true);
  geo.translate(0, height / 2, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xfff3c8, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  return noInk(m);
}

export function coin(): THREE.Mesh {
  const m = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 8), mat(P.gold, { emissive: 0x6a4a00 }));
  m.rotation.x = Math.PI / 2;
  return m;
}

/** Kılıç: kabza orijinde, namlu +y yönünde. */
export function sword(): THREE.Group {
  const g = new THREE.Group();
  const blade = mesh(new THREE.BoxGeometry(0.07, 0.95, 0.02), mat(P.steel));
  blade.position.y = 0.55;
  const guard = mesh(new THREE.BoxGeometry(0.26, 0.05, 0.06), mat(P.ochre));
  guard.position.y = 0.07;
  const grip = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 5), mat(P.darkBrown));
  g.add(blade, guard, grip);
  return g;
}

/** Topuz: sap orijinde, başı +y yönünde. */
export function mace(): THREE.Group {
  const g = new THREE.Group();
  const shaft = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 5), mat(P.darkBrown));
  shaft.position.y = 0.4;
  const head = mesh(new THREE.IcosahedronGeometry(0.15, 0), mat(P.stoneDark));
  head.position.y = 0.9;
  g.add(shaft, head);
  return g;
}

/** Kopuz: ozanların çaldığı telli saz. */
export function kopuz(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.IcosahedronGeometry(0.2, 1), mat(P.brown));
  body.scale.set(0.9, 1.25, 0.45);
  const top = mesh(new THREE.CircleGeometry(0.15, 8), mat(P.cream));
  top.position.z = 0.08;
  top.scale.y = 1.3;
  const neck = mesh(new THREE.BoxGeometry(0.05, 0.75, 0.04), mat(P.darkBrown));
  neck.position.y = 0.58;
  const pegs = mesh(new THREE.BoxGeometry(0.16, 0.05, 0.04), mat(P.darkBrown));
  pegs.position.y = 0.92;
  g.add(body, top, neck, pegs);
  return g;
}

/** Sırık ucunda dalgalanan flama. */
export function addBanner(stage: Stage, x: number, z: number, color: number = P.red, height = 3.4): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, stage.ground(x, z), z);
  const pole = mesh(new THREE.CylinderGeometry(0.04, 0.05, height, 5), mat(P.darkBrown));
  pole.position.y = height / 2;
  const geo = new THREE.PlaneGeometry(1.1, 0.55, 6, 1);
  geo.translate(0.55, 0, 0);
  const flag = mesh(geo, mat(color, { side: THREE.DoubleSide }));
  flag.position.y = height - 0.35;
  const tip = mesh(new THREE.IcosahedronGeometry(0.09, 0), mat(P.gold));
  tip.position.y = height + 0.05;
  g.add(pole, flag, tip);
  stage.add(g);
  if (!stage.reducedMotion) {
    const pos = geo.attributes.position;
    stage.onTick((t) => {
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        pos.setZ(i, Math.sin(px * 5 - t * 5) * 0.09 * px);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    });
  }
  return g;
}
