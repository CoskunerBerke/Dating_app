import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroOverviewSection } from './components/HeroOverviewSection';
import { QuestionnaireSection } from './components/QuestionnaireSection';
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

export function App() {
  const [activeSection, setActiveSection] = useState<
    'hero' | 'anket' | 'sabika' | 'eslesmeler' | 'kvkk'
  >('hero');

  const [profile, setProfile] = useState<UserSelfProfile>({
    aliasCode: 'ADAY #TR-8941',
    firstName: 'Can',
    gender: 'erkek',
    lookingFor: 'kadin',
    age: 24,
    heightCm: 187,
    bodyType: 'Orta yapılı',
    city: 'İzmir',
    profession: 'Yazılım & Teknoloji',
    personaTitle: 'Özgür Yolcu',
    relationshipDynamic: 'Uzun Vadeli & Ciddi İlişki',
    bio: 'Net kriterleri olan, samimi ve kafa dengi biriyle tanışmak isteyen biriyim.',
    characterTraits: [
      'Dinde esnek',
      'Bağımsız',
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
    whatsappNumber: '+90 532 890 12 34',
    instagramHandle: 'can.mizan',
    contactPreferenceConfirmed: false,
  });

  // Kullanıcı soruları tek tek cevaplamak zorunda olsun diye başlangıçta boş başlıyor
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

  const [kvkkConsent, setKvkkConsent] = useState<KvkkConsentRecord>({
    generalIlluminationAccepted: true,
    specialCategoryExplicitConsent: true,
    zeroRetentionPdfAccepted: true,
    trServerTransferAccepted: true,
    consentTimestamp: '07.11.2026 13:10',
    consentId: 'KVKK-TR-2026-849102',
  });

  const [criminalAnalysis, setCriminalAnalysis] = useState<CriminalRecordAnalysis>({
    status: 'unverified',
    adliSicilKaydiYoktur: false,
    arsivKaydiYoktur: false,
    hasActiveOrArchiveRecord: false,
    rawPdfPurged: true,
    summaryTitle: 'Doğrulama Bekleniyor',
    summaryDetail: 'Henüz e-Devlet Adli Sicil barkod sorgusu veya PDF doğrulaması yapılmadı.',
    profileAutoStamp: 'Henüz e-Devlet Adli Sicil Doğrulaması Yapılmadı',
    detectedClauses: [],
  });

  const handleUpdateAnswer = (questionId: string, updated: UserAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: updated,
    }));
  };

  const handleApplyPresetPersona = (
    persona: 'muhafazakar' | 'sentez' | 'ataturkcu_sekuler'
  ) => {
    setProfile((prev) => ({
      ...prev,
      contactPreferenceConfirmed: true,
    }));

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
        q_muzik_kultur: {
          questionId: 'q_muzik_kultur',
          selectedOptionId: 'muz_turku',
          followUpSingleAnswers: { f_sohbet_konusu: 'soh_psikoloji' },
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
        q_muzik_kultur: {
          questionId: 'q_muzik_kultur',
          selectedOptionId: 'muz_rock',
          followUpSingleAnswers: { f_sohbet_konusu: 'soh_is_yatirim' },
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
        q_muzik_kultur: {
          questionId: 'q_muzik_kultur',
          selectedOptionId: 'muz_yabanci',
          followUpSingleAnswers: { f_sohbet_konusu: 'soh_film_kitap' },
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
        onNavigate={(sec) => {
          setActiveSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        kvkkApproved={kvkkConsent.specialCategoryExplicitConsent}
        criminalClean={criminalAnalysis.status === 'clean'}
        completedQuestionsCount={
          QUESTIONS.filter((q) => Boolean(answers[q.id]?.selectedOptionId)).length
        }
        totalQuestionsCount={QUESTIONS.length}
      />

      <main className="flex-1 w-full">
        {activeSection === 'hero' && (
          <HeroOverviewSection
            onStartQuestionnaire={() => setActiveSection('anket')}
            onOpenCriminalCheck={() => setActiveSection('sabika')}
            onOpenMatches={() => setActiveSection('eslesmeler')}
            onOpenKvkk={() => setActiveSection('kvkk')}
          />
        )}

        {activeSection === 'anket' && (
          <QuestionnaireSection
            profile={profile}
            onUpdateProfile={setProfile}
            answers={answers}
            onUpdateAnswer={handleUpdateAnswer}
            onApplyPresetPersona={handleApplyPresetPersona}
            kvkkApproved={kvkkConsent.specialCategoryExplicitConsent}
            onRequestKvkkModal={() => setActiveSection('kvkk')}
            onFinishQuestionnaire={() => setActiveSection('eslesmeler')}
          />
        )}

        {activeSection === 'sabika' && (
          <CriminalRecordSection
            analysis={criminalAnalysis}
            onUpdateAnalysis={setCriminalAnalysis}
            onContinueToMatches={() => setActiveSection('eslesmeler')}
          />
        )}

        {activeSection === 'eslesmeler' && (
          <MatchesSection
            profile={profile}
            matches={calculatedMatches}
            userCriminalAnalysis={criminalAnalysis}
            onGoToCriminalCheck={() => setActiveSection('sabika')}
            onGoToQuestionnaire={() => setActiveSection('anket')}
          />
        )}

        {activeSection === 'kvkk' && (
          <KvkkConsentSection
            consent={kvkkConsent}
            onSaveConsent={setKvkkConsent}
            onContinueToQuestionnaire={() => setActiveSection('anket')}
          />
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="border-t border-zinc-300 bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            <span className="font-serif font-bold text-zinc-900 mr-2">MİZAN</span>
            <span>
              Kriter, Uyum ve Güven Doğrulamalı Tanışma Platformu • 6698 Sayılı KVKK Uyumlu
            </span>
          </div>
          <div className="font-mono text-[11px] text-zinc-500">
            Sunucu Bölgesi: TÜRKİYE • Şifreli İletişim
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
