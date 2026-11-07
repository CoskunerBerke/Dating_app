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

const INITIAL_ANSWERS_MUHAFAZAKAR: Record<string, UserAnswer> = {
  q_inanc_tanim: {
    questionId: 'q_inanc_tanim',
    selectedOptionId: 'inanc_muhafazakar_pratik',
    isDealbreaker: true,
  },
  q_dunya_gorusu: {
    questionId: 'q_dunya_gorusu',
    selectedOptionId: 'gorus_muhafazakar_islami',
    isDealbreaker: false,
  },
  q_ibadet_pratik: {
    questionId: 'q_ibadet_pratik',
    selectedOptionId: 'ibadet_bes_vakit_ortak',
    isDealbreaker: true,
  },
  q_sosyal_alkol: {
    questionId: 'q_sosyal_alkol',
    selectedOptionId: 'alkol_kesin_ret',
    isDealbreaker: true,
  },
  q_giyim_temsil: {
    questionId: 'q_giyim_temsil',
    selectedOptionId: 'giyim_tesettur_hassas',
    isDealbreaker: true,
  },
  q_karsi_cins_sosyal_medya: {
    questionId: 'q_karsi_cins_sosyal_medya',
    selectedOptionId: 'sinir_net_mahrem',
    isDealbreaker: false,
  },
  q_ekonomi_calisma: {
    questionId: 'q_ekonomi_calisma',
    selectedOptionId: 'ekonomi_geleneksel_guvence',
    isDealbreaker: false,
  },
  q_kok_aile_sinirlar: {
    questionId: 'q_kok_aile_sinirlar',
    selectedOptionId: 'aile_saygili_cekirdek',
    isDealbreaker: true,
  },
  q_ev_ici_roller: {
    questionId: 'q_ev_ici_roller',
    selectedOptionId: 'rol_esnek_destek',
    isDealbreaker: false,
  },
  q_dugun_baslangic: {
    questionId: 'q_dugun_baslangic',
    selectedOptionId: 'dugun_sade_gelecek',
    isDealbreaker: false,
  },
  q_kriz_tartisma: {
    questionId: 'q_kriz_tartisma',
    selectedOptionId: 'kriz_sakinlesip_konusma',
    isDealbreaker: false,
  },
  q_cocuk_gelecek: {
    questionId: 'q_cocuk_gelecek',
    selectedOptionId: 'cocuk_erken_manevi',
    isDealbreaker: false,
  },
};

