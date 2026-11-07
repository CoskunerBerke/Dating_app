import React, { useState } from 'react';
import {
  CriminalRecordAnalysis,
  MatchAnalysisResult,
  UserSelfProfile,
} from '../types/domain';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  SlidersHorizontal,
} from 'lucide-react';

interface MatchesSectionProps {
  profile: UserSelfProfile;
  matches: MatchAnalysisResult[];
  userCriminalAnalysis: CriminalRecordAnalysis;
  onGoToCriminalCheck: () => void;
  onGoToQuestionnaire: () => void;
}

export const MatchesSection: React.FC<MatchesSectionProps> = ({
  profile,
  matches,
  userCriminalAnalysis,
  onGoToCriminalCheck,
  onGoToQuestionnaire,
}) => {
  const [contactRequests, setContactRequests] = useState<
    Record<string, 'none' | 'requested' | 'mutual_unlocked'>
  >({});
  const [filterTier, setFilterTier] = useState<'all' | '80plus' | '60plus'>('all');
  // Kullanıcının talebi: "Şu anlık premium yapma. Biz istediğimiz zaman premium yapacağız."
  const [previewPremiumMode, setPreviewPremiumMode] = useState(false);

  const filteredMatches = matches.filter((m) => {
    if (filterTier === '80plus') return m.overallScore >= 80;
    if (filterTier === '60plus') return m.overallScore >= 60;
    return true;
  });

  const handleRequestContact = (candidateId: string) => {
    setContactRequests((prev) => ({
      ...prev,
      [candidateId]: 'requested',
    }));
  };

  const handleSimulateMutualApproval = (candidateId: string) => {
    setContactRequests((prev) => ({
      ...prev,
      [candidateId]: 'mutual_unlocked',
    }));
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Üst Başlık */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            KAPALI HAVUZ ALGORİTMA SONUÇLARI • {profile.aliasCode}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-900">
            Değer ve Karakter Uyum Eşleşmeleri
          </h1>
        </div>

        {/* Filtreler */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTier('all')}
            className={`px-3.5 py-2 text-xs font-mono border ${
              filterTier === 'all'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-300 bg-white text-zinc-700'
            }`}
          >
            Tüm Havuz ({matches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTier('80plus')}
            className={`px-3.5 py-2 text-xs font-mono border ${
              filterTier === '80plus'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-300 bg-white text-zinc-700'
            }`}
          >
            %80+ Nişan & Nikâh Adayları
          </button>
          <button
            type="button"
            onClick={() => setFilterTier('60plus')}
            className={`px-3.5 py-2 text-xs font-mono border ${
              filterTier === '60plus'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-300 bg-white text-zinc-700'
            }`}
          >
            %60+ Şans Denenebilir
          </button>
        </div>
      </div>

      {/* Kullanıcının Kendi Adli Sicil Durum Özeti */}
      <div className="bg-white border border-zinc-300 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <ShieldCheck
            className={`w-5 h-5 shrink-0 ${
              userCriminalAnalysis.status === 'clean' ? 'text-emerald-700' : 'text-zinc-400'
            }`}
          />
          <div className="text-xs">
            <span className="font-semibold text-zinc-900 block">
              Sizin Adli Sicil Doğrulama Durumunuz:{' '}
              {userCriminalAnalysis.status === 'clean'
                ? 'DOĞRULANDI (ADLİ SİCİL VE ARŞİV KAYDI YOKTUR)'
                : userCriminalAnalysis.status === 'has_record'
                ? 'KAYIT TESPİT EDİLDİ (GÜVENLİK İNCELEMESİNDE)'
                : 'HENÜZ E-DEVLET PDF BELGESİ YÜKLENMEDİ'}
            </span>
            <span className="text-zinc-500">
              Karşı tarafla gerçek iletişim bilgisi paylaşabilmek için e-Devlet adli sicil doğrulaması önerilir.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {userCriminalAnalysis.status !== 'clean' && (
            <button
              type="button"
              onClick={onGoToCriminalCheck}
              className="px-4 py-2 border border-zinc-900 bg-zinc-900 text-white text-xs font-mono uppercase tracking-wider whitespace-nowrap"
            >
              e-Devlet PDF Doğrula
            </button>
          )}
          <button
            type="button"
            onClick={onGoToQuestionnaire}
            className="px-4 py-2 border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 text-xs font-mono uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Yanıtları Güncelle</span>
          </button>
        </div>
      </div>

      {/* Eşleşme Kartları Listesi */}
      <div className="space-y-8">
        {filteredMatches.map((item, idx) => {
          const { candidate, overallScore, verdictHeadline, verdictAdvice, categoryScores } = item;
          const reqState = contactRequests[candidate.id] || 'none';

          const scoreColorClass =
            overallScore >= 90
              ? 'bg-emerald-950 text-white border-emerald-900'
              : overallScore >= 80
              ? 'bg-zinc-900 text-white border-zinc-900'
              : overallScore >= 60
              ? 'bg-amber-900 text-white border-amber-900'
              : 'bg-zinc-200 text-zinc-800 border-zinc-300';

          return (
            <article
              key={candidate.id}
              className="bg-white border border-zinc-300 overflow-hidden"
            >
              {/* Üst Karar Şeridi */}
              <div className="border-b border-zinc-300 bg-[#FAF8F5] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-400">
                    SIRALAMA #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-zinc-300">|</span>
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    {candidate.poolCode}
                  </span>
                  <span className="text-zinc-300">|</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {candidate.age} Yaş • {candidate.city} • {candidate.profession}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    e-Devlet Adli Sicil & Arşiv: TEMİZ ({candidate.criminalRecord.barcodeMasked})
                  </span>
                </div>
              </div>

              {/* Ana İçerik Gövdesi */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sol Sütun: Yüzde Skoru, Karar Yorumu ve Aday Tanıtımı */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-zinc-200">
                    <div
                      className={`w-28 h-28 shrink-0 flex flex-col items-center justify-center border ${scoreColorClass}`}
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                        UYUM SKORU
                      </span>
                      <span className="font-serif text-4xl font-bold mt-0.5">
                        %{overallScore}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-semibold text-zinc-900 leading-snug mb-2">
                        {verdictHeadline}
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        {verdictAdvice}
                      </p>
                    </div>
                  </div>

                  {/* Adayın Kendini Tanıtma Notu */}
                  <div className="space-y-3">
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        ADAYIN KENDİ CÜMLELERİYLE TANITIMI ({candidate.education} • Hedef: {candidate.marriageTimeline})
                      </span>
                      <p className="text-sm text-zinc-800 leading-relaxed bg-[#FAF8F5] p-4 border border-zinc-200">
                        “{candidate.shortIntro}”
                      </p>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        EŞ ADAYINDAN TEMEL BEKLENTİSİ
                      </span>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {candidate.expectationsNote}
                      </p>
                    </div>
                  </div>

                  {/* Ortak Noktalar & Konuşulması Gerekenler */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="border border-zinc-200 p-4 bg-[#FAF8F5]/50">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-emerald-800 font-semibold mb-2">
                        ÖRTÜŞEN TEMEL DEĞERLERİNİZ
                      </span>
                      {item.sharedStrengths.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-zinc-700">
                          {item.sharedStrengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-zinc-500">
                          Doğrudan birebir örtüşen ana eksen sayısı sınırlı.
                        </p>
                      )}
                    </div>

                    <div className="border border-zinc-200 p-4 bg-[#FAF8F5]/50">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-800 font-semibold mb-2">
                        TANIŞMADA KONUŞMANIZ GEREKENLER
                      </span>
                      {item.hardConflicts.length > 0 || item.talkingPoints.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-zinc-700">
                          {[...item.hardConflicts, ...item.talkingPoints]
                            .slice(0, 3)
                            .map((t, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                <span>{t}</span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-emerald-800">
                          Kritik başlıklarda hiçbir çatışma veya kırmızı çizgi ihlali tespit edilmedi.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ Sütun: 6 Eksenli Uyum Matrisi & "İletişim Kurmak İster misin?" Modülü */}
                <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-200 pt-6 lg:pt-0 lg:pl-8">
                  <div>
                    <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-500 mb-4">
                      6 EKSENLİ KATEGORİ UYUM KIRILIMI
                    </span>

                    <div className="space-y-3.5 mb-8">
                      {categoryScores.map((cat) => (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-zinc-800">{cat.label}</span>
                            <span className="font-mono font-semibold text-zinc-900">
                              %{cat.score}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-200 overflow-hidden">
                            <div
                              className={`h-full ${
                                cat.score >= 85
                                  ? 'bg-zinc-900'
                                  : cat.score >= 65
                                  ? 'bg-zinc-600'
                                  : 'bg-amber-700'
                              }`}
                              style={{ width: `${cat.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* İletişim Kurmak İster misin? Kutusu */}
                  <div className="border border-zinc-300 bg-[#FAF8F5] p-5">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                      KARŞILIKLI ONAYLI & UÇTAN UCA ŞİFRELİ KANAL
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-zinc-900 mb-2">
                      Bu aday ile iletişim kurmak ister misiniz?
                    </h3>

                    {previewPremiumMode ? (
                      <div className="p-4 border border-zinc-300 bg-white text-xs text-zinc-700 space-y-2">
                        <div className="flex items-center gap-2 font-mono font-semibold text-zinc-900">
                          <Lock className="w-4 h-4" />
                          <span>PREMIUM ÜYELİK KİLİDİ AKTİF (ÖNİZLEME)</span>
                        </div>
                        <p className="text-zinc-600 leading-relaxed">
                          İletişim isteği göndermek ve uçtan uca şifreli iletişim bilgilerini açmak Premium üyelik kapsamındadır.
                        </p>
                      </div>
                    ) : (
                      <>
                        {reqState === 'none' && (
                          <div>
                            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                              İstek gönderdiğinizde karşı tarafa yalnızca anonim uyum kartınız ve adli sicil doğrulama mührünüz iletilir. Karşı taraf da onaylarsa gerçek iletişim bilgileri açılır.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRequestContact(candidate.id)}
                              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Evet, İletişim İsteği Gönder (%{overallScore} Uyum)</span>
                            </button>
                          </div>
                        )}

                        {reqState === 'requested' && (
                          <div className="space-y-3">
                            <div className="p-3 bg-white border border-zinc-300 text-xs text-zinc-800">
                              <strong>İstek İletildi:</strong> {candidate.poolCode} kodlu adayın onayı bekleniyor.
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSimulateMutualApproval(candidate.id)}
                              className="w-full py-2.5 px-4 border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-mono uppercase tracking-wider"
                            >
                              [Demo] Karşı Tarafın Onayını Simüle Et →
                            </button>
                          </div>
                        )}

                        {reqState === 'mutual_unlocked' && (
                          <div className="p-4 bg-emerald-950 text-white space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                              <span className="flex items-center gap-1.5">
                                <Unlock className="w-3.5 h-3.5" />
                                E2EE ŞİFRELİ İLETİŞİM AÇILDI
                              </span>
                              <span>KARŞILIKLI ONAYLI</span>
                            </div>
                            <div className="p-2.5 bg-black/40 border border-emerald-800 font-mono text-xs break-all">
                              {candidate.encryptedContactHandle.replace(
                                '(Karşılıklı Onayda Açılır)',
                                '49 82 (Doğrulandı)'
                              )}
                            </div>
                            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                              Sizin iletişim bilginiz ({profile.contactChannel}) de güvenli anahtar değişimiyle karşı tarafa açılmıştır.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Kurucu / Yönetici Özellik Bayrağı Kontrolü (Premium Switch) */}
      <div className="mt-12 p-6 border border-zinc-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">
            KURUCU / YÖNETİCİ KONTROL PANELİ (FEATURE FLAG)
          </span>
          <h4 className="font-semibold text-sm text-zinc-900">
            Premium Üyelik Kilidi: Şu An Kapalı (Ücretsiz Erken Erişim Havuzu)
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Havuzda hedeflediğiniz 2.000 - 3.000 homojen aday dağılımına ulaştığınızda tek tuşla Premium kilit mekanizmasını devreye alabilirsiniz.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPreviewPremiumMode(!previewPremiumMode)}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border shrink-0 whitespace-nowrap ${
            previewPremiumMode
              ? 'border-zinc-900 bg-zinc-900 text-white'
              : 'border-zinc-300 bg-[#FAF8F5] text-zinc-800 hover:border-zinc-900'
          }`}
        >
          {previewPremiumMode ? 'Premium Önizlemeyi Kapat' : 'Premium Görünümünü Test Et'}
        </button>
      </div>
    </section>
  );
};
