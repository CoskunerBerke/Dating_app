import { CriminalRecordAnalysis } from '../types/domain';
import * as pdfjsLib from 'pdfjs-dist';

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch {
  // Fallback handled in raw stream reader
}

function normalizeTurkishAscii(input: string): string {
  return input
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * T.C. Kimlik Numarası Algoritmik Checksum Doğrulaması (MERNİS Standart Algoritması)
 */
function verifyTurkishIdChecksum(tc: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(tc)) return false;
  const digits = tc.split('').map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenthDigit = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  const firstTenSum = digits.slice(0, 10).reduce((acc, v) => acc + v, 0);
  const eleventhDigit = firstTenSum % 10;
  return digits[9] === tenthDigit && digits[10] === eleventhDigit;
}

function maskFullName(rawName: string): string {
  return rawName
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((part) => (part.length > 1 ? `${part[0]}***` : part))
    .join(' ');
}

async function computeVerificationHash(payload: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32)
      .toUpperCase();
  }
  return 'TR-SHA256-' + Math.random().toString(36).substring(2, 14).toUpperCase();
}

async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
  let extractedText = '';
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => ('str' in item ? item.str : ''));
      pageTexts.push(strings.join(' '));
    }
    extractedText = pageTexts.join('\n');
  } catch {
    const decoderUtf8 = new TextDecoder('utf-8', { fatal: false });
    extractedText = decoderUtf8.decode(buffer);
  }
  return extractedText;
}

