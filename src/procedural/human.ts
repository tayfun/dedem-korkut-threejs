import * as THREE from 'three';
import { Mover } from '../engine/stage';
import { DrawnFace, type FaceKind, type Mood } from './face';
import { HEAD, dir, headGeometry, headPoint } from './head';
import { P, kilim, mesh, toon } from './palette';

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
  /** Yüz tipi; verilmezse sakal, başlık ve boydan çıkarılır. */
  face?: FaceKind;
  /** Göz rengi. */
  eyes?: number;
  mood?: Mood;
  scale?: number;
  wings?: number;
}

/** Kalça yüksekliği; oturma, diz çökme ve binicilik bu değere göre hesaplanır. */
export const HIP = 0.72;

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
    // Yüz tipi verilmediyse görünüşten çıkar: ak sakal → yaşlı, başörtü → kadın, küçük boy → çocuk.
    const kind: FaceKind = o.face ?? (o.beard === P.white ? 'elder' : o.hat === 'scarf' ? 'woman' : (o.scale ?? 1) < 0.8 ? 'child' : 'man');
    this.face = new DrawnFace({
      kind,
      skin: o.skin ?? P.skin,
      brow: o.beard ?? o.moustache ?? o.hair ?? P.black,
      iris: o.eyes,
      moustache: o.moustache ?? o.beard,
      blush: o.blush,
      noMouth: o.beard !== undefined,
    });
    this.head.add(this.face.mesh);
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

  /** Yüz ifadesini değiştirir: kaşlar, göz kapakları ve ağız yeniden çizilir. */
  setMood(mood: Mood): this {
    this.mood = mood;
    this.face?.set(mood, this.eyesClosed);
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
export const KNEEL_Y = -0.33;
export const KNEEL_KNEE = 1.5;
