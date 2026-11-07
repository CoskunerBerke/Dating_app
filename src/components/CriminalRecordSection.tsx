import React, { useState, useRef } from 'react';
import { CriminalRecordAnalysis } from '../types/domain';
import {
  createNotUploadedCriminalRecordState,
  parseUploadedCriminalRecordPdf,
  queryLiveEdevletByBarcodeInput,
  verifyTurkishIdChecksum,
} from '../services/criminalRecordParser';
import { sanitizeBarcode, sanitizeTcKimlik } from '../utils/security';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ArrowRight,
  FileWarning,
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
        'Lütfen belgenin sağ üstündeki barkod kodunu (Örn: ADB02889192793) girin.'
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

  const handleSkipWithoutUploading = () => {
    const notUploadedState = createNotUploadedCriminalRecordState();
    onUpdateAnalysis(notUploadedState);
    onContinueToMatches();
  };

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-section-enter">
      <div className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-zinc-100 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6E45]">
            ADIM 3 / 3 • SON ADIM
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-0.5">
            Adli Sicil Belgeni Yükle
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-relaxed">
            e-Devlet’ten aldığın Adli Sicil PDF belgesini yüklediğinde profilinde{' '}
            <strong className="text-[#0F6E45]">"Adli Sicil Belgesi: Yüklendi"</strong> yazar ve PDF belgen okunduktan hemen sonra RAM'den kalıcı olarak silinir. Yüklemeden geçersen eşleştiğin kişilerin ekranında{' '}
            <strong className="text-amber-800">"Adli Sicil Belgesi: Yüklenmedi"</strong> ibaresi görünür.
          </p>
        </div>

        {/* Mevcut Durum Göstergesi */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            analysis.uploaded
              ? 'bg-[#E6F4EC] border-emerald-300 text-[#0F6E45]'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            {analysis.uploaded ? (
              <ShieldCheck className="w-5 h-5 shrink-0" />
            ) : (
              <FileWarning className="w-5 h-5 shrink-0" />
            )}
            <span>
              Profil Durumun:{' '}
              {analysis.uploaded
                ? 'Adli Sicil Belgesi: Yüklendi'
                : 'Adli Sicil Belgesi: Yüklenmedi'}
            </span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/80">
            {analysis.uploaded ? 'Doğrulandı' : 'Bekleniyor'}
          </span>
        </div>

        {/* 1. PDF Yükleme Kutusu */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-zinc-300 hover:border-[#0F6E45] bg-[#FAF8F5] p-6 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-7 h-7 text-[#0F6E45] mx-auto mb-2" />
          <p className="text-sm font-bold text-zinc-900">
            e-Devlet Adli Sicil PDF Belgeni Seç ve Yükle
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Sağ üstteki <code>ADB...</code> barkod kodunu ve sonucu otomatik doğrulayıp dosyayı imha eder
          </p>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200" />
          <span className="flex-shrink mx-3 text-xs text-zinc-400 font-medium">
            veya sağ üstteki barkod kodu ile doğrula
          </span>
          <div className="flex-grow border-t border-zinc-200" />
        </div>

        {/* 2. Barkod Kodu ile Sorgulama */}
        <form onSubmit={handleLiveBarcodeQuery} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Sağ Üst Barkod Kodu
              </label>
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(sanitizeBarcode(e.target.value))}
                placeholder="ADB02889192793"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-[#FAF8F5] font-mono text-sm focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                T.C. Kimlik Numaran
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={tcInput}
                onChange={(e) => setTcInput(sanitizeTcKimlik(e.target.value))}
                placeholder="11 Haneli T.C. No"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-[#FAF8F5] font-mono text-sm focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {barcodeError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              {barcodeError}
            </div>
          )}

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>
              {isAnalyzing ? 'Sorgulanıyor...' : 'Barkod ile Doğrula ve Yüklendi Olarak İşle'}
            </span>
          </button>
        </form>

        {/* Doğrulama Sonucu */}
        {analysis.status !== 'unverified' && (
          <div className="pt-4 border-t border-zinc-200 space-y-4 animate-section-enter">
            <div
              className={`p-4 rounded-2xl border ${
                analysis.status === 'clean'
                  ? 'bg-[#E6F4EC] border-emerald-300 text-[#0F6E45]'
                  : analysis.status === 'has_record'
                  ? 'bg-red-50 border-red-300 text-[#B90E0A]'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {analysis.status === 'clean' && (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                {analysis.status === 'has_record' && (
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                {(analysis.status === 'invalid_document' ||
                  analysis.status === 'not_uploaded') && (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-sm">{analysis.profileAutoStamp}</h3>
                  <p className="text-xs mt-1 opacity-90">{analysis.summaryDetail}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alt Aksiyon Butonları: Yüklendiyle Geç veya Yüklemeden (Opsiyonel) Geç */}
        <div className="pt-3 border-t border-zinc-100 space-y-2.5">
          {analysis.uploaded ? (
            <button
              type="button"
              onClick={onContinueToMatches}
              className="w-full py-4 px-5 rounded-2xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Belgem Yüklendi → Eşleşmeleri Gör</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkipWithoutUploading}
              className="w-full py-3.5 px-5 rounded-2xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>
                Yüklemeden Eşleşmelere Geç (Profilde "Adli Sicil Belgesi: Yüklenmedi" Yazar)
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
