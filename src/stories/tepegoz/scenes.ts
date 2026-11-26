import * as THREE from 'three';
import { armsDown, cam, faceTo, fall, grieve, kneelDown, launch, mood, newTimeline, place, plead, pop, raiseArms, shakeHead, standUp, sway, toss, turn, vanish, walkTo } from '../../engine/direct';
import type { Stage } from '../../engine/stage';
import type { SceneDef } from '../../engine/story';
import { Horse, Lion, Sheep } from '../../procedural/animals';
import { child, dedeKorkut, elderWoman, lady, villager, warrior } from '../../procedural/cast';
import type { Human } from '../../procedural/human';
import { P, mat, mesh } from '../../procedural/palette';
import { arrow, bow, ring, spit, sword } from '../../procedural/props';
import { tree } from '../../procedural/terrain';
import { CAVE, FIRE, POND, aruz, basat, bayindir, campSet, kayaSet, kazan, koca, kumbet, peri, pinarSet, reeds, shepherd, tepegoz, wildBoy, yiginak } from './sets';

/** Basat ile Tepegöz — sahnelerin 3B kurulumu ve animasyonu. Metinler `story.ts` içindedir. */

type TL = gsap.core.Timeline;
type V3 = [number, number, number];

const E = Math.PI / 2; // doğuya (+x) bakış
const W = -Math.PI / 2; // batıya (-x) bakış

/** Atlı bir kişi: atı sahneye koyar, biniciyi eyere oturtur. */
function rider(stage: Stage, who: Human, x: number, z: number, ry: number, color: number = P.brown): Horse {
  const h = stage.track(place(new Horse(color), x, z, ry));
  stage.track(who, false);
  h.mount(who);
  return h;
}

/** Yaylı bir okçunun duruşu: yay sol elde, kol öne uzanmış. */
function withBow(m: Human): Human {
  m.handL.add(bow());
  m.armL.rotation.x = -1.5;
  m.armSwing = 0.2;
  return m;
}

/** Bir ok atar; hedefe varınca iki parçaya ayrılıp yere düşer. */
function brokenArrow(tl: TL, stage: Stage, from: V3, to: V3, at: number): void {
  launch(tl, stage.add(arrow()), from, to, at, 0.4);
  for (const dx of [-0.8, 0.9]) {
    const piece = stage.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.35, 4), mat(P.brown), false));
    piece.rotation.z = 1.2;
    toss(tl, piece, to, [to[0] + dx - 1.2, 0.1, to[2] + 1.4 + dx], at + 0.4, 0.55);
  }
}

/** Uyuyan ya da yatan Tepegöz: gövdesi doğu-batı doğrultusunda, başı batıda. */
function sleeping(stage: Stage, x: number, z: number): Human {
  const t = stage.track(place(tepegoz(), x, z, E)).lie();
  t.eyesClosed = true;
  return t;
}

