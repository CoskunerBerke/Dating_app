import {
  CandidateProfile,
  CategoryScoreBreakdown,
  MatchAnalysisResult,
  MatchTier,
  QuestionCategory,
  UserAnswer,
} from '../types/domain';
import { CATEGORY_LABELS, QUESTIONS } from '../data/questionsData';

function vectorSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0.5;
  let sumSq = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sumSq += diff * diff;
  }
  const maxDist = Math.sqrt(vecA.length); // max diff per dim is 1.0
  const dist = Math.sqrt(sumSq);
  return Math.max(0, 1 - dist / (maxDist * 0.72)); // strict curve
}

export function analyzeCompatibility(
  userAnswers: Record<string, UserAnswer>,
  candidate: CandidateProfile
): MatchAnalysisResult {
  const categoryTotals: Record<QuestionCategory, { weightedSum: number; totalWeight: number }> = {
    inanc_maneviyat: { weightedSum: 0, totalWeight: 0 },
    dunya_gorusu_degerler: { weightedSum: 0, totalWeight: 0 },
    yasam_tarzi_sosyal: { weightedSum: 0, totalWeight: 0 },
    evlilik_ekonomi: { weightedSum: 0, totalWeight: 0 },
    kriz_iletisim: { weightedSum: 0, totalWeight: 0 },
    aile_gelecek: { weightedSum: 0, totalWeight: 0 },
  };

  const sharedStrengths: string[] = [];
  const talkingPoints: string[] = [];
  const hardConflicts: string[] = [];

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let dealbreakerViolations = 0;

  for (const question of QUESTIONS) {
    const userAns = userAnswers[question.id];
    const candOptionId = candidate.answers[question.id];

    const userOpt = question.options.find((o) => o.id === userAns?.selectedOptionId);
    const candOpt = question.options.find((o) => o.id === candOptionId);

    if (!userOpt || !candOpt) continue;

    const isUserDealbreaker = Boolean(userAns?.isDealbreaker);
    const isCandDealbreaker = candidate.dealbreakers.includes(question.id);
    const weight =
      question.defaultDealbreakerWeight *
      (isUserDealbreaker ? 1.45 : 1.0) *
      (isCandDealbreaker ? 1.25 : 1.0);

    let questionScore = 0;

    if (userOpt.id === candOpt.id) {
      questionScore = 100;
      sharedStrengths.push(`${question.categoryLabel}: "${userOpt.label.split(';')[0]}" yaklaşımınız birebir örtüşüyor.`);
    } else if (userOpt.compatibleWith.includes(candOpt.id)) {
      questionScore = 92;
      sharedStrengths.push(`${question.categoryLabel} başlığında yüksek tamamlayıcı uyum mevcut.`);
    } else if (userOpt.partialCompatibleWith.includes(candOpt.id)) {
      const vecSim = vectorSimilarity(userOpt.weightVector, candOpt.weightVector);
      questionScore = Math.round(58 + vecSim * 22); // 58 - 80 bandı
      talkingPoints.push(
        `${question.categoryLabel}: Sen "${userOpt.label.split(';')[0]}" derken aday "${candOpt.label.split(';')[0]}" çizgisinde.`
      );
    } else {
      const vecSim = vectorSimilarity(userOpt.weightVector, candOpt.weightVector);
      questionScore = Math.round(vecSim * 42); // Keskin ayrışma (0 - 42 bandı)
      if (isUserDealbreaker || isCandDealbreaker) {
        dealbreakerViolations += 1;
        hardConflicts.push(
          `${question.categoryLabel} (Kırmızı Çizgi): "${userOpt.label.split(';')[0]}" ile "${candOpt.label.split(';')[0]}" arasında temel zıtlık var.`
        );
      } else {
        talkingPoints.push(
          `${question.categoryLabel} konusunda beklentileriniz farklı; tanışma aşamasında mutlaka netleştirilmeli.`
        );
      }
    }

    totalWeightedScore += questionScore * weight;
    totalWeight += weight;

    categoryTotals[question.category].weightedSum += questionScore * weight;
    categoryTotals[question.category].totalWeight += weight;
  }

  let rawOverall = totalWeight > 0 ? totalWeightedScore / totalWeight : 50;

  // Zorlaştırılmış puanlama cezası: Kırmızı çizgi ihlali varsa puanı sert düşür
  if (dealbreakerViolations === 1) {
    rawOverall = Math.min(rawOverall - 14, 74);
  } else if (dealbreakerViolations >= 2) {
    rawOverall = Math.min(rawOverall - 26, 56);
  }

  const overallScore = Math.max(12, Math.min(98, Math.round(rawOverall)));

  const categoryScores: CategoryScoreBreakdown[] = (
    Object.keys(categoryTotals) as QuestionCategory[]
  ).map((cat) => {
    const item = categoryTotals[cat];
    const score = item.totalWeight > 0 ? Math.round(item.weightedSum / item.totalWeight) : 0;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      score,
    };
  });

  let tier: MatchTier;
  let verdictBadge: string;
  let verdictHeadline: string;
  let verdictAdvice: string;

  if (overallScore >= 90) {
    tier = 'nikah_masasi';
    verdictBadge = `%${overallScore} Uyum — Doğrudan Evlilik / Nikâh Adayı`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence sevgili olabilir, doğrudan nikâh masasına oturabilirsiniz.`;
    verdictAdvice =
      'İnanç pratiği, toplumsal duruş, aile sınırları ve kriz yönetimi eksenlerinizde nadir görülen bir örtüşme var. Kırmızı çizgileriniz birbirini koruyor.';
  } else if (overallScore >= 80) {
    tier = 'nisanlanabilir';
    verdictBadge = `%${overallScore} Uyum — Yüksek Ciddi İlişki & Nişan Uyumu`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence nişanlanabilirsiniz, sağlam bir temeliniz var.`;
    verdictAdvice =
      'Hayata bakışınızın ana omurgası uyumlu. Detaylardaki birkaç küçük yaklaşım farkı, karşılıklı saygıyla kolayca ortak bir ev düzenine dönüşebilir.';
  } else if (overallScore >= 60) {
    tier = 'sans_denenebilir';
    verdictBadge = `%${overallScore} Uyum — Koşullu Uyum / Şans Denenebilir`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence şansınızı deneyebilirsiniz ama konuşmanız gereken başlıklar var.`;
    verdictAdvice =
      'Ortak değerleriniz azımsanmayacak düzeyde; ancak aşağıda listelenen farklılık başlıklarını ilk görüşmelerde açıkça masaya yatırmanız gerekir.';
  } else {
    tier = 'dusuk_uyum';
    verdictBadge = `%${overallScore} Uyum — Kırmızı Çizgi / Düşük Uyum`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Temel beklentilerde keskin ayrışma mevcut.`;
    verdictAdvice =
      'Evlilik içi roller, dünya görüşü veya yaşam tarzı sınırlarında yıpratıcı olabilecek temel farklılıklar tespit edildi.';
  }

  return {
    candidate,
    overallScore,
    tier,
    verdictBadge,
    verdictHeadline,
    verdictAdvice,
    categoryScores,
    sharedStrengths: sharedStrengths.slice(0, 4),
    talkingPoints: talkingPoints.slice(0, 3),
    hardConflicts,
  };
}
