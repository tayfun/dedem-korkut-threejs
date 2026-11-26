import gsap from 'gsap';
import type * as THREE from 'three';
import type { Human, Mood } from '../procedural/human';
import { KNEEL_KNEE, KNEEL_Y } from '../procedural/human';
import type { Mover, Stage } from './stage';

/** Sahne yönetimi yardımcıları: figürleri yerleştirir, yürütür, kamerayı oynatır. */

type TL = gsap.core.Timeline;

export function place<T extends Mover>(m: T, x: number, z: number, ry = 0): T {
  m.group.position.set(x, m.group.position.y, z);
  m.group.rotation.y = ry;
  m.plan = { x, z, ry };
  return m;
}

function shortest(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}

/** Figürü verilen açıya döndürür. */
export function turn(tl: TL, m: Mover, ry: number, at: number, dur = 0.4): void {
  const target = shortest(m.plan.ry, ry);
  tl.to(m.group.rotation, { y: target, duration: dur, ease: 'power2.inOut' }, at);
  m.plan.ry = target;
}

/** Figürü bir noktaya baktırır. */
export function faceTo(tl: TL, m: Mover, x: number, z: number, at: number, dur = 0.4): void {
  turn(tl, m, Math.atan2(x - m.plan.x, z - m.plan.z), at, dur);
}

/** Figürü yürüterek bir noktaya götürür; yönünü ve adım salınımını kendisi ayarlar. */
export function walkTo(tl: TL, m: Mover, x: number, z: number, dur: number, at: number): void {
  faceTo(tl, m, x, z, at, Math.min(0.35, dur / 2));
  tl.to(m, { walkAmp: 1, duration: 0.25 }, at);
  tl.to(m.group.position, { x, z, duration: dur, ease: 'none' }, at);
  tl.to(m, { walkAmp: 0, duration: 0.25 }, at + dur - 0.2);
  m.plan.x = x;
  m.plan.z = z;
}

/** Kamerayı yeni konuma ve bakış noktasına kaydırır. */
export function cam(
  tl: TL,
  stage: Stage,
  pos: [number, number, number],
  look: [number, number, number],
  dur: number,
  at: number,
  ease = 'sine.inOut',
): void {
  tl.to(stage.camera.position, { x: pos[0], y: pos[1], z: pos[2], duration: dur, ease }, at);
  tl.to(stage.look, { x: look[0], y: look[1], z: look[2], duration: dur, ease }, at);
}

/** "Hayır" anlamında baş sallama. */
export function shakeHead(tl: TL, head: { rotation: { y: number } }, at: number, dur = 1.6): void {
  tl.to(head.rotation, { keyframes: { y: [0, 0.55, -0.55, 0.55, -0.55, 0] }, duration: dur, ease: 'sine.inOut' }, at);
}

/* ------------------------- Zaman çizelgesi ------------------------- */

export const newTimeline = (): TL => gsap.timeline();

/** Nesneyi küçükten büyüterek "belirir" kılar. */
export function pop(tl: TL, obj: THREE.Object3D, at: number, scale = 1, dur = 0.6): void {
  tl.fromTo(obj.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: scale, y: scale, z: scale, duration: dur, ease: 'back.out(1.8)' }, at);
}

export function vanish(tl: TL, obj: THREE.Object3D, at: number, dur = 0.35): void {
  tl.to(obj.scale, { x: 0.001, y: 0.001, z: 0.001, duration: dur, ease: 'power2.in' }, at);
}

/** Bir nesneyi havadan bir noktadan ötekine atar; uçuş boyunca görünür, sonra kaybolur. */
export function toss(tl: TL, obj: THREE.Object3D, from: [number, number, number], to: [number, number, number], at: number, dur = 0.6): void {
  obj.position.set(...from);
  obj.visible = false;
  tl.set(obj, { visible: true }, at);
  tl.to(obj.position, { x: to[0], z: to[2], duration: dur, ease: 'none' }, at);
  tl.to(obj.position, { y: Math.max(from[1], to[1]) + 0.7, duration: dur / 2, ease: 'power1.out' }, at);
  tl.to(obj.position, { y: to[1], duration: dur / 2, ease: 'power1.in' }, at + dur / 2);
  tl.to(obj.rotation, { z: 9, duration: dur, ease: 'none' }, at);
  tl.set(obj, { visible: false }, at + dur + 0.02);
}

