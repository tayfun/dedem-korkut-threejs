import * as THREE from 'three';
import { Mover } from '../engine/stage';
import { P, mat, mesh } from './palette';
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
  /** Uzun etek: bacaklar görünmez. */
  long?: boolean;
  scale?: number;
  wings?: number;
}

/**
 * Basit geometrilerden kurulan insan figürü. Önü +z yönüne bakar, ayakları orijindedir.
 * Kollar ve bacaklar omuz/kalça ekseninden döner:
 * `rotation.x` eksi → öne, artı → arkaya; kollar için -3 → yukarı.
 */
export class Human extends Mover {
  /** Yatma, eğilme gibi tüm gövde hareketleri için. */
  rig = new THREE.Group();
  head = new THREE.Group();
  armL = new THREE.Group();
  armR = new THREE.Group();
  legL = new THREE.Group();
  legR = new THREE.Group();
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
  private legSwingL = new THREE.Group();
  private legSwingR = new THREE.Group();
  private phase = Math.random() * 10;

  constructor(o: HumanOpts = {}) {
    super();
    const robe = mat(o.robe ?? P.indigo);
    const trim = mat(o.trim ?? P.ochre);
    const skin = mat(o.skin ?? P.skin);
    const boots = mat(P.darkBrown);
    this.group.add(this.rig);

    // Bacaklar
    for (const [side, swing, leg] of [[-1, this.legSwingL, this.legL], [1, this.legSwingR, this.legR]] as const) {
      swing.position.set(side * 0.14, 0.86, 0);
      const m = mesh(new THREE.BoxGeometry(0.17, 0.86, 0.2), boots);
      m.position.y = -0.43;
      leg.add(m);
      swing.add(leg);
      this.rig.add(swing);
      if (o.long) swing.visible = false;
    }

    // Gövde ve etek
    const torso = mesh(new THREE.CylinderGeometry(0.23, 0.33, 0.82, 6), robe);
    torso.position.y = 1.22;
    const skirtH = o.long ? 0.8 : 0.42;
    const skirt = mesh(new THREE.CylinderGeometry(0.33, o.long ? 0.5 : 0.42, skirtH, 6), robe);
    skirt.position.y = 0.81 - skirtH / 2;
    const belt = mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.09, 6), trim);
    belt.position.y = 0.84;
    const collar = mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.08, 6), trim);
    collar.position.y = 1.63;
    this.rig.add(torso, skirt, belt, collar);

    // Kollar
    for (const [side, swing, arm, hand] of [[-1, this.swingL, this.armL, this.handL], [1, this.swingR, this.armR, this.handR]] as const) {
      swing.position.set(side * 0.31, 1.55, 0);
      arm.rotation.z = side * 0.14;
      const m = mesh(new THREE.BoxGeometry(0.14, 0.66, 0.15), robe);
      m.position.y = -0.3;
      const h = mesh(new THREE.IcosahedronGeometry(0.08, 0), skin);
      hand.position.y = -0.68;
      hand.add(h);
      arm.add(m, hand);
      swing.add(arm);
      this.rig.add(swing);
    }

    // Baş
    this.head.position.y = 1.84;
    const skull = mesh(new THREE.IcosahedronGeometry(0.2, 1), skin);
    this.head.add(skull);
    const eyeGeo = new THREE.BoxGeometry(0.04, 0.045, 0.02);
    for (const sx of [-0.075, 0.075]) {
      const e = new THREE.Mesh(eyeGeo, mat(P.black));
      e.position.set(sx, 0.03, 0.185);
      this.head.add(e);
    }
    if (o.beard !== undefined) {
      const b = mesh(new THREE.ConeGeometry(0.15, 0.36, 5), mat(o.beard));
      b.position.set(0, -0.2, 0.1);
      b.rotation.x = Math.PI + 0.25;
      this.head.add(b);
    }
    this.addHat(o.hat ?? 'bork', o.hatColor ?? o.trim ?? P.red, o.robe ?? P.indigo);
    this.rig.add(this.head);

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
      h.add(fur, top);
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
      h.add(t);
    } else if (hat === 'scarf') {
      const s = mesh(new THREE.IcosahedronGeometry(0.235, 1), mat(color));
      s.position.set(0, 0.04, -0.035);
      const drape = mesh(new THREE.ConeGeometry(0.25, 0.6, 6), mat(color));
      drape.position.set(0, -0.2, -0.1);
      const crown = mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 7), mat(P.ochre));
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

  /** Figürü oturtur: bacaklar öne uzanır, gövde alçalır. */
  sit(): this {
    this.yOffset = -0.72;
    this.legL.rotation.x = -1.5;
    this.legR.rotation.x = -1.5;
    this.legL.rotation.z = -0.25;
    this.legR.rotation.z = 0.25;
    return this;
  }

  update(t: number): void {
    const a = this.walkAmp;
    const s = Math.sin(t * this.walkSpeed + this.phase);
    this.legSwingL.rotation.x = s * 0.65 * a;
    this.legSwingR.rotation.x = -s * 0.65 * a;
    this.swingL.rotation.x = -s * 0.45 * a * this.armSwing;
    this.swingR.rotation.x = s * 0.45 * a * this.armSwing;
    this.rig.position.y = Math.abs(Math.cos(t * this.walkSpeed + this.phase)) * 0.05 * a;
    if (this.wingL && this.wingR) {
      const f = Math.sin(t * 4.5 + this.phase) * this.flap;
      this.wingR.rotation.y = 0.45 - f;
      this.wingL.rotation.y = -0.45 + f;
    }
  }
}

