import * as THREE from 'three';
import { Mover } from '../engine/stage';
import { DrawnFace, type FaceKind, type Mood } from './face';
import { HEAD, dir, headGeometry, headPoint } from './head';
import { bodyModel, modelMaterial, type ModelName } from './model';
import { P, kilim, mesh, toon, toonVertex } from './palette';

export type { FaceKind, Mood } from './face';

export type Hat = 'bork' | 'kalpak' | 'turban' | 'scarf' | 'hood' | 'none';

export interface HumanOpts {
  robe?: number;
  trim?: number;
  hat?: Hat;
  hatColor?: number;
  skin?: number;
  beard?: number;
  moustache?: number;
  /** Saç rengi: kadınlarda iki örgü, erkeklerde ense saçı. */
  hair?: number;
  /** Sırtta dalgalanan pelerin. */
  cloak?: number;
  /** Uzun etek: bacaklar görünmez. */
  long?: boolean;
  /** Yanaklarda pembelik. */
  blush?: boolean;
  /** Gözü kör edilmiş olarak başlar (Tepegöz). */
  blind?: boolean;
  /** Yüz tipi; verilmezse sakal, başlık ve boydan çıkarılır. */
  face?: FaceKind;
  /** Göz rengi. */
  eyes?: number;
  mood?: Mood;
  scale?: number;
  wings?: number;
  /** Hazır model (`model.ts`): gövde ve baş modelden gelir; `hat`, `eyes`, `blush` ve ifade etkisizdir. Yüklenmemişse figür kodla kurulur. */
  model?: ModelName;
}

/* ------------------------------ Ölçüler ----------------------------- */

/** Kalça yüksekliği; oturma, diz çökme ve binicilik bu değere göre hesaplanır. */
export const HIP = 0.92;
const THIGH = 0.46;
const SHIN = 0.46;
const LEG_X = 0.085;
const SHOULDER_Y = 1.43;
const UPPER = 0.3;
const FORE = 0.27;
const WAIST_Y = 1.06;
/** Gövde biçimi: omuz genişliği ve göğüs, bel, kalça yarıçapları ([yanlara, öne-arkaya]). */
interface Build {
  shoulder: number;
  chest: [number, number];
  waist: [number, number];
  hip: [number, number];
  /** Göğsün öne çıkıntısı. */
  bust: number;
  /** Etek ucunun genişleme oranı. */
  flare: number;
}

const BUILDS: Record<FaceKind, Build> = {
  man: { shoulder: 0.225, chest: [0.215, 0.14], waist: [0.155, 0.118], hip: [0.172, 0.132], bust: 0, flare: 1 },
  woman: { shoulder: 0.172, chest: [0.165, 0.128], waist: [0.118, 0.098], hip: [0.185, 0.148], bust: 0.03, flare: 1.14 },
  child: { shoulder: 0.185, chest: [0.178, 0.128], waist: [0.15, 0.118], hip: [0.168, 0.132], bust: 0, flare: 1 },
  elder: { shoulder: 0.2, chest: [0.195, 0.142], waist: [0.172, 0.136], hip: [0.18, 0.14], bust: 0, flare: 1.04 },
  grim: { shoulder: 0.215, chest: [0.2, 0.135], waist: [0.15, 0.115], hip: [0.17, 0.13], bust: 0, flare: 1.08 },
  cyclops: { shoulder: 0.24, chest: [0.235, 0.16], waist: [0.19, 0.15], hip: [0.19, 0.15], bust: 0, flare: 1 },
};

/** Yüz ve gövde tipi verilmediyse görünüşten çıkar: ak sakal → yaşlı, başörtü → kadın, küçük boy → çocuk. */
function faceKind(o: HumanOpts): FaceKind {
  return o.face ?? (o.beard === P.white ? 'elder' : o.hat === 'scarf' ? 'woman' : (o.scale ?? 1) < 0.8 ? 'child' : 'man');
}
const HEAD_Y = 1.74;
/** Başın gövdeye oranı: baş `head.ts` içinde 0,3 yarıçapla kurulur, burada küçültülür. */
const HEAD_K = 0.72;

/* --------------------------- Gövde yüzeyi --------------------------- */

const B = { root: 0, armL: 1, elbowL: 2, armR: 3, elbowR: 4, legL: 5, kneeL: 6, legR: 7, kneeR: 8 };

