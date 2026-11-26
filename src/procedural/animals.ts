import * as THREE from 'three';
import { Mover } from '../engine/stage';
import { HIP, type Human } from './human';
import { P, kilim, mat, mesh, toon } from './palette';

/** Hayvanlar: at, aslan, koyun, boğa, geyik, köpek, kuş. Yeni hayvanlar da buraya eklenir. */

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

/** Dört ayaklı hayvanlar için ortak bacak düzeni: dört kapsül, çapraz adım. */
function fourLegs(parent: THREE.Object3D, material: THREE.Material, x: number, zFront: number, zBack: number, top: number, radius: number): THREE.Group[] {
  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-x, zFront], [x, zFront], [-x, zBack], [x, zBack]]) {
    const pivot = new THREE.Group();
    pivot.position.set(lx, top, lz);
    const leg = mesh(new THREE.CapsuleGeometry(radius, top - radius * 2, 4, 8), material);
    leg.position.y = -top / 2;
    pivot.add(leg);
    parent.add(pivot);
    legs.push(pivot);
  }
  return legs;
}

/** Aslan: yeleli, önü +z yönünde. */
export class Lion extends Mover {
  rig = new THREE.Group();
  head = new THREE.Group();
  private legs: THREE.Group[];
  private tail = new THREE.Group();
  private phase = Math.random() * 10;

  constructor() {
    super();
    this.walkSpeed = 9;
    const fur = toon(P.lion);
    const dark = toon(P.lionDark);
    this.group.add(this.rig);
    const body = mesh(new THREE.CapsuleGeometry(0.33, 0.8, 5, 14), fur);
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.85;
    const chest = mesh(new THREE.SphereGeometry(0.38, 12, 10), fur);
    chest.position.set(0, 0.92, 0.4);
    this.rig.add(body, chest);
    this.legs = fourLegs(this.rig, fur, 0.2, 0.42, -0.5, 0.7, 0.1);

    this.head.position.set(0, 1.15, 0.72);
    const mane = mesh(new THREE.SphereGeometry(0.46, 14, 10), dark);
    mane.position.z = -0.1;
    mane.scale.set(1, 1.05, 0.8);
    const skull = mesh(new THREE.SphereGeometry(0.3, 14, 10), fur);
    skull.position.z = 0.12;
    const muzzle = mesh(new THREE.SphereGeometry(0.16, 10, 8), toon(P.cream));
    muzzle.position.set(0, -0.08, 0.38);
    muzzle.scale.set(1.1, 0.8, 1);
    const nose = mesh(new THREE.SphereGeometry(0.05, 8, 6), toon(P.black));
    nose.position.set(0, -0.02, 0.52);
    this.head.add(mane, skull, muzzle, nose);
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), toon(0x1a1210));
      eye.position.set(sx * 0.13, 0.08, 0.37);
      const ear = mesh(new THREE.SphereGeometry(0.09, 8, 6), fur);
      ear.position.set(sx * 0.24, 0.3, 0.02);
      this.head.add(eye, ear);
    }
    this.rig.add(this.head);

    this.tail.position.set(0, 1.0, -0.72);
    const t = mesh(new THREE.CapsuleGeometry(0.035, 0.7, 3, 6), fur);
    t.position.y = -0.36;
    const tuft = mesh(new THREE.SphereGeometry(0.09, 8, 6), dark);
    tuft.position.y = -0.76;
    this.tail.add(t, tuft);
    this.tail.rotation.x = 0.9;
    this.rig.add(this.tail);
  }

  update(t: number): void {
    const a = this.walkAmp;
    const ph = t * this.walkSpeed + this.phase;
    [0, Math.PI, Math.PI, 0].forEach((off, i) => (this.legs[i].rotation.x = Math.sin(ph + off) * 0.6 * a));
    this.rig.position.y = Math.abs(Math.sin(ph)) * 0.05 * a;
    this.tail.rotation.z = Math.sin(t * 2.4 + this.phase) * 0.35;
  }
}

/** Koyun; `ram` ise kıvrık boynuzlu koç. Önü +z yönünde. */
export class Sheep extends Mover {
  rig = new THREE.Group();
  private legs: THREE.Group[];
  private phase = Math.random() * 10;

  constructor(ram = false) {
    super();
    this.walkSpeed = 12;
    const wool = toon(P.wool);
    const dark = toon(P.darkBrown);
    this.group.add(this.rig);
    const body = mesh(new THREE.SphereGeometry(0.4, 12, 10), wool);
    body.scale.set(0.85, 0.8, 1.25);
    body.position.y = 0.62;
    this.rig.add(body);
    for (const [x, y, z] of [[0.18, 0.86, 0.2], [-0.2, 0.84, -0.1], [0.1, 0.88, -0.3], [-0.12, 0.86, 0.3]]) {
      const puff = mesh(new THREE.SphereGeometry(0.2, 8, 6), wool);
      puff.position.set(x, y, z);
      this.rig.add(puff);
    }
    this.legs = fourLegs(this.rig, dark, 0.16, 0.28, -0.3, 0.4, 0.05);
    const head = mesh(new THREE.SphereGeometry(0.16, 10, 8), dark);
    head.scale.set(0.85, 1, 1.25);
    head.position.set(0, 0.8, 0.55);
    this.rig.add(head);
    for (const sx of [-1, 1]) {
      const ear = mesh(new THREE.SphereGeometry(0.06, 6, 5), dark);
      ear.scale.set(1.6, 0.5, 0.8);
      ear.position.set(sx * 0.17, 0.84, 0.48);
      this.rig.add(ear);
      if (ram) {
        const horn = mesh(new THREE.TorusGeometry(0.13, 0.04, 6, 10, 4.2), toon(P.cream));
        horn.position.set(sx * 0.17, 0.9, 0.44);
        horn.rotation.set(0, (sx * Math.PI) / 2, 0.4);
        this.rig.add(horn);
      }
    }
    if (ram) this.group.scale.setScalar(1.25);
  }

