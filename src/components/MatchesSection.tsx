import React, { useState } from 'react';
import {
  CriminalRecordAnalysis,
  MatchAnalysisResult,
  UserSelfProfile,
} from '../types/domain';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  SlidersHorizontal,
  XCircle,
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
  profile,
  matches,
  userCriminalAnalysis,
  onGoToCriminalCheck,
  onGoToQuestionnaire,
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
  const [previewPremiumMode, setPreviewPremiumMode] = useState(false);

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

  const userPlatformLabel =
    profile.preferredContactPlatform === 'whatsapp'
      ? `WhatsApp (${profile.whatsappNumber})`
      : profile.preferredContactPlatform === 'instagram'
      ? `Instagram (@${profile.instagramHandle.replace(/^@/, '')})`
      : `WhatsApp (${profile.whatsappNumber}) & Instagram (@${profile.instagramHandle.replace(/^@/, '')})`;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-section-enter">
      {/* Üst Başlık */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            EŞLEŞME HAVUZU • {profile.firstName} ({profile.age} yaş · {profile.heightCm} cm · {profile.city})
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-zinc-900">
            Sana Uyumlu Adaylar ve Yüzdeleri
          </h1>
        </div>

        {/* Filtre Anahtarları */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHideRedBlocked(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
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
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
              !hideRedBlocked
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-300 bg-white text-zinc-700'
            }`}
          >
            Kırmızı Kutucuğa Takılanlar ({blockedCount})
          </button>
          {passedOrBlockedCount > 0 && (
            <button
              type="button"
              onClick={() => setPassedIds({})}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Geçilenleri Geri Getir ({passedOrBlockedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Kullanıcının Kendi Otomatik Profil Sabıka Kaydı & İletişim Kanalı Özeti */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-start sm:items-center gap-3">
            {userCriminalAnalysis.status === 'clean' ? (
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#0F6E45]" />
            ) : userCriminalAnalysis.status === 'has_record' ? (
              <ShieldAlert className="w-5 h-5 shrink-0 text-[#B90E0A]" />
            ) : (
              <ShieldCheck className="w-5 h-5 shrink-0 text-zinc-400" />
            )}
            <div className="text-xs">
              <span className="font-semibold text-zinc-900 block">
                Profilindeki Otomatik e-Devlet Adli Sicil Kaydı:{' '}
                <span
                  className={
                    userCriminalAnalysis.status === 'clean'
                      ? 'text-[#0F6E45]'
                      : userCriminalAnalysis.status === 'has_record'
                      ? 'text-[#B90E0A]'
                      : 'text-zinc-600'
                  }
                >
                  {userCriminalAnalysis.profileAutoStamp}
                </span>
              </span>
              <span className="text-zinc-500 block mt-0.5">
                Karşılıklı onayda açılacak iletişim tercihin:{' '}
                <strong className="text-zinc-800">{userPlatformLabel}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onGoToCriminalCheck}
            className="px-4 py-2 rounded-xl border border-zinc-900 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap hover:bg-zinc-800"
          >
            {userCriminalAnalysis.status === 'unverified'
              ? 'e-Devlet Barkod Sorgula'
              : 'Sicil Sorgusunu Güncelle'}
          </button>
          <button
            type="button"
            onClick={onGoToQuestionnaire}
            className="px-4 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 text-xs font-semibold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Bilgilerimi Düzenle</span>
          </button>
        </div>
      </div>

      {/* EŞLEŞME KARTLARI LİSTESİ (GÖRSELDEKİ KART TASARIMI İLE BİREBİR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {visibleMatches.map((item) => {
          const {
            candidate,
            overallScore,
            isBlockedByRedFilter,
            blockedReasons,
            verdictBadge,
            topPercentileLabel,
            verdictHeadline,
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
              className={`bg-white rounded-[28px] border p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                isBlockedByRedFilter
                  ? 'border-red-300'
                  : candidateHasRecord
                  ? 'border-amber-300'
                  : 'border-zinc-200/90'
              }`}
            >
              <div>
                {/* ÜST KISIM: Sol (İsim + Yaş · Boy · Yapı · Şehir · Başlık) | Sağ (%91 + Çok yüksek uyum + ilk %2) */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-[26px] font-bold text-zinc-900 leading-tight">
                      {candidate.firstName}
                    </h2>
                    <p className="text-sm sm:text-[15px] text-zinc-600 leading-snug mt-1">
                      {candidate.age} yaş · {candidate.heightCm} cm · {candidate.bodyType} ·{' '}
                      {candidate.city} · {candidate.personaTitle}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {candidate.profession} • {candidate.tags.siyaset} • {candidate.tags.takim}
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

                {/* GRİ KİŞİSEL ÖZELLİK ETİKETLERİ (Görseldeki gibi) */}
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

                {/* ORTAK İLGİ ALANLARINIZ (Yeşil Etiketler) */}
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

                {/* UYUMLU OLDUĞUNUZ KONULAR (★ Yıldızlı Virgüllü Metin) */}
                <div className="mt-5 text-xs sm:text-[13.5px] leading-relaxed text-zinc-700">
                  <strong className="text-[#0F6E45] font-bold">
                    Uyumlu olduğunuz konular:{' '}
                  </strong>
                  <span>{matchedTopicsWithStar.join(', ')}</span>
                </div>

                {/* FARKLI OLDUĞUNUZ KONULAR */}
                <div className="mt-3 text-xs sm:text-[13.5px] leading-relaxed text-zinc-700">
                  <strong className="text-[#9A5B13] font-bold">
                    Farklı olduğunuz konular:{' '}
                  </strong>
                  <span>{differingTopicsWithStar.join(', ')}</span>
                </div>

                {/* Kırmızı Kutucuk Engeli Varsa */}
                {isBlockedByRedFilter && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-900">
                    <XCircle className="w-4 h-4 text-[#B90E0A] shrink-0 mt-0.5" />
                    <div>
                      <strong>Kırmızı Kutucuk Filtresine Takıldı:</strong>{' '}
                      {blockedReasons.join(' • ')}
                    </div>
                  </div>
                )}

                {/* e-DEVLET OTOMATİK PROFİL SİCİL KAYDI ŞERİDİ */}
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  {candidate.criminalRecord.clean ? (
                    <div className="flex items-center justify-between gap-2 text-xs text-[#0F6E45] bg-[#E6F4EC]/60 px-3 py-2 rounded-xl">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{candidate.criminalRecord.profileAutoStamp}</span>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-900/70 shrink-0">
                        {candidate.criminalRecord.barcodeMasked}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#B90E0A]">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>OTOMATİK PROFİL KAYDI — ADLİ SİCİL KAYDI MEVCUTTUR</span>
                      </div>
                      <p className="text-[11px] text-red-900">
                        {candidate.criminalRecord.profileAutoStamp}
                      </p>
                    </div>
                  )}
                </div>

                {/* 38 Konuya Göre Hesaplandı Satırı + Tavsiye */}
                <p className="mt-3 text-xs text-zinc-400">
                  Uyum puanı {evaluatedTopicsCount} konuya göre hesaplandı · çok bilgiyle.
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-600 italic">
                  “{verdictHeadline}”
                </p>
              </div>

              {/* ALT BUTONLAR: İlgileniyorum | Geç | Engelle + WhatsApp/Instagram Açılış Alanı */}
              <div className="mt-5 pt-4 border-t border-zinc-100">
                {previewPremiumMode ? (
                  <div className="p-3.5 rounded-2xl border border-zinc-300 bg-[#FAF8F5] text-xs text-zinc-700 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-semibold text-zinc-900">
                      <Lock className="w-4 h-4" />
                      <span>İletişim Kurma Premium Üyelik Kapsamındadır</span>
                    </span>
                  </div>
                ) : (
                  <>
                    {reqState === 'none' && (
                      <div className="space-y-3">
                        {/* Eğer adayın adli sicil kaydı varsa karşı tarafın (kullanıcının) onay kutucuğu */}
                        {candidateHasRecord && (
                          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-300 cursor-pointer text-xs text-red-950">
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
                            <span className="leading-relaxed">
                              <strong>Adli Sicil Kaydı Kabul Onayı:</strong> {candidate.firstName} adlı adayın e-Devlet sorgusunda{' '}
                              <span className="underline font-semibold">
                                {candidate.criminalRecord.recordSummary}
                              </span>{' '}
                              bulunduğunu gördüm ve kabul ederek iletişime geçmek istiyorum.
                            </span>
                          </label>
                        )}

                        {/* Görseldeki 3'lü Buton Dizilimi: İlgileniyorum | Geç | Engelle */}
                        <div className="grid grid-cols-12 gap-2.5">
                          <button
                            type="button"
                            disabled={candidateHasRecord && !isCandidateRecordAccepted}
                            onClick={() => handleRequestContact(candidate.id)}
                            className={`col-span-6 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                              candidateHasRecord && !isCandidateRecordAccepted
                                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                : 'bg-[#0F6E45] hover:bg-[#0b5736] text-white shadow-sm'
                            }`}
                          >
                            İlgileniyorum
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePassCandidate(candidate.id, 'passed')}
                            className="col-span-3 py-3 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-semibold transition-colors"
                          >
                            Geç
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePassCandidate(candidate.id, 'blocked')}
                            className="col-span-3 py-3 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-red-50 hover:border-red-300 hover:text-[#B90E0A] text-zinc-800 text-sm font-semibold transition-colors"
                          >
                            Engelle
                          </button>
                        </div>
                      </div>
                    )}

                    {reqState === 'requested' && (
                      <div className="space-y-3 animate-section-enter">
                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-zinc-300 text-xs text-zinc-800 space-y-1">
                          <div>
                            <strong>İlgileniyorum İsteği Gönderildi:</strong>{' '}
                            {candidate.firstName} ({candidate.poolCode}) onayladığında{' '}
                            <strong>
                              {candidate.preferredContactPlatform === 'whatsapp'
                                ? 'WhatsApp'
                                : candidate.preferredContactPlatform === 'instagram'
                                ? 'Instagram'
                                : 'WhatsApp & Instagram'}
                            </strong>{' '}
                            bağlantısı açılacak.
                          </div>
                        </div>

                        {userHasRecord && (
                          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 cursor-pointer text-xs text-amber-950">
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
                            <span className="leading-relaxed">
                              <strong>Karşı Tarafın Kabul Şartı:</strong> Profiline otomatik işlenen adli sicil kaydının karşı tarafça görülüp onaylandığını simüle et.
                            </span>
                          </label>
                        )}

                        <button
                          type="button"
                          disabled={userHasRecord && !hasCounterpartAcceptedUserRecord}
                          onClick={() => handleSimulateMutualApproval(candidate.id)}
                          className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold uppercase tracking-wider ${
                            userHasRecord && !hasCounterpartAcceptedUserRecord
                              ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                              : 'border-[#0F6E45] bg-[#E6F4EC] hover:bg-emerald-100 text-[#0F6E45]'
                          }`}
                        >
                          [Demo] {candidate.firstName} Onayını Simüle Et ve İletişimi Aç →
                        </button>
                      </div>
                    )}

                    {reqState === 'mutual_unlocked' && (
                      <div className="p-4 rounded-2xl bg-[#0F6E45] text-white space-y-2.5 animate-section-enter">
                        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-100">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Unlock className="w-3.5 h-3.5" />
                            KARŞILIKLI ONAY TAMAMLANDI
                          </span>
                          <span>İLETİŞİM AÇIK</span>
                        </div>

                        <div className="space-y-2">
                          {(candidate.preferredContactPlatform === 'whatsapp' ||
                            candidate.preferredContactPlatform === 'both') &&
                            candidate.whatsappNumber && (
                              <a
                                href={safeWaUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 px-3.5 rounded-xl bg-white text-[#0F6E45] hover:bg-emerald-50 text-xs font-bold flex items-center justify-between gap-2 transition-colors"
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <Phone className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    {candidate.firstName} ile WhatsApp’ta Konuş ({candidate.whatsappNumber})
                                  </span>
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
                                className="w-full py-2.5 px-3.5 rounded-xl bg-black/25 hover:bg-black/35 border border-white/30 text-white text-xs font-bold flex items-center justify-between gap-2 transition-colors"
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
                        </div>
                      </div>
                    )}
                  </>
                )}
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
