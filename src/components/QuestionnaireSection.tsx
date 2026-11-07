import React, { useState } from 'react';
import { QUESTIONS } from '../data/questionsData';
import {
  AdaptiveFollowUp,
  ContactPlatformChoice,
  UserAnswer,
  UserSelfProfile,
} from '../types/domain';
import {
  isValidInstagramHandle,
  isValidTurkishMobile,
  sanitizeInstagramHandle,
  sanitizeUserText,
} from '../utils/security';
import {
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Lock,
  MessageCircle,
} from 'lucide-react';

interface QuestionnaireSectionProps {
  profile: UserSelfProfile;
  onUpdateProfile: (profile: UserSelfProfile) => void;
  answers: Record<string, UserAnswer>;
  onUpdateAnswer: (questionId: string, updated: UserAnswer) => void;
  onApplyPresetPersona: (persona: 'muhafazakar' | 'sentez' | 'ataturkcu_sekuler') => void;
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
  // 0..9 arası normal sorular, 10 ise son adım: "WhatsApp mı Instagram mı?" iletişim tercihi
  const FINAL_CONTACT_STEP_INDEX = QUESTIONS.length;
  const TOTAL_STEPS = QUESTIONS.length + 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDir, setTransitionDir] = useState<'next' | 'prev'>('next');
  const [animKey, setAnimKey] = useState(0);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const isOnFinalContactStep = currentIndex === FINAL_CONTACT_STEP_INDEX;
  const currentQuestion = !isOnFinalContactStep ? QUESTIONS[currentIndex] : QUESTIONS[0];

  const currentAnswer: UserAnswer = answers[currentQuestion.id] || {
    questionId: currentQuestion.id,
    selectedOptionId: '',
    customOtherText: '',
    followUpSingleAnswers: {},
    followUpCustomTexts: {},
    excludedRedIds: [],
  };

  const activeFollowUps: AdaptiveFollowUp[] = !isOnFinalContactStep
    ? currentQuestion.followUps.filter((f) => {
        if (!currentAnswer.selectedOptionId) return false;
        if (f.triggerOptionIds.includes('*')) return true;
        return f.triggerOptionIds.includes(currentAnswer.selectedOptionId);
      })
    : [];

  const isQuestionStepComplete = (qIndex: number): boolean => {
    const q = QUESTIONS[qIndex];
    if (!q) return false;
    const ans = answers[q.id];
    if (!ans || !ans.selectedOptionId) return false;
    if (ans.selectedOptionId === 'other_custom' && !ans.customOtherText?.trim()) {
      return false;
    }
    const triggered = q.followUps.filter(
      (f) => f.triggerOptionIds.includes('*') || f.triggerOptionIds.includes(ans.selectedOptionId)
    );
    for (const f of triggered) {
      if (f.mode === 'single_select') {
        const subAns = ans.followUpSingleAnswers?.[f.id];
        if (!subAns) return false;
        if (subAns === 'other_custom' && !ans.followUpCustomTexts?.[f.id]?.trim()) {
          return false;
        }
      }
    }
    return true;
  };

  const isFinalContactStepValid = (): boolean => {
    const plat = profile.preferredContactPlatform;
    if (plat === 'whatsapp') {
      return isValidTurkishMobile(profile.whatsappNumber);
    }
    if (plat === 'instagram') {
      return isValidInstagramHandle(profile.instagramHandle);
    }
    if (plat === 'both') {
      return (
        isValidTurkishMobile(profile.whatsappNumber) &&
        isValidInstagramHandle(profile.instagramHandle)
      );
    }
    return false;
  };

  const isCurrentStepComplete = isOnFinalContactStep
    ? isFinalContactStepValid()
    : isQuestionStepComplete(currentIndex);

  const completedQuestionsCount =
    QUESTIONS.filter((_, idx) => isQuestionStepComplete(idx)).length +
    (profile.contactPreferenceConfirmed && isFinalContactStepValid() ? 1 : 0);

  const progressPercent = Math.round((completedQuestionsCount / TOTAL_STEPS) * 100);

  const goToStep = (targetIdx: number) => {
    if (targetIdx === currentIndex) return;
    if (targetIdx > currentIndex && !isCurrentStepComplete) {
      setValidationWarning(
        'Diğer adıma geçmeden önce lütfen bu soruyu cevapla (veya "Bahsetmek İstemiyorum" seçeneğini işaretle).'
      );
      return;
    }
    setValidationWarning(null);
    setTransitionDir(targetIdx > currentIndex ? 'next' : 'prev');
    setAnimKey((prev) => prev + 1);
    setCurrentIndex(targetIdx);
  };

  const handleSelectMainOption = (optionId: string) => {
    setValidationWarning(null);
    const updated: UserAnswer = {
      ...currentAnswer,
      selectedOptionId: optionId,
    };
    onUpdateAnswer(currentQuestion.id, updated);

    const triggeredFollowUps = currentQuestion.followUps.filter(
      (f) => f.triggerOptionIds.includes('*') || f.triggerOptionIds.includes(optionId)
    );

    if (triggeredFollowUps.length === 0 && optionId !== 'other_custom') {
      setTimeout(() => {
        setTransitionDir('next');
        setAnimKey((prev) => prev + 1);
        setCurrentIndex((prev) => Math.min(FINAL_CONTACT_STEP_INDEX, prev + 1));
      }, 280);
    }
  };

  const handleSelectFollowUpSingle = (followUpId: string, optionId: string) => {
    setValidationWarning(null);
    const nextSingleAnswers = {
      ...currentAnswer.followUpSingleAnswers,
      [followUpId]: optionId,
    };
    const updated: UserAnswer = {
      ...currentAnswer,
      followUpSingleAnswers: nextSingleAnswers,
    };
    onUpdateAnswer(currentQuestion.id, updated);

    const hasRedMulti = activeFollowUps.some((f) => f.mode === 'red_exclusion_multi');
    const allSinglesDone = activeFollowUps
      .filter((f) => f.mode === 'single_select')
      .every((f) => {
        const val = nextSingleAnswers[f.id];
        return Boolean(val) && val !== 'other_custom';
      });

    if (!hasRedMulti && allSinglesDone && optionId !== 'other_custom') {
      setTimeout(() => {
        setTransitionDir('next');
        setAnimKey((prev) => prev + 1);
        setCurrentIndex((prev) => Math.min(FINAL_CONTACT_STEP_INDEX, prev + 1));
      }, 300);
    }
  };

  const handleToggleRedExclusion = (optionId: string) => {
    const exists = currentAnswer.excludedRedIds.includes(optionId);
    const nextRed = exists
      ? currentAnswer.excludedRedIds.filter((id) => id !== optionId)
      : [...currentAnswer.excludedRedIds, optionId];

    onUpdateAnswer(currentQuestion.id, {
      ...currentAnswer,
      excludedRedIds: nextRed,
    });
  };

  const handleNextOrFinish = () => {
    if (!isCurrentStepComplete) {
      if (isOnFinalContactStep) {
        setValidationWarning(
          'Lütfen tercih ettiğin iletişim kanalını (WhatsApp telefon numarası veya Instagram kullanıcı adı) doğru formatta gir.'
        );
      } else {
        setValidationWarning(
          'Lütfen devam etmeden önce soruyu cevapla (listede yoksa "Diğer" veya "Bahsetmek İstemiyorum" seçebilirsin).'
        );
      }
      return;
    }

    setValidationWarning(null);
    if (!isOnFinalContactStep) {
      goToStep(currentIndex + 1);
    } else {
      onUpdateProfile({
        ...profile,
        contactPreferenceConfirmed: true,
      });
      onFinishQuestionnaire();
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-section-enter">
      {/* Üst Başlık ve Hızlı Test Doldurma */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            ADIM ADIM KENDİNİ TANIT & KIRMIZI ÇİZGİLERİNİ SEÇ
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-zinc-900 break-words">
            Seni Tanıyalım ve En Uygun Kişilerle Eşleştirelim
          </h1>
        </div>

        {/* Hızlı Test Profilleri */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-500 mr-1">Demo Hızlı Doldur:</span>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('muhafazakar');
              setAnimKey((k) => k + 1);
            }}
            className="px-3 py-2 rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 text-xs font-medium text-zinc-800 transition-all"
          >
            Muhafazakâr Profil
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('sentez');
              setAnimKey((k) => k + 1);
            }}
            className="px-3 py-2 rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 text-xs font-medium text-zinc-800 transition-all"
          >
            Dengeli / Milliyetçi
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('ataturkcu_sekuler');
              setAnimKey((k) => k + 1);
            }}
            className="px-3 py-2 rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 text-xs font-medium text-zinc-800 transition-all"
          >
            Atatürkçü / Seküler
          </button>
        </div>
      </div>

      {/* KVKK Uyarısı */}
      {!kvkkApproved && (
        <div className="mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-950 leading-relaxed">
              <strong>KVKK Sözleşmesi:</strong> Verdiğin yanıtların Türkiye’deki güvenli sunucumuzda saklanabilmesi için sözleşmeyi onaylaman gerekmektedir.
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestKvkkModal}
            className="px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-xs font-medium shrink-0 whitespace-nowrap"
          >
            Sözleşmeyi Onayla
          </button>
        </div>
      )}

      {/* Kişisel Tanıtım Kartı */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">GİZLİ ADAY KODUN</span>
              <span className="font-mono font-bold text-zinc-900">{profile.aliasCode}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">CİNSİYET / ARANAN</span>
              <span className="font-semibold text-zinc-900">
                {profile.gender === 'erkek' ? 'Erkek → Kadın Adaylar' : 'Kadın → Erkek Adaylar'}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">YAŞ & ŞEHİR</span>
              <span className="font-semibold text-zinc-900">
                {profile.age} Yaş • {profile.city}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">İLETİŞİM TERCİHİN</span>
              <span className="font-semibold text-emerald-800">
                {profile.preferredContactPlatform === 'whatsapp'
                  ? 'WhatsApp Üzerinden'
                  : profile.preferredContactPlatform === 'instagram'
                  ? 'Instagram Üzerinden'
                  : 'WhatsApp & Instagram'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileEditor(!showProfileEditor)}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-900 text-xs font-medium flex items-center gap-1.5 self-start sm:self-center shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showProfileEditor ? 'Bilgileri Kapat' : 'Temel Bilgilerini Düzenle'}</span>
          </button>
        </div>

        {showProfileEditor && (
          <div className="mt-5 pt-5 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-zinc-500 mb-1 font-medium">
                Cinsiyetin ve Aday Tercihin
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
                className="w-full p-2.5 rounded-lg border border-zinc-300 bg-[#FAF8F5]"
              >
                <option value="erkek">Erkek (Kadın Adaylarla Eşleş)</option>
                <option value="kadin">Kadın (Erkek Adaylarla Eşleş)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 mb-1 font-medium">Yaşın</label>
              <input
                type="number"
                min={18}
                max={65}
                value={profile.age}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    age: Math.min(65, Math.max(18, Number(e.target.value) || 25)),
                  })
                }
                className="w-full p-2.5 rounded-lg border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-1 font-medium">Yaşadığın Şehir</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, city: sanitizeUserText(e.target.value, 40) })
                }
                className="w-full p-2.5 rounded-lg border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-1 font-medium">Kısa Tanıtım Cümlen</label>
              <input
                type="text"
                value={profile.bio}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, bio: sanitizeUserText(e.target.value, 160) })
                }
                className="w-full p-2.5 rounded-lg border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Soru İlerleme Çubuğu ve Numaralar (01 - 11) */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between text-xs font-medium text-zinc-600 mb-2 gap-2">
          <span>
            {isOnFinalContactStep ? (
              <>
                Son Adım (11 / 11) —{' '}
                <strong className="text-zinc-900">Karşılıklı İletişim Tercihi (WhatsApp / Instagram)</strong>
              </>
            ) : (
              <>
                Soru {currentQuestion.code} / {TOTAL_STEPS} —{' '}
                <strong className="text-zinc-900">{currentQuestion.categoryLabel}</strong>
              </>
            )}
          </span>
          <span>%{progressPercent} Tamamlandı</span>
        </div>

        <div className="w-full h-2 rounded-full bg-zinc-200 mb-3 overflow-hidden">
          <div
            className="h-full bg-zinc-900 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
          {QUESTIONS.map((q, idx) => {
            const isAnswered = isQuestionStepComplete(idx);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToStep(idx)}
                className={`py-2.5 rounded-xl font-mono text-xs border transition-all flex items-center justify-center gap-1 ${
                  isCurrent
                    ? 'border-zinc-900 bg-zinc-900 text-white font-bold shadow-sm'
                    : isAnswered
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-zinc-200 bg-white text-zinc-400'
                }`}
              >
                <span>{q.code}</span>
                {isAnswered && !isCurrent && <Check className="w-3 h-3 text-emerald-700" />}
              </button>
            );
          })}

          {/* 11. Son Adım Sekmesi: İletişim Kanalı Tercihi */}
          <button
            type="button"
            onClick={() => goToStep(FINAL_CONTACT_STEP_INDEX)}
            className={`py-2.5 rounded-xl font-mono text-xs border transition-all flex items-center justify-center gap-1 col-span-2 sm:col-span-1 ${
              isOnFinalContactStep
                ? 'border-zinc-900 bg-zinc-900 text-white font-bold shadow-sm'
                : profile.contactPreferenceConfirmed && isFinalContactStepValid()
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                : 'border-zinc-200 bg-white text-zinc-400'
            }`}
          >
            <span>11</span>
            {profile.contactPreferenceConfirmed &&
              isFinalContactStepValid() &&
              !isOnFinalContactStep && <Check className="w-3 h-3 text-emerald-700" />}
          </button>
        </div>
      </div>

      {/* Zorunlu Cevaplama Uyarısı */}
      {validationWarning && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-medium flex items-center gap-2.5 animate-card-pop">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* SON ADIM (11): WHATSAPP MI INSTAGRAM MI İLETİŞİM TERCİHİ */}
      {isOnFinalContactStep ? (
        <div
          key={`final-contact-${animKey}`}
          className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-10 shadow-sm animate-section-enter"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Son Adım (11 / 11) • Karşılıklı İletişim Tercihi</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug mb-3">
            Eğer profiline uyan birisi seninle iletişime geçmek isterse ve sen de o kişiyle iletişime geçmek istersen, WhatsApp üzerinden mi yoksa Instagram üzerinden mi iletişime geçilsin?
          </h2>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Seçtiğin iletişim kanalı <strong>kesinlikle gizli tutulur</strong>. Sadece sen ve eşleştiğin kişi karşılıklı olarak “İletişime Geç” onayını verdiğinizde açılır.
          </p>

          {/* 3 Seçenek Kartı */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {(
              [
                {
                  id: 'whatsapp' as ContactPlatformChoice,
                  title: 'WhatsApp Üzerinden İletişime Geçilsin',
                  desc: 'Karşılıklı onay verildiğinde doğrudan WhatsApp sohbet bağlantısı açılır.',
                },
                {
                  id: 'instagram' as ContactPlatformChoice,
                  title: 'Instagram Üzerinden İletişime Geçilsin',
                  desc: 'Telefon numaramı paylaşmadan önce Instagram üzerinden tanışmayı tercih ederim.',
                },
                {
                  id: 'both' as ContactPlatformChoice,
                  title: 'Her İkisi de Olur (WhatsApp & Instagram)',
                  desc: 'Karşılıklı onaylandığında iki iletişim kanalım da eşleştiğim kişiye gösterilebilir.',
                },
              ] as const
            ).map((item) => {
              const isSelected = profile.preferredContactPlatform === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setValidationWarning(null);
                    onUpdateProfile({
                      ...profile,
                      preferredContactPlatform: item.id,
                    });
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-200 bg-[#FAF8F5] hover:border-zinc-500 text-zinc-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs uppercase tracking-wider opacity-75">
                        TERCİH
                      </span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-400 text-zinc-950'
                            : 'border-zinc-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-2">{item.title}</h3>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Seçime Göre Açılan Güvenli Giriş Kutuları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 rounded-2xl bg-[#FAF8F5] border border-zinc-200">
            {(profile.preferredContactPlatform === 'whatsapp' ||
              profile.preferredContactPlatform === 'both') && (
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2">
                  WhatsApp Telefon Numaran (Örn: 0532 123 45 67)
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={profile.whatsappNumber}
                  onChange={(e) => {
                    setValidationWarning(null);
                    onUpdateProfile({
                      ...profile,
                      whatsappNumber: sanitizeUserText(e.target.value, 20),
                    });
                  }}
                  placeholder="05XX XXX XX XX"
                  className="w-full p-3.5 rounded-xl border border-zinc-300 bg-white font-mono text-sm focus:outline-none focus:border-zinc-900"
                />
                <span className="block text-[11px] text-zinc-500 mt-1.5">
                  Sadece karşılıklı onay verdiğin kişiye uçtan uca şifreli açılır.
                </span>
              </div>
            )}

            {(profile.preferredContactPlatform === 'instagram' ||
              profile.preferredContactPlatform === 'both') && (
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2">
                  Instagram Kullanıcı Adın (Örn: @kullaniciadi)
                </label>
                <input
                  type="text"
                  value={profile.instagramHandle}
                  onChange={(e) => {
                    setValidationWarning(null);
                    onUpdateProfile({
                      ...profile,
                      instagramHandle: sanitizeInstagramHandle(e.target.value),
                    });
                  }}
                  placeholder="@kullaniciadi"
                  className="w-full p-3.5 rounded-xl border border-zinc-300 bg-white font-mono text-sm focus:outline-none focus:border-zinc-900"
                />
                <span className="block text-[11px] text-zinc-500 mt-1.5">
                  Sadece karşılıklı onay verdiğin kişiye gösterilir.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* NORMAL SORULAR (01 - 10) */
        <div
          key={`${currentQuestion.id}-${animKey}`}
          className={
            transitionDir === 'next' ? 'animate-question-next' : 'animate-question-prev'
          }
        >
          <div
            className={`grid grid-cols-1 gap-6 ${
              activeFollowUps.length > 0 ? 'lg:grid-cols-12' : 'lg:grid-cols-1'
            }`}
          >
            {/* SOL KART: Ana Soru Kutucukları */}
            <div
              className={`${
                activeFollowUps.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'
              } bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-sm flex flex-col justify-between min-w-0`}
            >
              <div>
                <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium mb-4">
                  <span>Soru {currentQuestion.code}</span>
                  <span>•</span>
                  <span>{currentQuestion.categoryLabel}</span>
                  <span>•</span>
                  <span className="text-red-700 font-semibold">Zorunlu</span>
                </div>

                <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 leading-snug mb-2 break-words">
                  {currentQuestion.prompt}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mb-6 leading-relaxed">
                  {currentQuestion.helperText}
                </p>

                {/* Tıklanabilir Kutucuklar */}
                <div className="flex flex-wrap gap-2.5">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectMainOption(opt.id)}
                        className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 text-left break-words ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm scale-[1.01]'
                            : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}

                  {/* DİĞER (KENDİN YAZ) */}
                  {currentQuestion.allowCustomOther && (
                    <button
                      type="button"
                      onClick={() => handleSelectMainOption('other_custom')}
                      className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 ${
                        currentAnswer.selectedOptionId === 'other_custom'
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                          : 'bg-zinc-50 text-zinc-700 border-dashed border-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      + Diğer (Kendim Yazacağım)
                    </button>
                  )}

                  {/* BAHSETMEK İSTEMİYORUM */}
                  {currentQuestion.allowPreferNotToSay && (
                    <button
                      type="button"
                      onClick={() => handleSelectMainOption('prefer_not_to_say')}
                      className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 ${
                        currentAnswer.selectedOptionId === 'prefer_not_to_say'
                          ? 'bg-zinc-700 text-white border-zinc-700 shadow-sm'
                          : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-800'
                      }`}
                    >
                      Bahsetmek İstemiyorum
                    </button>
                  )}
                </div>

                {/* "Diğer" Metin Kutusu */}
                {currentAnswer.selectedOptionId === 'other_custom' && (
                  <div className="mt-5 p-4 rounded-2xl bg-zinc-50 border border-zinc-300 animate-section-enter">
                    <label className="block text-xs font-semibold text-zinc-800 mb-2">
                      Listede olmayan cevabını buraya yaz:
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={currentAnswer.customOtherText || ''}
                      onChange={(e) =>
                        onUpdateAnswer(currentQuestion.id, {
                          ...currentAnswer,
                          customOtherText: sanitizeUserText(e.target.value, 100),
                        })
                      }
                      placeholder="Cevabını buraya yaz..."
                      className="w-full p-3 rounded-xl border border-zinc-300 bg-white text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                <span>Seçimin güvenli veritabanına anonim olarak kaydedilir.</span>
                {isCurrentStepComplete && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    Yanıtlandı
                  </span>
                )}
              </div>
            </div>

            {/* SAĞ KARTLAR: Cevaba Göre Açılan Alt Sorular ve Kırmızı Kutucuklar */}
            {activeFollowUps.length > 0 && (
              <div className="lg:col-span-6 space-y-6 animate-section-enter min-w-0">
                {activeFollowUps.map((followUp) => {
                  const isRedMode = followUp.mode === 'red_exclusion_multi';
                  const selectedSubId = currentAnswer.followUpSingleAnswers[followUp.id] || '';

                  return (
                    <div
                      key={followUp.id}
                      className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-sm min-w-0"
                    >
                      <h3 className="text-lg sm:text-2xl font-bold text-zinc-900 leading-snug mb-1.5 break-words">
                        {followUp.title.includes('kesinlikle') ? (
                          <>
                            {followUp.title.split('kesinlikle')[0]}
                            <span className="text-[#B90E0A]">
                              kesinlikle {followUp.title.split('kesinlikle')[1]}
                            </span>
                          </>
                        ) : (
                          followUp.title
                        )}
                      </h3>

                      {followUp.subtitle && (
                        <p className="text-xs sm:text-sm text-zinc-500 mb-5 leading-relaxed">
                          {followUp.subtitle}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2.5 mt-4">
                        {followUp.options.map((opt) => {
                          if (isRedMode) {
                            const isExcludedRed = currentAnswer.excludedRedIds.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleToggleRedExclusion(opt.id)}
                                className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 text-left break-words ${
                                  isExcludedRed
                                    ? 'bg-[#B90E0A] text-white border-[#B90E0A] shadow-sm scale-[1.01]'
                                    : 'bg-white text-zinc-800 border-zinc-200 hover:border-red-300 hover:bg-red-50/40'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          }

                          const isSubSelected = selectedSubId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectFollowUpSingle(followUp.id, opt.id)}
                              className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 text-left break-words ${
                                isSubSelected
                                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                  : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}

                        {!isRedMode && followUp.allowCustomOther && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectFollowUpSingle(followUp.id, 'other_custom')
                            }
                            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                              selectedSubId === 'other_custom'
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-zinc-50 text-zinc-700 border-dashed border-zinc-300 hover:border-zinc-600'
                            }`}
                          >
                            + Diğer (Kendin Yaz)
                          </button>
                        )}

                        {!isRedMode && followUp.allowPreferNotToSay && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectFollowUpSingle(followUp.id, 'prefer_not_to_say')
                            }
                            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                              selectedSubId === 'prefer_not_to_say'
                                ? 'bg-zinc-700 text-white border-zinc-700'
                                : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            Bahsetmek İstemiyorum
                          </button>
                        )}
                      </div>

                      {!isRedMode && selectedSubId === 'other_custom' && (
                        <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-300">
                          <input
                            type="text"
                            value={currentAnswer.followUpCustomTexts[followUp.id] || ''}
                            onChange={(e) =>
                              onUpdateAnswer(currentQuestion.id, {
                                ...currentAnswer,
                                followUpCustomTexts: {
                                  ...currentAnswer.followUpCustomTexts,
                                  [followUp.id]: sanitizeUserText(e.target.value, 100),
                                },
                              })
                            }
                            placeholder="Lütfen buraya yaz..."
                            className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-zinc-900"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alt Navigasyon Çubuğu */}
      <div className="mt-8 bg-white rounded-2xl border border-zinc-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <button
          type="button"
          onClick={() => goToStep(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-zinc-300 text-xs font-semibold uppercase tracking-wider text-zinc-700 disabled:opacity-40 flex items-center justify-center gap-2 hover:border-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Önceki Adım</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleNextOrFinish}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isCurrentStepComplete
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm cursor-pointer'
                : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {!isCurrentStepComplete && <Lock className="w-3.5 h-3.5 shrink-0" />}
            <span>
              {!isOnFinalContactStep
                ? 'Seçimi Kaydet ve Sonraki Soruya Geç'
                : 'Profili Tamamla ve Eşleşmeleri Gör'}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
};
