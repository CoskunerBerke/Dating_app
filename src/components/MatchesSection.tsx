import React, { useState } from 'react';
import {
  CriminalRecordAnalysis,
  MatchAnalysisResult,
  UserSelfProfile,
} from '../types/domain';
import {
  ShieldCheck,
  ShieldAlert,
  FileWarning,
  Unlock,
  Lock,
  Phone,
  Instagram,
  Mail,
  ExternalLink,
  RotateCcw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { buildSafeContactUrl } from '../utils/security';

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
}) => {
  const [contactRequests, setContactRequests] = useState<
    Record<string, 'none' | 'requested' | 'mutual_unlocked'>
  >({});
  const [passedIds, setPassedIds] = useState<Record<string, 'passed' | 'blocked'>>({});
  const [unlockedCriminalReportIds, setUnlockedCriminalReportIds] = useState<
    Record<string, boolean>
  >({});
  const [acceptedCandidateRecords, setAcceptedCandidateRecords] = useState<
    Record<string, boolean>
  >({});
  const [hideRedBlocked, setHideRedBlocked] = useState(true);

  const visibleMatches = matches.filter((m) => {
    if (passedIds[m.candidate.id]) return false;
    if (hideRedBlocked && m.isBlockedByRedFilter) return false;
    return true;
  });

  const blockedCount = matches.filter((m) => m.isBlockedByRedFilter).length;
  const passedOrBlockedCount = Object.keys(passedIds).length;

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

  const handlePassCandidate = (candidateId: string, action: 'passed' | 'blocked') => {
    setPassedIds((prev) => ({
      ...prev,
      [candidateId]: action,
    }));
  };

  const handleUnlockCandidateCriminalReport = (candidateId: string) => {
    setUnlockedCriminalReportIds((prev) => ({
      ...prev,
      [candidateId]: true,
    }));
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-section-enter">
      {/* Kullanıcının Kendi Profil Özeti & Karşı Tarafa Görünen Adli Sicil Durumu */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EC] text-[#0F6E45] font-bold flex items-center justify-center text-sm shrink-0">
            {profile.firstName ? profile.firstName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900">
              {profile.firstName}{' '}
              {profile.lastName ? `${profile.lastName[0].toUpperCase()}.` : ''} •{' '}
              {profile.age} yaş · {profile.city} (Memleket: {profile.hometown})
            </div>
            <div className="text-xs text-zinc-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[#0F6E45] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SMS Doğrulandı
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[#0F6E45] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Canlı Kamera Doğrulandı
              </span>
              <span>•</span>
              <strong
                className={
                  userCriminalAnalysis.uploaded ? 'text-[#0F6E45]' : 'text-amber-700'
                }
              >
                {userCriminalAnalysis.uploaded
                  ? 'Adli Sicil Belgesi: Yüklendi'
                  : 'Adli Sicil Belgesi: Yüklenmedi'}
              </strong>
            </div>
          </div>
        </div>

        {!userCriminalAnalysis.uploaded && (
          <button
            type="button"
            onClick={onGoToCriminalCheck}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            Adli Sicil Belgeni Yükle →
          </button>
        )}
      </div>

      {/* Sade Üst Başlık ve Filtre */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
          Sana Uyumlu Adaylar
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-zinc-200/70 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setHideRedBlocked(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hideRedBlocked
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600'
              }`}
            >
              Uygun Olanlar ({matches.length - blockedCount})
            </button>
            {blockedCount > 0 && (
              <button
                type="button"
                onClick={() => setHideRedBlocked(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !hideRedBlocked
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600'
                }`}
              >
                Tümü ({matches.length})
              </button>
            )}
          </div>

          {passedOrBlockedCount > 0 && (
            <button
              type="button"
              onClick={() => setPassedIds({})}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-300 bg-white text-zinc-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Geri Al ({passedOrBlockedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Aday Kartları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleMatches.map((item) => {
          const {
            candidate,
            overallScore,
            isBlockedByRedFilter,
            verdictBadge,
            topPercentileLabel,
            commonInterests,
            matchedTopicsWithStar,
            differingTopicsWithStar,
            evaluatedTopicsCount,
          } = item;

          const reqState = contactRequests[candidate.id] || 'none';
          const isCriminalUploaded = candidate.criminalRecord.uploaded;
          const isCriminalReportUnlocked = Boolean(
            unlockedCriminalReportIds[candidate.id]
          );
          const candidateHasRecord =
            isCriminalUploaded && !candidate.criminalRecord.clean;
          const isCandidateRecordAccepted = Boolean(
            acceptedCandidateRecords[candidate.id]
          );

          const safeWaUrl = candidate.whatsappNumber
            ? buildSafeContactUrl('whatsapp', candidate.whatsappNumber)
            : '';
          const safeIgUrl = candidate.instagramHandle
            ? buildSafeContactUrl('instagram', candidate.instagramHandle)
            : '';
          const safeEmailUrl = candidate.emailAddress
            ? buildSafeContactUrl('email', candidate.emailAddress)
            : '';

          return (
            <article
              key={candidate.id}
              className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                {/* Üst Satır: Sol (İsim & Bilgiler) | Sağ (%91 & Çok yüksek uyum) */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl sm:text-[26px] font-bold text-zinc-900 leading-tight">
                        {candidate.firstName}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SMS & Kamera Onaylı</span>
                      </span>
                    </div>
                    <p className="text-sm sm:text-[15px] text-zinc-600 leading-snug mt-1">
                      {candidate.age} yaş · {candidate.heightCm} cm · {candidate.bodyType} ·{' '}
                      {candidate.city} (Aslen {candidate.hometown}) · {candidate.personaTitle}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-3xl sm:text-[34px] font-bold leading-none block ${
                        isBlockedByRedFilter
                          ? 'text-[#B90E0A]'
                          : overallScore >= 78
                          ? 'text-[#0F6E45]'
                          : 'text-amber-700'
                      }`}
                    >
                      %{overallScore}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-800 block mt-1">
                      {verdictBadge}
                    </span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 block">
                      {topPercentileLabel}
                    </span>
                  </div>
                </div>

                {/* Gri Kişisel Özellik Etiketleri */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {candidate.characterTraits.map((trait) => (
                    <span
                      key={trait}
                      className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Ortak İlgi Alanları (Yeşil Etiketler) */}
                <div className="mt-5">
                  <h3 className="text-sm font-bold text-zinc-800 mb-2">
                    Ortak ilgi alanlarınız ({commonInterests.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {commonInterests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-semibold"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Uyumlu Olduğunuz Konular */}
                <div className="mt-5 text-xs sm:text-[13.5px] leading-relaxed text-zinc-700">
                  <strong className="text-[#0F6E45] font-bold">
                    Uyumlu olduğunuz konular:{' '}
                  </strong>
                  <span>{matchedTopicsWithStar.join(', ')}</span>
                </div>

                {/* Farklı Olduğunuz Konular */}
                <div className="mt-3 text-xs sm:text-[13.5px] leading-relaxed text-zinc-700">
                  <strong className="text-[#9A5B13] font-bold">
                    Farklı olduğunuz konular:{' '}
                  </strong>
                  <span>{differingTopicsWithStar.join(', ')}</span>
                </div>

                {/* Adli Sicil Durumu: Direkt "Yüklendi" veya "Yüklenmedi" Gözükür + Detayı Görmek Ücrete Tabi */}
                <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-zinc-200/90 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {isCriminalUploaded ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6E45]">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Adli Sicil Belgesi: Yüklendi</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <FileWarning className="w-4 h-4 shrink-0" />
                        <span>Adli Sicil Belgesi: Yüklenmedi</span>
                      </div>
                    )}

                    {!isCriminalReportUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleUnlockCandidateCriminalReport(candidate.id)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Belge Detayını Gör (₺49,90)</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F6E45]">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detay Açıldı</span>
                      </span>
                    )}
                  </div>

                  {/* Ücretli Kilit Açıldığında Gösterilen Detaylı Adli Sicil Sonucu */}
                  {isCriminalReportUnlocked && (
                    <div className="pt-2 border-t border-zinc-200 text-xs animate-section-enter">
                      {!isCriminalUploaded ? (
                        <p className="text-amber-900 font-medium">
                          Bu kullanıcı henüz sisteme e-Devlet Adli Sicil Belgesi yüklememiştir (Adli Sicil Belgesi: Yüklenmedi).
                        </p>
                      ) : candidate.criminalRecord.clean ? (
                        <p className="text-[#0F6E45] font-medium">
                          e-Devlet Barkod Doğrulaması ({candidate.criminalRecord.barcodeMasked || 'ADB02889****'}): Adli sicil ve arşiv kaydı yoktur.
                        </p>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-950">
                          <div className="flex items-center gap-1.5 font-bold text-[#B90E0A]">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>DİKKAT: Adli Sicil Kaydı Mevcuttur</span>
                          </div>
                          <p className="text-[11px] text-red-900 mt-0.5">
                            {candidate.criminalRecord.recordSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-2.5 text-xs text-zinc-400">
                  Uyum puanı {evaluatedTopicsCount} konuya göre hesaplandı · çok bilgiyle.
                </p>
              </div>

              {/* Alt Butonlar: İlgileniyorum | Geç | Engelle */}
              <div className="mt-5 pt-4 border-t border-zinc-100">
                {reqState === 'none' && (
                  <div className="space-y-3">
                    {isCriminalReportUnlocked && candidateHasRecord && (
                      <label className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 cursor-pointer text-xs text-red-950">
                        <input
                          type="checkbox"
                          checked={isCandidateRecordAccepted}
                          onChange={(e) =>
                            setAcceptedCandidateRecords((prev) => ({
                              ...prev,
                              [candidate.id]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 w-4 h-4 accent-[#B90E0A] shrink-0"
                        />
                        <span>
                          Adli sicil kaydını gördüm ve kabul ederek iletişime geçmek istiyorum.
                        </span>
                      </label>
                    )}

                    <div className="grid grid-cols-12 gap-2.5">
                      <button
                        type="button"
                        disabled={
                          isCriminalReportUnlocked &&
                          candidateHasRecord &&
                          !isCandidateRecordAccepted
                        }
                        onClick={() => handleRequestContact(candidate.id)}
                        className={`col-span-6 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                          isCriminalReportUnlocked &&
                          candidateHasRecord &&
                          !isCandidateRecordAccepted
                            ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                            : 'bg-[#0F6E45] hover:bg-[#0b5736] text-white'
                        }`}
                      >
                        İlgileniyorum
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePassCandidate(candidate.id, 'passed')}
                        className="col-span-3 py-3 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-semibold"
                      >
                        Geç
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePassCandidate(candidate.id, 'blocked')}
                        className="col-span-3 py-3 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-red-50 hover:text-[#B90E0A] text-zinc-800 text-sm font-semibold"
                      >
                        Engelle
                      </button>
                    </div>
                  </div>
                )}

                {reqState === 'requested' && (
                  <div className="space-y-2.5 animate-section-enter">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-zinc-200 text-xs text-zinc-700">
                      <strong>Tanışma İsteği Gönderildi:</strong> {candidate.firstName} de onayladığında seçtiği iletişim kanalı açılacak.
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSimulateMutualApproval(candidate.id)}
                      className="w-full py-2.5 px-4 rounded-xl border border-[#0F6E45] bg-[#E6F4EC] text-[#0F6E45] text-xs font-bold"
                    >
                      Karşı Tarafın Onayını Simüle Et →
                    </button>
                  </div>
                )}

                {reqState === 'mutual_unlocked' && (
                  <div className="p-3.5 rounded-2xl bg-[#0F6E45] text-white space-y-2 animate-section-enter">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-100">
                      <span className="flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5" />
                        Karşılıklı Eşleşme Onaylandı
                      </span>
                      <span>İletişim Kanalı Açık</span>
                    </div>

                    <div className="space-y-1.5">
                      {candidate.preferredContactPlatform === 'whatsapp' &&
                        candidate.whatsappNumber && (
                          <a
                            href={safeWaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-white text-[#0F6E45] text-xs font-bold flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>Telefon / WhatsApp: {candidate.whatsappNumber}</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        )}

                      {candidate.preferredContactPlatform === 'instagram' &&
                        candidate.instagramHandle && (
                          <a
                            href={safeIgUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-black/25 text-white text-xs font-bold flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Instagram className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                Instagram: @{candidate.instagramHandle.replace(/^@/, '')}
                              </span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        )}

                      {candidate.preferredContactPlatform === 'email' &&
                        candidate.emailAddress && (
                          <a
                            href={safeEmailUrl || '#'}
                            className="w-full py-2.5 px-3 rounded-xl bg-white text-[#0F6E45] text-xs font-bold flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span>E-posta: {candidate.emailAddress}</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
