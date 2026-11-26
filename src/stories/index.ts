import type { StoryMeta } from '../engine/story';

/** Sitedeki hikâyeler. `load` alanı olmayanlar henüz hazır değildir. */
export const stories: StoryMeta[] = [
  {
    slug: 'deli-dumrul',
    title: 'Deli Dumrul',
    blurb: 'Kuru çaya köprü kuran, Azrail’e kafa tutan yiğit.',
    load: () => import('./deli-dumrul').then((m) => m.default),
    cover: { scene: 1, at: 1 },
    source: 'Dresden nüshası, beşinci boy: “Duha Koca Oğlu Deli Dumrul Boyu”. Vatikan nüshasında yer almaz.',
  },
  {
    slug: 'tepegoz',
    title: 'Basat ile Tepegöz',
    blurb: 'Aslanların büyüttüğü Basat, tek gözlü deve karşı.',
    load: () => import('./tepegoz').then((m) => m.default),
    cover: { scene: 8, at: 0.45 },
    source: 'Dresden nüshası, sekizinci boy: “Basat’ın Tepegöz’ü Öldürdüğü Boy”. Vatikan nüshasında yer almaz.',
  },
  {
    slug: 'bogac-han',
    title: 'Boğaç Han',
    blurb: 'Boğayı yumruğuyla yenip ad alan genç.',
    load: () => import('./bogac-han').then((m) => m.default),
    cover: { scene: 5, at: 0.35 },
    source: 'Dresden nüshası, birinci boy: “Dirse Han Oğlu Boğaç Han Boyu”. Vatikan nüshasında da yer alır.',
  },
  {
    slug: 'bamsi-beyrek',
    title: 'Bamsı Beyrek — 1. Bölüm',
    blurb: 'Boz aygır, Banı Çiçek’le güreş ve gerdek gecesi baskını.',
    load: () => import('./bamsi-beyrek').then((m) => m.default),
    cover: { scene: 7, at: 0.3 },
    source: 'Dresden nüshası, üçüncü boy: “Kam Püre’nin Oğlu Bamsı Beyrek Boyu”. Vatikan nüshasında da yer alır. Uzunluğu nedeniyle iki bölümde anlatılmıştır.',
  },
  {
    slug: 'bamsi-beyrek-2',
    title: 'Bamsı Beyrek — 2. Bölüm',
    blurb: 'On altı yıl tutsaklık ve ozan kılığında dönüş.',
    load: () => import('./bamsi-beyrek/part2').then((m) => m.default),
    cover: { scene: 5, at: 0.75 },
  },
  { slug: 'kan-turali', title: 'Kan Turalı', blurb: 'Boğa, aslan, deve ve yiğit Selcen Hatun.' },
  { slug: 'salur-kazan', title: 'Salur Kazan’ın Evinin Yağmalanması', blurb: 'Basılan yurt ve sapanlı Karaca Çoban.' },
  { slug: 'ejderha', title: 'Salur Kazan ve Yedi Başlı Ejderha', blurb: 'Yıllar sonra bulunan on üçüncü hikâye.' },
  { slug: 'beyrek-olum', title: 'Beyrek’in Ölümü', blurb: 'İç Oğuz ile Dış Oğuz’un birbirine düşmesi.' },
];
