import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Mover } from '../engine/stage';
import { DrawnFace } from './face';
import { P, kilim, mat, mesh, toon } from './palette';
import { kopuz } from './world';

/* ------------------------------------------------------------------ */
/* İnsan                                                               */
/* ------------------------------------------------------------------ */

export type Hat = 'bork' | 'kalpak' | 'turban' | 'scarf' | 'hood' | 'none';
export type Mood = 'neutral' | 'happy' | 'smug' | 'angry' | 'sad' | 'fear';

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
  /** Yüz 3B parçalar yerine 2B çizimle yapılır (göz, kaş, bıyık, ağız). */
  drawnFace?: boolean;
  mood?: Mood;
  scale?: number;
  wings?: number;
}

/** Baş yarıçapı; yüz çizimleri bu kürenin üstüne yerleşir. */
const HEAD = 0.3;
const HIP = 0.72;
const FRONT = new THREE.Vector3(0, 0, 1);

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
function headGeometry(): THREE.BufferGeometry {
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

/** Yassı bir parçayı yontulmuş başın yüzeyine, verilen yöne yapıştırır. */
function onFace<T extends THREE.Object3D>(obj: T, yaw: number, pitch: number, lift = 0.008): T {
  const d = dir(yaw, pitch);
  obj.quaternion.setFromUnitVectors(FRONT, d);
  obj.position.copy(headPoint(d)).addScaledVector(d, lift);
  return obj;
}

const MOODS: Record<Mood, { brow: number; browLift: number; mouth: 'smile' | 'frown' | 'open'; size: number }> = {
  neutral: { brow: 0, browLift: 0, mouth: 'smile', size: 0.6 },
  happy: { brow: -0.12, browLift: 0.02, mouth: 'smile', size: 1.15 },
  smug: { brow: 0.32, browLift: 0, mouth: 'smile', size: 1 },
  angry: { brow: 0.5, browLift: -0.012, mouth: 'frown', size: 0.9 },
  sad: { brow: -0.42, browLift: 0.005, mouth: 'frown', size: 0.8 },
  fear: { brow: -0.3, browLift: 0.035, mouth: 'open', size: 1 },
};

/**
 * Çizgi film tarzı insan figürü: iri baş, iri gözler, yuvarlak hatlar, basamaklı gölge.
 * Önü +z yönüne bakar, ayakları orijindedir. Kollar ve bacaklar omuz/kalça ekseninden döner:
 * `rotation.x` eksi → öne, artı → arkaya; kollar için -3 → yukarı.
 * Dirsekler kolun duruşuna göre kendiliğinden bükülür; dizler `kneeL/kneeR` ile bükülür.
 * Yüz ifadesi `setMood` ile değişir; gözler kendiliğinden kırpılır.
 */
export class Human extends Mover {
  /** Yatma, eğilme gibi tüm gövde hareketleri için. */
  rig = new THREE.Group();
  head = new THREE.Group();
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
  private eyes: THREE.Group[] = [];
  private brows: THREE.Group[] = [];
  private browBase = 0;
  private mouths: Partial<Record<'smile' | 'open', THREE.Mesh>> = {};
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

    // Bacaklar: uyluk + diz + çizme
    const legs = [
      [-1, this.legSwingL, this.legL, this.kneeSwingL, this.kneeL],
      [1, this.legSwingR, this.legR, this.kneeSwingR, this.kneeR],
    ] as const;
    for (const [side, swing, leg, kneeSwing, knee] of legs) {
      swing.position.set(side * 0.12, HIP, 0);
      const thigh = mesh(new THREE.CapsuleGeometry(0.095, 0.2, 4, 10), pants);
      thigh.position.y = -0.17;
      kneeSwing.position.y = -0.34;
      const shin = mesh(new THREE.CapsuleGeometry(0.09, 0.18, 4, 10), boots);
      shin.position.y = -0.17;
      const foot = mesh(new THREE.SphereGeometry(0.1, 12, 8), boots);
      foot.scale.set(1, 0.7, 1.7);
      foot.position.set(0, -0.31, 0.07);
      const cuff = mesh(new THREE.TorusGeometry(0.095, 0.025, 6, 14), trim);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.03;
      knee.add(shin, foot, cuff);
      kneeSwing.add(knee);
      leg.add(thigh, kneeSwing);
      swing.add(leg);
      this.rig.add(swing);
      if (o.long) swing.visible = false;
    }

    // Gövde: çan biçimli kaftan; ön şerit ve etek ucu aynı kesitten çıkar.
    const hemY = o.long ? 0.05 : 0.42;
    const hemR = o.long ? 0.46 : 0.37;
    const profile = [
      new THREE.Vector2(0.001, 1.36),
      new THREE.Vector2(0.14, 1.35),
      new THREE.Vector2(0.235, 1.27),
      new THREE.Vector2(0.25, 1.1),
      new THREE.Vector2(0.235, 0.92),
      new THREE.Vector2(0.3, 0.7),
      new THREE.Vector2(hemR, hemY),
    ];
    profile.reverse(); // aşağıdan yukarı: yüzeyler dışa baksın
    const body = mesh(new THREE.LatheGeometry(profile, 22), robe);
    const placket = mesh(new THREE.LatheGeometry(profile.slice(0, -1), 3, -0.13, 0.26), trim);
    placket.scale.set(1.035, 1, 1.035);
    const hem = mesh(new THREE.TorusGeometry(hemR - 0.005, 0.024, 6, 24), band);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = hemY;
    const belt = mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.1, 20), band);
    belt.position.y = 0.92;
    const buckle = mesh(new THREE.SphereGeometry(0.04, 8, 6), toon(P.gold));
    buckle.position.set(0, 0.92, 0.25);
    const collar = mesh(new THREE.TorusGeometry(0.13, 0.04, 6, 16), trim);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.35;
    const neck = mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.14, 10), skin);
    neck.position.y = 1.38;
    this.rig.add(body, placket, hem, belt, buckle, collar, neck);

    // Kollar: omuz + üst kol + dirsek + ön kol + el
    const arms = [
      [-1, this.swingL, this.armL, this.elbowL, this.handL],
      [1, this.swingR, this.armR, this.elbowR, this.handR],
    ] as const;
    for (const [side, swing, arm, elbow, hand] of arms) {
      swing.position.set(side * 0.26, 1.24, 0);
      arm.rotation.z = side * 0.14;
      const shoulder = mesh(new THREE.SphereGeometry(0.105, 12, 8), robe);
      const upper = mesh(new THREE.CapsuleGeometry(0.08, 0.16, 4, 10), robe);
      upper.position.y = -0.15;
      elbow.position.y = -0.29;
      // Yen: bileğe doğru hafifçe açılır.
      const fore = mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.27, 12), robe);
      fore.position.y = -0.13;
      const cuff = mesh(new THREE.TorusGeometry(0.095, 0.025, 6, 14), trim);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.265;
      hand.position.y = -0.33;
      const palm = mesh(new THREE.SphereGeometry(0.075, 10, 8), skin);
      palm.scale.set(0.9, 1.1, 0.75);
      const thumb = mesh(new THREE.SphereGeometry(0.03, 6, 5), skin);
      thumb.position.set(-side * 0.05, 0.02, 0.04);
      hand.add(palm, thumb);
      elbow.add(mesh(new THREE.SphereGeometry(0.08, 10, 8), robe), fore, cuff, hand);
      arm.add(shoulder, upper, elbow);
      swing.add(arm);
      this.rig.add(swing);
    }

    // Baş ve yüz
    this.head.position.y = 1.64;
    this.head.add(mesh(headGeometry(), skin));
    const hatKind = o.hat ?? 'bork';
    if (hatKind !== 'scarf' && hatKind !== 'hood') {
      for (const sx of [-1, 1]) {
        // Kulak: yassı kepçe ve içinde koyu bir kıvrım.
        const ear = mesh(new THREE.SphereGeometry(0.058, 10, 8), skin);
        ear.scale.set(0.4, 1.15, 0.75);
        ear.position.copy(headPoint(dir((sx * Math.PI) / 2, -0.03))).add(new THREE.Vector3(sx * 0.012, 0, -0.01));
        ear.rotation.y = sx * 0.35;
        this.head.add(ear);
      }
    }
    this.addFace(o);
    this.addHair(o, trim);
    this.addHat(hatKind, o.hatColor ?? o.trim ?? P.red, robeColor);
    this.rig.add(this.head);

    if (o.cloak !== undefined) this.addCloak(o.cloak);
    if (o.wings !== undefined) this.addWings(o.wings);
    if (o.scale) this.group.scale.setScalar(o.scale);
    this.setMood(o.mood ?? 'neutral');
  }

  private addFace(o: HumanOpts): void {
    if (o.drawnFace) {
      this.face = new DrawnFace({
        skin: o.skin ?? P.skin,
        brow: o.beard ?? o.moustache ?? o.hair ?? P.black,
        moustache: o.moustache,
        blush: o.blush,
        noMouth: o.beard !== undefined,
      });
      this.head.add(this.face.mesh);
      if (o.beard !== undefined) {
        const b = mesh(new THREE.SphereGeometry(0.21, 16, 12), toon(o.beard));
        b.scale.set(1.0, 1.3, 0.72);
        b.position.set(0, -0.3, 0.12);
        this.head.add(b);
      }
      return;
    }
    const white = toon(0xfbf6ee, { face: true });
    const iris = toon(0x4a2c16, { face: true });
    const black = toon(0x140c08, { face: true });
    const browMat = toon(o.beard ?? o.moustache ?? o.hair ?? P.black, { face: true });
    for (const sx of [-1, 1]) {
      // Badem göz: yatık ak, renkli iris, gözbebeği, ışıltı ve üst kirpik çizgisi.
      const eye = onFace(new THREE.Group(), sx * 0.43, 0.03, 0.01);
      const sclera = new THREE.Mesh(new THREE.CircleGeometry(0.062, 20), white);
      sclera.scale.y = 0.74;
      const ring = new THREE.Mesh(new THREE.CircleGeometry(0.036, 16), iris);
      ring.position.set(0, -0.002, 0.003);
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), black);
      pupil.position.set(0, -0.002, 0.006);
      const glint = new THREE.Mesh(new THREE.CircleGeometry(0.011, 8), white);
      glint.position.set(0.012, 0.014, 0.009);
      const lash = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.008, 4, 14, Math.PI), black);
      lash.scale.y = 0.78;
      lash.position.z = 0.004;
      eye.add(sclera, ring, pupil, glint, lash);
      this.eyes.push(eye);
      this.head.add(eye);

      // Kavisli kaş: bir yayın üst dilimi; ifade için kendi ekseninde döner.
      const arc = 1.15;
      const browMesh = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.013, 4, 10, arc), browMat);
      browMesh.rotation.z = Math.PI / 2 - arc / 2;
      browMesh.position.y = -0.1;
      const brow = new THREE.Group();
      brow.add(browMesh);
      brow.userData.side = sx;
      const holder = onFace(new THREE.Group(), sx * 0.43, 0.33, 0.012);
      holder.add(brow);
      this.brows.push(brow);
      this.head.add(holder);

      if (o.blush) this.head.add(onFace(new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), toon(0xe2907c, { face: true })), sx * 0.62, -0.24, 0.006));
    }
    this.browBase = 0;

    // Burun altı gölgesi: burnu düz ışıkta da okunur kılar.
    const shade = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12, Math.PI, Math.PI), toon(new THREE.Color(o.skin ?? P.skin).multiplyScalar(0.72).getHex(), { face: true }));
    shade.scale.y = 0.55;
    this.head.add(onFace(shade, 0, -0.31, 0.004));

    if (o.beard === undefined) {
      const lip = toon(o.blush ? 0xa8433a : 0x7a3a2c, { face: true });
      const pitch = o.moustache !== undefined ? -0.6 : -0.54;
      const smile = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 4, 14, Math.PI * 0.8), lip);
      smile.geometry.rotateZ(Math.PI * 0.1);
      const open = new THREE.Mesh(new THREE.CircleGeometry(0.042, 12), toon(0x4a1f1a, { face: true }));
      open.scale.y = 1.2;
      this.mouths = { smile, open };
      for (const m of [smile, open]) {
        const holder = onFace(new THREE.Group(), 0, pitch, 0.002);
        holder.add(m);
        this.head.add(holder);
      }
    }
    if (o.moustache !== undefined || o.beard !== undefined) {
      const hairMat = toon(o.moustache ?? o.beard!);
      for (const sx of [-1, 1]) {
        const m = onFace(mesh(new THREE.CapsuleGeometry(0.026, 0.085, 3, 8), hairMat), sx * 0.2, -0.43, 0.012);
        m.rotateZ(sx * 1.2);
        this.head.add(m);
      }
    }
    if (o.beard !== undefined) {
      // Sakal çene hattını izler: yanaklardan başlar, çenenin altında toplanır.
      const b = mesh(new THREE.SphereGeometry(0.21, 16, 12), toon(o.beard));
      b.scale.set(1.0, 1.3, 0.72);
      b.position.set(0, -0.3, 0.12);
      this.head.add(b);
    }
  }

  private addHair(o: HumanOpts, trim: THREE.Material): void {
    if (o.hair === undefined) return;
    const hair = toon(o.hair);
    if (o.long) {
      // Alında saç ve omuzlardan öne sarkan iki örgü.
      const fringe = mesh(new THREE.SphereGeometry(HEAD + 0.012, 18, 8, 0, Math.PI * 2, 0, 0.9), hair);
      fringe.scale.y = 1.1;
      fringe.rotation.x = -0.22;
      this.head.add(fringe);
      for (const sx of [-1, 1]) {
        for (let i = 0; i < 6; i++) {
          const bead = mesh(new THREE.SphereGeometry(0.052 - i * 0.004, 8, 6), hair);
          bead.position.set(sx * (0.27 - i * 0.012), 1.5 - i * 0.085, 0.14 + Math.min(i, 2) * 0.03);
          this.rig.add(bead);
        }
        const tip = mesh(new THREE.SphereGeometry(0.04, 8, 6), trim);
        tip.position.set(sx * 0.2, 0.97, 0.2);
        this.rig.add(tip);
      }
    } else {
      const back = mesh(new THREE.SphereGeometry(HEAD * 0.94, 18, 12), hair);
      back.position.set(0, 0, -0.075);
      back.scale.y = 1.1;
      this.head.add(back);
    }
  }

  private addHat(hat: Hat, color: number, robe: number): void {
    // Yontulmuş baş küreden biraz uzundur; başlıklar o kadar yukarı oturur.
    const h = new THREE.Group();
    h.position.y = 0.035;
    this.head.add(h);
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
    g.position.set(0, 1.3, -0.02);
    const profile = [new THREE.Vector2(0.26, 0), new THREE.Vector2(0.31, -0.3), new THREE.Vector2(0.43, -0.8), new THREE.Vector2(0.52, -1.02)];
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
      pivot.position.set(side * 0.08, 1.22, -0.24);
      const w = mesh(side === 1 ? geo : geo.clone(), m);
      w.receiveShadow = false; // ince yüzeyde gölge çizgilenmesini önler
      w.scale.x = side;
      pivot.add(w);
      this.rig.add(pivot);
      if (side === 1) this.wingR = pivot;
      else this.wingL = pivot;
    }
  }

  /** Yüz ifadesini değiştirir: kaşların eğimi ve ağzın biçimi. */
  setMood(mood: Mood): this {
    this.mood = mood;
    this.face?.set(mood, this.eyesClosed);
    const m = MOODS[mood];
    for (const b of this.brows) {
      b.rotation.z = m.brow * b.userData.side;
      b.position.y = this.browBase + m.browLift;
    }
    const { smile, open } = this.mouths;
    if (smile && open) {
      open.visible = m.mouth === 'open';
      smile.visible = !open.visible;
      // Yay aşağı bakarsa gülümseme, yukarı bakarsa somurtma.
      smile.rotation.z = m.mouth === 'frown' ? 0 : Math.PI;
      smile.position.y = m.mouth === 'frown' ? -0.045 : 0.03;
      smile.scale.setScalar(m.size);
    }
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
    for (const e of this.eyes) e.scale.y = blink ? 0.08 : 1;
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
export const KNEEL_Y = -0.33;
export const KNEEL_KNEE = 1.5;

/* ------------------------------------------------------------------ */
/* At                                                                  */
/* ------------------------------------------------------------------ */

/** At: önü +z yönünde. `seat` binicinin oturduğu noktadır; `rig` arka ayaklar üzerinde şaha kalkar. */
export class Horse extends Mover {
  rig = new THREE.Group();
  seat = new THREE.Group();
  neck = new THREE.Group();
  private legs: THREE.Group[] = [];
  private shins: THREE.Group[] = [];
  private tail = new THREE.Group();
  private tailTip = new THREE.Group();
  private phase = Math.random() * 10;

  constructor(color: number = P.brown, mane: number = P.black) {
    super();
    this.walkSpeed = 9;
    const body = toon(color);
    const dark = toon(mane);
    const inner = new THREE.Group();
    // rig'in ekseni arka ayaklardadır; şaha kalkınca arka ayaklar yerde kalır.
    this.rig.position.z = -0.6;
    inner.position.z = 0.6;
    this.rig.add(inner);
    this.group.add(this.rig);

    // Gövde: tek parça yuvarlak fıçı, göğüs ve sağrı dolgun
    const barrel = mesh(new THREE.CapsuleGeometry(0.36, 0.95, 6, 16), body);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.y = 1.28;
    barrel.scale.set(0.9, 1, 1.05);
    const chest = mesh(new THREE.SphereGeometry(0.39, 14, 10), body);
    chest.position.set(0, 1.32, 0.52);
    chest.scale.x = 0.88;
    const rump = mesh(new THREE.SphereGeometry(0.41, 14, 10), body);
    rump.position.set(0, 1.32, -0.52);
    rump.scale.x = 0.9;
    inner.add(barrel, chest, rump);

    // Boyun, baş, yele
    this.neck.position.set(0, 1.42, 0.74);
    this.neck.rotation.x = 0.7;
    const neckM = mesh(new THREE.CylinderGeometry(0.16, 0.27, 1.0, 12), body);
    neckM.position.y = 0.38;
    neckM.scale.x = 0.8;
    const head = new THREE.Group();
    head.position.set(0, 0.9, 0.04);
    head.rotation.x = 0.6;
    const skull = mesh(new THREE.SphereGeometry(0.2, 14, 10), body);
    skull.scale.set(0.8, 0.95, 1.1);
    const muzzle = mesh(new THREE.CapsuleGeometry(0.115, 0.26, 4, 10), body);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, -0.05, 0.3);
    const nose = mesh(new THREE.SphereGeometry(0.105, 10, 8), dark);
    nose.position.set(0, -0.06, 0.47);
    nose.scale.set(1, 0.9, 0.7);
    const bridle = mesh(new THREE.TorusGeometry(0.125, 0.022, 6, 14), toon(P.red));
    bridle.position.set(0, -0.05, 0.25);
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), toon(0x1a1210));
      eye.position.set(sx * 0.14, 0.05, 0.1);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), toon(0xffffff));
      glint.position.set(sx * 0.165, 0.065, 0.11);
      const ear = mesh(new THREE.ConeGeometry(0.055, 0.19, 8), body);
      ear.position.set(sx * 0.1, 0.22, -0.08);
      ear.rotation.z = -sx * 0.2;
      head.add(eye, glint, ear);
    }
    const forelock = mesh(new THREE.SphereGeometry(0.09, 8, 6), dark);
    forelock.position.set(0, 0.16, 0.1);
    forelock.scale.set(0.8, 0.7, 1.5);
    head.add(skull, muzzle, nose, bridle, forelock);
    this.neck.add(neckM, head);
    for (let i = 0; i < 7; i++) {
      const tuft = mesh(new THREE.SphereGeometry(0.1, 8, 6), dark);
      tuft.scale.set(0.5, 1, 1.1);
      tuft.position.set(0, 0.02 + i * 0.14, -0.2 + i * 0.012);
      this.neck.add(tuft);
    }
    inner.add(this.neck);

    // Bacaklar: üst bacak + bilek + toynak
    for (const [x, z] of [[-0.2, 0.6], [0.2, 0.6], [-0.2, -0.6], [0.2, -0.6]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 1.0, z);
      const upper = mesh(new THREE.CapsuleGeometry(0.1, 0.34, 4, 10), body);
      upper.position.y = -0.24;
      const shin = new THREE.Group();
      shin.position.y = -0.5;
      const lower = mesh(new THREE.CapsuleGeometry(0.065, 0.32, 4, 8), body);
      lower.position.y = -0.2;
      const hoof = mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.11, 10), dark);
      hoof.position.y = -0.445;
      shin.add(lower, hoof);
      pivot.add(upper, shin);
      inner.add(pivot);
      this.legs.push(pivot);
      this.shins.push(shin);
    }

    // Kuyruk: iki boğumlu, dolgun
    this.tail.position.set(0, 1.5, -0.9);
    this.tail.rotation.x = 0.5;
    const t1 = mesh(new THREE.CapsuleGeometry(0.075, 0.3, 4, 8), dark);
    t1.position.y = -0.2;
    this.tailTip.position.y = -0.42;
    const t2 = mesh(new THREE.ConeGeometry(0.12, 0.65, 10), dark);
    t2.position.y = -0.3;
    t2.rotation.x = Math.PI;
    this.tailTip.add(t2);
    this.tailTip.rotation.x = -0.35;
    this.tail.add(t1, this.tailTip);
    inner.add(this.tail);

    // Eyer ve kilim örtü
    const saddle = mesh(new THREE.SphereGeometry(0.24, 12, 8), toon(P.darkBrown));
    saddle.scale.set(1, 0.35, 1.3);
    saddle.position.y = 1.68;
    inner.add(saddle);
    const blanket = mesh(new THREE.SphereGeometry(0.4, 14, 10, 0, Math.PI * 2, 0, 1.25), kilim(P.red, P.ochre, P.indigo));
    blanket.scale.set(0.88, 0.95, 1.15);
    blanket.position.y = 1.3;
    inner.add(blanket);
    this.seat.position.set(0, 1.72 - HIP, -0.05);
    inner.add(this.seat);
  }

  /** Biniciyi eyere oturtur. */
  mount(rider: Human): void {
    rider.freeY = true;
    rider.group.position.set(0, 0, 0);
    rider.group.rotation.set(0, 0, 0);
    rider.legL.rotation.set(-0.7, 0, -0.75);
    rider.legR.rotation.set(-0.7, 0, 0.75);
    rider.kneeL.rotation.x = rider.kneeR.rotation.x = 0.9;
    this.seat.add(rider.group);
  }

  update(t: number): void {
    const a = this.walkAmp;
    const ph = t * this.walkSpeed + this.phase;
    // Dört vuruşlu yürüyüş: her bacak çeyrek tur arayla basar.
    [0, Math.PI, Math.PI / 2, Math.PI * 1.5].forEach((off, i) => {
      this.legs[i].rotation.x = Math.sin(ph + off) * 0.55 * a;
      this.shins[i].rotation.x = Math.max(0, -Math.cos(ph + off)) * 0.9 * a;
    });
    this.rig.position.y = Math.abs(Math.sin(ph)) * 0.08 * a;
    this.neck.rotation.x = 0.7 + Math.sin(ph * 2) * 0.06 * a;
    this.tail.rotation.z = Math.sin(t * 3 + this.phase) * 0.18;
    this.tailTip.rotation.z = Math.sin(t * 3 + this.phase - 0.8) * 0.25;
    this.tail.rotation.x = 0.5 + 0.35 * a;
  }
}

