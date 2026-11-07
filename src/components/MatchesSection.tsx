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
  Copy,
  Check,
  XCircle,
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hideRedBlocked, setHideRedBlocked] = useState(true);
  const [previewPremiumMode, setPreviewPremiumMode] = useState(false);

  const visibleMatches = matches.filter((m) => {
    if (hideRedBlocked && m.isBlockedByRedFilter) return false;
    return true;
  });

  const blockedCount = matches.filter((m) => m.isBlockedByRedFilter).length;

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

  const handleCopyMessage = (candidateId: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(candidateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-section-enter">
      {/* Üst Başlık */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            EŞLEŞME HAVUZU SONUÇLARI • {profile.aliasCode}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-900">
            Sana Uyumlu Adaylar ve Yüzdeleri
          </h1>
        </div>

        {/* Kırmızı Kutucuk Filtre Anahtarı */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHideRedBlocked(true)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
              hideRedBlocked
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-300 bg-white text-zinc-700'
            }`}
          >
            Sadece Bana Uygun Olanlar ({matches.length - blockedCount})
          </button>
          <button
            type="button"
            onClick={() => setHideRedBlocked(false)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
              !hideRedBlocked
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-300 bg-white text-zinc-700'
            }`}
          >
            Kırmızı Kutucuğa Takılanları da Göster ({blockedCount} Elenen)
          </button>
        </div>
      </div>

      {/* Kullanıcının Kendi Sabıka Kaydı Durumu */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <ShieldCheck
            className={`w-5 h-5 shrink-0 ${
              userCriminalAnalysis.status === 'clean' ? 'text-emerald-700' : 'text-zinc-400'
            }`}
          />
          <div className="text-xs">
            <span className="font-semibold text-zinc-900 block">
              Sabıka Kaydı Doğrulama Durumun:{' '}
              {userCriminalAnalysis.status === 'clean'
                ? 'DOĞRULANDI (ADLİ SİCİL KAYDI YOKTUR)'
                : userCriminalAnalysis.status === 'has_record'
                ? 'KAYIT TESPİT EDİLDİ'
                : 'HENÜZ E-DEVLET SABIKA KAYDI PDF YÜKLENMEDİ'}
            </span>
            <span className="text-zinc-500">
              e-Devlet sabıka kaydını doğrulayan kullanıcılar eşleşmelerde öncelikli gösterilir.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {userCriminalAnalysis.status !== 'clean' && (
            <button
              type="button"
              onClick={onGoToCriminalCheck}
              className="px-4 py-2 rounded-xl border border-zinc-900 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap hover:bg-zinc-800"
            >
              Sabıka Kaydı PDF Yükle
            </button>
          )}
          <button
            type="button"
            onClick={onGoToQuestionnaire}
            className="px-4 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 text-xs font-semibold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Cevaplarımı Değiştir</span>
          </button>
        </div>
      </div>

      {/* Eşleşme Kartları Listesi */}
      <div className="space-y-8">
        {visibleMatches.map((item, idx) => {
          const {
            candidate,
            overallScore,
            isBlockedByRedFilter,
            blockedReasons,
            verdictHeadline,
            verdictAdvice,
            firstMessageIdea,
            categoryScores,
          } = item;
          const reqState = contactRequests[candidate.id] || 'none';

          const radius = 44;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (overallScore / 100) * circumference;

          return (
            <article
              key={candidate.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md ${
                isBlockedByRedFilter ? 'border-red-300' : 'border-zinc-200'
              }`}
            >
              {/* Üst Kimlik Şeridi */}
              <div className="border-b border-zinc-200 bg-[#FAF8F5] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-zinc-900 text-white">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    {candidate.poolCode}
                  </span>
                  <span className="text-zinc-300">|</span>
                  <span className="text-xs font-semibold text-zinc-800">
                    {candidate.age} Yaş • {candidate.city} • {candidate.profession}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    e-Devlet Sabıka Kaydı Yoktur ({candidate.criminalRecord.barcodeMasked})
                  </span>
                </div>
              </div>

              {/* Kırmızı Kutucuk Engeli Varsa Uyarı */}
              {isBlockedByRedFilter && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-2.5 text-xs text-red-900">
                  <XCircle className="w-4 h-4 text-[#B90E0A] shrink-0 mt-0.5" />
                  <div>
                    <strong>Kırmızı Kutucuk Filtresine Takıldı:</strong>{' '}
                    {blockedReasons.join(' • ')}
                  </div>
                </div>
              )}

              {/* Ana İçerik Gövdesi */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sol Sütun: Yüzde Skoru, Adayın Kimlik Kutucukları ve Tanıtımı */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-zinc-200">
                    {/* Dairesel Yüzde Halkası */}
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          stroke="#e4e4e7"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          stroke={
                            isBlockedByRedFilter
                              ? '#B90E0A'
                              : overallScore >= 85
                              ? '#065f46'
                              : overallScore >= 65
                              ? '#18181b'
                              : '#b45309'
                          }
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                          UYUM
                        </span>
                        <span className="font-serif text-3xl font-bold text-zinc-900">
                          %{overallScore}
                        </span>
                      </div>
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

                  {/* Adayın Tüm Özellik Etiketleri (İnanç, Mezhep, Cemaat, Siyaset, Takım, Spor, Alkol, Giyim) */}
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                      ADAYIN KİMLİK VE TERCİH ÖZETİ
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>İnanç:</strong> {candidate.tags.inanc}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>Mezhep:</strong> {candidate.tags.mezhep}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>Cemaat:</strong> {candidate.tags.cemaat}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>Siyasi Görüş:</strong> {candidate.tags.siyaset}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>Takım:</strong> {candidate.tags.takim}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>Spor:</strong> {candidate.tags.spor}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>Alkol:</strong> {candidate.tags.alkol}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 font-medium">
                        <strong>Giyim:</strong> {candidate.tags.giyim}
                      </span>
                    </div>
                  </div>

                  {/* Adayın Kendini Tanıtma Notu */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-zinc-200 space-y-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      KENDİNİ TANITMA YAZISI
                    </span>
                    <p className="text-sm text-zinc-800 leading-relaxed">
                      “{candidate.shortIntro}”
                    </p>
                  </div>

                  {/* Ortak Noktalar & Farklılıklar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-zinc-200 p-4 bg-[#FAF8F5]/50">
                      <span className="block text-[11px] uppercase tracking-wider text-emerald-800 font-bold mb-2">
                        ANLAŞTIĞINIZ KONULAR
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
                          Birebir aynı seçtiğiniz başlık sayısı az.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-zinc-200 p-4 bg-[#FAF8F5]/50">
                      <span className="block text-[11px] uppercase tracking-wider text-amber-800 font-bold mb-2">
                        FARKLI DÜŞÜNDÜĞÜNÜZ KONULAR
                      </span>
                      {item.talkingPoints.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-zinc-700">
                          {item.talkingPoints.map((t, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-emerald-800">
                          Temel konularda belirgin bir zıtlığınız yok.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ Sütun: Kategori Uyum Çubukları & "İletişim Kurmak İster misin?" Modülü */}
                <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-200 pt-6 lg:pt-0 lg:pl-8">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
                      KONU BAZLI UYUM ORANLARI
                    </span>

                    <div className="space-y-3.5 mb-6">
                      {categoryScores.map((cat) => (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-zinc-800">{cat.label}</span>
                            <span className="font-mono font-bold text-zinc-900">
                              %{cat.score}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${
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

                    {/* İlk Mesaj Önerisi */}
                    <div className="p-3.5 rounded-2xl border border-zinc-200 bg-[#FAF8F5] mb-6 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                          HAZIR TANIŞMA MESAJI
                        </span>
                        <p className="text-zinc-700 italic">{firstMessageIdea}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(candidate.id, firstMessageIdea)}
                        className="px-3 py-2 rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 text-xs font-medium shrink-0 flex items-center gap-1"
                      >
                        {copiedId === candidate.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* İletişim Kurmak İster misin? Kutusu */}
                  <div className="rounded-2xl border border-zinc-300 bg-[#FAF8F5] p-5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      KARŞILIKLI ONAYLI İLETİŞİM
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-zinc-900 mb-2">
                      İletişim kurmak ister misin?
                    </h3>

                    {previewPremiumMode ? (
                      <div className="p-4 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-700 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-zinc-900">
                          <Lock className="w-4 h-4" />
                          <span>PREMIUM ÜYELİK KİLİDİ AKTİF</span>
                        </div>
                        <p className="text-zinc-600 leading-relaxed">
                          İletişim isteği göndermek ve karşı tarafın iletişim bilgilerini görmek Premium üyelik kapsamındadır.
                        </p>
                      </div>
                    ) : (
                      <>
                        {reqState === 'none' && (
                          <div>
                            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                              İstek gönderdiğinde karşı tarafa uyum yüzdeniz ve sabıka kaydı doğrulama durumun iletilir. O da onaylarsa gerçek iletişim bilgileriniz açılır.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRequestContact(candidate.id)}
                              className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>İletişim Kurmak İster misin? (%{overallScore} Uyum)</span>
                            </button>
                          </div>
                        )}

                        {reqState === 'requested' && (
                          <div className="space-y-3 animate-section-enter">
                            <div className="p-3 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-800">
                              <strong>İstek Gönderildi:</strong> {candidate.poolCode} kodlu adayın onayı bekleniyor.
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSimulateMutualApproval(candidate.id)}
                              className="w-full py-2.5 px-4 rounded-xl border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider"
                            >
                              [Demo] Karşı Tarafın Onayını Simüle Et →
                            </button>
                          </div>
                        )}

                        {reqState === 'mutual_unlocked' && (
                          <div className="p-4 rounded-xl bg-emerald-950 text-white space-y-2.5 animate-section-enter">
                            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                              <span className="flex items-center gap-1.5">
                                <Unlock className="w-3.5 h-3.5" />
                                ŞİFRELİ İLETİŞİM AÇILDI
                              </span>
                              <span>KARŞILIKLI ONAYLI</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-800 font-mono text-xs break-all">
                              {candidate.encryptedContactHandle.replace(
                                '(Karşılıklı Onayda Açılır)',
                                '49 82 (Doğrulandı)'
                              )}
                            </div>
                            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                              Senin iletişim bilgin ({profile.contactChannel}) de karşı tarafa açıldı.
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

      {/* Kurucu / Yönetici Premium Kontrolü */}
      <div className="mt-12 p-6 rounded-2xl border border-zinc-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">
            YÖNETİCİ KONTROLÜ
          </span>
          <h4 className="font-semibold text-sm text-zinc-900">
            Premium Üyelik Kilidi: Şu An Kapalı (Ücretsiz Mod)
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            İstediğin zaman tek tuşla iletişim kurma ve sabıka kaydı özelliklerini Premium üyeliğe bağlayabilirsin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPreviewPremiumMode(!previewPremiumMode)}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border shrink-0 whitespace-nowrap transition-colors ${
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
