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
  groupTag?: string; // Uyum motoru için grup kodu
}

export interface AdaptiveFollowUp {
  triggerOptionIds: string[]; // Hangi ana cevaplar seçildiğinde bu alt soru açılır ('*' ise her zaman açılır)
  id: string;
  title: string;
  subtitle?: string;
  mode: 'single_select' | 'red_exclusion_multi'; // Normal seçim mi yoksa 3. fotoğraftaki kırmızı "Kesinlikle İstemem" kutucukları mı?
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
  selectedOptionId: string; // Ana soruda seçilen kutucuk ID'si ('other_custom' veya 'prefer_not_to_say' dahil)
  customOtherText?: string; // "Diğer" seçildiyse kullanıcının yazdığı metin
  followUpSingleAnswers: Record<string, string>; // Alt sorulardaki tekli seçimler
  followUpCustomTexts: Record<string, string>; // Alt sorulardaki "Diğer" metinleri
  excludedRedIds: string[]; // 3. fotoğraftaki gibi kırmızı işaretlenen "Kesinlikle İstemem" ID'leri
}

export interface UserSelfProfile {
  aliasCode: string;
  gender: 'erkek' | 'kadin';
  lookingFor: 'kadin' | 'erkek';
  age: number;
  city: string;
  profession: string;
  relationshipDynamic: string;
  bio: string;
  contactChannel: string;
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
  barcodeNumber?: string;
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
  criminalRecord: {
    verified: boolean;
    clean: boolean;
    barcodeMasked: string;
    verifiedDate: string;
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
  allTraitIds: string[]; // Adayın sahip olduğu tüm özellik ID'leri (Kırmızı kutucuk filtrelemesi için)
  excludedTraitIds: string[]; // Adayın kesinlikle istemediği özellik ID'leri
  encryptedContactHandle: string;
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
