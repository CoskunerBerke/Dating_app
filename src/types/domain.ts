import { EncryptedIdentityEnvelope } from '../utils/cryptoVault';

export type QuestionCategory =
  | 'inanc_cemaat'
  | 'siyaset_dunya_gorusu'
  | 'meslek_yasam'
  | 'takim_spor_hobi'
  | 'sosyal_aliskanlik'
  | 'iliski_sinirlari';

export interface QuestionOption {
  id: string;
  label: string;
  groupTag?:
    | 'islam_muhafazakar'
    | 'islam_geleneksel'
    | 'sekuler'
    | 'diger_inanc'
    | 'ataturkcu'
    | 'milliyetci'
    | 'muhafazakar'
    | 'sol_sosyal'
    | 'liberal'
    | 'apolitik'
    | 'dengeli'
    | 'diger';
}

export interface FollowUpOption {
  id: string;
  label: string;
}

export interface FollowUpBlock {
  triggerOptionIds: string[];
  id: string;
  title: string;
  subtitle?: string;
  mode: 'single_select' | 'red_exclusion_multi';
  options: FollowUpOption[];
  allowCustomOther?: boolean;
  allowPreferNotToSay?: boolean;
}

export interface QuestionItem {
  id: string;
  code: string;
  category: QuestionCategory;
  categoryLabel: string;
  prompt: string;
  helperText: string;
  options: QuestionOption[];
  allowCustomOther: boolean;
  allowPreferNotToSay: boolean;
  followUps: FollowUpBlock[];
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  customOtherText?: string;
  followUpSingleAnswers: Record<string, string>;
  followUpCustomTexts: Record<string, string>;
  excludedRedIds: string[];
}

export type ContactPlatformChoice = 'whatsapp' | 'instagram' | 'email';

export interface UserSelfProfile {
  aliasCode: string;
  firstName: string; // İsim (Zorunlu)
  lastName: string; // Soy İsim (Zorunlu - Şifreli Kasa)
  phoneNumber: string; // Telefon Numarası (Zorunlu)
  email: string; // E-posta Adresi (Zorunlu)
  birthDate: string; // Doğum Tarihi (YYYY-MM-DD - Zorunlu)
  hometown: string; // Nereli Olduğu / Memleket (Zorunlu)
  city: string; // Yaşadığı Şehir (Zorunlu)
  gender: 'erkek' | 'kadin';
  lookingFor: 'kadin' | 'erkek';
  age: number;
  heightCm: number;
  bodyType: string;
  profession: string;
  personaTitle: string;
  relationshipDynamic: string;
  bio: string;
  characterTraits: string[];
  interests: string[];
  preferredContactPlatform: ContactPlatformChoice; // 'whatsapp' | 'instagram' | 'email'
  whatsappNumber: string;
  instagramHandle: string; // Opsiyonel (İletişim kanalı Instagram seçilmediyse)
  contactPreferenceConfirmed: boolean;
  smsVerified: boolean; // 6 Haneli SMS OTP Doğrulaması (Zorunlu)
  smsVerificationId?: string;
  cameraLivenessVerified: boolean; // Canlı Kamera Selfie Doğrulaması (Zorunlu)
  cameraLivenessHash?: string;
  registrationCompleted: boolean;
  encryptedEnvelope?: EncryptedIdentityEnvelope;
}

export interface KvkkConsentRecord {
  generalIlluminationAccepted: boolean;
  specialCategoryExplicitConsent: boolean;
  zeroRetentionPdfAccepted: boolean;
  trServerTransferAccepted: boolean;
  consentTimestamp?: string;
  consentId?: string;
}

export type CriminalRecordStatus =
  | 'unverified'
  | 'not_uploaded'
  | 'clean'
  | 'has_record'
  | 'invalid_document';

export interface CriminalRecordAnalysis {
  status: CriminalRecordStatus;
  uploaded: boolean; // Adli sicil belgesi yüklendi mi? (true: Yüklendi, false: Yüklenmedi)
  fileName?: string;
  fileSizeKB?: number;
  documentDate?: string;
  documentSayi?: string;
  maskedBarcode?: string;
  sorguTuru?: string;
  kullanimAmaci?: string;
  kimlikTuru?: string;
  maskedTcNo?: string;
  tcChecksumValid?: boolean;
  maskedName?: string;
  birthPlaceAndYear?: string;
  institution?: string;
  liveEdevletStatus?: string;
  verifiedAt?: string;
  verificationHash?: string;
  verificationTimestamp?: string;
  documentHash?: string;
  barcodeNumber?: string;
  officialSorguSayisi?: string;
  mernisVerified?: boolean;
  birthPlaceAndDate?: string;
  calculatedAge?: number;
  institutionTarget?: string;
  verificationMethod?: 'live_edevlet_barcode' | 'pdf_upload';
  adliSicilKaydiYoktur: boolean;
  arsivKaydiYoktur: boolean;
  hasActiveOrArchiveRecord: boolean;
  rawPdfPurged: boolean;
  summaryTitle: string;
  summaryDetail: string;
  profileAutoStamp: string;
  extractedRecordDetails?: string;
  detectedClauses: string[];
}

export interface CandidateProfile {
  id: string;
  poolCode: string;
  firstName: string;
  lastNameInitial: string; // Örn: "Y."
  gender: 'kadin' | 'erkek';
  age: number;
  birthYear: number;
  hometown: string; // Nereli olduğu (Örn: "Trabzon", "İzmir", "Kayseri")
  heightCm: number;
  bodyType: string;
  city: string;
  profession: string;
  personaTitle: string;
  relationshipDynamic: string;
  shortIntro: string;
  characterTraits: string[];
  interests: string[];
  favoriteVibe: string;
  preferredContactPlatform: ContactPlatformChoice;
  whatsappNumber: string;
  instagramHandle: string;
  emailAddress: string;
  encryptedContactHandle: string;
  smsVerified?: boolean;
  cameraLivenessVerified?: boolean;
  criminalRecord: {
    uploaded: boolean; // true = Yüklendi, false = Yüklenmedi
    verified: boolean;
    clean: boolean;
    verifiedAt?: string;
    barcodeMasked?: string;
    profileAutoStamp: string;
    recordSummary?: string;
  };
  tags: {
    inanc: string;
    mezhep: string;
    cemaat: string;
    siyaset: string;
    takim: string;
    spor: string;
    alkol: string;
    giyim: string;
  };
  allTraitIds: string[];
  excludedTraitIds: string[];
}

export type MatchTier =
  | 'yuksek_uyum'
  | 'ciddi_uyum'
  | 'sans_denenebilir'
  | 'dusuk_uyum';

export interface CategoryScoreBreakdown {
  category: QuestionCategory;
  label: string;
  score: number;
}

export interface MatchAnalysisResult {
  candidate: CandidateProfile;
  overallScore: number;
  isBlockedByRedFilter: boolean;
  blockedReasons: string[];
  tier: MatchTier;
  verdictBadge: string;
  topPercentileLabel: string;
  verdictHeadline: string;
  verdictAdvice: string;
  firstMessageIdea: string;
  commonInterests: string[];
  matchedTopicsWithStar: string[];
  differingTopicsWithStar: string[];
  evaluatedTopicsCount: number;
  categoryScores: CategoryScoreBreakdown[];
  sharedStrengths: string[];
  talkingPoints: string[];
}
