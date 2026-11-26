# Dedem Korkut — Proje Planı

Dede Korkut hikâyelerini sade bir Türkçeyle anlatan, her sahnesi kodla (Three.js) canlandırılan bir web sitesi.

## 1. Hedef

- Ziyaretçi bir hikâye seçer, hikâye sahne sahne ilerler.
- Her sahnede kısa, sade bir metin ve o metne eşlik eden prosedürel bir 3B animasyon bulunur.
- Hazır model, video ya da resim yok: bütün görseller kodla üretilir.
- Telefon ve masaüstünde akıcı çalışır.

## 2. Seçilen Hikâyeler

Dede Korkut Kitabı'ndaki on iki boy ile 2018'de bulunan on üçüncü boy arasından, hem anlatı hem de görsel açıdan en güçlü sekiz hikâye seçildi. Sıra, yapım sırasıdır.

| # | Hikâye | Kısa özet | Neden ilginç / görsel fırsat |
|---|--------|-----------|------------------------------|
| 1 | **Deli Dumrul** | Kuru çayın üstüne köprü kurup geçenden de geçmeyenden de para alan Dumrul, Azrail'e kafa tutar. Canı yerine can bulması gerekir; anası babası vermez, eşi verir. | Kısa, tek mekânlı, güçlü bir sonu var. Köprü, kuru çay, kanatlı Azrail. İlk yapılacak hikâye için ideal. |
| 2 | **Basat'ın Tepegöz'ü Öldürmesi** | Aslanların büyüttüğü Basat, Oğuz'u haraca bağlayan tek gözlü devi mağarasında alt eder. | Dev, mağara, koyun postuna bürünüp kaçış. En "masalsı" ve çocukların en sevdiği boy. |
| 3 | **Dirse Han Oğlu Boğaç Han** | Boğayı yumruğuyla yenen genç ad alır. Kırk namert babasını ona düşman eder; annesinin sütü ve dağ çiçeği yarasını iyileştirir. | Boğa güreşi, ak-kızıl-kara çadırlar, av sahnesi. Kitabın açılış boyu. |
| 4 | **Bamsı Beyrek** | Beyrek düğün gecesi kaçırılır, on altı yıl tutsak kalır. Döndüğünde nişanlısı Banı Çiçek başkasıyla evlendirilmek üzeredir; ozan kılığında düğüne girer. | En uzun ve en sevilen boy. At yarışı, ok atma, güreş, kale, kılık değiştirme. |
| 5 | **Kan Turalı** | Kan Turalı, Selcen Hatun'la evlenmek için boğa, aslan ve deveyi yener. Dönüş yolunda onu düşmandan Selcen kurtarır. | Üç canavarla üç dövüş ve savaşçı bir kadın kahraman. |
| 6 | **Salur Kazan'ın Evinin Yağmalanması** | Kazan avdayken yurdu basılır, ailesi tutsak edilir. Çoban Karaca'nın yardımıyla ailesini kurtarır. | Çobanın sapanı, Burla Hatun'un direnişi, büyük bir baskın. |
| 7 | **Salur Kazan'ın Yedi Başlı Ejderhayı Öldürmesi** | Kazan avda yedi başlı ejderhayla karşılaşır ve onu öldürür. | 2018'de bulunan "on üçüncü boy". Yedi başlı ejderha prosedürel animasyon için çok uygun. |
| 8 | **İç Oğuz'a Dış Oğuz'un Asi Olması ve Beyrek'in Ölümü** | Oğuz boyları birbirine düşer, Beyrek dayısı Aruz'un hilesiyle öldürülür. | Kitabın hüzünlü kapanışı; birliğin bozulması. Beyrek hikâyesinin devamı. |

**Yedekler (sonraki aşama):** Uşun Koca Oğlu Segrek, Begil Oğlu Emren, Kazan Bey Oğlu Uruz'un Tutsak Olması.

## 3. Anlatım Dili

- Kısa cümleler, günlük Türkçe. Hedef okur: 10 yaş ve üstü herkes.
- Eski sözcükler sadeleştirilir; özel adlar ve kültürel sözcükler (boy, ozan, kopuz, otağ) korunur ve ilk geçtiği yerde açıklanır.
- Her hikâye 8–14 sahneye bölünür; her sahne 2–4 cümledir.
- Her hikâye Dede Korkut'un gelip ad vermesi ya da dua etmesiyle biter; bu kalıp korunur.
- Metinler özgün metne sadık kalır; olay uydurulmaz, yalnızca kısaltılır ve sadeleştirilir.