interface Ring {
  /** Halkanın merkezi, kemiğin kendi uzayında. */
  c: [number, number, number];
  /** Yarıçaplar: [x, z]. */
  r: [number, number];
  color: number;
  /** Kemik ağırlıkları: [kemik, ağırlık] çiftleri; `null` ise köşe başına hesaplanır (etek). */
  w: [number, number][] | null;
  /** Etek halkalarında bacaklara bağlanma oranı. */
  skirt?: number;
  /** Kıvrım derinliği: halka, çevresi boyunca dalgalanır (etek pilileri). */
  fold?: number;
}

/**
 * Tek parça gövde: halkalardan örülen tüpler (gövde + etek, iki kol, iki bacak) tek bir geometride birleşir.
 * Eklem çevresindeki halkalar iki kemiğe birden bağlıdır; eklem bükülünce yüzey esner.
 */
function bodyGeometry(bones: THREE.Object3D[], o: { robe: number; trim: number; skin: number; long: boolean; build: Build }): THREE.BufferGeometry {
  const SEG = 32;
  const FOLDS = 8;
  const b = o.build;
  const pos: number[] = [];
  const col: number[] = [];
  const skinIndex: number[] = [];
  const skinWeight: number[] = [];
  const index: number[] = [];
  const root = bones[B.root];
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const v = new THREE.Vector3();
  const m = new THREE.Matrix4();
  const color = new THREE.Color();

  /** Bir tüp ekler; `space` halkaların tanımlandığı kemiktir. `stripe` ön ortaya şerit çizer. */
  const tube = (space: number, rings: Ring[], stripe?: number): void => {
    m.multiplyMatrices(toRoot, bones[space].matrixWorld);
    const base = pos.length / 3;
    rings.forEach((ring, j) => {
      for (let i = 0; i < SEG; i++) {
        const a = (i / SEG) * Math.PI * 2;
        const k = 1 + (ring.fold ?? 0) * Math.cos(a * FOLDS);
        v.set(ring.c[0] + Math.sin(a) * ring.r[0] * k, ring.c[1], ring.c[2] + Math.cos(a) * ring.r[1] * k).applyMatrix4(m);
        pos.push(v.x, v.y, v.z);
        color.set(stripe !== undefined && i === 0 ? stripe : ring.color);
        col.push(color.r, color.g, color.b);
        let w = ring.w;
        if (!w) {
          // Etek: köşe, bulunduğu yana göre sol ya da sağ uyluğa bağlanır.
          const f = ring.skirt ?? 0;
          const right = 0.5 + 0.5 * THREE.MathUtils.clamp(v.x / 0.1, -1, 1);
          w = [[B.root, 1 - f], [B.legL, f * (1 - right)], [B.legR, f * right]];
        }
        for (let k = 0; k < 4; k++) {
          skinIndex.push(w[k]?.[0] ?? 0);
          skinWeight.push(w[k]?.[1] ?? 0);
        }
        if (j < rings.length - 1) {
          const p = base + j * SEG + i;
          const q = base + j * SEG + ((i + 1) % SEG);
          index.push(p, p + SEG, q, q, p + SEG, q + SEG); // yüzler dışa bakar
        }
      }
    });
    // Uçları kapat: ilk ve son halkanın ortasına birer köşe.
    for (const [j, flip] of [[0, false], [rings.length - 1, true]] as const) {
      const ring = rings[j];
      v.set(...ring.c).applyMatrix4(m);
      const center = pos.length / 3;
      pos.push(v.x, v.y, v.z);
      color.set(ring.color);
      col.push(color.r, color.g, color.b);
      const w = ring.w ?? [[B.root, 1]];
      for (let k = 0; k < 4; k++) {
        skinIndex.push(w[k]?.[0] ?? 0);
        skinWeight.push(w[k]?.[1] ?? 0);
      }
      for (let i = 0; i < SEG; i++) {
        const p = base + j * SEG + i;
        const q = base + j * SEG + ((i + 1) % SEG);
        if (flip) index.push(center, q, p);
        else index.push(center, p, q);
      }
    }
  };

  const R: [number, number][] = [[B.root, 1]];
  const pants = P.brown;
  const boots = P.darkBrown;

  // Bacaklar: kalçadan bileğe; diz çevresi iki kemiğe bağlı.
  for (const [leg, knee] of [[B.legL, B.kneeL], [B.legR, B.kneeR]]) {
    const T: [number, number][] = [[leg, 1]];
    const K: [number, number][] = [[knee, 1]];
    const J: [number, number][] = [[leg, 0.5], [knee, 0.5]];
    tube(leg, [
      { c: [0, 0.06, 0], r: [0.085, 0.09], color: pants, w: R },
      { c: [0, -0.04, 0], r: [0.088, 0.092], color: pants, w: [[B.root, 0.4], [leg, 0.6]] },
      { c: [0, -0.2, 0], r: [0.08, 0.085], color: pants, w: T },
      { c: [0, -THIGH + 0.07, 0], r: [0.068, 0.072], color: pants, w: T },
      { c: [0, -THIGH, 0.005], r: [0.066, 0.07], color: boots, w: J },
      { c: [0, -THIGH - 0.07, 0], r: [0.066, 0.07], color: boots, w: K },
      { c: [0, -THIGH - 0.2, -0.005], r: [0.064, 0.07], color: boots, w: K },
      { c: [0, -THIGH - SHIN + 0.09, 0], r: [0.05, 0.054], color: boots, w: K },
      { c: [0, -THIGH - SHIN + 0.01, 0.01], r: [0.055, 0.065], color: boots, w: K },
    ]);
  }

  // Kollar: omuzdan bileğe; omuz gövdeye, dirsek iki kemiğe bağlı. Yen bileğe doğru hafifçe açılır.
  for (const [arm, elbow] of [[B.armL, B.elbowL], [B.armR, B.elbowR]]) {
    const A: [number, number][] = [[arm, 1]];
    const E: [number, number][] = [[elbow, 1]];
    const J: [number, number][] = [[arm, 0.5], [elbow, 0.5]];
    tube(arm, [
      { c: [0, 0.035, 0], r: [0.05, 0.06], color: o.robe, w: R },
      { c: [0, 0.0, 0], r: [0.075, 0.08], color: o.robe, w: [[B.root, 0.55], [arm, 0.45]] },
      { c: [0, -0.07, 0], r: [0.07, 0.074], color: o.robe, w: A },
      { c: [0, -UPPER + 0.07, 0], r: [0.058, 0.062], color: o.robe, w: A },
      { c: [0, -UPPER, -0.004], r: [0.056, 0.06], color: o.robe, w: J },
      { c: [0, -UPPER - 0.07, 0], r: [0.056, 0.06], color: o.robe, w: E },
      { c: [0, -UPPER - FORE + 0.05, 0], r: [0.062, 0.066], color: o.robe, w: E },
      { c: [0, -UPPER - FORE + 0.045, 0], r: [0.066, 0.07], color: o.trim, w: E },
      { c: [0, -UPPER - FORE, 0], r: [0.068, 0.072], color: o.trim, w: E },
    ]);
  }

  // Gövde ve etek: boyundan etek ucuna tek tüp. Etek halkaları uyluklara bağlanır; otururken dizle birlikte kalkar.
  const hemY = o.long ? 0.05 : 0.46;
  const hem: [number, number] = o.long ? [0.34 * b.flare, 0.3 * b.flare] : [0.27 * b.flare, 0.22 * b.flare];
  const torso: Ring[] = [
    { c: [0, SHOULDER_Y + 0.12, 0], r: [0.058, 0.06], color: o.skin, w: R },
    { c: [0, SHOULDER_Y + 0.075, 0], r: [0.06, 0.062], color: o.skin, w: R },
    { c: [0, SHOULDER_Y + 0.07, 0], r: [0.082, 0.078], color: o.trim, w: R },
    { c: [0, SHOULDER_Y + 0.045, 0], r: [b.shoulder * 0.62, 0.092], color: o.trim, w: R },
    { c: [0, SHOULDER_Y + 0.012, 0], r: [b.shoulder - 0.012, 0.112], color: o.robe, w: R },
    { c: [0, SHOULDER_Y - 0.07, b.bust * 0.5], r: [b.chest[0], b.chest[1]], color: o.robe, w: R },
    { c: [0, SHOULDER_Y - 0.15, b.bust], r: [b.chest[0] - 0.008, b.chest[1] + b.bust * 0.4], color: o.robe, w: R },
    { c: [0, SHOULDER_Y - 0.26, b.bust * 0.3], r: [(b.chest[0] + b.waist[0]) / 2, (b.chest[1] + b.waist[1]) / 2], color: o.robe, w: R },
    { c: [0, WAIST_Y, 0], r: b.waist, color: o.robe, w: R },
    { c: [0, HIP + 0.03, 0], r: b.hip, color: o.robe, w: null, skirt: 0.15 },
  ];
  const n = o.long ? 6 : 4;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const y = THREE.MathUtils.lerp(HIP + 0.03, hemY, t);
    torso.push({
      c: [0, y, 0],
      r: [THREE.MathUtils.lerp(b.hip[0], hem[0], Math.pow(t, 0.8)), THREE.MathUtils.lerp(b.hip[1], hem[1], Math.pow(t, 0.8))],
      color: o.robe,
      w: null,
      // Uzun etek daha az esner: yürürken sallanır, otururken öne doğru yayılır.
      skirt: o.long ? 0.15 + 0.4 * Math.min(1, t * 2) : 0.15 + 0.7 * t,
      // Kıvrımlar etek ucuna doğru derinleşir.
      fold: 0.11 * t,
    });
  }
  const last = torso[torso.length - 1].skirt;
  torso.push({ c: [0, hemY - 0.004, 0], r: [hem[0] + 0.004, hem[1] + 0.004], color: o.trim, w: null, skirt: last, fold: 0.11 });
  torso.push({ c: [0, hemY - 0.06, 0], r: [hem[0] + 0.012, hem[1] + 0.012], color: o.trim, w: null, skirt: last, fold: 0.11 });
  torso.push({ c: [0, hemY - 0.066, 0], r: [hem[0] * 0.9, hem[1] * 0.9], color: P.darkBrown, w: null, skirt: last });
  tube(B.root, torso);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/**
 * Çizgi film tarzı insan figürü: iri baş, iri gözler, yuvarlak hatlar, basamaklı gölge.
 * Önü +z yönüne bakar, ayakları orijindedir. Kollar ve bacaklar omuz/kalça ekseninden döner:
 * `rotation.x` eksi → öne, artı → arkaya; kollar için -3 → yukarı.
 * Dirsekler kolun duruşuna göre kendiliğinden bükülür; dizler `kneeL/kneeR` ile bükülür.
 * Yüz 2B çizilir (`face.ts`); ifade `setMood` ile değişir, gözler kendiliğinden kırpılır.
 */
