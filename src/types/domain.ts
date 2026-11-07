export type QuestionCategory =
  | 'inanc_cemaat'
  | 'siyaset_dunya_gorusu'
  | 'meslek_yasam'
  | 'takim_spor_hobi'
  | 'sosyal_aliskanlik'
  | 'iliski_sinirlari';

export interface ChipOption {
  id: string;
  label: string;
  groupTag?: string;
}

export interface AdaptiveFollowUp {
  triggerOptionIds: string[];
  id: string;
  title: string;
  subtitle?: string;
  mode: 'single_select' | 'red_exclusion_multi';
  options: ChipOption[];
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
  options: ChipOption[];
  allowCustomOther: boolean;
  allowPreferNotToSay: boolean;
  followUps: AdaptiveFollowUp[];
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  customOtherText?: string;
  followUpSingleAnswers: Record<string, string>;
  followUpCustomTexts: Record<string, string>;
  excludedRedIds: string[];
}

export type ContactPlatformChoice = 'whatsapp' | 'instagram' | 'both';

export interface UserSelfProfile {
  aliasCode: string;
  gender: 'erkek' | 'kadin';
  lookingFor: 'kadin' | 'erkek';
  age: number;
  city: string;
  profession: string;
  relationshipDynamic: string;
  bio: string;
  preferredContactPlatform: ContactPlatformChoice;
  whatsappNumber: string;
  instagramHandle: string;
  contactPreferenceConfirmed: boolean;
}

export interface KvkkConsentRecord {
  generalIlluminationAccepted: boolean;
  specialCategoryExplicitConsent: boolean;
  zeroRetentionPdfAccepted: boolean;
  trServerTransferAccepted: boolean;
  consentTimestamp: string;
  consentId: string;
}

export interface CriminalRecordAnalysis {
  status: 'unverified' | 'clean' | 'has_record' | 'invalid_document';
  fileName?: string;
  fileSizeKB?: number;
  barcodeNumber?: string; // Örn: ADB02889192793 (Karekodun altındaki resmi kod)
  maskedBarcode?: string; // Örn: ADB02889****
  documentSayi?: string;
  documentDate?: string;
  sorguTuru?: string;
  kullanimAmaci?: string;
  kimlikTuru?: string;
  maskedTcNo?: string;
  tcChecksumValid?: boolean;
  maskedName?: string;
  birthPlaceAndYear?: string;
  institution?: string;
  adliSicilKaydiYoktur: boolean;
  arsivKaydiYoktur: boolean;
  hasActiveOrArchiveRecord: boolean;
  extractedRecordDetails?: string; // Kayıt varsa otomatik profile yazdırılan mahkeme/suç satırı
  profileAutoStamp: string; // Profile otomatik ve değiştirilemez şekilde basılan resmi ibare
  liveEdevletStatus?: 'connected' | 'captcha_protected' | 'offline_verified';
  verifiedAt?: string;
  verificationHash?: string;
  rawPdfPurged: boolean;
  summaryTitle: string;
  summaryDetail: string;
  detectedClauses: string[];
}

export interface CandidateProfile {
  id: string;
  poolCode: string;
  gender: 'erkek' | 'kadin';
  age: number;
  city: string;
  profession: string;
  relationshipDynamic: string;
  shortIntro: string;
  expectationsNote: string;
  favoriteVibe: string;
  preferredContactPlatform: ContactPlatformChoice;
  whatsappNumber?: string;
  instagramHandle?: string;
  criminalRecord: {
    verified: boolean;
    clean: boolean;
    barcodeMasked: string;
    verifiedDate: string;
    profileAutoStamp: string;
    recordSummary?: string; // Eğer adli sicil kaydı varsa karşı tarafın onaylaması gereken otomatik kayıt metni
  };
  tags: {
    inanc: string;
    mezhep: string;
    cemaat: string;
    siyaset: string;
    takim: string;
    spor: string;
    meslek: string;
    alkol: string;
    giyim: string;
    muzik: string;
    kiskanclik: string;
  };
  allTraitIds: string[];
  excludedTraitIds: string[];
}

export interface CategoryScoreBreakdown {
  category: QuestionCategory;
  label: string;
  score: number;
}

export type MatchTier =
  | 'yuksek_uyum'
  | 'ciddi_uyum'
  | 'sans_denenebilir'
  | 'dusuk_uyum';

export interface MatchAnalysisResult {
  candidate: CandidateProfile;
  overallScore: number;
  isBlockedByRedFilter: boolean;
  blockedReasons: string[];
  tier: MatchTier;
  verdictBadge: string;
  verdictHeadline: string;
  verdictAdvice: string;
  firstMessageIdea: string;
  categoryScores: CategoryScoreBreakdown[];
  sharedStrengths: string[];
  talkingPoints: string[];
}
