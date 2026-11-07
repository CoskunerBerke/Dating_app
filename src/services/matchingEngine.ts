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
  const maxDist = Math.sqrt(vecA.length);
  const dist = Math.sqrt(sumSq);
  return Math.max(0, 1 - dist / (maxDist * 0.72));
}

export interface LiveArchetypeResult {
  title: string;
  subtitle: string;
  traits: { label: string; value: number }[];
}

export function computeLiveArchetype(
  userAnswers: Record<string, UserAnswer>
): LiveArchetypeResult {
  const answeredList = Object.values(userAnswers);
  if (answeredList.length === 0) {
    return {
      title: 'Profil Çözümleniyor...',
      subtitle: 'Soruları yanıtladıkça karakter arketipin şekillenecek.',
      traits: [
        { label: 'Değer Netliği', value: 25 },
        { label: 'Sosyal Dinamizm', value: 25 },
        { label: 'Sınır Hassasiyeti', value: 25 },
        { label: 'Uzlaşma Esnekliği', value: 25 },
      ],
    };
  }

  let sumV0 = 0;
  let sumV1 = 0;
  let sumV2 = 0;
  let sumV3 = 0;
  let count = 0;

  for (const ans of answeredList) {
    const q = QUESTIONS.find((item) => item.id === ans.questionId);
    const opt = q?.options.find((o) => o.id === ans.selectedOptionId);
    if (opt && opt.weightVector.length === 4) {
      sumV0 += opt.weightVector[0];
      sumV1 += opt.weightVector[1];
      sumV2 += opt.weightVector[2];
      sumV3 += opt.weightVector[3];
      count++;
    }
  }

  const avg0 = count > 0 ? sumV0 / count : 0.5;
  const avg1 = count > 0 ? sumV1 / count : 0.5;
  const avg2 = count > 0 ? sumV2 / count : 0.5;
  const avg3 = count > 0 ? sumV3 / count : 0.5;

  let title = 'Dengeli & Seçici Ritim';
  let subtitle =
    'Kendi sınırlarını korurken karşı tarafın alanına saygı duyan, yüksek farkındalıklı iletişim profili.';

  if (avg0 >= 0.72) {
    title = 'Köklü Değer & Sadakat Odaklı';
    subtitle =
      'Manevi pusulası net, ilişkide güven, mahremiyet ve derin bağlılığı her şeyin üstünde tutan karakter.';
  } else if (avg3 >= 0.72) {
    title = 'Özgür Ruhlu & Çağdaş Vizyoner';
    subtitle =
      'Bireysel özerkliğe, eşitlikçi paylaşıma ve entelektüel/sosyal keşfe önem veren modern profil.';
  } else if (avg1 >= 0.72 && avg2 >= 0.55) {
    title = 'Sentezci & Uyum Mimarisi';
    subtitle =
      'Hem geleneksel sıcaklığı hem de modern şehir dinamiklerini bir arada taşıyabilen birleştirici karakter.';
  }

  return {
    title,
    subtitle,
    traits: [
      { label: 'Geleneksel & Manevi Kök', value: Math.round(avg0 * 100) },
      { label: 'İlişkisel Uyum & Denge', value: Math.round(avg1 * 100) },
      { label: 'Sosyal Açıklık & Keşif', value: Math.round(avg2 * 100) },
      { label: 'Bireysel Özerklik', value: Math.round(avg3 * 100) },
    ],
  };
}

