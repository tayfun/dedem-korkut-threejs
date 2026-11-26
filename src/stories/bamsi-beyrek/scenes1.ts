import * as THREE from 'three';
import { armsDown, cam, faceTo, fall, grieve, kneelDown, launch, mood, newTimeline, place, plead, raiseArms, shakeHead, standUp, sway, toss, turn, walkTo } from '../../engine/direct';
import type { SceneDef } from '../../engine/story';
import { Beast, Bird, Horse, Sheep } from '../../procedural/animals';
import { archer, armed, child, dedeKorkut, mounted } from '../../procedural/cast';
import { P, mat, mesh } from '../../procedural/palette';
import { arrow, bow, lightBeam, mace, ring } from '../../procedural/props';
import { placeTent, steppeSet } from '../../procedural/sets';
import { ana, bani, bayindir, bezirgan, beyrek, cayirSet, derbentSet, divanSet, kafir, karcar, payPicen, payPure, pen, pond, yenge, yigit, yurtSet } from './sets';

/** Bamsı Beyrek, birinci bölüm: doğumundan kaçırılışına. Metinler `story.ts` içindedir. */

const E = Math.PI / 2; // doğuya (+x) bakış
const W = -Math.PI / 2; // batıya (-x) bakış
const BOZ = 0xb8b4aa; // boz aygırın rengi

