import {
  CandidateProfile,
  CategoryScoreBreakdown,
  MatchAnalysisResult,
  MatchTier,
  QuestionCategory,
  UserAnswer,
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

export function analyzeCompatibility(
  userAnswers: Record<string, UserAnswer>,
  candidate: CandidateProfile
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

  // Kullanıcının tüm seçtiği özellik ID'lerini ve kırmızı kutucuk (ret) ID'lerini topla
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
  // Eğer kullanıcı "Tüm Cemaat Yapıları"nı (cem_hepsi) kırmızı seçtiyse ve aday bir cemaate bağlıysa:
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
      // Hangi kırmızı kutucuğa takıldığını bul
      let labelFound = candTrait;
      for (const q of QUESTIONS) {
        for (const f of q.followUps) {
          const found = f.options.find((o) => o.id === candTrait);
          if (found) labelFound = found.label;
        }
      }
      blockedReasons.push(`Kırmızı Kutucuk Filtreniz: "${labelFound}" seçeneğini kesinlikle istemediğinizi belirttiniz.`);
    }
  }

  // Adayın kendi kırmızı çizgisine kullanıcı takılıyor mu?
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

    if (!ans || !ans.selectedOptionId) {
      catBucket.points += 60;
      continue;
    }

    if (ans.selectedOptionId === 'prefer_not_to_say') {
      catBucket.points += 75;
      continue;
    }

    const userOptLabel = getOptionLabel(q.id, ans.selectedOptionId, ans.customOtherText);

    // Birebir aynı ID seçildiyse
    if (candidate.allTraitIds.includes(ans.selectedOptionId)) {
      catBucket.points += 100;
      sharedStrengths.push(`${q.categoryLabel}: İkiniz de "${userOptLabel}" çizgisindesiniz.`);
    } else {
      // Grup yakınlığı kontrolü
      const userGroup = getOptionGroupTag(q.id, ans.selectedOptionId);
      const candMatchingOption = q.options.find((o) => candidate.allTraitIds.includes(o.id));
      const candGroup = candMatchingOption?.groupTag;

      if (userGroup && candGroup && userGroup === candGroup) {
        catBucket.points += 85;
        sharedStrengths.push(`${q.categoryLabel} konusunda hayata bakışınız birbirine çok yakın.`);
      } else if (
        (userGroup === 'dengeli' && (candGroup === 'muhafazakar' || candGroup === 'sekuler' || candGroup === 'ataturkcu')) ||
        (candGroup === 'dengeli' && (userGroup === 'muhafazakar' || userGroup === 'sekuler' || userGroup === 'ataturkcu')) ||
        (userGroup === 'islam_muhafazakar' && candGroup === 'islam_geleneksel') ||
        (userGroup === 'islam_geleneksel' && candGroup === 'islam_muhafazakar')
      ) {
        catBucket.points += 72;
        if (candMatchingOption) {
          talkingPoints.push(
            `${q.categoryLabel}: Sen "${userOptLabel}" derken aday "${candMatchingOption.label}" diyor.`
          );
        }
      } else if (q.category === 'takim_spor_hobi' || q.category === 'meslek_yasam') {
        // Takım, spor veya meslek farklı olsa da uyumu bozmaz, sohbet konusu olur
        catBucket.points += 78;
      } else {
        catBucket.points += 35;
        if (candMatchingOption) {
          talkingPoints.push(
            `${q.categoryLabel}: Sen "${userOptLabel}" seçtin, aday ise "${candMatchingOption.label}" görüşünde.`
          );
        }
      }
    }
  }

  const categoryScores: CategoryScoreBreakdown[] = (
    Object.keys(categoryScoresMap) as QuestionCategory[]
  ).map((cat) => {
    const b = categoryScoresMap[cat];
    const score = b.maxPoints > 0 ? Math.round((b.points / b.maxPoints) * 100) : 70;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      score,
    };
  });

  // Ağırlıklı Genel Skor
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

  let rawOverall = weightSum > 0 ? weightedTotal / weightSum : 65;

  const isBlockedByRedFilter = blockedReasons.length > 0;
  if (isBlockedByRedFilter) {
    rawOverall = Math.min(rawOverall - 30, 42);
  }

  const overallScore = Math.max(15, Math.min(97, Math.round(rawOverall)));

  let tier: MatchTier;
  let verdictBadge: string;
  let verdictHeadline: string;
  let verdictAdvice: string;

  if (overallScore >= 90) {
    tier = 'yuksek_uyum';
    verdictBadge = `%${overallScore} Uyum — Tam Kafa Dengi`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence hiç vakit kaybetmeyin, direkt sevgili olabilirsiniz!`;
    verdictAdvice =
      'İnanç, siyasi duruş, sosyal ortam sınırları ve ilişki beklentileriniz neredeyse birebir örtüşüyor. Kırmızı çizgilerinizde hiçbir çatışma yok.';
  } else if (overallScore >= 80) {
    tier = 'ciddi_uyum';
    verdictBadge = `%${overallScore} Uyum — Ciddi İlişki Potansiyeli`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence çok sağlam bir ilişki çıkar, çok iyi anlaşırsınız.`;
    verdictAdvice =
      'Temel değerleriniz ve hayata bakışınız oldukça uyumlu. Aradaki ufak tefek hobi veya alışkanlık farkları sohbetinize renk katacaktır.';
  } else if (overallScore >= 60) {
    tier = 'sans_denenebilir';
    verdictBadge = `%${overallScore} Uyum — Şans Denenebilir`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence bir kahve içip şansınızı deneyebilirsiniz.`;
    verdictAdvice =
      'Ortak noktalarınız var ancak aşağıda listelenen birkaç konuda bakış açılarınız farklı. Tanıştığınızda bunları konuşarak ilerleyebilirsiniz.';
  } else {
    tier = 'dusuk_uyum';
    verdictBadge = `%${overallScore} Uyum — Kırmızı Çizgi Farkı`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Seçtiğiniz kırmızı kutucuklarda veya temel görüşlerde zıtlık var.`;
    verdictAdvice =
      'Kesinlikle istemediğinizi belirttiğiniz kriterlerden en az biri bu adayda mevcut veya yaşam tarzlarınız birbirine uzak.';
  }

  const firstMessageIdea = `"Selam! Uyum oranımız %${overallScore} çıkmış. Özellikle ${candidate.tags.takim} ve '${candidate.favoriteVibe.split(',')[0]}' detayını görünce selam vermek istedim, nasılsın?"`;

  return {
    candidate,
    overallScore,
    isBlockedByRedFilter,
    blockedReasons,
    tier,
    verdictBadge,
    verdictHeadline,
    verdictAdvice,
    firstMessageIdea,
    categoryScores,
    sharedStrengths: sharedStrengths.slice(0, 4),
    talkingPoints: talkingPoints.slice(0, 3),
  };
}