/** Bir nesneyi (ok, taş) düz bir çizgide fırlatır; +z ekseni uçuş yönüne döner. Varınca kaybolur. */
export function launch(tl: TL, obj: THREE.Object3D, from: [number, number, number], to: [number, number, number], at: number, dur = 0.35): void {
  obj.position.set(...from);
  obj.lookAt(...to);
  obj.visible = false;
  tl.set(obj, { visible: true }, at);
  tl.to(obj.position, { x: to[0], y: to[1], z: to[2], duration: dur, ease: 'none' }, at);
  tl.set(obj, { visible: false }, at + dur + 0.01);
}

/** Ayaktaki figürü sırtüstü yere yıkar. */
export function fall(tl: TL, m: Human, at: number, dur = 0.5): void {
  tl.to(m.rig.rotation, { x: -Math.PI / 2, duration: dur, ease: 'power2.in' }, at);
  tl.to(m, { yOffset: 0.27 * m.group.scale.y, duration: dur, ease: 'power2.in' }, at);
}

/* ------------------------- Duruş ve jestler ------------------------ */

/** Yüz ifadesini zaman çizelgesinin bir anında değiştirir. */
export function mood(tl: TL, who: Human | Human[], m: Mood, at: number): void {
  const list = Array.isArray(who) ? who : [who];
  tl.call(() => list.forEach((h) => h.setMood(m)), [], at);
}

/** Yalvarma: iki kol öne uzanır. */
export function plead(tl: TL, m: Human, at: number): void {
  tl.to([m.armL.rotation, m.armR.rotation], { x: -1.5, duration: 0.5, ease: 'power2.out' }, at);
}

export function armsDown(tl: TL, m: Human, at: number): void {
  tl.to([m.armL.rotation, m.armR.rotation], { x: 0, duration: 0.6, ease: 'power2.inOut' }, at);
}

/** İki kol havaya: dua, sevinç ya da meydan okuma. Baş da hafifçe geriye yatar. */
export function raiseArms(tl: TL, m: Human, at: number, dur = 0.7): void {
  tl.to(m.head.rotation, { x: -0.55, duration: dur * 0.85 }, at);
  tl.to(m.armL.rotation, { x: -2.5, z: -0.35, duration: dur }, at);
  tl.to(m.armR.rotation, { x: -2.5, z: 0.35, duration: dur }, at);
}

/** Ayakta duran figürü diz çöktürür. */
export function kneelDown(tl: TL, m: Human, at: number, dur = 0.5): void {
  tl.to(m, { yOffset: KNEEL_Y * m.group.scale.y, duration: dur, ease: 'power2.out' }, at);
  tl.to([m.kneeL.rotation, m.kneeR.rotation], { x: KNEEL_KNEE, duration: dur }, at);
}

/** Oturan ya da diz çökmüş figürü ayağa kaldırır. */
export function standUp(tl: TL, m: Human, at: number, dur = 0.6): void {
  tl.to(m, { yOffset: 0, duration: dur, ease: 'power2.out' }, at);
  tl.to([m.legL.rotation, m.legR.rotation, m.kneeL.rotation, m.kneeR.rotation], { x: 0, z: 0, duration: dur }, at);
}

/** Yas duruşu: baş öne eğik, eller yüzde, yüz üzgün. */
export function grieve(m: Human): void {
  m.setMood('sad');
  m.head.rotation.x = 0.45;
  m.armL.rotation.set(-2.2, 0, 0.45);
  m.armR.rotation.set(-2.2, 0, -0.45);
}

/** Hafif, yinelenen bir sallanma (ağlama, nefes alma). */
export function sway(tl: TL, m: Human, at: number, repeats = 9): void {
  tl.to(m.rig.rotation, { x: 0.1, duration: 0.5 + Math.random() * 0.3, ease: 'sine.inOut', yoyo: true, repeat: repeats }, at);
}
