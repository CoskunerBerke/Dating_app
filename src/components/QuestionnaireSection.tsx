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
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  TURKIYE_ILLER,
  calculateAgeFromBirthDate,
  isValidAdultBirthDate,
  isValidEmail,
  isValidInstagramHandle,
  isValidTurkishMobile,
  sanitizeEmail,
  sanitizeInstagramHandle,
  sanitizeUserText,
} from '../utils/security';
import { sealIdentityWithAes256Gcm } from '../utils/cryptoVault';

interface QuestionnaireSectionProps {
  profile: UserSelfProfile;
  onUpdateProfile: (updated: UserSelfProfile) => void;
  answers: Record<string, UserAnswer>;
  onUpdateAnswer: (questionId: string, updated: UserAnswer) => void;
  onApplyPresetPersona: (
    persona: 'muhafazakar' | 'sentez' | 'ataturkcu_sekuler'
  ) => void;
  kvkkApproved: boolean;
  onToggleKvkkApproved: (approved: boolean) => void;
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
  onToggleKvkkApproved,
  onRequestKvkkModal,
  onFinishQuestionnaire,
}) => {
  const [stepMode, setStepMode] = useState<'kayit' | 'sorular'>(
    profile.registrationCompleted ? 'sorular' : 'kayit'
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSealingVault, setIsSealingVault] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex] || QUESTIONS[0];
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

  const progressPercent = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);

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

  const validateRegistrationStep = (): string | null => {
    if (profile.firstName.trim().length < 2) {
      return 'Lütfen adını gir (en az 2 harf).';
    }
    if (profile.lastName.trim().length < 2) {
      return 'Lütfen soyadını gir (en az 2 harf). Soyadın şifreli kasada tutulur, diğer adaylara açık gösterilmez.';
    }
    if (!isValidTurkishMobile(profile.phoneNumber)) {
      return 'Lütfen geçerli bir Türkiye cep telefonu numarası gir (Örn: 0532 123 45 67).';
    }
    if (!isValidEmail(profile.email)) {
      return 'Lütfen geçerli bir e-posta (mail) adresi gir (Örn: ad.soyad@ornek.com).';
    }
    if (!isValidAdultBirthDate(profile.birthDate)) {
      return 'Lütfen geçerli bir doğum tarihi seç (Uygulamaya kayıt için 18 yaş sınırı zorunludur).';
    }
    if (!profile.hometown.trim()) {
      return 'Lütfen nereli olduğunu (memleketini) seç.';
    }
    if (!profile.city.trim()) {
      return 'Lütfen şu an yaşadığın şehri seç.';
    }
    if (
      profile.preferredContactPlatform === 'instagram' &&
      !isValidInstagramHandle(profile.instagramHandle)
    ) {
      return 'İletişim tercihi olarak Instagram seçtiğin için lütfen geçerli bir Instagram kullanıcı adı gir.';
    }
    if (
      profile.instagramHandle.trim().length > 0 &&
      !isValidInstagramHandle(profile.instagramHandle)
    ) {
      return 'Instagram kullanıcı adı geçersiz karakter içeriyor.';
    }
    if (!kvkkApproved) {
      return 'Devam etmek için Türkiye Yerel Sunucu ve KVKK Açık Rıza onay kutusunu işaretlemelisin.';
    }
    return null;
  };

  const handleCompleteRegistrationAndStartQuestions = async () => {
    const errorMsg = validateRegistrationStep();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }
    setValidationError(null);
    setIsSealingVault(true);
    try {
      const calculatedAge = calculateAgeFromBirthDate(profile.birthDate);
      const envelope = await sealIdentityWithAes256Gcm({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phoneNumber: profile.phoneNumber.trim(),
        email: profile.email.trim(),
        birthDate: profile.birthDate,
        hometown: profile.hometown,
        city: profile.city,
        instagramHandle: profile.instagramHandle.trim(),
        preferredContactChannel: profile.preferredContactPlatform,
      });

      onUpdateProfile({
        ...profile,
        age: calculatedAge,
        whatsappNumber: profile.phoneNumber.trim(),
        contactPreferenceConfirmed: true,
        registrationCompleted: true,
        encryptedEnvelope: envelope,
      });

      setStepMode('sorular');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSealingVault(false);
    }
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

  const handleGoNextQuestion = () => {
    if (!isCurrentQuestionValid()) {
      setValidationError('Lütfen devam etmek için bu sorudaki zorunlu seçimi tamamla.');
      return;
    }
    setValidationError(null);
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onFinishQuestionnaire();
    }
  };

  const handleGoPrevQuestion = () => {
    setValidationError(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStepMode('kayit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8 animate-section-enter">
      {/* Üst Uygulama Adım Çubuğu + Hızlı Demo */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="inline-flex bg-zinc-200/80 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setValidationError(null);
              setStepMode('kayit');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              stepMode === 'kayit'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            1. Uygulamaya Kayıt Ol
          </button>
          <button
            type="button"
            onClick={() => {
              const err = validateRegistrationStep();
              if (err) {
                setValidationError(err);
                setStepMode('kayit');
                return;
              }
              setValidationError(null);
              setStepMode('sorular');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              stepMode === 'sorular'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            2. 9 Soru ({completedCount}/{QUESTIONS.length})
          </button>
        </div>

        {/* Hızlı Test Profilleri */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#0F6E45]" />
            Hızlı Doldur:
          </span>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('muhafazakar');
              setValidationError(null);
              setStepMode('sorular');
            }}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 transition-colors"
          >
            Muhafazakâr
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('sentez');
              setValidationError(null);
              setStepMode('sorular');
            }}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 transition-colors"
          >
            Dengeli
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('ataturkcu_sekuler');
              setValidationError(null);
              setStepMode('sorular');
            }}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 transition-colors"
          >
            Seküler
          </button>
        </div>
      </div>

      {/* ADIM 1: UYGULAMAYA KAYIT OL (KİŞİSEL BİLGİLER & İLETİŞİM KANALI) */}
      {stepMode === 'kayit' && (
        <div className="bg-white rounded-[28px] border border-zinc-200/90 p-5 sm:p-8 shadow-sm space-y-6 animate-section-enter">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6E45]">
                ADIM 1 / 3 • GÜVENLİ KAYIT
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-0.5">
                Uygulamaya Kayıt Ol
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Eşleşme algoritmasının seni doğru tanıması ve karşılıklı onayda iletişim kurulabilmesi için kişisel bilgilerini eksiksiz doldur.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F6E45] text-[11px] font-bold shrink-0">
              <Lock className="w-3.5 h-3.5" />
              <span>AES-256-GCM TR Kasa</span>
            </div>
          </div>

          {/* Kişisel Kimlik & İletişim Alanları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                İsim <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                maxLength={30}
                autoComplete="given-name"
                value={profile.firstName}
                onChange={(e) => {
                  setValidationError(null);
                  onUpdateProfile({
                    ...profile,
                    firstName: sanitizeUserText(e.target.value, 30),
                  });
                }}
                placeholder="Örn: Can"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Soy İsim <span className="text-red-600">*</span>{' '}
                <span className="text-[10px] font-normal text-zinc-500">
                  (Şifreli tutulur, gizlidir)
                </span>
              </label>
              <input
                type="text"
                maxLength={35}
                autoComplete="family-name"
                value={profile.lastName}
                onChange={(e) => {
                  setValidationError(null);
                  onUpdateProfile({
                    ...profile,
                    lastName: sanitizeUserText(e.target.value, 35),
                  });
                }}
                placeholder="Örn: Yılmaz"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Telefon Numarası <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                maxLength={20}
                autoComplete="tel"
                value={profile.phoneNumber}
                onChange={(e) => {
                  setValidationError(null);
                  const val = sanitizeUserText(e.target.value, 20);
                  onUpdateProfile({
                    ...profile,
                    phoneNumber: val,
                    whatsappNumber: val,
                  });
                }}
                placeholder="0532 123 45 67"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Mail Adresi (E-posta) <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                maxLength={80}
                autoComplete="email"
                value={profile.email}
                onChange={(e) => {
                  setValidationError(null);
                  onUpdateProfile({
                    ...profile,
                    email: sanitizeEmail(e.target.value),
                  });
                }}
                placeholder="ornek@eposta.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Doğum Tarihi <span className="text-red-600">*</span>{' '}
                <span className="text-[11px] font-semibold text-[#0F6E45]">
                  ({calculateAgeFromBirthDate(profile.birthDate)} Yaş)
                </span>
              </label>
              <input
                type="date"
                max="2008-12-31"
                min="1950-01-01"
                value={profile.birthDate}
                onChange={(e) => {
                  setValidationError(null);
                  const nextBirth = e.target.value;
                  onUpdateProfile({
                    ...profile,
                    birthDate: nextBirth,
                    age: calculateAgeFromBirthDate(nextBirth),
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Instagram Adresi{' '}
                <span className="text-[11px] font-normal text-zinc-500">
                  (Opsiyonel)
                </span>
              </label>
              <input
                type="text"
                maxLength={35}
                value={profile.instagramHandle}
                onChange={(e) => {
                  setValidationError(null);
                  onUpdateProfile({
                    ...profile,
                    instagramHandle: sanitizeInstagramHandle(e.target.value),
                  });
                }}
                placeholder="kullanici_adin (opsiyonel)"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Nerelisin? (Memleket) <span className="text-red-600">*</span>
              </label>
              <select
                value={profile.hometown}
                onChange={(e) => {
                  setValidationError(null);
                  onUpdateProfile({
                    ...profile,
                    hometown: e.target.value,
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              >
                {TURKIYE_ILLER.map((il) => (
                  <option key={`memleket-${il}`} value={il}>
                    {il}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Şu An Yaşadığın Şehir <span className="text-red-600">*</span>
              </label>
              <select
                value={profile.city}
                onChange={(e) => {
                  setValidationError(null);
                  onUpdateProfile({
                    ...profile,
                    city: e.target.value,
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              >
                {TURKIYE_ILLER.map((il) => (
                  <option key={`sehir-${il}`} value={il}>
                    {il}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cinsiyet, Boy ve Fiziksel Yapı */}
          <div className="grid grid-cols-3 gap-3.5 pt-2 border-t border-zinc-100">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
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
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
              >
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
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
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
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
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium"
              >
                {AVAILABLE_BODY_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Eşleşme Sonrası İletişim Kanalı Tercihi (Telefon/WhatsApp, Mail, Instagram bağlantısı) */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-zinc-200/90 space-y-3">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-zinc-900">
                Eşleşme Olduğunda Nasıl İletişim Kurulsun?
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
                Yukarıda girdiğin numara, mail ve Instagram bilgileri yalnızca karşılıklı eşleşme sağlandığında, aşağıda seçtiğin kanal üzerinden karşı tarafa açılır:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectContactPlatform('whatsapp')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  profile.preferredContactPlatform === 'whatsapp'
                    ? 'border-[#0F6E45] bg-[#0F6E45] text-white shadow-sm'
                    : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500'
                }`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Telefon / WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectContactPlatform('instagram')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  profile.preferredContactPlatform === 'instagram'
                    ? 'border-[#0F6E45] bg-[#0F6E45] text-white shadow-sm'
                    : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500'
                }`}
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span>Instagram Adresi</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectContactPlatform('email')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  profile.preferredContactPlatform === 'email'
                    ? 'border-[#0F6E45] bg-[#0F6E45] text-white shadow-sm'
                    : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Mail Adresi</span>
              </button>
            </div>
          </div>

          {/* Kişisel Özellik Etiketleri */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-2">
              Seni Tanımlayan Özellikler
            </label>
            <div className="flex flex-wrap gap-1.5">
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
            <div className="flex flex-wrap gap-1.5">
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

          {/* KVKK ve Türkiye Yerel Veri Saklama Onayı */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
            <input
              id="kvkk-register-check"
              type="checkbox"
              checked={kvkkApproved}
              onChange={(e) => {
                setValidationError(null);
                onToggleKvkkApproved(e.target.checked);
              }}
              className="mt-1 w-4 h-4 accent-[#0F6E45] rounded cursor-pointer shrink-0"
            />
            <div className="text-xs text-zinc-600 leading-relaxed">
              <label htmlFor="kvkk-register-check" className="font-semibold text-zinc-900 cursor-pointer">
                6698 Sayılı KVKK Açık Rıza ve Türkiye İçi Şifreli Veri Saklama Onayı:
              </label>{' '}
              Kişisel bilgilerimin (isim, soy isim, telefon, e-posta, doğum tarihi) Türkiye sınırları içindeki TIER-III sunucularda AES-256-GCM şifrelemesiyle korunmasını kabul ediyorum.{' '}
              <button
                type="button"
                onClick={onRequestKvkkModal}
                className="text-[#0F6E45] font-bold underline hover:text-emerald-800"
              >
                Metni İncele
              </button>
            </div>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B90E0A] shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSealingVault}
            onClick={handleCompleteRegistrationAndStartQuestions}
            className="w-full py-4 px-6 rounded-2xl bg-[#0F6E45] hover:bg-[#0b5736] disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSealingVault
                ? 'AES-256-GCM Kasası Mühürleniyor...'
                : 'Kaydı Tamamla ve 9 Soruya Başla'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADIM 2: 9 SORULUK UYUM VE KIRMIZI ÇİZGİ TESTİ */}
      {stepMode === 'sorular' && (
        <div className="space-y-4 animate-section-enter">
          {/* 9 Soruluk Numaralı İlerleme Çubuğu */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-2">
              <span>
                ADIM 2 / 3 • SORU {currentIndex + 1} / {QUESTIONS.length}
              </span>
              <span className="text-[#0F6E45]">%{progressPercent} Tamamlandı</span>
            </div>

            <div className="grid grid-cols-9 gap-1.5">
              {QUESTIONS.map((q, idx) => {
                const isDone = Boolean(answers[q.id]?.selectedOptionId);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setValidationError(null);
                      setCurrentIndex(idx);
                    }}
                    className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : isDone
                        ? 'bg-[#E6F4EC] text-[#0F6E45] border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tek ve Sade Soru Kartı */}
          <div
            key={currentQuestion.id}
            className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-7 animate-question-next"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6E45]">
                  SORU {currentQuestion.code} / 09 • {currentQuestion.categoryLabel}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Zorunlu Seçim
                </span>
              </div>
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
                onClick={handleGoPrevQuestion}
                className="px-4 py-3 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>
                  {currentIndex === 0 ? 'Kayıt Bilgilerine Dön' : 'Önceki Soru'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleGoNextQuestion}
                className="px-6 py-3 rounded-xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>
                  {currentIndex === QUESTIONS.length - 1
                    ? '9 Soruyu Bitir → Adli Sicil Adımına Geç'
                    : `Sonraki Soru (${currentIndex + 2}/9)`}
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
