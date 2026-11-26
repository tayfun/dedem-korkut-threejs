import * as THREE from 'three';
import { armsDown, cam, faceTo, fall, grieve, kneelDown, launch, mood, newTimeline, place, plead, pop, raiseArms, shakeHead, standUp, sway, toss, turn, vanish, walkTo } from '../../engine/direct';
import type { SceneDef } from '../../engine/story';
import { Beast, Bird, Horse } from '../../procedural/animals';
import { archer, armed, child, dedeKorkut, mounted, villager } from '../../procedural/cast';
import type { Human } from '../../procedural/human';
import { P, mat, mesh } from '../../procedural/palette';
import { arrow, kopuz, lightBeam } from '../../procedural/props';
import { placeTent } from '../../procedural/sets';
import { TENTS, bayindir, bogac, bound, dagSet, dirse, flowers, hatun, hizir, homeSet, kiz, konakSet, namert, sofra, toySet, yigit } from './sets';

/** Boğaç Han — sahnelerin 3B kurulumu ve animasyonu. Metinler `story.ts` içindedir. */

const E = Math.PI / 2; // doğuya (+x) bakış
const W = -Math.PI / 2; // batıya (-x) bakış

/** Yerde yatan yaralı Boğaç: sırtüstü, gözleri kapalı. */
function wounded(m: Human): Human {
  m.lie();
  m.eyesClosed = true;
  m.setMood('sad');
  return m;
}

