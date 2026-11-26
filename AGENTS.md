# AGENTS.md

Bu depoda çalışan yapay zekâ ajanları ve geliştiriciler için kurallar.

## Proje

Dede Korkut hikâyelerini yetişkin okura, özgün metne sadık kalarak günümüz Türkçesiyle anlatan, sahneleri Three.js ile prosedürel olarak canlandırılan bir web sitesi. Kapsam, hikâye listesi ve aşamalar için önce `PLAN.md` dosyasını oku.

## Git

- **Her zaman `main` dalında çalış, commit et ve push et.** Ayrı dal ya da pull request açma.
- Her anlamlı adımdan sonra commit et ve hemen `git push origin main` yap.
- Commit mesajları kısa ve açıklayıcı olsun.
- Push'tan önce derlemenin (`npm run build`) geçtiğinden emin ol; `main` her zaman çalışır durumda kalmalı.

## Teknoloji

- Vite + TypeScript, Three.js, GSAP, simplex-noise.
- Arayüz çerçevesi (React, Vue vb.) kullanma; düz HTML/CSS yeterli.
- Yeni bağımlılık eklemeden önce gerçekten gerekli mi diye düşün; eklersen `PLAN.md`'deki listeyi güncelle.

## Kodun Düzeni

Yeni bir hikâye yazarken önce buradaki hazır parçaları kullan; yalnızca o hikâyeye özel olanı hikâyenin kendi klasörüne koy. Bir parça ikinci bir hikâyede de gerekirse ortak modüle taşı.

| Yer | İçinde ne var |
|-----|---------------|
| `src/engine/stage.ts` | Renderer, kamera, kare döngüsü; `Mover` (yürüyen her şeyin tabanı), `keepClear`, `snapshot`. |
| `src/engine/direct.ts` | Yönetmenlik: `place`, `walkTo`, `faceTo`, `turn`, `cam`, `pop`, `vanish`, `toss`, `mood`, `plead`, `raiseArms`, `armsDown`, `kneelDown`, `standUp`, `shakeHead`, `grieve`, `sway`, `launch` (ok, taş), `fall`. |
| `src/engine/player.ts`, `story.ts`, `ink.ts` | Sahne oynatıcı, hikâye tipleri, mürekkep çizgisi geçişi. |
| `src/procedural/palette.ts` | Renkler (`P`), malzemeler (`mat`, `toon`, `glow`, `kilim`), `rng`, `mesh`. |
| `src/procedural/sky.ts`, `terrain.ts`, `life.ts` | Gök, dağ sıraları, bulut; arazi ve serpiştirme; ot, toz, duman, kuş sürüsü. |
| `src/procedural/props.ts` | Çadır, ateş, flama, ışık hüzmesi, akçe, kılıç, topuz, kopuz, yay, ok, şiş, yüzük, değnek. |
| `src/procedural/sets.ts` | Ortak mekânlar: `steppeSet`, `placeTent`, `reeds` (sazlık). |
| `src/procedural/human.ts`, `head.ts`, `face.ts` | İnsan figürü, yontulmuş baş, çizilmiş yüz. |
| `src/procedural/animals.ts` | `Horse`, `Lion`, `Sheep`, `Beast` (boğa, geyik, köpek), `Bird`; yeni hayvanlar buraya. |
| `src/procedural/model.ts` | Hazır modeller: yükleme (`loadModels`), bölge haritasından renklendirme (`modelMaterial`). |
| `models/`, `src/models/` | Meshy'den gelen ham GLB'ler ve `tools/fit-model.py` ile işlenmiş, sitenin yüklediği GLB'ler. |
| `src/procedural/cast.ts` | Hazır kişiler: `dedeKorkut`, `villager(i)`, `warrior`, `lady`, `elderMan`, `elderWoman`, `child`; `mounted` (atlı), `archer` (yaylı), `armed` (kılıçlı). |
| `src/stories/<slug>/` | `story.ts` (metin), `scenes.ts` (sahneler), `sets.ts` (o hikâyeye özel mekân ve kişiler), `index.ts`. |
| `tools/shots.mjs` | Sahnelerin ekran görüntüsünü alan araç. |
| `tools/fit-model.py` | Ham modeli Human iskeletine uyduran Blender betiği. |

## Görseller