export class Human extends Mover {
  /** Yatma, eğilme gibi tüm gövde hareketleri için. */
  rig = new THREE.Group();
  head = new THREE.Group();
  /** Başın ölçekli içi: kafatası, yüz, saç, başlık. */
  private skull = new THREE.Group();
  armL = new THREE.Group();
  armR = new THREE.Group();
  legL = new THREE.Group();
  legR = new THREE.Group();
  kneeL = new THREE.Group();
  kneeR = new THREE.Group();
  handR = new THREE.Group();
  handL = new THREE.Group();
  wingL?: THREE.Group;
  wingR?: THREE.Group;
  /** Kanat çırpma genliği (0: kapalı durur). */
  flap = 0.25;
  /** Yürürken kolların sallanma oranı; elinde bir şey tutan figürde düşürülür. */
  armSwing = 1;
  /** true ise gözler kapalı kalır. */
  eyesClosed = false;
  private swingL = new THREE.Group();
  private swingR = new THREE.Group();
  private elbowL = new THREE.Group();
  private elbowR = new THREE.Group();
  private legSwingL = new THREE.Group();
  private legSwingR = new THREE.Group();
  private kneeSwingL = new THREE.Group();
  private kneeSwingR = new THREE.Group();
  private cloak?: THREE.Group;
  private face?: DrawnFace;
  private mood: Mood = 'neutral';
  private phase = Math.random() * 10;

