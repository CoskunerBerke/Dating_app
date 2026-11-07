import React, { useState } from 'react';
import {
  CriminalRecordAnalysis,
  MatchAnalysisResult,
  UserSelfProfile,
} from '../types/domain';
import {
  ShieldCheck,
  ShieldAlert,
  Unlock,
  Phone,
  Instagram,
  ExternalLink,
  RotateCcw,
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
  matches,
  userCriminalAnalysis,
}) => {
  const [contactRequests, setContactRequests] = useState<
    Record<string, 'none' | 'requested' | 'mutual_unlocked'>
  >({});
  const [passedIds, setPassedIds] = useState<Record<string, 'passed' | 'blocked'>>({});
  const [acceptedCandidateRecords, setAcceptedCandidateRecords] = useState<
    Record<string, boolean>
  >({});
  const [counterpartAcceptedUserRecord, setCounterpartAcceptedUserRecord] = useState<
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

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-section-enter">
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
          const candidateHasRecord = !candidate.criminalRecord.clean;
          const isCandidateRecordAccepted = Boolean(
            acceptedCandidateRecords[candidate.id]
          );
          const userHasRecord = userCriminalAnalysis.status === 'has_record';
          const hasCounterpartAcceptedUserRecord = Boolean(
            counterpartAcceptedUserRecord[candidate.id]
          );

          const safeWaUrl = candidate.whatsappNumber
            ? buildSafeContactUrl('whatsapp', candidate.whatsappNumber)
            : '';
          const safeIgUrl = candidate.instagramHandle
            ? buildSafeContactUrl('instagram', candidate.instagramHandle)
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
                    <h2 className="text-2xl sm:text-[26px] font-bold text-zinc-900 leading-tight">
                      {candidate.firstName}
                    </h2>
                    <p className="text-sm sm:text-[15px] text-zinc-600 leading-snug mt-1">
                      {candidate.age} yaş · {candidate.heightCm} cm · {candidate.bodyType} ·{' '}
                      {candidate.city} · {candidate.personaTitle}
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

                {/* Tek Satır Sade e-Devlet Adli Sicil Bilgisi */}
                <div className="mt-4">
                  {candidate.criminalRecord.clean ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F6E45]">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>e-Devlet Adli Sicil Kaydı Yoktur</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-950">
                      <div className="flex items-center gap-1.5 font-bold text-[#B90E0A]">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Adli Sicil Kaydı Bulunmaktadır</span>
                      </div>
                      <p className="text-[11px] text-red-900 mt-0.5">
                        {candidate.criminalRecord.recordSummary}
                      </p>
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
                    {candidateHasRecord && (
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
                        disabled={candidateHasRecord && !isCandidateRecordAccepted}
                        onClick={() => handleRequestContact(candidate.id)}
                        className={`col-span-6 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                          candidateHasRecord && !isCandidateRecordAccepted
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
                      <strong>İstek Gönderildi:</strong> {candidate.firstName} onayladığında iletişim açılacak.
                    </div>

                    {userHasRecord && (
                      <label className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer text-xs text-amber-950">
                        <input
                          type="checkbox"
                          checked={hasCounterpartAcceptedUserRecord}
                          onChange={(e) =>
                            setCounterpartAcceptedUserRecord((prev) => ({
                              ...prev,
                              [candidate.id]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 w-4 h-4 accent-zinc-900 shrink-0"
                        />
                        <span>Karşı tarafın adli sicil kaydını kabul ettiğini onayla</span>
                      </label>
                    )}

                    <button
                      type="button"
                      disabled={userHasRecord && !hasCounterpartAcceptedUserRecord}
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
                        İletişim Açıldı
                      </span>
                      <span>Karşılıklı Onaylı</span>
                    </div>

                    <div className="space-y-1.5">
                      {(candidate.preferredContactPlatform === 'whatsapp' ||
                        candidate.preferredContactPlatform === 'both') &&
                        candidate.whatsappNumber && (
                          <a
                            href={safeWaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-white text-[#0F6E45] text-xs font-bold flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>WhatsApp: {candidate.whatsappNumber}</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        )}

                      {(candidate.preferredContactPlatform === 'instagram' ||
                        candidate.preferredContactPlatform === 'both') &&
                        candidate.instagramHandle && (
                          <a
                            href={safeIgUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-black/25 text-white text-xs font-bold flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Instagram className="w-3.5 h-3.5 shrink-0" />
                              <span>Instagram: @{candidate.instagramHandle.replace(/^@/, '')}</span>
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
