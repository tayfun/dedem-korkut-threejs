import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { noInk } from '../engine/ink';
import type { Stage } from '../engine/stage';
import { rng } from './palette';

/** Gökyüzü ve ışık: renk geçişli kubbe, güneş ya da hilal, yıldızlar, uzak dağ sıraları, bulutlar. */

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
  /** Bulut renginin ufuk rengine karışma oranı. */
  cloud: number;
}

const SKIES: Record<SkyPreset, SkyDef> = {
  day: { top: 0x4d8fc7, bottom: 0xead9b4, sun: 0xfff1d6, sunI: 2.4, hemiSky: 0xcfe3f5, hemiGround: 0x8a7a55, hemiI: 1.0, dir: [30, 42, 22], stars: 0, cloud: 0.12 },
  dawn: { top: 0x6f9fd0, bottom: 0xffd4a0, sun: 0xffe0b0, sunI: 2.1, hemiSky: 0xd8dcf0, hemiGround: 0x8a7050, hemiI: 0.95, dir: [36, 22, 18], stars: 0, cloud: 0.3 },
  dusk: { top: 0x2d2c5c, bottom: 0xe7854a, sun: 0xffa868, sunI: 1.9, hemiSky: 0x8c82b8, hemiGround: 0x5a4030, hemiI: 0.75, dir: [-38, 16, 14], stars: 0.35, cloud: 0.45 },
  night: { top: 0x0a0f24, bottom: 0x2b3560, sun: 0x9fb4e8, sunI: 1.1, hemiSky: 0x5065a8, hemiGround: 0x24243a, hemiI: 1.0, dir: [-24, 36, 18], stars: 1, cloud: 0.82 },
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

  // Güneş (ışınlı) ya da ay (hilal): ışığın geldiği yönde, uzakta.
  const discMat = new THREE.MeshBasicMaterial({ color: d.sun, fog: false });
  const disc = new THREE.Group();
  if (preset === 'night') {
    disc.add(new THREE.Mesh(crescentGeometry(13), discMat));
  } else {
    disc.add(new THREE.Mesh(new THREE.CircleGeometry(17, 24), discMat));
    const rays = noInk(new THREE.Mesh(raysGeometry(21, 16), discMat));
    disc.add(rays);
    if (!stage.reducedMotion) stage.onTick((_t, dt) => (rays.rotation.z += dt * 0.05));
  }
  disc.position.set(...d.dir).normalize().multiplyScalar(520);
  disc.lookAt(0, 0, 0);
  stage.add(disc);

  // Uzak dağ sıraları: ufuk rengine doğru solan üç katman.
  const ridgeMix = [0.55, 0.38, 0.22];
  const ridgeMats = ridgeMix.map(() => new THREE.MeshBasicMaterial({ fog: false, side: THREE.DoubleSide }));
  const ridgeTint = new THREE.Color();
  const paintRidges = () => {
    ridgeTint.copy(uniforms.top.value).multiplyScalar(0.6);
    ridgeMix.forEach((k, i) => ridgeMats[i].color.lerpColors(uniforms.bottom.value, ridgeTint, k));
  };
  paintRidges();
  [
    [250, 38, 31],
    [340, 58, 32],
    [450, 84, 33],
  ].forEach(([radius, height, seed], i) => stage.add(new THREE.Mesh(ridgeGeometry(radius, height, seed), ridgeMats[i])));

  // Minyatür bulutları: yassı, kıvrımlı; gökte çok yavaş döner.
  const cloudMat = new THREE.MeshBasicMaterial({ fog: false });
  const white = new THREE.Color(0xfff8ea);
  let cloudMix = d.cloud;
  const paintClouds = () => cloudMat.color.lerpColors(white, uniforms.bottom.value, cloudMix);
  paintClouds();
  const clouds = new THREE.Group();
  const cr = rng(41);
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(cloudGeometry(100 + i), cloudMat);
    const a = (i / 9) * Math.PI * 2 + cr() * 0.4;
    const y = 70 + cr() * 90;
    c.position.set(Math.sin(a) * 470, y, Math.cos(a) * 470);
    c.lookAt(0, y, 0);
    c.scale.setScalar(0.8 + cr() * 0.7);
    clouds.add(c);
  }
  stage.add(clouds);
  if (!stage.reducedMotion) stage.onTick((_t, dt) => (clouds.rotation.y += dt * 0.004));

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
        cloud: cloudMix,
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
            cloudMix = THREE.MathUtils.lerp(from.cloud, e.cloud, k.v);
            paintRidges();
            paintClouds();
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

/** Işın çemberi: uzun ve kısa üçgenler sırayla dizilir. */
function raysGeometry(inner: number, count: number): THREE.BufferGeometry {
  const v: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const w = (Math.PI / count) * 0.55;
    const len = inner + (i % 2 ? 9 : 17);
    v.push(Math.cos(a - w) * inner, Math.sin(a - w) * inner, 0, Math.cos(a + w) * inner, Math.sin(a + w) * inner, 0, Math.cos(a) * len, Math.sin(a) * len, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function crescentGeometry(r: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  const open = THREE.MathUtils.degToRad(110);
  s.absarc(0, 0, r, -open, open, false);
  const cx = -r * 0.75;
  const ex = Math.cos(open) * r - cx;
  const ey = Math.sin(open) * r;
  s.absarc(cx, 0, Math.hypot(ex, ey), Math.atan2(ey, ex), -Math.atan2(ey, ex), true);
  return new THREE.ShapeGeometry(s, 24);
}

/** Çepeçevre bir dağ sırası: sivri doruklu, içe bakan bir şerit. */
function ridgeGeometry(radius: number, height: number, seed: number): THREE.BufferGeometry {
  const noise = createNoise2D(rng(seed));
  const N = 150;
  const v: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    const ridged = 1 - Math.abs(noise(cx * 2.2, sz * 2.2));
    const fine = 1 - Math.abs(noise(cx * 7 + 9, sz * 7));
    const h = height * (0.15 + 0.6 * ridged * ridged * ridged + 0.25 * fine * fine);
    v.push(cx * radius, -30, sz * radius, cx * radius, h, sz * radius);
    if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Yassı, kıvrım kıvrım bir bulut: yan yana yaylardan oluşur. */
function cloudGeometry(seed: number): THREE.BufferGeometry {
  const r = rng(seed);
  const s = new THREE.Shape();
  const n = 4 + Math.floor(r() * 3);
  const radii = Array.from({ length: n }, (_, i) => (9 + r() * 9) * (1 - Math.abs(i - (n - 1) / 2) / n));
  let x = 0;
  const xs = radii.map((rad, i) => (x += i ? (radii[i - 1] + rad) * 0.62 : 0));
  const w = xs[n - 1];
  s.moveTo(-radii[0] - w / 2, 0);
  radii.forEach((rad, i) => s.absarc(xs[i] - w / 2, 0, rad, Math.PI, 0, true));
  s.lineTo(radii[n - 1] + w / 2, -3);
  s.quadraticCurveTo(0, -7, -radii[0] - w / 2, -3);
  s.closePath();
  return new THREE.ShapeGeometry(s, 10);
}
