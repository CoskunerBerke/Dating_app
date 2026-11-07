# Mizan - Frekans, Karakter ve Guven Odakli Tanisma Platformu

Yuzeysel kaydirma tabanli uygulamalarin aksine; psikometrik deger uyumu, yasam ritmi, dunya gorusu, iletisim sinirlari ve e-Devlet adli sicil dogrulamasi uzerinden calisan yeni nesil tanisma uygulamasi.

## Temel Ozellikler

- **Psikometrik Kesif ve Dinamik Soru Formatlari:** Schwartz Deger Kurami, Big Five, Baglanma Kurami ve Gottman Iletisim Modellerini temel alan 12 adimli interaktif kesif akisi (`2x2 Bento Matrisi`, `Yatay Frekans Spektrumu`, `Karsilastirmali Kartlar` ve `Senaryo Tepki Olcegi`).
- **Canli Karakter Arketipi Analizi:** Kullanici sorulari yanitladikca gercek zamanli olarak 4 eksenli karakter profilini ve iliski dinamigini cozumler.
- **Kirmizi Cizgi ve Frekans Algoritmasi:** Agirlikli vektor uzakligi ve kirmizi cizgi (dealbreaker) kurallarina gore adaylari `%90+ (Yuksek Kimya)`, `%80-89 (Uzun Vadeli Potansiyel)` ve `%60-79 (Sans Denenebilir)` esiklerinde eslestirir; ortak noktalara gore otomatik ilk mesaj (icebreaker) uretir.
- **e-Devlet Barkodlu Adli Sicil PDF Analizi:** Kullanicinin yukledigi e-Devlet Adli Sicil PDF belgesini istemci belleginde (RAM) okuyarak `ADB` barkodunu, `MERNIS` kimlik kontrolunu, dogum yili/yas dogrulamasini ve `"YUKARIDA KIMLIK BILGILERI BULUNAN KISININ ADLI SICIL KAYDI YOKTUR."` sonuc blogunu dogrular.
- **6698 Sayili KVKK Madde 6 Uyumu:** Ozel nitelikli veriler genel aydinlatma metninden ayri acik riza beyaniyla islenir. Yuklenen PDF dosyalari diske kaydedilmez; dogrulama sonrasi bellekten silinerek yalnizca SHA-256 dogrulama ozeti tutulur.

## Gelistirme Ortami

Bagimliliklari yuklemek ve yerel sunucuyu baslatmak icin:

```bash
npm install
npm run dev
```

Production derlemesi:

```bash
npm run build
```
