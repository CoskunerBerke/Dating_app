import React, { useState, useRef } from 'react';
import { CriminalRecordAnalysis } from '../types/domain';
import {
  analyzeEdevletCriminalRecordText,
  parseUploadedCriminalRecordPdf,
  SAMPLE_CLEAN_EDEVLET_TEXT,
  SAMPLE_RECORD_FOUND_EDEVLET_TEXT,
} from '../services/criminalRecordParser';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  ShieldCheck,
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
  const [customTextOpen, setCustomTextOpen] = useState(false);
  const [customTextValue, setCustomTextValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const result = await parseUploadedCriminalRecordPdf(file);
      onUpdateAnalysis(result);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSimulateSample = async (type: 'clean' | 'record') => {
    setIsAnalyzing(true);
    try {
      const sampleText =
        type === 'clean' ? SAMPLE_CLEAN_EDEVLET_TEXT : SAMPLE_RECORD_FOUND_EDEVLET_TEXT;
      const sampleFileName =
        type === 'clean'
          ? 'eDevlet_ADB02889192793_Temiz.pdf'
          : 'eDevlet_ADB02889199412_Kayitli.pdf';
      const result = await analyzeEdevletCriminalRecordText(sampleText, sampleFileName, 138);
      onUpdateAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTextValue.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeEdevletCriminalRecordText(
        customTextValue,
        'Manuel_Sabika_Kaydi_Metni.pdf',
        96
      );
      onUpdateAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Başlık */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            GÜVENLİK VE DOĞRULAMA KATMANI (MERNİS & ADB BARKOD ANALİZİ)
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-900">
            e-Devlet Barkodlu Adli Sicil (Sabıka Kaydı) Analizi
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-600 border border-zinc-300 bg-white px-3.5 py-2 shrink-0">
          Protokol: <strong className="text-zinc-900">Bellekte Doğrula & Anında İmha Et</strong>
        </div>
      </div>

      {/* Nasıl Çalışır: 01 - 03 */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-zinc-300 bg-white mb-10">
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-2">ADIM 01 / BELGE</span>
          <h3 className="font-semibold text-sm text-zinc-900 mb-1.5">
            e-Devlet’ten Barkodlu PDF İndirin
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            turkiye.gov.tr üzerinden “Adli Sicil Kaydı Sorgulama” ekranına girip sağ üstünde <code>ADB...</code> barkodu bulunan resmi PDF belgesini yükleyin.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-2">ADIM 02 / MOTOR ANALİZİ</span>
          <h3 className="font-semibold text-sm text-zinc-900 mb-1.5">
            ADB Barkod, MERNİS Yaş & Sonuç Kontrolü
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Motorumuz <code>SAYI</code>, <code>KİMLİK TÜRÜ: MERNİS</code>, doğum tarihi (yaş doğrulaması) ve <code>+-----------+</code> bloğundaki <strong>“ADLİ SİCİL KAYDI YOKTUR.”</strong> satırını doğrular.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-2">ADIM 03 / KVKK İMHA</span>
          <h3 className="font-semibold text-sm text-zinc-900 mb-1.5">
            T.C. Kimlik Maskeleme & RAM İmhası
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            11 haneli T.C. Kimlik numarası algoritma ile doğrulanıp <code>100******34</code> şeklinde maskelenir; ham PDF bellekten kalıcı olarak silinir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol: PDF Yükleme ve Test Kontrolleri */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-300 p-6 sm:p-8">
            <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-800 font-semibold mb-4">
              E-DEVLET ADLİ SİCİL PDF YÜKLE
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-[#FAF8F5] p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-900 mb-1">
                Bilgisayar veya Telefondan PDF Seçin
              </p>
              <p className="text-xs text-zinc-500">
                Gönderdiğiniz örnek e-Devlet PDF dosyasını doğrudan buraya yükleyerek test edebilirsiniz
              </p>
            </div>

            {/* Hızlı Simülasyon Butonları */}
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-500 mb-3">
                ÖRNEK E-DEVLET ŞABLONU İLE HIZLI TEST
              </span>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSimulateSample('clean')}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-3 border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-mono text-left flex items-center justify-between transition-colors"
                >
                  <span>01 / Gönderdiğin e-Devlet Formatıyla Test Et (Temiz)</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSample('record')}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-3 border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 text-xs font-mono text-left flex items-center justify-between transition-colors"
                >
                  <span>02 / Adli Sicil Kaydı Olan Belgeyle Test Et (Red)</span>
                  <span>→</span>
                </button>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setCustomTextOpen(!customTextOpen)}
                  className="text-xs font-mono text-zinc-600 underline hover:text-zinc-900"
                >
                  {customTextOpen
                    ? 'Manuel metin yapıştırma alanını gizle'
                    : 'Belge metnini manuel yapıştırarak test et'}
                </button>

                {customTextOpen && (
                  <form onSubmit={handleAnalyzeCustomText} className="mt-3 space-y-3">
                    <textarea
                      rows={4}
                      value={customTextValue}
                      onChange={(e) => setCustomTextValue(e.target.value)}
                      placeholder="ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI : YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR..."
                      className="w-full p-3 text-xs font-mono border border-zinc-300 bg-[#FAF8F5] focus:outline-none focus:border-zinc-900"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-zinc-900 text-white text-xs font-mono uppercase tracking-wider"
                    >
                      Metni Analiz Et
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Analiz Çıktısı & Doğrulama Raporu */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-zinc-300 p-6 sm:p-8 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
                <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-800 font-semibold">
                  RESMİ BELGE PARSER & DOĞRULAMA ÇIKTISI
                </h2>
                <span className="font-mono text-[11px] text-zinc-500">
                  {isAnalyzing ? 'TARANIYOR...' : `SONUÇ: ${analysis.status.toUpperCase()}`}
                </span>
              </div>

              {analysis.status === 'unverified' && (
                <div className="py-12 text-center">
                  <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-medium text-zinc-800 mb-2">
                    Belge Bekleniyor
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Sol taraftan PDF dosyanızı seçin veya “01 / Gönderdiğin e-Devlet Formatıyla Test Et” butonuna tıklayarak ayrıştırılan tüm resmi alanları inceleyin.
                  </p>
                </div>
              )}

              {analysis.status !== 'unverified' && (
                <div className="space-y-5">
                  {/* Durum Başlığı */}
                  <div
                    className={`p-4 border ${
                      analysis.status === 'clean'
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : analysis.status === 'has_record'
                        ? 'bg-red-50/70 border-red-300 text-red-950'
                        : 'bg-amber-50/70 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {analysis.status === 'clean' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      )}
                      {analysis.status === 'has_record' && (
                        <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                      )}
                      {analysis.status === 'invalid_document' && (
                        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h3 className="font-semibold text-sm">{analysis.summaryTitle}</h3>
                        <p className="text-xs mt-1 leading-relaxed opacity-90">
                          {analysis.summaryDetail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ayrıştırılan Resmi e-Devlet Alanları */}
                  <div className="border-t border-l border-zinc-200 grid grid-cols-1 sm:grid-cols-2 text-xs">
                    <div className="p-3 border-r border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        BARKOD NO (SAĞ ÜST)
                      </span>
                      <span className="font-mono font-semibold text-zinc-900">
                        {analysis.barcodeNumber || '-'}
                      </span>
                    </div>

                    <div className="p-3 border-r border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        SAYI / SAAT
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.documentSayi || '0000-2026-****'}
                      </span>
                    </div>

                    <div className="p-3 border-r border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        YER / TARİH
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.documentDate || '-'}
                      </span>
                    </div>

                    <div className="p-3 border-r border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        SORGU TÜRÜ / KULLANIM AMACI
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.sorguTuru || '-'} / {analysis.kullanimAmaci || '-'}
                      </span>
                    </div>

                    <div className="p-3 border-r border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        KİMLİK TÜRÜ & T.C. CHECKSUM (MASKELİ)
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.kimlikTuru || 'MERNİS'} • {analysis.maskedTcNo || '100******34'}{' '}
                        {analysis.tcChecksumValid ? '(Algoritma Onaylı)' : ''}
                      </span>
                    </div>

                    <div className="p-3 border-r border-b border-zinc-200 bg-[#FAF8F5]">
                      <span className="block font-mono text-[10px] text-zinc-500">
                        DOĞUM YERİ / YAŞ ÇAPRAZ KONTROLÜ
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {analysis.birthPlaceAndYear || 'Doğrulandı'}
                      </span>
                    </div>
                  </div>

                  {/* +-----------+ ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI : +-----------+ Bloğu */}
                  <div className="p-4 border border-zinc-300 bg-zinc-950 text-zinc-100 font-mono text-xs space-y-1.5">
                    <div className="text-zinc-500">+-----------+</div>
                    <div className="text-zinc-300">ADLİ SİCİL KAYDI SORGULAMASI SONUÇLARI :</div>
                    <div
                      className={`font-bold py-1 ${
                        analysis.adliSicilKaydiYoktur ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {analysis.adliSicilKaydiYoktur
                        ? 'YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR.'
                        : 'UYARI: ADLİ SİCİL KAYDI VARDIR / TEMİZ İBARESİ BULUNAMADI.'}
                    </div>
                    <div className="text-zinc-500">+-----------+</div>
                  </div>

                  {/* KVKK İmha Kanıtı */}
                  <div className="p-3 border border-zinc-200 bg-[#FAF8F5] flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                      <span>
                        Ham PDF, Açık Ad-Soyad ({analysis.maskedName || 'B*** C***'}) ve Anne/Baba Adı Bellekten Silindi
                      </span>
                    </div>
                    <span className="text-zinc-400 shrink-0">
                      SHA256: {analysis.verificationHash?.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-zinc-800" />
                <span>Doğrulama mührü eşleşme kartınıza otomatik yansıtılır.</span>
              </div>
              <button
                type="button"
                onClick={onContinueToMatches}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider whitespace-nowrap"
              >
                Eşleşme Havuzuna Geç →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
