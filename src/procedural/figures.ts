import * as THREE from 'three';
import { Mover } from '../engine/stage';
import { P, kilim, mat, mesh } from './palette';
import { kopuz } from './world';

/* ------------------------------------------------------------------ */
/* İnsan                                                               */
/* ------------------------------------------------------------------ */

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
  scale?: number;
  wings?: number;
}

/**
 * Basit geometrilerden kurulan, eklemli insan figürü. Önü +z yönüne bakar, ayakları orijindedir.
 * Kollar ve bacaklar omuz/kalça ekseninden döner:
 * `rotation.x` eksi → öne, artı → arkaya; kollar için -3 → yukarı.
 * Dirsekler kolun duruşuna göre kendiliğinden bükülür; dizler `kneeL/kneeR` ile bükülür.
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
  private swingL = new THREE.Group();
  private swingR = new THREE.Group();
  private elbowL = new THREE.Group();
  private elbowR = new THREE.Group();
  private legSwingL = new THREE.Group();
  private legSwingR = new THREE.Group();
  private kneeSwingL = new THREE.Group();
  private kneeSwingR = new THREE.Group();
  private cloak?: THREE.Group;
  private phase = Math.random() * 10;

  constructor(o: HumanOpts = {}) {
    super();
    const robe = mat(o.robe ?? P.indigo);
    const trimColor = o.trim ?? P.ochre;
    const trim = mat(trimColor);
    const band = kilim(trimColor, o.robe === P.red ? P.indigo : P.red, P.cream);
    const skin = mat(o.skin ?? P.skin);
    const boots = mat(P.darkBrown);
    const pants = mat(P.brown);
    this.group.add(this.rig);

    // Bacaklar: uyluk + diz + baldır/çizme
    const legs = [
      [-1, this.legSwingL, this.legL, this.kneeSwingL, this.kneeL],
      [1, this.legSwingR, this.legR, this.kneeSwingR, this.kneeR],
    ] as const;
    for (const [side, swing, leg, kneeSwing, knee] of legs) {
      swing.position.set(side * 0.14, 0.86, 0);
      const thigh = mesh(new THREE.BoxGeometry(0.18, 0.46, 0.2), pants);
      thigh.position.y = -0.21;
      kneeSwing.position.y = -0.43;
      const shin = mesh(new THREE.BoxGeometry(0.16, 0.44, 0.18), boots);
      shin.position.y = -0.2;
      const foot = mesh(new THREE.BoxGeometry(0.17, 0.1, 0.3), boots);
      foot.position.set(0, -0.38, 0.06);
      knee.add(shin, foot);
      kneeSwing.add(knee);
      leg.add(thigh, kneeSwing);
      swing.add(leg);
      this.rig.add(swing);
      if (o.long) swing.visible = false;
    }

    // Gövde: kaftan, etek, kilim kuşak, yaka ve ön şerit
    const torso = mesh(new THREE.CylinderGeometry(0.23, 0.33, 0.82, 7), robe);
    torso.position.y = 1.22;
    const skirtH = o.long ? 0.8 : 0.42;
    const skirtR = o.long ? 0.5 : 0.42;
    const skirt = mesh(new THREE.CylinderGeometry(0.33, skirtR, skirtH, 7), robe);
    skirt.position.y = 0.81 - skirtH / 2;
    const hem = mesh(new THREE.CylinderGeometry(skirtR - 0.012, skirtR + 0.012, 0.09, 7), band);
    hem.position.y = 0.81 - skirtH + 0.045;
    const belt = mesh(new THREE.CylinderGeometry(0.338, 0.338, 0.1, 7), band);
    belt.position.y = 0.84;
    const collar = mesh(new THREE.CylinderGeometry(0.15, 0.245, 0.09, 7), trim);
    collar.position.y = 1.625;
    const front = mesh(new THREE.BoxGeometry(0.07, 0.74, 0.03), trim);
    front.position.set(0, 1.24, 0.262);
    front.rotation.x = -0.118;
    const neck = mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 6), skin);
    neck.position.y = 1.67;
    this.rig.add(torso, skirt, hem, belt, collar, front, neck);

    // Kollar: üst kol + dirsek + ön kol + el
    const arms = [
      [-1, this.swingL, this.armL, this.elbowL, this.handL],
      [1, this.swingR, this.armR, this.elbowR, this.handR],
    ] as const;
    for (const [side, swing, arm, elbow, hand] of arms) {
      swing.position.set(side * 0.31, 1.55, 0);
      arm.rotation.z = side * 0.14;
      const shoulder = mesh(new THREE.IcosahedronGeometry(0.095, 0), robe);
      const upper = mesh(new THREE.BoxGeometry(0.14, 0.36, 0.15), robe);
      upper.position.y = -0.17;
      elbow.position.y = -0.34;
      const fore = mesh(new THREE.BoxGeometry(0.125, 0.3, 0.135), robe);
      fore.position.y = -0.14;
      const cuff = mesh(new THREE.BoxGeometry(0.14, 0.06, 0.15), trim);
      cuff.position.y = -0.29;
      hand.position.y = -0.36;
      const palm = mesh(new THREE.BoxGeometry(0.09, 0.11, 0.06), skin);
      const thumb = mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), skin);
      thumb.position.set(-side * 0.05, 0.01, 0.03);
      hand.add(palm, thumb);
      elbow.add(fore, cuff, hand);
      arm.add(shoulder, upper, elbow);
      swing.add(arm);
      this.rig.add(swing);
    }

    // Baş ve yüz
    this.head.position.y = 1.84;
    this.head.add(mesh(new THREE.IcosahedronGeometry(0.2, 1), skin));
    const dark = mat(P.black);
    const eyeGeo = new THREE.BoxGeometry(0.04, 0.045, 0.02);
    const browGeo = new THREE.BoxGeometry(0.075, 0.018, 0.02);
    const browColor = mat(o.beard ?? o.moustache ?? o.hair ?? P.black);
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(eyeGeo, dark);
      e.position.set(sx * 0.075, 0.03, 0.185);
      const b = new THREE.Mesh(browGeo, browColor);
      b.position.set(sx * 0.078, 0.085, 0.183);
      b.rotation.z = -sx * 0.18;
      this.head.add(e, b);
    }
    const nose = mesh(new THREE.ConeGeometry(0.03, 0.09, 4), skin);
    nose.position.set(0, -0.015, 0.205);
    nose.rotation.x = 0.35;
    this.head.add(nose);
    if (o.moustache !== undefined || o.beard !== undefined) {
      const mo = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), mat(o.moustache ?? o.beard!));
      mo.position.set(0, -0.075, 0.18);
      this.head.add(mo);
    }
    if (o.beard !== undefined) {
      const b = mesh(new THREE.ConeGeometry(0.15, 0.36, 5), mat(o.beard));
      b.position.set(0, -0.2, 0.1);
      b.rotation.x = Math.PI + 0.25;
      this.head.add(b);
    }
    if (o.hair !== undefined) {
      const hair = mat(o.hair);
      if (o.long) {
        // İki örgü: omuzlardan öne sarkar.
        for (const sx of [-1, 1]) {
          const braid = mesh(new THREE.CylinderGeometry(0.035, 0.022, 0.62, 5), hair);
          braid.position.set(sx * 0.19, 1.42, 0.17);
          braid.rotation.z = -sx * 0.1;
          const tip = mesh(new THREE.IcosahedronGeometry(0.035, 0), trim);
          tip.position.set(sx * 0.22, 1.1, 0.17);
          this.rig.add(braid, tip);
        }
      } else {
        const back = mesh(new THREE.IcosahedronGeometry(0.2, 1), hair);
        back.position.set(0, -0.03, -0.045);
        back.scale.set(1.02, 0.95, 0.95);
        this.head.add(back);
      }
    }
    this.addHat(o.hat ?? 'bork', o.hatColor ?? o.trim ?? P.red, o.robe ?? P.indigo);
    this.rig.add(this.head);

    if (o.cloak !== undefined) this.addCloak(o.cloak, trimColor);
    if (o.wings !== undefined) this.addWings(o.wings);
    if (o.scale) this.group.scale.setScalar(o.scale);
  }

  private addHat(hat: Hat, color: number, robe: number): void {
    const h = this.head;
    if (hat === 'bork') {
      const fur = mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.11, 7), mat(P.darkBrown));
      fur.position.y = 0.13;
      const top = mesh(new THREE.CylinderGeometry(0.13, 0.21, 0.2, 7), mat(color));
      top.position.y = 0.27;
      const knob = mesh(new THREE.IcosahedronGeometry(0.04, 0), mat(P.gold));
      knob.position.y = 0.39;
      h.add(fur, top, knob);
    } else if (hat === 'kalpak') {
      const top = mesh(new THREE.ConeGeometry(0.22, 0.42, 7), mat(color));
      top.position.y = 0.3;
      const fur = mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.1, 7), mat(P.cream));
      fur.position.y = 0.12;
      h.add(fur, top);
    } else if (hat === 'turban') {
      const t = mesh(new THREE.IcosahedronGeometry(0.26, 1), mat(color));
      t.position.y = 0.15;
      t.scale.y = 0.62;
      const cap = mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.14, 6), mat(P.red));
      cap.position.y = 0.31;
      h.add(t, cap);
    } else if (hat === 'scarf') {
      const s = mesh(new THREE.IcosahedronGeometry(0.235, 1), mat(color));
      s.position.set(0, 0.04, -0.035);
      const drape = mesh(new THREE.ConeGeometry(0.25, 0.6, 6), mat(color));
      drape.position.set(0, -0.2, -0.1);
      const crown = mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 7), kilim(P.ochre, P.red, P.indigo));
      crown.position.y = 0.24;
      h.add(s, drape, crown);
    } else if (hat === 'hood') {
      const s = mesh(new THREE.IcosahedronGeometry(0.27, 1), mat(robe));
      s.position.set(0, 0.05, -0.06);
      const tip = mesh(new THREE.ConeGeometry(0.2, 0.35, 6), mat(robe));
      tip.position.set(0, 0.28, -0.12);
      tip.rotation.x = -0.5;
      h.add(s, tip);
    }
  }

  private addCloak(color: number, trim: number): void {
    const g = new THREE.Group();
    g.position.set(0, 1.6, -0.2);
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, 0);
    shape.lineTo(0.3, 0);
    shape.lineTo(0.5, -1.15);
    shape.lineTo(0.25, -1.25);
    shape.lineTo(0, -1.17);
    shape.lineTo(-0.25, -1.25);
    shape.lineTo(-0.5, -1.15);
    shape.closePath();
    g.add(mesh(new THREE.ShapeGeometry(shape), mat(color, { side: THREE.DoubleSide })));
    const clasp = mesh(new THREE.BoxGeometry(0.62, 0.06, 0.05), mat(trim));
    g.add(clasp);
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
    const m = mat(color, { side: THREE.DoubleSide });
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.08, 1.45, -0.22);
      const w = mesh(side === 1 ? geo : geo.clone(), m);
      w.scale.x = side;
      pivot.add(w);
      this.rig.add(pivot);
      if (side === 1) this.wingR = pivot;
      else this.wingL = pivot;
    }
  }

  /** Figürü yere oturtur: bacaklar öne uzanır, dizler hafif bükülür. */
  sit(): this {
    this.yOffset = -0.72;
    this.legL.rotation.set(-1.5, 0, -0.25);
    this.legR.rotation.set(-1.5, 0, 0.25);
    this.kneeL.rotation.x = this.kneeR.rotation.x = 0.3;
    return this;
  }

  /** Figürü diz çöktürür. */
  kneel(): this {
    this.yOffset = KNEEL_Y;
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
    if (this.cloak) this.cloak.rotation.x = 0.1 + 0.3 * a + Math.sin(t * 2.2 + this.phase) * 0.04 + Math.abs(s) * 0.06 * a;
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
    const body = mat(color);
    const dark = mat(mane);
    const inner = new THREE.Group();
    // rig'in ekseni arka ayaklardadır; şaha kalkınca arka ayaklar yerde kalır.
    this.rig.position.z = -0.6;
    inner.position.z = 0.6;
    this.rig.add(inner);
    this.group.add(this.rig);

    // Gövde: fıçı biçimli, göğüs ve sağrı yuvarlak
    const barrel = mesh(new THREE.CylinderGeometry(0.34, 0.36, 1.3, 8), body);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.y = 1.27;
    barrel.scale.set(0.88, 1, 1.02);
    const chest = mesh(new THREE.IcosahedronGeometry(0.37, 1), body);
    chest.position.set(0, 1.3, 0.62);
    chest.scale.set(0.86, 1.02, 0.9);
    const rump = mesh(new THREE.IcosahedronGeometry(0.39, 1), body);
    rump.position.set(0, 1.3, -0.62);
    rump.scale.set(0.88, 1, 0.92);
    inner.add(barrel, chest, rump);

    // Boyun, baş, yele
    this.neck.position.set(0, 1.42, 0.78);
    this.neck.rotation.x = 0.7;
    const neckM = mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.95, 6), body);
    neckM.position.y = 0.38;
    neckM.scale.x = 0.8;
    const head = new THREE.Group();
    head.position.set(0, 0.86, 0.06);
    head.rotation.x = 0.55;
    const skull = mesh(new THREE.BoxGeometry(0.24, 0.3, 0.4), body);
    const muzzle = mesh(new THREE.BoxGeometry(0.19, 0.22, 0.36), body);
    muzzle.position.set(0, -0.04, 0.34);
    const nose = mesh(new THREE.BoxGeometry(0.2, 0.12, 0.08), dark);
    nose.position.set(0, -0.08, 0.5);
    const bridle = mesh(new THREE.BoxGeometry(0.21, 0.24, 0.04), mat(P.red));
    bridle.position.set(0, -0.04, 0.24);
    const eyeGeo = new THREE.BoxGeometry(0.02, 0.05, 0.05);
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, mat(P.black));
      eye.position.set(sx * 0.125, 0.05, 0.08);
      const ear = mesh(new THREE.ConeGeometry(0.05, 0.17, 4), body);
      ear.position.set(sx * 0.09, 0.22, -0.12);
      head.add(eye, ear);
    }
    const forelock = mesh(new THREE.ConeGeometry(0.07, 0.22, 4), dark);
    forelock.position.set(0, 0.14, 0.12);
    forelock.rotation.x = 1.9;
    head.add(skull, muzzle, nose, bridle, forelock);
    this.neck.add(neckM, head);
    for (let i = 0; i < 6; i++) {
      const tuft = mesh(new THREE.BoxGeometry(0.07, 0.2, 0.2), dark);
      tuft.position.set(0, 0.08 + i * 0.15, -0.2 + i * 0.012);
      tuft.rotation.x = -0.25;
      this.neck.add(tuft);
    }
    inner.add(this.neck);

    // Bacaklar: üst bacak + bilek + toynak
    for (const [x, z] of [[-0.2, 0.66], [0.2, 0.66], [-0.2, -0.66], [0.2, -0.66]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 1.0, z);
      const upper = mesh(new THREE.BoxGeometry(0.17, 0.52, 0.2), body);
      upper.position.y = -0.24;
      const shin = new THREE.Group();
      shin.position.y = -0.5;
      const lower = mesh(new THREE.BoxGeometry(0.11, 0.44, 0.12), body);
      lower.position.y = -0.2;
      const hoof = mesh(new THREE.BoxGeometry(0.15, 0.1, 0.17), dark);
      hoof.position.y = -0.45;
      shin.add(lower, hoof);
      pivot.add(upper, shin);
      inner.add(pivot);
      this.legs.push(pivot);
      this.shins.push(shin);
    }

    // Kuyruk: iki boğumlu
    this.tail.position.set(0, 1.5, -0.95);
    this.tail.rotation.x = 0.5;
    const t1 = mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.45, 5), dark);
    t1.position.y = -0.2;
    this.tailTip.position.y = -0.42;
    const t2 = mesh(new THREE.ConeGeometry(0.1, 0.6, 5), dark);
    t2.position.y = -0.28;
    t2.rotation.x = Math.PI;
    this.tailTip.add(t2);
    this.tailTip.rotation.x = -0.35;
    this.tail.add(t1, this.tailTip);
    inner.add(this.tail);

    // Eyer ve kilim örtü
    const cloth = mesh(new THREE.BoxGeometry(0.66, 0.05, 0.86), kilim(P.red, P.ochre, P.indigo));
    cloth.position.y = 1.63;
    const saddle = mesh(new THREE.BoxGeometry(0.42, 0.1, 0.5), mat(P.darkBrown));
    saddle.position.y = 1.69;
    inner.add(cloth, saddle);
    this.seat.position.set(0, 0.94, -0.05);
    inner.add(this.seat);
  }

  /** Biniciyi eyere oturtur. */
  mount(rider: Human): void {
    rider.freeY = true;
    rider.group.position.set(0, 0, 0);
    rider.group.rotation.set(0, 0, 0);
    rider.legL.rotation.set(-0.7, 0, -0.5);
    rider.legR.rotation.set(-0.7, 0, 0.5);
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
    const d = new Human({ robe: P.cream, trim: P.teal, hat: 'turban', hatColor: P.white, beard: P.white, long: true, cloak: P.teal });
    const k = kopuz();
    k.position.set(0.12, 1.02, 0.34);
    k.rotation.z = 1.05;
    d.rig.add(k);
    d.armR.rotation.set(-0.95, 0, -0.35);
    d.armL.rotation.set(-1.1, 0, -0.5);
    return d;
  },
  /** Azrail: koyu giysili, ak sakallı, al kanatlı. */
  azrail: () => new Human({ robe: P.black, trim: P.crimson, hat: 'hood', skin: P.pale, beard: P.white, long: true, wings: P.red, scale: 1.15 }),
};
