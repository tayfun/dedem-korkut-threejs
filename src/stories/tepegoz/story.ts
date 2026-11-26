import type { SceneText } from '../../engine/story';

/**
 * Basat'ın Tepegöz'ü Öldürdüğü Boy — sahne metinleri (Dresden nüshası, sekizinci boy).
 * Anahtarlar `scenes.ts` içindeki sahne kimlikleriyle eşleşir.
 */
export const texts: Record<string, SceneText> = {
  aslan: {
    text: 'Bir gece Oğuz otururken üstüne yağı geldi; el ürktü, göçtü. Kaçıp giderken Aruz Koca’nın oğlancığı düştü. Onu bir aslan buldu, götürüp besledi. Zaman geçti, Oğuz yine yurduna döndü.',
    note: 'Yağı: düşman.',
  },
  yilkici: {
    text: 'Oğuz Han’ın yılkıcısı gelip haber verdi: “Hanım, sazdan bir aslan çıkar, at basar. Apul apul yürüyüşü adam gibidir; at basıp kan sömürür.” Aruz, “Hanım, ürktüğümüz vakit düşen benim oğlancığımdır belki” dedi. Beyler bindiler, aslan yatağının üstüne geldiler; aslanı kaldırıp oğlanı tuttular.',
    note: 'Yılkıcı: at çobanı. Saz: sazlık.',
  },
  ad: {
    text: 'Aruz oğlanı evine getirdi, şenlik ettiler. Ama oğlan durmadı, yine aslan yatağına vardı; yine tutup getirdiler. Dedem Korkut geldi: “Oğlanım, sen insansın, hayvanla yoldaş olma. Gel, iyi at bin, iyi yiğitlerle eş yort. Ulu kardeşinin adı Kıyan Selçuk’tur; senin adın Basat olsun. Adını ben verdim, yaşını Allah versin.”',
  },
  peri: {
    text: 'Oğuz bir gün yaylaya göçtü. Aruz’un bir çobanı vardı; adına Konur Koca Sarı Çoban derlerdi. Uzun Pınar’a periler konmuştu. Ansızın koyun ürktü. Çoban baktı: peri kızları kanat kanada bağlamış, uçuyorlar. Kepeneğini üzerlerine attı, birini tuttu; tamah edip onunla yattı. Peri kanat vurup uçtu: “Çoban, yıl tamam olunca bende emanetin var, gel al. Ama Oğuz’un başına zeval getirdin.”',
    note: 'Kepenek: çobanın keçe üstlüğü. Zeval: yıkım.',
  },
  yiginak: {
    text: 'Zaman geçti, Oğuz yine o yaylaya göçtü. Çoban pınara geldi; yine koyun ürktü. Gördü ki bir yığınak yatar, yıldır yıldır yıldırır. Peri geldi: “Çoban, emanetini gel al. Ama Oğuz’un başına zeval getirdin.” Çoban korktu, yığınağı sapan taşına tuttu. Vurdukça büyüdü. Çoban yığınağı bırakıp kaçtı.',
    note: 'Yığınak: yığın, küme. Yıldır yıldır: parıl parıl.',
  },
  dogum: {
    text: 'Oğuz beyleri gezmeye çıkmıştı; pınara geldiler. Gördüler ki başı kıçı belirsiz, tuhaf bir nesne yatar. Bir yiğit inip tepti; teptikçe büyüdü. Aruz Koca da tepti; mahmuzu dokundu, yığınak yarıldı. İçinden bir oğlan çıktı: gövdesi adam, tepesinde bir gözü var. Aruz onu eteğine sardı: “Hanım, bunu bana verin, oğlum Basat’la besleyeyim.” Bayındır Han, “Senin olsun” dedi.',
    note: 'Mahmuz: çizmenin topuğundaki sivri demir.',
  },
  buyume: {
    text: 'Bir dadı getirdiler. Tepegöz memesini bir sordu, olanca sütünü aldı; iki sordu, kanını aldı; üç sordu, canını aldı. Birkaç dadı getirdiler, hepsini helak etti. Büyüdü, oğlancıklarla oynar oldu; kiminin burnunu, kiminin kulağını yedi. Aruz onu dövdü, sövdü, yasakladı; dinlemedi. Sonunda evinden kovdu.',
  },
  yuzuk: {
    text: 'Tepegöz’ün peri anası geldi, oğlunun parmağına bir yüzük geçirdi: “Oğul, sana ok batmasın, tenini kılıç kesmesin.” Tepegöz Oğuz’dan çıktı, yüce bir dağa vardı. Yol kesti, adam aldı, büyük harami oldu. Çoban çoluk bırakmadı, hepsini yedi; Oğuz’dan da adam yemeye başladı.',
    note: 'Harami: eşkıya.',
  },
  savas: {
    text: 'Oğuz toplanıp üstüne vardı. Ok attılar batmadı, kılıç vurdular kesmedi, süngü sapladılar işlemedi. Tepegöz kızdı; bir ağacı yerinden koparıp attı, elli altmış adamı helak etti. Alplar başı Kazan’a bir darbe vurdu, dünya başına dar oldu. Ak sakallı Aruz Koca’ya kan kusturdu; oğlu Kıyan Selçuk’un ödü yarıldı. Oğuz yedi kez kaçtı; Tepegöz yedi kez önünü alıp yerine getirdi.',
  },
  kesim: {
    text: 'Dedem Korkut’u Tepegöz’e gönderdiler. “Oğul Tepegöz, Oğuz elinde zebun oldu, bunaldı; sana kesim verelim derler” dedi. Tepegöz, “Günde altmış adam verin yemeye” dedi. Dede, “Böyle adam bırakmazsın, tüketirsin. Günde iki adam ile beş yüz koyun verelim” dedi. Tepegöz, “Öyle olsun; iki adam da verin, yemeğimi pişirsin” dedi. Yünlü Koca ile Yapağılı Koca’yı verdiler.',
    note: 'Kesim: haraç. Zebun: güçsüz, yenik.',
  },
  kadin: {
    text: 'Dört oğlu olan birini verdi, üçü kaldı; üçü olan birini verdi, ikisi kaldı. Kapak Kan’ın iki oğlundan biri gitmişti; sıra dönüp yine ona geldi. Anası ağladı, akından yeni dönen Basat’a vardı: “İç Oğuz’da, Dış Oğuz’da adı belli hanım Basat, bana medet! Baban Aruz’a kan kusturdu; kardeşin Kıyan Selçuk’un meydanda ödü yarıldı, can verdi.” Basat’ın gözleri yaşla doldu. Kadına bir tutsak verdi: “Var, oğlunu kurtar.”',
  },
  karar: {
    text: 'Basat, “Beyler, kardeşim uğruna Tepegöz’le buluşurum” dedi. Kazan Bey söyledi: “Kara evren koptu Tepegöz; gök yüzünde çevirdim, alamadım Basat! Kağan aslan koptu Tepegöz; kalın sazlarda çevirdim, alamadım Basat! Ak sakallı babanı ağlatma, ak pürçekli ananı bozlatma!” Babası ağladı: “Oğul, ocağımı ıssız koma, varma.” Basat dinlemedi. Oklarını kuşağına soktu, kılıcını kuşandı, helalleşti.',
    note: 'Evren: ejderha. Pürçek: saç. Bozlatmak: ağlatmak.',
  },
  oklar: {
    text: 'Salahana Kayası’na geldi. Tepegöz arkasını güneşe vermiş yatıyordu. Basat bağrına bir ok attı; ok geçmedi, paralandı. Bir daha attı; o da parça parça oldu. Tepegöz kocalara, “Bu yerin sineği bizi bezdirdi” dedi. Üçüncü okun parçası önüne düşünce sıçradı, Basat’ı gördü, kah kah güldü: “Oğuz’dan yine bize bir turfanda kuzu geldi.” Basat’ı tuttu, çizmesinin koncuna soktu: “Bre kocalar, ikindi vakti bunu çevirin, yiyeyim.”',
    note: 'Konç: çizmenin bacağı saran kısmı. Turfanda: mevsimin ilk ürünü.',
  },
  sis: {
    text: 'Tepegöz yine uyudu. Basat hançeriyle çizmeyi yardı, çıktı. “Bre kocalar, bunun ölümü nedendir?” dedi. “Bilmeyiz; ama gözünden başka yerinde et yoktur” dediler. Basat şişi ocağa koydu, kızdırdı. Adı güzel Muhammed’e salavat getirdi; şişi Tepegöz’ün gözüne öyle bastı ki gözü helak oldu. Tepegöz öyle haykırdı ki dağ taş yankılandı.',
  },
  koc: {
    text: 'Basat sıçradı, mağaraya, koyunların içine düştü. Tepegöz kapıya durdu; bir ayağını bir yana, bir ayağını öbür yana koydu: “Koyun başları erkeçler, bir bir gel geç!” Her gelenin başını yokladı. Basat bir koçu boğazlayıp derisini yüzdü, içine girdi. Tepegöz bildi; boynuzundan sıkı tuttu. Kaldırınca boynuz deriyle elinde kaldı; Basat bacaklarının arasından sıçrayıp çıktı. “Oğlan, kurtuldun mu?” “Tanrım kurtardı.”',
    note: 'Erkeç: teke.',
  },
  hileler: {
    text: 'Tepegöz, “Al şu yüzüğü tak; sana ok, kılıç işlemesin” dedi. Basat taktı. Tepegöz üstüne saldırdı; Basat sıçradı, gördü ki yüzük yine Tepegöz’ün ayağı altında yatar. “Şu kümbette hazinem var; var, mühürle” dedi. Basat girdi; altını görünce kendini unuttu. Tepegöz kapıyı tuttu: “Şöyle vurayım ki kümbetle birlikte darmadağın olasın!” Basat kelime-i şehadet getirdi; kümbet yarıldı, yedi yerden kapı açıldı.',
    note: 'Kümbet: kubbeli yapı.',
  },
  kilic: {
    text: 'Tepegöz, “Sana ölüm yokmuş. Şu mağarada iki kılıç var: biri kınlı, biri kınsız. Kınsız olan keser benim başımı; var, getir” dedi. Basat vardı; kınsız bir kılıç durmadan iner çıkar. “Ben buna tedbirsiz yapışmayayım” dedi. Kendi kılıcını tuttu, iki parça oldu. Bir ağaç tuttu, onu da ikiye biçti. Yayını aldı, kılıcın asılı olduğu zinciri okla vurdu; kılıç yere düşüp gömüldü. Kabzasından sıkı tutup getirdi.',
  },
  agit: {
    text: 'Tepegöz ağladı: “Gözüm, gözüm, yalnız gözüm! Sen yalnız gözle ben Oğuz’u sındırmıştım. Ala gözden ayırdın yiğit beni; tatlı candan ayırsın Kadir seni!” Sonra sordu: “Yiğit, yerin neresidir, adın nedir?” Basat dedi: “Anamın adını sorarsan Kaba Ağaç, atamın adını sorarsan Kağan Aslan; benim adım Aruz oğlu Basat’tır.” Tepegöz, “Öyleyse kardeşiz, kıyma bana!” dedi.',
    note: 'Sındırmak: kırmak, yenmek. Ala: elâ.',
  },
  son: {
    text: 'Basat dedi: “Bre kavat! Ak sakallı babamı ağlatmışsın, karıcık anamı bozlatmışsın, kardeşim Kıyan’ı öldürmüşsün. Kardeşimin kanını almayınca bırakmam!” Tepegöz’ü deve gibi dizi üstüne çökertti; kendi kılıcıyla boynunu vurdu. İki kocayı Oğuz’a müjdeci gönderdi. Dedem Korkut gelip şadılık çaldı, Basat’a alkış verdi: “Erlikle kardeşinin kanını aldın, Kalın Oğuz beylerini bunluktan kurtardın. Kadir Allah yüzünü ak etsin!”',
    note: 'Kavat: ağır bir sövgü. Alkış: övgü, dua. Bunluk: sıkıntı.',
  },
};