  constructor(o: HumanOpts = {}) {
    super();
    const robeColor = o.robe ?? P.indigo;
    const robe = toon(robeColor);
    const trimColor = o.trim ?? P.ochre;
    const trim = toon(trimColor);
    const band = kilim(trimColor, robeColor === P.red ? P.indigo : P.red, P.cream);
    const skin = toon(o.skin ?? P.skin);
    const boots = toon(P.darkBrown);
    const pants = toon(P.brown);
    this.group.add(this.rig);

    const kind = faceKind(o);
    const model = o.model ? bodyModel(o.model) : undefined;
    // Modelin omuzları kendi genişliğindedir; kollar oradan döner.
    const build = model ? { ...BUILDS[kind], shoulder: model.shoulder } : BUILDS[kind];
    // İskelet: yürüme ve duruş grupları aynı zamanda gövde yüzeyinin kemikleridir.
    const legs = [
      [-1, this.legSwingL, this.legL, this.kneeSwingL, this.kneeL],
      [1, this.legSwingR, this.legR, this.kneeSwingR, this.kneeR],
    ] as const;
    for (const [side, swing, leg, kneeSwing, knee] of legs) {
      swing.position.set(side * LEG_X, HIP, 0);
      kneeSwing.position.y = -THIGH;
      // Çizmenin ayağı: bileğe bağlı, katı.
      const foot = mesh(new THREE.CapsuleGeometry(0.058, 0.12, 4, 10), boots);
      foot.rotation.x = Math.PI / 2;
      foot.scale.y = 1;
      foot.position.set(0, -SHIN + 0.055, 0.05);
      knee.add(foot);
      kneeSwing.add(knee);
      leg.add(kneeSwing);
      swing.add(leg);
      this.rig.add(swing);
      if (o.long || model) foot.visible = false;
    }
    const arms = [
      [-1, this.swingL, this.armL, this.elbowL, this.handL],
      [1, this.swingR, this.armR, this.elbowR, this.handR],
    ] as const;
    for (const [side, swing, arm, elbow, hand] of arms) {
      swing.position.set(side * build.shoulder, SHOULDER_Y, 0);
      arm.rotation.z = side * 0.14;
      elbow.position.y = -UPPER;
      hand.position.y = -FORE - 0.03;
      // El: avuç, başparmak ve bitişik parmaklar.
      const palm = mesh(new THREE.SphereGeometry(0.052, 10, 8), skin);
      palm.scale.set(0.8, 1.15, 0.6);
      const fingers = mesh(new THREE.CapsuleGeometry(0.03, 0.04, 3, 8), skin);
      fingers.scale.set(1.15, 1, 0.6);
      fingers.position.y = -0.06;
      const thumb = mesh(new THREE.CapsuleGeometry(0.014, 0.035, 3, 6), skin);
      thumb.position.set(-side * 0.04, -0.01, 0.025);
      thumb.rotation.z = -side * 0.6;
      if (!model) hand.add(palm, fingers, thumb); // modelin kendi elleri var
      elbow.add(hand);
      arm.add(elbow);
      swing.add(arm);
      this.rig.add(swing);
    }

    // Baş boyundan döner: modelde boyun ekleminden, kodla kurulan başta başın ortasından.
    this.head.position.y = model ? model.neck : HEAD_Y;
    this.rig.add(this.head);

    // Gövde: tek parça, kemiklere bağlı yüzey (kaftan, kollar, bacaklar).
    this.group.updateMatrixWorld(true);
    const bones = [this.rig, this.armL, this.elbowL, this.armR, this.elbowR, this.legL, this.kneeL, this.legR, this.kneeR];
    const body = model
      ? new THREE.SkinnedMesh(model.geometry, modelMaterial(o.model!, { robe: robeColor, trim: trimColor, skin: o.skin ?? P.skin, hair: o.hair ?? P.black, hat: o.hatColor ?? trimColor }))
      : new THREE.SkinnedMesh(bodyGeometry(bones, { robe: robeColor, trim: trimColor, skin: o.skin ?? P.skin, long: !!o.long, build }), toonVertex());
    body.castShadow = true;
    body.receiveShadow = false; // esneyen yüzey kendi üstüne gölge düşürünce etekte koyu şeritler oluşuyor
    body.frustumCulled = false;
    this.rig.add(body);
    body.updateMatrixWorld(true);
    // Modelin başı da aynı yüzeydedir; onuncu kemik baştır.
    body.bind(new THREE.Skeleton((model ? [...bones, this.head] : bones) as unknown as THREE.Bone[]), body.matrixWorld);

    // Kuşak (kilim desenli) ve toka: bel kemiğe katı bağlı olduğu için ayrı parça.
    const belt = mesh(new THREE.CylinderGeometry(1, 1, 0.085, 22), band);
    belt.scale.set(build.waist[0] + 0.012, 1, build.waist[1] + 0.012);
    belt.position.y = WAIST_Y;
    const buckle = mesh(new THREE.SphereGeometry(0.03, 8, 6), toon(P.gold));
    buckle.position.set(0, WAIST_Y, build.waist[1] + 0.015);
    // Kaftanın ön şeridi: yakadan kuşağa.
    const placket = mesh(new THREE.BoxGeometry(0.05, SHOULDER_Y - WAIST_Y + 0.02, 0.02), trim);
    placket.position.set(0, (SHOULDER_Y + WAIST_Y) / 2 + 0.01, build.chest[1] - 0.012 + build.bust * 0.7);
    placket.rotation.x = -0.06;
    if (!model) this.rig.add(belt, buckle, placket);

    // Baş ve yüz: modelde hazır gelir (yüzü dokuya işlidir; ifade ve göz kırpma yoktur).
    if (!model) this.addHead(o, kind, skin, trim, robeColor);

    if (o.cloak !== undefined) this.addCloak(o.cloak);
    if (o.wings !== undefined) this.addWings(o.wings);
    if (o.scale) this.group.scale.setScalar(o.scale);
    this.setMood(o.mood ?? 'neutral');
    if (o.blind) this.blind();
  }

