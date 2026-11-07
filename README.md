# Mizan - Kriter ve Guven Dogrulamali Tanisma Uygulamasi

Kullanicilarin inanc, mezhep, cemaat/topluluk, siyasi gorus, tuttugu takim, yaptigi spor, meslek ve iliski sinirlarini acikca secerek kendilerine en uygun kisilerle yuzdelik uyum uzerinden eslestigi tanisma platformu.

## Temel Ozellikler

- **Kapsamli Secenek Havuzu ve Kisiye Gore Acilan Alt Sorular:** Din, mezhep, dini cemaatler, siyasi gorusler, futbol takimlari, spor dallari, meslekler ve sosyal aliskanliklar icin en yaygin secenekler hazir kutucuklar halinde sunulur. Her soruda listede olmayanlar icin `Diger (Kendim Yazacagim)` ve paylasmak istemeyenler icin `Bahsetmek Istemiyorum` secenegi yer alir.
- **Kirmizi Kutucuk (Kesinlikle Birlikte Olmam) Filtresi:** Kullanicilar karsi tarafta kesinlikle istemedikleri siyasi gorusleri, cemaatleri, mezhepleri veya aliskanliklari kirmizi kutucuklarla isaretleyerek o gruptaki adaylari tamamen eleyebilir.
- **Zorunlu Adim Adim Tanitma Akisi:** Sorular atlanamaz; kullanicinin diger soruya gecebilmesi ve eslesme havuzunu gorebilmesi icin sorulari yanitlamasi zorunludur.
- **e-Devlet Barkodlu Sabika Kaydi PDF Analizi:** Yuklenen e-Devlet Adli Sicil PDF belgesinde `ADB` barkodu, `MERNIS` kimlik dogrulamasi, dogum yili/yas kontrolu ve `"YUKARIDA KIMLIK BILGILERI BULUNAN KISININ ADLI SICIL KAYDI YOKTUR."` ibaresi kontrol edilir.
- **KVKK Sozlesmesi ve Turkiye Sunucu Yapisi:** Ozel nitelikli veriler acik riza sozlesmesiyle islenir, PDF belgeleri sunucuda saklanmaz ve iletisim bilgileri yalnizca karsilikli onayda acilir.

## Kurulum

```bash
npm install
npm run dev
```

Derleme:

```bash
npm run build
```
