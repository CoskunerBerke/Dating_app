import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import {
  QuestionnaireSection,
  isSingleQuestionValid,
} from './components/QuestionnaireSection';
import { CriminalRecordSection } from './components/CriminalRecordSection';
import { MatchesSection } from './components/MatchesSection';
import { KvkkConsentSection } from './components/KvkkConsentSection';
import {
  CriminalRecordAnalysis,
  KvkkConsentRecord,
  UserAnswer,
  UserSelfProfile,
} from './types/domain';
import { QUESTIONS } from './data/questionsData';
import { CANDIDATE_POOL } from './data/candidatesPool';
import { analyzeCompatibility } from './services/matchingEngine';
import { enforceZeroBrowserStorageLeak } from './utils/cryptoVault';

export function App() {
  // Uygulama doğrudan "1. Uygulamaya Kayıt Ol" adımında başlar; önceki adım bitmeden sonrakine geçilemez
  const [activeSection, setActiveSection] = useState<
    'kayit' | 'sorular' | 'sabika' | 'eslesmeler' | 'kvkk'
  >('kayit');

  const [criminalStepCompleted, setCriminalStepCompleted] = useState(false);

  useEffect(() => {
    enforceZeroBrowserStorageLeak();
  }, []);

  const [profile, setProfile] = useState<UserSelfProfile>({
    aliasCode: 'ADAY #TR-8941',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    birthDate: '',
    hometown: '',
    city: '',
    gender: 'erkek',
    lookingFor: 'kadin',
    age: 24,
    heightCm: 178,
    bodyType: 'Orta yapılı',
    profession: 'Belirtilmedi',
    personaTitle: 'Özgür Yolcu',
    relationshipDynamic: 'Uzun Vadeli & Ciddi İlişki',
    bio: '',
    characterTraits: [
      'Açık sözlü',
      'Sabırlı',
      'Titiz ve bakımlı',
      'Düzenli',
      'Sakin mizaçlı',
      'Anlayışlı',
    ],
    interests: [
      'Film / dizi',
      'Seyahat',
      'Tarih / müze gezmek',
      'Arkadaşlarla sohbet',
    ],
    preferredContactPlatform: 'whatsapp',
    whatsappNumber: '',
    instagramHandle: '',
    contactPreferenceConfirmed: true,
    registrationCompleted: false,
  });

  // Kullanıcı 9 soruyu sırayla tek tek cevaplar
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

  const [kvkkConsent, setKvkkConsent] = useState<KvkkConsentRecord>({
    generalIlluminationAccepted: true,
    specialCategoryExplicitConsent: false,
    zeroRetentionPdfAccepted: true,
    trServerTransferAccepted: true,
    consentTimestamp: '07.11.2026 13:10',
    consentId: 'KVKK-TR-2026-849102',
  });

  const [criminalAnalysis, setCriminalAnalysis] = useState<CriminalRecordAnalysis>({
    status: 'not_uploaded',
    uploaded: false,
    adliSicilKaydiYoktur: false,
    arsivKaydiYoktur: false,
    hasActiveOrArchiveRecord: false,
    rawPdfPurged: true,
    summaryTitle: 'Adli Sicil Belgesi: Yüklenmedi',
    summaryDetail:
      'Henüz e-Devlet Adli Sicil PDF belgesi yüklenmedi. Yüklemediğiniz sürece eşleştiğiniz adaylarda "Adli Sicil Belgesi: Yüklenmedi" yazar.',
    profileAutoStamp: 'Adli Sicil Belgesi: Yüklenmedi',
    detectedClauses: [],
  });

  const completedQuestionsCount = useMemo(
    () =>
      QUESTIONS.filter((q) => isSingleQuestionValid(q, answers[q.id])).length,
    [answers]
  );

  const questionnaireCompleted =
    profile.registrationCompleted &&
    completedQuestionsCount === QUESTIONS.length;

  // Sıralı Adım Kilidi: Bir önceki adım tamamlanmadan sonraki adıma geçilemez
  const handleSafeNavigate = (
    target: 'kayit' | 'sorular' | 'sabika' | 'eslesmeler' | 'kvkk'
  ) => {
    if (target === 'kvkk' || target === 'kayit') {
      setActiveSection(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target === 'sorular') {
      if (!profile.registrationCompleted) return;
      setActiveSection('sorular');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target === 'sabika') {
      if (!profile.registrationCompleted || !questionnaireCompleted) return;
      setActiveSection('sabika');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target === 'eslesmeler') {
      if (
        !profile.registrationCompleted ||
        !questionnaireCompleted ||
        !criminalStepCompleted
      ) {
        return;
      }
      setActiveSection('eslesmeler');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateAnswer = (questionId: string, updated: UserAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: updated,
    }));
  };

  const handleApplyPresetPersona = (
    persona: 'muhafazakar' | 'sentez' | 'ataturkcu_sekuler'
  ) => {
    if (!profile.registrationCompleted) return;

    if (persona === 'muhafazakar') {
      setAnswers({
        q_inanc: {
          questionId: 'q_inanc',
          selectedOptionId: 'inanc_islam_pratik',
          followUpSingleAnswers: {
            f_mezhep_secimi: 'mezhep_hanefi',
            f_kendi_cemaati: 'cem_bagimsiz',
          },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_cemaat_mezhep_ret: {
          questionId: 'q_cemaat_mezhep_ret',
          selectedOptionId: 'cemaat_bireysel_saygi',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['cem_furkan', 'inanc_ateist'],
        },
        q_siyasi_gorus: {
          questionId: 'q_siyasi_gorus',
          selectedOptionId: 'siy_muhafazakar',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['siy_sosyalist', 'siy_kurt_hareketi'],
        },
        q_meslek: {
          questionId: 'q_meslek',
          selectedOptionId: 'mes_ticaret',
          followUpSingleAnswers: { f_maddi_yaklasim: 'mad_centilmen' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_takim: {
          questionId: 'q_takim',
          selectedOptionId: 'tak_fb',
          followUpSingleAnswers: { f_fanatiklik: 'fan_derbi' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_spor: {
          questionId: 'q_spor',
          selectedOptionId: 'sp_fitness',
          followUpSingleAnswers: { f_haftasonu: 'hs_sakin' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_alkol_sosyal: {
          questionId: 'q_alkol_sosyal',
          selectedOptionId: 'alk_kesin_yok',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['alk_sosyal', 'alk_gece_hayati'],
        },
        q_giyim: {
          questionId: 'q_giyim',
          selectedOptionId: 'giy_tesettur',
          followUpSingleAnswers: { f_karsi_giyim_beklentisi: 'kb_tesettur_sart' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_kiskanclik_sinirlar: {
          questionId: 'q_kiskanclik_sinirlar',
          selectedOptionId: 'sin_kati',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['dav_eski_sevgili', 'dav_karsi_cins_kanka'],
        },
      });
      return;
    }

    if (persona === 'sentez') {
      setAnswers({
        q_inanc: {
          questionId: 'q_inanc',
          selectedOptionId: 'inanc_islam_geleneksel',
          followUpSingleAnswers: {
            f_mezhep_secimi: 'mezhep_hanefi',
            f_kendi_cemaati: 'cem_bagimsiz',
          },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_cemaat_mezhep_ret: {
          questionId: 'q_cemaat_mezhep_ret',
          selectedOptionId: 'cemaat_tamamen_karsi',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['cem_ismailaga', 'cem_menzil', 'cem_suleymancilar', 'cem_hepsi'],
        },
        q_siyasi_gorus: {
          questionId: 'q_siyasi_gorus',
          selectedOptionId: 'siy_ataturkcu',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['siy_islamci', 'siy_kurt_hareketi'],
        },
        q_meslek: {
          questionId: 'q_meslek',
          selectedOptionId: 'mes_yazilim',
          followUpSingleAnswers: { f_maddi_yaklasim: 'mad_ortak' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_takim: {
          questionId: 'q_takim',
          selectedOptionId: 'tak_gs',
          followUpSingleAnswers: { f_fanatiklik: 'fan_derbi' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_spor: {
          questionId: 'q_spor',
          selectedOptionId: 'sp_fitness',
          followUpSingleAnswers: { f_haftasonu: 'hs_kafe' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_alkol_sosyal: {
          questionId: 'q_alkol_sosyal',
          selectedOptionId: 'alk_icmem_esnek',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['alk_gece_hayati'],
        },
        q_giyim: {
          questionId: 'q_giyim',
          selectedOptionId: 'giy_klasik_sik',
          followUpSingleAnswers: { f_karsi_giyim_beklentisi: 'kb_olculu_olmali' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_kiskanclik_sinirlar: {
          questionId: 'q_kiskanclik_sinirlar',
          selectedOptionId: 'sin_dengeli',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['dav_eski_sevgili'],
        },
      });
      return;
    }

    if (persona === 'ataturkcu_sekuler') {
      setAnswers({
        q_inanc: {
          questionId: 'q_inanc',
          selectedOptionId: 'inanc_deist',
          followUpSingleAnswers: { f_sekuler_beklenti: 'sek_muhafazakar_olmasin' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_cemaat_mezhep_ret: {
          questionId: 'q_cemaat_mezhep_ret',
          selectedOptionId: 'cemaat_tamamen_karsi',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['cem_hepsi'],
        },
        q_siyasi_gorus: {
          questionId: 'q_siyasi_gorus',
          selectedOptionId: 'siy_ataturkcu',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['siy_muhafazakar', 'siy_islamci'],
        },
        q_meslek: {
          questionId: 'q_meslek',
          selectedOptionId: 'mes_muhendis',
          followUpSingleAnswers: { f_maddi_yaklasim: 'mad_ortak' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_takim: {
          questionId: 'q_takim',
          selectedOptionId: 'tak_bjk',
          followUpSingleAnswers: { f_fanatiklik: 'fan_koyu' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_spor: {
          questionId: 'q_spor',
          selectedOptionId: 'sp_tenis',
          followUpSingleAnswers: { f_haftasonu: 'hs_etkinlik' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_alkol_sosyal: {
          questionId: 'q_alkol_sosyal',
          selectedOptionId: 'alk_sosyal',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['alk_kesin_yok'],
        },
        q_giyim: {
          questionId: 'q_giyim',
          selectedOptionId: 'giy_modern_ozgur',
          followUpSingleAnswers: { f_karsi_giyim_beklentisi: 'kb_karismam' },
          followUpCustomTexts: {},
          excludedRedIds: [],
        },
        q_kiskanclik_sinirlar: {
          questionId: 'q_kiskanclik_sinirlar',
          selectedOptionId: 'sin_ozgur',
          followUpSingleAnswers: {},
          followUpCustomTexts: {},
          excludedRedIds: ['dav_asiri_kiskanc'],
        },
      });
    }
  };

  const calculatedMatches = useMemo(() => {
    const targetCandidates = CANDIDATE_POOL.filter(
      (c) => c.gender === profile.lookingFor
    );
    return targetCandidates
      .map((cand) => analyzeCompatibility(answers, cand, profile))
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [answers, profile]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-zinc-900 overflow-x-hidden">
      <Navbar
        activeSection={activeSection}
        onNavigate={handleSafeNavigate}
        registrationCompleted={profile.registrationCompleted}
        questionnaireCompleted={questionnaireCompleted}
        criminalStepCompleted={criminalStepCompleted}
        criminalUploaded={criminalAnalysis.uploaded}
        completedQuestionsCount={completedQuestionsCount}
        totalQuestionsCount={QUESTIONS.length}
      />

      <main className="flex-1 w-full">
        {(activeSection === 'kayit' || activeSection === 'sorular') && (
          <QuestionnaireSection
            stepMode={
              activeSection === 'sorular' && profile.registrationCompleted
                ? 'sorular'
                : 'kayit'
            }
            onChangeStepMode={(mode) => {
              if (mode === 'sorular' && !profile.registrationCompleted) return;
              setActiveSection(mode);
            }}
            profile={profile}
            onUpdateProfile={setProfile}
            answers={answers}
            onUpdateAnswer={handleUpdateAnswer}
            onApplyPresetPersona={handleApplyPresetPersona}
            kvkkApproved={kvkkConsent.specialCategoryExplicitConsent}
            onToggleKvkkApproved={(approved) =>
              setKvkkConsent((prev) => ({
                ...prev,
                specialCategoryExplicitConsent: approved,
              }))
            }
            onRequestKvkkModal={() => setActiveSection('kvkk')}
            onFinishQuestionnaire={() => {
              if (!profile.registrationCompleted || !questionnaireCompleted) return;
              setActiveSection('sabika');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeSection === 'sabika' &&
          profile.registrationCompleted &&
          questionnaireCompleted && (
            <CriminalRecordSection
              analysis={criminalAnalysis}
              onUpdateAnalysis={(res) => {
                setCriminalAnalysis(res);
                if (res.uploaded) {
                  setCriminalStepCompleted(true);
                }
              }}
              onContinueToMatches={() => {
                setCriminalStepCompleted(true);
                setActiveSection('eslesmeler');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

        {activeSection === 'eslesmeler' &&
          profile.registrationCompleted &&
          questionnaireCompleted &&
          criminalStepCompleted && (
            <MatchesSection
              profile={profile}
              matches={calculatedMatches}
              userCriminalAnalysis={criminalAnalysis}
              onGoToCriminalCheck={() => setActiveSection('sabika')}
              onGoToQuestionnaire={() => setActiveSection('sorular')}
            />
          )}

        {activeSection === 'kvkk' && (
          <KvkkConsentSection
            consent={kvkkConsent}
            onSaveConsent={setKvkkConsent}
            onContinueToQuestionnaire={() => setActiveSection('kayit')}
          />
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="border-t border-zinc-300 bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            <span className="font-serif font-bold text-zinc-900 mr-2">MİZAN</span>
            <span>
              Uyum & Güven Doğrulamalı Tanışma Uygulaması • 6698 Sayılı KVKK Uyumlu
            </span>
          </div>
          <div className="font-mono text-[11px] text-zinc-500">
            Sunucu Bölgesi: TÜRKİYE (AES-256-GCM Şifreli Kasa)
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