  update(t: number): void {
    const a = this.walkAmp;
    const ph = t * this.walkSpeed + this.phase;
    [0, Math.PI, Math.PI, 0].forEach((off, i) => (this.legs[i].rotation.x = Math.sin(ph + off) * 0.6 * a));
    this.rig.position.y = Math.abs(Math.sin(ph)) * 0.04 * a;
  }
}

export type BeastKind = 'bull' | 'deer' | 'dog';

const BEASTS: Record<BeastKind, { color: number; r: number; len: number; top: number; leg: number; x: number; head: number; neck: number; speed: number }> = {
  bull: { color: P.darkBrown, r: 0.5, len: 1.1, top: 0.85, leg: 0.12, x: 0.3, head: 0.3, neck: 0.1, speed: 10 },
  deer: { color: P.lion, r: 0.27, len: 0.75, top: 0.85, leg: 0.05, x: 0.16, head: 0.16, neck: 0.55, speed: 14 },
  dog: { color: P.stone, r: 0.18, len: 0.5, top: 0.42, leg: 0.05, x: 0.11, head: 0.15, neck: 0.12, speed: 15 },
};

/** Dört ayaklı yalın hayvan: boğa (boynuzlu), geyik (çatal boynuzlu), köpek. Önü +z yönünde. */
export class Beast extends Mover {
  rig = new THREE.Group();
  head = new THREE.Group();
  private legs: THREE.Group[];
  private phase = Math.random() * 10;

  constructor(kind: BeastKind, color?: number) {
    super();
    const d = BEASTS[kind];
    this.walkSpeed = d.speed;
    const fur = toon(color ?? d.color);
    this.group.add(this.rig);
    const y = d.top + d.r * 0.75;
    const body = mesh(new THREE.CapsuleGeometry(d.r, d.len, 5, 14), fur);
    body.rotation.x = Math.PI / 2;
    body.position.y = y;
    this.rig.add(body);
    if (kind === 'bull') {
      const hump = mesh(new THREE.SphereGeometry(d.r * 0.85, 12, 10), fur);
      hump.position.set(0, y + d.r * 0.45, d.len * 0.4);
      this.rig.add(hump);
    }
    this.legs = fourLegs(this.rig, fur, d.x, d.len * 0.5, -d.len * 0.5, d.top, d.leg);

    const front = d.len / 2 + d.r * 0.6;
    if (d.neck > 0.3) {
      const neck = mesh(new THREE.CapsuleGeometry(d.leg * 1.6, d.neck, 4, 8), fur);
      neck.position.set(0, y + d.neck * 0.55, front - 0.05);
      neck.rotation.x = 0.35;
      this.rig.add(neck);
    }
    this.head.position.set(0, y + d.neck, front + d.neck * 0.25);
    const skull = mesh(new THREE.SphereGeometry(d.head, 12, 10), fur);
    skull.scale.set(0.85, 0.9, 1.15);
    const muzzle = mesh(new THREE.SphereGeometry(d.head * 0.6, 10, 8), toon(kind === 'bull' ? P.cream : P.black));
    muzzle.position.set(0, -d.head * 0.3, d.head * 0.95);
    muzzle.scale.set(1.1, 0.8, 0.9);
    this.head.add(skull, muzzle);
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(d.head * 0.14, 8, 6), toon(0x1a1210));
      eye.position.set(sx * d.head * 0.55, d.head * 0.2, d.head * 0.85);
      const ear = mesh(new THREE.SphereGeometry(d.head * 0.3, 6, 5), fur);
      ear.scale.set(1.5, 0.5, 0.8);
      ear.position.set(sx * d.head * 0.95, d.head * 0.45, -d.head * 0.1);
      this.head.add(eye, ear);
      if (kind === 'bull') {
        const horn = mesh(new THREE.ConeGeometry(0.07, 0.5, 6), toon(P.cream));
        horn.position.set(sx * 0.36, 0.3, 0.05);
        horn.rotation.z = -sx * 0.9;
        this.head.add(horn);
      } else if (kind === 'deer') {
        for (const [dy, rz, len] of [[0.22, 0.25, 0.4], [0.3, 0.9, 0.22], [0.36, -0.3, 0.2]]) {
          const tine = mesh(new THREE.ConeGeometry(0.02, len, 4), toon(P.cream));
          tine.position.set(sx * (0.08 + rz * 0.08), dy + len * 0.3, -0.04);
          tine.rotation.z = -sx * rz;
          this.head.add(tine);
        }
      }
    }
    this.rig.add(this.head);
    const tail = mesh(new THREE.CapsuleGeometry(d.leg * 0.6, d.top * (kind === 'bull' ? 0.7 : 0.25), 3, 6), kind === 'deer' ? toon(P.white) : fur);
    tail.position.set(0, y + d.r * 0.3, -front + 0.02);
    tail.rotation.x = kind === 'dog' ? -0.9 : 0.3;
    this.rig.add(tail);
  }

  update(t: number): void {
    const a = this.walkAmp;
    const ph = t * this.walkSpeed + this.phase;
    [0, Math.PI, Math.PI, 0].forEach((off, i) => (this.legs[i].rotation.x = Math.sin(ph + off) * 0.6 * a));
    this.rig.position.y = Math.abs(Math.sin(ph)) * 0.05 * a;
  }
}
