import { ActivityLevel, DailyLog, Goal, UserProfile } from '../context/AppContext';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  low: 1.2,
  medium: 1.45,
  high: 1.7,
};

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  lose: -350,
  maintain: 0,
  gain: 250,
};

function qualityScore(mealsText: string) {
  const text = mealsText.toLowerCase();
  const positive = ['salata', 'sebze', 'protein', 'yoğurt', 'tavuk', 'balık', 'yulaf', 'meyve'];
  const negative = ['kızartma', 'fast food', 'cips', 'tatlı', 'gazlı', 'burger', 'pizza'];
  const pos = positive.filter((item) => text.includes(item)).length;
  const neg = negative.filter((item) => text.includes(item)).length;
  return clamp(16 + pos * 4 - neg * 5, 0, 32);
}

function fitMessage(score: number) {
  if (score >= 80) return 'Süper gidiyorsun. Bu ritmi korursan hedefe stabil ilerlersin.';
  if (score >= 65) return 'İyi bir gün. Suyu biraz artırıp akşamı hafif tutarsan yarın skor yükselir.';
  if (score >= 50) return 'Temel düzeydesin. Yarın öğün planını netleştirip kısa bir yürüyüş ekle.';
  return 'Bugün toparlanma lazım. Sana 3 günlük sade bir plan öneriyorum.';
}

export const aiSimulationService = {
  calculateBMI(profile: UserProfile) {
    const h = profile.heightCm / 100;
    return Number((profile.weightKg / (h * h)).toFixed(1));
  },

  calculateTDEE(profile: UserProfile, activityLevel: ActivityLevel) {
    const bmr =
      10 * profile.weightKg +
      6.25 * profile.heightCm -
      5 * profile.age +
      (profile.gender === 'male' ? 5 : -161);
    return Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
  },

  calculateFitScore(profile: UserProfile, mealsText: string, waterLiters: number, activityLevel: ActivityLevel) {
    const bmi = this.calculateBMI(profile);
    const tdee = this.calculateTDEE(profile, activityLevel);
    const hydration = clamp((waterLiters / 2.5) * 28, 0, 28);
    const activity = activityLevel === 'high' ? 28 : activityLevel === 'medium' ? 20 : 12;
    const nutrition = qualityScore(mealsText);
    const bmiBalance = clamp(18 - Math.abs(22 - bmi) * 2.1, 8, 18);
    const goalBonus = profile.goal === 'lose' ? 4 : profile.goal === 'gain' ? 5 : 3;

    const fitScore = Math.round(clamp(hydration + activity + nutrition + bmiBalance + goalBonus, 0, 100));

    return {
      fitScore,
      bmi,
      tdee,
      targetCalories: tdee + GOAL_CALORIE_ADJUSTMENT[profile.goal],
      coachMessage: fitMessage(fitScore),
    };
  },

  getRecoveryMealPlan(goal: Goal): DailyLog['mealPlan'] {
    const maintainPlan = [
      { breakfast: 'Omlet + tam tahıllı ekmek', lunch: 'Tavuklu salata + ayran', dinner: 'Sebze çorbası + yoğurt' },
      { breakfast: 'Yulaf + yoğurt + meyve', lunch: 'Ton balıklı sandviç', dinner: 'Izgara köfte + salata' },
      { breakfast: 'Haşlanmış yumurta + avokado', lunch: 'Mercimek bowl', dinner: 'Fırın tavuk + brokoli' },
    ];
    const losePlan = [
      { breakfast: 'Yulaf + chia + yoğurt', lunch: 'Büyük yeşil salata + tavuk', dinner: 'Sebze yemeği + cacık' },
      { breakfast: '2 yumurta + domates', lunch: 'Ton balıklı salata', dinner: 'Mercimek çorbası + yoğurt' },
      { breakfast: 'Protein smoothie', lunch: 'Hindi wrap + ayran', dinner: 'Fırın somon + sebze' },
    ];
    const gainPlan = [
      { breakfast: 'Yulaf + süt + muz + fıstık ezmesi', lunch: 'Pilav + tavuk + yoğurt', dinner: 'Somon + patates' },
      { breakfast: 'Omlet + peynirli tost', lunch: 'Kıymalı makarna + ayran', dinner: 'Et sote + bulgur' },
      { breakfast: 'Granola + yoğurt + kuruyemiş', lunch: 'Tavuklu sandviç', dinner: 'Kuru fasulye + pirinç' },
    ];
    if (goal === 'lose') return losePlan;
    if (goal === 'gain') return gainPlan;
    return maintainPlan;
  },
};