/* ------------------------------------------------------------------ */
/* Kuş                                                                 */
/* ------------------------------------------------------------------ */

/** Güvercin ya da doğan: önü +z yönünde, kanat çırpar. */
export class Bird extends Mover {
  flap = 1;
  private wings: THREE.Mesh[] = [];
  private phase = Math.random() * 10;

  constructor(color: number = P.white, scale = 1) {
    super();
    this.freeY = true;
    const m = mat(color, { side: THREE.DoubleSide });
    const body = mesh(new THREE.ConeGeometry(0.12, 0.5, 5), m);
    body.rotation.x = -Math.PI / 2;
    const head = mesh(new THREE.IcosahedronGeometry(0.09, 0), m);
    head.position.set(0, 0.06, -0.26);
    const beak = mesh(new THREE.ConeGeometry(0.03, 0.1, 4), mat(P.ochre));
    beak.rotation.x = -Math.PI / 2;
    beak.position.set(0, 0.05, -0.37);
    const flip = new THREE.Group();
    flip.rotation.y = Math.PI; // gövde -z yönünde kuruldu; önü +z'ye çevir
    flip.add(body, head, beak);
    const wingGeo = new THREE.BufferGeometry();
    wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.15, 0.55, 0, 0.05, 0, 0, 0.2], 3));
    wingGeo.computeVertexNormals();
    for (const side of [-1, 1]) {
      const w = mesh(side === 1 ? wingGeo : wingGeo.clone(), m);
      w.scale.x = side;
      flip.add(w);
      this.wings.push(w);
    }
    this.group.add(flip);
    this.group.scale.setScalar(scale);
  }

  update(t: number): void {
    const f = Math.sin(t * 16 + this.phase) * 0.9 * this.flap;
    this.wings[0].rotation.z = -f;
    this.wings[1].rotation.z = f;
  }
}

/* ------------------------------------------------------------------ */
/* Hazır kılıklar                                                      */
/* ------------------------------------------------------------------ */

export const cast = {
  /** Dede Korkut: ak sakallı bilge ozan; kucağında kopuzu vardır. */
  dedeKorkut: () => {
    const d = new Human({ robe: P.cream, trim: P.teal, hat: 'turban', hatColor: P.white, beard: P.white, long: true, cloak: P.teal, mood: 'happy' });
    const k = kopuz();
    k.position.set(0.1, 0.98, 0.3);
    k.rotation.z = 1.05;
    d.rig.add(k);
    d.armR.rotation.set(-0.95, 0, -0.35);
    d.armL.rotation.set(-1.1, 0, -0.5);
    return d;
  },
  /** Azrail: koyu giysili, ak sakallı, al kanatlı. */
  azrail: () => new Human({ robe: P.black, trim: P.crimson, hat: 'hood', skin: P.pale, beard: P.white, long: true, wings: P.red, scale: 1.15, mood: 'angry' }),
};
