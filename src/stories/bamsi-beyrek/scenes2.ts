import * as THREE from 'three';
import { armsDown, cam, faceTo, fall, grieve, kneelDown, launch, mood, newTimeline, place, plead, pop, raiseArms, shakeHead, standUp, sway, toss, turn, vanish, walkTo } from '../../engine/direct';
import type { SceneDef } from '../../engine/story';
import { Horse } from '../../procedural/animals';
import { archer, armed, dedeKorkut, mounted, villager } from '../../procedural/cast';
import { P, glow, mat, mesh } from '../../procedural/palette';
import { addFire, arrow, bow, kopuz, lightBeam } from '../../procedural/props';
import { placeTent, reeds, steppeSet } from '../../procedural/sets';
import { DECK_Y, GATE, ana, bani, bayindir, bezirgan, beyKizi, beyrek, captive, deliOzan, divanSet, hisarSet, kafir, karcar, kazan, payPure, pond, sister, target, yaltacuk, yenge, yigit, yurtSet } from './sets';

/** Bamsı Beyrek, ikinci bölüm: tutsaklıktan dönüşe ve düğüne. Metinler `story.ts` içindedir. */

const E = Math.PI / 2; // doğuya (+x) bakış
const W = -Math.PI / 2; // batıya (-x) bakış
const BOZ = 0xb8b4aa; // boz aygırın rengi

