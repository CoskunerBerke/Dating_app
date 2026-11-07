import React, { useState, useRef } from 'react';
import { CriminalRecordAnalysis } from '../types/domain';
import {
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

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-section-enter">
      <div className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            e-Devlet Adli Sicil Doğrulama
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            e-Devlet’ten aldığın Adli Sicil PDF belgesini yükle veya sağ üstteki barkod kodunu gir. Sonuç otomatik olarak profiline işlenir ve belgen silinir.
          </p>
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
            e-Devlet Adli Sicil PDF Dosyasını Seç
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Belgedeki <code>ADB...</code> kodunu ve sonucu otomatik okur
          </p>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200" />
          <span className="flex-shrink mx-3 text-xs text-zinc-400 font-medium">
            veya barkod kodu ile sorgula
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
              {isAnalyzing ? 'Sorgulanıyor...' : 'Barkod ile Sorgula ve Profile İşle'}
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
                {analysis.status === 'invalid_document' && (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-sm">{analysis.profileAutoStamp}</h3>
                  <p className="text-xs mt-1 opacity-90">{analysis.summaryDetail}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onContinueToMatches}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Eşleşmelere Geç</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
