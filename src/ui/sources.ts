import type { Stage } from '../engine/stage';
import { buildHomeScene } from './home-scene';

/** Kaynaklar sayfası: yazmalar, yararlanılan yayınlar ve uyarlama ilkeleri. */
export function showSources(app: HTMLElement, stage: Stage): () => void {
  stage.clear();
  const tl = buildHomeScene(stage);

  app.innerHTML = `
    <main class="page">
      <a class="back" href="#/">← Hikâyeler</a>
      <div class="kilim" aria-hidden="true"></div>
      <h1>Kaynaklar</h1>
      <p class="lead">Dede Korkut hikâyeleri yüzyıllarca sözlü olarak anlatıldı, sonra yazıya geçirildi. Bu sayfa, sitedeki anlatımların hangi metne dayandığını ve o metne ne ölçüde bağlı kalındığını açıklar.</p>

      <section>
        <h2>Yazmalar</h2>
        <dl>
          <dt>Dresden nüshası</dt>
          <dd><i>Kitâb-ı Dedem Korkut alâ Lisân-ı Tâife-i Oğuzân</i>. Sächsische Landesbibliothek (Dresden), Mscr. Dresd. Ea. 86. Bir giriş ve on iki boy içerir; sitedeki hikâyelerin ana kaynağıdır.</dd>
          <dt>Vatikan nüshası</dt>
          <dd><i>Hikâyet-i Oğuznâme-i Kazan Beg ve Gayrı</i>. Biblioteca Apostolica Vaticana, Vat. turc. 102. Giriş ve altı boy içerir; 1950’de Ettore Rossi tanıtmıştır.</dd>
          <dt>Türkistan / Türkmen Sahra (Günbed) nüshası</dt>
          <dd>2018’de bulunan, 2019’da yayımlanan üçüncü yazma. Soylamalar ile “Salur Kazan’ın Yedi Başlı Ejderhayı Öldürmesi” anlatısını içerir; bu anlatı “on üçüncü boy” olarak da anılır.</dd>
        </dl>
      </section>

      <section>
        <h2>Yararlanılan yayınlar</h2>
        <ul class="refs">
          <li>Muharrem Ergin, <i>Dede Korkut Kitabı I: Giriş, Metin, Faksimile</i>. Ankara: Türk Dil Kurumu, 1958. — <i>II: İndeks, Gramer</i>, 1963.</li>
          <li>Orhan Şaik Gökyay, <i>Dedem Korkudun Kitabı</i>. İstanbul: Millî Eğitim Basımevi, 1973.</li>
          <li>Semih Tezcan – Hendrik Boeschoten, <i>Dede Korkut Oğuznameleri</i>. İstanbul: Yapı Kredi Yayınları, 2001.</li>
          <li>Metin Ekici, <i>Dede Korkut Kitabı Türkistan/Türkmen Sahra Nüshası: Soylamalar ve 13. Boy</i>. İstanbul: Ötüken, 2019.</li>
          <li>Yusuf Azmun, <i>Dede Korkut’un Üçüncü Elyazması</i>. İstanbul: Kutlu Yayınevi, 2019.</li>
          <li>Nasser Khaze Shahgoli ve diğerleri, “Dede Korkut Kitabı’nın Günbet Yazması: İnceleme, Metin, Dizin ve Tıpkıbasım”. <i>Modern Türklük Araştırmaları Dergisi</i> 16/2 (2019): 147–379.</li>
          <li>Geoffrey Lewis (çev.), <i>The Book of Dede Korkut</i>. Harmondsworth: Penguin, 1974.</li>
        </ul>
      </section>

      <section>
        <h2>Hikâyelerin kaynağı</h2>
        <dl>
          <dt>Deli Dumrul</dt>
          <dd>Dresden nüshası, beşinci boy: “Duha Koca Oğlu Deli Dumrul Boyu”. Vatikan nüshasında yer almaz.</dd>
        </dl>
      </section>

      <section>
        <h2>Anlatım ve sahneleme üzerine</h2>
        <p>Buradaki metinler çeviriyazı ya da bilimsel aktarım değildir; özgün metnin günümüz Türkçesiyle kısaltılmış yeniden anlatımıdır. Olay örgüsüne, kişilere ve konuşmaların özüne bağlı kalınır; olay eklenmez, sert ya da rahatsız edici bölümler yumuşatılmaz. Uzun soylamalar kısaltılmış, eskimiş sözcüklerin bir kısmı korunup sahne altında açıklanmıştır. Tam metin için yukarıdaki yayınlara başvurulmalıdır.</p>
        <p>Sahneler birer yorumdur: giysiler, mekânlar ve hareketler metinde ayrıntısıyla anlatılmadığı için tasarlanmıştır. Allah hiçbir sahnede gösterilmez; buyruklar gökten inen ışıkla anlatılır. Bütün görseller kodla üretilir.</p>
      </section>
    </main>`;

  return () => {
    tl.kill();
    stage.clear();
    app.innerHTML = '';
  };
}
