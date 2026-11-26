import { place } from '../engine/direct';
import type { Stage } from '../engine/stage';
import { Horse } from './animals';
import { Human, type HumanOpts } from './human';
import { P } from './palette';
import { bow, kopuz, sword } from './props';

/**
 * Oyuncu kadrosu: hikâyeler arasında paylaşılan hazır kişiler.
 * Bir hikâyeye özel kişiler (kahraman, ailesi, düşmanı) o hikâyenin `sets.ts` dosyasında,
 * buradaki yardımcılarla kurulur.
 */

/** Dede Korkut: ak sakallı bilge ozan; kucağında kopuzu vardır. Her hikâyenin sonunda gelir. */
export function dedeKorkut(): Human {
  const d = new Human({ robe: P.cream, trim: P.teal, hat: 'turban', hatColor: P.white, beard: P.white, long: true, cloak: P.teal, mood: 'happy' });
  const k = kopuz();
  k.position.set(0.08, 1.1, 0.2);
  k.rotation.z = 1.05;
  d.rig.add(k);
  d.armR.rotation.set(-0.95, 0, -0.35);
  d.armL.rotation.set(-1.1, 0, -0.5);
  return d;
}

/** Oba halkı: sırayla dönen sekiz ayrı kılık (erkek, kadın, yaşlı). */
const LOOKS: HumanOpts[] = [
  { robe: P.teal, trim: P.cream, hat: 'bork', hatColor: P.red, moustache: P.black },
  { robe: P.brown, trim: P.ochre, hat: 'kalpak', hatColor: P.indigo, hair: P.darkBrown, eyes: 0x4f6a3a },
  { robe: P.indigo, trim: P.cream, hat: 'scarf', hatColor: P.cream, long: true, hair: P.darkBrown, blush: true, eyes: 0x3f6a7a },
  { robe: P.green, trim: P.ochre, hat: 'bork', hatColor: P.ochre, moustache: P.darkBrown, hair: P.darkBrown },
  { robe: P.crimson, trim: P.cream, hat: 'scarf', hatColor: P.ochre, long: true, hair: P.black, blush: true },
  { robe: P.ochre, trim: P.indigo, hat: 'kalpak', hatColor: P.red, beard: P.black },
  { robe: P.stoneDark, trim: P.red, hat: 'bork', hatColor: P.teal, beard: P.white },
  { robe: P.indigo, trim: P.ochre, hat: 'bork', hatColor: P.green, beard: P.black },
];

export const villager = (i: number, extra: HumanOpts = {}) => new Human({ ...LOOKS[i % LOOKS.length], ...extra });

/** Bey ya da yiğit: börklü, bıyıklı, pelerinli. Renkleri ve ayrıntıları `o` ile değiştir. */
export const warrior = (o: HumanOpts = {}) => new Human({ robe: P.red, trim: P.ochre, hat: 'bork', hatColor: P.indigo, scale: 1.1, moustache: P.black, hair: P.black, cloak: P.indigo, ...o });

/** Hatun: başörtülü, örgülü, uzun etekli. */
export const lady = (o: HumanOpts = {}) => new Human({ robe: P.teal, trim: P.ochre, hat: 'scarf', hatColor: P.cream, long: true, hair: P.black, blush: true, face: 'woman', ...o });

/** Ak sakallı koca. */
export const elderMan = (o: HumanOpts = {}) => new Human({ robe: P.brown, trim: P.cream, hat: 'kalpak', hatColor: P.indigo, beard: P.white, ...o });

/** Ak saçlı kadın. */
export const elderWoman = (o: HumanOpts = {}) => new Human({ robe: P.indigo, trim: P.cream, hat: 'scarf', hatColor: P.white, long: true, hair: P.pale, face: 'elder', ...o });

/** Çocuk: `i` kılığı ve boyu değiştirir. */
export const child = (i = 0, o: HumanOpts = {}) => new Human({ robe: i ? P.ochre : P.green, trim: P.red, hat: 'bork', hatColor: P.red, scale: i ? 0.55 : 0.66, blush: true, hair: P.darkBrown, ...o });

/** Atlı bir kişi: atı sahneye koyar, biniciyi eyere oturtur; atı döndürür (yürütülecek olan attır). */
export function mounted(stage: Stage, who: Human, x: number, z: number, ry: number, color: number = P.brown): Horse {
  const h = stage.track(place(new Horse(color), x, z, ry));
  stage.track(who, false);
  h.mount(who);
  return h;
}

/** Figüre yay verir: yay sol elde, kol öne uzanmış. */
export function archer(m: Human): Human {
  m.handL.add(bow());
  m.armL.rotation.x = -1.5;
  m.armSwing = 0.2;
  return m;
}

/** Figürün sağ eline kılıç verir; kol yürürken sallanmaz. */
export function armed(m: Human): Human {
  const s = sword();
  s.rotation.x = Math.PI / 2;
  m.handR.add(s);
  m.armSwing = 0.2;
  return m;
}