/* ------------------------------------------------------------------ */
/* At                                                                  */
/* ------------------------------------------------------------------ */

/** At: önü +z yönünde. `seat` binicinin oturduğu noktadır; `rig` arka ayaklar üzerinde şaha kalkar. */
export class Horse extends Mover {
  rig = new THREE.Group();
  seat = new THREE.Group();
  neck = new THREE.Group();
  private legs: THREE.Group[] = [];
  private tail = new THREE.Group();
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

    const torso = mesh(new THREE.BoxGeometry(0.56, 0.62, 1.7), body);
    torso.position.y = 1.25;
    inner.add(torso);

    this.neck.position.set(0, 1.42, 0.75);
    this.neck.rotation.x = 0.7;
    const neckM = mesh(new THREE.BoxGeometry(0.3, 0.95, 0.42), body);
    neckM.position.y = 0.4;
    const head = mesh(new THREE.BoxGeometry(0.27, 0.32, 0.72), body);
    head.position.set(0, 0.86, 0.2);
    head.rotation.x = 0.35;
    const mn = mesh(new THREE.BoxGeometry(0.08, 0.95, 0.14), dark);
    mn.position.set(0, 0.45, -0.25);
    const earGeo = new THREE.ConeGeometry(0.05, 0.16, 4);
    for (const sx of [-0.09, 0.09]) {
      const ear = mesh(earGeo, body);
      ear.position.set(sx, 1.08, 0.0);
      this.neck.add(ear);
    }
    this.neck.add(neckM, head, mn);
    inner.add(this.neck);

    const legGeo = new THREE.BoxGeometry(0.15, 0.98, 0.17);
    for (const [x, z] of [[-0.2, 0.68], [0.2, 0.68], [-0.2, -0.68], [0.2, -0.68]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.98, z);
      const l = mesh(legGeo, body);
      l.position.y = -0.49;
      const hoof = mesh(new THREE.BoxGeometry(0.17, 0.12, 0.2), dark);
      hoof.position.y = -0.92;
      pivot.add(l, hoof);
      inner.add(pivot);
      this.legs.push(pivot);
    }

    this.tail.position.set(0, 1.45, -0.85);
    const tailM = mesh(new THREE.ConeGeometry(0.1, 0.9, 5), dark);
    tailM.position.y = -0.42;
    this.tail.add(tailM);
    this.tail.rotation.x = 0.35;
    inner.add(this.tail);

    const saddle = mesh(new THREE.BoxGeometry(0.62, 0.1, 0.7), mat(P.red));
    saddle.position.y = 1.6;
    inner.add(saddle);
    this.seat.position.set(0, 0.92, -0.05);
    inner.add(this.seat);
  }

  /** Biniciyi eyere oturtur. */
  mount(rider: Human): void {
    rider.freeY = true;
    rider.group.position.set(0, 0, 0);
    rider.group.rotation.set(0, 0, 0);
    rider.legL.rotation.set(-0.5, 0, -0.5);
    rider.legR.rotation.set(-0.5, 0, 0.5);
    this.seat.add(rider.group);
  }

  update(t: number): void {
    const a = this.walkAmp;
    const s = Math.sin(t * this.walkSpeed + this.phase);
    const c = Math.cos(t * this.walkSpeed + this.phase);
    this.legs[0].rotation.x = s * 0.6 * a;
    this.legs[1].rotation.x = c * 0.6 * a;
    this.legs[2].rotation.x = -c * 0.6 * a;
    this.legs[3].rotation.x = -s * 0.6 * a;
    this.rig.position.y = Math.abs(s) * 0.1 * a;
    this.tail.rotation.z = Math.sin(t * 3 + this.phase) * 0.2;
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
    const d = new Human({ robe: P.cream, trim: P.teal, hat: 'turban', hatColor: P.white, beard: P.white, long: true });
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