export function App() {
  const [activeSection, setActiveSection] = useState<
    'hero' | 'anket' | 'sabika' | 'eslesmeler' | 'kvkk'
  >('hero');

  const [profile, setProfile] = useState<UserSelfProfile>({
    aliasCode: 'ADAY #TR-8941',
    gender: 'erkek',
    lookingFor: 'kadin',
    age: 26,
    city: 'İstanbul',
    profession: 'Yazılım & Teknoloji Girişimcisi',
    education: 'Lisans',
    relationshipDynamic: 'Uzun Vadeli & Ciddi İlişki',
    bio: 'Net değerleri olan, derin sohbeti ve samimiyeti önemseyen, aynı frekansta buluşabileceği kafa dengi birini arayan biriyim.',
    contactChannel: '+90 (532) 890 ** **',
  });

  const [answers, setAnswers] = useState<Record<string, UserAnswer>>(
    INITIAL_ANSWERS_MUHAFAZAKAR
  );

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
    summaryDetail: 'Henüz e-Devlet Adli Sicil PDF belgesi yüklenmedi.',
    detectedClauses: [],
  });

  const handleSelectAnswer = (
    questionId: string,
    optionId: string,
    isDealbreaker: boolean
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionId: optionId,
        isDealbreaker,
      },
    }));
  };

  const handleApplyPresetPersona = (
    persona: 'muhafazakar' | 'sentez' | 'ataturkcu_sekuler'
  ) => {
    if (persona === 'muhafazakar') {
      setAnswers(INITIAL_ANSWERS_MUHAFAZAKAR);
      return;
    }

    if (persona === 'sentez') {
      setAnswers({
        q_inanc_tanim: {
          questionId: 'q_inanc_tanim',
          selectedOptionId: 'inanc_geleneksel_kulturel',
          isDealbreaker: false,
        },
        q_dunya_gorusu: {
          questionId: 'q_dunya_gorusu',
          selectedOptionId: 'gorus_anadolu_sentez',
          isDealbreaker: true,
        },
        q_ibadet_pratik: {
          questionId: 'q_ibadet_pratik',
          selectedOptionId: 'ibadet_ramazan_cuma',
          isDealbreaker: false,
        },
        q_sosyal_alkol: {
          questionId: 'q_sosyal_alkol',
          selectedOptionId: 'alkol_kullanmam_esnek',
          isDealbreaker: false,
        },
        q_giyim_temsil: {
          questionId: 'q_giyim_temsil',
          selectedOptionId: 'giyim_olculu_sade',
          isDealbreaker: false,
        },
        q_karsi_cins_sosyal_medya: {
          questionId: 'q_karsi_cins_sosyal_medya',
          selectedOptionId: 'sinir_ailece_dengeli',
          isDealbreaker: false,
        },
        q_ekonomi_calisma: {
          questionId: 'q_ekonomi_calisma',
          selectedOptionId: 'ekonomi_ortak_havuz',
          isDealbreaker: false,
        },
        q_kok_aile_sinirlar: {
          questionId: 'q_kok_aile_sinirlar',
          selectedOptionId: 'aile_saygili_cekirdek',
          isDealbreaker: true,
        },
        q_ev_ici_roller: {
          questionId: 'q_ev_ici_roller',
          selectedOptionId: 'rol_esnek_destek',
          isDealbreaker: false,
        },
        q_dugun_baslangic: {
          questionId: 'q_dugun_baslangic',
          selectedOptionId: 'dugun_sade_gelecek',
          isDealbreaker: false,
        },
        q_kriz_tartisma: {
          questionId: 'q_kriz_tartisma',
          selectedOptionId: 'kriz_aninda_cozum',
          isDealbreaker: false,
        },
        q_cocuk_gelecek: {
          questionId: 'q_cocuk_gelecek',
          selectedOptionId: 'cocuk_planli_dengeli',
          isDealbreaker: false,
        },
      });
      return;
    }

    if (persona === 'ataturkcu_sekuler') {
      setAnswers({
        q_inanc_tanim: {
          questionId: 'q_inanc_tanim',
          selectedOptionId: 'inanc_bireysel_manevi',
          isDealbreaker: false,
        },
        q_dunya_gorusu: {
          questionId: 'q_dunya_gorusu',
          selectedOptionId: 'gorus_ataturkcu_sekuler',
          isDealbreaker: true,
        },
        q_ibadet_pratik: {
          questionId: 'q_ibadet_pratik',
          selectedOptionId: 'ibadet_serbest_saygi',
          isDealbreaker: false,
        },
        q_sosyal_alkol: {
          questionId: 'q_sosyal_alkol',
          selectedOptionId: 'alkol_sosyal_olculu',
          isDealbreaker: false,
        },
        q_giyim_temsil: {
          questionId: 'q_giyim_temsil',
          selectedOptionId: 'giyim_bireysel_ozgur',
          isDealbreaker: true,
        },
        q_karsi_cins_sosyal_medya: {
          questionId: 'q_karsi_cins_sosyal_medya',
          selectedOptionId: 'sinir_tam_ozgur',
          isDealbreaker: false,
        },
        q_ekonomi_calisma: {
          questionId: 'q_ekonomi_calisma',
          selectedOptionId: 'ekonomi_ortak_havuz',
          isDealbreaker: false,
        },
        q_kok_aile_sinirlar: {
          questionId: 'q_kok_aile_sinirlar',
          selectedOptionId: 'aile_bagimsiz_mesafeli',
          isDealbreaker: true,
        },
        q_ev_ici_roller: {
          questionId: 'q_ev_ici_roller',
          selectedOptionId: 'rol_tam_esitlikci',
          isDealbreaker: true,
        },
        q_dugun_baslangic: {
          questionId: 'q_dugun_baslangic',
          selectedOptionId: 'dugun_butik_modern',
          isDealbreaker: false,
        },
        q_kriz_tartisma: {
          questionId: 'q_kriz_tartisma',
          selectedOptionId: 'kriz_aninda_cozum',
          isDealbreaker: false,
        },
        q_cocuk_gelecek: {
          questionId: 'q_cocuk_gelecek',
          selectedOptionId: 'cocuk_planli_dengeli',
          isDealbreaker: false,
        },
      });
    }
  };

  const calculatedMatches = useMemo(() => {
    const targetCandidates = CANDIDATE_POOL.filter(
      (c) => c.gender === profile.lookingFor
    );
    return targetCandidates
      .map((cand) => analyzeCompatibility(answers, cand))
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [answers, profile.lookingFor]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-zinc-900">
      <Navbar
        activeSection={activeSection}
        onNavigate={(sec) => {
          setActiveSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        kvkkApproved={kvkkConsent.specialCategoryExplicitConsent}
        criminalClean={criminalAnalysis.status === 'clean'}
        completedQuestionsCount={Object.keys(answers).length}
        totalQuestionsCount={QUESTIONS.length}
      />

      <main className="flex-1">
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
            onSelectAnswer={handleSelectAnswer}
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
              Psikometrik Uyum, Frekans ve Güven Doğrulamalı Tanışma Platformu • KVKK Madde 6 Uyumlu Mimari
            </span>
          </div>
          <div className="font-mono text-[11px] text-zinc-500">
            Veri Yerleşimi: TR-İSTANBUL • E2EE İletişim Protokolü
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
