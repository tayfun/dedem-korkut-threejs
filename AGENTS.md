# AGENTS.md

Bu depoda çalışan yapay zekâ ajanları ve geliştiriciler için kurallar.

## Proje

Dede Korkut hikâyelerini sade Türkçeyle anlatan, sahneleri Three.js ile prosedürel olarak canlandırılan bir web sitesi. Kapsam, hikâye listesi ve aşamalar için önce `PLAN.md` dosyasını oku.

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

- Bütün görseller kodla üretilir. Hazır 3B model, resim ya da video ekleme.
- Ortak parçalar (insan, at, çadır, arazi, gök, ateş) `src/procedural/` altında durur ve hikâyeler arasında yeniden kullanılır. Bir hikâyeye özel olanlar o hikâyenin klasöründe kalır.
- Stil: low-poly, düz gölgelendirme, sınırlı renk paleti. Yeni renk eklemek yerine ortak paletten seç.
- Telefonlarda akıcı çalışmalı: geometrileri ve malzemeleri paylaş, gereksiz draw call'dan kaçın, sahne değişirken kaynakları `dispose()` et.
- `prefers-reduced-motion` ayarına saygı göster.

## Hikâye Metinleri

- Dil sade ve günlük Türkçe; kısa cümleler. Hedef okur 10 yaş ve üstü.
- Özgün hikâyeye sadık kal: kısalt ve sadeleştir, ama olay ya da karakter uydurma.
- Özel adları koru (Boğaç Han, Banı Çiçek, Salur Kazan). Kültürel sözcükleri (boy, ozan, kopuz, otağ) koru ve ilk geçtiği yerde kısaca açıkla.
- Her sahne 2–4 cümle; her hikâye 8–14 sahne.
- Metin ile animasyon kodu ayrı dosyalarda durur (`story.ts` ve `scenes.ts`).
- Site arayüzü ve hikâye metinleri Türkçedir. Kod içindeki adlar (değişken, fonksiyon, dosya) İngilizce, yorumlar Türkçe ya da İngilizce olabilir.

## Yeni Hikâye Ekleme

1. `src/stories/<hikaye-adi>/` klasörünü aç.
2. `story.ts` içine sahne metinlerini yaz.
3. `scenes.ts` içinde her sahne için `setup` ve `timeline` yaz; önce `src/procedural/` altındaki hazır parçaları kullan.
4. Hikâyeyi `src/stories/index.ts` listesine ekle.
5. Tarayıcıda baştan sona izle; masaüstü ve telefon genişliğinde dene.
6. `PLAN.md`'deki durumu güncelle, commit et, `main`'e push et.

## Doğrulama

- Değişiklikleri tarayıcıda gerçekten çalıştırarak dene; yalnızca derlenmesi yetmez.
- Konsolda hata ya da uyarı bırakma.
