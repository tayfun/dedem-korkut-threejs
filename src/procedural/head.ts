import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Yontulmuş baş: yüzeyin biçimi ve bütün figürlerin paylaştığı geometri. */

/** Baş yarıçapı. */
export const HEAD = 0.3;

/** Bir yönde (yaw sağ-sol, pitch yukarı-aşağı) birim vektör. */
export const dir = (yaw: number, pitch: number) => new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));

/**
 * Yontulmuş başın yüzeyi: küreden yola çıkar; çeneye doğru daralır, burun, kaş kemeri,
 * elmacık kemiği, dudak ve çene çıkıntı yapar, göz çukurları içeri girer.
 */
export function headPoint(d: THREE.Vector3): THREE.Vector3 {
  const yaw = Math.atan2(d.x, d.z);
  const pitch = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
  const bump = (y0: number, p0: number, sy: number, sp: number) => Math.exp(-((yaw - y0) ** 2 / (2 * sy * sy) + (pitch - p0) ** 2 / (2 * sp * sp)));
  const pair = (y0: number, p0: number, sy: number, sp: number) => bump(y0, p0, sy, sp) + bump(-y0, p0, sy, sp);
  const front = THREE.MathUtils.smoothstep(d.z, -0.1, 0.5);
  let r = 1;
  r += front *
    (0.15 * bump(0, -0.04, 0.085, 0.2) + // burun sırtı
      0.17 * bump(0, -0.22, 0.12, 0.07) + // burun ucu
      0.05 * pair(0.19, -0.25, 0.07, 0.05) + // burun kanatları
      -0.045 * pair(0.45, 0.04, 0.17, 0.12) + // göz çukurları
      0.035 * pair(0.42, 0.34, 0.28, 0.07) + // kaş kemeri
      0.035 * pair(0.62, -0.2, 0.2, 0.17) + // elmacık kemikleri
      0.04 * bump(0, -0.55, 0.22, 0.06) + // dudaklar
      0.07 * bump(0, -1.0, 0.35, 0.22)); // çene
  const low = Math.max(0, -d.y);
  const p = d.clone().multiplyScalar(HEAD * r);
  p.x *= 1 - 0.3 * Math.pow(low, 1.6); // çeneye doğru daralma
  p.y *= 1.1;
  if (d.z < 0) p.z *= 0.96;
  return p;
}

let headGeo: THREE.BufferGeometry | undefined;

/** Baş geometrisi bir kez yontulur, bütün figürler aynısını kullanır. */
export function headGeometry(): THREE.BufferGeometry {
  if (!headGeo) {
    const base = new THREE.SphereGeometry(1, 64, 44);
    base.deleteAttribute('uv');
    base.deleteAttribute('normal');
    const g = mergeVertices(base);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      const p = headPoint(v);
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    g.computeVertexNormals();
    headGeo = g;
  }
  return headGeo;
}