  /** Kodla kurulan baş: yontulmuş kafatası, kulaklar, çizilmiş yüz, saç ve başlık. */
  private addHead(o: HumanOpts, kind: FaceKind, skin: THREE.Material, trim: THREE.Material, robeColor: number): void {
    this.skull.scale.setScalar(HEAD_K);
    this.head.add(this.skull);
    this.skull.add(mesh(headGeometry(), skin));
    const hatKind = o.hat ?? 'bork';
    if (hatKind !== 'scarf' && hatKind !== 'hood') {
      for (const sx of [-1, 1]) {
        // Kulak: yassı kepçe ve içinde koyu bir kıvrım.
        const ear = mesh(new THREE.SphereGeometry(0.058, 10, 8), skin);
        ear.scale.set(0.4, 1.15, 0.75);
        ear.position.copy(headPoint(dir((sx * Math.PI) / 2, -0.03))).add(new THREE.Vector3(sx * 0.012, 0, -0.01));
        ear.rotation.y = sx * 0.35;
        this.skull.add(ear);
      }
    }
    this.addFace(o, kind);
    this.addHair(o, trim, kind);
    this.addHat(hatKind, o.hatColor ?? o.trim ?? P.red, robeColor);
  }

  private addFace(o: HumanOpts, kind: FaceKind): void {
    this.face = new DrawnFace({
      kind,
      skin: o.skin ?? P.skin,
      brow: o.beard ?? o.moustache ?? o.hair ?? P.black,
      iris: o.eyes,
      moustache: o.moustache ?? o.beard,
      blush: o.blush,
      noMouth: o.beard !== undefined,
    });
    this.skull.add(this.face.mesh);
    if (o.beard !== undefined) {
      // Sakal çene hattını izler: yanaklardan başlar, çenenin altında toplanır.
      const b = mesh(new THREE.SphereGeometry(0.21, 16, 12), toon(o.beard));
      b.scale.set(1.0, 1.3, 0.72);
      b.position.set(0, -0.3, 0.12);
      this.skull.add(b);
    }
  }