## 4. Teknik Yapı

- **Vite** + **TypeScript** — derleme ve geliştirme sunucusu.
- **Three.js** — sahne, kamera, ışık, prosedürel geometri.
- **GSAP** — sahne zaman çizelgeleri ve geçişler.
- **simplex-noise** — arazi, rüzgâr, ateş gibi doğal hareketler.
- Çerçeve (React vb.) yok; arayüz düz HTML/CSS.
- Yayın: GitHub Pages (GitHub Actions ile `main`'den otomatik).

### Klasör yapısı (hedef)

```
src/
  main.ts              giriş, yönlendirme
  engine/              ortak sahne altyapısı (renderer, kamera, döngü, zaman çizelgesi)
  procedural/          yeniden kullanılan parçalar: insan, at, çadır, arazi, gök, ağaç, ateş
  stories/
    index.ts           hikâye listesi
    deli-dumrul/
      story.ts         sahne metinleri (Türkçe)
      scenes.ts        her sahnenin 3B kurulumu ve animasyonu
      sets.ts          hikâyeye özel mekânlar ve kişiler
  ui/                  ana sayfa, hikâye okuyucu, ileri/geri düğmeleri
  styles/
```

### Hikâye veri modeli

Her hikâye, metni ve animasyonu eşleştiren bir sahne listesidir. Metinler `story.ts`, sahne kurulumları `scenes.ts` içinde durur ve sahne kimliğiyle (`id`) eşleşir:

```ts
interface SceneText { text: string; note?: string }   // note: eski sözcük açıklaması
interface SceneDef {
  id: string;
  build(stage: Stage): gsap.core.Timeline;             // nesneleri kurar, animasyonu döndürür
}
```

Metin ile kod ayrı dosyalarda durur; böylece metin, koda dokunmadan düzeltilebilir.

### Motorun parçaları

- `engine/stage.ts` — renderer, kamera, kare döngüsü; `Mover` (yürüyen figür tabanı), zemine basma.
- `engine/direct.ts` — yönetmen yardımcıları: `place`, `walkTo`, `faceTo`, `turn`, `cam`, `shakeHead`.
- `engine/player.ts` — hikâyeyi sahne sahne oynatır.
- `procedural/world.ts` — gök, arazi, çadır, ateş, flama, ışık hüzmesi, kılıç, kopuz.
- `procedural/figures.ts` — insan, at, kuş; hazır kılıklar (Dede Korkut, Azrail).
- Adres yapısı: `#/hikaye/<slug>/<sahne-no>`.

## 5. Görsel Dil

- Low-poly, düz gölgelendirmeli (flat shading) stilize figürler; minyatür ve kilim sanatından esinlenen sınırlı renk paleti.
- Karakterler basit geometrilerden (kapsül, koni, kutu) kurulur; kimlikleri renk ve başlıkla ayrılır.
- Bozkır, dağ, çadır (otağ), at, ateş ve gökyüzü ortak kütüphaneden gelir.
- Kilim motifleri sayfa süslemelerinde ve sahne geçişlerinde kullanılır.
- `prefers-reduced-motion` açıksa animasyonlar sadeleşir.

## 6. Aşamalar

1. ✅ **Temel** — Vite + TypeScript + Three.js kurulumu, GitHub Pages iş akışı.
2. ✅ **Motor** — sahne yöneticisi, zaman çizelgesi, ileri/geri gezinme, metin paneli.
3. ✅ **Prosedürel kütüphane** — arazi, gök, insan figürü, at, kuş, çadır, ateş.
4. ✅ **İlk hikâye: Deli Dumrul** — 13 sahne.
5. ✅ **Ana sayfa** — hikâye listesi, kapak sahnesi, Dede Korkut tanıtımı.
6. ⬜ **Kalan hikâyeler** — tablodaki sırayla, her biri ayrı ayrı. Sıradaki: Basat ile Tepegöz.
7. ⬜ **Cila** — mobil performans, erişilebilirlik, ses (kopuz ezgisi, isteğe bağlı), paylaşım kartları.

Her aşama sonunda site çalışır durumda olmalı ve `main`'e gönderilmelidir.

## 7. Kararlar

- Gezinme: düğme ve klavye (← → Boşluk, R: yeniden oynat, Esc: liste). Kaydırmayla ilerleme sonraya bırakıldı.
- Ses ve seslendirme: ilk sürümde yok.
- Dil: yalnızca Türkçe; metinler ayrı dosyada durduğu için ikinci dil sonradan eklenebilir.
