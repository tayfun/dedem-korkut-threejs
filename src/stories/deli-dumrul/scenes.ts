import * as THREE from 'three';
import { cam, faceTo, place, shakeHead, turn, walkTo } from '../../engine/direct';
import type { SceneDef } from '../../engine/story';
import { Bird, Horse, cast, type Human } from '../../procedural/figures';
import { P } from '../../procedural/palette';
import { addFire, lightBeam, sword } from '../../procedural/world';
import { CAMP, addTent, bridgeSet, campSet, child, dumrul, father, mother, mourners, newTimeline, pop, steppeSet, sway, tossCoin, vanish, villager, wife } from './sets';

/** Deli Dumrul — sahnelerin 3B kurulumu ve animasyonu. Metinler `story.ts` içindedir. */

const E = Math.PI / 2; // doğuya (+x) bakış
const W = -Math.PI / 2; // batıya (-x) bakış

/** Yalvarma: iki kol öne uzanır. */
function plead(tl: gsap.core.Timeline, m: Human, at: number): void {
  tl.to([m.armL.rotation, m.armR.rotation], { x: -1.5, duration: 0.5, ease: 'power2.out' }, at);
}

function armsDown(tl: gsap.core.Timeline, m: Human, at: number): void {
  tl.to([m.armL.rotation, m.armR.rotation], { x: 0, duration: 0.6, ease: 'power2.inOut' }, at);
}