  private addHair(o: HumanOpts, trim: THREE.Material, kind: FaceKind): void {
    if (o.hair === undefined) return;
    const hair = toon(o.hair);
    const hat = o.hat ?? 'bork';
    const covered = hat === 'scarf' || hat === 'hood';
    const woman = kind === 'woman';

    /** Bir tutam: başın yüzeyinden aşağı doğru uzanan sivri bir saç parçası. */
    const lock = (yaw: number, pitch: number, len: number, width: number, drop = 0.4): void => {
      const from = headPoint(dir(yaw, pitch)).multiplyScalar(1.03);
      const to = headPoint(dir(yaw * 1.05, pitch - drop)).multiplyScalar(1.07);
      const geo = new THREE.ConeGeometry(width, len, 5);
      geo.rotateZ(Math.PI);
      geo.translate(0, -len / 2, 0);
      const m = mesh(geo, hair);
      m.position.copy(from);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), to.sub(from).normalize());
      this.skull.add(m);
    };

    if (covered) {
      // Başörtüsünün altından görünen saç: alında bir bant.
      const fringe = mesh(new THREE.SphereGeometry(HEAD + 0.012, 18, 8, 0, Math.PI * 2, 0, 0.9), hair);
      fringe.scale.y = 1.1;
      fringe.rotation.x = -0.22;
      this.skull.add(fringe);
    } else {
      // Saç kütlesi: önde yüksek, ensede alçak biten bir başlık.
      const cap = mesh(new THREE.SphereGeometry(HEAD * 1.05, 22, 12, 0, Math.PI * 2, 0, 1.57), hair);
      cap.scale.y = 1.1;
      cap.rotation.x = -0.62;
      this.skull.add(cap);
      if (kind !== 'elder') {
        // Perçem: alna düşen tutamlar; ortadaki kısa, yanlar uzun.
        [-0.78, -0.42, -0.08, 0.3, 0.66].forEach((yaw, i) => lock(yaw, 0.66, [0.2, 0.17, 0.13, 0.16, 0.21][i] * (kind === 'child' ? 0.8 : 1), 0.075));
        // Favori ya da yanak tutamları.
        for (const sx of [-1, 1]) lock(sx * 1.22, 0.3, woman ? 0.52 : 0.26, woman ? 0.06 : 0.055, 0.6);
      }
    }

    if (woman && hat === 'none') {
      // Omuzlara dökülen uzun saç.
      const fall = mesh(new THREE.CylinderGeometry(0.25, 0.33, 0.9, 16, 1, true, Math.PI * 0.5, Math.PI), toon(o.hair, { side: THREE.DoubleSide }));
      fall.position.set(0, -0.46, -0.05);
      fall.receiveShadow = false;
      this.skull.add(fall);
    } else if (o.long && woman) {
      // Omuzlardan öne sarkan iki örgü.
      for (const sx of [-1, 1]) {
        for (let i = 0; i < 6; i++) {
          const bead = mesh(new THREE.SphereGeometry(0.042 - i * 0.003, 8, 6), hair);
          bead.position.set(sx * (0.19 - i * 0.008), HEAD_Y - 0.14 - i * 0.075, 0.09 + Math.min(i, 2) * 0.025);
          this.rig.add(bead);
        }
        const tip = mesh(new THREE.SphereGeometry(0.032, 8, 6), trim);
        tip.position.set(sx * 0.145, HEAD_Y - 0.59, 0.14);
        this.rig.add(tip);
      }
    }
  }

  private addHat(hat: Hat, color: number, robe: number): void {
    // Yontulmuş baş küreden biraz uzundur; başlıklar o kadar yukarı oturur.
    const h = new THREE.Group();
    h.position.y = 0.035;
    this.skull.add(h);
    if (hat === 'bork') {
      const fur = mesh(new THREE.TorusGeometry(0.27, 0.075, 8, 20), toon(P.darkBrown));
      fur.rotation.x = Math.PI / 2;
      fur.position.y = 0.17;
      const top = mesh(new THREE.SphereGeometry(0.27, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(color));
      top.position.y = 0.17;
      top.scale.y = 1.05;
      const knob = mesh(new THREE.SphereGeometry(0.045, 8, 6), toon(P.gold));
      knob.position.y = 0.47;
      h.add(fur, top, knob);
    } else if (hat === 'kalpak') {
      const top = mesh(new THREE.ConeGeometry(0.27, 0.52, 18), toon(color));
      top.position.y = 0.42;
      const fur = mesh(new THREE.TorusGeometry(0.27, 0.07, 8, 20), toon(P.cream));
      fur.rotation.x = Math.PI / 2;
      fur.position.y = 0.17;
      h.add(fur, top);
    } else if (hat === 'turban') {
      const mt = toon(color);
      for (const [r, y, tube] of [[0.26, 0.15, 0.1], [0.2, 0.27, 0.1]]) {
        const ring = mesh(new THREE.TorusGeometry(r, tube, 8, 20), mt);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
        h.add(ring);
      }
      const cap = mesh(new THREE.SphereGeometry(0.17, 12, 8), toon(P.red));
      cap.position.y = 0.3;
      h.add(cap);
    } else if (hat === 'scarf') {
      const mt = toon(color);
      const s = mesh(new THREE.SphereGeometry(HEAD + 0.03, 20, 14), mt);
      s.position.set(0, 0.03, -0.06);
      const drape = mesh(new THREE.CylinderGeometry(0.2, 0.34, 0.5, 14, 1, true, Math.PI * 0.5, Math.PI), toon(color, { side: THREE.DoubleSide }));
      drape.position.set(0, -0.3, -0.04);
      const crown = mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.14, 16), kilim(P.ochre, P.red, P.indigo));
      crown.position.set(0, 0.3, -0.03);
      h.add(s, drape, crown);
    } else if (hat === 'hood') {
      const mt = toon(robe);
      const s = mesh(new THREE.SphereGeometry(HEAD + 0.05, 20, 14), mt);
      s.position.set(0, 0.04, -0.08);
      const tip = mesh(new THREE.ConeGeometry(0.22, 0.42, 14), mt);
      tip.position.set(0, 0.33, -0.16);
      tip.rotation.x = -0.55;
      const drape = mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 14, 1, true, Math.PI * 0.5, Math.PI), toon(robe, { side: THREE.DoubleSide }));
      drape.position.set(0, -0.3, -0.06);
      h.add(s, tip, drape);
    }
  }

  private addCloak(color: number): void {
    const g = new THREE.Group();
    g.position.set(0, SHOULDER_Y + 0.04, -0.01);
    const profile = [new THREE.Vector2(0.2, 0), new THREE.Vector2(0.25, -0.3), new THREE.Vector2(0.34, -0.8), new THREE.Vector2(0.42, -1.1)];
    const cape = mesh(new THREE.LatheGeometry(profile, 12, Math.PI - 1.15, 2.3), toon(color, { side: THREE.DoubleSide }));
    cape.receiveShadow = false;
    g.add(cape);
    this.cloak = g;
    this.rig.add(g);
  }

  private addWings(color: number): void {
    const shape = new THREE.Shape();
    const pts: [number, number][] = [
      [0, 0.1], [0.45, 1.0], [1.4, 1.35], [2.1, 0.85], [1.75, 0.25], [1.9, -0.35],
      [1.35, -0.3], [1.35, -0.95], [0.85, -0.65], [0.7, -1.3], [0.3, -0.8], [0, -0.6],
    ];
    shape.moveTo(...pts[0]);
    for (const p of pts.slice(1)) shape.lineTo(...p);
    const geo = new THREE.ShapeGeometry(shape);
    const m = toon(color, { side: THREE.DoubleSide });
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.06, SHOULDER_Y - 0.08, -0.15);
      const w = mesh(side === 1 ? geo : geo.clone(), m);
      w.receiveShadow = false; // ince yüzeyde gölge çizgilenmesini önler
      w.scale.x = side;
      pivot.add(w);
      this.rig.add(pivot);
      if (side === 1) this.wingR = pivot;
      else this.wingL = pivot;
    }
  }

  /** Yüz ifadesini değiştirir: kaşlar, göz kapakları ve ağız yeniden çizilir. */
  setMood(mood: Mood): this {
    this.mood = mood;
    this.face?.set(mood, this.eyesClosed);
    return this;
  }

  /** Gözü kör eder (Tepegöz): göz kapanır, kanlı çizilir. */
  blind(): this {
    this.eyesClosed = true;
    this.face?.wound();
    return this;
  }

  /** Figürü sırtüstü yere yatırır; baş, baktığı yönün tersine düşer. */
  lie(): this {
    this.rig.rotation.x = -Math.PI / 2;
    this.yOffset = 0.17 * this.group.scale.y;
    return this;
  }

  /** Figürü yere oturtur: bacaklar öne uzanır, dizler hafif bükülür. */
  sit(): this {
    this.yOffset = -(HIP - 0.11) * this.group.scale.y;
    this.legL.rotation.set(-1.5, 0, -0.3);
    this.legR.rotation.set(-1.5, 0, 0.3);
    this.kneeL.rotation.x = this.kneeR.rotation.x = 0.3;
    return this;
  }

  /** Figürü diz çöktürür. */
  kneel(): this {
    this.yOffset = KNEEL_Y * this.group.scale.y;
    this.kneeL.rotation.x = this.kneeR.rotation.x = KNEEL_KNEE;
    return this;
  }

  update(t: number): void {
    const a = this.walkAmp;
    const ph = t * this.walkSpeed + this.phase;
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    this.legSwingL.rotation.x = s * 0.6 * a;
    this.legSwingR.rotation.x = -s * 0.6 * a;
    // Diz, bacak öne savrulurken bükülür.
    this.kneeSwingL.rotation.x = Math.max(0, -c) * 0.95 * a;
    this.kneeSwingR.rotation.x = Math.max(0, c) * 0.95 * a;
    this.swingL.rotation.x = -s * 0.45 * a * this.armSwing;
    this.swingR.rotation.x = s * 0.45 * a * this.armSwing;
    this.rig.position.y = Math.abs(c) * 0.05 * a;
    // Dirsek: kol öne ya da yana kalktıkça bükülür, tam yukarıda yeniden açılır.
    for (const [arm, swing, elbow] of [[this.armL, this.swingL, this.elbowL], [this.armR, this.swingR, this.elbowR]] as const) {
      const lift = THREE.MathUtils.clamp(-(arm.rotation.x + swing.rotation.x), 0, Math.PI);
      elbow.rotation.x = -(0.18 + 0.6 * Math.sin(lift) * (1 - Math.min(1, Math.abs(arm.rotation.z)) * 0.7));
    }
    // Göz kırpma: birkaç saniyede bir, kısa süreli.
    const blink = this.eyesClosed || (t * 0.27 + this.phase) % 1 < 0.035;
    this.face?.set(this.mood, blink);
    if (this.cloak) this.cloak.rotation.x = 0.06 + 0.3 * a + Math.sin(t * 2.2 + this.phase) * 0.03 + Math.abs(s) * 0.06 * a;
    if (this.wingL && this.wingR) {
      const f = Math.sin(t * 4.5 + this.phase) * this.flap;
      this.wingR.rotation.y = 0.45 - f;
      this.wingL.rotation.y = -0.45 + f;
    }
  }
}

/** Diz çökme duruşunun değerleri (zaman çizelgelerinde de kullanılır). */
export const KNEEL_Y = -0.42;
export const KNEEL_KNEE = 1.5;
