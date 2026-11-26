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

## Görseller

- Bütün görseller kodla üretilir. Hazır 3B model, resim ya da video ekleme. Kodla çizilen dokular (`kilim()` gibi canvas dokuları) serbesttir.
- Görünüm "canlanan minyatür"dür: köşeli low-poly çevre, çizgi film tarzı karakterler, sınırlı palet; üstüne mürekkep çizgisi, kâğıt dokusu ve kenar kararması (`src/engine/ink.ts`). Yeni renk eklemek yerine ortak paletten (`P`) seç.
- Mürekkep çizgisi almaması gereken nesneleri (alev, ışık hüzmesi, yıldız, ot, duman) `noInk()` ile işaretle.
- Ortak parçalar `src/procedural/` altında durur ve hikâyeler arasında yeniden kullanılır: `world.ts` (gök, dağ sıraları, bulut, arazi, çadır, ateş, eşyalar), `figures.ts` (insan, at, kuş), `life.ts` (ot, toz, duman, kuş sürüsü). Bir hikâyeye özel olanlar o hikâyenin `sets.ts` dosyasında kalır.
- İnsanlar çizgi film tarzındadır: iri baş, iri gözler, yuvarlak hatlar, basamaklı gölge (`toon()` malzemesi). Çevre ise köşeli low-poly kalır; karakterler bu sayede öne çıkar. Yeni kişi ve hayvanları da `toon()` ile, yuvarlak geometrilerle (küre, kapsül, lathe) kur.
- İnsan figürü eklemlidir: kollar `armL/armR` (dirsek kendiliğinden bükülür), bacaklar `legL/legR`, dizler `kneeL/kneeR`. Oturma ve diz çökme için `sit()`, `kneel()` ve `KNEEL_Y`, `KNEEL_KNEE` değerlerini kullan.
- Baş küre değildir: `headPoint()` ile yontulur (çene, burun, elmacık kemiği, göz çukuru).
- Yüz 2B çizilir (`src/procedural/face.ts`): göz, kaş, bıyık ve ağız eğrilerle bir tuvale çizilip başa giydirilir. Yüz tipleri: `man`, `woman`, `child`, `elder`, `grim`; yeni bir tip gerekiyorsa `KINDS` tablosuna ekle. Yüze 3B parça (göz, ağız) ekleme; sakal ve kulak dışında her şey çizimdir.
- Yüz ifadesi anlatımın parçasıdır: her sahnede kişilere `setMood('neutral' | 'happy' | 'smug' | 'angry' | 'sad' | 'fear')` ver; sahne içinde değişecekse `tl.call(() => kisi.setMood(...), [], zaman)` kullan.
- Çadır, ateş, kilim gibi zemine oturan her şey için `stage.keepClear(x, z, r)` çağır; yoksa içinden ot çıkar.
- Telefonlarda akıcı çalışmalı: geometrileri ve malzemeleri paylaş, gereksiz draw call'dan kaçın, sahne değişirken kaynakları `dispose()` et. Sahne her karede iki kez çizilir (renk + çizgi geçişi); ağır sahnelerden kaçın.
- `prefers-reduced-motion` ayarına saygı göster.

## Hikâye Metinleri

- Hedef okur yetişkinlerdir. Özgün hikâyeye sadık kal: olay, kişi ya da konuşma uydurma; sert, kaba ya da rahatsız edici bölümleri yumuşatma ve atlama.
- Dil günümüz Türkçesi, sade ve akıcı; ama özgün metnin söyleyişini ve ritmini koru ("dünya şirin, can aziz", "boy boyladı, soy soyladı"). Soylamaları kısaltabilirsin, özünü ve imgelerini koru.
- Özel adları koru (Boğaç Han, Banı Çiçek, Salur Kazan). Eskimiş ya da kültürel sözcükleri (kavat, görklü, yumuş oğlanı, otağ) metinde bırak ve sahnenin `note` alanında açıkla.
- Metnin temeli Dresden nüshasıdır (Ergin ve Gökyay yayınları). Emin olmadığın bir ayrıntıyı ekleme; kaynağa bakılamıyorsa bunu kullanıcıya söyle.
- Her sahne en çok 450 karakter kadar olsun (telefonda panel ekranın yarısını geçmesin); uzun bölümleri iki sahneye böl. Her hikâye 8–18 sahne.
- Metin ile animasyon kodu ayrı dosyalarda durur (`story.ts` ve `scenes.ts`).
- Sahneleme metinle çelişmemeli; metinde olmayan bir olayı animasyonla da ekleme.
- Allah hiçbir sahnede gösterilmez; ilahî buyruk ışıkla anlatılır.
- Site arayüzü ve hikâye metinleri Türkçedir. Kod içindeki adlar (değişken, fonksiyon, dosya) İngilizce, yorumlar Türkçe ya da İngilizce olabilir.

## Kaynaklar

- Kaynaklar sayfası `src/ui/sources.ts` içindedir (`#/kaynaklar`).
- Yeni hikâye eklerken "Hikâyelerin kaynağı" bölümüne hangi nüshanın kaçıncı boyu olduğunu yaz.
- Kaynakça bilgisini (yazar, yayınevi, yıl) doğrulamadan ekleme.

## Yeni Hikâye Ekleme

1. `src/stories/<hikaye-adi>/` klasörünü aç.
2. `story.ts` içine sahne metinlerini yaz.
3. `scenes.ts` içinde her sahne için `build(stage)` yaz: nesneleri kurar, GSAP zaman çizelgesini döndürür. Önce `src/procedural/` altındaki hazır parçaları ve `src/engine/direct.ts` yardımcılarını kullan; örnek için `src/stories/deli-dumrul/` klasörüne bak.
4. Hikâyeyi `src/stories/index.ts` listesine ekle; `cover` alanıyla ana sayfadaki kapak karesini seç (sahne sırası ve zaman çizelgesinin anı).
5. Tarayıcıda baştan sona izle; masaüstü ve telefon genişliğinde dene.
6. `PLAN.md`'deki durumu güncelle, commit et, `main`'e push et.

## Doğrulama

- Değişiklikleri tarayıcıda gerçekten çalıştırarak dene; yalnızca derlenmesi yetmez.
- Konsolda hata ya da uyarı bırakma.
- Geliştirme sunucusu: `npm run dev`. Tek bir sahneyi açmak için `#/hikaye/<slug>/<sahne-no>` adresini kullan.
- Metin paneli ekranın altını kapatır; kamerayı, olay panelin üstünde kalacak biçimde kur. Telefon genişliğinde (390 piksel) de bak.
- Bir figürün yüzü `+z` yönüne bakar; `rotation.y = Math.atan2(dx, dz)` onu bir hedefe çevirir.
