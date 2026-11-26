import * as THREE from 'three';
import { noInk } from '../engine/ink';
import type { Stage } from '../engine/stage';
import { addSmoke } from './life';
import { P, glow, kilim, mat, mesh } from './palette';

/** Yapılar ve eşyalar: çadır, ateş, flama, ışık hüzmesi, akçe, kılıç, topuz, kopuz. */

/** Otağ: keçe çadır. Kapısı +z yönüne bakar. */
export function tent(color: number = P.white, accent: number = P.red, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const wall = mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.5, 12), mat(color));
  wall.position.y = 0.75;
  const band = mesh(new THREE.CylinderGeometry(2.24, 2.24, 0.26, 12), kilim(accent, P.ochre, P.cream));
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
  stage.keepClear(x, z, 1.1 * scale);
  addSmoke(stage, x, stage.ground(x, z), z, scale);
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

/** Yay: kabzası orijinde, kirişi +z yönünde gerilir; ele takılır. */
export function bow(): THREE.Group {
  const g = new THREE.Group();
  const arc = mesh(new THREE.TorusGeometry(0.42, 0.022, 5, 14, 2.3), mat(P.darkBrown));
  arc.rotation.z = Math.PI / 2 - 1.15;
  arc.position.x = -0.42 * Math.cos(1.15);
  const string = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.77, 3), mat(P.cream), false);
  string.position.x = 0.0;
  g.add(arc, string);
  g.rotation.y = Math.PI / 2;
  return g;
}

/** Ok: ucu +z yönünde. */
export function arrow(): THREE.Group {
  const g = new THREE.Group();
  const shaft = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.8, 4), mat(P.brown), false);
  shaft.rotation.x = Math.PI / 2;
  const tip = mesh(new THREE.ConeGeometry(0.035, 0.1, 4), mat(P.steel), false);
  tip.rotation.x = Math.PI / 2;
  tip.position.z = 0.45;
  const fletch = mesh(new THREE.BoxGeometry(0.09, 0.005, 0.14), mat(P.red), false);
  fletch.position.z = -0.34;
  g.add(shaft, tip, fletch);
  return g;
}

/** Şiş (süglük): sapı orijinde, ucu +y yönünde; `hot` ise ucu kızgındır. */
export function spit(hot = false): THREE.Group {
  const g = new THREE.Group();
  const rod = mesh(new THREE.CylinderGeometry(0.02, 0.028, 1.5, 5), mat(P.steel));
  rod.position.y = 0.7;
  g.add(rod);
  if (hot) {
    const tip = noInk(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.4, 5), glow(P.flame)));
    tip.position.y = 1.5;
    g.add(tip);
  }
  return g;
}

export function ring(): THREE.Mesh {
  return mesh(new THREE.TorusGeometry(0.09, 0.03, 6, 12), mat(P.gold, { emissive: 0x6a4a00 }));
}

/** Çoban değneği: sapı orijinde, ucu +y yönünde. */
export function staff(length = 1.9): THREE.Mesh {
  const m = mesh(new THREE.CylinderGeometry(0.025, 0.035, length, 5), mat(P.darkBrown));
  m.geometry.translate(0, length / 2 - 0.5, 0);
  return m;
}