- Görseller kodla üretilir. Hazır resim ya da video ekleme. Kodla çizilen dokular (`kilim()` gibi canvas dokuları) serbesttir. Tek istisna aşağıda anlatılan hazır modellerdir; onların dışında hazır 3B model ekleme.
- Hazır modeller: bir kişi (gövde, baş, saç, başlık) Meshy'de üretilmiş bir modelden gelebilir (`HumanOpts.model`; `lady()` bunu kendisi verir). Modelin yüzü dokuya işlidir: `setMood`, göz kırpma, `hat`, `eyes` ve `blush` bu kişilerde etkisizdir; duyguyu duruş ve jestle anlat. Baş `head` kemiğine bağlıdır, `head.rotation` çalışır. Model yüklenemezse kişi kodla kurulur.
  - Ham dosya `models/<ad>.glb` içinde durur: Meshy'de A duruşu, Mixamo iskeleti, parmak kemiksiz, silahsız ve eşyasız üretilir.
  - `blender -b --python tools/fit-model.py -- models/<ad>.glb src/models/<ad>.glb` ham dosyayı işler: omuz yüksekliğine göre ölçekler, üçgen sayısını düşürür (`tris=9000`; yüz korunur), kolları Human duruşuna indirir, ağırlıkları Human'ın kemiklerine (dokuz gövde kemiği ve `head`) toplar ve dokuyu bölge haritasına çevirir. Başı kodla kurmak istersen `neck=1.53` başı boyundan keser.
  - Bölge haritası renk taşımaz: kaftan, şerit, ten, saç, şalvar, çizme, kemer, maden, yüz çizgileri, ak ve taş bölgelerini taşır. Renkler çalışma anında `robe`, `trim`, `skin`, `hair` seçeneklerinden ve paletten verilir; aynı model her kişide başka renkte giyilir.
  - Şimdiki modeller: `koylu` (`villager()`: erkek köylüler; başörtülü kadın köylüler kodla kurulur); `hatun` (`lady()`); `han`, `bey` ve `yigit` (`warrior()`: sakallıda `han`, börklü ve bıyıklıda `bey`, börklü ve bıyıksızda `yigit`; sakalsız kalpaklılar kodla kurulur). `han` modelinde sakal ve saç `beard` rengini alır. Başlığın tepesi modelde ayrı bir renkteyse (lacivert) `hatColor` ile boyanır.
  - Yeni model eklerken `model.ts` içindeki `URLS` tablosuna ekle. Modelin özgün renkleri farklıysa ham dosyanın yanına `models/<ad>.json` koy: `"ref.robe": "39737a"` gibi satırlar başvuru rengini değiştirir, `"none"` o sınıfı kaldırır, `"belt"` bel kuşağının sınıfını verir, `"sleeves": "robe"` kollara taşmış şerit boyasını temizler (örnek: `models/common-steppe-guardian.json`). Betiği değiştirince bütün modelleri yeniden üret ve bak.
- Görünüm "canlanan minyatür"dür: köşeli low-poly çevre, çizgi film tarzı karakterler, sınırlı palet; üstüne mürekkep çizgisi, kâğıt dokusu ve kenar kararması (`src/engine/ink.ts`). Yeni renk eklemek yerine ortak paletten (`P`) seç.
- Mürekkep çizgisi almaması gereken nesneleri (alev, ışık hüzmesi, yıldız, ot, duman) `noInk()` ile işaretle.
- İnsanlar çizgi film tarzındadır: uzun ve ince gövde, iri gözler, yuvarlak hatlar, basamaklı gölge (`toon()` malzemesi). Çevre ise köşeli low-poly kalır; karakterler bu sayede öne çıkar. Yeni kişi ve hayvanları da `toon()` ile, yuvarlak geometrilerle (küre, kapsül, lathe) kur.
- İnsanın gövdesi tek parça, kemiklere bağlı bir yüzeydir (`bodyGeometry`, `SkinnedMesh`): kaftan, kollar ve bacaklar tek geometride durur, eklemler bükülünce yüzey esner, etek uyluklarla birlikte kalkar. Kemikler, sahnelerin oynattığı gruplarla aynıdır: kollar `armL/armR` (dirsek kendiliğinden bükülür), bacaklar `legL/legR`, dizler `kneeL/kneeR`. Gövdeye yeni katı parça eklemek yerine halkaları (`Ring`) değiştir; ölçüler `human.ts` başındaki sabitlerdedir (`HIP`, `SHOULDER_Y`, `HEAD_K` …). Gövde biçimi yüz tipine göre `BUILDS` tablosundan gelir (erkek geniş omuzlu, kadın ince belli ve geniş etekli, yaşlı dolgun); etek ucuna doğru kıvrımlıdır. Saç `addHair` içinde kurulur: saç kütlesi, perçem, favori; başı açık kadınlarda omuza dökülen saç, başörtülülerde örgü. Kadın karakterlerde `face: 'woman'` ver (`lady()` bunu kendisi verir). Oturma ve diz çökme için `sit()`, `kneel()` ve `KNEEL_Y`, `KNEEL_KNEE` değerlerini kullan.
- Baş küre değildir: `headPoint()` ile yontulur (çene, burun, elmacık kemiği, göz çukuru).
- Yüz 2B çizilir (`src/procedural/face.ts`): göz, kaş, bıyık ve ağız eğrilerle bir tuvale çizilip başa giydirilir. Yüz tipleri: `man`, `woman`, `child`, `elder`, `grim`, `cyclops`; yeni bir tip gerekiyorsa `KINDS` tablosuna ekle. Yüze 3B parça (göz, ağız) ekleme; sakal ve kulak dışında her şey çizimdir.
- Yüz ifadesi anlatımın parçasıdır: her sahnede kişilere `setMood('neutral' | 'happy' | 'smug' | 'angry' | 'sad' | 'fear')` ver; sahne içinde değişecekse `tl.call(() => kisi.setMood(...), [], zaman)` kullan.
- Çadır, ateş, kilim gibi zemine oturan her şey için `stage.keepClear(x, z, r)` çağır; yoksa içinden ot çıkar.
- Telefonlarda akıcı çalışmalı: geometrileri ve malzemeleri paylaş, gereksiz draw call'dan kaçın, sahne değişirken kaynakları `dispose()` et. Sahne her karede iki kez çizilir (renk + çizgi geçişi); ağır sahnelerden kaçın.
- `prefers-reduced-motion` ayarına saygı göster.

