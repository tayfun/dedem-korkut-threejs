import type { SceneText } from '../../engine/story';

/**
 * Kam Püre'nin Oğlu Bamsı Beyrek Boyu — sahne metinleri (Dresden nüshası, üçüncü boy).
 * Boy uzun olduğu için iki bölümdür: `part1` kaçırılışa, `part2` dönüşe dek.
 * Anahtarlar `scenes1.ts` ve `scenes2.ts` içindeki sahne kimlikleriyle eşleşir.
 */
export const part1: Record<string, SceneText> = {
  dilek: {
    text: 'Han Bayındır’ın divanında Pay Püre Bey, sağda solda duran oğulları, kardeşleri gördü; ah edip ağladı: “Oğlum yok, kardeşim yok; tacım tahtım için ağlarım.” Oğuz beyleri yüzlerini göğe tuttu, el kaldırıp dua etti: “Allah Teala sana bir oğul versin.” Pay Piçen Bey kalktı: “Benim için de dua edin, bir kızım olsun; Pay Püre Bey’in oğluna beşik kertmesi yavuklu olsun.” Allah birine oğul, birine kız verdi.',
    note: 'Beşik kertmesi: beşikteyken nişanlanmış. Yavuklu: nişanlı.',
  },
  bezirgan: {
    text: 'Pay Püre Bey bezirgânlarını çağırdı: “Rum eline varın, oğlum büyüyünce ona güzel armağanlar getirin.” Bezirgânlar gece gündüz yol gidip İstanbul’a vardı; bir deniz kulunu boz aygır, bir ak kirişli katı yay, bir altı perli gürz aldılar. Dönüşleri uzun sürdü; oğlan beş yaşına, beş yaşından on beş yaşına girdi. O zamanda bir oğlan baş kesmese, kan dökmese ad koymazlardı.',
    note: 'Bezirgân: tüccar. Deniz kulunu: denizden çıkan aygırın soyundan tay. Per: gürzün dilimi.',
  },
  derbent: {
    text: 'Bezirgânlar Kara Derbent ağzına konmuştu. Evnik Kalesi’nin beş yüz kâfiri üstlerine koyuldu, mallarını yağmaladı. Biri kaçıp Oğuz’un ucuna geldi. Baktı: çayırın üstünde bir alaca çadır; içinde bir güzel yiğit, kırk yiğidiyle oturur. “Yiğit, bana medet! On altı yıldır Oğuz’dan gitmiştik; malımızı kâfir aldı” dedi. Oğlan elindeki altın kadehi yere çaldı: “Atımı, silahımı getirin; beni seven binsin!”',
    note: 'Derbent: dağ geçidi.',
  },
  yardim: {
    text: 'Kâfirler oturmuş, malı paylaşıyordu. Oğlan söz söylemeden kılıç vurdu; baş kaldıranı öldürdü, malı kurtardı. “Yiğit, bize erlik ettin; beğendiğin malı al” dediler. Oğlanın gözü boz aygırı, gürzü, ak kirişli yayı tuttu. Bezirgânlar üzüldü: “Bunlar beyimizin oğlunun emanetidir.” “Beyinizin oğlu kimdir?” “Pay Püre’nin oğlu; adına Bamsı derler.” Oğlan parmağını ısırdı: “Burada minnetle almaktansa babamın yanında minnetsiz alırım” dedi, atını sürüp gitti.',
  },
  ad: {
    text: 'Bezirgânlar geldi, Pay Püre Bey’e selam verdi; ama önce oğlanın elini öptüler. Bey kızdı: “Bre kavatlar, baba dururken oğulun eli mi öpülür?” “Hanım, darılma. Bu senin oğlun olmasaydı malımız gitmişti; baş kesti, kan döktü.” Dedem Korkut’u çağırdılar. “Pay Püre Bey, sen oğlunu ‘Bamsam’ diye okşarsın; bunun adı boz aygırlı Bamsı Beyrek olsun. Adını ben verdim, yaşını Allah versin” dedi.',
  },
  otag: {
    text: 'Beyrek bir gün ava çıktı. Bir geyiği kovalarken yeşil çayıra dikilmiş kırmızı bir otağa geldi. Bu, beşik kertmesi yavuklusu Banı Çiçek’in otağıydı. Banı Çiçek otağdan bakıyordu: “Bre dadılar, bu kavat bize erlik mi gösterir? Varın, av payı dileyin.” Kısırca Yenge vardı, pay diledi. Beyrek, “Ben avcı değilim, bey oğlu beyim; hepsi sizin olsun. Bu otağ kimindir?” dedi. “Pay Piçen Bey’in kızı Banı Çiçek’indir.” Beyrek edeple geri döndü.',
  },
  yaris: {
    text: 'Banı Çiçek yaşmaklanıp geldi: “Yiğit, nereden gelirsin?” “İç Oğuz’dan; Banı Çiçek’i görmeye geldim.” “O öyle kimseye görünecek kız değildir; ben onun dadısıyım. Gel, seninle ava çıkalım. Atın atımı geçerse onun atını da geçersin; okun okumu geçerse onun okunu da geçersin; güreşte beni basarsan onu da basarsın.” Atlandılar; Beyrek’in atı geçti. Ok attılar; Beyrek kızın okunu yardı.',
    note: 'Yaşmaklanmak: yüzünü örtmek.',
  },
  gures: {
    text: 'Güreşe tutuştular. Beyrek kaldırır yere vurmak ister, kız kaldırır yere vurmak ister. Beyrek bunaldı: “Bu kıza basılırsam Kalın Oğuz içinde başıma kakınç, yüzüme tokunç ederler” dedi. Kızın memesinden tuttu; kız korundu. Bu kez ince belinden kavradı, arkası üstüne yere vurdu. Kız, “Yiğit, Pay Piçen’in kızı Banı Çiçek benim” dedi. Beyrek üç öptü, bir dişledi; parmağından altın yüzüğü çıkarıp kızın parmağına geçirdi: “Aramızda bu nişan olsun, han kızı.”',
    note: 'Kakınç, tokunç: başa kakma, ayıplama.',
  },
  karcar: {
    text: 'Babası, “Oğul, o kızın Deli Karçar adında bir kardeşi var; kız dileyeni öldürür” dedi. Dede Korkut’u dünür gönderdiler; Bayındır Han’ın tavlasından iki şahbaz at aldı. Deli Karçar, “Kız kardeşimi dileyeni öldürürüm!” dedi, kılıcıyla üstüne sürdü. Dede kaçtı. Karçar yetişip kılıcı kaldırınca Dede, “Çalarsan elin kurusun!” dedi. Karçar’ın eli yukarıda asılı kaldı. “Medet! Kız kardeşimi vereyim” dedi; Dede dua etti, eli sağaldı.',
    note: 'Dünür: kız istemeye giden kişi. Şahbaz: yiğit, seçkin.',
  },
  baslik: {
    text: 'Karçar başlık istedi: “Bin buğra getirin, dişi deve görmemiş olsun; bin aygır, kısrağa aşmamış olsun; bin koç, koyun görmemiş olsun; bin kuyruksuz kulaksız köpek; bin de pire.” Dede Korkut hepsini getirdi. “Hani pireler?” Dede onu pireli bir ağıla soktu: “Semizini al, zayıfını bırak.” Pireler Karçar’a üşüştü. “Medet dede, kapıyı aç!” “Suya var, kendini suya at.” Karçar kendini suya attı, pirelerden kurtuldu; düğüne razı oldu.',
    note: 'Başlık: gelin için istenen mal. Buğra: erkek deve. Ağıl: çitle çevrili yer.',
  },
  kaftan: {
    text: 'Oğuz’da bir yiğit evlenince ok atar, okunun düştüğü yere gerdek çadırını dikerdi. Beyrek okunu attı, dibine gerdeğini dikti. Banı Çiçek güveylik bir kırmızı kaftan gönderdi; Beyrek giydi. Yoldaşları küstü: “Sen kızıl kaftan giyersin, biz ak kaftan giyeriz.” “Bunun için mi incindiniz? Bugün ben giyeyim, yarın naibim giysin; kırk gün sırayla giyin, sonra bir dervişe verelim” dedi. Kırk yiğidiyle yiyip içip oturdu.',
    note: 'Gerdek: gelinle güveyin ilk gece çadırı. Naip: vekil.',
  },
  baskin: {
    text: 'Kâfirin casusu bunu gördü, Bayburt Hisarı beyine haber verdi: “Pay Piçen Bey sana vereceği kızı Beyrek’e verdi; bu gece gerdeğe girer.” Yedi yüz kâfir gece yarısı bastı. Beyrek uyuyordu; naibi şehit oldu, otuz dokuz yiğidiyle Beyrek tutsak gitti. Sabah gerdek çadırı parçalanmış, kargalar konmuş bulundu. Babası sarığını yere vurdu, anası yüzünü yırttı. Banı Çiçek karalar giydi: “Göz açıp gördüğüm, gönül verip sevdiğim Beyrek!” diye ağladı.',
  },
};

