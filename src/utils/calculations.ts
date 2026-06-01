import { UserProfile, MacroTargets } from '@/types/index';

export const calculateBMR = (profile: UserProfile): number => {
  const { heightFeet, heightInches, weightLbs, age, sex, bodyFatPercent } = profile;
  
  if (bodyFatPercent !== undefined) {
    const leanMass = weightLbs * (1 - bodyFatPercent / 100);
    return 370 + 21.6 * leanMass;
  }

  const heightCm = (heightFeet * 12 + heightInches) * 2.54;
  const weightKg = weightLbs * 0.453592;

  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  return Math.round(bmr);
};

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2;
  return Math.round(bmr * multiplier);
};

export const calculateMacros = (profile: UserProfile, tdee: number): MacroTargets => {
  const bmr = calculateBMR(profile);
  const { goal } = profile;

  let targetCalories = tdee;
  if (goal === 'fat_loss') {
    targetCalories = tdee - 500;
  } else if (goal === 'muscle_gain') {
    targetCalories = tdee + 300;
  }

  const protein = Math.round(profile.weightLbs);
  const fat = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4);

  return {
    uid: profile.uid,
    calories: targetCalories,
    protein,
    carbs,
    fat,
    bmr,
    tdee,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const getMacroPercentages = (calories: number, protein: number, carbs: number, fat: number) => {
  return {
    protein: Math.round((protein * 4 / calories) * 100),
    carbs: Math.round((carbs * 4 / calories) * 100),
    fat: Math.round((fat * 9 / calories) * 100),
  };
};

export const calculateRemaining = (
  target: { calories: number; protein: number; carbs: number; fat: number },
  current: { calories: number; protein: number; carbs: number; fat: number }
) => {
  return {
    calories: target.calories - current.calories,
    protein: target.protein - current.protein,
    carbs: target.carbs - current.carbs,
    fat: target.fat - current.fat,
  };
};

export const getConsistencyScore = (logsThisWeek: number): number => {
  const maxDays = 7;
  return Math.round((logsThisWeek / maxDays) * 100);
};

export const calculateBMI = (weightLbs: number, heightFeet: number, heightInches: number): number => {
  const heightInches_total = heightFeet * 12 + heightInches;
  const bmi = (weightLbs / (heightInches_total * heightInches_total)) * 703;
  return Math.round(bmi * 10) / 10;
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const splitMealMacros = (
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  splitStyle: 'even' | 'big_breakfast' | 'big_lunch_dinner' = 'even'
) => {
  const percentages: Record<string, number> = {
    breakfast: 0.25,
    morning_snack: 0.1,
    lunch: 0.35,
    afternoon_snack: 0.1,
    dinner: 0.2,
    evening_snack: 0.0,
  };

  if (splitStyle === 'big_breakfast') {
    percentages.breakfast = 0.35;
    percentages.lunch = 0.25;
  } else if (splitStyle === 'big_lunch_dinner') {
    percentages.lunch = 0.4;
    percentages.dinner = 0.3;
  }

  return Object.entries(percentages).reduce((acc, [meal, percentage]) => {
    acc[meal] = {
      calories: Math.round(totalCalories * percentage),
      protein: Math.round(totalProtein * percentage),
      carbs: Math.round(totalCarbs * percentage),
      fat: Math.round(totalFat * percentage),
    };
    return acc;
  }, {} as Record<string, any>);
};
