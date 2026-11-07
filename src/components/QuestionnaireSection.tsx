import React, { useState } from 'react';
import {
  ContactPlatformChoice,
  FollowUpBlock,
  UserAnswer,
  UserSelfProfile,
} from '../types/domain';
import { QUESTIONS } from '../data/questionsData';
import {
  AVAILABLE_BODY_TYPES,
  AVAILABLE_CHARACTER_TRAITS,
  AVAILABLE_INTERESTS,
} from '../data/candidatesPool';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
  UserCheck,
  PlusCircle,
  EyeOff,
  Phone,
  Instagram,
  ShieldCheck,
} from 'lucide-react';
import {
  isValidInstagramHandle,
  isValidTurkishMobile,
  sanitizeInstagramHandle,
  sanitizeUserText,
} from '../utils/security';

interface QuestionnaireSectionProps {
  profile: UserSelfProfile;
  onUpdateProfile: (updated: UserSelfProfile) => void;
  answers: Record<string, UserAnswer>;
  onUpdateAnswer: (questionId: string, updated: UserAnswer) => void;
  onApplyPresetPersona: (
    persona: 'muhafazakar' | 'sentez' | 'ataturkcu_sekuler'
  ) => void;
  kvkkApproved: boolean;
  onRequestKvkkModal: () => void;
  onFinishQuestionnaire: () => void;
}