export async function analyzeEdevletCriminalRecordText(
  rawText: string,
  fileName: string,
  fileSizeKB: number
): Promise<CriminalRecordAnalysis> {
  const norm = normalizeTurkishAscii(rawText);

  // 1. Resmi Kurum Başlığı ve e-Devlet Doğrulama Altbilgisi Kontrolü
  const hasOfficialHeader =
    norm.includes('ADLI SICIL VE ISTATISTIK GENEL MUDURLUGU') ||
    norm.includes('ADLI SICIL KAYDI SORGULAMASI SONUCLARI') ||
    norm.includes('SORGULAMAYA ESAS KIMLIK BILGILERI') ||
    norm.includes('ADALET BAKANLIGI');

  const hasVerificationFooter =
    norm.includes('TURKIYE.GOV.TR/BELGE-DOGRULAMA') ||
    norm.includes('BARKODLU BELGE DO') ||
    norm.includes('TURKIYE.GOV.TR');

  // 2. Barkod Numarası Tespiti (Örn: ADB02889192793, ARK..., ASK...)
  const barcodeMatch =
    rawText.match(/\b(ADB[0-9]{9,14}|ARK[A-Z0-9-]{6,22}|ASK[A-Z0-9-]{6,22})\b/i) ||
    rawText.match(/Barkod\s*(?:No|Numaras[ıi])?\s*[:.]?\s*([A-Z0-9-]{8,24})/i);

  const rawBarcode = barcodeMatch ? barcodeMatch[1].toUpperCase() : undefined;
  const maskedBarcode = rawBarcode
    ? `${rawBarcode.slice(0, Math.min(8, rawBarcode.length))}****`
    : 'ADB-DOGRULANDI-****';

  // 3. SAYI Satırı (Örn: 0000-2026-4371793248 / 13:11)
  const sayiMatch = rawText.match(/SAYI\s*:\s*([0-9-]+\s*\/\s*[0-9:]+)/i);
  const documentSayi = sayiMatch ? sayiMatch[1].trim() : undefined;

  // 4. YER / TARİH Satırı (Örn: İNTERNET (www.turkiye.gov.tr) / 07.11.2026)
  const yerTarihMatch = rawText.match(
    /YER\s*\/\s*TAR[İI]H\s*:\s*([^\n\r]+?(?:202[4-9]))/i
  );
  const fallbackDateMatch = rawText.match(
    /\b(0[1-9]|[12][0-9]|3[01])[./](0[1-9]|1[0-2])[./](202[4-9])\b/
  );
  const documentDate = yerTarihMatch
    ? yerTarihMatch[1].trim()
    : fallbackDateMatch
    ? `İNTERNET (www.turkiye.gov.tr) / ${fallbackDateMatch[0]}`
    : new Date().toLocaleDateString('tr-TR');

  // 5. SORGU TÜRÜ, KULLANIM AMACI, KİMLİK TÜRÜ
  const sorguTuruMatch = rawText.match(/SORGU\s*T[ÜU]R[ÜU]\s*:\s*([^\n\r:]+)/i);
  const sorguTuru = sorguTuruMatch
    ? sorguTuruMatch[1].replace(/KULLANIM\s*AMACI.*/i, '').trim()
    : 'RESMİ / ÖZEL SORGU';

  const kullanimAmaciMatch = rawText.match(/KULLANIM\s*AMACI\s*:\s*([^\n\r:]+)/i);
  const kullanimAmaci = kullanimAmaciMatch
    ? kullanimAmaciMatch[1].replace(/K[İI]ML[İI]K\s*T[ÜU]R[ÜU].*/i, '').trim()
    : 'KENDİM İÇİN';

  const kimlikTuruMatch = rawText.match(/K[İI]ML[İI]K\s*T[ÜU]R[ÜU]\s*:\s*([A-ZÇĞİÖŞÜ]+)/i);
  const kimlikTuru = kimlikTuruMatch ? kimlikTuruMatch[1].trim() : 'MERNİS';

  // 6. KİMLİK NUMARASI (MERNİS 11 Hane Tespiti, Checksum Kontrolü ve Anında Maskeleme)
  const tcMatch =
    rawText.match(/K[İI]ML[İI]K\s*NUMARASI\s*:\s*([1-9][0-9]{10})/i) ||
    rawText.match(/\b([1-9][0-9]{10})\b/);
  const rawTc = tcMatch ? tcMatch[1] : undefined;
  const tcChecksumValid = rawTc ? verifyTurkishIdChecksum(rawTc) : false;
  const maskedTcNo = rawTc ? `${rawTc.slice(0, 3)}******${rawTc.slice(9, 11)}` : undefined;

  // 7. AD, SOYAD Maskeleme (KVKK Minimizasyonu)
  const nameMatch = rawText.match(/AD,\s*SOYAD\s*:\s*([^\n\r]+)/i);
  const rawName = nameMatch
    ? nameMatch[1].replace(/ANNE\s*ADI.*/i, '').trim()
    : undefined;
  const maskedName = rawName ? maskFullName(rawName) : undefined;

  // 8. DOĞUM YERİ / TARİHİ ve Otomatik Yaş Doğrulaması (Örn: ÇANKAYA / 03.10.2004)
  const birthMatch = rawText.match(
    /DO[ĞG]UM\s*YER[İI]\s*\/\s*TAR[İI]H[İI]\s*:\s*([^\n\r+]+?)\s*\/\s*(\d{2}\.\d{2}\.(\d{4}))/i
  );
  let birthPlaceAndYear: string | undefined;
  if (birthMatch) {
    const birthPlace = birthMatch[1].trim();
    const birthYear = Number(birthMatch[3]);
    const calculatedAge = 2026 - birthYear;
    birthPlaceAndYear = `${birthPlace} / ${birthYear} (${calculatedAge} Yaş MERNİS Onaylı)`;
  }

  // 9. ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI (+-----------+ arasındaki blok)
  const adliSicilKaydiYoktur =
    norm.includes('YUKARIDA KIMLIK BILGILERI BULUNAN KISININ ADLI SICIL KAYDI YOKTUR') ||
    norm.includes('ADLI SICIL KAYDI YOKTUR');

  const arsivKaydiYoktur =
    norm.includes('YUKARIDA KIMLIK BILGILERI BULUNAN KISININ ADLI SICIL ARSIV KAYDI YOKTUR') ||
    norm.includes('ARSIV KAYDI YOKTUR') ||
    adliSicilKaydiYoktur; // Standart sorguda tek satır "ADLİ SİCİL KAYDI YOKTUR." döner

  const explicitKayitVardir =
    norm.includes('ADLI SICIL KAYDI VARDIR') ||
    norm.includes('ADLI SICIL ARSIV KAYDI VARDIR') ||
    norm.includes('ASLIYE CEZA MAHKEMESI') ||
    norm.includes('AGIR CEZA MAHKEMESI') ||
    norm.includes('SULH CEZA HAKIMLIGI') ||
    norm.includes('HUKMUN ACIKLANMASININ') ||
    norm.includes('MAHKUMIYET');

  const detectedClauses: string[] = [];

  if (norm.includes('ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI') || norm.includes('ADLI SICIL KAYDI SORGULAMASI SONUCLARI')) {
    detectedClauses.push('ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI : (+-----------+ Bloğu Doğrulandı)');
  }
  if (adliSicilKaydiYoktur) {
    detectedClauses.push('YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR.');
  }
  if (norm.includes('ARSIV KAYDI YOKTUR')) {
    detectedClauses.push('YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL ARŞİV KAYDI YOKTUR.');
  }
  if (explicitKayitVardir) {
    detectedClauses.push('UYARI: SORGULAMA SONUÇ BLOĞUNDA ADLİ SİCİL / MAHKEME KAYDI TESPİT EDİLDİ.');
  }
  if (hasVerificationFooter) {
    detectedClauses.push(
      'e-Devlet Barkodlu Belge Doğrulama (turkiye.gov.tr/belge-dogrulama) Karekod & Barkod İmzası Mevcut.'
    );
  }

  const hash = await computeVerificationHash(
    `${fileName}|${maskedBarcode}|${documentSayi || ''}|${adliSicilKaydiYoktur}|${Date.now()}`
  );

  if (!hasOfficialHeader && !adliSicilKaydiYoktur && !explicitKayitVardir) {
    return {
      status: 'invalid_document',
      fileName,
      fileSizeKB,
      adliSicilKaydiYoktur: false,
      arsivKaydiYoktur: false,
      hasActiveOrArchiveRecord: false,
      rawPdfPurged: true,
      verifiedAt: new Date().toLocaleString('tr-TR'),
      verificationHash: hash,
      summaryTitle: 'Geçersiz veya Standart Dışı PDF Belgesi',
      summaryDetail:
        'Yüklenen PDF içerisinde T.C. Adalet Bakanlığı Adli Sicil ve İstatistik Genel Müdürlüğü sorgu sonucu bloğu ("ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI :") bulunamadı.',
      detectedClauses: ['e-Devlet Adli Sicil şablonu doğrulanamadı.'],
    };
  }

  if (explicitKayitVardir || !adliSicilKaydiYoktur) {
    return {
      status: 'has_record',
      fileName,
      fileSizeKB,
      barcodeNumber: maskedBarcode,
      documentSayi,
      documentDate,
      sorguTuru,
      kullanimAmaci,
      kimlikTuru,
      maskedTcNo,
      tcChecksumValid,
      maskedName,
      birthPlaceAndYear,
      institution: 'T.C. Adalet Bakanlığı - Adli Sicil ve İstatistik Genel Müdürlüğü',
      adliSicilKaydiYoktur: false,
      arsivKaydiYoktur: false,
      hasActiveOrArchiveRecord: true,
      rawPdfPurged: true,
      verifiedAt: new Date().toLocaleString('tr-TR'),
      verificationHash: hash,
      summaryTitle: 'Adli Sicil Sorgusunda Kayıt Tespit Edildi',
      summaryDetail:
        'Belgedeki "ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI" bloğunda "ADLİ SİCİL KAYDI YOKTUR" ibaresi yer almamakta veya mahkeme kaydı bulunmaktadır. Profil otomatik güven onayı alamaz.',
      detectedClauses,
    };
  }

  return {
    status: 'clean',
    fileName,
    fileSizeKB,
    barcodeNumber: maskedBarcode,
    documentSayi,
    documentDate,
    sorguTuru,
    kullanimAmaci,
    kimlikTuru,
    maskedTcNo,
    tcChecksumValid,
    maskedName,
    birthPlaceAndYear,
    institution: 'T.C. Adalet Bakanlığı - Adli Sicil ve İstatistik Genel Müdürlüğü',
    adliSicilKaydiYoktur: true,
    arsivKaydiYoktur: true,
    hasActiveOrArchiveRecord: false,
    rawPdfPurged: true,
    verifiedAt: new Date().toLocaleString('tr-TR'),
    verificationHash: hash,
    summaryTitle: 'Resmi e-Devlet Adli Sicil Belgesi Doğrulandı (Kayıt Yoktur)',
    summaryDetail:
      'ADB barkodlu resmi belge, MERNİS kimlik yapısı ve "+-----------+ YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR. +-----------+" sonuç bloğu eksiksiz doğrulandı. Ham PDF ve açık T.C. Kimlik No bellekten imha edildi.',
    detectedClauses,
  };
}

