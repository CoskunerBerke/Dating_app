# Mizan - Evlilik Uyum ve Dogrulama Havuzu

Klasik kaydirma tabanli flort uygulamalarindan farkli olarak; evlilikte uzun vadeli uyumu belirleyen temel degerler, inanc pratigi, dunya gorusu, aile sinirlari, ekonomik beklentiler ve e-Devlet adli sicil dogrulamasi uzerinden calisan kapali devre eslesme uygulamasi.

## Temel Ozellikler

- **6 Eksenli Deger ve Kirmizi Cizgi Matrisi:** Inanc pratigi, toplumsal kimlik, sosyal sinirlar, ev ekonomisi, kriz yonetimi ve aile duzeni basliklarinda senaryo bazli anket yapisi.
- **Zorlastirilmis Puanlama Algoritmasi:** Agirlikli vektor uzakligi ve kirmizi cizgi (dealbreaker) kurallarina gore adaylari `%90+ (Dogrudan Nikah Adayi)`, `%80-89 (Nisan / Ciddi Yol)` ve `%60-79 (Sans Denenebilir)` esiklerinde siniflandirir.
- **e-Devlet Barkodlu Adli Sicil PDF Analizi:** Kullanicinin yukledigi e-Devlet Adli Sicil PDF belgesini istemci belleginde (RAM) okuyarak `ADB` barkodunu, `MERNIS` kimlik kontrolunu, dogum yili/yas dogrulamasini ve `"YUKARIDA KIMLIK BILGILERI BULUNAN KISININ ADLI SICIL KAYDI YOKTUR."` sonuc blogunu dogrular.
- **6698 Sayili KVKK Madde 6 Uyumu:** Ozel nitelikli veriler (inanc, felsefi gorus, adli sicil durumu) genel aydinlatma metninden ayri acik riza beyaniyla islenir. Yuklenen PDF dosyalari diske kaydedilmez; dogrulama sonrasi bellekten silinerek yalnizca SHA-256 dogrulama ozeti tutulur.
- **Anonim Havuz ve Sifreli Iletisim:** Havuzdaki adaylar `#TR-XXXX` vekil koduyla listelenir. Gercek iletisim bilgileri yalnizca iki taraf da karsilikli onay verdiginde acilir.

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

## Yapilandirma

`.env.example` dosyasini `.env` olarak kopyalayip ortam degiskenlerini duzenleyebilirsiniz. `VITE_PREMIUM_ENABLED` degiskeni erken erisim havuzu doneminde `false` olarak ayarlanmistir.