export const scenes: SceneDef[] = [
  /* Divan: iki bey evlat diler */
  {
    id: 'dilek',
    build(stage) {
      const sky = divanSet(stage, 'day');
      const tl = newTimeline();
      const han = stage.track(place(bayindir(), 0, -4.6, 0));
      const pure = stage.track(place(payPure({ mood: 'sad' }), -2.6, -1, 0.5));
      const picen = stage.track(place(payPicen(), 3, -1.4, -0.6));
      const sons = [0, 1, 2].map((i) => stage.track(place(yigit(i), -7 + i * 1.5, -3 - (i % 2), 0.5)));
      const beam = stage.add(lightBeam(70, 4));
      beam.position.set(0, 0, -1.4);
      beam.scale.set(0.01, 1, 0.01);
      stage.setCamera([-2, 3.4, 15], [-1, 1.6, -1]);

      // Pay Püre ah edip ağlar.
      faceTo(tl, pure, -6, -3, 0.4);
      tl.call(() => grieve(pure), [], 1.4);
      sway(tl, pure, 1.6, 3);
      faceTo(tl, han, -2.6, -1, 2.0);
      // Beyler el kaldırıp dua eder.
      [han, ...sons].forEach((m, i) => raiseArms(tl, m, 4.0 + i * 0.15));
      // Pay Piçen de diler.
      tl.to(picen.armR.rotation, { x: -1.5, duration: 0.5 }, 5.4);
      raiseArms(tl, picen, 6.4);
      tl.to(pure.head.rotation, { x: 0, duration: 0.4 }, 6.4);
      raiseArms(tl, pure, 6.6);
      mood(tl, pure, 'neutral', 6.6);
      tl.to(beam.scale, { x: 1, z: 1, duration: 2, ease: 'power2.out' }, 7.2);
      sky.tweenTo(tl, 'dawn', 3, 7.2);
      mood(tl, [pure, picen], 'happy', 9);
      cam(tl, stage, [0, 2.8, 11], [0, 2, -2], 6, 3.6);
      return tl;
    },
  },

  /* Bezirgânlar armağan almaya gider */
  {
    id: 'bezirgan',
    build(stage) {
      yurtSet(stage, 'day');
      const tl = newTimeline();
      const pure = stage.track(place(payPure(), 0, -2, 0.3));
      const mother = stage.track(place(ana(), 2, -2.6, -0.3));
      const baby = stage.track(place(child(1, { hat: 'none', mood: 'happy' }), 1, -1.6, 0));
      baby.group.scale.setScalar(0.42);
      const men = [0, 1].map((i) => stage.track(place(bezirgan(i), -3 - i * 1.5, 0.6 + i, 1.2)));
      const packs = [0, 1].map((i) => stage.track(place(new Horse(i ? P.brown : 0x8a6a48), -6.5 - i * 2.2, 3.4 + i, W)));
      void mother;
      stage.setCamera([-1, 3, 13], [-1, 1.5, 0]);

      tl.to(pure.armR.rotation, { x: -1.5, z: -0.8, duration: 0.6 }, 0.6);
      men.forEach((m, i) => {
        tl.to(m.head.rotation, { x: 0.4, duration: 0.3, yoyo: true, repeat: 1 }, 1.8 + i * 0.2);
        walkTo(tl, m, -34 - i * 2, 8 + i * 2, 6, 3.0 + i * 0.3);
      });
      packs.forEach((h, i) => walkTo(tl, h, -38 - i * 3, 10 + i * 2, 6, 3.2 + i * 0.3));
      tl.to(pure.armR.rotation, { x: 0, z: 0.14, duration: 0.5 }, 3.0);
      // Oğlan büyür: beş yaşına, on beş yaşına.
      tl.to(baby.group.scale, { x: 0.62, y: 0.62, z: 0.62, duration: 1.2, ease: 'back.out(2)' }, 5.4);
      tl.to(baby.group.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 1.2, ease: 'back.out(2)' }, 7.4);
      cam(tl, stage, [1, 2.4, 9], [1, 1.3, -1.6], 4, 4.6);
      return tl;
    },
  },

  /* Kara Derbent: bezirgânlar soyulur; biri yiğide koşar */
  {
    id: 'derbent',
    build(stage) {
      derbentSet(stage, 'day');
      const tl = newTimeline();
      placeTent(stage, -5, -5, 0.5, P.cream, P.red, 1.1);
      const b = stage.track(place(beyrek({ scale: 0.95 }), -3.4, -1.6, E)).sit();
      const friends = [0, 1].map((i) => stage.track(place(yigit(i), -5.2 + i * 0.4, 0.2 - i * 3.4, E)).sit());
      const runner = stage.track(place(bezirgan(0, { mood: 'fear' }), 26, 5, W));
      runner.walkSpeed = 15;
      const steed = stage.track(place(new Horse(0x8a6a48), -8, 2, E));
      stage.setCamera([4, 3.2, 15], [2, 1.4, 0]);

      tl.to(b.armR.rotation, { x: -2.0, duration: 0.5, yoyo: true, repeat: 3 }, 0.2);
      walkTo(tl, runner, -0.4, -0.8, 3.4, 0.4);
      kneelDown(tl, runner, 3.9, 0.3);
      plead(tl, runner, 4.0);
      mood(tl, b, 'angry', 5.2);
      // Altın kadehi yere çalar, kalkar.
      tl.to(b.armR.rotation, { x: -2.6, duration: 0.25 }, 5.4);
      tl.to(b.armR.rotation, { x: -0.3, duration: 0.12, ease: 'power3.in' }, 5.7);
      standUp(tl, b, 5.9, 0.4);
      friends.forEach((f, i) => standUp(tl, f, 6.1 + i * 0.1, 0.4));
      raiseArms(tl, b, 6.6, 0.4);
      walkTo(tl, steed, -5, 1.4, 1.2, 6.4);
      cam(tl, stage, [-1, 2.6, 10], [-2.4, 1.5, -1], 4, 4);
      return tl;
    },
  },

  /* Malı kurtarır; boz aygırı, gürzü, yayı beğenir */
  {
    id: 'yardim',
    build(stage) {
      derbentSet(stage, 'day');
      const tl = newTimeline();
      const foes = [0, 1, 2].map((i) => stage.track(place(armed(kafir(i)), 1 + i * 1.6, -1.4 + (i % 2) * 2.2, W)));
      const b = armed(beyrek({ scale: 0.95, mood: 'angry' }));
      const bh = mounted(stage, b, -24, 1, E, 0x8a6a48);
      bh.walkSpeed = 15;
      const grey = stage.track(place(new Horse(BOZ), 7, -2.4, W));
      const gifts = stage.add(new THREE.Group());
      gifts.position.set(6, 0.1, 1.4);
      const m = mace();
      m.rotation.z = 1.4;
      const y = bow();
      y.position.set(0.6, 0.1, 0.5);
      y.rotation.x = Math.PI / 2;
      gifts.add(m, y);
      const merchants = [0, 1].map((i) => stage.track(place(bezirgan(i, { mood: 'fear' }), 9 + i * 1.4, 1 + i * 1.6, W)).kneel());
      stage.setCamera([3, 3.4, 16], [2, 1.5, 0]);

      // Söz söylemeden kılıç vurur.
      walkTo(tl, bh, -1.4, 0, 1.8, 0.3);
      tl.to(b.armR.rotation, { x: -2.8, duration: 0.2 }, 1.8);
      tl.to(b.armR.rotation, { x: -0.7, duration: 0.12, ease: 'power3.in' }, 2.1);
      fall(tl, foes[0], 2.2, 0.35);
      tl.to(b.armR.rotation, { x: -2.8, duration: 0.2 }, 2.6);
      tl.to(b.armR.rotation, { x: -0.7, duration: 0.12, ease: 'power3.in' }, 2.9);
      fall(tl, foes[1], 3.0, 0.35);
      mood(tl, foes[2], 'fear', 3.0);
      foes[2].walkSpeed = 15;
      walkTo(tl, foes[2], 26, 10, 2.4, 3.2);
      // Bezirgânlar: "Beğendiğin malı al."
      mood(tl, merchants, 'happy', 4.0);
      merchants.forEach((mm) => standUp(tl, mm, 4.2));
      mood(tl, b, 'neutral', 4.2);
      tl.to(b.armR.rotation, { x: 0, duration: 0.4 }, 4.2);
      walkTo(tl, bh, 4.2, 0.2, 1.6, 4.6);
      tl.to(b.armL.rotation, { x: -1.4, z: -0.6, duration: 0.5 }, 6.3);
      // "Bunlar beyimizin oğlunun emanetidir."
      shakeHead(tl, merchants[0].head, 7.2, 1.0);
      mood(tl, merchants, 'sad', 7.2);
      tl.to(b.armL.rotation, { x: -2.3, z: 0.5, duration: 0.4 }, 8.4); // parmağını ısırır
      tl.to(b.armL.rotation, { x: 0, z: -0.14, duration: 0.4 }, 9.2);
      turn(tl, bh, W, 9.4, 0.5);
      walkTo(tl, bh, -26, 4, 3, 9.9);
      void grey;
      cam(tl, stage, [5, 3, 14], [4.6, 1.5, 0], 4, 4.4);
      return tl;
    },
  },

  /* Ad: boz aygırlı Bamsı Beyrek */
  {
    id: 'ad',
    build(stage) {
      yurtSet(stage, 'day');
      const tl = newTimeline();
      const pure = stage.track(place(payPure(), 0.6, -2, 0.2));
      const b = stage.track(place(beyrek({ scale: 0.95 }), -1.8, -1.6, 0.4));
      const men = [0, 1].map((i) => stage.track(place(bezirgan(i), -16 - i * 1.6, 4 + i, E)));
      const grey = stage.track(place(new Horse(BOZ), -20, 6, E));
      const dede = stage.track(place(dedeKorkut(), 14, 3, W));
      stage.setCamera([-2, 3, 13], [-1, 1.5, -0.5]);

      men.forEach((m, i) => walkTo(tl, m, -3.6 - i * 1.4, 0.4 + i * 0.8, 3, 0.2 + i * 0.2));
      walkTo(tl, grey, -7, 2.6, 3.4, 0.4);
      // Önce oğlanın elini öperler.
      men.forEach((m, i) => {
        faceTo(tl, m, -1.8, -1.6, 3.4);
        tl.to(m.rig.rotation, { x: 0.5, duration: 0.4, yoyo: true, repeat: 1 }, 3.6 + i * 0.3);
      });
      mood(tl, pure, 'angry', 4.4);
      tl.to(pure.armR.rotation, { x: -2.4, duration: 0.4, ease: 'back.out(2)' }, 4.5);
      tl.to(men[0].armR.rotation, { x: -1.4, z: 0.9, duration: 0.5 }, 5.6); // oğlanı gösterir
      tl.to(pure.armR.rotation, { x: 0, duration: 0.4 }, 6.2);
      mood(tl, pure, 'happy', 6.6);
      // Dede Korkut ad koyar.
      walkTo(tl, dede, 2.4, 0.2, 3.2, 4.6);
      faceTo(tl, dede, -1.8, -1.6, 7.8);
      tl.to(dede.armL.rotation, { x: -1.9, z: 0, duration: 0.7 }, 8.0);
      faceTo(tl, b, 2.4, 0.2, 8.0);
      mood(tl, b, 'happy', 9.0);
      raiseArms(tl, b, 9.2, 0.5);
      cam(tl, stage, [0, 2.4, 9.5], [0, 1.5, -1], 4, 6);
      return tl;
    },
  },

  /* Kırmızı otağ: av payı */
  {
    id: 'otag',
    build(stage) {
      cayirSet(stage, 'day');
      const tl = newTimeline();
      const deer = stage.track(place(new Beast('deer'), -22, 2, E));
      const b = archer(beyrek());
      const bh = mounted(stage, b, -30, 3, E, BOZ);
      bh.walkSpeed = 15;
      const bc = stage.track(place(bani(), 5.2, -3.2, -1.0));
      const yg = stage.track(place(yenge(), 3.6, -2.4, -1.2));
      stage.setCamera([-4, 3.6, 17], [0, 1.6, 0]);

      walkTo(tl, deer, 30, 12, 6, 0);
      walkTo(tl, bh, -4, 1.4, 4.4, 0.4);
      // Banı Çiçek otağdan bakar.
      tl.to(bc.armR.rotation, { x: -1.4, z: -0.6, duration: 0.5 }, 3.6);
      tl.to(bc.armR.rotation, { x: 0, z: 0.14, duration: 0.5 }, 4.8);
      // Kısırca Yenge av payı diler.
      walkTo(tl, yg, -1.4, 0.6, 2, 4.6);
      plead(tl, yg, 6.6);
      tl.to(b.armR.rotation, { x: -1.4, z: 0.6, duration: 0.5 }, 7.4);
      armsDown(tl, yg, 8.2);
      // "Bu otağ kimindir?"
      tl.to(b.armR.rotation, { x: -1.5, z: -0.9, duration: 0.5 }, 8.6);
      tl.to(yg.armL.rotation, { x: -1.4, z: -1.0, duration: 0.5 }, 9.4);
      mood(tl, b, 'happy', 10.0);
      tl.to(b.armR.rotation, { x: 0, z: 0.14, duration: 0.5 }, 10.2);
      cam(tl, stage, [-2, 3, 13], [1, 1.7, -0.6], 5, 4);
      return tl;
    },
  },

  /* At yarışı ve ok */
  {
    id: 'yaris',
    build(stage) {
      cayirSet(stage, 'day');
      const tl = newTimeline();
      const b = archer(beyrek());
      const bh = mounted(stage, b, -14, 1.6, E, BOZ);
      const g = archer(bani());
      const gh = mounted(stage, g, -14, 4.2, E, 0xd8d2c4);
      bh.walkSpeed = 16;
      gh.walkSpeed = 15;
      const post = stage.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.4, 5), mat(P.darkBrown)));
      post.position.set(-2, 1.2, -6);
      stage.setCamera([-10, 3.4, 16], [-6, 1.8, 2]);

      // At yarışı: Beyrek'in atı geçer.
      walkTo(tl, bh, 9, 1.6, 3.0, 0.6);
      walkTo(tl, gh, 6, 4.2, 3.2, 0.6);
      cam(tl, stage, [4, 3.2, 15], [5, 1.8, 2], 3.4, 0.6);
      mood(tl, b, 'happy', 3.6);
      raiseArms(tl, b, 3.7, 0.4);
      armsDown(tl, b, 4.8);
      tl.to(b.head.rotation, { x: 0, duration: 0.3 }, 4.8);
      // Ok: kızın okunu yarar.
      faceTo(tl, bh, -2, -6, 5.0);
      faceTo(tl, gh, -2, -6, 5.0);
      tl.to(g.armL.rotation, { x: -1.6, duration: 0.3 }, 5.4);
      launch(tl, stage.add(arrow()), [6, 2.6, 4], [-2, 1.9, -6], 5.9, 0.45);
      const stuck = stage.add(arrow());
      stuck.position.set(-1.7, 1.9, -5.7);
      stuck.lookAt(-2, 1.9, -6);
      stuck.visible = false;
      tl.set(stuck, { visible: true }, 6.35);
      tl.to(b.armL.rotation, { x: -1.6, duration: 0.3 }, 6.8);
      launch(tl, stage.add(arrow()), [9, 2.6, 1.6], [-1.8, 1.9, -5.8], 7.3, 0.45);
      tl.set(stuck, { visible: false }, 7.75);
      for (const dy of [0.5, -0.4]) {
        const half = stage.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.4, 4), mat(P.brown), false));
        toss(tl, half, [-1.8, 1.9, -5.8], [-1.4 + dy, 0.1, -4.6], 7.75, 0.5);
      }
      cam(tl, stage, [8, 3.4, 13], [1, 1.8, -3], 2.6, 5.0);
      mood(tl, g, 'fear', 7.9);
      return tl;
    },
  },

  /* Güreş ve yüzük */
  {
    id: 'gures',
    build(stage) {
      cayirSet(stage, 'dusk');
      const tl = newTimeline();
      const b = stage.track(place(beyrek({ mood: 'angry' }), -0.75, 1, E));
      const g = stage.track(place(bani({ mood: 'angry' }), 0.75, 1, W));
      stage.track(place(new Horse(BOZ), -7, -2, E));
      stage.track(place(new Horse(0xd8d2c4), 8, -1, W));
      const gold = stage.add(ring());
      stage.setCamera([0, 2.6, 10], [0, 1.4, 1]);

      // Tutuşurlar: biri kaldırır, öbürü kaldırır.
      [b, g].forEach((m) => tl.to([m.armL.rotation, m.armR.rotation], { x: -1.4, duration: 0.4 }, 0.3));
      tl.to([b.group.position, g.group.position], { x: '+=0.9', duration: 0.6, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.8);
      tl.to(b.rig.rotation, { z: 0.2, duration: 0.6, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.8);
      tl.to(g.rig.rotation, { z: 0.2, duration: 0.6, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.8);
      mood(tl, b, 'fear', 3.0);
      // Belinden kavrar, arkası üstüne yere vurur.
      mood(tl, b, 'angry', 4.4);
      tl.to([b.armL.rotation, b.armR.rotation], { x: -1.0, duration: 0.3 }, 4.5);
      tl.to(g, { yOffset: 0.6, duration: 0.3, ease: 'power2.out' }, 4.7);
      fall(tl, g, 5.0, 0.35);
      mood(tl, g, 'fear', 5.0);
      armsDown(tl, b, 5.5);
      mood(tl, b, 'happy', 5.8);
      // "Banı Çiçek benim."
      tl.to(g.rig.rotation, { x: 0, duration: 0.7 }, 6.4);
      tl.to(g, { yOffset: 0, duration: 0.7 }, 6.4);
      armsDown(tl, g, 6.4);
      mood(tl, g, 'happy', 7.0);
      tl.to(g.armR.rotation, { x: -1.0, z: -0.5, duration: 0.5 }, 7.0);
      // Üç öper, bir dişler.
      tl.to(b.group.position, { x: -0.15, duration: 0.5 }, 7.8);
      tl.to(b.rig.rotation, { x: 0.25, duration: 0.25, yoyo: true, repeat: 7 }, 8.3);
      // Yüzük.
      tl.to(b.armR.rotation, { x: -1.3, duration: 0.4 }, 10.4);
      toss(tl, gold, [0.1, 1.3, 1.1], [0.55, 1.2, 1.1], 10.8, 0.4);
      tl.to(g.armL.rotation, { x: -1.3, duration: 0.4 }, 10.6);
      cam(tl, stage, [0.5, 2, 6.5], [0.2, 1.4, 1], 5, 5.6);
      return tl;
    },
  },

  /* Deli Karçar: "Çalarsan elin kurusun" */
  {
    id: 'karcar',
    build(stage) {
      steppeSet(stage, 'day', 141);
      const tl = newTimeline();
      placeTent(stage, 9, -7, -0.5, P.black, P.crimson, 1.3);
      const k = stage.track(place(armed(karcar()), 6, -1.6, W));
      k.walkSpeed = 14;
      const dede = dedeKorkut();
      dede.setMood('fear');
      const dh = mounted(stage, dede, -16, 1, E, 0x8a6a48);
      stage.setCamera([0, 3.4, 16], [0, 1.6, 0]);

      walkTo(tl, dh, 1.4, 0.4, 3, 0);
      tl.to(dede.armL.rotation, { x: -1.5, z: 0, duration: 0.4 }, 3.2);
      // Karçar kılıcıyla üstüne sürer; Dede kaçar.
      tl.to(k.armR.rotation, { x: -2.7, duration: 0.3 }, 3.8);
      turn(tl, dh, W, 4.1, 0.3);
      dh.walkSpeed = 15;
      walkTo(tl, dh, -9, 2.4, 1.8, 4.4);
      walkTo(tl, k, -6.6, 1.6, 1.9, 4.5);
      cam(tl, stage, [-6, 3, 13], [-7.4, 1.8, 1.8], 2.4, 4.2);
      // "Çalarsan elin kurusun!" — el yukarıda asılı kalır.
      turn(tl, dh, E, 6.3, 0.3);
      tl.to(dede.armR.rotation, { x: -1.6, z: 0, duration: 0.3 }, 6.4);
      mood(tl, k, 'fear', 6.8);
      tl.to(k.rig.rotation, { z: 0.12, duration: 0.12, yoyo: true, repeat: 9 }, 6.8);
      // Yalvarır; Dede dua eder, el sağalır.
      kneelDown(tl, k, 8.2, 0.4);
      tl.to(k.armL.rotation, { x: -1.5, duration: 0.4 }, 8.2);
      mood(tl, dede, 'neutral', 8.6);
      tl.to(dede.armR.rotation, { x: -2.5, z: 0.3, duration: 0.5 }, 9.2);
      tl.to(k.armR.rotation, { x: 0, duration: 0.6 }, 10.0);
      mood(tl, k, 'sad', 10.0);
      return tl;
    },
  },

  /* Başlık: bin buğra, bin aygır, bin koç, bin köpek, bin pire */
  {
    id: 'baslik',
    build(stage) {
      steppeSet(stage, 'day', 141);
      const tl = newTimeline();
      placeTent(stage, 9, -7, -0.5, P.black, P.crimson, 1.3);
      pen(stage, 2, 0.6, 2);
      pond(stage, -5.5, 3.4, 2.2);
      const k = stage.track(place(karcar({ mood: 'smug' }), 5.4, -1.6, W));
      const dede = stage.track(place(dedeKorkut(), -1.4, -2.6, 0.9));
      const herd = [
        stage.track(place(new Horse(P.brown), -24, -3, E)),
        stage.track(place(new Horse(0x4a3a2c), -27, -1, E)),
        stage.track(place(new Sheep(true), -26, 2.6, E)),
        stage.track(place(new Sheep(true), -29, 4, E)),
        stage.track(place(new Beast('dog'), -25, 5.6, E)),
        stage.track(place(new Beast('dog', P.brown), -28, 6.6, E)),
      ];
      stage.setCamera([-3, 4, 17], [-2, 1.5, 0]);

      herd.forEach((h, i) => walkTo(tl, h, -12 + (i % 2) * 2.4, -5 + i * 1.3, 4, 0.2 + i * 0.15));
      tl.to(dede.armL.rotation, { x: -1.5, z: -0.9, duration: 0.5 }, 3.6);
      // "Hani pireler?"
      tl.to(k.armR.rotation, { x: -1.5, duration: 0.4 }, 4.6);
      tl.to(k.armR.rotation, { x: 0, duration: 0.4 }, 5.4);
      tl.to(dede.armL.rotation, { x: -1.4, z: 0.4, duration: 0.5 }, 5.4);
      k.walkSpeed = 9;
      walkTo(tl, k, 2, 0.6, 1.6, 5.8);
      // Pireler üşüşür.
      mood(tl, k, 'fear', 7.6);
      tl.to(k, { yOffset: 0.35, duration: 0.14, yoyo: true, repeat: 13 }, 7.6);
      tl.to([k.armL.rotation, k.armR.rotation], { x: -2.3, duration: 0.16, yoyo: true, repeat: 11 }, 7.6);
      tl.to(k.rig.rotation, { z: 0.2, duration: 0.14, yoyo: true, repeat: 13 }, 7.6);
      cam(tl, stage, [-1, 3, 12], [-1, 1.4, 1.5], 3, 6.4);
      // Kendini suya atar.
      k.walkSpeed = 16;
      walkTo(tl, k, -5.5, 3.4, 1.4, 9.7);
      tl.to(k, { yOffset: -0.9, duration: 0.3, ease: 'power2.in' }, 11.0);
      armsDown(tl, k, 11.2);
      mood(tl, k, 'sad', 11.4);
      mood(tl, dede, 'happy', 11.2);
      return tl;
    },
  },

  /* Gerdek çadırı ve kırmızı kaftan */
  {
    id: 'kaftan',
    build(stage) {
      steppeSet(stage, 'dusk', 151);
      const tl = newTimeline();
      const b = stage.track(place(archer(beyrek({ robe: P.red })), -4.6, 2, E));
      const friends = [0, 1, 2].map((i) => stage.track(place(yigit(i, { mood: 'sad' }), -7 - (i % 2) * 1.3, 0.4 + i * 1.5, E)));
      const flown = stage.add(arrow());
      const stuck = stage.add(arrow());
      stuck.position.set(4, 0.3, -3.6);
      stuck.rotation.x = Math.PI / 2 + 0.3;
      stuck.visible = false;
      stage.setCamera([-6, 3.4, 15], [-3, 1.6, 0]);

      // Okunu atar; düştüğü yere gerdek dikilir.
      tl.to(b.armL.rotation, { x: -2.0, duration: 0.4 }, 0.5);
      launch(tl, flown, [-4.2, 2, 2], [4, 0.4, -3.6], 1.1, 0.7);
      tl.set(stuck, { visible: true }, 1.8);
      tl.call(() => placeTent(stage, 4, -5.4, -0.3, P.white, P.red, 1.3), [], 2.4);
      cam(tl, stage, [-3, 3.2, 14], [-1, 1.6, -1], 3, 1.2);
      tl.to(b.armL.rotation, { x: 0, duration: 0.4 }, 2.0);
      // Yoldaşları küser.
      faceTo(tl, b, -7, 1.5, 3.4);
      friends.forEach((f, i) => tl.to(f.head.rotation, { x: 0.4, y: 0.5, duration: 0.5 }, 3.6 + i * 0.2));
      tl.to(b.armR.rotation, { x: -1.4, duration: 0.4 }, 4.8);
      tl.to(b.armR.rotation, { x: -1.0, z: -0.8, duration: 0.4 }, 5.6); // kaftanını gösterir
      mood(tl, friends, 'happy', 6.6);
      friends.forEach((f, i) => {
        tl.to(f.head.rotation, { x: 0, y: 0, duration: 0.4 }, 6.6);
        raiseArms(tl, f, 7.0 + i * 0.15, 0.4);
      });
      tl.to(b.armR.rotation, { x: 0, z: 0.14, duration: 0.4 }, 6.8);
      mood(tl, b, 'happy', 6.8);
      return tl;
    },
  },

  /* Gece baskını; yas */
  {
    id: 'baskin',
    build(stage) {
      const sky = steppeSet(stage, 'night', 151);
      const tl = newTimeline();
      placeTent(stage, 4, -5.4, -0.3, P.white, P.red, 1.3);
      const b = stage.track(place(beyrek({ robe: P.red }), 2.4, -2.4, 0.4)).lie();
      b.eyesClosed = true;
      const naip = stage.track(place(armed(yigit(0)), 0.4, -0.6, W));
      const raiders = [0, 1, 2, 3].map((i) => stage.track(place(armed(kafir(i)), -22 - i * 2, -2 + i * 2, E)));
      raiders.forEach((r) => (r.walkSpeed = 14));
      const crows = [0, 1].map((i) => {
        const c = stage.track(new Bird(P.black, 1.4));
        c.group.position.set(-20 + i * 30, 18, -30);
        return c;
      });
      const pure = stage.track(place(payPure({ mood: 'sad' }), 30, 6, W));
      const mother = stage.track(place(ana({ mood: 'sad' }), 32, 8, W));
      const bc = stage.track(place(bani({ robe: P.black, trim: P.stone, mood: 'sad' }), 31, 4, W));
      stage.setCamera([-4, 3.6, 16], [0, 1.6, -1]);

      raiders.forEach((r, i) => walkTo(tl, r, -2.6 + i * 1.4, -1.6 + (i % 2) * 2.4, 2.4, 0.4 + i * 0.1));
      // Naip şehit olur.
      tl.to(naip.armR.rotation, { x: -2.7, duration: 0.3 }, 2.2);
      tl.to(raiders[0].armR.rotation, { x: -2.8, duration: 0.2 }, 2.7);
      tl.to(raiders[0].armR.rotation, { x: -0.7, duration: 0.12, ease: 'power3.in' }, 2.95);
      fall(tl, naip, 3.05, 0.35);
      // Beyrek tutsak gider.
      tl.call(() => (b.eyesClosed = false), [], 3.2);
      mood(tl, b, 'fear', 3.2);
      tl.to(b.rig.rotation, { x: 0, duration: 0.4 }, 3.3);
      tl.to(b, { yOffset: 0, duration: 0.4 }, 3.3);
      tl.to(b.armL.rotation, { x: 0.7, z: 0.5, duration: 0.3 }, 3.9);
      tl.to(b.armR.rotation, { x: 0.7, z: -0.5, duration: 0.3 }, 3.9);
      b.walkSpeed = 12;
      b.armSwing = 0;
      walkTo(tl, b, -26, 2, 3, 4.3);
      raiders.forEach((r, i) => walkTo(tl, r, -28 - i * 2, i * 2, 3, 4.4 + i * 0.1));
      // Sabah: kargalar, yas.
      sky.tweenTo(tl, 'dawn', 2.4, 6.6);
      crows.forEach((c, i) => tl.to(c.group.position, { x: 3 + i * 1.6, y: 3.6 - i * 0.4, z: -5 + i, duration: 2.4, ease: 'power1.out' }, 7.0));
      [pure, mother, bc].forEach((m) => (m.walkSpeed = 12));
      walkTo(tl, pure, 3.4, 0.6, 2.6, 7.4);
      walkTo(tl, mother, 5.4, 1.4, 2.8, 7.5);
      walkTo(tl, bc, 1.2, 1.6, 2.8, 7.6);
      [pure, mother, bc].forEach((m, i) => {
        faceTo(tl, m, 3, -3, 10.3);
        kneelDown(tl, m, 10.5 + i * 0.1, 0.4);
        tl.call(() => grieve(m), [], 10.7 + i * 0.1);
        sway(tl, m, 10.9 + i * 0.2, 3);
      });
      cam(tl, stage, [3, 2.8, 12], [3, 1.3, -1], 4, 7.4);
      return tl;
    },
  },
];
