export type QuestionCategory =
  | 'inanc_maneviyat'
  | 'dunya_gorusu_degerler'
  | 'yasam_tarzi_sosyal'
  | 'maddi_dinamikler'
  | 'iletisim_sinirlar'
  | 'gelecek_vizyonu';

export type QuestionLayoutShape =
  | 'bento_2x2'
  | 'versus_split'
  | 'spectrum_horizontal'
  | 'editorial_cards';

export interface QuestionOption {
  id: string;
  shortTag: string;
  label: string;
  subtext: string;
  weightVector: number[];
  compatibleWith: string[];
  partialCompatibleWith: string[];
}

export interface QuestionItem {
  id: string;
  code: string;
  category: QuestionCategory;
  categoryLabel: string;
  layoutShape: QuestionLayoutShape;
  psychModel: string;
  prompt: string;
  scenarioContext: string;
  options: QuestionOption[];
  defaultDealbreakerWeight: number;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isDealbreaker: boolean;
}

export interface UserSelfProfile {
  aliasCode: string;
  gender: 'erkek' | 'kadin';
  lookingFor: 'kadin' | 'erkek';
  age: number;
  city: string;
  profession: string;
  education: string;
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
  education: string;
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
  answers: Record<string, string>;
  dealbreakers: string[];
  encryptedContactHandle: string;
}

export interface CategoryScoreBreakdown {
  category: QuestionCategory;
  label: string;
  score: number;
}

export type MatchTier =
  | 'yuksek_kimya'
  | 'ciddi_uyum'
  | 'sans_denenebilir'
  | 'dusuk_uyum';

export interface MatchAnalysisResult {
  candidate: CandidateProfile;
  overallScore: number;
  tier: MatchTier;
  verdictBadge: string;
  verdictHeadline: string;
  verdictAdvice: string;
  icebreakerSuggestion: string;
  categoryScores: CategoryScoreBreakdown[];
  sharedStrengths: string[];
  talkingPoints: string[];
  hardConflicts: string[];
}
