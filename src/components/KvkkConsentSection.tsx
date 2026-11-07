import React, { useState } from 'react';
import { KvkkConsentRecord } from '../types/domain';
import { FileCheck2, ArrowRight } from 'lucide-react';

interface KvkkConsentSectionProps {
  consent: KvkkConsentRecord;
  onSaveConsent: (updated: KvkkConsentRecord) => void;
  onContinueToQuestionnaire: () => void;
}

export const KvkkConsentSection: React.FC<KvkkConsentSectionProps> = ({
  consent,
  onSaveConsent,
  onContinueToQuestionnaire,
}) => {
  const [c1, setC1] = useState(consent.generalIlluminationAccepted);
  const [c2, setC2] = useState(consent.specialCategoryExplicitConsent);
  const [c3, setC3] = useState(consent.zeroRetentionPdfAccepted);
  const [c4, setC4] = useState(consent.trServerTransferAccepted);

  const allChecked = c1 && c2 && c3 && c4;

  const handleApproveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;
    const now = new Date();
    const record: KvkkConsentRecord = {
      generalIlluminationAccepted: true,
      specialCategoryExplicitConsent: true,
      zeroRetentionPdfAccepted: true,
      trServerTransferAccepted: true,
      consentTimestamp: now.toLocaleString('tr-TR'),
      consentId: `KVKK-TR-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    onSaveConsent(record);
    onContinueToQuestionnaire();
  };

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-section-enter">
      <div className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-semibold mb-2">
            Türkiye İçi Veri Yerleşikliği • KVKK Uyumlu
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            KVKK Açık Rıza Sözleşmesi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Verileriniz Türkiye sınırları içindeki sunucularda şifreli olarak saklanır ve yalnızca karşılıklı onayda paylaşılır.
          </p>
        </div>

        {/* Özlü Sözleşme Metni */}
        <div className="h-44 overflow-y-auto p-4 rounded-2xl bg-[#FAF8F5] border border-zinc-200 text-xs text-zinc-700 space-y-2.5 leading-relaxed">
          <p>
            <strong>1. Yurt İçi Sunucu:</strong> Tüm profil verileriniz ve tercihleriniz fiziksel olarak Türkiye sınırları içerisindeki (İstanbul Veri Merkezi) sunucularda tutulur.
          </p>
          <p>
            <strong>2. Özel Nitelikli Veriler (KVKK m.6):</strong> Kendi isteğinizle yanıtladığınız inanç, mezhep, topluluk, siyasi görüş ve yaşam tarzı tercihleriniz yalnızca adaylarla uyum yüzdesi hesaplamak amacıyla işlenir.
          </p>
          <p>
            <strong>3. e-Devlet Adli Sicil Sorgusu:</strong> Yüklenen PDF belgesi ve T.C. Kimlik Numarası sistemde saklanmaz; yalnızca doğrulama sonucu profilinize otomatik olarak işlenir.
          </p>
          <p>
            <strong>4. Şifreli İletişim:</strong> WhatsApp ve Instagram bilgileriniz şifreli tutulur ve yalnızca her iki taraf da karşılıklı onay verdiğinde açılır.
          </p>
        </div>

        {/* Onay Kutuları */}
        <form onSubmit={handleApproveAll} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800">Onay Beyanları</span>
            <button
              type="button"
              onClick={() => {
                setC1(true);
                setC2(true);
                setC3(true);
                setC4(true);
              }}
              className="text-xs font-semibold text-[#0F6E45] underline"
            >
              Tümünü Seç
            </button>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 bg-[#FAF8F5] cursor-pointer text-xs text-zinc-800">
            <input
              type="checkbox"
              checked={c1}
              onChange={(e) => setC1(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0F6E45] shrink-0"
            />
            <span>KVKK Aydınlatma Metni’ni okudum ve kabul ediyorum.</span>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 bg-[#FAF8F5] cursor-pointer text-xs text-zinc-800">
            <input
              type="checkbox"
              checked={c2}
              onChange={(e) => setC2(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0F6E45] shrink-0"
            />
            <span>
              İnanç, mezhep, siyasi görüş ve yaşam tarzı tercihlerimin uyum yüzdesi hesaplamak amacıyla işlenmesine açık rıza veriyorum.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 bg-[#FAF8F5] cursor-pointer text-xs text-zinc-800">
            <input
              type="checkbox"
              checked={c3}
              onChange={(e) => setC3(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0F6E45] shrink-0"
            />
            <span>
              e-Devlet Adli Sicil doğrulama sonucumun profilime otomatik işlenmesine rıza veriyorum.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 bg-[#FAF8F5] cursor-pointer text-xs text-zinc-800">
            <input
              type="checkbox"
              checked={c4}
              onChange={(e) => setC4(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0F6E45] shrink-0"
            />
            <span>
              Verilerimin Türkiye’deki sunucuda saklanmasını ve iletişim bilgimin yalnızca karşılıklı onayda açılmasını kabul ediyorum.
            </span>
          </label>

          {consent.specialCategoryExplicitConsent && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F6E45] bg-[#E6F4EC] px-3.5 py-2.5 rounded-xl">
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>Onaylandı ({consent.consentId})</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!allChecked}
            className={`w-full py-3.5 px-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              allChecked
                ? 'bg-[#0F6E45] hover:bg-[#0b5736] text-white'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <span>Onayla ve Sorulara Geç</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
};