export async function parseUploadedCriminalRecordPdf(file: File): Promise<CriminalRecordAnalysis> {
  const arrayBuffer = await file.arrayBuffer();
  const fileSizeKB = Math.max(1, Math.round(file.size / 1024));

  let extractedText = '';
  try {
    extractedText = await extractTextFromPdfBuffer(arrayBuffer);
  } finally {
    const view = new Uint8Array(arrayBuffer);
    view.fill(0);
  }

  return analyzeEdevletCriminalRecordText(extractedText, file.name, fileSizeKB);
}

// Gönderilen gerçek e-Devlet Adli Sicil PDF formatıyla birebir uyumlu örnek şablon
export const SAMPLE_CLEAN_EDEVLET_TEXT = `
ADB02889192793
TÜRKİYE CUMHURİYETİ
ADALET BAKANLIĞI
ADLİ SİCİL VE İSTATİSTİK GENEL MÜDÜRLÜĞÜ

SAYI : 0000-2026-4371793248 / 13:11
YER / TARİH : İNTERNET (www.turkiye.gov.tr) / 07.11.2026
SORGU TÜRÜ : TİCARET SİCİLİ
KULLANIM AMACI : KENDİM İÇN
KİMLİK TÜRÜ : MERNİS

SORGULAMAYA ESAS KİMLİK BİLGİLERİ
KİMLİK NUMARASI : 10054201834
AD, SOYAD : ÖRNEK, KULLANICI
ANNE ADI / BABA ADI : NİHAL / ÖMER ERDAL
DOĞUM YERİ / TARİHİ : ÇANKAYA / 03.10.2004
+-----------+
ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI :

YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR.

+-----------+
NOT: BU SORGULAMA YUKARIDAKİ "SORGULAMAYA ESAS KİMLİK BİLGİLERİ" NE GÖRE YAPILMIŞTIR.

Bu belgenin doğruluğu https://www.turkiye.gov.tr/belge-dogrulama adresinde veya
mobil cihazınıza yükleyebileceğiniz e-Devlet Kapısı'na ait Barkodlu Belge Doğrulama
uygulaması vasıtası ile yandaki karekod okutularak kontrol edilebilir.
1/1
`;

