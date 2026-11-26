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
