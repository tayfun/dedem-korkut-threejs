# Dedem Korkut

Dede Korkut hikâyelerini özgün metne sadık kalarak günümüz Türkçesiyle anlatan, her sahnesi kodla canlandırılan bir web sitesi. Hazır resim ya da video yok: bozkır, çadırlar, hayvanlar ve kişilerin bir bölümü Three.js ile prosedürel olarak çizilir. Hatunlar, bıyıklı beyler ve genç yiğitler, Blender betiğiyle sitenin iskeletine uydurulmuş bir modelden gelir (`tools/fit-model.py`).

## Hikâyeler

| # | Hikâye | Sahne |
|---|--------|-------|
| 1 | Deli Dumrul | 16 |
| 2 | Basat ile Tepegöz | 19 |
| 3 | Boğaç Han | 19 |
| 4 | Bamsı Beyrek (iki bölüm) | 12 + 12 |

Sırada: Kan Turalı, Salur Kazan'ın Evinin Yağmalanması, Salur Kazan ve Yedi Başlı Ejderha, Beyrek'in Ölümü. Yol haritası `PLAN.md` içindedir.

Anlatımlar Dresden nüshasındaki metne dayanan kısaltılmış yeniden anlatımlardır; bilimsel aktarım değildir. Kaynakça ve uyarlama ilkeleri sitede **Kaynaklar** sayfasındadır (`#/kaynaklar`).

## Çalıştırma

Node.js 22 ile:

```bash
npm install
npm run dev       # geliştirme sunucusu (http://localhost:5173)
npm run build     # tip denetimi + üretim derlemesi (dist/)
npm run preview   # derlenmiş siteyi yerelde aç
```

Tek bir sahneyi açmak için adres: `#/hikaye/<slug>/<sahne-no>`, örneğin `#/hikaye/tepegoz/14`.

Okuyucuda klavye: `→` / `Boşluk` ileri, `←` geri, `R` sahneyi yeniden oynat, `Esc` hikâye listesi.

## Yayın

`main` dalına her gönderimde `.github/workflows/deploy.yml` siteyi derleyip GitHub Pages'e yükler. Bunun için depoda bir kez **Settings → Pages → Source: GitHub Actions** seçilmelidir.

## Nasıl kurulu

- **Vite + TypeScript**, arayüz çerçevesi yok.
- **Three.js** sahneleri çizer; **GSAP** sahne zaman çizelgelerini yürütür; **simplex-noise** araziyi üretir.
- Görünüm "canlanan minyatür": köşeli low-poly çevre, çizgi film tarzı karakterler, üstünde mürekkep çizgisi ve kâğıt dokusu.

```
src/
  engine/       sahne altyapısı: stage, direct (yönetmenlik), player, ink
  procedural/   paylaşılan parçalar: gök, arazi, eşyalar, insan, hayvanlar, hazır kişiler
  stories/      her hikâye bir klasör: story.ts (metin), scenes.ts (sahneler), sets.ts (özel mekân ve kişiler)
  ui/           ana sayfa, okuyucu, kaynaklar
tools/shots.mjs sahnelerin ekran görüntüsünü alan araç
```

Her hikâye bir sahne listesidir; her sahne bir metin ve o metne eşlik eden bir `build(stage)` fonksiyonudur. Metin ile animasyon ayrı dosyalarda durur.

Katkı kuralları, kodun ayrıntılı dökümü ve yeni hikâye ekleme adımları `AGENTS.md` içindedir.

## Sahne görüntüsü almak

Geliştirme sunucusu açıkken (Playwright kurulu olmalı):

```bash
node tools/shots.mjs deli-dumrul --at 0.5,1          # bütün sahneler, iki ayrı anda
node tools/shots.mjs tepegoz --scenes 14 --mobile    # tek sahne, telefon genişliğinde
```