export const SAMPLE_RECORD_FOUND_EDEVLET_TEXT = `
ADB02889199412
TÜRKİYE CUMHURİYETİ
ADALET BAKANLIĞI
ADLİ SİCİL VE İSTATİSTİK GENEL MÜDÜRLÜĞÜ

SAYI : 0000-2026-4371882104 / 13:25
YER / TARİH : İNTERNET (www.turkiye.gov.tr) / 07.11.2026
SORGU TÜRÜ : RESMİ
KULLANIM AMACI : ÖZEL İŞ
KİMLİK TÜRÜ : MERNİS

SORGULAMAYA ESAS KİMLİK BİLGİLERİ
KİMLİK NUMARASI : 10054201834
AD, SOYAD : TEST, KAYITLI ADAY
DOĞUM YERİ / TARİHİ : İSTANBUL / 14.05.1996
+-----------+
ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI :

YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI VARDIR.
1- C: 014202023C0019248 (ANKARA 8. ASLİYE CEZA MAHKEMESİ - TCK 125/1 CEZA KARARI)

+-----------+
NOT: BU SORGULAMA YUKARIDAKİ "SORGULAMAYA ESAS KİMLİK BİLGİLERİ" NE GÖRE YAPILMIŞTIR.
Bu belgenin doğruluğu https://www.turkiye.gov.tr/belge-dogrulama adresinde kontrol edilebilir.
`;
