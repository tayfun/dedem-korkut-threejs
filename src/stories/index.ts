import type { StoryMeta } from '../engine/story';

/** Sitedeki hikâyeler. `load` alanı olmayanlar henüz hazır değildir. */
export const stories: StoryMeta[] = [
  {
    slug: 'deli-dumrul',
    title: 'Deli Dumrul',
    blurb: 'Kuru çaya köprü kuran, Azrail’e kafa tutan yiğit.',
    load: () => import('./deli-dumrul').then((m) => m.default),
    cover: { scene: 1, at: 1 },
  },
  { slug: 'tepegoz', title: 'Basat ile Tepegöz', blurb: 'Aslanların büyüttüğü Basat, tek gözlü deve karşı.' },
  { slug: 'bogac-han', title: 'Boğaç Han', blurb: 'Boğayı yumruğuyla yenip ad alan genç.' },
  { slug: 'bamsi-beyrek', title: 'Bamsı Beyrek', blurb: 'On altı yıl tutsaklık ve ozan kılığında dönüş.' },
  { slug: 'kan-turali', title: 'Kan Turalı', blurb: 'Boğa, aslan, deve ve yiğit Selcen Hatun.' },
  { slug: 'salur-kazan', title: 'Salur Kazan’ın Evinin Yağmalanması', blurb: 'Basılan yurt ve sapanlı Karaca Çoban.' },
  { slug: 'ejderha', title: 'Salur Kazan ve Yedi Başlı Ejderha', blurb: 'Yıllar sonra bulunan on üçüncü hikâye.' },
  { slug: 'beyrek-olum', title: 'Beyrek’in Ölümü', blurb: 'İç Oğuz ile Dış Oğuz’un birbirine düşmesi.' },
];
