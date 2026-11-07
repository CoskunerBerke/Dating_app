import {
  CandidateProfile,
  CategoryScoreBreakdown,
  MatchAnalysisResult,
  MatchTier,
  QuestionCategory,
  UserAnswer,
  UserSelfProfile,
} from '../types/domain';
import { CATEGORY_LABELS, QUESTIONS } from '../data/questionsData';

function getOptionGroupTag(questionId: string, optionId: string): string | undefined {
  const q = QUESTIONS.find((item) => item.id === questionId);
  const opt = q?.options.find((o) => o.id === optionId);
  return opt?.groupTag;
}

function getOptionLabel(questionId: string, optionId: string, customText?: string): string {
  if (optionId === 'other_custom') {
    return customText?.trim() ? `Diğer (${customText.trim()})` : 'Diğer';
  }
  if (optionId === 'prefer_not_to_say') {
    return 'Bahsetmek İstemiyorum';
  }
  const q = QUESTIONS.find((item) => item.id === questionId);
  for (const opt of q?.options || []) {
    if (opt.id === optionId) return opt.label;
  }
  for (const f of q?.followUps || []) {
    for (const opt of f.options) {
      if (opt.id === optionId) return opt.label;
    }
  }
  return optionId;
}

const QUESTION_TOPIC_MAP: Record<string, { main: string; subTopics: string[] }> = {
  q_inanc: {
    main: 'Dini çizgi ★',
    subTopics: ['Dini yaşantı', 'Din pratiği', 'Ramazan ve bayramlar'],
  },
  q_cemaat_mezhep_ret: {
    main: 'Mezhep ★',
    subTopics: ['Topluluk mesafesi ★', 'Aile sınırları'],
  },
  q_siyasi_gorus: {
    main: 'Siyasi görüş ★',
    subTopics: ['Toplumsal bakış', 'Zor zamanlar'],
  },
  q_meslek: {
    main: 'Para yönetimi ★',
    subTopics: ['Para davranışı', 'Gelecek ve yerleşim', 'Çalışma hayatı'],
  },
  q_takim: {
    main: 'Yaşam temposu ★',
    subTopics: ['Hafta sonu ritmi', 'Sosyal heyecan'],
  },
  q_spor: {
    main: 'Düzen ve sorumluluk',
    subTopics: ['Tatil ve dinlenme', 'Günlük rutin'],
  },
  q_alkol_sosyal: {
    main: 'Sosyal hayat',
    subTopics: ['Sosyal ortam sınırları ★', 'Arkadaş çevresi'],
  },
  q_giyim: {
    main: 'Giyim ayrıntıları',
    subTopics: ['Estetik ve bakım', 'Dış görünüm uyumu'],
  },
  q_muzik_kultur: {
    main: 'İletişim tarzı ★',
    subTopics: ['Kültürel paylaşım', 'Sohbet derinliği'],
  },
  q_kiskanclik_sinirlar: {
    main: 'Güven ve özel alan',
    subTopics: ['Tartışma ve barışma', 'Öfke anı'],
  },
};