export function analyzeCompatibility(
  userAnswers: Record<string, UserAnswer>,
  candidate: CandidateProfile
): MatchAnalysisResult {
  const categoryTotals: Record<QuestionCategory, { weightedSum: number; totalWeight: number }> = {
    inanc_maneviyat: { weightedSum: 0, totalWeight: 0 },
    dunya_gorusu_degerler: { weightedSum: 0, totalWeight: 0 },
    yasam_tarzi_sosyal: { weightedSum: 0, totalWeight: 0 },
    maddi_dinamikler: { weightedSum: 0, totalWeight: 0 },
    iletisim_sinirlar: { weightedSum: 0, totalWeight: 0 },
    gelecek_vizyonu: { weightedSum: 0, totalWeight: 0 },
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
      sharedStrengths.push(`${question.categoryLabel}: "${userOpt.shortTag}" çizgisinde tam frekans uyumu.`);
    } else if (userOpt.compatibleWith.includes(candOpt.id)) {
      questionScore = 92;
      sharedStrengths.push(`${question.categoryLabel} başlığında birbirini tamamlayan yaklaşım.`);
    } else if (userOpt.partialCompatibleWith.includes(candOpt.id)) {
      const vecSim = vectorSimilarity(userOpt.weightVector, candOpt.weightVector);
      questionScore = Math.round(58 + vecSim * 22);
      talkingPoints.push(
        `${question.categoryLabel}: Sen "${userOpt.shortTag}" derken o "${candOpt.shortTag}" noktasında.`
      );
    } else {
      const vecSim = vectorSimilarity(userOpt.weightVector, candOpt.weightVector);
      questionScore = Math.round(vecSim * 42);
      if (isUserDealbreaker || isCandDealbreaker) {
        dealbreakerViolations += 1;
        hardConflicts.push(
          `${question.categoryLabel} (Kırmızı Çizgi): "${userOpt.shortTag}" ile "${candOpt.shortTag}" arasında keskin fark var.`
        );
      } else {
        talkingPoints.push(
          `${question.categoryLabel} konusunda bakış açılarınız farklı; ilk kahvede konuşmaya değer.`
        );
      }
    }

    totalWeightedScore += questionScore * weight;
    totalWeight += weight;

    categoryTotals[question.category].weightedSum += questionScore * weight;
    categoryTotals[question.category].totalWeight += weight;
  }

  let rawOverall = totalWeight > 0 ? totalWeightedScore / totalWeight : 50;

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
    tier = 'yuksek_kimya';
    verdictBadge = `%${overallScore} Frekans — Kusursuz Kimya`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence hiç vakit kaybetmeyin, direkt sevgili olabilirsiniz!`;
    verdictAdvice =
      'Hayata bakışınız, mizah/sosyal ritminiz ve kırmızı çizgileriniz nadir görülen bir uyumda. İlk buluşmada saatlerin nasıl geçtiğini anlamazsınız.';
  } else if (overallScore >= 80) {
    tier = 'ciddi_uyum';
    verdictBadge = `%${overallScore} Frekans — Güçlü İlişki Potansiyeli`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence çok sağlam bir ilişki çıkar, uzun vadede çok iyi anlaşırsınız.`;
    verdictAdvice =
      'Ana değer omurganız birebir örtüşüyor. Küçük yaşam tarzı nüansları ise ilişkinize dinamizm ve sohbet zenginliği katacak düzeyde.';
  } else if (overallScore >= 60) {
    tier = 'sans_denenebilir';
    verdictBadge = `%${overallScore} Frekans — Şans Denenebilir`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Bence bir kahve içip şansınızı kesinlikle deneyebilirsiniz.`;
    verdictAdvice =
      'Ortak paydalarınız güçlü; farklı düşündüğünüz 1-2 başlık ise birbirinize yeni pencereler açabilir. Ön yargısız bir tanışmaya değer.';
  } else {
    tier = 'dusuk_uyum';
    verdictBadge = `%${overallScore} Frekans — Farklı Dünyalar`;
    verdictHeadline = `Yüzde ${overallScore} uyumlu: Sosyal ritim ve temel sınırlarda farklı dünyalardasınız.`;
    verdictAdvice =
      'Yaşam tarzı ve öncelik sıralamanızda belirgin zıtlıklar var; yine de zıt kutupların çekimine inanıyorsanız profili inceleyebilirsiniz.';
  }

  const icebreakerSuggestion = `"Selam! İkimizin de ortak frekansı %${overallScore} çıkmış. Özellikle '${candidate.favoriteVibe.split(',')[0]}' detayını görünce yazmak istedim, senin için ideal bir hafta sonu nasıl geçer?"`;

  return {
    candidate,
    overallScore,
    tier,
    verdictBadge,
    verdictHeadline,
    verdictAdvice,
    icebreakerSuggestion,
    categoryScores,
    sharedStrengths: sharedStrengths.slice(0, 4),
    talkingPoints: talkingPoints.slice(0, 3),
    hardConflicts,
  };
}
