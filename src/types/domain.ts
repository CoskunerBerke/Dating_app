export type QuestionCategory =
  | 'inanc_maneviyat'
  | 'dunya_gorusu_degerler'
  | 'yasam_tarzi_sosyal'
  | 'evlilik_ekonomi'
  | 'kriz_iletisim'
  | 'aile_gelecek';

export interface QuestionOption {
  id: string;
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
  marriageTimeline: string;
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
  barcodeNumber?: string; // Örn: ADB02889192793 -> ADB02889****
  documentSayi?: string; // Örn: 0000-2026-4371793248 / 13:11
  documentDate?: string; // Örn: İNTERNET (www.turkiye.gov.tr) / 07.11.2026
  sorguTuru?: string; // Örn: TİCARET SİCİLİ / RESMİ / ÖZEL
  kullanimAmaci?: string; // Örn: KENDİM İÇİN
  kimlikTuru?: string; // Örn: MERNİS
  maskedTcNo?: string; // Örn: 100******34 (MERNİS Checksum Doğrulandı)
  tcChecksumValid?: boolean;
  maskedName?: string; // Örn: B*** C***
  birthPlaceAndYear?: string; // Örn: ÇANKAYA / 2004 (Yaş Doğrulandı)
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
  marriageTimeline: string;
  shortIntro: string;
  expectationsNote: string;
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
  | 'nikah_masasi'
  | 'nisanlanabilir'
  | 'sans_denenebilir'
  | 'dusuk_uyum';

export interface MatchAnalysisResult {
  candidate: CandidateProfile;
  overallScore: number;
  tier: MatchTier;
  verdictBadge: string;
  verdictHeadline: string;
  verdictAdvice: string;
  categoryScores: CategoryScoreBreakdown[];
  sharedStrengths: string[];
  talkingPoints: string[];
  hardConflicts: string[];
}