export const part2: Record<string, SceneText> = {
  yalan: {
    text: 'On altı yıl Beyrek’in ölüsünü dirisini bilmediler. Deli Karçar divana geldi: “Beyrek’in dirisi haberini getirene altın akçe veririm; ölüsü haberini getirene kız kardeşimi veririm.” Yalancı oğlu Yaltacuk, “Ben gideyim” dedi. Beyrek ona vaktiyle bir gömlek bağışlamıştı. Gömleği kana batırıp getirdi: “Kara Derbent’te öldürmüşler.” Gömleği Banı Çiçek’e gösterdiler; tanıdı, yakasını yırttı. Yaltacuk küçük düğünü yaptı, büyük düğüne gün koydu.',
  },
  haber: {
    text: 'Pay Püre Bey bezirgânlarını çağırdı: “Varın, Beyrek’in ölüsü dirisi haberini getirin.” Bezirgânlar Bayburt Hisarı’na vardı. O gün kâfirlerin ağır günüydü; Beyrek’e kopuz çaldırıyorlardı. Beyrek yüksek çardaktan bezirgânları gördü, hal hatır sordu: “Ak sakallı babam, ak pürçekli anam sağ mıdır? Yedi kız kardeşim, Banı Çiçek’im ne yapar?” “Sağdır; ama gözleri yolda. Yavuklunu Yalancı oğlu Yaltacuk’a verdiler; yetişmezsen aldırırsın.”',
    note: 'Ağır gün: bayram günü. Pürçek: saç.',
  },
  kale: {
    text: 'Kâfir beyinin bir kızı vardı; her gün Beyrek’i görmeye gelirdi. “Neden üzgünsün hanım yiğit?” dedi. Beyrek, “On altı yıldır babanın tutsağıyım; yavuklumu Yalancı oğlu alıyormuş” dedi. Kız, “Seni hisardan urganla aşağı sarkıtsam, babana anana varsan, gelip beni helallığa alır mısın?” dedi. Beyrek ant içti: “Sağlıkla varır da gelip seni almazsam kılıcıma doğranayım, okuma sancılayım.” Kız urgan getirdi, Beyrek’i hisardan aşağı sarkıttı.',
    note: 'Urgan: kalın ip. Helallığa almak: nikâhla almak.',
  },
  aygir: {
    text: 'Beyrek kâfirin yılkısına geldi. Baktı: deniz kulunu boz aygırı orada otluyor. At Beyrek’i görünce tanıdı; iki ayağının üstüne kalktı, kişnedi. Beyrek atını övdü: “Açık meydana benzer senin alıncığın; iki şebçırağa benzer senin gözceğizin. At demem sana, kardeş derim; kardeşimden yeğ! Başıma iş geldi; yoldaş derim, yoldaşımdan yeğ!” At başını yukarı tuttu, Beyrek’e doğru geldi. Beyrek göğsünü kucakladı, iki gözünü öptü; sıçrayıp bindi.',
    note: 'Yılkı: at sürüsü. Şebçırağ: geceleyin parlayan taş.',
  },
  ozan: {
    text: 'Oğuz’a yaklaşınca bir ozana rastladı. “Nereye gidersin?” “Düğüne; Yalancı oğlu Yaltacuk, Beyrek’in yavuklusunu alıyor.” Beyrek atını emanet bırakıp ozanın kopuzunu aldı. Pınar başında kız kardeşleri “Ağam Beyrek!” diye ağlıyordu. Büyüğü ona Beyrek’in kaftanını verdi; giydi, boyu boyuna uydu. Kız, “Ağam Beyrek’e benzetirim seni” deyince kaftanı çıkarıp attı; eski bir deve çuvalına büründü, kendini deli gibi gösterdi.',
  },
  ok: {
    text: 'Düğünde güveyi ile beyler yüzüğe nişan atıyordu. Beyrek kim atsa “Elin var olsun” dedi; Yaltacuk atınca “Elin kurusun, parmakların çürüsün, hey domuz oğlu domuz!” dedi. Yaltacuk kızdı: “Bre deli, gel benim yayımı çek, yoksa boynunu vururum.” Beyrek yayı çekti, ikiye böldü. Beyrek’in kendi yayını getirdiler. Beyrek yoldaşlarını andı, ağladı; yayı çekti, yüzüğü vurup paraladı. Kazan Bey, “Deli ozan, bugünkü beyliğim senin olsun” dedi.',
  },
  yenge: {
    text: 'Beyrek kazanları tepti, yahniyi sağa sola attı; sonra kadınların otağına geldi: “Evlenen kız kalkıp oynasın, ben kopuz çalayım.” Kısırca Yenge kalktı: “Evlenen kız benim.” Beyrek, “Ant içmişim, kısır kısrağa bindiğim yok; senin adın Kısırca Yenge değil mi?” dedi. Boğazca Fatma kalktı. “Ant içmişim, boğaz kısrağa bindiğim yok. Evinizin ardı derecik, köpeğinizin adı Barak; senin adın kırk oynaşlı Boğazca Fatma değil mi? Var yerine otur.”',
    note: 'Boğaz: gebe. Oynaş: gizli sevgili.',
  },
  yuzuk: {
    text: 'Banı Çiçek kalktı; yüzüğü görünmesin diye elini yeninin içine çekmişti. Beyrek, “Kızıl kaftanın yeninden elini çıkar, oyna” dedi; kız elini çıkarınca yüzüğü gördü, tanıdı. “Beyrek gideli Bam Bam tepeye çıktın mı kız? ‘Ağam Beyrek’ diye ağladın mı? Ben sana altın yüzük vermiştim; ver yüzüğümü!” “Altın yüzük senin değil; onda çok nişan var.” “Seninle güreşip seni basmadım mı? Üç öpüp bir dişlemedim mi? Sevdiğin Bamsı Beyrek ben değil miyim?”',
    note: 'Yen: giysinin kolu.',
  },
  baba: {
    text: 'Kız tanıdı, ayağına düştü; ata binip Beyrek’in babasına anasına müjdeye koştu. Babası ağlamaktan kör olmuştu: “Oğlum olduğunu şundan bileyim: serçe parmağını kanatsın, kanını mendile silsin; gözüme süreyim. Açılırsa oğlum Beyrek’tir.” Beyrek parmağını kanattı; mendili gözüne sürünce Allah’ın kudretiyle gözü açıldı. Babası anası oğlunun ayağına düştü: “Görür gözümün aydını oğul, tutar belimin kuvveti oğul!”',
  },
  saz: {
    text: 'Yalancı oğlu Yaltacuk bunu duyunca Beyrek’in korkusundan kaçtı, Tana Sazı’na girdi. Beyrek ardına düştü, sazı ateşe verdi. Yaltacuk yanmaya başlayınca sazdan çıktı, Beyrek’in ayağına düştü, kılıcının altından geçti. Beyrek suçunu bağışladı.',
    note: 'Saz: sazlık.',
  },
  hisar: {
    text: 'Kazan Bey, “Gel, muradına er” dedi. Beyrek, “Otuz dokuz yoldaşım Bayburt Hisarı’ndayken ben muradıma ermem” dedi. Kalın Oğuz beyleri atlandı, hisara yürüdü. Kâfir karşı çıktı; Oğuz beyleri arı sudan abdest aldı, iki rekât namaz kıldı, adı güzel Muhammed’e salavat getirip at saldı. Kâfiri kırdılar, hisarı aldılar; kilisesini yıkıp yerine mescit yaptılar. Beyrek otuz dokuz yiğidini sağ esen buldu.',
  },
  son: {
    text: 'Beyrek andını tuttu, kâfir beyinin kızını aldı; ak otağına döndü, düğüne başladı. Yiğitlerinin kimine Kazan Bey, kimine Bayındır Han kız verdi; yedi kız kardeşini yedi yiğide verdi. Kırk yerde otağ dikti; her yiğit okunu attı, düştüğü yere gerdeğini kurdu. Beyrek de Banı Çiçek’le gerdeğe girdi, muradına erdi. Dedem Korkut geldi, şadılık çaldı, boy boyladı: “Bu Oğuzname Beyrek’in olsun.”',
    note: 'Şadılık: sevinç havası.',
  },
};