export const scenes: SceneDef[] = [
  /* Oğuz ürker; oğlancık düşer, aslan bulur */
  {
    id: 'aslan',
    build(stage) {
      campSet(stage, 'night');
      const tl = newTimeline();
      const folk = [0, 2, 3, 4].map((k, i) => stage.track(place(villager(k, { mood: 'fear' }), 4 + i * 2.2, 1 + (i % 2) * 2.4, W)));
      folk.forEach((f) => (f.walkSpeed = 14));
      const boy = stage.track(place(child(1, { hat: 'none', mood: 'fear' }), 8, 4.2, W));
      boy.walkSpeed = 15;
      const lion = stage.track(place(new Lion(), 24, -4, W));
      lion.walkSpeed = 7;
      stage.setCamera([-3, 4.5, 17], [4, 1.2, 1]);

      folk.forEach((f, i) => walkTo(tl, f, -34 - i * 2, 3 + i, 6, 0.2 + i * 0.3));
      walkTo(tl, boy, 3, 3.4, 1.6, 0.6);
      fall(tl, boy, 2.2, 0.4);
      // Oğlancık doğrulur, oturup kalır.
      tl.to(boy.rig.rotation, { x: 0, duration: 0.6 }, 4.6);
      tl.to(boy, { yOffset: -0.34, duration: 0.6 }, 4.6);
      tl.to([boy.legL.rotation, boy.legR.rotation], { x: -1.5, duration: 0.6 }, 4.6);
      walkTo(tl, lion, 5.2, 3.2, 4.2, 5.2);
      tl.to(lion.head.rotation, { x: 0.45, duration: 0.6 }, 9.6);
      mood(tl, boy, 'happy', 10);
      faceTo(tl, boy, 5.2, 3.2, 9.6);
      tl.to(boy.armL.rotation, { x: -1.5, duration: 0.6 }, 10.1);
      cam(tl, stage, [2, 2.2, 11], [4, 0.9, 3], 5.5, 5);
      return tl;
    },
  },

  /* Yılkıcı haber verir; beyler oğlanı aslan yatağında bulur */
  {
    id: 'yilkici',
    build(stage) {
      campSet(stage, 'day');
      const tl = newTimeline();
      reeds(stage, 9, 2, 3.4, 70, 9);
      const lion = stage.track(place(new Lion(), 7.6, 2.6, W));
      lion.walkSpeed = 14;
      const boy = stage.track(place(wildBoy(), 9.4, 3.6, W)).sit();
      const herder = stage.track(place(villager(3), -5, 0.5, E));
      herder.armR.rotation.x = -1.5;
      const han = rider(stage, bayindir(), -22, 3, E, P.darkBrown);
      const kz = rider(stage, kazan(), -24, 6, E);
      const a = stage.track(place(aruz(), -20, 1, E));
      a.walkSpeed = 11;
      stage.setCamera([-10, 4, 17], [-2, 1.5, 2]);

      walkTo(tl, han, -3, 3.2, 3.6, 0);
      walkTo(tl, kz, -5.5, 6, 3.8, 0.2);
      walkTo(tl, a, -1, 1.4, 3.8, 0.3);
      // Aslan kükrer, sazdan çıkıp kaçar.
      tl.to(lion.head.rotation, { x: -0.5, duration: 0.3 }, 4.0);
      tl.to(lion.head.rotation, { x: 0, duration: 0.3 }, 4.6);
      mood(tl, boy, 'fear', 4.0);
      walkTo(tl, lion, 34, -10, 3.4, 4.8);
      cam(tl, stage, [3, 2.8, 12], [7, 1.2, 2.6], 4, 3.6);
      standUp(tl, boy, 5.2);
      faceTo(tl, boy, 34, -10, 5.2);
      walkTo(tl, a, 6.8, 3.4, 1.8, 5.4);
      kneelDown(tl, a, 7.3);
      plead(tl, a, 7.5);
      faceTo(tl, boy, 6.8, 3.4, 8.0);
      mood(tl, boy, 'neutral', 8.4);
      return tl;
    },
  },

  /* Dede Korkut ad verir: Basat */
  {
    id: 'ad',
    build(stage) {
      campSet(stage, 'dusk');
      const tl = newTimeline();
      const dede = stage.track(place(dedeKorkut(), 1.8, 0.8, W));
      const boy = stage.track(place(wildBoy(), -9, 4, W));
      const a = stage.track(place(aruz(), -2.6, -0.6, W));
      const mother = stage.track(place(lady({ robe: P.crimson }), -3.8, 0.9, W));
      stage.setCamera([-4, 3, 14], [-2, 1.4, 1]);

      // Oğlan yine aslan yatağına yönelir; çağırırlar, döner.
      walkTo(tl, boy, -12, 5, 1.2, 0);
      tl.to(a.armR.rotation, { x: -1.5, duration: 0.4 }, 0.9);
      tl.to(a.armR.rotation, { x: 0, duration: 0.5 }, 2.2);
      walkTo(tl, boy, 0.2, 1.0, 2.8, 1.8);
      faceTo(tl, a, 0.2, 1.0, 4.4);
      faceTo(tl, mother, 0.2, 1.0, 4.6);
      faceTo(tl, boy, 1.8, 0.8, 4.6);
      cam(tl, stage, [0, 2.2, 8.5], [0.8, 1.2, 0.8], 4, 2.5);
      // Dede elini oğlanın üstüne uzatır.
      tl.to(dede.armL.rotation, { x: -1.9, z: 0, duration: 0.8, ease: 'power2.out' }, 5.2);
      mood(tl, boy, 'happy', 6.8);
      raiseArms(tl, boy, 7.2);
      mood(tl, [a, mother], 'happy', 7.2);
      raiseArms(tl, a, 7.6);
      return tl;
    },
  },

  /* Çoban ve peri kızları */
  {
    id: 'peri',
    build(stage) {
      pinarSet(stage, 'day');
      const tl = newTimeline();
      const sh = stage.track(place(shepherd(), -9, 2, E));
      const flock = [0, 1, 2, 3, 4].map((i) => stage.track(place(new Sheep(), -8 + i * 1.3, 4.4 + (i % 2) * 1.6, E)));
      const peris = [0, 1, 2].map(() => {
        const p = stage.track(peri());
        p.freeY = true;
        p.flap = 0.5;
        return p;
      });
      // Periler pınarın üstünde halka olup döner; yakalanınca halka bozulur.
      const ringDance = { on: true };
      const orbit = (t: number) => {
        if (!ringDance.on) return;
        peris.forEach((p, i) => {
          const a = t * 0.9 + (i * Math.PI * 2) / 3;
          p.group.position.set(POND.x + Math.cos(a) * 2, 2.6 + Math.sin(t * 2 + i) * 0.2, POND.z + Math.sin(a) * 2);
          p.group.rotation.y = -a;
        });
      };
      orbit(0);
      stage.onTick(orbit);
      const cloth = stage.add(mesh(new THREE.CircleGeometry(1.3, 10), mat(P.cream, { side: THREE.DoubleSide })));
      cloth.rotation.x = -Math.PI / 2;
      stage.setCamera([-5, 3.4, 14], [0, 1.8, -1]);

      flock.forEach((s, i) => walkTo(tl, s, -26 - i * 2, 8 + i, 2.6, 1.0 + i * 0.1));
      faceTo(tl, sh, POND.x, POND.z, 1.3);
      walkTo(tl, sh, -2.2, -1, 2.4, 1.7);
      tl.to(sh.armL.rotation, { x: -2.4, duration: 0.3 }, 4.0);
      toss(tl, cloth, [-2, 1.8, -1.2], [1, 2.6, -2.4], 4.3, 0.5);
      tl.call(() => (ringDance.on = false), [], 4.7);
      mood(tl, peris, 'fear', 4.7);
      tl.to(peris[1].group.position, { x: 12, y: 20, z: -30, duration: 3, ease: 'power1.in' }, 4.8);
      tl.to(peris[2].group.position, { x: -8, y: 22, z: -34, duration: 3, ease: 'power1.in' }, 4.9);
      tl.to(peris[0].group.position, { x: 0, y: 0, z: -0.9, duration: 0.6, ease: 'power2.in' }, 4.8);
      tl.to(peris[0], { flap: 0.08, duration: 0.4 }, 5.2);
      walkTo(tl, sh, -1.1, -0.9, 0.8, 5.4);
      // Kamera başını çevirir.
      cam(tl, stage, [-6, 3, 13], [-20, 7, -6], 1.6, 6.0);
      // Peri kanat vurup uçar.
      tl.to(peris[0], { flap: 0.7, duration: 0.3 }, 8.2);
      tl.to(peris[0].group.position, { x: 4, y: 8.5, z: -12, duration: 3.4, ease: 'power1.in' }, 8.4);
      cam(tl, stage, [-5, 2.6, 13], [1.5, 4.6, -6], 2.2, 8.2);
      mood(tl, sh, 'fear', 8.6);
      tl.to(sh.head.rotation, { x: -0.5, duration: 0.5 }, 8.6);
      return tl;
    },
  },

  /* Yığınak: vurdukça büyür */
  {
    id: 'yiginak',
    build(stage) {
      pinarSet(stage, 'dawn');
      const tl = newTimeline();
      const blob = stage.add(yiginak(stage));
      blob.position.set(-1.6, 0.4, 0.6);
      const p = stage.track(place(peri(), 3, -3.2, -1.2));
      p.freeY = true;
      p.flap = 0.5;
      p.group.position.y = 3.2;
      const sh = stage.track(place(shepherd(), -5.8, 2.4, E));
      sh.setMood('fear');
      const flock = [0, 1, 2].map((i) => stage.track(place(new Sheep(), -10 + i * 1.4, 5 + i * 0.8, E)));
      stage.setCamera([-7, 2.8, 12], [-2, 1.4, 0]);

      flock.forEach((s, i) => walkTo(tl, s, -28 - i * 2, 9 + i, 2.6, 0.4 + i * 0.1));
      tl.to(p.armR.rotation, { x: -1.0, duration: 0.5 }, 0.5);
      tl.to(p.group.position, { x: 10, y: 20, z: -30, duration: 3.2, ease: 'power1.in' }, 2.6);
      // Sapan taşları: her vuruşta yığınak büyür.
      [4.0, 5.3, 6.6].forEach((at, i) => {
        const stone = stage.add(mesh(new THREE.IcosahedronGeometry(0.09, 0), mat(P.stoneDark)));
        tl.to(sh.armR.rotation, { x: -2.7, duration: 0.25 }, at - 0.45);
        tl.to(sh.armR.rotation, { x: -0.5, duration: 0.15 }, at - 0.15);
        toss(tl, stone, [-5.4, 1.6, 2.4], [-1.6, 0.6, 0.6], at, 0.5);
        const k = [1.6, 2.2, 2.9][i];
        tl.to(blob.scale, { x: k, y: k * 0.78, z: k, duration: 0.5, ease: 'back.out(3)' }, at + 0.5);
        tl.to(blob.position, { y: 0.4 * k, duration: 0.5 }, at + 0.5);
      });
      cam(tl, stage, [-5, 2.4, 9], [-2, 1.2, 0.6], 4, 3.6);
      turn(tl, sh, W, 8.0, 0.3);
      sh.walkSpeed = 15;
      walkTo(tl, sh, -30, 6, 3, 8.2);
      return tl;
    },
  },

  /* Yığınak yarılır: Tepegöz doğar */
  {
    id: 'dogum',
    build(stage) {
      pinarSet(stage, 'day');
      const tl = newTimeline();
      const blob = stage.add(yiginak(stage));
      blob.scale.set(2.9, 2.9 * 0.78, 2.9);
      blob.position.set(-1.6, 1.16, 0.6);
      const baby = stage.track(place(tepegoz(0.5, { mood: 'neutral' }), -1.6, 0.6, W)).sit();
      baby.group.scale.setScalar(0.001);
      const han = rider(stage, bayindir(), -10, 5, 1.2, P.darkBrown);
      const kz = stage.track(place(kazan(), -5.2, 2.2, E));
      const a = stage.track(place(aruz(), -11, 1.6, E));
      stage.setCamera([-6, 3.2, 14], [-3.5, 1.4, 1]);

      // Bir yiğit teper; teptikçe büyür.
      walkTo(tl, kz, -4.2, 1.4, 0.9, 0.3);
      [1.4, 2.5].forEach((at, i) => {
        tl.to(kz.legR.rotation, { x: -1.3, duration: 0.15, yoyo: true, repeat: 1 }, at);
        const k = [3.3, 3.7][i];
        tl.to(blob.scale, { x: k, y: k * 0.78, z: k, duration: 0.4, ease: 'back.out(3)' }, at + 0.15);
        tl.to(blob.position, { y: 0.4 * k, duration: 0.4 }, at + 0.15);
      });
      mood(tl, kz, 'fear', 2.7);
      walkTo(tl, kz, -6.4, 3.2, 0.9, 3.1);
      faceTo(tl, kz, -1.6, 0.6, 4.1);
      // Aruz teper; mahmuzu dokunur, yığınak yarılır.
      walkTo(tl, a, -4.4, 0.5, 2.2, 3.0);
      tl.to(a.legR.rotation, { x: -1.3, duration: 0.15, yoyo: true, repeat: 1 }, 5.4);
      vanish(tl, blob, 5.6, 0.3);
      pop(tl, baby.group, 5.7, 0.5, 0.5);
      tl.to(han.rig.rotation, { x: -0.45, duration: 0.4, yoyo: true, repeat: 1 }, 5.8);
      mood(tl, [a], 'fear', 5.8);
      cam(tl, stage, [-4, 2, 8], [-2.6, 0.8, 0.6], 3, 5.2);
      // Aruz oğlanı eteğine sarar.
      walkTo(tl, a, -2.9, 0.6, 0.9, 6.8);
      kneelDown(tl, a, 7.8);
      plead(tl, a, 8.0);
      mood(tl, a, 'neutral', 8.0);
      return tl;
    },
  },

  /* Dadılar ölür, oğlancıklar yenir; Aruz kovar */
  {
    id: 'buyume',
    build(stage) {
      campSet(stage, 'dusk');
      const tl = newTimeline();
      const t = stage.track(place(tepegoz(1.0, { mood: 'neutral' }), -0.5, 1, E));
      for (const [x, z] of [[-5, 0.4], [-6.8, 2.2]]) {
        const nurse = stage.track(place(lady({ robe: x < -6 ? P.indigo : P.green, blush: false }), x, z, 0.4)).lie();
        nurse.eyesClosed = true;
      }
      const kids = [stage.track(place(child(0, { mood: 'happy' }), 3.4, 1.8, W)), stage.track(place(child(1, { mood: 'happy' }), 4.6, 0.4, W))];
      kids.forEach((k) => (k.walkSpeed = 15));
      const a = stage.track(place(aruz({ mood: 'angry' }), -3, -4.6, 0.6));
      stage.setCamera([0, 3, 13], [0.5, 1.2, 0.5]);

      walkTo(tl, t, 2.4, 1.3, 1.6, 0.8);
      plead(tl, t, 2.5);
      mood(tl, kids, 'fear', 2.6);
      walkTo(tl, kids[0], 16, 6, 2, 2.8);
      walkTo(tl, kids[1], 17, -1, 2, 2.9);
      mood(tl, t, 'happy', 3.0);
      tl.to(t.armR.rotation, { x: -2.2, duration: 0.3, yoyo: true, repeat: 3 }, 3.1);
      // Aruz döver, söver, kovar.
      walkTo(tl, a, 0.8, 0.4, 1.6, 3.6);
      faceTo(tl, t, 0.8, 0.4, 5.2);
      for (const at of [5.3, 6.0]) {
        tl.to(a.armR.rotation, { x: -2.8, duration: 0.25 }, at);
        tl.to(a.armR.rotation, { x: -0.9, duration: 0.12, ease: 'power3.in' }, at + 0.3);
      }
      mood(tl, t, 'angry', 5.7);
      tl.to(t.head.rotation, { x: 0.4, duration: 0.3 }, 5.7);
      tl.to(a.armR.rotation, { x: 0, duration: 0.3 }, 6.6);
      tl.to(a.armL.rotation, { x: -1.4, z: -0.9, duration: 0.5, ease: 'power2.out' }, 6.9);
      tl.to(t.head.rotation, { x: 0, duration: 0.3 }, 7.4);
      walkTo(tl, t, -24, 5, 4, 7.6);
      cam(tl, stage, [-2, 3, 14], [-3, 1.3, 1], 4, 7.4);
      return tl;
    },
  },

  /* Peri anası yüzük takar; Tepegöz dağa çıkıp yol keser */
  {
    id: 'yuzuk',
    build(stage) {
      kayaSet(stage, 'dusk');
      const tl = newTimeline();
      const t = stage.track(place(tepegoz(1.9, { mood: 'neutral' }), -1.5, 0, 0.4));
      const p = stage.track(place(peri(), 1.4, 2, -2.2));
      p.freeY = true;
      p.flap = 0.5;
      p.group.position.y = 14;
      const gold = stage.add(ring());
      const man = stage.track(place(villager(0), 18, 5, W));
      stage.setCamera([-2, 3.4, 16], [0, 3, 0]);

      tl.to(p.group.position, { y: 2.2, duration: 2.4, ease: 'power2.out' }, 0);
      tl.to(p.armR.rotation, { x: -1.5, duration: 0.5 }, 2.6);
      toss(tl, gold, [0.9, 3.3, 1.5], [-0.9, 2.3, 0.9], 3.2, 0.5);
      tl.to(t.armR.rotation, { x: -1.4, duration: 0.5 }, 3.6);
      mood(tl, t, 'happy', 4.0);
      tl.to(p.group.position, { x: 12, y: 22, z: -30, duration: 3.4, ease: 'power1.in' }, 4.8);
      tl.to(t.armR.rotation, { x: 0, duration: 0.5 }, 5.4);
      // Yoldan geçen biri: Tepegöz yol keser.
      walkTo(tl, man, 8, 4, 3, 4.2);
      faceTo(tl, t, 8, 4, 7.0);
      mood(tl, t, 'angry', 7.2);
      raiseArms(tl, t, 7.3, 0.4);
      mood(tl, man, 'fear', 7.5);
      man.walkSpeed = 15;
      walkTo(tl, man, 26, 8, 2, 7.8);
      t.walkSpeed = 6;
      walkTo(tl, t, 5, 3.2, 2.4, 8.0);
      cam(tl, stage, [3, 3.4, 18], [4, 2.6, 2], 4, 6.2);
      return tl;
    },
  },

  /* Oğuz üstüne varır; ok batmaz, kılıç kesmez */
  {
    id: 'savas',
    build(stage) {
      kayaSet(stage, 'day');
      const tl = newTimeline();
      const t = stage.track(place(tepegoz(), 1, -1.5, -1.1));
      t.walkSpeed = 6;
      const spots: [number, number][] = [[-10, 2], [-11.6, 4.4], [-9.4, 6], [-12.6, 0.2]];
      const men = spots.map(([x, z], i) => stage.track(place(withBow(warrior({ robe: [P.teal, P.green, P.indigo, P.brown][i], cloak: undefined })), x, z, Math.atan2(1 - x, -1.5 - z))));
      men.forEach((m) => (m.walkSpeed = 15));
      const kz = rider(stage, kazan(), -15, 3, E);
      const a = stage.track(place(aruz(), -14, 6.4, E));
      const tr = stage.add(tree(1.5));
      tr.position.set(4.6, 0, -3);
      stage.setCamera([-8, 5, 20], [-4, 2.6, 1]);

      // Oklar bağrında paralanır.
      spots.forEach(([x, z], i) => brokenArrow(tl, stage, [x + 0.4, 1.6, z], [0.6, 3.6, -1.2], 0.5 + i * 0.4));
      // Tepegöz bir ağacı yerinden koparıp atar.
      faceTo(tl, t, 4.6, -3, 2.4);
      walkTo(tl, t, 3.3, -2.3, 0.8, 2.7);
      tl.to(t.armR.rotation, { x: -1.4, duration: 0.3 }, 3.5);
      tl.to(tr.position, { y: 3.6, duration: 0.5, ease: 'power2.out' }, 3.8);
      tl.to(tr.rotation, { z: 1.3, duration: 0.5 }, 3.8);
      faceTo(tl, t, -10, 3, 4.2);
      tl.to(t.armR.rotation, { x: -2.8, duration: 0.3 }, 4.2);
      tl.to(t.armR.rotation, { x: -0.8, duration: 0.15 }, 4.6);
      tl.to(tr.position, { x: -10.6, y: 0.5, z: 3.4, duration: 0.7, ease: 'power1.in' }, 4.6);
      tl.to(tr.rotation, { z: 4.6, x: 0.6, duration: 0.7 }, 4.6);
      fall(tl, men[0], 5.3, 0.35);
      fall(tl, men[1], 5.35, 0.35);
      mood(tl, [men[2], men[3], a], 'fear', 5.3);
      // Kazan'a darbe; Aruz kan kusar; Oğuz kaçar.
      walkTo(tl, t, -5, 1.5, 1.6, 5.6);
      tl.to(t.armR.rotation, { x: -2.8, duration: 0.25 }, 6.9);
      tl.to(t.armR.rotation, { x: -0.6, duration: 0.12 }, 7.2);
      tl.to(kz.rig.rotation, { x: -0.7, duration: 0.3, yoyo: true, repeat: 1 }, 7.2);
      kz.walkSpeed = 14;
      turn(tl, kz, W, 7.8, 0.3);
      walkTo(tl, kz, -36, 8, 2.6, 8.0);
      kneelDown(tl, a, 7.4);
      tl.to(a.rig.rotation, { x: 0.5, duration: 0.4 }, 7.4);
      walkTo(tl, men[2], -34, 10, 2.6, 7.4);
      walkTo(tl, men[3], -36, 2, 2.6, 7.5);
      raiseArms(tl, t, 8.6, 0.4);
      cam(tl, stage, [-9, 4.4, 19], [-6, 2.8, 2], 5, 5);
      return tl;
    },
  },

  /* Dede Korkut kesim keser */
  {
    id: 'kesim',
    build(stage) {
      kayaSet(stage, 'dusk');
      const tl = newTimeline();
      const t = stage.track(place(tepegoz(2.6, { mood: 'smug' }), 1, -1.5, -1.1)).sit();
      const dede = stage.track(place(dedeKorkut(), -5.5, 1.6, 1.1));
      dede.setMood('sad');
      const kocas = [stage.track(place(koca(0), -22, 4, E)), stage.track(place(koca(1), -24, 5.6, E))];
      const flock = [0, 1, 2, 3].map((i) => stage.track(place(new Sheep(), -28 - i * 1.5, 5 + (i % 2) * 1.8, E)));
      flock.forEach((s) => (s.walkSpeed = 9));
      stage.setCamera([-6, 3.6, 18], [-2, 2.4, 0]);

      tl.to(dede.armL.rotation, { x: -1.5, z: 0, duration: 0.5 }, 0.5);
      // "Günde altmış adam verin."
      tl.to(t.armR.rotation, { x: -2.5, duration: 0.5, ease: 'back.out(2)' }, 1.9);
      mood(tl, t, 'happy', 1.9);
      shakeHead(tl, dede.head, 3.3, 1.2);
      tl.to(t.armR.rotation, { x: 0, duration: 0.5 }, 3.6);
      // "Günde iki adam ile beş yüz koyun."
      tl.to(dede.armR.rotation, { x: -2.3, z: 0.2, duration: 0.5 }, 4.6);
      tl.to(t.head.rotation, { x: 0.3, duration: 0.3, yoyo: true, repeat: 3 }, 5.8);
      tl.to(t.armL.rotation, { x: -1.4, z: -0.8, duration: 0.5 }, 7.0);
      kocas.forEach((k, i) => {
        k.head.rotation.x = 0.4;
        walkTo(tl, k, -10 - i * 1.6, 3.2 + i * 1.4, 4.4, 5.4 + i * 0.3);
      });
      flock.forEach((s, i) => walkTo(tl, s, -14 - i * 1.4, 5.5 + (i % 2) * 1.6, 4.4, 6 + i * 0.2));
      cam(tl, stage, [-8, 3.4, 18], [-4, 2.2, 1], 5, 5);
      return tl;
    },
  },

  /* Kapak Kan'ın karısı Basat'tan medet diler */
  {
    id: 'kadin',
    build(stage) {
      campSet(stage, 'day');
      const tl = newTimeline();
      // Altın gölgelik.
      for (const [x, z] of [[-1.6, -2.6], [1.6, -2.6], [-1.6, 0.4], [1.6, 0.4]]) {
        const pole = stage.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 5), mat(P.darkBrown)));
        pole.position.set(x, 1.4, z);
      }
      const roof = stage.add(mesh(new THREE.BoxGeometry(3.6, 0.08, 3.4), mat(P.gold)));
      roof.position.set(0, 2.82, -1.1);
      roof.castShadow = false;
      stage.keepClear(0, -1.1, 2.4);
      const b = stage.track(place(basat(), 0, -1.1, 0)).sit();
      const woman = stage.track(place(elderWoman({ robe: P.brown, mood: 'sad' }), -15, 5, E));
      const captive = stage.track(place(villager(5, { hat: 'none', mood: 'sad' }), 5, 0.6, W));
      captive.armL.rotation.x = captive.armR.rotation.x = -0.6;
      stage.setCamera([-4, 3, 14], [-1, 1.4, 0]);

      walkTo(tl, woman, -2.4, 1.4, 3.4, 0);
      faceTo(tl, woman, 0, -1.1, 3.4);
      kneelDown(tl, woman, 3.6);
      plead(tl, woman, 3.9);
      sway(tl, woman, 4.2, 5);
      cam(tl, stage, [-1.5, 2.4, 9.5], [-0.6, 1.3, 0], 4, 2.6);
      // Basat'ın gözleri yaşla dolar.
      mood(tl, b, 'sad', 5.2);
      standUp(tl, b, 5.6);
      tl.to(b.head.rotation, { x: 0.4, duration: 0.5 }, 6.2);
      tl.to(b.head.rotation, { x: 0, duration: 0.4 }, 7.2);
      // Bir tutsak verir.
      tl.to(b.armL.rotation, { x: -1.3, z: -0.9, duration: 0.5, ease: 'power2.out' }, 7.4);
      walkTo(tl, captive, -1.2, 2.6, 2, 7.8);
      tl.to(b.armL.rotation, { x: 0, z: -0.14, duration: 0.5 }, 9.0);
      armsDown(tl, woman, 9.2);
      standUp(tl, woman, 9.4);
      mood(tl, woman, 'neutral', 9.8);
      return tl;
    },
  },

  /* Basat karar verir; Kazan ile babası vazgeçiremez */
  {
    id: 'karar',
    build(stage) {
      campSet(stage, 'dusk');
      const tl = newTimeline();
      stage.track(place(bayindir(), 0, -3.6, 0)).sit();
      const kz = stage.track(place(kazan(), 2.8, -1.6, -0.9));
      const a = stage.track(place(aruz({ mood: 'sad' }), -2.6, -1.2, 0.8));
      const mother = stage.track(place(lady({ robe: P.crimson, mood: 'sad' }), -4, -0.1, 0.9));
      const b = stage.track(place(basat({ mood: 'angry' }), 0, 1.6, Math.PI));
      const onBack = bow();
      onBack.position.set(0, 1.1, -0.3);
      onBack.rotation.z = 0.5;
      b.rig.add(onBack);
      stage.setCamera([9, 3.2, 9], [0, 1.4, -0.5]);

      tl.to(b.armR.rotation, { x: -1.3, z: -0.6, duration: 0.5 }, 0.5);
      // Kazan: "Gök yüzünde çevirdim, alamadım Basat!"
      shakeHead(tl, kz.head, 1.6, 1.0);
      tl.to(kz.armR.rotation, { x: -2.7, duration: 0.5 }, 2.7);
      tl.to(kz.armR.rotation, { x: 0, duration: 0.5 }, 3.6);
      tl.to(kz.armL.rotation, { x: -1.2, z: -1.0, duration: 0.5 }, 3.7);
      tl.to(kz.armL.rotation, { x: 0, z: -0.14, duration: 0.5 }, 4.7);
      // Babası ağlar, anası bozlar.
      plead(tl, a, 5.0);
      sway(tl, a, 5.2, 3);
      tl.call(() => grieve(mother), [], 5.6);
      shakeHead(tl, b.head, 6.3, 1.0);
      tl.to(b.armR.rotation, { x: 0, z: 0.14, duration: 0.4 }, 6.4);
      // Helalleşir: babasının elini öper.
      walkTo(tl, b, -1.7, -0.3, 0.8, 7.4);
      tl.to(b.head.rotation, { x: 0.6, duration: 0.4, yoyo: true, repeat: 1 }, 8.2);
      walkTo(tl, b, 13, 9, 2.6, 9.2);
      tl.to(a.armR.rotation, { x: -1.6, duration: 0.5 }, 9.6);
      faceTo(tl, a, 13, 9, 9.4);
      cam(tl, stage, [9, 3, 12], [3, 1.4, 2], 3, 8.8);
      return tl;
    },
  },

  /* Salahana Kayası: oklar paralanır; Tepegöz Basat'ı çizmesine sokar */
  {
    id: 'oklar',
    build(stage) {
      kayaSet(stage, 'day');
      const tl = newTimeline();
      const t = sleeping(stage, 2, -2);
      t.walkSpeed = 6;
      const kocas = [stage.track(place(koca(0), FIRE.x + 1.6, FIRE.z + 1.4, -2.2)).sit(), stage.track(place(koca(1), FIRE.x + 2, FIRE.z - 1.2, -1.2)).sit()];
      const b = stage.track(place(withBow(basat()), -13, 4, 1.2));
      stage.setCamera([-7, 4, 20], [-5, 2, 0]);

      [1.0, 2.4, 3.8].forEach((at) => brokenArrow(tl, stage, [-12.5, 1.6, 4.2], [-0.4, 1.6, -1.6], at));
      // "Bu yerin sineği bizi bezdirdi."
      tl.to(t.armR.rotation, { x: -1.0, duration: 0.25, yoyo: true, repeat: 1 }, 2.9);
      // Sıçrar, Basat'ı görür, kah kah güler.
      tl.call(() => (t.eyesClosed = false), [], 4.4);
      tl.to(t.rig.rotation, { x: 0, duration: 0.8, ease: 'power2.out' }, 4.5);
      tl.to(t, { yOffset: 0, duration: 0.8 }, 4.5);
      faceTo(tl, t, -13, 4, 5.3);
      mood(tl, t, 'happy', 5.6);
      tl.to([t.armL.rotation, t.armR.rotation], { x: -1.3, duration: 0.2, yoyo: true, repeat: 3 }, 5.6);
      mood(tl, kocas, 'fear', 5.6);
      walkTo(tl, t, -10.6, 3.4, 2.2, 6.6);
      mood(tl, b, 'fear', 6.8);
      cam(tl, stage, [-10, 3.6, 16], [-11, 2.6, 3.6], 3.4, 5.6);
      // Tutar, çizmesinin koncuna sokar.
      tl.to(t.rig.rotation, { x: 0.5, duration: 0.4 }, 8.8);
      tl.to(t.armR.rotation, { x: -1.1, duration: 0.4 }, 8.8);
      tl.call(() => (b.freeY = true), [], 9.1);
      tl.to(b.group.position, { x: -11.8, y: 3.4, z: 3.8, duration: 0.5, ease: 'power2.out' }, 9.2);
      tl.to(t.rig.rotation, { x: 0, duration: 0.4 }, 9.3);
      tl.to(b.group.position, { x: -10.2, y: 0.5, z: 3.9, duration: 0.5, ease: 'power2.in' }, 10.0);
      vanish(tl, b.group, 10.4, 0.2);
      tl.to(t.armR.rotation, { x: 0, duration: 0.4 }, 10.5);
      return tl;
    },
  },

  /* Kızgın şiş */
  {
    id: 'sis',
    build(stage) {
      kayaSet(stage, 'dusk');
      const tl = newTimeline();
      const t = sleeping(stage, 2, -2);
      const kocas = [stage.track(place(koca(0), FIRE.x + 1.6, FIRE.z + 1.4, -2.2)).sit(), stage.track(place(koca(1), FIRE.x + 2, FIRE.z - 1.2, -1.2)).sit()];
      const b = stage.track(place(basat(), 3.2, -0.9, E));
      b.walkSpeed = 11;
      b.armSwing = 0.2;
      const inFire = stage.add(spit(true));
      inFire.position.set(FIRE.x + 0.9, 0.5, FIRE.z);
      inFire.rotation.z = 1.2;
      const inHand = spit(true);
      inHand.rotation.x = Math.PI / 2;
      inHand.visible = false;
      b.handR.add(inHand);
      stage.setCamera([3, 3.2, 15], [3, 1.6, -0.5]);

      // Çizmeyi yarıp çıkar.
      pop(tl, b.group, 0.4, 1.1, 0.4);
      walkTo(tl, b, FIRE.x - 0.6, FIRE.z + 1.2, 1.4, 1.2);
      faceTo(tl, b, FIRE.x + 1.6, FIRE.z + 1.4, 2.6);
      // "Gözünden başka yerinde et yoktur."
      tl.to(kocas[0].armR.rotation, { x: -2.4, z: -0.5, duration: 0.5 }, 3.0);
      tl.to(kocas[0].armR.rotation, { x: 0, z: 0.14, duration: 0.5 }, 4.0);
      faceTo(tl, b, FIRE.x, FIRE.z, 3.8);
      tl.set(inFire, { visible: false }, 4.3);
      tl.set(inHand, { visible: true }, 4.3);
      walkTo(tl, b, -2.8, -0.5, 2.2, 4.6);
      faceTo(tl, b, -2.4, -2, 6.8);
      cam(tl, stage, [-2, 2.6, 9], [-2, 1.4, -1.4], 3, 4.4);
      // Salavat getirir; şişi göze basar.
      tl.to(b.armR.rotation, { x: -2.8, duration: 0.5, ease: 'power2.out' }, 7.0);
      tl.to(b.armR.rotation, { x: -0.7, duration: 0.14, ease: 'power3.in' }, 8.1);
      tl.call(() => t.blind(), [], 8.25);
      mood(tl, t, 'fear', 8.25);
      tl.to(stage.camera.position, { x: '+=0.25', duration: 0.05, yoyo: true, repeat: 9 }, 8.3);
      tl.to(t.rig.rotation, { x: -1.25, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 3 }, 8.3);
      tl.to([t.armL.rotation, t.armR.rotation], { x: -2.4, duration: 0.3 }, 8.35);
      mood(tl, kocas, 'fear', 8.3);
      tl.set(inHand, { visible: false }, 8.3);
      // Basat mağaraya kaçar.
      b.walkSpeed = 15;
      walkTo(tl, b, CAVE.x, CAVE.z + 0.6, 1.4, 8.7);
      vanish(tl, b.group, 10.0, 0.15);
      cam(tl, stage, [1, 3.4, 15], [0, 2.4, -3], 2.2, 8.9);
      return tl;
    },
  },

  /* Mağara kapısı: koç derisi */
  {
    id: 'koc',
    build(stage) {
      kayaSet(stage, 'day');
      const tl = newTimeline();
      const t = stage.track(place(tepegoz(2.6, { blind: true }), CAVE.x, CAVE.z + 1.4, 0));
      // Kapıyı tutar: bacaklar iki yana açık, gövde öne eğik, eller yoklar.
      t.legL.rotation.z = -0.42;
      t.legR.rotation.z = 0.42;
      t.rig.rotation.x = 0.3;
      t.armL.rotation.x = t.armR.rotation.x = -0.5;
      const horn = mesh(new THREE.TorusGeometry(0.13, 0.04, 6, 10, 4.2), mat(P.cream));
      horn.visible = false;
      t.handR.add(horn);
      const inside: [number, number] = [CAVE.x, CAVE.z - 2.6];
      const flock = [0, 1, 2].map(() => stage.track(place(new Sheep(), ...inside, 0)));
      const ram = stage.track(place(new Sheep(true), ...inside, 0));
      ram.walkSpeed = 7;
      const b = stage.track(place(basat(), CAVE.x, CAVE.z + 3.4, 0));
      b.group.scale.setScalar(0.001);
      b.walkSpeed = 15;
      stage.setCamera([4, 3.6, 15], [0, 2.6, -3]);

      const outs: [number, number][] = [[-3.4, 4], [3.6, 3.4], [-1, 6.4]];
      flock.forEach((s, i) => {
        walkTo(tl, s, outs[i][0], outs[i][1], 2.4, 0.5 + i * 1.5);
        // Her gelenin başını yoklar.
        tl.to(t.armR.rotation, { x: -1.0, duration: 0.25, yoyo: true, repeat: 1 }, 1.3 + i * 1.5);
      });
      walkTo(tl, ram, CAVE.x, CAVE.z + 1.9, 1.6, 5.4);
      tl.to(t.armR.rotation, { x: -1.1, duration: 0.3 }, 7.0);
      // Boynuz deriyle elinde kalır; Basat bacaklarının arasından sıçrar.
      vanish(tl, ram.group, 7.3, 0.15);
      tl.set(horn, { visible: true }, 7.35);
      tl.to(t.armR.rotation, { x: -2.6, duration: 0.3 }, 7.4);
      pop(tl, b.group, 7.3, 1.1, 0.2);
      walkTo(tl, b, 5.4, 5, 1.4, 7.4);
      tl.to(t.armR.rotation, { x: -0.4, duration: 0.15, ease: 'power3.in' }, 8.5);
      mood(tl, t, 'angry', 8.5);
      faceTo(tl, b, CAVE.x, CAVE.z, 8.9);
      mood(tl, b, 'happy', 9.2);
      raiseArms(tl, b, 9.2, 0.5);
      cam(tl, stage, [5, 3.2, 16], [2, 2.2, 0], 3, 7.2);
      return tl;
    },
  },

  /* Yüzük ve kümbet hileleri */
  {
    id: 'hileler',
    build(stage) {
      kayaSet(stage, 'dusk');
      const tl = newTimeline();
      const K: [number, number] = [-11, -1.5];
      const dome = stage.add(kumbet());
      dome.position.set(K[0], 0, K[1]);
      dome.rotation.y = 0.5;
      stage.keepClear(K[0], K[1], 3);
      const t = stage.track(place(tepegoz(2.6, { blind: true }), 0, -2, Math.atan2(5, 4)));
      t.walkSpeed = 8;
      const b = stage.track(place(basat(), 5, 2, Math.atan2(-5, -4)));
      b.walkSpeed = 15;
      const thrown = stage.add(ring());
      const dropped = stage.add(ring());
      dropped.position.set(4.2, 0.08, 1.5);
      dropped.rotation.x = Math.PI / 2;
      dropped.visible = false;
      stage.setCamera([3, 3.6, 16], [2, 2, 0]);

      // Yüzük hilesi.
      tl.to(t.armR.rotation, { x: -1.3, duration: 0.5 }, 0.4);
      toss(tl, thrown, [1, 2.8, -1.2], [4.7, 1.3, 1.9], 1.1, 0.6);
      tl.to(b.armR.rotation, { x: -1.4, duration: 0.4 }, 1.8);
      tl.to(t.armR.rotation, { x: -2.8, duration: 0.3 }, 2.4);
      walkTo(tl, t, 4.2, 1.4, 0.8, 2.6);
      tl.to(t.armR.rotation, { x: -0.6, duration: 0.14 }, 3.3);
      tl.to(b.armR.rotation, { x: 0, duration: 0.2 }, 2.8);
      walkTo(tl, b, 8.6, 4.4, 0.6, 2.9);
      tl.set(dropped, { visible: true }, 3.5);
      faceTo(tl, b, 4.2, 1.4, 3.6);
      raiseArms(tl, b, 3.8, 0.5);
      armsDown(tl, b, 4.8);
      tl.to(b.head.rotation, { x: 0, duration: 0.4 }, 4.8);
      // Kümbet hilesi.
      tl.to(t.armR.rotation, { x: 0, duration: 0.4 }, 4.6);
      faceTo(tl, t, K[0], K[1], 5.0);
      tl.to(t.armL.rotation, { x: -1.5, duration: 0.5 }, 5.3);
      walkTo(tl, b, K[0] + 1.2, K[1] + 2.2, 2.4, 5.8);
      vanish(tl, b.group, 8.1, 0.15);
      cam(tl, stage, [-6, 3.6, 17], [-8, 2.4, -1], 3, 5.6);
      walkTo(tl, t, K[0] + 4.2, K[1] + 1.2, 2, 7.0);
      plead(tl, t, 9.0);
      tl.to(dome.rotation, { z: 0.12, duration: 0.08, yoyo: true, repeat: 7 }, 9.3);
      // Kümbet yarılır; Basat öte yandan çıkar.
      tl.to(dome.scale, { y: 0.3, x: 1.25, z: 1.25, duration: 0.4, ease: 'power2.in' }, 10.0);
      tl.set(b.group.position, { x: K[0] - 3.6, z: K[1] + 3.6 }, 9.9);
      pop(tl, b.group, 10.0, 1.1, 0.3);
      raiseArms(tl, b, 10.4, 0.5);
      return tl;
    },
  },

  /* Kınsız kılıç */
  {
    id: 'kilic',
    build(stage) {
      kayaSet(stage, 'dusk');
      const tl = newTimeline();
      stage.track(place(tepegoz(2.6, { blind: true, mood: 'sad' }), -9, 2, 1.0)).sit();
      // Zincire asılı, durmadan inip çıkan kılıç.
      const hang = stage.add(new THREE.Group());
      hang.position.set(CAVE.x, 3.0, CAVE.z + 1.2);
      const blade = sword();
      blade.scale.setScalar(2.2);
      blade.rotation.z = Math.PI;
      const chain = mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 4), mat(P.stoneDark));
      chain.position.y = 2;
      hang.add(blade, chain);
      const b = stage.track(place(basat(), 3.2, -2.4, Math.atan2(-3.2, -2.4)));
      const own = sword();
      own.rotation.x = Math.PI / 2;
      b.handR.add(own);
      const big = sword();
      big.scale.setScalar(1.9);
      big.rotation.x = Math.PI / 2;
      big.visible = false;
      b.handR.add(big);
      const quiver = bow();
      quiver.visible = false;
      b.handL.add(quiver);
      b.armSwing = 0.2;
      const log = stage.add(mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.8, 6), mat(P.brown)));
      log.rotation.z = 1.2;
      log.visible = false;
      const half = (color: number, len: number) => stage.add(mesh(new THREE.BoxGeometry(0.08, len, 0.05), mat(color)));
      stage.setCamera([4.5, 3, 13], [1, 2.6, -4]);

      tl.to(hang.position, { y: 1.5, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 11 }, 0);
      // Kendi kılıcını tutar: iki parça olur.
      tl.to(b.armR.rotation, { x: -1.6, duration: 0.5 }, 0.9);
      tl.set(own, { visible: false }, 1.9);
      toss(tl, half(P.steel, 0.5), [1.4, 1.8, -4], [2.6, 0.1, -2.6], 1.9, 0.5);
      toss(tl, half(P.steel, 0.4), [1.4, 1.8, -4], [0.6, 0.1, -2.4], 1.9, 0.5);
      mood(tl, b, 'fear', 2.0);
      tl.to(b.armR.rotation, { x: 0, duration: 0.4 }, 2.3);
      // Bir ağaç tutar: onu da ikiye biçer.
      toss(tl, log, [3, 1.4, -2.2], [0.6, 2.2, -4.4], 3.2, 0.5);
      toss(tl, half(P.brown, 0.8), [0.6, 2.2, -4.4], [2.2, 0.1, -3], 3.7, 0.5);
      toss(tl, half(P.brown, 0.8), [0.6, 2.2, -4.4], [-1.4, 0.1, -3.2], 3.7, 0.5);
      // Geri çekilir, zinciri okla vurur.
      walkTo(tl, b, 5, 1.4, 0.9, 4.3);
      faceTo(tl, b, CAVE.x, CAVE.z, 5.2);
      tl.set(quiver, { visible: true }, 5.2);
      tl.to(b.armL.rotation, { x: -1.9, duration: 0.3 }, 5.2);
      launch(tl, stage.add(arrow()), [4.6, 2, 1], [CAVE.x, 6.4, CAVE.z + 1.2], 5.7, 0.35);
      tl.set(chain, { visible: false }, 6.05);
      tl.to(hang.position, { y: 0.3, duration: 0.3, ease: 'power2.in' }, 6.05);
      mood(tl, b, 'smug', 6.4);
      tl.to(b.armL.rotation, { x: 0, duration: 0.4 }, 6.4);
      // Kabzasından sıkı tutar.
      walkTo(tl, b, 1.0, -4.0, 1.4, 6.7);
      tl.set(hang, { visible: false }, 8.2);
      tl.set(big, { visible: true }, 8.2);
      tl.to(b.armR.rotation, { x: -2.6, duration: 0.5, ease: 'back.out(2)' }, 8.3);
      turn(tl, b, 0.3, 8.8);
      return tl;
    },
  },

  /* Tepegöz'ün ağıtı; "kardeşiz, kıyma" */
  {
    id: 'agit',
    build(stage) {
      kayaSet(stage, 'dusk');
      const tl = newTimeline();
      const t = stage.track(place(tepegoz(2.6, { blind: true }), -2, -1, Math.atan2(5.5, 2.5))).kneel();
      grieve(t);
      const b = stage.track(place(basat({ mood: 'angry' }), 3.5, 1.5, Math.atan2(-5.5, -2.5)));
      const big = sword();
      big.scale.setScalar(1.9);
      big.rotation.x = Math.PI / 2;
      b.handR.add(big);
      stage.setCamera([3, 2.8, 14], [0, 2.2, 0]);

      sway(tl, t, 0.2, 5);
      // "Gözüm, gözüm, yalnız gözüm!"
      raiseArms(tl, t, 3.0, 0.6);
      tl.to([t.armL.rotation, t.armR.rotation], { x: -2.2, duration: 0.6, yoyo: true, repeat: 1 }, 3.8);
      armsDown(tl, t, 5.2);
      tl.to(t.head.rotation, { x: 0, duration: 0.5 }, 5.2);
      // Basat soyunu sayar.
      tl.to(b.armL.rotation, { x: -1.3, z: 0.6, duration: 0.5 }, 5.8);
      tl.to(b.armL.rotation, { x: 0, z: -0.14, duration: 0.5 }, 7.2);
      // "Kardeşiz, kıyma bana!"
      plead(tl, t, 7.4);
      shakeHead(tl, b.head, 8.4, 1.0);
      tl.to(b.armR.rotation, { x: -2.5, duration: 0.5 }, 9.4);
      cam(tl, stage, [2.5, 2.6, 11], [0, 2.3, 0], 9, 0.5);
      return tl;
    },
  },

  /* Basat Tepegöz'ün boynunu vurur; müjde ve alkış */
  {
    id: 'son',
    build(stage) {
      const sky = kayaSet(stage, 'dusk');
      const tl = newTimeline();
      const t = stage.track(place(tepegoz(2.6, { blind: true, mood: 'sad' }), -2, -1, 0.3)).kneel();
      t.rig.rotation.x = 0.3;
      t.head.rotation.x = 0.5;
      const b = stage.track(place(basat({ mood: 'angry' }), 0.4, -0.2, Math.atan2(-2.4, -0.8)));
      const big = sword();
      big.scale.setScalar(1.9);
      big.rotation.x = Math.PI / 2;
      b.handR.add(big);
      b.armR.rotation.x = -2.6;
      b.armSwing = 0.2;
      const riders = [rider(stage, koca(0), 10, 2.4, W, 0xd8d2c4), rider(stage, koca(1), 12, 4, W, 0xd8d2c4)];
      riders.forEach((h) => (h.walkSpeed = 13));
      const a = stage.track(place(aruz(), -24, 5, E));
      const kz = stage.track(place(kazan(), -26, 6.6, E));
      const mother = stage.track(place(lady({ robe: P.crimson }), -25, 3.6, E));
      const dede = stage.track(place(dedeKorkut(), -28, 4.6, E));
      [a, kz, mother, dede].forEach((m) => (m.walkSpeed = 11));
      stage.setCamera([2, 3, 13], [-1, 2.2, -0.5]);

      tl.to(b.armR.rotation, { x: -0.5, duration: 0.14, ease: 'power3.in' }, 0.9);
      // Tepegöz yere serilir.
      tl.to(t.rig.rotation, { x: 1.45, duration: 0.6, ease: 'power2.in' }, 1.05);
      tl.to(t, { yOffset: 0.2, duration: 0.6 }, 1.05);
      cam(tl, stage, [7, 3.2, 17], [6, 1.8, 2], 2.4, 1.3);
      sky.tweenTo(tl, 'night', 7, 2);
      mood(tl, b, 'neutral', 2.0);
      walkTo(tl, b, 4, 2.6, 1.4, 2.2);
      faceTo(tl, b, -6, 4, 3.8);
      // İki koca müjdeye gider.
      walkTo(tl, riders[0], -36, 8, 4, 2.6);
      walkTo(tl, riders[1], -38, 10, 4, 2.9);
      // Oğuz beyleri ve Dedem Korkut gelir.
      walkTo(tl, a, 1.4, 3.6, 4.6, 4.2);
      walkTo(tl, kz, -0.6, 5, 4.6, 4.3);
      walkTo(tl, mother, 2.2, 5.2, 4.6, 4.4);
      walkTo(tl, dede, 6.6, 3.6, 5.2, 4.2);
      faceTo(tl, dede, 4, 2.6, 9.4);
      faceTo(tl, b, 6.6, 3.6, 9.2);
      cam(tl, stage, [3.5, 3, 14], [3.4, 1.6, 3], 4, 5.5);
      mood(tl, [a, kz, mother, b], 'happy', 9.2);
      raiseArms(tl, a, 9.3, 0.5);
      tl.to(dede.armL.rotation, { x: -2.1, z: 0, duration: 0.7, ease: 'power2.out' }, 9.8);
      tl.to(b.head.rotation, { x: 0.35, duration: 0.5 }, 10.2);
      return tl;
    },
  },
];
