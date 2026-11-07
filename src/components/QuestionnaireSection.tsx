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
  PlusCircle,
  EyeOff,
  Phone,
  Instagram,
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
  onFinishQuestionnaire,
}) => {
  // 'profil' adımında sadece kişisel bilgiler, 'sorular' adımında tek tek sorular görünür
  const [stepMode, setStepMode] = useState<'profil' | 'sorular'>('profil');
  const [currentIndex, setCurrentIndex] = useState(0);
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
      setValidationError('Lütfen devam etmek için bir seçenek işaretle.');
      return;
    }
    setValidationError(null);
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!isContactPreferenceStepValid()) {
        setValidationError(
          'Lütfen WhatsApp veya Instagram iletişim tercihini seç ve bilgini gir.'
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStepMode('profil');
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-section-enter">
      {/* Üst Sekme Seçici (1. Kişisel Bilgiler | 2. Sorular) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="inline-flex bg-zinc-200/70 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setStepMode('profil')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              stepMode === 'profil'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            1. Kişisel Bilgilerin
          </button>
          <button
            type="button"
            onClick={() => setStepMode('sorular')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              stepMode === 'sorular'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            2. Kriter Soruları ({completedCount}/{QUESTIONS.length})
          </button>
        </div>

        {/* Hızlı Demo Doldurma */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-zinc-400 mr-1">Demo:</span>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('muhafazakar');
              setStepMode('sorular');
            }}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-300 bg-white hover:border-zinc-900"
          >
            Muhafazakâr
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('sentez');
              setStepMode('sorular');
            }}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-300 bg-white hover:border-zinc-900"
          >
            Dengeli
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('ataturkcu_sekuler');
              setStepMode('sorular');
            }}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-300 bg-white hover:border-zinc-900"
          >
            Seküler
          </button>
        </div>
      </div>

      {/* ADIM 1: SADECE KİŞİSEL BİLGİLER KARTI */}
      {stepMode === 'profil' && (
        <div className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-section-enter">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Kişisel Bilgilerin
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Profil kartında görünecek temel bilgilerini ve ilgi alanlarını seç.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Adın
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
                placeholder="Can"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
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
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
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
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
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

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Şehir
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
                placeholder="İzmir"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Cinsiyetin
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
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
              </select>
            </div>
          </div>

          {/* Kişisel Özellik Etiketleri */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-2">
              Kişisel Özelliklerin
            </label>
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
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {trait}
                  </button>
                );
              })}
            </div>
          </div>

          {/* İlgi Alanları */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-2">
              İlgi Alanların
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const selected = profile.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleToggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-[#0F6E45] text-white'
                        : 'bg-[#E6F4EC] text-[#0F6E45] hover:bg-emerald-100'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStepMode('sorular');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Kaydet ve Sorulara Geç</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADIM 2: SADE SORU KARTI */}
      {stepMode === 'sorular' && (
        <div className="space-y-4 animate-section-enter">
          {/* İlerleme Çubuğu */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 mb-1.5">
              <span>
                Soru {currentIndex + 1} / {QUESTIONS.length}
              </span>
              <span>%{progressPercent}</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F6E45] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Tek ve Sade Soru Kartı */}
          <div
            key={currentQuestion.id}
            className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-7 animate-question-next"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug">
                {currentQuestion.prompt}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {currentQuestion.helperText}
              </p>

              <div className="flex flex-wrap gap-2.5 mt-4">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentAnswer.selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectMainOption(opt.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500'
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
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-dashed border-zinc-400 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>Diğer</span>
                  </button>
                )}

                {currentQuestion.allowPreferNotToSay && (
                  <button
                    type="button"
                    onClick={() => handleSelectMainOption('prefer_not_to_say')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                      currentAnswer.selectedOptionId === 'prefer_not_to_say'
                        ? 'border-zinc-700 bg-zinc-700 text-white'
                        : 'border-zinc-300 bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    <EyeOff className="w-4 h-4 shrink-0" />
                    <span>Bahsetmek İstemiyorum</span>
                  </button>
                )}
              </div>

              {currentAnswer.selectedOptionId === 'other_custom' && (
                <div className="mt-3">
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
                    placeholder="Kendi cevabını yaz..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-[#FAF8F5] text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}
            </div>

            {/* Alt Sorular & Kırmızı Kutucuklar */}
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
                        <span className="text-[#B90E0A]">
                          kesinlikle birlikte olmazsınız?
                        </span>
                      </>
                    ) : (
                      fBlock.title
                    )}
                  </h3>
                  {fBlock.subtitle && (
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      {fBlock.subtitle}
                    </p>
                  )}

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
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                              isRedSelected
                                ? 'border-[#B90E0A] bg-[#B90E0A] text-white shadow-sm'
                                : 'border-zinc-300 bg-white text-zinc-800 hover:border-red-300'
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
                          onClick={() =>
                            handleSelectFollowUpSingle(fBlock.id, subOpt.id)
                          }
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                            isSingleSelected
                              ? 'border-zinc-900 bg-zinc-900 text-white'
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
                        onClick={() =>
                          handleSelectFollowUpSingle(fBlock.id, 'other_custom')
                        }
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                          selectedSingle === 'other_custom'
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-dashed border-zinc-400 bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Diğer</span>
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
                    <div className="mt-3">
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
                        placeholder="Kendi cevabını yaz..."
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-[#FAF8F5] text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Son Soruda WhatsApp / Instagram Tercihi */}
            {currentIndex === QUESTIONS.length - 1 && (
              <div className="pt-6 border-t border-zinc-200 space-y-4 animate-section-enter">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                  Eğer profiline uyan birisi seninle iletişime geçmek isterse ve sen de o kişiyle iletişime geçmek istersen, WhatsApp üzerinden mi yoksa Instagram üzerinden mi iletişime geçilsin?
                </h3>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectContactPlatform('whatsapp')}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      profile.contactPreferenceConfirmed &&
                      profile.preferredContactPlatform === 'whatsapp'
                        ? 'border-[#0F6E45] bg-[#0F6E45] text-white'
                        : 'border-zinc-300 bg-white text-zinc-800'
                    }`}
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectContactPlatform('instagram')}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      profile.contactPreferenceConfirmed &&
                      profile.preferredContactPlatform === 'instagram'
                        ? 'border-[#0F6E45] bg-[#0F6E45] text-white'
                        : 'border-zinc-300 bg-white text-zinc-800'
                    }`}
                  >
                    <Instagram className="w-4 h-4 shrink-0" />
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectContactPlatform('both')}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
                      profile.contactPreferenceConfirmed &&
                      profile.preferredContactPlatform === 'both'
                        ? 'border-[#0F6E45] bg-[#0F6E45] text-white'
                        : 'border-zinc-300 bg-white text-zinc-800'
                    }`}
                  >
                    <span>Her İkisi</span>
                  </button>
                </div>

                {profile.contactPreferenceConfirmed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(profile.preferredContactPlatform === 'whatsapp' ||
                      profile.preferredContactPlatform === 'both') && (
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
                        placeholder="WhatsApp No (0532...)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-[#FAF8F5] text-sm"
                      />
                    )}

                    {(profile.preferredContactPlatform === 'instagram' ||
                      profile.preferredContactPlatform === 'both') && (
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
                        placeholder="Instagram kullanıcı adın"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-[#FAF8F5] text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {validationError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#B90E0A] shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* İleri / Geri */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGoPrev}
                className="px-4 py-3 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>

              <button
                type="button"
                onClick={handleGoNext}
                className="px-6 py-3 rounded-xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <span>
                  {currentIndex === QUESTIONS.length - 1
                    ? 'Eşleşmeleri Gör'
                    : 'Devam Et'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