export function analyzeCompatibility(
  userAnswers: Record<string, UserAnswer>,
  candidate: CandidateProfile,
  userProfile?: UserSelfProfile
): MatchAnalysisResult {
  const categoryScoresMap: Record<QuestionCategory, { points: number; maxPoints: number }> = {
    inanc_cemaat: { points: 0, maxPoints: 0 },
    siyaset_dunya_gorusu: { points: 0, maxPoints: 0 },
    meslek_yasam: { points: 0, maxPoints: 0 },
    takim_spor_hobi: { points: 0, maxPoints: 0 },
    sosyal_aliskanlik: { points: 0, maxPoints: 0 },
    iliski_sinirlari: { points: 0, maxPoints: 0 },
  };

  const sharedStrengths: string[] = [];
  const talkingPoints: string[] = [];
  const blockedReasons: string[] = [];
  const matchedTopicsWithStar: string[] = [];
  const differingTopicsWithStar: string[] = [];

  const userTraitIds = new Set<string>();
  const userRedExcludedIds = new Set<string>();

  for (const ans of Object.values(userAnswers)) {
    if (ans.selectedOptionId) {
      userTraitIds.add(ans.selectedOptionId);
    }
    for (const subId of Object.values(ans.followUpSingleAnswers || {})) {
      if (subId) userTraitIds.add(subId);
    }
    for (const redId of ans.excludedRedIds || []) {
      userRedExcludedIds.add(redId);
    }
  }

  // 1. Kırmızı Kutucuk (Kesinlikle Birlikte Olmam) Kontrolü
  if (
    userRedExcludedIds.has('cem_hepsi') &&
    candidate.allTraitIds.some(
      (id) => id.startsWith('cem_') && id !== 'cem_bagimsiz'
    )
  ) {
    blockedReasons.push(`Cemaat Kırmızı Çizginiz: Aday "${candidate.tags.cemaat}" yapısına yakın.`);
  }

  for (const candTrait of candidate.allTraitIds) {
    if (userRedExcludedIds.has(candTrait)) {
      let labelFound = candTrait;
      for (const q of QUESTIONS) {
        for (const f of q.followUps) {
          const found = f.options.find((o) => o.id === candTrait);
          if (found) labelFound = found.label;
        }
      }
      blockedReasons.push(
        `Kırmızı Kutucuk Filtreniz: "${labelFound}" seçeneğini kesinlikle istemediğinizi belirttiniz.`
      );
    }
  }

  for (const candRed of candidate.excludedTraitIds) {
    if (userTraitIds.has(candRed)) {
      blockedReasons.push('Karşı tarafın kırmızı çizgi filtresiyle uyuşmazlık tespit edildi.');
      break;
    }
  }

  // 2. Soru Bazlı Uyum Hesaplama
  for (const q of QUESTIONS) {
    const ans = userAnswers[q.id];
    const catBucket = categoryScoresMap[q.category];
    catBucket.maxPoints += 100;
    const topicBundle = QUESTION_TOPIC_MAP[q.id];

    if (!ans || !ans.selectedOptionId) {
      catBucket.points += 75;
      if (topicBundle) {
        matchedTopicsWithStar.push(topicBundle.main, ...topicBundle.subTopics.slice(0, 1));
      }
      continue;
    }

    if (ans.selectedOptionId === 'prefer_not_to_say') {
      catBucket.points += 80;
      if (topicBundle) {
        matchedTopicsWithStar.push(topicBundle.main);
      }
      continue;
    }

    const userOptLabel = getOptionLabel(q.id, ans.selectedOptionId, ans.customOtherText);

    if (candidate.allTraitIds.includes(ans.selectedOptionId)) {
      catBucket.points += 100;
      sharedStrengths.push(`${q.categoryLabel}: İkiniz de "${userOptLabel}" çizgisindesiniz.`);
      if (topicBundle) {
        matchedTopicsWithStar.push(topicBundle.main, ...topicBundle.subTopics);
      }
    } else {
      const userGroup = getOptionGroupTag(q.id, ans.selectedOptionId);
      const candMatchingOption = q.options.find((o) => candidate.allTraitIds.includes(o.id));
      const candGroup = candMatchingOption?.groupTag;

      if (userGroup && candGroup && userGroup === candGroup) {
        catBucket.points += 88;
        sharedStrengths.push(`${q.categoryLabel} konusunda hayata bakışınız birbirine çok yakın.`);
        if (topicBundle) {
          matchedTopicsWithStar.push(topicBundle.main, ...topicBundle.subTopics);
        }
      } else if (
        (userGroup === 'dengeli' &&
          (candGroup === 'muhafazakar' || candGroup === 'sekuler' || candGroup === 'ataturkcu')) ||
        (candGroup === 'dengeli' &&
          (userGroup === 'muhafazakar' || userGroup === 'sekuler' || userGroup === 'ataturkcu')) ||
        (userGroup === 'islam_muhafazakar' && candGroup === 'islam_geleneksel') ||
        (userGroup === 'islam_geleneksel' && candGroup === 'islam_muhafazakar')
      ) {
        catBucket.points += 76;
        if (topicBundle) {
          matchedTopicsWithStar.push(topicBundle.main, topicBundle.subTopics[0]);
          if (topicBundle.subTopics[1]) {
            differingTopicsWithStar.push(topicBundle.subTopics[1]);
          }
        }
        if (candMatchingOption) {
          talkingPoints.push(
            `${q.categoryLabel}: Sen "${userOptLabel}" derken aday "${candMatchingOption.label}" diyor.`
          );
        }
      } else if (q.category === 'takim_spor_hobi' || q.category === 'meslek_yasam') {
        catBucket.points += 82;
        if (topicBundle) {
          matchedTopicsWithStar.push(topicBundle.main, ...topicBundle.subTopics.slice(0, 2));
        }
      } else {
        catBucket.points += 35;
        if (topicBundle) {
          differingTopicsWithStar.push(topicBundle.main);
          if (topicBundle.subTopics[0]) {
            differingTopicsWithStar.push(topicBundle.subTopics[0]);
          }
        }
        if (candMatchingOption) {
          talkingPoints.push(
            `${q.categoryLabel}: Sen "${userOptLabel}" seçtin, aday ise "${candMatchingOption.label}" görüşünde.`
          );
        }
      }
    }
  }

  // Eğer hiç farklı konu çıkmadıysa görseldeki gibi doğal 1-2 nüans ekle
  if (differingTopicsWithStar.length === 0) {
    differingTopicsWithStar.push('İletişim tarzı ★', 'Öfke anı');
  }

  // Ortak ilgi alanlarını hesapla
  const userInterests = userProfile?.interests || [];
  const exactCommonInterests = candidate.interests.filter((item) =>
    userInterests.includes(item)
  );
  const commonInterests =
    exactCommonInterests.length > 0 ? exactCommonInterests : candidate.interests;

  const categoryScores: CategoryScoreBreakdown[] = (
    Object.keys(categoryScoresMap) as QuestionCategory[]
  ).map((cat) => {
    const b = categoryScoresMap[cat];
    const score = b.maxPoints > 0 ? Math.round((b.points / b.maxPoints) * 100) : 75;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      score,
    };
  });

  const weights: Record<QuestionCategory, number> = {
    inanc_cemaat: 1.5,
    siyaset_dunya_gorusu: 1.4,
    sosyal_aliskanlik: 1.35,
    iliski_sinirlari: 1.3,
    meslek_yasam: 1.0,
    takim_spor_hobi: 0.9,
  };

  let weightedTotal = 0;
  let weightSum = 0;
  for (const item of categoryScores) {
    const w = weights[item.category] || 1;
    weightedTotal += item.score * w;
    weightSum += w;
  }

  let rawOverall = weightSum > 0 ? weightedTotal / weightSum : 75;

  const isBlockedByRedFilter = blockedReasons.length > 0;
  if (isBlockedByRedFilter) {
    rawOverall = Math.min(rawOverall - 30, 42);
  }

  const overallScore = Math.max(18, Math.min(97, Math.round(rawOverall)));

  let tier: MatchTier;
  let verdictBadge: string;
  let topPercentileLabel: string;
  let verdictHeadline: string;
  let verdictAdvice: string;

  if (overallScore >= 88) {
    tier = 'yuksek_uyum';
    verdictBadge = 'Çok yüksek uyum';
    topPercentileLabel = 'adaylarınız arasında ilk %2';
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence hiç vakit kaybetmeyin, direkt sevgili olabilirsiniz!`;
    verdictAdvice =
      'İnanç, siyasi duruş, sosyal ortam sınırları ve ilişki beklentileriniz neredeyse birebir örtüşüyor.';
  } else if (overallScore >= 78) {
    tier = 'ciddi_uyum';
    verdictBadge = 'Yüksek uyum';
    topPercentileLabel = 'adaylarınız arasında ilk %5';
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence çok sağlam bir ilişki çıkar, çok iyi anlaşırsınız.`;
    verdictAdvice =
      'Temel değerleriniz ve hayata bakışınız oldukça uyumlu. Aradaki ufak tefek alışkanlık farkları sohbetinize renk katacaktır.';
  } else if (overallScore >= 60) {
    tier = 'sans_denenebilir';
    verdictBadge = 'Dengeli uyum';
    topPercentileLabel = 'adaylarınız arasında ilk %15';
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence bir kahve içip şansınızı deneyebilirsiniz.`;
    verdictAdvice =
      'Ortak noktalarınız var ancak aşağıda listelenen birkaç konuda bakış açılarınız farklı.';
  } else {
    tier = 'dusuk_uyum';
    verdictBadge = 'Düşük uyum';
    topPercentileLabel = 'kırmızı çizgi uyuşmazlığı';
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Seçtiğiniz kırmızı kutucuklarda veya temel görüşlerde zıtlık var.`;
    verdictAdvice =
      'Kesinlikle istemediğinizi belirttiğiniz kriterlerden en az biri bu adayda mevcut veya yaşam tarzlarınız birbirine uzak.';
  }

  const firstMessageIdea = `"Selam ${candidate.firstName}! Uyum oranımız %${overallScore} çıkmış. Özellikle ${commonInterests[0] || candidate.tags.takim} ortak noktamızı görünce selam vermek istedim, nasılsın?"`;

  return {
    candidate,
    overallScore,
    isBlockedByRedFilter,
    blockedReasons,
    tier,
    verdictBadge,
    topPercentileLabel,
    verdictHeadline,
    verdictAdvice,
    firstMessageIdea,
    commonInterests,
    matchedTopicsWithStar,
    differingTopicsWithStar,
    evaluatedTopicsCount: 38,
    categoryScores,
    sharedStrengths: sharedStrengths.slice(0, 4),
    talkingPoints: talkingPoints.slice(0, 3),
  };
}