## Hikâye Metinleri

- Hedef okur yetişkinlerdir. Özgün hikâyeye sadık kal: olay, kişi ya da konuşma uydurma; sert, kaba ya da rahatsız edici bölümleri yumuşatma ve atlama.
- Dil günümüz Türkçesi, sade ve akıcı; ama özgün metnin söyleyişini ve ritmini koru ("dünya şirin, can aziz", "boy boyladı, soy soyladı"). Soylamaları kısaltabilirsin, özünü ve imgelerini koru.
- Özel adları koru (Boğaç Han, Banı Çiçek, Salur Kazan). Eskimiş ya da kültürel sözcükleri (kavat, görklü, yumuş oğlanı, otağ) metinde bırak ve sahnenin `note` alanında açıkla.
- Metnin temeli Dresden nüshasıdır (Ergin ve Gökyay yayınları). Emin olmadığın bir ayrıntıyı ekleme; kaynağa bakılamıyorsa bunu kullanıcıya söyle.
- Her sahne en çok 450 karakter kadar olsun (telefonda panel ekranın yarısını geçmesin); uzun bölümleri iki sahneye böl. Her hikâye 8–20 sahne; daha uzun boyları bölümlere ayır (örnek: `bamsi-beyrek/` iki bölüm, tek klasör); bölümün `Story.next` alanı son sahnedeki düğmeyi sonraki bölüme bağlar.
- Metin ile animasyon kodu ayrı dosyalarda durur (`story.ts` ve `scenes.ts`).
- Sahneleme metinle çelişmemeli; metinde olmayan bir olayı animasyonla da ekleme.
- Allah hiçbir sahnede gösterilmez; ilahî buyruk ışıkla anlatılır.
- Site arayüzü ve hikâye metinleri Türkçedir. Kod içindeki adlar (değişken, fonksiyon, dosya) İngilizce, yorumlar Türkçe ya da İngilizce olabilir.

## Kaynaklar

- Kaynaklar sayfası `src/ui/sources.ts` içindedir (`#/kaynaklar`).
- "Hikâyelerin kaynağı" bölümü `src/stories/index.ts` içindeki `source` alanlarından üretilir; yeni hikâyede bu alanı doldur.
- Kaynakça bilgisini (yazar, yayınevi, yıl) doğrulamadan ekleme.

## Yeni Hikâye Ekleme

1. `src/stories/<hikaye-adi>/` klasörünü aç.
2. `story.ts` içine sahne metinlerini yaz.
3. Hikâyeye özel mekânları ve kişileri `sets.ts` içinde kur; kişileri `cast.ts` yardımcılarından türet (ör. `warrior({ robe: P.teal })`).
4. `scenes.ts` içinde her sahne için `build(stage)` yaz: nesneleri kurar, GSAP zaman çizelgesini döndürür. Jestler ve geçişler için `src/engine/direct.ts` yardımcılarını kullan; örnek için `src/stories/deli-dumrul/` klasörüne bak.
5. Hikâyeyi `src/stories/index.ts` listesine ekle: `load`, `cover` (ana sayfadaki kapak karesi) ve `source` (Kaynaklar sayfasında görünen nüsha ve boy bilgisi).
6. Tarayıcıda baştan sona izle; masaüstü ve telefon genişliğinde dene.
7. `PLAN.md`'deki durumu güncelle, commit et, `main`'e push et.

## Doğrulama

- Değişiklikleri tarayıcıda gerçekten çalıştırarak dene; yalnızca derlenmesi yetmez.
- Konsolda hata ya da uyarı bırakma.
- Geliştirme sunucusu: `npm run dev`. Tek bir sahneyi açmak için `#/hikaye/<slug>/<sahne-no>` adresini kullan.
- Ekran görüntüsü: sunucu açıkken `node tools/shots.mjs <slug> --at 0.5,1` bütün sahneleri `shots/` klasörüne çeker; `--scenes`, `--mobile` ve yakın çekim için `--cam x,y,z --look x,y,z` seçenekleri var. Konsol hatalarını da yazar.
- Metin paneli ekranın altını kapatır; kamerayı, olay panelin üstünde kalacak biçimde kur. Telefon genişliğinde (390 piksel) de bak.
- Bir figürün yüzü `+z` yönüne bakar; `rotation.y = Math.atan2(dx, dz)` onu bir hedefe çevirir.