export const scenes: SceneDef[] = [
  /* 1 — Köprü ve otuz üç akçe */
  {
    id: 'kopru',
    build(stage) {
      bridgeSet(stage, 'day');
      const tl = newTimeline();
      const d = stage.track(place(dumrul(true), -9.2, 0.2, W));
      const t = stage.track(place(villager(1), -24, 0.4, E));
      stage.setCamera([-17, 4.5, 15], [-9, 1.4, 0]);

      walkTo(tl, t, -11, 0.2, 4.2, 0);
      tl.to(d.armL.rotation, { x: -1.5, duration: 0.5, ease: 'power2.out' }, 3.2);
      tl.to(t.armR.rotation, { x: -1.4, duration: 0.4 }, 4.6);
      tossCoin(tl, stage, [-10.5, 1.3, 0.3], [-9.6, 1.3, 0.2], 5.0);
      tl.to(t.armR.rotation, { x: 0, duration: 0.4 }, 5.6);
      tl.to(d.armL.rotation, { x: 0, duration: 0.4 }, 5.7);
      walkTo(tl, d, -9.2, 2.6, 1.0, 6.0);
      faceTo(tl, d, 0, 0, 7.0);
      walkTo(tl, t, 12, 0, 8, 6.6);
      cam(tl, stage, [-2, 6.5, 21], [0, 0.6, 0], 9, 5.5);
      return tl;
    },
  },

  /* 2 — Geçmeyenden kırk akçe */
  {
    id: 'ovunme',
    build(stage) {
      bridgeSet(stage, 'day');
      const tl = newTimeline();
      const d = stage.track(place(dumrul(true), 6.5, 0, E));
      d.walkSpeed = 13;
      const t = stage.track(place(villager(3), 22, 0.5, W));
      stage.setCamera([9, 4, 15], [11, 1.2, 0.5]);

      walkTo(tl, t, 11.5, 0.3, 3, 0);
      tl.to(d.armL.rotation, { x: -1.5, duration: 0.4 }, 2.6);
      shakeHead(tl, t.head, 3.2, 1.2);
      walkTo(tl, t, 17.5, 5.5, 3.2, 4.4);
      tl.to(d.armL.rotation, { x: 0, duration: 0.3 }, 4.6);
      walkTo(tl, d, 16.2, 4.4, 2.4, 5.0);
      tl.to(d.armR.rotation, { x: -2.8, duration: 0.35, ease: 'power2.out' }, 6.9);
      faceTo(tl, t, 16.2, 4.4, 7.4, 0.3);
      tl.to(d.armR.rotation, { x: -1.0, duration: 0.18, ease: 'power3.in' }, 7.5);
      tl.to(t, { yOffset: -0.25, duration: 0.25 }, 7.6);
      tl.to(t.rig.rotation, { x: 0.35, duration: 0.25 }, 7.6);
      tl.to([t.armL.rotation, t.armR.rotation], { x: -2.6, duration: 0.25 }, 7.6);
      tossCoin(tl, stage, [17.3, 1.0, 5.3], [16.5, 1.2, 4.6], 8.3);
      tossCoin(tl, stage, [17.3, 1.0, 5.3], [16.5, 1.2, 4.6], 8.7);
      tl.to(d.armR.rotation, { x: 0, duration: 0.4 }, 8.4);
      cam(tl, stage, [14, 3.6, 16], [16, 1.2, 4], 4, 4.4);

      walkTo(tl, d, 0, 0, 3.4, 9.6);
      turn(tl, d, 0, 13.0);
      tl.to([d.armL.rotation, d.armR.rotation], { x: -2.9, duration: 0.5, ease: 'back.out(2)' }, 13.3);
      tl.to(d.armL.rotation, { z: -0.5, duration: 0.5 }, 13.3);
      tl.to(d.armR.rotation, { z: 0.5, duration: 0.5 }, 13.3);
      cam(tl, stage, [0, 2.6, 12], [0, 2.9, 0], 4.5, 9.6);
      return tl;
    },
  },

  /* 3 — Obada yas */
  {
    id: 'oba',
    build(stage) {
      campSet(stage, 'day');
      const tl = newTimeline();
      const { list } = mourners(stage);
      const late = [stage.track(place(villager(6), 26, -1, 0)), stage.track(place(villager(7), 13, -3, 0))];
      stage.setCamera([4, 9, 24], [14, 1, 0]);

      list.forEach((m, i) => sway(tl, m, 0.3 * i));
      walkTo(tl, late[0], CAMP.x + 2.6, CAMP.z + 1.9, 4.5, 0.5);
      walkTo(tl, late[1], CAMP.x - 2.7, CAMP.z + 1.7, 4.5, 1.0);
      faceTo(tl, late[0], CAMP.x, CAMP.z, 5.0);
      faceTo(tl, late[1], CAMP.x, CAMP.z, 5.5);
      for (const [i, m] of late.entries()) {
        tl.to(m.head.rotation, { x: 0.45, duration: 0.6 }, 5.4 + i * 0.5);
        tl.to(m.armL.rotation, { x: -2.2, z: 0.45, duration: 0.6 }, 5.4 + i * 0.5);
        tl.to(m.armR.rotation, { x: -2.2, z: -0.45, duration: 0.6 }, 5.4 + i * 0.5);
      }
      cam(tl, stage, [13, 3.6, 14.5], [CAMP.x, 1.0, CAMP.z], 9, 0);
      return tl;
    },
  },

  /* 4 — "Azrail de kimmiş?" */
  {
    id: 'soru',
    build(stage) {
      campSet(stage, 'day');
      const tl = newTimeline();
      const { list } = mourners(stage);
      const h = stage.track(place(new Horse(), 2, 6.5, E));
      const d = stage.track(dumrul(), false);
      h.mount(d);
      stage.setCamera([9, 3.2, 17], [12, 1.6, 5]);

      walkTo(tl, h, 13.2, 5.6, 3.6, 0);
      list.slice(0, 3).forEach((m, i) => {
        faceTo(tl, m, 13.2, 5.6, 3.6 + i * 0.2);
        tl.to(m.head.rotation, { x: 0, duration: 0.4 }, 3.6 + i * 0.2);
        tl.to([m.armL.rotation, m.armR.rotation], { x: 0, z: 0, duration: 0.5 }, 3.6 + i * 0.2);
      });
      tl.to(d.armL.rotation, { x: -1.3, duration: 0.5 }, 4.2);
      tl.to(d.armL.rotation, { x: 0, duration: 0.5 }, 5.4);
      // Köylü göğü gösterir: "Al kanatlı Azrail aldı."
      tl.to(list[1].armR.rotation, { x: -2.8, duration: 0.6, ease: 'power2.out' }, 5.6);
      tl.to(list[1].armR.rotation, { x: 0, duration: 0.6 }, 7.4);
      // Dumrul göğe yumruk sallar, at şaha kalkar.
      tl.to(d.head.rotation, { x: -0.5, duration: 0.4 }, 7.8);
      tl.to(d.armL.rotation, { x: -2.9, duration: 0.4, ease: 'back.out(2)' }, 7.9);
      tl.to(d.armL.rotation, { x: -2.4, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 8.4);
      tl.to(h.rig.rotation, { x: -0.4, duration: 0.45, ease: 'power2.out', yoyo: true, repeat: 1 }, 8.2);
      cam(tl, stage, [9.5, 2.6, 14], [13.2, 2.3, 5.4], 6, 4.5);
      return tl;
    },
  },

  /* 5 — Buyruk */
  {
    id: 'buyruk',
    build(stage) {
      campSet(stage, 'dusk');
      const tl = newTimeline();
      const beam = stage.add(lightBeam(70, 5));
      beam.position.set(4, 4, -14);
      const a = stage.track(place(cast.azrail(), 4, -14, 0.3));
      a.freeY = true;
      a.flap = 0.5;
      a.group.position.y = 30;
      stage.setCamera([2, 2.2, 16], [4, 16, -14]);

      tl.fromTo(beam.scale, { x: 0.01, z: 0.01 }, { x: 1, z: 1, duration: 2.2, ease: 'power2.out' }, 0);
      tl.to(a.group.position, { y: 15, duration: 3.5, ease: 'power2.out' }, 0.6);
      tl.to(a.head.rotation, { x: -0.4, duration: 0.6 }, 4.0);
      tl.to(a.head.rotation, { x: 0.3, duration: 0.6 }, 5.4);
      tl.to(beam.material, { opacity: 0, duration: 1.5 }, 5.6);
      // Azrail obaya doğru süzülür.
      turn(tl, a, 0.9, 6.0, 0.8);
      tl.to(a.rig.rotation, { x: 0.45, duration: 0.8 }, 6.0);
      tl.to(a.group.position, { x: 13, y: 5.5, z: 2, duration: 4.2, ease: 'power1.inOut' }, 6.3);
      cam(tl, stage, [4, 2.6, 18], [12, 5.5, 2], 4.5, 6.0);
      return tl;
    },
  },

  /* 6 — Sofrada Azrail */
  {
    id: 'sofra',
    build(stage) {
      steppeSet(stage, 'dusk', 5);
      const tl = newTimeline();
      addTent(stage, 0, -8, 0, P.white, P.red, 1.6);
      addTent(stage, -9, -10, 0.4, P.cream, P.indigo, 1.1);
      addFire(stage, 0, 0, 1.2);

      const d = stage.track(place(dumrul(), 0, -3.2, 0)).sit();
      const sw = sword();
      sw.rotation.x = Math.PI / 2;
      sw.visible = false;
      d.handR.add(sw);
      const men: Human[] = [];
      [55, 95, 135, 225, 265, 305].forEach((deg, i) => {
        const r = THREE.MathUtils.degToRad(deg);
        men.push(stage.track(place(villager([0, 1, 3, 5, 6, 7][i]), Math.sin(r) * 3.4, Math.cos(r) * 3.4, r + Math.PI)).sit());
      });
      const a = stage.track(place(cast.azrail(), 4.6, 2.2, -2.0));
      a.flap = 0.12;
      const dove = stage.track(new Bird(P.white, 1.3));
      dove.group.position.set(4.6, 2.0, 2.2);
      dove.group.visible = false;
      stage.setCamera([-2, 4.2, 13], [0, 1.2, -1]);

      // Yiyip içme: kollar ağza gider gelir.
      men.forEach((m, i) => tl.to(m.armR.rotation, { x: -2.0, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.2 + i * 0.25));
      tl.to(d.armR.rotation, { x: -2.0, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.4);
      cam(tl, stage, [-1, 3.2, 12], [1.5, 1.4, 0], 3, 0);

      // Azrail belirir.
      pop(tl, a.group, 3.0, 1.15);
      tl.to(a, { flap: 0.45, duration: 0.5 }, 3.0);
      men.forEach((m) => {
        tl.to(m.rig.rotation, { x: -0.28, duration: 0.3, ease: 'power2.out' }, 3.5);
        faceTo(tl, m, 4.6, 2.2, 3.5);
      });
      // Dumrul ayağa kalkar, kılıcını çeker.
      tl.to(d, { yOffset: 0, duration: 0.5, ease: 'power2.out' }, 4.4);
      tl.to([d.legL.rotation, d.legR.rotation], { x: 0, z: 0, duration: 0.5 }, 4.4);
      tl.set(sw, { visible: true }, 4.9);
      tl.to(d.armR.rotation, { x: -2.8, duration: 0.4, ease: 'back.out(2)' }, 4.9);
      d.walkSpeed = 13;
      d.armSwing = 0;
      walkTo(tl, d, -2.9, -1.7, 0.6, 5.5);
      walkTo(tl, d, 3.2, 1.6, 1.3, 6.1);
      tl.to(d.armR.rotation, { x: -0.9, duration: 0.16, ease: 'power3.in' }, 7.4);
      // Azrail güvercin olup uçar.
      vanish(tl, a.group, 7.3, 0.25);
      tl.set(dove.group, { visible: true }, 7.4);
      tl.set(dove.group.rotation, { y: 0.9 }, 7.4);
      tl.to(dove.group.position, { x: 8, y: 5, z: 6, duration: 1.0, ease: 'power1.out' }, 7.4);
      tl.to(dove.group.rotation, { y: 2.6, duration: 0.6 }, 8.2);
      tl.to(dove.group.position, { x: 15, y: 10, z: -12, duration: 4, ease: 'power1.inOut' }, 8.4);
      tl.to(d.head.rotation, { x: -0.45, duration: 0.4 }, 8.0);
      tl.to(d.armR.rotation, { x: -2.6, duration: 0.5 }, 8.4);
      cam(tl, stage, [-3, 2.4, 13], [5, 4.2, 0], 4, 7.2);
      return tl;
    },
  },

  /* 7 — At ürker */
  {
    id: 'at',
    build(stage) {
      steppeSet(stage, 'day', 12);
      const tl = newTimeline();
      const h = stage.track(place(new Horse(), -20, 0, E));
      h.walkSpeed = 13;
      const rider = stage.track(dumrul(), false);
      h.mount(rider);
      rider.armL.rotation.x = -1.3;
      const hawkOnArm = new Bird(P.brown, 0.9);
      hawkOnArm.flap = 0;
      hawkOnArm.group.position.y = 0.12;
      hawkOnArm.group.rotation.x = Math.PI / 2;
      rider.handL.add(hawkOnArm.group);
      stage.track(hawkOnArm, false);

      const hawk = stage.track(new Bird(P.brown, 1.2));
      hawk.group.visible = false;
      hawk.group.position.set(-1, 2.6, 0.4);
      const dove = stage.track(new Bird(P.white, 1.2));
      dove.group.position.set(-8, 8, -6);
      dove.group.rotation.y = 1.2;

      // Yere düşen Dumrul: binici gizlenince bu figür görünür olur.
      const d = stage.track(place(dumrul(), -1.2, 0.6, E));
      d.freeY = true;
      d.group.position.y = 1.6;
      d.group.visible = false;

      const a = stage.track(place(cast.azrail(), 3.2, 0, W));
      stage.setCamera([-12, 2.4, 13], [-12, 2.2, 0]);

      tl.to(dove.group.position, { x: 40, y: 16, z: -22, duration: 9, ease: 'none' }, 0);
      walkTo(tl, h, -1, 0, 4.2, 0);
      cam(tl, stage, [-1, 2.6, 13], [0, 1.8, 0], 4.4, 0);

      pop(tl, a.group, 3.9, 1.15, 0.4);
      tl.to(a, { flap: 0.6, duration: 0.3 }, 3.9);
      // At şaha kalkar, Dumrul düşer.
      tl.to(h.rig.rotation, { x: -0.8, duration: 0.45, ease: 'power2.out' }, 4.2);
      tl.set(hawkOnArm.group, { visible: false }, 4.4);
      tl.set(hawk.group, { visible: true }, 4.4);
      tl.set(hawk.group.rotation, { y: -1.2 }, 4.4);
      tl.to(hawk.group.position, { x: -30, y: 16, z: -18, duration: 5, ease: 'power1.in' }, 4.4);
      tl.set(rider.group, { visible: false }, 4.6);
      tl.set(d.group, { visible: true }, 4.6);
      tl.to(d.group.position, { x: -2.4, z: 1.9, duration: 0.55, ease: 'none' }, 4.6);
      tl.to(d.group.position, { y: 0.28, duration: 0.55, ease: 'power2.in' }, 4.6);
      tl.to(d.rig.rotation, { x: -Math.PI / 2, duration: 0.55, ease: 'power1.in' }, 4.6);
      tl.to(d.armL.rotation, { z: -1.2, duration: 0.4 }, 4.9);
      tl.to(d.armR.rotation, { z: 1.2, duration: 0.4 }, 4.9);
      tl.to(h.rig.rotation, { x: 0, duration: 0.35, ease: 'power2.in' }, 5.0);
      walkTo(tl, h, -26, -12, 4, 5.5);
      // Azrail göğsüne çöker.
      a.freeY = true;
      tl.to(a.group.position, { x: -3.0, y: 0.3, z: 0.7, duration: 1.6, ease: 'power2.inOut' }, 5.6);
      turn(tl, a, 0, 5.8, 1.0);
      tl.to(a.rig.rotation, { x: 0.35, duration: 0.8 }, 6.6);
      tl.to(a.armR.rotation, { x: -1.1, duration: 0.6 }, 6.9);
      cam(tl, stage, [-3.2, 2.2, 10.5], [-3.0, 1.5, 0.8], 3.5, 5.4);
      return tl;
    },
  },

  /* 8 — Yalvarış ve dua */
  {
    id: 'yalvaris',
    build(stage) {
      steppeSet(stage, 'day', 12);
      const tl = newTimeline();
      const d = stage.track(place(dumrul(), -2.4, 1.9, E));
      d.freeY = true;
      d.group.position.y = 0.28;
      d.rig.rotation.x = -Math.PI / 2;
      const a = stage.track(place(cast.azrail(), -3.0, 0.7, 0));
      a.freeY = true;
      a.group.position.y = 0.3;
      a.flap = 0.6;
      a.rig.rotation.x = 0.35;
      const beam = stage.add(lightBeam(70, 3.2));
      beam.position.set(-3.1, 0, 1.2);
      beam.scale.set(0.01, 1, 0.01);
      stage.setCamera([-3.2, 2.2, 10.5], [-3.0, 1.5, 0.8]);

      turn(tl, a, W, 0.2, 1.0);
      cam(tl, stage, [-1.5, 2.2, 10.5], [-1.2, 1.5, 0.8], 2.5, 0.2);
      // Dumrul diz çöker, yalvarır.
      tl.to(a.group.position, { x: 0.6, y: 0, z: 0.9, duration: 1.2, ease: 'power2.inOut' }, 0.2);
      tl.to(a.rig.rotation, { x: 0, duration: 0.8 }, 0.2);
      tl.to(a, { flap: 0.2, duration: 1 }, 0.4);
      tl.to(d.group.position, { x: -3.1, y: -0.78, z: 1.2, duration: 1.0, ease: 'power2.out' }, 0.8);
      tl.to(d.rig.rotation, { x: 0, duration: 1.0, ease: 'power2.out' }, 0.8);
      tl.to([d.legL.rotation, d.legR.rotation], { x: 1.5, duration: 0.8 }, 0.8);
      plead(tl, d, 1.8);
      tl.to([d.armL.rotation, d.armR.rotation], { x: -1.2, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 2.4);
      // "Bana yalvarma, Allah'a yalvar."
      shakeHead(tl, a.head, 3.6, 1.2);
      tl.to(a.armR.rotation, { x: -2.9, duration: 0.6, ease: 'power2.out' }, 4.8);
      // Dumrul göğe döner, dua eder.
      turn(tl, d, 0.25, 6.0, 0.6);
      tl.to(d.head.rotation, { x: -0.55, duration: 0.6 }, 6.2);
      tl.to(d.armL.rotation, { x: -2.5, z: -0.35, duration: 0.7 }, 6.2);
      tl.to(d.armR.rotation, { x: -2.5, z: 0.35, duration: 0.7 }, 6.2);
      tl.to(a.armR.rotation, { x: 0, duration: 0.6 }, 6.6);
      cam(tl, stage, [-2.2, 1.8, 11], [-2.2, 1.9, 1], 3.5, 5.6);
      // Işık iner: dua kabul olur.
      tl.to(beam.scale, { x: 1, z: 1, duration: 2.2, ease: 'power2.out' }, 8.2);
      walkTo(tl, a, 3.4, -1.2, 2.2, 9.2);
      faceTo(tl, a, -3.1, 1.2, 11.4);
      return tl;
    },
  },

  /* 9 — Baba */
  {
    id: 'baba',
    build(stage) {
      steppeSet(stage, 'day', 9);
      const tl = newTimeline();
      addTent(stage, 2, -6, -0.1, P.white, P.indigo, 1.3);
      addTent(stage, 11, -9, -0.5, P.cream, P.red);
      const f = stage.track(place(father(), 1.4, 0, W));
      stage.track(place(mother(), 5.6, -1.4, -0.9));
      const d = stage.track(place(dumrul(), -16, 3.5, E));
      d.walkSpeed = 13;
      const a = stage.track(place(cast.azrail(), -9, -10, 0.8));
      a.flap = 0.08;
      stage.setCamera([-8, 3, 13], [-5, 1.4, 1]);

      walkTo(tl, d, -0.5, 0.4, 3.2, 0);
      cam(tl, stage, [0, 2.6, 10.5], [0.6, 1.5, 0], 4, 0);
      plead(tl, d, 3.4);
      tl.to([d.armL.rotation, d.armR.rotation], { x: -1.2, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 4.0);
      shakeHead(tl, f.head, 5.4, 1.6);
      // "Anana git."
      tl.to(f.armL.rotation, { x: -1.4, z: -1.0, duration: 0.6, ease: 'power2.out' }, 7.2);
      tl.to(f.armL.rotation, { x: 0, z: -0.14, duration: 0.6 }, 8.6);
      turn(tl, f, 2.4, 8.8, 0.8);
      armsDown(tl, d, 8.8);
      tl.to(d.head.rotation, { x: 0.4, duration: 0.6 }, 9.0);
      return tl;
    },
  },

  /* 10 — Ana */
  {
    id: 'ana',
    build(stage) {
      steppeSet(stage, 'day', 9);
      const tl = newTimeline();
      addTent(stage, 2, -6, -0.1, P.white, P.indigo, 1.3);
      addTent(stage, 11, -9, -0.5, P.cream, P.red);
      stage.track(place(father(), 1.4, 0, 2.4));
      const m = stage.track(place(mother(), 5.6, -1.4, -0.9));
      const d = stage.track(place(dumrul(), -0.5, 0.4, E));
      const a = stage.track(place(cast.azrail(), -9, -10, 0.8));
      a.flap = 0.08;
      stage.setCamera([0, 2.6, 10.5], [0.6, 1.5, 0]);

      walkTo(tl, d, 4.0, 0.2, 1.8, 0.2);
      cam(tl, stage, [4.5, 2.5, 9.5], [4.6, 1.5, -0.5], 3, 0);
      plead(tl, d, 2.2);
      tl.to([d.armL.rotation, d.armR.rotation], { x: -1.2, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 2.8);
      shakeHead(tl, m.head, 4.2, 1.6);
      turn(tl, m, 1.6, 6.0, 0.8);
      armsDown(tl, d, 6.2);
      tl.to(d.head.rotation, { x: 0.45, duration: 0.6 }, 6.4);
      // Azrail gelir.
      tl.to(a, { flap: 0.35, duration: 0.6 }, 6.6);
      walkTo(tl, a, 0.6, 2.2, 3.4, 6.6);
      faceTo(tl, a, 4.0, 0.2, 10.0);
      cam(tl, stage, [3.5, 2.8, 11.5], [2.6, 1.6, 0.6], 3.5, 6.8);
      faceTo(tl, d, 0.6, 2.2, 9.6);
      tl.to(d.head.rotation, { x: 0, duration: 0.4 }, 9.6);
      return tl;
    },
  },

  /* 11 — Veda */
  {
    id: 'veda',
    build(stage) {
      steppeSet(stage, 'dusk', 14);
      const tl = newTimeline();
      addTent(stage, 1.5, -6, 0, P.white, P.red, 1.4);
      addFire(stage, 5.5, 0.5, 0.9);
      const w = stage.track(place(wife(), 1.2, -1.2, -0.6));
      const kids = [stage.track(place(child(0), 2.2, -0.6, -0.8)), stage.track(place(child(1), 0.6, -2.0, -0.4))];
      kids.forEach((k) => (k.walkSpeed = 14));
      const d = stage.track(place(dumrul(), -7, 2.6, E));
      const a = stage.track(place(cast.azrail(), -9.5, 3.4, E));
      a.flap = 0.15;
      stage.setCamera([-4, 3, 13], [-2, 1.5, 0.5]);

      tl.to(d.armL.rotation, { x: -1.4, duration: 0.4 }, 0.2); // "Dur."
      faceTo(tl, d, -9.5, 3.4, 0.1, 0.3);
      tl.to(d.armL.rotation, { x: 0, duration: 0.4 }, 1.3);
      walkTo(tl, d, -0.6, -0.2, 2.6, 1.5);
      walkTo(tl, a, -6, 2.6, 2.2, 2.2);
      cam(tl, stage, [0.5, 2.5, 9.5], [0.4, 1.4, -0.6], 4, 1.0);
      walkTo(tl, kids[0], 0.1, 0.5, 0.9, 4.0);
      walkTo(tl, kids[1], -1.0, -1.0, 0.9, 4.2);
      faceTo(tl, kids[0], -0.6, -0.2, 4.9);
      faceTo(tl, kids[1], -0.6, -0.2, 5.1);
      tl.to(d.head.rotation, { x: 0.4, duration: 0.5 }, 4.6);
      tl.to(d.armL.rotation, { x: -0.8, duration: 0.5 }, 4.8);
      tl.to(d.head.rotation, { x: 0, duration: 0.4 }, 6.0);
      tl.to(d.armL.rotation, { x: 0, duration: 0.4 }, 6.0);
      // "Malım mülküm senin olsun."
      faceTo(tl, d, 1.2, -1.2, 6.0);
      tl.to(d.armR.rotation, { x: -1.4, z: 1.0, duration: 0.6, ease: 'power2.out' }, 6.4);
      tl.to(d.armR.rotation, { x: 0, z: 0.14, duration: 0.6 }, 7.8);
      // Eşi karşı çıkar, Azrail'in önüne geçer.
      shakeHead(tl, w.head, 8.0, 1.4);
      walkTo(tl, w, -3.2, 1.2, 1.6, 9.6);
      faceTo(tl, w, -6, 2.6, 11.2);
      tl.to(w.armL.rotation, { x: -0.3, z: -1.2, duration: 0.5, ease: 'back.out(2)' }, 11.4);
      tl.to(w.armR.rotation, { x: -0.3, z: 1.2, duration: 0.5, ease: 'back.out(2)' }, 11.4);
      faceTo(tl, d, -3.2, 1.2, 10.4);
      cam(tl, stage, [-1.5, 2.4, 10.5], [-2.6, 1.5, 0.8], 3.5, 9.4);
      return tl;
    },
  },

  /* 12 — Bağışlanma */
  {
    id: 'bagis',
    build(stage) {
      const sky = steppeSet(stage, 'dusk', 14);
      const tl = newTimeline();
      addTent(stage, 1.5, -6, 0, P.white, P.red, 1.4);
      addFire(stage, 5.5, 0.5, 0.9);
      const w = stage.track(place(wife(), -3.2, 1.2, -1.1));
      w.armL.rotation.set(-0.3, 0, -1.2);
      w.armR.rotation.set(-0.3, 0, 1.2);
      const kids = [stage.track(place(child(0), 0.1, 0.5, -1.2)), stage.track(place(child(1), -1.0, -1.0, 0.5))];
      kids.forEach((k) => (k.walkSpeed = 14));
      const d = stage.track(place(dumrul(), -0.6, -0.2, -1.1));
      const a = stage.track(place(cast.azrail(), -6, 2.6, E));
      a.freeY = true;
      a.flap = 0.15;
      const beam = stage.add(lightBeam(70, 4));
      beam.position.set(-2.2, 0, 0.6);
      beam.scale.set(0.01, 1, 0.01);
      stage.setCamera([-1.5, 2.4, 10.5], [-2.6, 1.5, 0.8]);

      tl.to(beam.scale, { x: 1, z: 1, duration: 2, ease: 'power2.out' }, 0.3);
      sky.tweenTo(tl, 'dawn', 6, 1.5);
      // Azrail çekip gider.
      tl.to(a.head.rotation, { x: -0.4, duration: 0.5 }, 1.6);
      tl.to(a, { flap: 0.7, duration: 0.6 }, 2.6);
      turn(tl, a, -2.2, 2.8, 0.8);
      tl.to(a.group.position, { x: -40, y: 26, z: -50, duration: 6, ease: 'power2.in' }, 3.2);
      tl.to(a.rig.rotation, { x: 0.6, duration: 1.2 }, 3.4);
      cam(tl, stage, [0, 2.2, 12], [-3, 2.6, 0], 3.5, 2.6);
      // Aile kavuşur.
      tl.to([w.armL.rotation, w.armR.rotation], { x: 0, z: 0, duration: 0.6 }, 5.4);
      faceTo(tl, w, -0.6, -0.2, 5.6);
      walkTo(tl, d, -2.3, 0.8, 1.0, 5.8);
      tl.to([d.armL.rotation, d.armR.rotation], { x: -1.2, duration: 0.5 }, 6.8);
      tl.to([w.armL.rotation, w.armR.rotation], { x: -1.2, duration: 0.5 }, 6.9);
      walkTo(tl, kids[0], -1.9, 2.1, 0.8, 6.4);
      walkTo(tl, kids[1], -3.3, 2.3, 0.9, 6.6);
      faceTo(tl, kids[0], -2.7, 1.0, 7.3);
      faceTo(tl, kids[1], -2.7, 1.0, 7.5);
      kids.forEach((k, i) => {
        tl.to(k, { yOffset: 0.35, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 5 }, 7.7 + i * 0.15);
        tl.to([k.armL.rotation, k.armR.rotation], { x: -2.8, duration: 0.3 }, 7.7 + i * 0.15);
      });
      tl.to(beam.material, { opacity: 0, duration: 2.5 }, 7.5);
      cam(tl, stage, [-2.5, 2.2, 9], [-2.6, 1.3, 1], 4, 6.2);
      return tl;
    },
  },

  /* 13 — Dedem Korkut */
  {
    id: 'dede',
    build(stage) {
      const sky = bridgeSet(stage, 'dusk');
      const tl = newTimeline();
      const fx = -15;
      const fz = 6;
      addFire(stage, fx, fz, 1.1);
      const dede = stage.track(place(cast.dedeKorkut(), fx - 2.6, fz - 0.6, 1.25)).sit();
      const seats: [Human, number][] = [
        [dumrul(), 60],
        [wife(), 95],
        [child(0), 128],
        [child(1), 22],
      ];
      for (const [m, deg] of seats) {
        const r = THREE.MathUtils.degToRad(deg);
        const x = fx + Math.sin(r) * 2.7;
        const z = fz + Math.cos(r) * 2.7 - 1.2;
        stage.track(place(m, x, z, Math.atan2(fx - 1.3 - x, fz - 0.3 - z))).sit();
      }
      stage.setCamera([-18, 1.8, 12], [-15.5, 1.1, 5.5]);

      // Kopuz çalar.
      tl.to(dede.armR.rotation, { x: -1.15, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: 41 }, 0);
      tl.to(dede.head.rotation, { z: 0.12, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 7 }, 0);
      sky.tweenTo(tl, 'night', 9, 2);
      cam(tl, stage, [-20, 3.4, 15.5], [-12.5, 1.5, 4], 10, 1.5);
      return tl;
    },
  },
];