export const scenes: SceneDef[] = [
  /* Bayındır Han'ın toyu: ak, kızıl, kara otağ */
  {
    id: 'toy',
    build(stage) {
      toySet(stage, 'day');
      const tl = newTimeline();
      const han = stage.track(place(bayindir(), 0, -3, 0));
      sofra(stage, -6, -2.5);
      sofra(stage, 5, -2);
      const guests = [0, 1, 3, 5].map((k, i) => stage.track(place(villager(k), -20 - i * 2.4, 3 + (i % 2) * 2, E)));
      stage.setCamera([0, 5, 24], [0, 2, -4]);

      // Han otağları tek tek gösterir.
      tl.to(han.armR.rotation, { x: -1.5, z: 0.9, duration: 0.6 }, 0.8);
      tl.to(han.armR.rotation, { x: 0, z: 0.14, duration: 0.5 }, 2.2);
      tl.to(han.armL.rotation, { x: -1.5, z: -0.9, duration: 0.6 }, 2.6);
      tl.to(han.armL.rotation, { x: 0, z: -0.14, duration: 0.5 }, 4.0);
      guests.forEach((g, i) => walkTo(tl, g, [-8, -5, 3, 6.4][i], [-0.6, -0.4, 0, 0][i], 5, 1 + i * 0.4));
      guests.forEach((g, i) => faceTo(tl, g, 0, -3, 6.4 + i * 0.3));
      cam(tl, stage, [8, 4, 20], [3, 2, -5], 8, 1);
      return tl;
    },
  },

  /* Dirse Han kara otağa kondurulur */
  {
    id: 'kara',
    build(stage) {
      toySet(stage, 'day');
      const tl = newTimeline();
      const [kx, kz] = TENTS.kara;
      const rug = stage.add(mesh(new THREE.BoxGeometry(3, 0.05, 2.2), mat(P.black)));
      rug.position.set(kx - 1.5, 0.03, kz + 6);
      stage.keepClear(kx - 1.5, kz + 6, 2.2);
      const dish = stage.add(mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.1, 8), mat(P.stoneDark)));
      dish.position.set(kx - 1.5, 0.12, kz + 6.6);
      const d = stage.track(place(dirse(), -6, 5, E));
      const men = [0, 1, 2].map((i) => stage.track(place(namert(i, { mood: 'neutral' }), -8.5 - i * 1.6, 6.2 + (i % 2) * 1.4, E)));
      const usher = stage.track(place(villager(3), 4, 1.5, W));
      stage.setCamera([2, 4, 20], [4, 1.6, -1]);

      // Karşılayan yiğit kara otağı gösterir.
      tl.to(usher.armL.rotation, { x: -1.4, z: -1.0, duration: 0.5 }, 0.4);
      walkTo(tl, d, kx - 1.5, kz + 5.6, 3.4, 0.9);
      men.forEach((m, i) => walkTo(tl, m, kx - 5 - i * 1.5, kz + 8 + (i % 2), 3.6, 1.1 + i * 0.2));
      turn(tl, d, 0, 4.4);
      tl.to(d, { yOffset: -0.67, duration: 0.5 }, 4.7);
      tl.to([d.legL.rotation, d.legR.rotation], { x: -1.5, duration: 0.5 }, 4.7);
      cam(tl, stage, [6, 2.6, 9], [8, 1.2, -1], 4, 2.4);
      // Bakar, öfkelenir, kalkar.
      tl.to(d.head.rotation, { x: 0.45, duration: 0.5 }, 5.6);
      mood(tl, d, 'angry', 6.4);
      tl.to(d.head.rotation, { x: 0, duration: 0.3 }, 6.5);
      standUp(tl, d, 6.8, 0.4);
      tl.to(d.armR.rotation, { x: -2.6, duration: 0.4, ease: 'back.out(2)' }, 7.3);
      tl.to(d.armR.rotation, { x: 0, duration: 0.4 }, 8.2);
      walkTo(tl, d, -22, 9, 4, 8.4);
      men.forEach((m, i) => walkTo(tl, m, -26 - i * 2, 10 + i, 4, 8.8 + i * 0.2));
      cam(tl, stage, [2, 4, 20], [0, 1.6, 0], 3.4, 8.6);
      return tl;
    },
  },

  /* Hatunun öğüdü */
  {
    id: 'hatun',
    build(stage) {
      homeSet(stage, 'dusk');
      const tl = newTimeline();
      const h = stage.track(place(hatun(), 1.6, -1.6, -0.6));
      const d = stage.track(place(dirse({ mood: 'angry' }), -12, 3, E));
      stage.setCamera([-3, 3, 13], [-1, 1.5, -0.5]);

      walkTo(tl, d, -1.2, -0.8, 2.6, 0);
      faceTo(tl, h, -1.2, -0.8, 2.2);
      // "Bu ayıp senden midir, benden midir?"
      tl.to(d.armR.rotation, { x: -1.5, duration: 0.4 }, 2.8);
      tl.to(d.armR.rotation, { x: -0.9, z: -0.7, duration: 0.4 }, 3.6);
      tl.to(d.armR.rotation, { x: 0, z: 0.14, duration: 0.4 }, 4.4);
      mood(tl, h, 'sad', 3.0);
      cam(tl, stage, [0, 2.4, 9], [0.2, 1.5, -1], 4, 2.4);
      // Hatun yatıştırır, öğüt verir.
      shakeHead(tl, h.head, 4.8, 1.0);
      mood(tl, h, 'neutral', 5.8);
      plead(tl, h, 5.9);
      tl.to(h.armR.rotation, { x: -2.5, z: 0.4, duration: 0.6 }, 7.0);
      armsDown(tl, h, 8.4);
      tl.to(h.armR.rotation, { z: 0.14, duration: 0.5 }, 8.4);
      mood(tl, d, 'neutral', 8.2);
      tl.to(d.head.rotation, { x: 0.3, duration: 0.3, yoyo: true, repeat: 3 }, 8.6);
      return tl;
    },
  },

  /* Ulu toy, hacet; oğlan doğar */
  {
    id: 'dilek',
    build(stage) {
      const sky = homeSet(stage, 'day');
      const tl = newTimeline();
      sofra(stage, -4.5, 1.5);
      const d = stage.track(place(dirse(), -1, -1.6, 0.3));
      const h = stage.track(place(hatun(), 1.2, -2, -0.2));
      const poor = [2, 6, 4].map((k, i) => stage.track(place(villager(k, { mood: 'sad' }), -18 - i * 2, 3 + i, E)));
      const elder = stage.track(place(villager(6), -6.5, -0.4, 1.0));
      const beam = stage.add(lightBeam(70, 3.4));
      beam.position.set(0.2, 0, -1.8);
      beam.scale.set(0.01, 1, 0.01);
      const baby = stage.track(place(child(1, { hat: 'none', mood: 'happy' }), 0.3, -1.2, 0));
      baby.group.scale.setScalar(0.001);
      stage.setCamera([-5, 3.6, 15], [-3, 1.5, 0]);

      // Açı doyurur, çıplağı donatır.
      poor.forEach((p, i) => walkTo(tl, p, -6.4 + i * 1.7, 3.2, 3, 0.2 + i * 0.3));
      poor.forEach((p, i) => faceTo(tl, p, -4.5, 1.5, 3.4 + i * 0.2));
      tl.to(d.armL.rotation, { x: -1.4, z: -0.8, duration: 0.6 }, 1.0);
      mood(tl, poor, 'happy', 4.0);
      poor.forEach((p, i) => tl.to(p, { yOffset: -0.6, duration: 0.5 }, 4.0 + i * 0.2));
      tl.to(d.armL.rotation, { x: 0, z: -0.14, duration: 0.5 }, 4.0);
      // El kaldırıp hacet dilerler.
      raiseArms(tl, elder, 5.0);
      raiseArms(tl, d, 5.3);
      raiseArms(tl, h, 5.5);
      cam(tl, stage, [-1, 2.8, 11], [0, 2, -1.5], 4, 4.6);
      tl.to(beam.scale, { x: 1, z: 1, duration: 2, ease: 'power2.out' }, 6.4);
      sky.tweenTo(tl, 'dawn', 3, 6.4);
      // Bir oğlan doğar.
      armsDown(tl, d, 8.2);
      armsDown(tl, h, 8.2);
      tl.to([d.head.rotation, h.head.rotation], { x: 0.4, duration: 0.5 }, 8.4);
      tl.to([d.armL.rotation, h.armR.rotation], { z: 0, duration: 0.4 }, 8.2);
      pop(tl, baby.group, 8.6, 0.42, 0.6);
      mood(tl, [d, h], 'happy', 8.8);
      tl.to(beam.material, { opacity: 0, duration: 2 }, 9.4);
      return tl;
    },
  },

  /* Meydan: boğa zincirle getirilir; oğlanlar aşık oynar */
  {
    id: 'meydan',
    build(stage) {
      toySet(stage, 'day');
      const tl = newTimeline();
      const bull = stage.track(place(new Beast('bull'), -22, 2, E));
      bull.walkSpeed = 7;
      const keepers = [-1, 1].flatMap((side) => [0, 1].map((i) => stage.track(place(villager(side > 0 ? 3 : 0), -23 + i * 1.8, 2 + side * 2.2, E))));
      keepers.forEach((k) => {
        k.walkSpeed = 8;
        k.armL.rotation.x = k.armR.rotation.x = -1.1;
        k.armSwing = 0;
      });
      const b = stage.track(place(bogac({ scale: 0.82 }), 4, 2.4, W)).sit();
      const kids = [0, 1, 0].map((k, i) => stage.track(place(child(k), 5.2 + (i - 1) * 1.1, 3.6 - Math.abs(i - 1) * 1.2 + 1, Math.atan2(4 - (5.2 + (i - 1) * 1.1), -1))).sit());
      kids.forEach((k) => (k.walkSpeed = 15));
      const han = stage.track(place(bayindir(), 0, -5, 0));
      stage.setCamera([-4, 4.5, 20], [-2, 1.6, 0]);

      walkTo(tl, bull, -6, 2, 4.4, 0);
      keepers.forEach((k, i) => walkTo(tl, k, -7 + (i % 2) * 1.8, 2 + (i < 2 ? -2.2 : 2.2), 4.4, 0));
      // Aşık oynarlar.
      tl.to(b.armR.rotation, { x: -1.4, duration: 0.3, yoyo: true, repeat: 5 }, 0.6);
      // Koyuverirler.
      keepers.forEach((k, i) => {
        armsDown(tl, k, 4.5);
        walkTo(tl, k, -12 + (i % 2) * 1.5, i < 2 ? -3.4 : 7.4, 1.6, 4.8);
        faceTo(tl, k, 0, 2, 6.5);
      });
      tl.to(han.armR.rotation, { x: -1.4, duration: 0.4 }, 4.8);
      tl.to(bull.head.rotation, { x: 0.5, duration: 0.4 }, 5.2);
      mood(tl, kids, 'fear', 5.4);
      kids.forEach((k, i) => {
        standUp(tl, k, 5.5, 0.3);
        walkTo(tl, k, 16 + i * 2, 6 + i * 2, 2, 5.9);
      });
      // Dirse Han'ın oğlu kaçmaz.
      standUp(tl, b, 6.0, 0.5);
      mood(tl, b, 'angry', 6.4);
      faceTo(tl, b, -6, 2, 6.2);
      cam(tl, stage, [-1, 2.8, 13], [-1, 1.4, 2], 4, 4.6);
      return tl;
    },
  },

  /* Boğayla dövüş */
  {
    id: 'boga',
    build(stage) {
      toySet(stage, 'day');
      const tl = newTimeline();
      const bull = stage.track(place(new Beast('bull'), -8, 2, E));
      bull.walkSpeed = 16;
      const b = stage.track(place(bogac({ scale: 0.82, mood: 'angry' }), 4, 2.4, W));
      b.armSwing = 0.2;
      stage.track(place(bayindir(), 0, -5, 0));
      const crowd = [0, 1, 3].map((k, i) => stage.track(place(villager(k, { mood: 'fear' }), -6 + i * 6, -3.6, 0)));
      stage.setCamera([-1, 2.8, 13], [-1, 1.4, 2]);

      // Birinci saldırı: yumruk, boğa geri gider.
      tl.to(b.armR.rotation, { x: -2.2, duration: 0.3 }, 0.5);
      walkTo(tl, bull, 2.5, 2.3, 0.9, 0.6);
      tl.to(b.armR.rotation, { x: -1.4, duration: 0.1, ease: 'power3.in' }, 1.4);
      tl.to(bull.head.rotation, { x: 0.6, duration: 0.15, yoyo: true, repeat: 1 }, 1.5);
      tl.to(bull.group.position, { x: -3, duration: 1.2, ease: 'power2.out' }, 1.6);
      tl.to(bull, { walkAmp: 0.6, duration: 0.2 }, 1.6);
      tl.to(bull, { walkAmp: 0, duration: 0.2 }, 2.6);
      // İkinci saldırı: yumruğunu dayar, meydanın başına dek sürer.
      tl.to(bull, { walkAmp: 1, duration: 0.2 }, 3.2);
      tl.to(bull.group.position, { x: 2.5, duration: 0.8, ease: 'none' }, 3.2);
      tl.to(bull.group.position, { x: -7.5, duration: 2.4, ease: 'none' }, 4.0);
      walkTo(tl, b, -6, 2.4, 2.4, 4.0);
      tl.to(bull, { walkAmp: 0.3, duration: 0.3 }, 6.4);
      cam(tl, stage, [-5, 2.6, 12], [-6, 1.3, 2], 2.6, 4.0);
      // Çekişirler; ne oğlan yener ne boğa.
      tl.to([b.group.position, bull.group.position], { x: '+=0.5', duration: 0.4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 6.4);
      // Yumruğunu çeker, savulur; boğa tepesinin üstüne düşer.
      tl.to(b.armR.rotation, { x: 0, duration: 0.2 }, 8.1);
      tl.to(b.group.position, { z: 4.4, duration: 0.3 }, 8.1);
      tl.to(bull.group.position, { x: -5, duration: 0.5, ease: 'power2.in' }, 8.2);
      tl.to(bull.rig.rotation, { x: 1.2, duration: 0.4, ease: 'power2.in' }, 8.4);
      tl.to(bull.rig.rotation, { x: 0, z: 1.5, duration: 0.5, ease: 'bounce.out' }, 8.8);
      tl.to(bull, { walkAmp: 0, yOffset: 0.45, duration: 0.3 }, 8.8);
      mood(tl, crowd, 'happy', 9.2);
      // Bıçağıyla başını keser.
      walkTo(tl, b, -3.6, 2.8, 0.7, 9.3);
      faceTo(tl, b, -4, 2, 10.0);
      tl.to(b.armR.rotation, { x: -2.6, duration: 0.3 }, 10.1);
      tl.to(b.armR.rotation, { x: -0.6, duration: 0.12, ease: 'power3.in' }, 10.5);
      tl.to(bull.head.position, { x: 0.5, y: 0.2, duration: 0.3 }, 10.6);
      crowd.forEach((c, i) => raiseArms(tl, c, 10.8 + i * 0.1, 0.4));
      return tl;
    },
  },

  /* Dede Korkut ad koyar: Boğaç */
  {
    id: 'ad',
    build(stage) {
      homeSet(stage, 'day');
      const tl = newTimeline();
      const d = stage.track(place(dirse(), 1.6, -1.4, -0.8));
      stage.track(place(hatun({ mood: 'happy' }), 3.2, -2, -0.9));
      const dede = stage.track(place(dedeKorkut(), -14, 4, E));
      const b = stage.track(place(bogac({ scale: 0.82 }), -15.5, 5, E));
      const throne = stage.add(mesh(new THREE.BoxGeometry(1.2, 0.5, 1), mat(P.gold)));
      throne.position.set(0, 0.25, -3.6);
      const back = stage.add(mesh(new THREE.BoxGeometry(1.2, 1.2, 0.15), mat(P.crimson)));
      back.position.set(0, 1.0, -4.1);
      stage.keepClear(0, -3.8, 1.4);
      stage.setCamera([-4, 3, 13], [-2, 1.5, 0]);

      walkTo(tl, dede, -2, -0.4, 3.6, 0);
      walkTo(tl, b, -1.2, 0.9, 3.8, 0.1);
      faceTo(tl, b, 1.6, -1.4, 4.0);
      // "Senin oğlunun adı Boğaç olsun."
      tl.to(dede.armL.rotation, { x: -1.9, z: 0, duration: 0.7 }, 4.2);
      mood(tl, [b, d], 'happy', 5.4);
      cam(tl, stage, [-0.5, 2.4, 9.5], [0, 1.4, -1], 4, 3.6);
      raiseArms(tl, d, 5.8, 0.5);
      armsDown(tl, d, 7.0);
      tl.to(d.head.rotation, { x: 0, duration: 0.4 }, 7.0);
      // Beylik verir, taht verir.
      tl.to(d.armL.rotation, { x: -1.3, z: -0.9, duration: 0.5 }, 7.4);
      walkTo(tl, b, 0, -2.6, 1.4, 7.8);
      turn(tl, b, 0, 9.2);
      tl.to(b, { yOffset: -0.12, duration: 0.4 }, 9.4);
      tl.to(b.group.position, { z: -3.4, duration: 0.4 }, 9.4);
      tl.to([b.legL.rotation, b.legR.rotation], { x: -1.4, duration: 0.4 }, 9.4);
      tl.to([b.kneeL.rotation, b.kneeR.rotation], { x: 1.3, duration: 0.4 }, 9.4);
      tl.to(d.armL.rotation, { x: 0, z: -0.14, duration: 0.5 }, 9.0);
      return tl;
    },
  },

  /* Kırk namert kovlar */
  {
    id: 'iftira',
    build(stage) {
      homeSet(stage, 'dusk');
      const tl = newTimeline();
      const d = stage.track(place(dirse(), 0, -2, 0));
      const a = [0, 1].map((i) => stage.track(place(namert(i), -14 - i * 1.8, 2 + i, E)));
      const c = [2, 3].map((i) => stage.track(place(namert(i), 15 + (i - 2) * 1.8, 3 + (i - 2), W)));
      stage.setCamera([0, 3, 13], [0, 1.5, -1]);

      // Yirmisi bir yandan gelir.
      a.forEach((n, i) => walkTo(tl, n, -2.6 - i * 1.3, -0.6 + i * 0.9, 2.6, 0.2 + i * 0.2));
      faceTo(tl, d, -2.6, -0.6, 2.6);
      tl.to(a[0].armR.rotation, { x: -1.5, z: -0.6, duration: 0.4, yoyo: true, repeat: 3 }, 3.0);
      shakeHead(tl, a[1].head, 3.2, 1.2);
      mood(tl, d, 'sad', 4.2);
      // Öbür yirmisi öte yandan.
      c.forEach((n, i) => walkTo(tl, n, 2.6 + i * 1.3, -0.4 + i * 0.9, 2.6, 3.4 + i * 0.2));
      faceTo(tl, d, 2.6, -0.4, 6.0);
      tl.to(c[0].armL.rotation, { x: -1.5, z: 0.6, duration: 0.4, yoyo: true, repeat: 3 }, 6.2);
      tl.to(c[1].armR.rotation, { x: -1.3, duration: 0.5 }, 6.4);
      cam(tl, stage, [0, 2.4, 9], [0, 1.5, -1.5], 5, 3);
      // "Getirin, öldüreyim."
      mood(tl, d, 'angry', 8.0);
      turn(tl, d, 0, 8.0);
      tl.to(d.armR.rotation, { x: -2.6, duration: 0.4, ease: 'back.out(2)' }, 8.3);
      tl.to(d.armR.rotation, { x: -0.6, duration: 0.15, ease: 'power3.in' }, 9.0);
      return tl;
    },
  },

  /* Av: oğlan geyiği babasının önüne sürer */
  {
    id: 'av',
    build(stage) {
      dagSet(stage, 'day');
      const tl = newTimeline();
      const d = archer(dirse());
      const dh = mounted(stage, d, 9, 1, W, P.darkBrown);
      const whisper = [0, 1].map((i) => mounted(stage, namert(i), 11.4 + i * 1.6, 2.6 + i * 1.8, W, 0x4a3a2c));
      const b = archer(bogac());
      const bh = mounted(stage, b, -30, 3, E, 0xb89a6a);
      bh.walkSpeed = 15;
      const deer = stage.track(place(new Beast('deer'), -24, 2, E));
      stage.setCamera([6, 4, 18], [0, 1.8, 1]);

      walkTo(tl, deer, -2, 1.4, 4.4, 0.2);
      walkTo(tl, bh, -9, 2.6, 4.6, 0.4);
      mood(tl, b, 'happy', 2);
      // Namertler fısıldar.
      tl.to(whisper[0].seat.rotation, { z: 0.25, duration: 0.5 }, 3.0);
      const n0 = whisper[0].seat.children[0];
      tl.to(n0.rotation, { y: 0.9, duration: 0.5 }, 3.0);
      faceTo(tl, dh, -9, 2.6, 4.6);
      mood(tl, d, 'angry', 5.0);
      walkTo(tl, deer, 6, 8, 2, 4.8);
      walkTo(tl, deer, 30, 16, 3, 6.8);
      cam(tl, stage, [8, 3, 12], [7, 2.2, 1.4], 4, 3.4);
      // Yayını kaldırır.
      tl.to(d.armL.rotation, { x: -1.7, duration: 0.5 }, 5.6);
      tl.to(d.armR.rotation, { x: -1.5, z: -0.5, duration: 0.5 }, 5.6);
      return tl;
    },
  },

  /* Ok: Dirse Han oğlunu vurur */
  {
    id: 'ok',
    build(stage) {
      dagSet(stage, 'day');
      const tl = newTimeline();
      const d = archer(dirse({ mood: 'angry' }));
      d.armR.rotation.set(-1.5, 0, -0.5);
      const dh = mounted(stage, d, 9, 1, Math.atan2(-18, 1.6));
      const escorts = [0, 1].map((i) => mounted(stage, namert(i), 11.4 + i * 1.6, 2.6 + i * 1.8, W, 0x4a3a2c));
      const rider = bogac();
      const bh = mounted(stage, rider, -9, 2.6, 0.4, 0xb89a6a);
      // Yere düşen Boğaç: binici gizlenince bu figür görünür olur.
      const b = stage.track(place(bogac({ mood: 'fear' }), -8.4, 3.4, 0.4));
      b.freeY = true;
      b.group.position.y = 1.6;
      b.group.visible = false;
      stage.setCamera([4, 3.4, 15], [-1, 2, 1.5]);

      // Sırtı dönükken, iki küreğinin arasından.
      launch(tl, stage.add(arrow()), [8.2, 2.6, 1.2], [-8.8, 2.7, 2.5], 1.0, 0.45);
      tl.to(d.armR.rotation, { x: 0, z: 0.14, duration: 0.3 }, 1.0);
      mood(tl, rider, 'fear', 1.45);
      tl.to(rider.rig.rotation, { x: 0.7, duration: 0.5 }, 1.5);
      cam(tl, stage, [-4, 2.6, 12], [-8, 1.6, 2.6], 2.4, 1.2);
      tl.set(rider.group, { visible: false }, 2.6);
      tl.set(b.group, { visible: true }, 2.6);
      tl.to(b.group.position, { x: -7.2, z: 4.4, duration: 0.5, ease: 'none' }, 2.6);
      tl.to(b.group.position, { y: 0.26, duration: 0.5, ease: 'power2.in' }, 2.6);
      tl.to(b.rig.rotation, { x: -Math.PI / 2, duration: 0.5, ease: 'power1.in' }, 2.6);
      tl.call(() => (b.eyesClosed = true), [], 3.2);
      walkTo(tl, bh, -26, -6, 3.4, 3.2);
      // Dirse Han üstüne kapanmak ister; namertler bırakmaz.
      mood(tl, d, 'sad', 3.4);
      walkTo(tl, dh, 4, 1.6, 1.4, 3.8);
      walkTo(tl, escorts[0], 1.6, 1.2, 1.4, 3.9);
      walkTo(tl, escorts[1], 2.2, 4.2, 1.4, 4.0);
      faceTo(tl, escorts[0], 4, 1.6, 5.4);
      cam(tl, stage, [2, 3.4, 15], [-1, 1.8, 2], 3, 4.2);
      tl.to(d.head.rotation, { x: 0.5, duration: 0.6 }, 5.6);
      // Dizginini döndürür, gider.
      turn(tl, dh, E, 6.6, 0.6);
      walkTo(tl, dh, 30, 6, 4, 7.2);
      escorts.forEach((h, i) => walkTo(tl, h, 32 + i * 2, 9 + i * 2, 4, 7.6));
      return tl;
    },
  },

  /* Ana sorar; kırk kızla aramaya çıkar */
  {
    id: 'ana',
    build(stage) {
      homeSet(stage, 'dusk');
      const tl = newTimeline();
      sofra(stage, 4, 2.4);
      const h = stage.track(place(hatun({ mood: 'happy' }), -1, 0, W));
      const d = dirse({ mood: 'sad' });
      d.head.rotation.x = 0.45;
      const dh = mounted(stage, d, -24, 3, E, P.darkBrown);
      dh.walkSpeed = 7;
      const liar = mounted(stage, namert(0), -27, 5, E, 0x4a3a2c);
      liar.walkSpeed = 7;
      const girls = [0, 1, 2].map((i) => stage.track(place(kiz(i), 2 + i * 1.5, -3 - (i % 2), W)));
      const mare = stage.track(place(new Horse(0xd8d2c4), 10, 4, W));
      stage.setCamera([-4, 3.4, 15], [-4, 1.8, 1]);

      walkTo(tl, dh, -6, 1.4, 4.4, 0);
      walkTo(tl, liar, -8.6, 3.6, 4.6, 0.1);
      // İki giden bir geliyor.
      mood(tl, h, 'fear', 3.4);
      walkTo(tl, h, -3.6, 0.8, 1.2, 3.6);
      plead(tl, h, 4.8);
      tl.to([h.armL.rotation, h.armR.rotation], { x: -1.1, duration: 0.35, yoyo: true, repeat: 5 }, 5.4);
      const liarMan = liar.seat.children[0];
      tl.to(liarMan.rotation, { y: 0.5, duration: 0.4 }, 6.6);
      shakeHead(tl, d.head, 6.2, 1.0);
      cam(tl, stage, [-3, 2.8, 12], [-3.6, 1.8, 1], 4, 3);
      // Dayanamaz; kızlarla yola çıkar.
      armsDown(tl, h, 7.8);
      mood(tl, h, 'sad', 7.8);
      h.walkSpeed = 12;
      walkTo(tl, h, 9, 3.2, 2.4, 8.0);
      girls.forEach((g, i) => walkTo(tl, g, 12 + i * 1.6, 1 - i, 2.6, 8.2 + i * 0.2));
      walkTo(tl, mare, 30, 10, 3, 10.4);
      walkTo(tl, h, 30, 9, 3, 10.4);
      girls.forEach((g, i) => walkTo(tl, g, 30 + i * 2, 5 - i, 3, 10.8 + i * 0.1));
      cam(tl, stage, [2, 3.4, 16], [8, 1.6, 2], 3, 8.4);
      return tl;
    },
  },

  /* Boz atlı Hızır */
  {
    id: 'hizir',
    build(stage) {
      dagSet(stage, 'dusk');
      const tl = newTimeline();
      const b = wounded(stage.track(place(bogac(), -7.2, 4.4, 0.4)));
      const hz = hizir();
      const horse = mounted(stage, hz, -30, 0, E, 0xb8b4aa);
      horse.walkSpeed = 6;
      const beam = stage.add(lightBeam(60, 2.6));
      beam.position.set(-7.4, 0, 3.6);
      beam.scale.set(0.01, 1, 0.01);
      stage.setCamera([-5, 2.6, 13], [-8, 1.4, 3.4]);

      tl.to(beam.scale, { x: 1, z: 1, duration: 1.6, ease: 'power2.out' }, 0.2);
      walkTo(tl, horse, -9.6, 3.2, 4, 0.4);
      faceTo(tl, horse, -7.2, 4.4, 4.4);
      // Yarasını üç kez sıvazlar.
      tl.to(hz.rig.rotation, { x: 0.5, duration: 0.5 }, 4.8);
      tl.to(hz.armR.rotation, { x: -1.2, duration: 0.4, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 5.2);
      cam(tl, stage, [-6, 2.2, 10], [-8.2, 1.4, 3.6], 4, 3);
      tl.to(hz.rig.rotation, { x: 0, duration: 0.5 }, 7.8);
      // Kaybolur.
      vanish(tl, horse.group, 8.6, 0.6);
      tl.to(beam.material, { opacity: 0, duration: 1.4 }, 8.6);
      return tl;
    },
  },

  /* Anası bulur: kargalar, köpekler */
  {
    id: 'bulus',
    build(stage) {
      dagSet(stage, 'dusk');
      const tl = newTimeline();
      const b = wounded(stage.track(place(bogac(), -7.2, 4.4, 0.4)));
      const dogs = [stage.track(place(new Beast('dog'), -5.6, 3.4, 0.6)), stage.track(place(new Beast('dog', P.brown), -8.8, 5.6, -0.8))];
      const crows = [0, 1, 2].map(() => stage.track(new Bird(P.black, 1.4)));
      const circle = { on: true };
      const fly = (t: number) => {
        if (!circle.on) return;
        crows.forEach((c, i) => {
          const a = t * 1.3 + i * 2.1;
          c.group.position.set(-7.2 + Math.cos(a) * 2.6, 2.6 + Math.sin(t * 2 + i) * 0.7, 3.6 + Math.sin(a) * 2.6);
          c.group.rotation.y = -a;
        });
      };
      fly(0);
      stage.onTick(fly);
      const h = hatun({ mood: 'fear' });
      const mare = mounted(stage, h, 26, 8, W, 0xd8d2c4);
      const walker = stage.track(place(hatun({ mood: 'sad' }), -3.4, 5.2, W));
      walker.group.visible = false;
      const girls = [0, 1].map((i) => stage.track(place(kiz(i), 28 + i * 2, 10 + i * 2, W)));
      stage.setCamera([-5, 3, 14], [-7, 1.6, 3.6]);

      // Köpekler kargaları kovar.
      dogs.forEach((dg, i) => {
        tl.to(dg, { yOffset: 0.35, duration: 0.2, yoyo: true, repeat: 9 }, 0.3 + i * 0.25);
        tl.to(dg.head.rotation, { x: -0.6, duration: 0.3 }, 0.3);
      });
      walkTo(tl, mare, -2.6, 5.6, 4.2, 0.6);
      girls.forEach((g, i) => walkTo(tl, g, 1 + i * 1.8, 6.4 + i, 4.6, 0.9));
      // Attan iner, üstüne kapanır.
      tl.set(h.group, { visible: false }, 5.0);
      tl.set(walker.group, { visible: true }, 5.0);
      tl.call(() => (circle.on = false), [], 5.0);
      crows.forEach((c, i) => tl.to(c.group.position, { x: -20 + i * 14, y: 16, z: -24, duration: 3, ease: 'power1.in' }, 5.0));
      walker.walkSpeed = 13;
      walkTo(tl, walker, -6.6, 5.0, 0.9, 5.1);
      kneelDown(tl, walker, 6.0, 0.4);
      tl.to(walker.rig.rotation, { x: 0.5, duration: 0.5 }, 6.1);
      plead(tl, walker, 6.1);
      sway(tl, walker, 6.6, 3);
      cam(tl, stage, [-5.5, 2, 10], [-7, 1, 4.4], 4, 4.6);
      // Oğlan gözünü açar.
      tl.call(() => (b.eyesClosed = false), [], 9.2);
      tl.to(b.armR.rotation, { x: -1.2, duration: 0.6 }, 9.4);
      mood(tl, walker, 'happy', 9.8);
      tl.to(walker.rig.rotation, { x: 0.2, duration: 0.5 }, 9.8);
      return tl;
    },
  },

  /* Dağ çiçeği ile ana sütü */
  {
    id: 'merhem',
    build(stage) {
      const sky = dagSet(stage, 'dusk');
      const tl = newTimeline();
      flowers(stage, 0, 5, 7, 46);
      const b = stage.track(place(bogac({ mood: 'sad' }), -7.2, 4.4, 0.4)).lie();
      const h = stage.track(place(hatun({ mood: 'sad' }), -6.6, 5.0, W)).kneel();
      const girls = [0, 1, 2].map((i) => stage.track(place(kiz(i), -3 + i * 1.6, 7 + (i % 2), W)));
      const drop = stage.add(mesh(new THREE.IcosahedronGeometry(0.06, 0), mat(P.white)));
      const posy = stage.add(mesh(new THREE.IcosahedronGeometry(0.1, 0), mat(P.red)));
      stage.track(place(new Horse(0xd8d2c4), -2, 2, W));
      stage.setCamera([-4, 3, 14], [-3, 1.4, 4.5]);

      // Kızlar yayılır, çiçek toplar.
      const spots: [number, number][] = [[1.5, 3.2], [3.6, 6.4], [-0.6, 8.2]];
      girls.forEach((g, i) => {
        walkTo(tl, g, ...spots[i], 1.8, 0.2 + i * 0.2);
        tl.to(g.rig.rotation, { x: 0.8, duration: 0.4, yoyo: true, repeat: 3 }, 2.2 + i * 0.2);
        walkTo(tl, g, -9.6 - i * 1.1, 3.4 - i * 0.7, 2.2, 4.2 + i * 0.2);
        faceTo(tl, g, -7.2, 4.4, 6.2);
      });
      // Üçüncüde kendine vurur.
      for (const at of [1.0, 2.2, 3.4]) {
        tl.to(h.armR.rotation, { x: -1.9, z: -0.7, duration: 0.3 }, at);
        tl.to(h.armR.rotation, { x: -0.6, z: 0.14, duration: 0.3 }, at + 0.5);
      }
      tl.to(h.armL.rotation, { x: -2.4, z: 0.6, duration: 0.2, yoyo: true, repeat: 1 }, 3.4);
      toss(tl, drop, [-6.7, 1.2, 4.9], [-7.3, 0.5, 4.2], 4.0, 0.45);
      toss(tl, posy, [-9.2, 1.2, 3.6], [-7.3, 0.5, 4.2], 6.6, 0.5);
      cam(tl, stage, [-5.6, 2.2, 10.5], [-6.6, 1, 4.6], 4, 3);
      // Kırk günde sağalır.
      sky.tweenTo(tl, 'dawn', 3.4, 7.0);
      tl.to(b.rig.rotation, { x: 0, duration: 0.9, ease: 'power2.out' }, 8.4);
      tl.to(b, { yOffset: 0, duration: 0.9 }, 8.4);
      mood(tl, [b, h, ...girls], 'happy', 9.0);
      standUp(tl, h, 9.0);
      faceTo(tl, b, -6.6, 5.0, 9.3);
      return tl;
    },
  },

  /* Namertler Dirse Han'ı bağlar */
  {
    id: 'tutsak',
    build(stage) {
      homeSet(stage, 'dusk');
      const tl = newTimeline();
      const d = stage.track(place(dirse(), 0, -1.6, 0.4));
      const grab = [0, 1, 2].map((i) => stage.track(place(namert(i, { mood: 'angry' }), [-9, 9, -7][i], [2, 3, -4][i], 0)));
      grab.forEach((g) => (g.walkSpeed = 13));
      const horses = [0, 1].map((i) => mounted(stage, namert(i + 1, { mood: 'smug' }), -16 - i * 3, 6 + i * 1.6, E, 0x4a3a2c));
      horses.forEach((h) => (h.walkSpeed = 7));
      stage.setCamera([1, 3.2, 14], [0, 1.5, -0.5]);

      const at: [number, number][] = [[-1.2, -1.2], [1.2, -1.2], [-0.2, -2.8]];
      grab.forEach((g, i) => walkTo(tl, g, ...at[i], 1.4, 0.4 + i * 0.1));
      grab.forEach((g, i) => faceTo(tl, g, 0, -1.6, 1.9 + i * 0.05));
      mood(tl, d, 'fear', 1.4);
      grab.forEach((g) => tl.to([g.armL.rotation, g.armR.rotation], { x: -1.4, duration: 0.3 }, 2.0));
      // Ellerini ardına bağlarlar.
      tl.call(() => bound(d), [], 2.6);
      mood(tl, d, 'sad', 2.6);
      // Döverler.
      for (const t of [3.2, 3.9, 4.6]) {
        tl.to(grab[0].armR.rotation, { x: -2.7, duration: 0.25 }, t);
        tl.to(grab[0].armR.rotation, { x: -0.8, duration: 0.12, ease: 'power3.in' }, t + 0.3);
        tl.to(d.rig.rotation, { x: 0.3, duration: 0.12, yoyo: true, repeat: 1 }, t + 0.42);
      }
      // Dirse Han yayan, bunlar atlı.
      grab.forEach((g) => armsDown(tl, g, 5.4));
      d.walkSpeed = 6;
      walkTo(tl, d, 10, 4, 5, 6.0);
      horses.forEach((h, i) => walkTo(tl, h, 6 - i * 4, 6.4 + i * 1.6, 5.6, 5.4));
      grab.forEach((g, i) => {
        g.walkSpeed = 7;
        walkTo(tl, g, 12.5 + i * 1.6, 2 + i * 2.2, 5, 6.2 + i * 0.1);
      });
      cam(tl, stage, [7, 3.4, 17], [8, 1.6, 3], 5, 5.6);
      return tl;
    },
  },

  /* "Baban sana kıydıysa sen babana kıyma" */
  {
    id: 'kurtar',
    build(stage) {
      homeSet(stage, 'day');
      const tl = newTimeline();
      const b = stage.track(place(armed(bogac()), 1.2, -1.4, W));
      const h = stage.track(place(hatun({ mood: 'fear' }), -13, 3, E));
      h.walkSpeed = 13;
      const men = [0, 1, 2].map((i) => stage.track(place(yigit(i), 5 + i * 1.8, -2.4 + (i % 2) * 1.6, W)));
      const steed = stage.track(place(new Horse(0xb89a6a), 3.4, 2.6, E));
      stage.setCamera([-3, 3, 13], [-1, 1.5, 0]);

      walkTo(tl, h, -1.2, -0.8, 2.2, 0);
      plead(tl, h, 2.3);
      tl.to(h.armR.rotation, { x: -1.4, z: 1.0, duration: 0.5 }, 3.4);
      mood(tl, b, 'fear', 3.0);
      armsDown(tl, h, 4.8);
      // "Sen babana kıyma."
      tl.to(h.armR.rotation, { x: -1.6, z: 0, duration: 0.5 }, 5.2);
      shakeHead(tl, h.head, 5.4, 1.0);
      mood(tl, b, 'angry', 6.4);
      tl.to(b.head.rotation, { x: 0.3, duration: 0.3, yoyo: true, repeat: 1 }, 6.4);
      tl.to(b.armR.rotation, { x: -2.7, duration: 0.5, ease: 'back.out(2)' }, 7.2);
      men.forEach((m, i) => raiseArms(tl, m, 7.5 + i * 0.1, 0.4));
      cam(tl, stage, [1, 2.8, 12], [2, 1.5, -0.5], 3, 6.4);
      b.walkSpeed = 13;
      tl.to(b.armR.rotation, { x: 0, duration: 0.4 }, 8.4);
      walkTo(tl, b, 26, 6, 3.4, 8.8);
      walkTo(tl, steed, 28, 8, 3.4, 8.9);
      men.forEach((m, i) => {
        armsDown(tl, m, 8.6);
        m.walkSpeed = 13;
        walkTo(tl, m, 28 + i * 2, 3 + i * 2, 3.4, 9.0 + i * 0.1);
      });
      faceTo(tl, h, 26, 6, 9.2);
      return tl;
    },
  },

  /* Konak: Dirse Han kopuzla söyler */
  {
    id: 'kopuz',
    build(stage) {
      konakSet(stage, 'dusk');
      const tl = newTimeline();
      const d = stage.track(place(bound(dirse({ mood: 'sad' })), -3, -2, E)).sit();
      const saz = kopuz();
      saz.position.set(0.1, 0.98, 0.3);
      saz.rotation.z = 1.05;
      saz.visible = false;
      d.rig.add(saz);
      const drinkers = [0, 1, 2, 3].map((i) => {
        const a = 0.6 + i * 1.1;
        return stage.track(place(namert(i), Math.sin(a) * 3.2 + 1, Math.cos(a) * 3.2, a + Math.PI)).sit();
      });
      const b = armed(bogac({ mood: 'angry' }));
      const bh = mounted(stage, b, 30, 6, W, 0xb89a6a);
      const men = [0, 1].map((i) => mounted(stage, yigit(i), 34 + i * 3, 8 + i * 2, W));
      stage.setCamera([-2, 3.2, 13], [0, 1.4, 0]);

      drinkers.forEach((n, i) => tl.to(n.armR.rotation, { x: -2.0, duration: 0.5, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.2 + i * 0.3));
      walkTo(tl, bh, 12, 3.4, 4, 0.6);
      men.forEach((h, i) => walkTo(tl, h, 16 + i * 2.6, 5.6 + i * 2, 4.2, 0.8));
      mood(tl, drinkers, 'fear', 4.2);
      drinkers.forEach((n) => faceTo(tl, n, 12, 3.4, 4.2));
      // "Elim kolum çözün, kopuzumu verin."
      faceTo(tl, d, 12, 3.4, 4.6);
      tl.to(d.head.rotation, { x: 0, duration: 0.4 }, 4.6);
      tl.set(saz, { visible: true }, 5.6);
      tl.to(d.armR.rotation, { x: -0.95, z: -0.35, duration: 0.5 }, 5.6);
      tl.to(d.armL.rotation, { x: -1.1, z: -0.5, duration: 0.5 }, 5.6);
      tl.to(d.armR.rotation, { x: -1.15, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: 15 }, 6.2);
      tl.to(d.head.rotation, { z: 0.12, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 6.2);
      cam(tl, stage, [5, 3.4, 16], [5, 1.6, 1], 5, 4.4);
      return tl;
    },
  },

  /* Kırk namertle savaş */
  {
    id: 'kavga',
    build(stage) {
      konakSet(stage, 'dusk');
      const tl = newTimeline();
      const d = stage.track(place(dirse({ mood: 'sad' }), -3, -2, E)).sit();
      const foes = [0, 1, 2, 3].map((i) => stage.track(place(armed(namert(i, { mood: 'angry' })), 1 + i * 1.4, -1 + (i % 2) * 2.4, E)));
      const b = armed(bogac({ mood: 'angry' }));
      const bh = mounted(stage, b, 12, 3.4, W, 0xb89a6a);
      const men = [0, 1].map((i) => mounted(stage, armed(yigit(i)), 16 + i * 2.6, 5.6 + i * 2, W));
      [bh, ...men].forEach((h) => (h.walkSpeed = 15));
      stage.setCamera([5, 3.4, 16], [5, 1.6, 1]);

      // Yiğitlerine el edip işaret verir.
      tl.to(b.armR.rotation, { x: -2.7, duration: 0.4, ease: 'back.out(2)' }, 0.6);
      tl.to(b.armR.rotation, { x: -1.4, duration: 0.2 }, 1.4);
      // At tepip üşüşürler.
      walkTo(tl, bh, 3.6, 0.6, 1.4, 1.6);
      men.forEach((h, i) => walkTo(tl, h, 5.4 + i * 1.6, 2.6 + i * 1.4, 1.5, 1.7));
      foes.forEach((f, i) => tl.to(f.armR.rotation, { x: -2.6, duration: 0.3 }, 1.8 + i * 0.1));
      for (const t of [3.0, 3.7]) {
        tl.to(b.armR.rotation, { x: -2.8, duration: 0.2 }, t);
        tl.to(b.armR.rotation, { x: -0.7, duration: 0.12, ease: 'power3.in' }, t + 0.25);
      }
      fall(tl, foes[2], 3.3, 0.35);
      fall(tl, foes[3], 4.0, 0.35);
      tl.to(stage.camera.position, { x: '+=0.2', duration: 0.05, yoyo: true, repeat: 5 }, 3.3);
      // Kimi tutsak olur.
      mood(tl, [foes[0], foes[1]], 'fear', 4.2);
      [foes[0], foes[1]].forEach((f) => {
        kneelDown(tl, f, 4.4, 0.4);
        tl.to([f.armL.rotation, f.armR.rotation], { x: -2.6, duration: 0.4 }, 4.4);
      });
      // Babasını kurtarır.
      walkTo(tl, bh, -0.6, -1.2, 1.6, 5.2);
      cam(tl, stage, [-1, 2.6, 10], [-1.6, 1.5, -1.4], 3, 5);
      standUp(tl, d, 6.6);
      faceTo(tl, d, -0.6, -1.2, 6.6);
      mood(tl, d, 'fear', 6.8);
      tl.to(b.armR.rotation, { x: 0, duration: 0.4 }, 6.8);
      mood(tl, b, 'neutral', 7.2);
      plead(tl, d, 7.6);
      return tl;
    },
  },

  /* Beylik, taht; Dede Korkut */
  {
    id: 'son',
    build(stage) {
      const sky = toySet(stage, 'dusk');
      const tl = newTimeline();
      const han = stage.track(place(bayindir(), 0, -3.4, 0));
      const b = stage.track(place(bogac(), -9, 4, E));
      const d = stage.track(place(dirse({ mood: 'sad' }), -11, 5.4, E));
      const h = stage.track(place(hatun({ mood: 'happy' }), -12.4, 3.6, E));
      const dede = stage.track(place(dedeKorkut(), 5.4, 0.4, -1.2)).sit();
      placeTent(stage, 22, 4, -1.2, P.cream, P.indigo, 1);
      stage.setCamera([-3, 3.4, 15], [-2, 1.6, 0]);

      walkTo(tl, b, -0.6, -1, 3, 0);
      walkTo(tl, d, -2.6, 0.4, 3.2, 0.2);
      walkTo(tl, h, -4.2, 1.4, 3.4, 0.3);
      faceTo(tl, b, 0, -3.4, 3.1);
      // Babası oğlunun sağ olduğunu bilir.
      faceTo(tl, d, -0.6, -1, 3.5);
      mood(tl, d, 'happy', 3.8);
      plead(tl, d, 3.8);
      // Bayındır Han beylik verir, taht verir.
      tl.to(han.armR.rotation, { x: -1.8, duration: 0.6 }, 4.6);
      kneelDown(tl, b, 4.9);
      tl.to(b.head.rotation, { x: 0.4, duration: 0.5 }, 4.9);
      standUp(tl, b, 6.6);
      tl.to(b.head.rotation, { x: 0, duration: 0.4 }, 6.6);
      mood(tl, b, 'happy', 6.6);
      tl.to(han.armR.rotation, { x: 0, duration: 0.5 }, 6.8);
      armsDown(tl, d, 6.8);
      // Dedem Korkut boy boylar.
      sky.tweenTo(tl, 'night', 6, 5);
      tl.to(dede.armR.rotation, { x: -1.15, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: 21 }, 6.2);
      tl.to(dede.head.rotation, { z: 0.12, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 6.2);
      [b, d, h, han].forEach((m, i) => faceTo(tl, m, 5.4, 0.4, 7.4 + i * 0.15));
      cam(tl, stage, [3, 2.8, 12], [2, 1.5, -0.6], 5, 6);
      return tl;
    },
  },
];
