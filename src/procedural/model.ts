import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import hatunUrl from '../models/noble-oguz-hatun.glb?url';
import beyUrl from '../models/noble-steppe-guardian.glb?url';
import { P, share, toonRamp } from './palette';

/**
 * Hazır gövde modelleri: Meshy'de üretilip `tools/fit-model.py` ile Human iskeletine uydurulmuş GLB'ler.
 * Baş da modelden gelir ve Human'ın `head` kemiğine bağlıdır; yüzü dokuya işlidir, ifadesi değişmez.
 * Dokusu renk değil "bölge haritası"dır: kaftan, şerit, ten, saç… renkleri burada paletten verilir,
 * böylece aynı model farklı kişilerde farklı renkte giyilir.
 */

export type ModelName = 'hatun' | 'bey';

const URLS: Record<ModelName, string> = { hatun: hatunUrl, bey: beyUrl };

/** Human'ın kemik sırası (`human.ts` içindeki `B` ile aynı). */
const BONES = ['root', 'armL', 'elbowL', 'armR', 'elbowR', 'legL', 'kneeL', 'legR', 'kneeR', 'head'];

export interface BodyModel {
  geometry: THREE.BufferGeometry;
  /** Omuz ekleminin gövde ekseninden uzaklığı. */
  shoulder: number;
  /** Boyun ekleminin yüksekliği; baş buradan döner. */
  neck: number;
  /** Bölge haritası: RGBA, R = bölge × 20, G = açıklık (128 = 1). */
  slots: Uint8ClampedArray;
  size: number;
}

/** Modelin boyanacağı renkler. */
export interface ModelColors {
  robe: number;
  trim: number;
  skin: number;
  hair: number;
  /** Başlığın tepesi (modelde ayrı bölgeyse). */
  hat: number;
}

const models = new Map<ModelName, BodyModel>();
const materials = new Map<string, THREE.MeshToonMaterial>();
let loading: Promise<void> | undefined;

async function load(name: ModelName): Promise<void> {
  const gltf = await new GLTFLoader().loadAsync(URLS[name]);
  gltf.scene.updateMatrixWorld(true);
  let src: THREE.SkinnedMesh | undefined;
  gltf.scene.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) src = o as THREE.SkinnedMesh;
  });
  if (!src) throw new Error(`${name}: kemikli ağ bulunamadı`);
  const geometry = src.geometry;
  geometry.applyMatrix4(src.matrixWorld);
  // Kemik numaralarını dosyadaki sıradan Human'ın sırasına çevir.
  const order = src.skeleton.bones.map((b) => BONES.indexOf(b.name));
  if (order.includes(-1)) throw new Error(`${name}: tanınmayan kemik`);
  const si = geometry.attributes.skinIndex;
  for (let i = 0; i < si.count; i++) si.setXYZW(i, order[si.getX(i)], order[si.getY(i)], order[si.getZ(i)], order[si.getW(i)]);
  const armR = src.skeleton.bones.find((b) => b.name === 'armR')!;
  const shoulder = armR.getWorldPosition(new THREE.Vector3()).x;
  const neck = src.skeleton.bones.find((b) => b.name === 'head')!.getWorldPosition(new THREE.Vector3()).y;

  const map = (src.material as THREE.MeshStandardMaterial).map!;
  const img = map.image as ImageBitmap;
  const cv = document.createElement('canvas');
  cv.width = cv.height = img.width;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, 0, 0);
  const slots = g.getImageData(0, 0, img.width, img.height).data;
  map.dispose();
  (src.material as THREE.Material).dispose();
  models.set(name, { geometry, shoulder, neck, slots, size: img.width });
}

/** Bütün modelleri bir kez yükler. Yükleme başarısız olursa figürler kodla kurulan gövdeyle çizilir. */
export function loadModels(): Promise<void> {
  loading ??= Promise.all((Object.keys(URLS) as ModelName[]).map(load)).then(
    () => undefined,
    (e) => console.warn('Model yüklenemedi; kodla kurulan gövde kullanılacak.', e),
  );
  return loading;
}

/** Yüklenmiş model; henüz yüklenmediyse `undefined`. */
export const bodyModel = (name: ModelName): BodyModel | undefined => models.get(name);

/** Modelin verilen renklerle boyanmış, paylaşılan malzemesi. */
export function modelMaterial(name: ModelName, c: ModelColors): THREE.MeshToonMaterial {
  const key = `${name}|${c.robe}|${c.trim}|${c.skin}|${c.hair}|${c.hat}`;
  let m = materials.get(key);
  if (!m) {
    const model = models.get(name)!;
    // Bölge sırası fit-model.py ile aynı: 0 boş, kaftan, şerit, ten, saç, şalvar, çizme, kemer, maden, yüz çizgileri, ak, taş, başlık.
    const colors = [c.robe, c.robe, c.trim, c.skin, c.hair, P.brown, P.darkBrown, P.darkBrown, P.gold, P.black, P.white, P.water, c.hat];
    const n = model.size;
    const cv = document.createElement('canvas');
    cv.width = cv.height = n;
    const g = cv.getContext('2d')!;
    const out = g.createImageData(n, n);
    const s = model.slots;
    const d = out.data;
    for (let i = 0; i < s.length; i += 4) {
      const color = colors[Math.min(colors.length - 1, Math.round(s[i] / 20))];
      const k = s[i + 1] / 128;
      d[i] = Math.min(255, ((color >> 16) & 255) * k);
      d[i + 1] = Math.min(255, ((color >> 8) & 255) * k);
      d[i + 2] = Math.min(255, (color & 255) * k);
      d[i + 3] = 255;
    }
    g.putImageData(out, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.flipY = false; // glTF doku düzeni
    tex.colorSpace = THREE.SRGBColorSpace;
    m = share(new THREE.MeshToonMaterial({ map: tex, gradientMap: toonRamp() }));
    materials.set(key, m);
  }
  return m;
}
