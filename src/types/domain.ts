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

export type ContactPlatformChoice = 'whatsapp' | 'instagram' | 'both';

export interface UserSelfProfile {
  aliasCode: string;
  firstName: string; // Örn: "Can", "Berke", "Zeynep"
  gender: 'erkek' | 'kadin';
  lookingFor: 'kadin' | 'erkek';
  age: number;
  heightCm: number; // Örn: 187
  bodyType: string; // Örn: "Orta yapılı", "Atletik / Fit", "İnce yapılı"
  city: string;
  profession: string;
  personaTitle: string; // Örn: "Özgür Yolcu"
  relationshipDynamic: string;
  bio: string;
  characterTraits: string[]; // Örn: ["Dinde esnek", "Bağımsız", "Açık sözlü", "Sabırlı", "Titiz ve bakımlı", "Düzenli", "Sakin mizaçlı", "Anlayışlı"]
  interests: string[]; // Örn: ["Film / dizi", "Seyahat", "Tarih / müze gezmek", "Arkadaşlarla sohbet"]
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
  consentTimestamp?: string;
  consentId?: string;
}

export type CriminalRecordStatus =
  | 'unverified'
  | 'clean'
  | 'has_record'
  | 'invalid_document';

export interface CriminalRecordAnalysis {
  status: CriminalRecordStatus;
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
  gender: 'kadin' | 'erkek';
  age: number;
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
  encryptedContactHandle: string;
  criminalRecord: {
    verified: boolean;
    clean: boolean;
    verifiedAt: string;
    barcodeMasked: string;
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
  topPercentileLabel: string; // Örn: "adaylarınız arasında ilk %2"
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
