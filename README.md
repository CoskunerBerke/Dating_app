# Mizan - Kriter ve Guven Dogrulamali Tanisma Uygulamasi

Kullanicilarin inanc, mezhep, cemaat/topluluk, siyasi gorus, tuttugu takim, yaptigi spor, meslek ve iliski sinirlarini acikca secerek kendilerine en uygun kisilerle yuzdelik uyum uzerinden eslestigi tanisma platformu.

## Temel Ozellikler

- **Kapsamli Secenek Havuzu ve Kisiye Gore Acilan Alt Sorular:** Din, mezhep, dini cemaatler, siyasi gorusler, futbol takimlari, spor dallari, meslekler ve sosyal aliskanliklar icin en yaygin secenekler hazir kutucuklar halinde sunulur. Her soruda listede olmayanlar icin `Diger (Kendim Yazacagim)` ve paylasmak istemeyenler icin `Bahsetmek Istemiyorum` secenegi yer alir.
- **Kirmizi Kutucuk (Kesinlikle Birlikte Olmam) Filtresi:** Kullanicilar karsi tarafta kesinlikle istemedikleri siyasi gorusleri, cemaatleri, mezhepleri veya aliskanliklari kirmizi kutucuklarla isaretleyerek o gruptaki adaylari tamamen eleyebilir.
- **Canli e-Devlet Barkod Sorgulama ve Otomatik Profil Kaydi:** e-Devlet Adli Sicil belgesinin sag ustundeki karekodun altinda yer alan barkod numarasi (`ADB...`) ve T.C. Kimlik Numarasi ile canli sorgulama veya PDF analizi yapilir. Sorgu sonucunda adli sicil kaydi olup olmadigi kullanicinin profiline otomatik olarak yazdirilir. Bir adaya ait adli sicil kaydi varsa, karsi tarafin bu kaydi gorup acikca onaylamasi zorunludur.
- **WhatsApp veya Instagram Iletisim Tercihi:** Profil tanitiminin sonunda kullaniciya karsilikli eslesme onaylandiginda WhatsApp uzerinden mi yoksa Instagram uzerinden mi iletisime gecilmesini istedigi sorulur.
- **KVKK Sozlesmesi ve Sifir Veri Sizintisi Mimarisi:** Tum kullanici girdileri XSS ve enjeksiyon saldirilarina karsi temizlenir (`security.ts`), siki HTTP guvenlik basliklari (`CSP`, `HSTS`, `X-Frame-Options`) uygulanir ve T.C. Kimlik Numarasi ya da PDF dosyalari sunucuda asla saklanmaz.

## Kurulum

```bash
npm install
npm run dev
```

Derleme:

```bash
npm run build
```
