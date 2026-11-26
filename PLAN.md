# Dedem Korkut — Proje Planı

Dede Korkut hikâyelerini yetişkin okura, özgün metne sadık kalarak günümüz Türkçesiyle anlatan, her sahnesi kodla (Three.js) canlandırılan bir web sitesi.

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

- Hedef okur yetişkinlerdir. Özgün metne sadık kalınır: olay eklenmez, sert bölümler yumuşatılmaz.
- Günümüz Türkçesi, sade ve akıcı; özgün söyleyiş ve ritim korunur, soylamalar kısaltılır.
- Eskimiş sözcükler metinde kalır, sahne altındaki notta açıklanır.
- Her hikâye 8–20 sahneye bölünür; bir sahne en çok 450 karakter kadardır.
- Her hikâye Dede Korkut'un gelip boy boylaması ve dua etmesiyle biter; bu kalıp korunur.
- Dayanak: Dresden nüshası. Kaynakça ve uyarlama ilkeleri sitede `#/kaynaklar` sayfasındadır.

## 4. Teknik Yapı

- **Vite** + **TypeScript** — derleme ve geliştirme sunucusu.
- **Three.js** — sahne, kamera, ışık, prosedürel geometri.
- **GSAP** — sahne zaman çizelgeleri ve geçişler.
- **simplex-noise** — arazi, rüzgâr, ateş gibi doğal hareketler.
- Çerçeve (React vb.) yok; arayüz düz HTML/CSS.
- Yayın: GitHub Pages (GitHub Actions ile `main`'den otomatik).

### Klasör yapısı

```
src/
  main.ts              giriş, yönlendirme
  engine/              sahne altyapısı: stage, direct (yönetmenlik), player, story, ink
  procedural/          paylaşılan parçalar
    palette.ts           renkler ve malzemeler
    sky.ts terrain.ts    gök ve arazi
    life.ts props.ts     ot/toz/duman/kuş; çadır, ateş, eşyalar
    sets.ts              ortak mekânlar
    human.ts head.ts face.ts   insan figürü, baş, çizilmiş yüz
    animals.ts cast.ts   hayvanlar; hazır kişiler
  stories/
    index.ts             hikâye listesi (başlık, kapak, kaynak)
    deli-dumrul/
      story.ts             sahne metinleri
      scenes.ts            sahnelerin 3B kurulumu ve animasyonu
      sets.ts              hikâyeye özel mekânlar ve kişiler
  ui/                  ana sayfa, okuyucu, kaynaklar
  styles/
tools/shots.mjs        sahne görüntüsü aracı
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

Modüllerin ayrıntılı dökümü `AGENTS.md` içindeki "Kodun Düzeni" tablosundadır. Adres yapısı: `#/hikaye/<slug>/<sahne-no>`.

## 5. Görsel Dil

- "Canlanan minyatür": köşeli low-poly çevre ve çizgi film tarzı karakterler; üstünde mürekkep çizgisi, kâğıt dokusu ve kenar kararması.
- Katmanlı arka plan: uzakta ufka doğru solan üç dağ sırası, yassı minyatür bulutları, ışınlı güneş ya da hilal.
- Karakterler çizgi film tarzındadır: uzun ve ince, tek parça esneyen gövde, iri gözler, basamaklı gölge; kaş ve ağızla değişen yüz ifadeleri, göz kırpma.
- Figürler eklemlidir (dirsek, diz); bıyık, sakal, örgü, pelerin ve kilim desenli şeritlerle ayrışır.
- Zemin canlıdır: rüzgârda sallanan otlar, ayak altında toz, ateşten duman ve kıvılcım, gökte kuşlar.
- Ana sayfada tezhip çerçevesi; her hikâyenin kapağı kendi sahnesinden çekilen bir karedir.
- Sınırlı, ortak renk paleti; kilim motifleri arayüzde ve giysilerde yinelenir.
- `prefers-reduced-motion` açıksa animasyonlar sadeleşir.

## 6. Aşamalar

1. ✅ **Temel** — Vite + TypeScript + Three.js kurulumu, GitHub Pages iş akışı.
2. ✅ **Motor** — sahne yöneticisi, zaman çizelgesi, ileri/geri gezinme, metin paneli.
3. ✅ **Prosedürel kütüphane** — arazi, gök, insan figürü, at, kuş, çadır, ateş.
4. ✅ **İlk hikâye: Deli Dumrul** — 16 sahne.
5. ✅ **Ana sayfa ve Kaynaklar sayfası** — hikâye listesi, kapak sahnesi, kaynakça.
6. 🔶 **Kalan hikâyeler** — tablodaki sırayla, her biri ayrı ayrı. ✅ Basat ile Tepegöz (19 sahne). ✅ Boğaç Han (19 sahne). ✅ Bamsı Beyrek (iki bölüm, 12 + 12 sahne). Sıradaki: Kan Turalı.
7. ✅ **Görsel cila** — minyatür görünümü, katmanlı arka plan, eklemli figürler, canlı zemin, kapaklar ve tezhip çerçevesi.
8. ⬜ **Son cila** — gerçek telefonda performans ölçümü, erişilebilirlik, ses (isteğe bağlı), paylaşım kartları.

Her aşama sonunda site çalışır durumda olmalı ve `main`'e gönderilmelidir.

## 7. Kararlar

- Gezinme: düğme ve klavye (← → Boşluk, R: yeniden oynat, Esc: liste). Kaydırmayla ilerleme sonraya bırakıldı.
- Ses ve seslendirme: ilk sürümde yok.
- Dil: yalnızca Türkçe; metinler ayrı dosyada durduğu için ikinci dil sonradan eklenebilir.
