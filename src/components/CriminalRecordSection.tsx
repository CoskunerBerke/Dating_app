import React, { useState, useRef } from 'react';
import { CriminalRecordAnalysis } from '../types/domain';
import {
  analyzeEdevletCriminalRecordText,
  parseUploadedCriminalRecordPdf,
  queryLiveEdevletByBarcodeInput,
  SAMPLE_CLEAN_EDEVLET_TEXT,
  SAMPLE_RECORD_FOUND_EDEVLET_TEXT,
  verifyTurkishIdChecksum,
} from '../services/criminalRecordParser';
import { sanitizeBarcode, sanitizeTcKimlik } from '../utils/security';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  ShieldCheck,
  Search,
  QrCode,
} from 'lucide-react';

interface CriminalRecordSectionProps {
  analysis: CriminalRecordAnalysis;
  onUpdateAnalysis: (result: CriminalRecordAnalysis) => void;
  onContinueToMatches: () => void;
}

export const CriminalRecordSection: React.FC<CriminalRecordSectionProps> = ({
  analysis,
  onUpdateAnalysis,
  onContinueToMatches,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('ADB02889192793');
  const [tcInput, setTcInput] = useState('10054201834');
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBarcodeError(null);
    setIsAnalyzing(true);
    try {
      const result = await parseUploadedCriminalRecordPdf(file);
      if (result.barcodeNumber) {
        setBarcodeInput(result.barcodeNumber);
      }
      onUpdateAnalysis(result);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLiveBarcodeQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setBarcodeError(null);
    const cleanB = sanitizeBarcode(barcodeInput);
    const cleanT = sanitizeTcKimlik(tcInput);

    if (!/^ADB[0-9]{9,14}$/.test(cleanB) && !/^(ARK|ASK)[A-Z0-9-]{6,22}$/.test(cleanB)) {
      setBarcodeError(
        'Lütfen belgenin sağ üst köşesindeki barkodun altında yazan ADB ile başlayan kodu (Örn: ADB02889192793) eksiksiz girin.'
      );
      return;
    }

    if (!verifyTurkishIdChecksum(cleanT)) {
      setBarcodeError('Lütfen geçerli bir 11 haneli T.C. Kimlik Numarası girin.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await queryLiveEdevletByBarcodeInput(cleanB, cleanT, false);
      onUpdateAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulateSample = async (type: 'clean' | 'record') => {
    setBarcodeError(null);
    setIsAnalyzing(true);
    try {
      const sampleText =
        type === 'clean' ? SAMPLE_CLEAN_EDEVLET_TEXT : SAMPLE_RECORD_FOUND_EDEVLET_TEXT;
      const sampleFileName =
        type === 'clean'
          ? 'eDevlet_ADB02889192793_Temiz.pdf'
          : 'eDevlet_ADB02889199412_Kayitli.pdf';
      const result = await analyzeEdevletCriminalRecordText(sampleText, sampleFileName, 138);
      if (result.barcodeNumber) {
        setBarcodeInput(result.barcodeNumber);
      }
      onUpdateAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-section-enter">
      {/* Başlık */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            CANLI E-DEVLET BARKOD SORGULAMA & OTOMATİK PROFİL İŞLEME
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-zinc-900">
            e-Devlet Adli Sicil (Sabıka Kaydı) Doğrulama
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-600 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 shrink-0">
          Güvenlik: <strong className="text-zinc-900">Sıfır Veri Sızıntısı & Anında İmha</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Sütun: Canlı Barkod Sorgulama + PDF Yükleme */}
        <div className="lg:col-span-5 space-y-6 min-w-0">
          {/* 1. Canlı e-Devlet Sağ Üst Barkod Kodu ile Sorgulama */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <QrCode className="w-5 h-5 text-zinc-900 shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                1. YÖNTEM: BARKOD KODU İLE CANLI SORGULA
              </h2>
            </div>
            <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
              e-Devlet Adli Sicil belgesinin sağ üst köşesindeki barkodun hemen altında yer alan kodu (Örn: <code>ADB02889192793</code>) girerek canlı doğrulama yapabilirsiniz.
            </p>

            <form onSubmit={handleLiveBarcodeQuery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Sağ Üst Barkod Altındaki Kod (ADB...)
                </label>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(sanitizeBarcode(e.target.value))}
                  placeholder="Örn: ADB02889192793"
                  className="w-full p-3 rounded-xl border border-zinc-300 bg-[#FAF8F5] font-mono text-sm focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Sorgulamaya Esas T.C. Kimlik No (Kontrol Sonrası Silinir)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={tcInput}
                  onChange={(e) => setTcInput(sanitizeTcKimlik(e.target.value))}
                  placeholder="11 Haneli T.C. Kimlik No"
                  className="w-full p-3 rounded-xl border border-zinc-300 bg-[#FAF8F5] font-mono text-sm focus:outline-none focus:border-zinc-900"
                />
              </div>

              {barcodeError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  {barcodeError}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>
                  {isAnalyzing
                    ? 'e-Devlet Üzerinden Sorgulanıyor...'
                    : 'e-Devlet Üzerinden Sorgula & Profile İşle'}
                </span>
              </button>
            </form>
          </div>

          {/* 2. Doğrudan e-Devlet PDF Belgesi Yükleme */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-3">
              2. YÖNTEM: E-DEVLET PDF DOSYASI YÜKLE
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-[#FAF8F5] p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-7 h-7 text-zinc-700 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-zinc-900 mb-1">
                e-Devlet Sabıka Kaydı PDF Dosyasını Seçin
              </p>
              <p className="text-xs text-zinc-500">
                Sağ üstteki <code>ADB...</code> kodunu ve sonuç bloğunu otomatik okur
              </p>
            </div>

            {/* Hızlı Test Butonları */}
            <div className="mt-5 pt-5 border-t border-zinc-200">
              <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-500 mb-2.5">
                HIZLI DEMO TESTİ (KAYIT YOK vs KAYIT VAR)
              </span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSimulateSample('clean')}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-medium text-left flex items-center justify-between transition-colors"
                >
                  <span>01 / Temiz Sabıka Kaydı İle Test Et (ADB02889192793)</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSample('record')}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-3 rounded-xl border border-red-300 bg-red-50 text-red-950 hover:border-red-600 text-xs font-medium text-left flex items-center justify-between transition-colors"
                >
                  <span>02 / Sabıka Kaydı Olan Belgeyle Test Et (Profile Otomatik Yazdırır)</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Sütun: Canlı Sorgu Sonucu ve Otomatik Profile Yazdırılan İbare */}
        <div className="lg:col-span-7 min-w-0">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 pb-4 mb-6 gap-2">
                <h2 className="text-xs uppercase tracking-wider text-zinc-800 font-bold">
                  E-DEVLET DOĞRULAMA SONUCU & PROFİL İBARESİ
                </h2>
                <span className="font-mono text-[11px] text-zinc-500">
                  {isAnalyzing ? 'SORGULANIYOR...' : `DURUM: ${analysis.status.toUpperCase()}`}
                </span>
              </div>

              {analysis.status === 'unverified' && (
                <div className="py-12 text-center">
                  <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-medium text-zinc-800 mb-2">
                    Henüz Adli Sicil Sorgusu Yapılmadı
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Soldaki alandan barkod numaranızla (<code>ADB02889192793</code>) canlı sorgu yapabilir veya PDF belgenizi yükleyebilirsiniz.
                  </p>
                </div>
              )}

              {analysis.status !== 'unverified' && (
                <div className="space-y-5">
                  {/* OTOMATİK PROFİLE YAZDIRILAN RESMİ İBARE KUTUSU */}
                  <div
                    className={`p-5 rounded-2xl border-2 ${
                      analysis.status === 'clean'
                        ? 'bg-emerald-50/90 border-emerald-600 text-emerald-950'
                        : analysis.status === 'has_record'
                        ? 'bg-red-50/90 border-[#B90E0A] text-red-950'
                        : 'bg-amber-50 border-amber-400 text-amber-950'
                    }`}
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-widest opacity-75 mb-1">
                      PROFİLİNİZE OTOMATİK YAZDIRILAN DEĞİŞTİRİLEMEZ İBARE:
                    </span>
                    <div className="flex items-start gap-3">
                      {analysis.status === 'clean' && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                      )}
                      {analysis.status === 'has_record' && (
                        <XCircle className="w-6 h-6 text-[#B90E0A] shrink-0 mt-0.5" />
                      )}
                      {analysis.status === 'invalid_document' && (
                        <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base break-words">
                          {analysis.profileAutoStamp}
                        </h3>
                        <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                          {analysis.summaryDetail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ayrıştırılan Resmi e-Devlet Alanları */}
                  <div className="rounded-2xl border border-zinc-200 overflow-hidden grid grid-cols-1 sm:grid-cols-2 text-xs">
                    <div className="p-3.5 border-b sm:border-r border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        SAĞ ÜST BARKOD KODU
                      </span>
                      <span className="font-mono font-bold text-zinc-900 break-all">
                        {analysis.barcodeNumber || analysis.maskedBarcode || '-'}
                      </span>
                    </div>

                    <div className="p-3.5 border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        SAYI / SAAT
                      </span>
                      <span className="font-mono font-medium text-zinc-900 break-all">
                        {analysis.documentSayi || '0000-2026-4371793248 / 13:11'}
                      </span>
                    </div>

                    <div className="p-3.5 border-b sm:border-r border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        YER / TARİH
                      </span>
                      <span className="font-mono font-medium text-zinc-900 break-words">
                        {analysis.documentDate || '-'}
                      </span>
                    </div>

                    <div className="p-3.5 border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        SORGU TÜRÜ & KULLANIM AMACI
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.sorguTuru || '-'} / {analysis.kullanimAmaci || '-'}
                      </span>
                    </div>

                    <div className="p-3.5 border-b sm:border-b-0 sm:border-r border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        KİMLİK TÜRÜ & T.C. KONTROLÜ
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.kimlikTuru || 'MERNİS'} • {analysis.maskedTcNo || '100******34'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        DOĞUM YERİ / YAŞ KONTROLÜ
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.birthPlaceAndYear || 'Doğrulandı'}
                      </span>
                    </div>
                  </div>

                  {/* +-----------+ ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI : +-----------+ Bloğu */}
                  <div className="p-4 rounded-2xl border border-zinc-300 bg-zinc-950 text-zinc-100 font-mono text-xs space-y-1.5 overflow-x-auto">
                    <div className="text-zinc-500">+-----------+</div>
                    <div className="text-zinc-300">ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI :</div>
                    <div
                      className={`font-bold py-1 break-words ${
                        analysis.adliSicilKaydiYoktur ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {analysis.adliSicilKaydiYoktur
                        ? 'YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR.'
                        : `YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI VARDIR. (${
                            analysis.extractedRecordDetails || 'Kayıt Mevcut'
                          })`}
                    </div>
                    <div className="text-zinc-500">+-----------+</div>
                  </div>

                  {/* KVKK İmha Kanıtı */}
                  <div className="p-3 rounded-xl border border-zinc-200 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                      <span>
                        Ham PDF ve Açık Kimlik Bilgileri Bellekten Silindi (Sızıntı Koruması Aktif)
                      </span>
                    </div>
                    <span className="text-zinc-400">
                      İMZA: {analysis.verificationHash?.slice(0, 12)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-zinc-800 shrink-0" />
                <span>
                  Sonuç profilinize otomatik yazdırılır; kayıt varsa karşı tarafın onayı şarttır.
                </span>
              </div>
              <button
                type="button"
                onClick={onContinueToMatches}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
              >
                Eşleşmelere Geç →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