export const QuestionnaireSection: React.FC<QuestionnaireSectionProps> = ({
  profile,
  onUpdateProfile,
  answers,
  onUpdateAnswer,
  onApplyPresetPersona,
  kvkkApproved,
  onRequestKvkkModal,
  onFinishQuestionnaire,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfileEditor, setShowProfileEditor] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer: UserAnswer = answers[currentQuestion.id] || {
    questionId: currentQuestion.id,
    selectedOptionId: '',
    customOtherText: '',
    followUpSingleAnswers: {},
    followUpCustomTexts: {},
    excludedRedIds: [],
  };

  const completedCount = QUESTIONS.filter((q) => {
    const a = answers[q.id];
    if (!a || !a.selectedOptionId) return false;
    if (a.selectedOptionId === 'other_custom' && !a.customOtherText?.trim()) {
      return false;
    }
    return true;
  }).length;

  const progressPercent = Math.round((completedCount / QUESTIONS.length) * 100);

  const activeFollowUps = currentQuestion.followUps.filter((f) => {
    if (!currentAnswer.selectedOptionId) return false;
    if (currentAnswer.selectedOptionId === 'prefer_not_to_say') {
      return f.mode === 'red_exclusion_multi';
    }
    return (
      f.triggerOptionIds.includes('*') ||
      f.triggerOptionIds.includes(currentAnswer.selectedOptionId)
    );
  });

  const isCurrentQuestionValid = (): boolean => {
    if (!currentAnswer.selectedOptionId) return false;
    if (
      currentAnswer.selectedOptionId === 'other_custom' &&
      !currentAnswer.customOtherText?.trim()
    ) {
      return false;
    }
    for (const f of activeFollowUps) {
      if (f.mode === 'single_select') {
        const subSelected = currentAnswer.followUpSingleAnswers[f.id];
        if (!subSelected) return false;
        if (
          subSelected === 'other_custom' &&
          !currentAnswer.followUpCustomTexts[f.id]?.trim()
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const isContactPreferenceStepValid = (): boolean => {
    if (!profile.contactPreferenceConfirmed) return false;
    if (
      profile.preferredContactPlatform === 'whatsapp' ||
      profile.preferredContactPlatform === 'both'
    ) {
      if (!isValidTurkishMobile(profile.whatsappNumber)) return false;
    }
    if (
      profile.preferredContactPlatform === 'instagram' ||
      profile.preferredContactPlatform === 'both'
    ) {
      if (!isValidInstagramHandle(profile.instagramHandle)) return false;
    }
    return true;
  };

  const handleToggleCharacterTrait = (trait: string) => {
    const exists = profile.characterTraits.includes(trait);
    const updatedTraits = exists
      ? profile.characterTraits.filter((t) => t !== trait)
      : [...profile.characterTraits, trait];
    onUpdateProfile({
      ...profile,
      characterTraits: updatedTraits,
    });
  };

  const handleToggleInterest = (interest: string) => {
    const exists = profile.interests.includes(interest);
    const updatedInterests = exists
      ? profile.interests.filter((i) => i !== interest)
      : [...profile.interests, interest];
    onUpdateProfile({
      ...profile,
      interests: updatedInterests,
    });
  };

  const handleSelectMainOption = (optionId: string) => {
    setValidationError(null);
    onUpdateAnswer(currentQuestion.id, {
      ...currentAnswer,
      selectedOptionId: optionId,
    });
  };

  const handleSelectFollowUpSingle = (followUpId: string, optionId: string) => {
    setValidationError(null);
    onUpdateAnswer(currentQuestion.id, {
      ...currentAnswer,
      followUpSingleAnswers: {
        ...currentAnswer.followUpSingleAnswers,
        [followUpId]: optionId,
      },
    });
  };

  const handleToggleRedExclusion = (optionId: string) => {
    const exists = currentAnswer.excludedRedIds.includes(optionId);
    const updatedRed = exists
      ? currentAnswer.excludedRedIds.filter((id) => id !== optionId)
      : [...currentAnswer.excludedRedIds, optionId];

    onUpdateAnswer(currentQuestion.id, {
      ...currentAnswer,
      excludedRedIds: updatedRed,
    });
  };

  const handleSelectContactPlatform = (platform: ContactPlatformChoice) => {
    setValidationError(null);
    onUpdateProfile({
      ...profile,
      preferredContactPlatform: platform,
      contactPreferenceConfirmed: true,
    });
  };

  const handleGoNext = () => {
    if (!isCurrentQuestionValid()) {
      setValidationError(
        'Diğer soruya geçebilmek için lütfen kendini tanıtan bir seçenek işaretle (veya "Bahsetmek İstemiyorum" seç).'
      );
      return;
    }
    setValidationError(null);
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 160, behavior: 'smooth' });
    } else {
      if (!isContactPreferenceStepValid()) {
        setValidationError(
          'Eşleşmeleri görmek için lütfen en alttaki "WhatsApp üzerinden mi yoksa Instagram üzerinden mi iletişime geçilsin?" sorusunu yanıtla ve geçerli iletişim bilgini gir.'
        );
        return;
      }
      onFinishQuestionnaire();
    }
  };

  const handleGoPrev = () => {
    setValidationError(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-section-enter">
      {/* KVKK Uyarısı */}
      {!kvkkApproved && (
        <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong className="font-semibold block">
                KVKK Açık Rıza Sözleşmesi Onayı
              </strong>
              Seçtiğin bilgilerin Türkiye sunucumuzda güvenle işlenebilmesi için KVKK sözleşmesini onaylaman gerekmektedir.
            </div>
          </div>
          <button
            type="button"
            onClick={onRequestKvkkModal}
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-mono uppercase tracking-wider rounded-lg shrink-0 whitespace-nowrap"
          >
            Sözleşmeyi Onayla
          </button>
        </div>
      )}

      {/* Üst Başlık ve Hızlı Demo Doldurma */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-1">
            ADIM ADIM KENDİNİ TANIT VE KIRMIZI ÇİZGİLERİNİ SEÇ
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-900">
            Kişisel Bilgilerin, Mizaç Özelliklerin ve Kriterlerin
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Hızlı Demo Doldur:
          </span>
          <button
            type="button"
            onClick={() => onApplyPresetPersona('muhafazakar')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 transition-colors"
          >
            Muhafazakâr Profil
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetPersona('sentez')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 transition-colors"
          >
            Dengeli / Milliyetçi
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetPersona('ataturkcu_sekuler')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 transition-colors"
          >
            Atatürkçü / Seküler
          </button>
        </div>
      </div>

      {/* KİŞİSEL BİLGİLER, BOY, FİZİKSEL YAPI, MİZAÇ ETİKETLERİ VE İLGİ ALANLARI KARTI */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 sm:p-7 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-base shrink-0">
              {profile.firstName ? profile.firstName[0].toUpperCase() : 'M'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-base text-zinc-900">
                  {profile.firstName || 'İsminiz'}
                </span>
                <span className="text-xs text-zinc-500">
                  {profile.age} yaş · {profile.heightCm} cm · {profile.bodyType} · {profile.city} · {profile.personaTitle}
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                {profile.characterTraits.length} kişisel özellik · {profile.interests.length} ilgi alanı seçildi
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileEditor(!showProfileEditor)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-zinc-300 hover:border-zinc-900 text-zinc-800 shrink-0"
          >
            {showProfileEditor ? 'Kişisel Bilgileri Gizle' : 'Kişisel Bilgilerimi Düzenle'}
          </button>
        </div>

        {showProfileEditor && (
          <div className="mt-6 space-y-6 animate-section-enter">
            {/* 1. Satır: İsim, Yaş, Boy (cm), Fiziksel Yapı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Adın / Hitap İsmin
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={profile.firstName}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      firstName: sanitizeUserText(e.target.value, 30),
                    })
                  }
                  placeholder="Örn: Can"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Yaşın
                </label>
                <input
                  type="number"
                  min={18}
                  max={75}
                  value={profile.age}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      age: Math.max(18, Math.min(75, Number(e.target.value) || 24)),
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Boyun (cm)
                </label>
                <input
                  type="number"
                  min={140}
                  max={220}
                  value={profile.heightCm}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      heightCm: Math.max(140, Math.min(220, Number(e.target.value) || 175)),
                    })
                  }
                  placeholder="Örn: 187"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Fiziksel Yapın
                </label>
                <select
                  value={profile.bodyType}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      bodyType: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                >
                  {AVAILABLE_BODY_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Satır: Cinsiyet Tercihi, Şehir, Meslek ve Kısa Başlık (Örn: Özgür Yolcu) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Cinsiyet & Aranan
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => {
                    const g = e.target.value as 'erkek' | 'kadin';
                    onUpdateProfile({
                      ...profile,
                      gender: g,
                      lookingFor: g === 'erkek' ? 'kadin' : 'erkek',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                >
                  <option value="erkek">Erkek (Kadın Adaylarla Eşleş)</option>
                  <option value="kadin">Kadın (Erkek Adaylarla Eşleş)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Yaşadığın Şehir
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={profile.city}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      city: sanitizeUserText(e.target.value, 40),
                    })
                  }
                  placeholder="Örn: İzmir"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Mesleğin
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={profile.profession}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      profession: sanitizeUserText(e.target.value, 50),
                    })
                  }
                  placeholder="Örn: Mimar / Yazılımcı"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500 mb-1.5">
                  Karakter Tanımın
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={profile.personaTitle}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      personaTitle: sanitizeUserText(e.target.value, 40),
                    })
                  }
                  placeholder="Örn: Özgür Yolcu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
                />
              </div>
            </div>

            {/* 3. Satır: Kişisel Mizaç ve Karakter Özellikleri (Görseldeki Gri Etiketler) */}
            <div className="pt-2 border-t border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-900">
                  Seni Tanımlayan Kişisel Özellikler (Birden Fazla Seçebilirsin)
                </label>
                <span className="text-[11px] text-zinc-500">
                  Profil kartında gri etiket olarak görünür
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CHARACTER_TRAITS.map((trait) => {
                  const selected = profile.characterTraits.includes(trait);
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleToggleCharacterTrait(trait)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selected
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Satır: İlgi Alanların (Görseldeki Yeşil "Ortak İlgi Alanlarınız" Etiketleri) */}
            <div className="pt-2 border-t border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-900">
                  İlgi Alanların ve Hobilerin (Ortak İlgi Alanlarını Yakalamak İçin Seç)
                </label>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Ortak olanlar yeşil etiketle öne çıkar
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const selected = profile.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selected
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Canlı Kart Önizlemesi (Kullanıcının Kendi Kartının Görseldeki Gibi Önizlemesi) */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-zinc-200">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                PROFİL KARTININ KARŞI TARAFA GÖRÜNÜMÜ (CANLI ÖNİZLEME)
              </span>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-zinc-900">
                    {profile.firstName || 'Can'}
                  </h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {profile.age} yaş · {profile.heightCm} cm · {profile.bodyType} · {profile.city} · {profile.personaTitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-700">%91</span>
                  <span className="block text-xs font-bold text-zinc-800">Çok yüksek uyum</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.characterTraits.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full bg-zinc-200/80 text-zinc-800 text-[11px] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {profile.interests.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-bold text-zinc-800 block mb-1.5">
                    Seçtiğin ilgi alanları ({profile.interests.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* İlerleme Çubuğu ve Numaralı Sekmeler */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-600 mb-2">
          <span>
            SORU {currentIndex + 1} / {QUESTIONS.length} •{' '}
            <strong className="text-zinc-900">{currentQuestion.categoryLabel}</strong>
          </span>
          <span>%{progressPercent} TAMAMLANDI</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {QUESTIONS.map((q, idx) => {
            const ans = answers[q.id];
            const isDone = Boolean(ans?.selectedOptionId);
            const isActive = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  if (idx <= currentIndex || isDone) {
                    setValidationError(null);
                    setCurrentIndex(idx);
                  }
                }}
                className={`py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  isActive
                    ? 'border-zinc-900 bg-zinc-900 text-white font-bold'
                    : isDone
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-zinc-200 bg-white text-zinc-400 cursor-not-allowed'
                }`}
              >
                {q.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* ANA SORU KARTI */}
      <div
        key={currentQuestion.id}
        className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-8 animate-question-next"
      >
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium mb-3">
            Soru {currentQuestion.code} • Cevaplamak Zorunludur
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug">
            {currentQuestion.prompt}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
            {currentQuestion.helperText}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            {currentQuestion.options.map((opt) => {
              const isSelected = currentAnswer.selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectMainOption(opt.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 flex items-center gap-2 ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm scale-[1.01]'
                      : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}

            {currentQuestion.allowCustomOther && (
              <button
                type="button"
                onClick={() => handleSelectMainOption('other_custom')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                  currentAnswer.selectedOptionId === 'other_custom'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-dashed border-zinc-400 bg-zinc-50 text-zinc-700 hover:border-zinc-800'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Diğer (Kendim Yazacağım)</span>
              </button>
            )}

            {currentQuestion.allowPreferNotToSay && (
              <button
                type="button"
                onClick={() => handleSelectMainOption('prefer_not_to_say')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                  currentAnswer.selectedOptionId === 'prefer_not_to_say'
                    ? 'border-zinc-700 bg-zinc-700 text-white'
                    : 'border-zinc-300 bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <EyeOff className="w-4 h-4 shrink-0" />
                <span>Bahsetmek İstemiyorum</span>
              </button>
            )}
          </div>

          {currentAnswer.selectedOptionId === 'other_custom' && (
            <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-zinc-300 animate-section-enter">
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Lütfen kendi cevabını kısaca yaz:
              </label>
              <input
                type="text"
                maxLength={140}
                value={currentAnswer.customOtherText || ''}
                onChange={(e) =>
                  onUpdateAnswer(currentQuestion.id, {
                    ...currentAnswer,
                    customOtherText: sanitizeUserText(e.target.value, 140),
                  })
                }
                placeholder="Listede olmayan görüşünü, takımını, mesleğini veya tercihini buraya yaz..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>
          )}
        </div>

        {/* ALT SORULAR & KIRMIZI KUTUCUKLAR */}
        {activeFollowUps.map((fBlock: FollowUpBlock) => {
          const isRedMode = fBlock.mode === 'red_exclusion_multi';
          const selectedSingle = currentAnswer.followUpSingleAnswers[fBlock.id] || '';

          return (
            <div
              key={fBlock.id}
              className="pt-6 border-t border-zinc-200 animate-section-enter"
            >
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
                {isRedMode ? (
                  <>
                    {fBlock.title.replace('kesinlikle birlikte olmazsınız?', '')}{' '}
                    <span className="text-[#B90E0A] underline decoration-[#B90E0A]/40">
                      kesinlikle birlikte olmazsınız?
                    </span>
                  </>
                ) : (
                  fBlock.title
                )}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">{fBlock.subtitle}</p>

              <div className="flex flex-wrap gap-2.5 mt-4">
                {fBlock.options.map((subOpt) => {
                  if (isRedMode) {
                    const isRedSelected = currentAnswer.excludedRedIds.includes(
                      subOpt.id
                    );
                    return (
                      <button
                        key={subOpt.id}
                        type="button"
                        onClick={() => handleToggleRedExclusion(subOpt.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 ${
                          isRedSelected
                            ? 'border-[#B90E0A] bg-[#B90E0A] text-white shadow-sm scale-[1.02]'
                            : 'border-zinc-300 bg-white text-zinc-800 hover:border-red-300 hover:bg-red-50/40'
                        }`}
                      >
                        {subOpt.label}
                      </button>
                    );
                  }

                  const isSingleSelected = selectedSingle === subOpt.id;
                  return (
                    <button
                      key={subOpt.id}
                      type="button"
                      onClick={() => handleSelectFollowUpSingle(fBlock.id, subOpt.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 flex items-center gap-1.5 ${
                        isSingleSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500'
                      }`}
                    >
                      <span>{subOpt.label}</span>
                      {isSingleSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}

                {!isRedMode && fBlock.allowCustomOther && (
                  <button
                    type="button"
                    onClick={() => handleSelectFollowUpSingle(fBlock.id, 'other_custom')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                      selectedSingle === 'other_custom'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-dashed border-zinc-400 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Diğer (Yazacağım)</span>
                  </button>
                )}

                {!isRedMode && fBlock.allowPreferNotToSay && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectFollowUpSingle(fBlock.id, 'prefer_not_to_say')
                    }
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                      selectedSingle === 'prefer_not_to_say'
                        ? 'border-zinc-700 bg-zinc-700 text-white'
                        : 'border-zinc-300 bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Bahsetmek İstemiyorum</span>
                  </button>
                )}
              </div>

              {!isRedMode && selectedSingle === 'other_custom' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-zinc-300">
                  <input
                    type="text"
                    maxLength={140}
                    value={currentAnswer.followUpCustomTexts[fBlock.id] || ''}
                    onChange={(e) =>
                      onUpdateAnswer(currentQuestion.id, {
                        ...currentAnswer,
                        followUpCustomTexts: {
                          ...currentAnswer.followUpCustomTexts,
                          [fBlock.id]: sanitizeUserText(e.target.value, 140),
                        },
                      })
                    }
                    placeholder="Lütfen kendi cevabını buraya yaz..."
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* SON SORUDA (10. SORU) WHATSAPP / INSTAGRAM İLETİŞİM TERCİHİ */}
        {currentIndex === QUESTIONS.length - 1 && (
          <div className="pt-8 border-t-2 border-zinc-900 space-y-5 animate-section-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Profil Tamamlama • Son Zorunlu Tercih</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
              Eğer profiline uyan birisi seninle iletişime geçmek isterse ve sen de o kişiyle iletişime geçmek istersen,{' '}
              <span className="underline decoration-zinc-900">
                WhatsApp üzerinden mi yoksa Instagram üzerinden mi
              </span>{' '}
              iletişime geçilsin?
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              İletişim bilgin Türkiye sunucumuzda şifreli olarak saklanır ve kimseye açık gösterilmez. Yalnızca iki taraf da karşılıklı onay verdiğinde seçtiğin kanal açılır.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSelectContactPlatform('whatsapp')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  profile.contactPreferenceConfirmed &&
                  profile.preferredContactPlatform === 'whatsapp'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block text-sm font-bold">WhatsApp</span>
                    <span className="block text-[11px] opacity-80">
                      WhatsApp üzerinden yazışılsın
                    </span>
                  </div>
                </div>
                {profile.contactPreferenceConfirmed &&
                  profile.preferredContactPlatform === 'whatsapp' && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectContactPlatform('instagram')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  profile.contactPreferenceConfirmed &&
                  profile.preferredContactPlatform === 'instagram'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block text-sm font-bold">Instagram</span>
                    <span className="block text-[11px] opacity-80">
                      Instagram üzerinden iletişime geçilsin
                    </span>
                  </div>
                </div>
                {profile.contactPreferenceConfirmed &&
                  profile.preferredContactPlatform === 'instagram' && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectContactPlatform('both')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  profile.contactPreferenceConfirmed &&
                  profile.preferredContactPlatform === 'both'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-600'
                }`}
              >
                <div>
                  <span className="block text-sm font-bold">Her İkisi de Olur</span>
                  <span className="block text-[11px] opacity-80">
                    WhatsApp veya Instagram fark etmez
                  </span>
                </div>
                {profile.contactPreferenceConfirmed &&
                  profile.preferredContactPlatform === 'both' && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
              </button>
            </div>

            {profile.contactPreferenceConfirmed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-zinc-300">
                {(profile.preferredContactPlatform === 'whatsapp' ||
                  profile.preferredContactPlatform === 'both') && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      WhatsApp Telefon Numaran (Karşılıklı Onayda Açılır)
                    </label>
                    <input
                      type="tel"
                      maxLength={20}
                      value={profile.whatsappNumber}
                      onChange={(e) =>
                        onUpdateProfile({
                          ...profile,
                          whatsappNumber: sanitizeUserText(e.target.value, 20),
                        })
                      }
                      placeholder="0532 890 12 34"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                )}

                {(profile.preferredContactPlatform === 'instagram' ||
                  profile.preferredContactPlatform === 'both') && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Instagram Kullanıcı Adın (Karşılıklı Onayda Açılır)
                    </label>
                    <input
                      type="text"
                      maxLength={35}
                      value={profile.instagramHandle}
                      onChange={(e) =>
                        onUpdateProfile({
                          ...profile,
                          instagramHandle: sanitizeInstagramHandle(e.target.value),
                        })
                      }
                      placeholder="kullanici.adin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {validationError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#B90E0A] shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Alt Gezinme Çubuğu */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleGoPrev}
            disabled={currentIndex === 0}
            className={`px-5 py-3 rounded-xl border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 ${
              currentIndex === 0
                ? 'border-zinc-200 text-zinc-300 cursor-not-allowed'
                : 'border-zinc-300 text-zinc-800 hover:border-zinc-900 bg-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Önceki Soru</span>
          </button>

          <button
            type="button"
            onClick={handleGoNext}
            className={`px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isCurrentQuestionValid() &&
              (currentIndex < QUESTIONS.length - 1 || isContactPreferenceStepValid())
                ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
                : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
            }`}
          >
            <span>
              {currentIndex === QUESTIONS.length - 1
                ? 'Kaydet ve Eşleşmeleri Gör'
                : 'Kaydet ve Sonraki Soruya Geç'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
