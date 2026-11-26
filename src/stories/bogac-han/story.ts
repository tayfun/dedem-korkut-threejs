import type { SceneText } from '../../engine/story';

/**
 * Dirse Han Oğlu Boğaç Han Boyu — sahne metinleri (Dresden nüshası, birinci boy).
 * Anahtarlar `scenes.ts` içindeki sahne kimlikleriyle eşleşir.
 */
export const texts: Record<string, SceneText> = {
  toy: {
    text: 'Kam Gan oğlu Han Bayındır yılda bir kere toy edip Oğuz beylerini konuklardı. Yine toy etti; attan aygır, deveden buğra, koyundan koç kırdırdı. Bir yere ak otağ, bir yere kızıl otağ, bir yere kara otağ kurdurdu: “Oğlu olanı ak otağa, kızı olanı kızıl otağa kondurun. Oğlu kızı olmayanı kara otağa kondurun; altına kara keçe döşeyin, önüne kara koyun yahnisinden getirin. Yerse yesin, yemezse kalksın gitsin.”',
    note: 'Toy: şölen. Buğra: erkek deve. Otağ: büyük çadır.',
  },
  kara: {
    text: 'Dirse Han derler bir beyin oğlu kızı yoktu. Kırk yiğidiyle toya geldi. Bayındır Han’ın yiğitleri onu kara otağa kondurdular; altına kara keçe döşediler, önüne kara koyun yahnisi getirdiler: “Han’ın buyruğu böyledir. Oğlu kızı olmayanı Tanrı Teala kargamıştır, biz de kargarız.” Dirse Han, “Bayındır Han benim ne eksikliğimi gördü? Kalkın yiğitlerim!” dedi; kalkıp evine gitti.',
    note: 'Kargamak: lanetlemek.',
  },
  hatun: {
    text: 'Hatununa, “Han kızı, bu ayıp senden midir, benden midir?” dedi; öfkelendi. Hatun dedi: “Hey Dirse Han, bana kızma, incinip acı sözler söyleme. Attan aygır, deveden buğra, koyundan koç kırdır. İç Oğuz’un, Dış Oğuz’un beylerini topla. Aç görsen doyur, çıplak görsen donat, borçluyu borcundan kurtar. Tepe gibi et yığ, göl gibi kımız sağdır. Ulu toy eyle, hacet dile; olur ki bir ağzı dualının alkışıyla Tanrı bize bir evlat verir.”',
    note: 'Kımız: kısrak sütünden içki. Hacet: dilek. Alkış: dua.',
  },
  dilek: {
    text: 'Dirse Han hatununun sözüyle ulu toy eyledi, hacet diledi. Açı doyurdu, çıplağı donattı, borçluyu borcundan kurtardı. El kaldırdılar, hacet dilediler. Bir ağzı dualının alkışıyla Allah Teala bir evlat verdi: hatunu gebe kaldı, bir zaman sonra bir oğlan doğurdu. Oğlancığı dadılara verdi, baktırdı. At ayağı külük, ozan dili çevik olur; oğlan on beş yaşına girdi.',
    note: 'Külük: hızlı, çevik.',
  },
  meydan: {
    text: 'Bayındır Han’ın bir boğası vardı; katı taşa boynuz ursa un gibi öğütürdü. Onu yazın ve güzün bir buğra ile savaştırırlar, Oğuz beyleri seyrederdi. Yine bir yaz boğayı saraydan çıkardılar; üç kişi sağından, üç kişi solundan demir zincirle tutmuştu. Meydanın ortasında koyuverdiler. Dirse Han’ın oğlancığı üç oğlanla meydanda aşık oynuyordu. “Kaçın!” dediler. Üç oğlan kaçtı; Dirse Han’ın oğlu kaçmadı.',
    note: 'Aşık: koyun kemiğiyle oynanan oyun.',
  },
  boga: {
    text: 'Boğa oğlanın üstüne sürdü. Oğlan yumruğuyla alnına kıyasıya vurdu; boğa geri geri gitti. Yine geldi; oğlan yumruğunu alnına dayadı, meydanın başına dek sürdü. Bir süre çekiştiler; ne oğlan yener ne boğa. Oğlan düşündü: “Bir dama direk vururlar, o dama destek olur. Ben bunun alnına neden destek olurum?” Yumruğunu çekip yolundan savuldu. Boğa ayak üstünde duramadı, tepesinin üstüne düştü. Oğlan bıçağıyla başını kesti.',
  },
  ad: {
    text: 'Oğuz beyleri oğlanın üstüne toplandı, “Tahsin!” dediler. Dedem Korkut gelsin, bu oğlana ad koysun dediler. Dedem Korkut geldi, oğlanı alıp babasına vardı: “Hey Dirse Han! Oğlana beylik ver, taht ver; erdemlidir. Bayındır Han’ın ak meydanında savaşmış, bir boğa öldürmüş. Senin oğlunun adı Boğaç olsun. Adını ben verdim, yaşını Allah versin.” Dirse Han oğlana beylik verdi, taht verdi.',
    note: 'Tahsin: aferin.',
  },
  iftira: {
    text: 'Oğlan tahta çıktı, babasının kırk yiğidini anmaz oldu. O kırk yiğit haset eyledi: “Gelin, oğlanı babasına kovlayalım; olur ki öldürür.” Yirmisi vardı: “Dirse Han, oğlun kötü koptu. Kırk yiğidini aldı, Kalın Oğuz’un üstüne yürüdü; nerede güzel gördüyse çekip aldı, ak sakallı kocanın ağzına sövdü.” Öbür yirmisi vardı: “Al şarabın keskininden içti, anasıyla sohbet eyledi, atasına kast eyledi.” Dirse Han, “Getirin, öldüreyim” dedi.',
    note: 'Kovlamak: çekiştirmek, iftira etmek. Haset: kıskançlık.',
  },
  av: {
    text: 'Kırk namert dedi: “Biz oğlunu nasıl getirelim? Kalk, ava çık; oğlunu yanına al. Av avlarken oğlunu okla vur, öldür.” Sabah Dirse Han oğlancığını aldı, kırk yiğidiyle ava çıktı. Namertler oğlana, “Baban, ‘Geyikleri kovsun, önüme getirip vursun; ok atışını göreyim, sevineyim’ dedi” dediler. Oğlan geyiği kovup babasının önüne getirdi. Namertler Dirse Han’a döndü: “Görüyor musun, geyiği sana doğru sürüyor; atıp seni vuracak. O seni öldürmeden sen onu öldür.”',
    note: 'Namert: alçak, mert olmayan.',
  },
  ok: {
    text: 'Dirse Han, Dede Korkut’un armağanı katı yayını eline aldı, üzengiye kalkıp kuvvetle çekti. Oğlanı iki küreğinin arasından vurdu. Ok saplandı, alaca kanı şorladı; oğlan atının boynunu kucakladı, yere düştü. Dirse Han oğlancığının üstüne kapanmak istedi; kırk namert bırakmadı. Atının dizginini döndürdü, yurduna gitti.',
    note: 'Şorlamak: fışkırmak.',
  },
  ana: {
    text: 'Hatunu, “Oğlancığımın ilk avıdır” diye attan aygır, deveden buğra, koyundan koç kırdırmıştı. Karşıladı; baktı, iki giden bir geliyor. Yüreği oynadı: “Beri gel, başımın bahtı, evimin tahtı! İki vardın, bir gelirsin, yavrum hani? Oğul haberini ver bana!” Dirse Han ses vermedi. Kırk namert, “Oğlun sağdır, avdadır; bugün yarın gelir” dedi. Hatun dayanmadı; kırk ince belli kızı yanına aldı, atına bindi, oğlunu aramaya gitti.',
  },
  hizir: {
    text: 'Oğlan orada yıkılmış yatarken boz atlı Hızır yanına geldi. Yarasını üç kez eliyle sıvazladı: “Korkma oğlan, sana bu yaradan ölüm yoktur. Dağ çiçeği ile ananın sütü sana merhemdir” dedi, kayboldu.',
    note: 'Hızır: darda kalanın yardımına yetişen ermiş.',
  },
  bulus: {
    text: 'Anası Kazılık Dağı’na vardı. Baktı: oğlancığı al kana bulanmış yatar; karga kuzgun kan görüp üstüne konmak ister, oğlanın iki köpekçiği onları kovar, kondurmaz. Hatun atından indi, oğlunun üstüne kapandı: “Kara kıyma gözlerini uyku almış, aç artık! On iki kemiğin harap olmuş, topla artık! Tanrı’nın verdiği tatlı canın seyranda imiş, tut artık!” Oğlan gözünü açtı: “Ana, ağlama. Bana bu yaradan ölüm yoktur.”',
    note: 'Seyran: gezinti.',
  },
  merhem: {
    text: '“Boz atlı Hızır geldi, yaramı üç kez sıvazladı; ‘Dağ çiçeği ile ananın sütü sana merhemdir’ dedi.” Kırk ince belli kız yayıldı, dağ çiçeği topladı. Anası memesini bir sıktı, sütü gelmedi; iki sıktı, gelmedi; üçüncüde kendine vurdu, kanla karışık süt geldi. Dağ çiçeği ile sütü yarasına sürdüler. Oğlanı ata bindirip otağına götürdüler, hekimlere ısmarladılar; Dirse Han’dan sakladılar. Kırk günde yarası sağaldı.',
  },
  tutsak: {
    text: 'Oğlan ata biner, kılıç kuşanır oldu. Kırk namert bunu duydu: “Dirse Han oğlunu görürse bizi hep kırar. Gelin, Dirse Han’ı tutalım, ak ellerini ardına bağlayalım, kıl sicimi ak boynuna takalım, alıp kâfir ellerine yönelelim.” Tuttular; ak ellerini ardına bağladılar, kıl sicimi boynuna taktılar, ak etinden kan çıkıncaya dek dövdüler. Dirse Han yayan, bunlar atlı yürüdüler.',
  },
  kurtar: {
    text: 'Hatun bunu duydu, oğlancığına karşı vardı: “Görüyor musun ay oğul, neler oldu? Sarp kayalar oynamadı, yer oynadı; elde yağı yokken senin babanın üstüne yağı geldi. Babanın o kırk namert yoldaşı babanı tuttu, kâfir ellerine yöneldi. Kalk, kırk yiğidini yanına al, babanı o kırk namertten kurtar. Baban sana kıydıysa sen babana kıyma!” Oğlan anasının sözünü kırmadı; kılıcını kuşandı, kırk yiğidiyle babasının ardınca gitti.',
    note: 'Yağı: düşman.',
  },
  kopuz: {
    text: 'Namertler bir yere konmuş, al şarap içiyorlardı. Boğaç Han çıkageldi. Dirse Han onu tanımadı: “Bu gelen yiğit nasıl yiğittir bilmem. Elim kolum çözün, kopuzumu verin; o yiğidi döndüreyim. İster beni öldürün, ister bırakın.” Kopuzunu aldı, söyledi: “Boynu uzun bedevi atlar giderse benim gider; kaytabanda develer giderse benim gider. Yiğit, sen bu savaşı bırak! Benim bir oğlum vardı, öldürdüm; günahı benim boynuma.”',
    note: 'Bedevi at: soylu Arap atı. Kaytaban: deve sürüsü.',
  },
  kavga: {
    text: 'Oğlan dedi: “Boynu uzun bedevi atlar senin gider; benim de içinde bineğim var, komam kırk namerde! Ak sakallı baban varsa sorsun seni; ben de aklı şaşmış, bilgisi yitmiş bir babayı komam kırk namerde!” Kırk yiğidine el edip işaret verdi. At tepip üşüştüler. Kiminin boynunu vurdu, kimini tutsak eyledi; babasını kurtardı, dönüp geldi.',
  },
  son: {
    text: 'Dirse Han oğlunun sağ olduğunu burada bildi. Hanlar hanı Bayındır oğlana beylik verdi, taht verdi. Dedem Korkut gelip boy boyladı, soy soyladı, bu Oğuznameyi düzdü, koştu: “Onlar da bu dünyaya geldi geçti; kervan gibi kondu göçtü. Onları da ecel aldı, yer gizledi; fani dünya yine kaldı. Yom vereyim hanım: yerli kara dağların yıkılmasın, gölgeli ulu ağacın kesilmesin.”',
    note: 'Oğuzname: Oğuz destanı. Yom: hayır dua.',
  },
};