export const scenes: SceneDef[] = [
  /* Yalancı oğlu Yaltacuk'un kanlı gömleği */
  {
    id: 'yalan',
    build(stage) {
      divanSet(stage, 'dusk');
      const tl = newTimeline();
      const han = stage.track(place(bayindir(), 0, -4.6, 0));
      const k = stage.track(place(karcar({ mood: 'sad' }), -3, -1.6, 0.6));
      const y = stage.track(place(yaltacuk(), 16, 4, W));
      const bc = stage.track(place(bani({ robe: P.black, trim: P.stone, mood: 'sad' }), 4.4, -1, -0.8));
      const shirt = stage.add(mesh(new THREE.BoxGeometry(0.6, 0.06, 0.5), mat(P.crimson)));
      stage.setCamera([0, 3.2, 14], [0, 1.6, -1]);

      // Karçar: "Ölüsü haberini getirene kız kardeşimi veririm."
      tl.to(k.armR.rotation, { x: -2.4, duration: 0.5 }, 0.5);
      tl.to(k.armR.rotation, { x: 0, duration: 0.5 }, 1.8);
      walkTo(tl, y, 0.6, 0.4, 3, 1.4);
      faceTo(tl, y, 0, -4.6, 4.4);
      // Kanlı gömleği hanın önüne bırakır.
      tl.to(y.rig.rotation, { x: 0.5, duration: 0.4, yoyo: true, repeat: 1 }, 4.8);
      toss(tl, shirt, [0.6, 1.2, 0.1], [0.4, 0.06, -1.6], 5.0, 0.4);
      tl.set(shirt, { visible: true }, 5.45);
      mood(tl, [han, k], 'sad', 5.6);
      // Banı Çiçek tanır, yakasını yırtar.
      faceTo(tl, bc, 0.4, -1.6, 5.8);
      mood(tl, bc, 'fear', 6.2);
      walkTo(tl, bc, 1.6, -1.4, 0.9, 6.4);
      kneelDown(tl, bc, 7.3, 0.4);
      tl.call(() => grieve(bc), [], 7.5);
      sway(tl, bc, 7.7, 3);
      cam(tl, stage, [1, 2.4, 9], [1, 1.2, -1.4], 4, 5);
      return tl;
    },
  },

  /* Bezirgânlar Bayburt Hisarı'nda */
  {
    id: 'haber',
    build(stage) {
      hisarSet(stage, 'day');
      const tl = newTimeline();
      const b = stage.track(deliOzan({ mood: 'sad' }));
      b.freeY = true;
      b.group.position.set(0, DECK_Y, GATE.z + 1.3);
      const guards = [0, 1].map((i) => {
        const g = stage.track(armed(kafir(i)));
        g.freeY = true;
        g.group.position.set(i ? 1.8 : -1.8, DECK_Y, GATE.z + 1);
        return g;
      });
      const men = [0, 1].map((i) => stage.track(place(bezirgan(i), -18 - i * 2, 6 + i, E)));
      stage.setCamera([-3, 3, 19], [0, 4.4, -6]);

      // Kopuz çaldırırlar.
      tl.to(b.armR.rotation, { x: -1.15, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: 9 }, 0);
      men.forEach((m, i) => walkTo(tl, m, -1.6 + i * 2.6, -1 + i, 3.6, 0.4 + i * 0.2));
      men.forEach((m, i) => {
        faceTo(tl, m, 0, GATE.z, 4.2);
        tl.to(m.head.rotation, { x: -0.5, duration: 0.4 }, 4.3 + i * 0.1);
      });
      // Beyrek sorar.
      tl.to(b.rig.rotation, { x: 0.3, duration: 0.5 }, 4.8);
      tl.to(b.armR.rotation, { x: -1.6, z: 0, duration: 0.4 }, 4.9);
      // "Yavuklunu Yaltacuk'a verdiler."
      tl.to(men[0].armR.rotation, { x: -2.6, duration: 0.5 }, 6.2);
      shakeHead(tl, men[1].head, 6.4, 1.0);
      mood(tl, b, 'fear', 7.6);
      tl.to(b.rig.rotation, { x: 0, duration: 0.4 }, 7.8);
      tl.to(b.head.rotation, { x: 0.5, duration: 0.5 }, 8.2);
      void guards;
      cam(tl, stage, [-1, 3.4, 18], [0, 4, -6], 5, 3.6);
      return tl;
    },
  },

  /* Kâfir beyinin kızı urganla sarkıtır */
  {
    id: 'kale',
    build(stage) {
      hisarSet(stage, 'night');
      const tl = newTimeline();
      const b = stage.track(captive());
      b.freeY = true;
      b.group.position.set(-0.8, DECK_Y, GATE.z + 1.4);
      b.group.rotation.y = E;
      const girl = stage.track(beyKizi());
      girl.freeY = true;
      girl.group.position.set(3.4, DECK_Y, GATE.z + 1.2);
      girl.group.rotation.y = W;
      const rope = stage.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, DECK_Y, 5), mat(P.cream), false));
      rope.geometry.translate(0, -DECK_Y / 2, 0);
      rope.position.set(-0.8, DECK_Y, GATE.z + 2.6);
      rope.scale.y = 0.01;
      stage.setCamera([-2, 5, 12], [0, 6.6, -7]);

      tl.to(girl.group.position, { x: 0.8, duration: 1.6, ease: 'none' }, 0.2);
      tl.to(girl, { walkAmp: 1, duration: 0.2 }, 0.2);
      tl.to(girl, { walkAmp: 0, duration: 0.2 }, 1.7);
      tl.to(b.head.rotation, { x: 0.4, duration: 0.5 }, 0.6);
      plead(tl, girl, 2.4);
      tl.to(b.head.rotation, { x: 0, duration: 0.4 }, 3.2);
      armsDown(tl, girl, 3.8);
      // Ant içer.
      tl.to(b.armR.rotation, { x: -2.7, duration: 0.5 }, 4.2);
      mood(tl, b, 'neutral', 4.4);
      tl.to(b.armR.rotation, { x: 0, duration: 0.5 }, 5.6);
      mood(tl, girl, 'happy', 5.2);
      // Urgan sarkar; Beyrek iner.
      tl.to(rope.scale, { y: 1, duration: 0.9, ease: 'power1.in' }, 6.0);
      tl.to(b.group.position, { z: GATE.z + 2.9, duration: 0.5 }, 6.8);
      tl.to([b.armL.rotation, b.armR.rotation], { x: -2.8, duration: 0.4 }, 6.9);
      tl.to(b.group.position, { y: 0, duration: 2.4, ease: 'power1.inOut' }, 7.4);
      cam(tl, stage, [-3, 3, 15], [-0.6, 3, -5], 3.4, 6.6);
      armsDown(tl, b, 9.8);
      tl.to(girl.armR.rotation, { x: -2.4, duration: 0.5 }, 9.6);
      return tl;
    },
  },

  /* Boz aygır sahibini tanır */
  {
    id: 'aygir',
    build(stage) {
      steppeSet(stage, 'dawn', 161);
      const tl = newTimeline();
      const grey = stage.track(place(new Horse(BOZ), 4, 0, W));
      const herd = [P.brown, 0x4a3a2c, 0x8a6a48].map((c, i) => stage.track(place(new Horse(c), 8 + i * 3, -4 + i * 2.6, 0.6 + i)));
      const b = stage.track(place(captive(), -16, 3, E));
      void herd;
      stage.setCamera([-3, 3, 14], [0, 1.6, 0]);

      walkTo(tl, b, -3.4, 0.8, 3.4, 0);
      // At tanır: şaha kalkar.
      tl.to(grey.rig.rotation, { x: -0.7, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }, 3.0);
      mood(tl, b, 'happy', 3.4);
      // Atını över.
      raiseArms(tl, b, 4.2, 0.6);
      armsDown(tl, b, 5.8);
      tl.to(b.head.rotation, { x: 0, duration: 0.4 }, 5.8);
      plead(tl, b, 6.2);
      // At ona doğru gelir.
      grey.walkSpeed = 7;
      walkTo(tl, grey, -1.6, 0.6, 1.6, 6.6);
      // Göğsünü kucaklar, gözünü öper.
      walkTo(tl, b, -2.6, 0.9, 0.5, 8.2);
      tl.to(b.rig.rotation, { x: 0.3, duration: 0.4, yoyo: true, repeat: 1 }, 8.8);
      cam(tl, stage, [-2, 2.6, 9], [-1.6, 1.6, 0.6], 4, 5.4);
      return tl;
    },
  },

  /* Ozanın kopuzu; kız kardeşler; deli ozan kılığı */
  {
    id: 'ozan',
    build(stage) {
      steppeSet(stage, 'day', 171);
      const tl = newTimeline();
      pond(stage, 5, -2.4, 2.2);
      const sisters = [0, 1, 2].map((i) => stage.track(place(sister(i), 6.4 + i * 1.3, 0.4 + (i % 2) * 1.2, W)));
      sisters.forEach((s) => grieve(s));
      const bard = stage.track(place(villager(1), -4, 2.4, W));
      const lute = kopuz();
      lute.position.set(0.08, 1.1, 0.2);
      lute.rotation.z = 1.05;
      bard.rig.add(lute);
      const b = captive();
      const bh = mounted(stage, b, -20, 3, E, BOZ);
      const walker = stage.track(place(deliOzan({ mood: 'neutral' }), -5.4, 2.6, E));
      walker.group.visible = false;
      const kaftan = stage.add(mesh(new THREE.BoxGeometry(0.7, 0.08, 0.9), mat(P.indigo)));
      stage.setCamera([-6, 3.2, 15], [-4, 1.6, 1]);

      // Ozanla karşılaşır; atını bırakıp kopuzunu alır.
      walkTo(tl, bh, -7.4, 2.8, 3, 0);
      tl.to(bard.armR.rotation, { x: -1.5, z: -0.9, duration: 0.5 }, 3.2);
      tl.to(bard.armR.rotation, { x: 0, z: 0.14, duration: 0.4 }, 4.2);
      tl.set(b.group, { visible: false }, 4.6);
      tl.set(lute, { visible: false }, 4.6);
      tl.set(walker.group, { visible: true }, 4.6);
      // Pınar başında kız kardeşler ağlar.
      walkTo(tl, walker, 3.2, 1.2, 3, 5.0);
      cam(tl, stage, [3, 2.8, 12], [5, 1.5, 0.4], 3.6, 5.0);
      sisters.forEach((s, i) => sway(tl, s, 5 + i * 0.3, 3));
      // Büyüğü kaftanı verir.
      tl.to(sisters[0].head.rotation, { x: 0, duration: 0.4 }, 8.2);
      tl.to(sisters[0].armR.rotation, { x: -1.4, z: 0, duration: 0.4 }, 8.3);
      toss(tl, kaftan, [6, 1.3, 0.6], [3.6, 1.2, 1.2], 8.7, 0.4);
      mood(tl, sisters[0], 'fear', 9.6);
      tl.to(sisters[0].armL.rotation, { x: -1.5, z: 0, duration: 0.4 }, 9.6);
      // Kaftanı çıkarıp atar; deli gibi davranır.
      toss(tl, kaftan, [3.6, 1.4, 1.2], [1.6, 0.06, 3], 10.4, 0.5);
      tl.set(kaftan, { visible: true }, 10.95);
      mood(tl, walker, 'smug', 10.6);
      tl.to(walker, { yOffset: 0.3, duration: 0.2, yoyo: true, repeat: 5 }, 10.8);
      tl.to(walker.rig.rotation, { z: 0.25, duration: 0.2, yoyo: true, repeat: 5 }, 10.8);
      return tl;
    },
  },

  /* Yüzüğe nişan */
  {
    id: 'ok',
    build(stage) {
      divanSet(stage, 'day');
      const tl = newTimeline();
      const hoop = target(stage, 8, 0);
      const y = stage.track(place(archer(yaltacuk()), -3, 1.6, E));
      const kz = stage.track(place(kazan(), -4, -2.6, 0.8));
      const b = stage.track(place(deliOzan(), -5.4, 3.6, E));
      const guests = [0, 1].map((i) => stage.track(place(yigit(i), -1.4 + i * 2, -3.4, 0.5)));
      const own = bow();
      own.scale.setScalar(1.3);
      own.visible = false;
      b.handL.add(own);
      stage.setCamera([-2, 3.4, 15], [2, 1.8, 0]);

      // Yaltacuk atar, ıskalar; Beyrek söver.
      tl.to(y.armL.rotation, { x: -1.8, duration: 0.3 }, 0.5);
      launch(tl, stage.add(arrow()), [-2.6, 1.8, 1.6], [16, 4.6, -1.6], 1.0, 0.5);
      tl.to(b.armR.rotation, { x: -1.6, z: 0, duration: 0.4 }, 1.7);
      shakeHead(tl, b.head, 1.8, 0.8);
      mood(tl, y, 'angry', 2.4);
      faceTo(tl, y, -5.4, 3.6, 2.4);
      // Yaltacuk'un yayını çeker, ikiye böler.
      for (const dz of [-1, 1]) {
        const half = stage.add(mesh(new THREE.TorusGeometry(0.4, 0.022, 5, 8, 1.1), mat(P.darkBrown), false));
        toss(tl, half, [-4.6, 1.5, 3.2], [-4 + dz, 0.1, 4.6 + dz * 0.4], 4.0, 0.5);
      }
      mood(tl, y, 'fear', 4.2);
      // Kendi yayı getirilir; çeker, yüzüğü paralar.
      tl.set(own, { visible: true }, 5.4);
      tl.to(b.armL.rotation, { x: -1.6, z: 0, duration: 0.4 }, 5.4);
      tl.to(b.head.rotation, { x: 0.4, duration: 0.5, yoyo: true, repeat: 1 }, 5.8); // yoldaşlarını anar
      launch(tl, stage.add(arrow()), [-5, 1.8, 3.6], [8, 3.2, 0], 7.2, 0.45);
      vanish(tl, hoop, 7.6, 0.15);
      for (const dy of [1, -1]) {
        const bit = stage.add(mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 8, 2.6), mat(P.gold), false));
        toss(tl, bit, [8, 3.2, 0], [9 + dy, 0.1, dy * 1.4], 7.65, 0.6);
      }
      cam(tl, stage, [0.5, 3.4, 16], [1.5, 1.8, 0.5], 3, 5.4);
      mood(tl, [...guests, kz], 'happy', 8.0);
      guests.forEach((g, i) => raiseArms(tl, g, 8.1 + i * 0.1, 0.4));
      // Kazan Bey: "Bugünkü beyliğim senin olsun."
      faceTo(tl, kz, -5.4, 3.6, 8.4);
      tl.to(kz.armR.rotation, { x: -1.5, duration: 0.5 }, 8.8);
      return tl;
    },
  },

  /* Kazanlar; Kısırca Yenge ile Boğazca Fatma */
  {
    id: 'yenge',
    build(stage) {
      divanSet(stage, 'dusk');
      const tl = newTimeline();
      const pot = stage.add(mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.7, 10), mat(P.stoneDark)));
      pot.position.set(-7, 0.35, 2);
      stage.keepClear(-7, 2, 1.2);
      placeTent(stage, 7, -3, -0.8, P.red, P.gold, 1.2);
      const b = stage.track(place(deliOzan(), -11, 3, E));
      b.walkSpeed = 12;
      const ky = stage.track(place(yenge(), 5, 0.6, W)).sit();
      const fatma = stage.track(place(yenge({ robe: P.ochre, hatColor: P.cream }), 6.4, 2, W)).sit();
      const bc = stage.track(place(bani({ mood: 'sad' }), 7.4, -0.2, W)).sit();
      stage.setCamera([-6, 3.2, 14], [-5, 1.4, 2]);

      // Kazanları teper.
      walkTo(tl, b, -8.2, 2.2, 1.2, 0.2);
      tl.to(b.legR.rotation, { x: -1.4, duration: 0.15, yoyo: true, repeat: 1 }, 1.5);
      tl.to(pot.rotation, { z: -1.5, duration: 0.5, ease: 'bounce.out' }, 1.65);
      tl.to(pot.position, { x: -5.6, duration: 0.5 }, 1.65);
      // Kadınların yanına varır.
      walkTo(tl, b, 1.6, 1.2, 3, 2.6);
      cam(tl, stage, [3, 2.8, 12], [4.4, 1.5, 0.6], 3.4, 2.6);
      tl.to(b.armR.rotation, { x: -1.15, duration: 0.28, yoyo: true, repeat: 21, ease: 'sine.inOut' }, 5.6);
      // Kısırca Yenge kalkar, oynar; Beyrek tanır.
      standUp(tl, ky, 6.0, 0.4);
      raiseArms(tl, ky, 6.4, 0.4);
      tl.to(ky.rig.rotation, { y: 6.28, duration: 1.4, ease: 'none' }, 6.6);
      mood(tl, ky, 'fear', 8.0);
      armsDown(tl, ky, 8.0);
      tl.to(ky.head.rotation, { x: 0.4, duration: 0.3 }, 8.0);
      tl.to(ky, { yOffset: -0.61, duration: 0.4 }, 8.4);
      tl.to([ky.legL.rotation, ky.legR.rotation], { x: -1.5, duration: 0.4 }, 8.4);
      // Boğazca Fatma.
      standUp(tl, fatma, 8.8, 0.4);
      raiseArms(tl, fatma, 9.2, 0.4);
      tl.to(fatma.rig.rotation, { y: 6.28, duration: 1.4, ease: 'none' }, 9.4);
      mood(tl, fatma, 'fear', 10.8);
      armsDown(tl, fatma, 10.8);
      tl.to(fatma, { yOffset: -0.61, duration: 0.4 }, 11.2);
      tl.to([fatma.legL.rotation, fatma.legR.rotation], { x: -1.5, duration: 0.4 }, 11.2);
      void bc;
      return tl;
    },
  },

  /* Banı Çiçek ve yüzük */
  {
    id: 'yuzuk',
    build(stage) {
      divanSet(stage, 'dusk');
      const tl = newTimeline();
      placeTent(stage, 7, -3, -0.8, P.red, P.gold, 1.2);
      const b = stage.track(place(deliOzan(), 1.6, 1.2, E));
      stage.track(place(yenge({ mood: 'sad' }), 5, 0.6, W)).sit();
      const bc = stage.track(place(bani({ mood: 'sad' }), 7.4, -0.2, W)).sit();
      const gleam = stage.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), glow(P.gold)));
      gleam.visible = false;
      stage.setCamera([3, 2.8, 12], [4.4, 1.5, 0.6]);

      tl.to(b.armR.rotation, { x: -1.15, duration: 0.28, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 0);
      // Kalkar; eli yeninin içinde.
      standUp(tl, bc, 0.6, 0.5);
      walkTo(tl, bc, 4.6, 1.4, 1.4, 1.2);
      tl.to(bc.armL.rotation, { x: -0.5, z: 0.6, duration: 0.4 }, 1.2);
      // "Elini çıkar, oyna."
      tl.to(b.armL.rotation, { x: -1.6, z: 0, duration: 0.4 }, 3.0);
      tl.to(bc.armL.rotation, { x: -1.5, z: 0, duration: 0.5 }, 4.0);
      tl.set(gleam.position, { x: 4.05, y: 1.3, z: 1.4 }, 4.4);
      tl.set(gleam, { visible: true }, 4.4);
      tl.to(gleam.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.3, yoyo: true, repeat: 5 }, 4.4);
      mood(tl, b, 'happy', 4.6);
      cam(tl, stage, [3, 2.2, 8], [3.2, 1.5, 1.3], 4, 3.6);
      // Sorular; kız tanır, ayağına düşer.
      shakeHead(tl, bc.head, 6.2, 1.0);
      tl.to(b.armL.rotation, { x: -2.4, duration: 0.4, yoyo: true, repeat: 3 }, 7.4);
      mood(tl, bc, 'fear', 9.0);
      mood(tl, bc, 'happy', 9.8);
      tl.set(gleam, { visible: false }, 9.8);
      armsDown(tl, bc, 9.8);
      kneelDown(tl, bc, 10.0, 0.4);
      plead(tl, bc, 10.2);
      return tl;
    },
  },

  /* Babasının gözü açılır */
  {
    id: 'baba',
    build(stage) {
      yurtSet(stage, 'dusk');
      const tl = newTimeline();
      const pure = stage.track(place(payPure({ mood: 'sad' }), 0.6, -2, 0.2));
      pure.eyesClosed = true;
      const mother = stage.track(place(ana({ mood: 'sad' }), 2.4, -2.4, -0.2));
      const bc = bani({ mood: 'happy' });
      const mare = mounted(stage, bc, -24, 4, E, 0xd8d2c4);
      mare.walkSpeed = 15;
      const b = stage.track(place(captive({ mood: 'happy' }), -22, 6, E));
      b.walkSpeed = 12;
      const cloth = stage.add(mesh(new THREE.BoxGeometry(0.3, 0.02, 0.3), mat(P.white)));
      const beam = stage.add(lightBeam(60, 2.6));
      beam.position.set(0.6, 0, -2);
      beam.scale.set(0.01, 1, 0.01);
      stage.setCamera([-3, 3, 13], [-1, 1.5, -0.5]);

      // Banı Çiçek müjdeye koşar.
      walkTo(tl, mare, -4.6, 1.6, 2.4, 0);
      tl.to(bc.armR.rotation, { x: -2.6, duration: 0.4 }, 2.4);
      mood(tl, mother, 'fear', 2.8);
      walkTo(tl, b, -1.6, 0, 3.4, 1.2);
      // "Serçe parmağını kanatsın."
      tl.to(pure.armR.rotation, { x: -1.5, duration: 0.5 }, 4.0);
      tl.to(b.armL.rotation, { x: -1.4, duration: 0.4 }, 5.0);
      toss(tl, cloth, [-1.2, 1.3, 0], [0.5, 1.9, -1.7], 5.8, 0.5);
      tl.to(pure.armR.rotation, { x: -2.5, z: -0.5, duration: 0.4 }, 6.3);
      tl.to(beam.scale, { x: 1, z: 1, duration: 1.2, ease: 'power2.out' }, 6.6);
      // Gözü açılır.
      tl.call(() => (pure.eyesClosed = false), [], 7.6);
      mood(tl, [pure, mother], 'happy', 7.6);
      tl.to(pure.armR.rotation, { x: 0, z: 0.14, duration: 0.4 }, 7.8);
      cam(tl, stage, [-0.5, 2.4, 9], [0, 1.5, -1.4], 4, 5);
      // Ayağına düşerler.
      [pure, mother].forEach((m, i) => {
        faceTo(tl, m, -1.6, 0, 8.2);
        kneelDown(tl, m, 8.6 + i * 0.15, 0.4);
        plead(tl, m, 8.8 + i * 0.15);
      });
      tl.to(beam.material, { opacity: 0, duration: 1.6 }, 9.0);
      return tl;
    },
  },

  /* Tana Sazı: Yaltacuk bağışlanır */
  {
    id: 'saz',
    build(stage) {
      steppeSet(stage, 'dusk', 181);
      const tl = newTimeline();
      reeds(stage, 5, -1, 4, 90, 7);
      const y = stage.track(place(yaltacuk({ mood: 'fear' }), -12, 3, E));
      y.walkSpeed = 15;
      const b = stage.track(place(armed(beyrek()), -22, 4, E));
      b.walkSpeed = 13;
      stage.setCamera([-3, 3.2, 15], [0, 1.6, 0]);

      walkTo(tl, y, 5, -1, 2.2, 0);
      walkTo(tl, b, -1.4, 1, 2.8, 0.8);
      // Sazı ateşe verir.
      tl.to(b.armL.rotation, { x: -1.5, duration: 0.4 }, 3.7);
      tl.call(() => {
        addFire(stage, 2.4, -0.4, 1.6);
        addFire(stage, 5.4, 1.6, 1.8);
        addFire(stage, 7.6, -2, 1.5);
      }, [], 4.2);
      tl.to(b.armL.rotation, { x: 0, duration: 0.4 }, 4.8);
      // Yaltacuk çıkar, ayağına düşer.
      walkTo(tl, y, 0.6, 1.4, 1.6, 5.6);
      kneelDown(tl, y, 7.2, 0.3);
      plead(tl, y, 7.3);
      tl.to(y.head.rotation, { x: 0.5, duration: 0.4 }, 7.4);
      // Kılıcının altından geçirir; bağışlar.
      tl.to(b.armR.rotation, { x: -2.6, duration: 0.5 }, 7.8);
      tl.to(b.armR.rotation, { x: -1.2, duration: 0.8, ease: 'sine.inOut' }, 8.6);
      tl.to(b.armR.rotation, { x: 0, duration: 0.5 }, 9.6);
      mood(tl, y, 'sad', 9.8);
      cam(tl, stage, [-1, 2.6, 10], [-0.4, 1.4, 1.2], 4, 5.6);
      return tl;
    },
  },

  /* Bayburt Hisarı alınır */
  {
    id: 'hisar',
    build(stage) {
      hisarSet(stage, 'day');
      const tl = newTimeline();
      const foes = [0, 1, 2].map((i) => stage.track(place(armed(kafir(i)), -3 + i * 3, GATE.z + 4, 0)));
      const b = armed(beyrek({ mood: 'angry' }));
      const bh = mounted(stage, b, -4, 16, Math.PI, BOZ);
      const kz = armed(kazan({ mood: 'angry' }));
      const kh = mounted(stage, kz, 3, 17, Math.PI);
      const men = [0, 1].map((i) => stage.track(place(armed(yigit(i, { mood: 'angry' })), -8 + i * 16, 15, Math.PI)));
      [bh, kh].forEach((h) => (h.walkSpeed = 15));
      men.forEach((m) => (m.walkSpeed = 15));
      const freed = [0, 1, 2].map((i) => stage.track(place(yigit(i + 1, { hat: 'none', beard: P.black, mood: 'sad' }), -1.4 + i * 1.4, GATE.z + 1.4, 0)));
      freed.forEach((f) => f.group.scale.setScalar(0.001));
      stage.setCamera([6, 4.4, 26], [0, 3, -4]);

      // At salarlar.
      walkTo(tl, bh, -2.6, GATE.z + 6.4, 2.4, 0.6);
      walkTo(tl, kh, 2.4, GATE.z + 6.6, 2.5, 0.7);
      men.forEach((m, i) => walkTo(tl, m, -6 + i * 12, GATE.z + 6, 2.6, 0.8));
      foes.forEach((f, i) => tl.to(f.armR.rotation, { x: -2.6, duration: 0.3 }, 2.4 + i * 0.1));
      for (const t of [3.2, 3.8, 4.4]) {
        tl.to([b.armR.rotation, kz.armR.rotation], { x: -2.8, duration: 0.2 }, t);
        tl.to([b.armR.rotation, kz.armR.rotation], { x: -0.7, duration: 0.12, ease: 'power3.in' }, t + 0.25);
      }
      foes.forEach((f, i) => fall(tl, f, 3.5 + i * 0.6, 0.35));
      tl.to(stage.camera.position, { x: '+=0.2', duration: 0.05, yoyo: true, repeat: 7 }, 3.5);
      cam(tl, stage, [3, 3.4, 12], [0, 2.4, -6], 4, 2.4);
      // Kapı açılır; yoldaşlar çıkar.
      mood(tl, [b, kz], 'happy', 5.6);
      freed.forEach((f, i) => {
        tl.to(f.group.scale, { x: 1, y: 1, z: 1, duration: 0.4 }, 6.0 + i * 0.2);
        walkTo(tl, f, -2.4 + i * 2.4, GATE.z + 3.6, 1.2, 6.2 + i * 0.2);
        mood(tl, f, 'happy', 7.4);
        raiseArms(tl, f, 7.5 + i * 0.1, 0.4);
      });
      tl.to([b.armR.rotation, kz.armR.rotation], { x: -2.7, duration: 0.5 }, 7.6);
      return tl;
    },
  },

  /* Düğün; Dede Korkut */
  {
    id: 'son',
    build(stage) {
      const sky = divanSet(stage, 'dusk');
      const tl = newTimeline();
      placeTent(stage, -7, -1.4, 0.7, P.white, P.red, 1.1);
      addFire(stage, 4.6, 2, 1.1);
      const b = stage.track(place(beyrek({ robe: P.red, mood: 'happy' }), -1, 0.4, 0.2));
      const bc = stage.track(place(bani({ mood: 'happy' }), 0.6, 0.2, -0.2));
      const girl = stage.track(place(beyKizi({ mood: 'happy' }), -2.8, -0.6, 0.4));
      const pure = stage.track(place(payPure({ mood: 'happy' }), 2.8, -1.8, -0.6));
      const mother = stage.track(place(ana({ mood: 'happy' }), 4.2, -2.4, -0.7));
      const dede = stage.track(place(dedeKorkut(), 7, 2.6, -1.9)).sit();
      const guests = [0, 1, 2].map((i) => stage.track(place(yigit(i, { mood: 'happy' }), -5 + i * 0.6, 3.4 + i * 1.2, 1.2)));
      void girl;
      void pure;
      void mother;
      stage.setCamera([-2, 3.4, 15], [0, 1.6, 0]);

      // Yiğitler ok atar: düştüğü yere gerdek.
      guests.forEach((g, i) => {
        raiseArms(tl, g, 0.6 + i * 0.3, 0.4);
        launch(tl, stage.add(arrow()), [-5 + i * 0.6, 2, 3.4 + i * 1.2], [-20 + i * 16, 0.3, -14 - i * 3], 1.0 + i * 0.4, 0.8);
      });
      // Beyrek ile Banı Çiçek el ele.
      faceTo(tl, b, 0.6, 0.2, 2.6);
      faceTo(tl, bc, -1, 0.4, 2.6);
      tl.to([b.armL.rotation, b.armR.rotation, bc.armL.rotation, bc.armR.rotation], { x: -1.2, duration: 0.5 }, 3.0);
      // Dedem Korkut şadılık çalar.
      sky.tweenTo(tl, 'night', 7, 3);
      tl.to(dede.armR.rotation, { x: -1.15, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: 25 }, 3.4);
      tl.to(dede.head.rotation, { z: 0.12, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 5 }, 3.4);
      guests.forEach((g, i) => tl.to(g, { yOffset: 0.3, duration: 0.25, yoyo: true, repeat: 15 }, 4 + i * 0.12));
      cam(tl, stage, [2, 2.8, 12], [1.6, 1.5, 0.4], 7, 3);
      return tl;
    },
  },
];
