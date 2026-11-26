import type { SceneText } from '../../engine/story';

/**
 * Deli Dumrul — sahne metinleri (Dresden nüshası, beşinci boy).
 * Anahtarlar `scenes.ts` içindeki sahne kimlikleriyle eşleşir.
 */
export const texts: Record<string, SceneText> = {
  kopru: {
    text: 'Oğuz’da Duha Koca oğlu Deli Dumrul derler bir er vardı. Kuru bir çayın üstüne köprü yaptırmıştı. Geçenden otuz üç akçe alır, geçmeyenden döve döve kırk akçe alırdı.',
    note: 'Akçe: gümüş para.',
  },
  ovunme: {
    text: 'Bunu neden yapardı? “Benden deli, benden güçlü er var mı ki çıksın, benimle savaşsın?” derdi. “Erliğim, bahadırlığım, yiğitliğim Rum’a, Şam’a gitsin, ün salsın.”',
    note: 'Rum: Anadolu. Şam: Suriye.',
  },
  oba: {
    text: 'Bir gün köprüsünün yamacına bir bölük oba konmuştu. O obada iyi, güzel bir yiğit hastalandı; Allah’ın buyruğuyla öldü. Kimi “oğul” diye, kimi “kardeş” diye ağladı; o yiğidin üstüne büyük bir yas koptu.',
    note: 'Oba: çadırlarıyla birlikte göçen topluluk.',
  },
  soru: {
    text: 'Deli Dumrul dörtnala yetişti: “Bre kavatlar, ne ağlarsınız? Köprümün yanında bu kavga nedir?” “Hanım, iyi bir yiğidimiz öldü” dediler, “al kanatlı Azrail canını aldı.” “Azrail dediğiniz kimdir ki adamın canını alır? Ya kadir Allah, birliğin, varlığın hakkı için Azrail’i gözüme göster; savaşayım, çekişeyim, yiğidin canını kurtarayım!”',
    note: 'Kavat: ağır bir sövgü. Hanım: “hanım, efendim” anlamında seslenme. Al: kırmızı.',
  },
  buyruk: {
    text: 'Dumrul’un sözü Hak Teala’ya hoş gelmedi. “Bak bak, bu deli kavat benim birliğimi bilmez, birliğime şükretmez; ulu dergâhımda gezer, benlik eder” dedi. Azrail’e buyurdu: “Ya Azrail, var, o deli kavatın gözüne görün; benzini sarart, canını hırıldat, al.”',
  },
  sofra: {
    text: 'Deli Dumrul kırk yiğidiyle yiyip içip otururken Azrail çıkageldi. Onu ne çavuş gördü ne kapıcı. Dumrul’un görür gözü görmez, tutar eli tutmaz oldu. “Bre, ne heybetli kocasın! Sakalcığı ağarmış, gözceğizi çöngelmiş koca, kimsin?” dedi. Azrail kendini bildirince Dumrul kara kılıcını sıyırıp saldırdı. Azrail bir güvercin oldu, uçtu gitti.',
    note: 'Koca: yaşlı adam. Çöngelmiş: feri sönmüş.',
  },
  at: {
    text: 'Dumrul elini eline çaldı, kah kah güldü: “Yiğitlerim, Azrail’in gözünü öyle korkuttum ki kaçtı. Onu doğana aldırmadan bırakır mıyım?” Atına bindi, doğanını eline aldı, ardına düştü. Dönüp evine gelirken Azrail atının gözüne göründü. At ürktü, Dumrul’u kaldırıp yere vurdu. Kara başı bunaldı; ak göğsünün üstüne Azrail basıp kondu.',
    note: 'Doğan: avda kullanılan yırtıcı kuş.',
  },
  yalvaris: {
    text: '“Bre Azrail, aman! Ben seni böyle bilmezdim, uğrulayın can aldığını duymazdım. Bizim dağlarımızın bağları, o bağların kara salkımlı üzümü, o üzümün al şarabı olur. Şaraplıydım, ne söylediğimi bilmedim. Beyliğe usanmadım, yiğitliğe doymadım; canımı alma!” Azrail dedi: “Bre deli kavat, bana ne yalvarırsın? Allah’a yalvar. Benim elimde ne var; ben de bir yumuş oğlanıyım.”',
    note: 'Uğrulayın: hırsız gibi, gizlice. Yumuş oğlanı: buyruk taşıyan hizmetçi.',
  },
  dua: {
    text: 'Dumrul, “Öyleyse sen aradan çık; ben Allah’la söyleşeyim” dedi. “Yücelerden yücesin, kimse bilmez nicesin, görklü Tanrı! Nice cahiller seni gökte arar, yerde ister; sen müminlerin gönlündesin. Canımı alacaksan sen al, Azrail’e bırakma.” Bu söz Hak Teala’ya hoş geldi: “Deli Dumrul can yerine can bulsun, kendi canı azat olsun.”',
    note: 'Görklü: güzel, yüce.',
  },
  baba: {
    text: 'Dumrul babasına vardı, elini öptü: “Ak sakallı, aziz babam! Küfür söz söyledim, Hak Teala’ya hoş gelmedi. Azrail ak göğsüme kondu, tatlı canımı alır oldu. Senden can dilerim, verir misin?” Babası dedi: “Canımın parçası oğul! Kara dağım gerekse söyle, Azrail’in yaylası olsun; tavla tavla atlarım, katar katar develerim, altınım gümüşüm onun olsun. Ama dünya şirin, can aziz; canıma kıyamam. Benden sevgili anan var, ona git.”',
  },
  ana: {
    text: 'Dumrul anasına vardı: “Ana, senden can dilerim. Verir misin, yoksa ‘oğul Deli Dumrul’ diye ağlar mısın?” Anası dedi: “Oğul, oğul, ay oğul! Dokuz ay dar karnımda taşıdığım, ak sütümü doya doya emzirdiğim oğul! Dünya şirin, can aziz; canıma kıyamam, bunu böyle bil.” Anası da canını vermedi. Azrail, Deli Dumrul’un canını almaya geldi.',
  },
  veda: {
    text: 'Dumrul, “Bre Azrail, aman! Yad kızı helalim, ondan iki oğlancığım var. Emanetimi ısmarlayayım, canımı ondan sonra al” dedi. Eşine vardı: “Yüksek kara dağlarım sana yaylak olsun; soğuk sularım sana içecek, tavla tavla atlarım sana binek olsun. Gözün kimi tutarsa, gönlün kimi severse ona var; iki oğlancığı öksüz koma.”',
    note: 'Yad kızı helal: başka soydan gelen eş.',
  },
  es: {
    text: 'Kadın dedi: “Ne dersin, ne söylersin? Göz açıp gördüğüm, gönül verip sevdiğim koç yiğidim! Senden sonra kara dağlarını ben neyleyim? Yaylarsam mezarım olsun; soğuk sularını içersem kanım olsun. Senin o muhannet anan baban bir canda ne var ki sana kıyamamışlar? Yer tanık olsun, gök tanık olsun, kadir Tanrı tanık olsun: benim canım senin canına kurban olsun!”',
    note: 'Muhannet: namert, korkak.',
  },
  'ikinci-dua': {
    text: 'Azrail hatunun canını almaya geldi. Dumrul yoldaşına kıyamadı, Allah’a yalvardı: “Ulu yollar üstüne senin için imaretler yapayım; aç görsem senin için doyurayım, çıplak görsem senin için giydireyim. Alırsan ikimizin canını birlikte al, bırakırsan ikimizin canını birlikte bırak, keremi çok kadir Tanrı!”',
    note: 'İmaret: yoksullara yemek dağıtılan hayır evi.',
  },
  bagis: {
    text: 'Hak Teala’ya Dumrul’un sözü hoş geldi. Azrail’e buyurdu: “Deli Dumrul’un anasının babasının canını al; o iki helalliye yüz kırk yıl ömür verdim.” Azrail, ananın babanın canını hemen aldı. Deli Dumrul yüz kırk yıl daha yoldaşıyla yaşadı.',
  },
  dede: {
    text: 'Dedem Korkut gelip boy boyladı, soy soyladı: “Bu boy Deli Dumrul’un olsun; benden sonra alp ozanlar söylesin, alnı açık cömert erenler dinlesin.” Sonra dua etti: “Yerli kara dağların yıkılmasın. Gölgeli ulu ağacın kesilmesin. Coşkun akan güzel suyun kurumasın. Kadir Tanrı seni namerde muhtaç etmesin.”',
    note: 'Boy boylamak, soy soylamak: destan anlatmak, şiir söylemek. Alp: yiğit. Ozan: destanları kopuzuyla söyleyen kişi.',
  },
};
