import React, { useState, useRef, useEffect } from 'react';
import {
  ContactPlatformChoice,
  FollowUpBlock,
  QuestionItem,
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
  CheckCircle2,
  Camera,
  MessageSquareCode,
  RefreshCw,
  VideoOff,
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
import {
  SmsOtpChallenge,
  analyzeLiveCameraFramesZeroRetention,
  issueSecureSmsOtpChallenge,
  verifySmsOtpCode,
} from '../utils/verificationSecurity';

interface QuestionnaireSectionProps {
  stepMode: 'kayit' | 'sorular';
  onChangeStepMode: (mode: 'kayit' | 'sorular') => void;
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

export function isSingleQuestionValid(
  question: QuestionItem,
  answer?: UserAnswer
): boolean {
  if (!answer || !answer.selectedOptionId) return false;
  if (
    answer.selectedOptionId === 'other_custom' &&
    !answer.customOtherText?.trim()
  ) {
    return false;
  }

  const activeFollowUps = question.followUps.filter((f) => {
    if (!answer.selectedOptionId) return false;
    if (answer.selectedOptionId === 'prefer_not_to_say') {
      return f.mode === 'red_exclusion_multi';
    }
    return (
      f.triggerOptionIds.includes('*') ||
      f.triggerOptionIds.includes(answer.selectedOptionId)
    );
  });

  for (const f of activeFollowUps) {
    if (f.mode === 'single_select') {
      const subSelected = answer.followUpSingleAnswers[f.id];
      if (!subSelected) return false;
      if (
        subSelected === 'other_custom' &&
        !answer.followUpCustomTexts[f.id]?.trim()
      ) {
        return false;
      }
    }
  }

  return true;
}

export const QuestionnaireSection: React.FC<QuestionnaireSectionProps> = ({
  stepMode,
  onChangeStepMode,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSealingVault, setIsSealingVault] = useState(false);

  // SMS OTP Güvenlik Durumları
  const [smsChallenge, setSmsChallenge] = useState<SmsOtpChallenge | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [simulatedSmsBannerCode, setSimulatedSmsBannerCode] = useState<string | null>(
    null
  );
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsCooldownSec, setSmsCooldownSec] = useState(0);
  const [isDispatchingSms, setIsDispatchingSms] = useState(false);

  // Canlı Kamera (Zero-Retention Biometric Liveness) Durumları
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanningLiveness, setIsScanningLiveness] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Kamera donanımını güvenli şekilde kapatma (Gizlilik garantisi)
  const stopCameraHardware = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCameraHardware();
    };
  }, []);

  // SMS Cooldown Geri Sayımı
  useEffect(() => {
    if (smsCooldownSec <= 0) return;
    const timer = setInterval(() => {
      setSmsCooldownSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [smsCooldownSec]);

  const currentQuestion = QUESTIONS[currentIndex] || QUESTIONS[0];
  const currentAnswer: UserAnswer = answers[currentQuestion.id] || {
    questionId: currentQuestion.id,
    selectedOptionId: '',
    customOtherText: '',
    followUpSingleAnswers: {},
    followUpCustomTexts: {},
    excludedRedIds: [],
  };

  const completedCount = QUESTIONS.filter((q) =>
    isSingleQuestionValid(q, answers[q.id])
  ).length;

  const progressPercent = Math.round((completedCount / QUESTIONS.length) * 100);

  const isQuestionUnlocked = (targetIdx: number): boolean => {
    if (!profile.registrationCompleted) return false;
    if (targetIdx === 0) return true;
    for (let i = 0; i < targetIdx; i++) {
      if (!isSingleQuestionValid(QUESTIONS[i], answers[QUESTIONS[i].id])) {
        return false;
      }
    }
    return true;
  };

  const activeFollowUps = currentQuestion.followUps.filter((f) => {
    if (!currentAnswer.selectedOptionId) return false;
    if (currentAnswer.selectedOptionId === 'prefer_not_to_say') {
      return f.mode === 'red_exclusion_multi';
    }
    return (
      f.triggerOptionIds.includes('*') ||
      f.triggerOptionIds.includes(answerOptionFallback(currentAnswer.selectedOptionId))
    );
  });

  function answerOptionFallback(id: string): string {
    return id;
  }

  // 1. SMS OTP Kodu Gönderme
  const handleSendSmsOtp = async () => {
    setSmsError(null);
    setValidationError(null);

    if (!isValidTurkishMobile(profile.phoneNumber)) {
      setSmsError(
        'SMS kodu göndermek için önce geçerli bir cep telefonu numarası (05XX XXX XX XX) girin.'
      );
      return;
    }

    if (smsCooldownSec > 0) {
      setSmsError(`Yeni SMS kodu istemek için lütfen ${smsCooldownSec} saniye bekleyin.`);
      return;
    }

    setIsDispatchingSms(true);
    try {
      const { challenge, simulatedSmsCode } = await issueSecureSmsOtpChallenge(
        profile.phoneNumber
      );
      setSmsChallenge(challenge);
      setSimulatedSmsBannerCode(simulatedSmsCode);
      setOtpInput('');
      setSmsCooldownSec(45);
    } finally {
      setIsDispatchingSms(false);
    }
  };

  // 2. SMS OTP Kodu Doğrulama (Sabit Zamanlı / Constant-Time)
  const handleVerifySmsOtp = async () => {
    setSmsError(null);
    if (!smsChallenge) {
      setSmsError('Lütfen önce SMS doğrulama kodu gönderin.');
      return;
    }

    const result = await verifySmsOtpCode(
      smsChallenge,
      otpInput,
      profile.phoneNumber
    );
    setSmsChallenge(result.updatedChallenge);

    if (!result.verified) {
      setSmsError(result.errorMessage || 'SMS kodu doğrulanamadı.');
      return;
    }

    // Doğrulama başarılı: Geçici SMS kodunu bellekten temizle
    setSimulatedSmsBannerCode(null);
    setOtpInput('');
    onUpdateProfile({
      ...profile,
      smsVerified: true,
      smsVerificationId: result.updatedChallenge.challengeId,
    });
  };

  // 3. Canlı Kamera Açma
  const handleStartLiveCamera = async () => {
    setCameraError(null);
    setValidationError(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        'Tarayıcınız güvenli kamera erişimini desteklemiyor. Lütfen HTTPS bağlantısı üzerinden modern bir tarayıcı kullanın.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {
            // Autoplay fallback
          });
        }
      }, 80);
    } catch {
      setCameraError(
        'Kamera erişim izni reddedildi veya cihazda kamera bulunamadı. Lütfen tarayıcı adres çubuğundan kamera iznini açın.'
      );
    }
  };

  // 4. Canlı Kamera Canlılık Doğrulaması (Sıfır Fotoğraf Saklama)
  const handleVerifyCameraLiveness = async () => {
    if (!videoRef.current) return;
    setCameraError(null);
    setIsScanningLiveness(true);

    try {
      const result = await analyzeLiveCameraFramesZeroRetention(videoRef.current);
      if (!result.ok || !result.proof) {
        setCameraError(
          result.errorMessage || 'Canlılık doğrulaması tamamlanamadı. Tekrar deneyin.'
        );
        return;
      }

      // Doğrulama başarılı: Kamerayı derhal kapat ve kanıt özetini kaydet
      stopCameraHardware();
      onUpdateProfile({
        ...profile,
        cameraLivenessVerified: true,
        cameraLivenessHash: result.proof.proofHash,
      });
    } finally {
      setIsScanningLiveness(false);
    }
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
    if (!profile.smsVerified) {
      return 'Güvenlik kuralı gereği lütfen telefon numaranı 6 haneli SMS kodu ile doğrula.';
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
    if (!profile.cameraLivenessVerified) {
      return 'Sahte profilleri engellemek için lütfen Canlı Kamera Doğrulamasını tamamla.';
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
      stopCameraHardware();
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

      onChangeStepMode('sorular');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSealingVault(false);
    }
  };

  const handleFillSampleRegistration = () => {
    setValidationError(null);
    setSmsError(null);
    setCameraError(null);
    onToggleKvkkApproved(true);
    onUpdateProfile({
      ...profile,
      firstName: 'Can',
      lastName: 'Yılmaz',
      phoneNumber: '0532 890 12 34',
      whatsappNumber: '0532 890 12 34',
      email: 'can.yilmaz@eposta.com',
      birthDate: '2000-05-14',
      age: 26,
      hometown: 'İzmir',
      city: 'İzmir',
      instagramHandle: 'can.mizan',
      preferredContactPlatform: 'whatsapp',
      contactPreferenceConfirmed: true,
      smsVerified: true,
      smsVerificationId: 'SMS-TR-DEMO9481',
      cameraLivenessVerified: true,
      cameraLivenessHash: 'LIVENESS-TR-8F42B91E7C04',
    });
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
    if (!isSingleQuestionValid(currentQuestion, currentAnswer)) {
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
      onChangeStepMode('kayit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8 animate-section-enter">
      {/* Üst Uygulama Adım Çubuğu (Önceki adım tamamlanmadan diğerine tıklanamaz) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="inline-flex bg-zinc-200/80 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setValidationError(null);
              onChangeStepMode('kayit');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              stepMode === 'kayit'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {profile.registrationCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6E45] shrink-0" />
            )}
            <span>1. Uygulamaya Kayıt Ol</span>
          </button>

          <button
            type="button"
            disabled={!profile.registrationCompleted}
            onClick={() => {
              if (!profile.registrationCompleted) return;
              setValidationError(null);
              onChangeStepMode('sorular');
            }}
            title={
              !profile.registrationCompleted
                ? '9 soruya geçebilmek için önce 1. Adımda uygulamaya kayıt olmalısın.'
                : '2. 9 Soru'
            }
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              stepMode === 'sorular'
                ? 'bg-white text-zinc-900 shadow-sm'
                : !profile.registrationCompleted
                ? 'text-zinc-400 opacity-50 cursor-not-allowed select-none'
                : 'text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {!profile.registrationCompleted && (
              <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
            <span>
              2. 9 Soru ({completedCount}/{QUESTIONS.length})
            </span>
          </button>
        </div>

        {stepMode === 'kayit' ? (
          <button
            type="button"
            onClick={handleFillSampleRegistration}
            className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-zinc-300 bg-white hover:border-zinc-900 text-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0F6E45]" />
            <span>Hızlı Test Kaydı Doldur</span>
          </button>
        ) : (
          profile.registrationCompleted && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0F6E45]" />
                Hızlı Cevapla:
              </span>
              <button
                type="button"
                onClick={() => {
                  onApplyPresetPersona('muhafazakar');
                  setValidationError(null);
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
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-zinc-300 bg-white hover:border-zinc-900 transition-colors"
              >
                Seküler
              </button>
            </div>
          )
        )}
      </div>

      {/* ADIM 1: UYGULAMAYA KAYIT OL (KİŞİSEL BİLGİLER + SMS OTP + CANLI KAMERA) */}
      {stepMode === 'kayit' && (
        <div className="bg-white rounded-[28px] border border-zinc-200/90 p-5 sm:p-8 shadow-sm space-y-6 animate-section-enter">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6E45]">
                ADIM 1 / 3 • ZORUNLU KİMLİK, SMS & KAMERA DOĞRULAMASI
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-0.5">
                Uygulamaya Kayıt Ol
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Kişisel bilgilerini gir, telefon numaranı 6 haneli SMS koduyla doğrula ve canlı kamera kontrolünü tamamla.
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
                    registrationCompleted: false,
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
                    registrationCompleted: false,
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
                  setSmsError(null);
                  const val = sanitizeUserText(e.target.value, 20);
                  // Numara değiştiğinde SMS doğrulaması sıfırlanır (Güvenlik kilidi)
                  onUpdateProfile({
                    ...profile,
                    phoneNumber: val,
                    whatsappNumber: val,
                    smsVerified: false,
                    smsVerificationId: undefined,
                    registrationCompleted: false,
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
                    registrationCompleted: false,
                  });
                }}
                placeholder="ornek@eposta.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              />
            </div>

            {/* GÜVENLİ SMS OTP DOĞRULAMA KUTUSU (Tam Genişlik) */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-[#FAF8F5] border border-zinc-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-[#0F6E45] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-zinc-900">
                    SMS Numara Doğrulaması (Zorunlu)
                  </span>
                </div>

                {profile.smsVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Numara SMS ile Doğrulandı ({profile.smsVerificationId})</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isDispatchingSms || smsCooldownSec > 0}
                    onClick={handleSendSmsOtp}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                  >
                    {isDispatchingSms
                      ? 'Gönderiliyor...'
                      : smsCooldownSec > 0
                      ? `Yeni Kod İste (${smsCooldownSec} sn)`
                      : smsChallenge
                      ? 'Yeni SMS Kodu Gönder'
                      : 'SMS Doğrulama Kodu Gönder'}
                  </button>
                )}
              </div>

              {!profile.smsVerified && (
                <>
                  <p className="text-[11px] text-zinc-500">
                    Başkasının numarasıyla kayıt olunmasını engellemek için CSPRNG + SHA-256 tuzlanmış 6 haneli tek kullanımlık SMS doğrulaması uygulanır. Maksimum 3 deneme hakkı vardır.
                  </p>

                  {simulatedSmsBannerCode && (
                    <div className="p-3 rounded-xl bg-emerald-950 text-emerald-100 border border-emerald-800 flex items-center justify-between gap-3 text-xs animate-section-enter">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          📲 GELEN SMS BİLDİRİMİ (MİZAN GÜVENLİK)
                        </span>
                        <span>
                          Tek kullanımlık doğrulama kodunuz:{' '}
                          <strong className="font-mono text-sm text-white tracking-widest bg-white/10 px-2 py-0.5 rounded">
                            {simulatedSmsBannerCode}
                          </strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpInput(simulatedSmsBannerCode)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shrink-0"
                      >
                        Kodu Yapıştır
                      </button>
                    </div>
                  )}

                  {smsChallenge && !smsChallenge.lockedOut && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => {
                          setSmsError(null);
                          setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                        }}
                        placeholder="6 Haneli SMS Kodu"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white font-mono text-sm tracking-widest font-bold focus:outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={handleVerifySmsOtp}
                        className="px-5 py-2.5 rounded-xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        SMS Kodunu Doğrula
                      </button>
                    </div>
                  )}

                  {smsError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                      {smsError}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Doğum Tarihi <span className="text-red-600">*</span>{' '}
                {profile.birthDate && (
                  <span className="text-[11px] font-semibold text-[#0F6E45]">
                    ({calculateAgeFromBirthDate(profile.birthDate)} Yaş)
                  </span>
                )}
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
                    registrationCompleted: false,
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
                    registrationCompleted: false,
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              >
                <option value="">Memleket Seçiniz...</option>
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
                    registrationCompleted: false,
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-zinc-900"
              >
                <option value="">Yaşadığın Şehri Seçiniz...</option>
                {TURKIYE_ILLER.map((il) => (
                  <option key={`sehir-${il}`} value={il}>
                    {il}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CANLI KAMERA (SELFIE) CANLILIK DOĞRULAMASI — SIFIR FOTOĞRAF SAKLAMA */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-zinc-200/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0F6E45] shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-zinc-900">
                  Canlı Kamera (Selfie) Doğrulaması (Zorunlu)
                </span>
              </div>

              {profile.cameraLivenessVerified ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Canlı Kamera Doğrulandı</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProfile({
                        ...profile,
                        cameraLivenessVerified: false,
                        cameraLivenessHash: undefined,
                        registrationCompleted: false,
                      });
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline"
                  >
                    Yeniden Çek
                  </button>
                </div>
              ) : !isCameraOpen ? (
                <button
                  type="button"
                  onClick={handleStartLiveCamera}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Kamerayı Aç ve Doğrula</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraHardware}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-zinc-700 text-xs font-semibold flex items-center gap-1"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Kamerayı Kapat</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              <strong>Sıfır Biyometrik Veri Saklama Garantisi:</strong> Kamera görüntünüz sunucuya gönderilmez ve fotoğrafınız kaydedilmez. Tarayıcı RAM'inde 450ms aralıklı 2 kare üzerinden canlılık (mikro-hareket ve doku) doğrulaması yapılır, ardından piksel belleği (<code>Uint8ClampedArray.fill(0)</code>) anında sıfırlanır.
            </p>

            {profile.cameraLivenessVerified && profile.cameraLivenessHash && (
              <div className="text-[11px] font-mono text-[#0F6E45] bg-[#E6F4EC]/70 px-3 py-1.5 rounded-xl border border-emerald-200">
                Kanıt Özeti: {profile.cameraLivenessHash} • Kamera Donanımı Kapalı (RAM Temizlendi)
              </div>
            )}

            {isCameraOpen && !profile.cameraLivenessVerified && (
              <div className="space-y-3 animate-section-enter">
                <div className="relative w-full max-w-xs mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 border-2 border-[#0F6E45]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-full pointer-events-none" />
                  <div className="absolute bottom-2 inset-x-2 text-center bg-black/65 text-white text-[11px] py-1 px-2 rounded-lg">
                    Yüzünüzü çerçevenin içine ortalayın ve hafifçe başınızı oynatın
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isScanningLiveness}
                  onClick={handleVerifyCameraLiveness}
                  className="w-full py-3 px-4 rounded-xl bg-[#0F6E45] hover:bg-[#0b5736] disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {isScanningLiveness ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Canlılık Analiz Ediliyor (450ms Çift Kare)...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Canlılığı Doğrula ve Kamerayı Kapat</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {cameraError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                {cameraError}
              </div>
            )}
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

          {/* Eşleşme Sonrası İletişim Kanalı Tercihi */}
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
              Kişisel bilgilerimin (isim, soy isim, telefon, e-posta, doğum tarihi) Türkiye sınırları içindeki TIER-III sunucularda AES-256-GCM şifrelemesiyle korunmasını ve kamera canlılık kontrolünde hiçbir görüntünün kaydedilmemesini kabul ediyorum.{' '}
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

      {/* ADIM 2: 9 SORULUK UYUM VE KIRMIZI ÇİZGİ TESTİ (Sadece kayıt tamamlandıysa açılır) */}
      {stepMode === 'sorular' && profile.registrationCompleted && (
        <div className="space-y-4 animate-section-enter">
          {/* 9 Soruluk Numaralı İlerleme Çubuğu (Önceki soru bitmeden sonraki numaraya tıklanamaz) */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-2">
              <span>
                ADIM 2 / 3 • SORU {currentIndex + 1} / {QUESTIONS.length}
              </span>
              <span className="text-[#0F6E45]">%{progressPercent} Tamamlandı</span>
            </div>

            <div className="grid grid-cols-9 gap-1.5">
              {QUESTIONS.map((q, idx) => {
                const isDone = isSingleQuestionValid(q, answers[q.id]);
                const isCurrent = idx === currentIndex;
                const unlocked = isQuestionUnlocked(idx);
                return (
                  <button
                    key={q.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return;
                      setValidationError(null);
                      setCurrentIndex(idx);
                    }}
                    title={
                      !unlocked
                        ? 'Önceki soruyu cevaplamadan bu soruya geçemezsin.'
                        : `${idx + 1}. Soru`
                    }
                    className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : isDone
                        ? 'bg-[#E6F4EC] text-[#0F6E45] border border-emerald-200'
                        : !unlocked
                        ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed select-none opacity-60'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
