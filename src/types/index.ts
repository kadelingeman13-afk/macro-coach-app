export interface UserProfile {
  uid: string;
  email: string;
  age: number;
  sex: 'male' | 'female';
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  bodyFatPercent?: number;
  goal: 'fat_loss' | 'muscle_gain' | 'maintain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  trackingStyle: 'detailed' | 'simple';
  createdAt: Date;
  updatedAt: Date;
}

export interface MacroTargets {
  uid: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: string;
  name: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  isActive: boolean;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  isLocked: boolean;
}

export interface MealConfig {
  uid: string;
  meals: Meal[];
  splitStyle: 'even' | 'big_breakfast' | 'big_lunch_dinner';
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodLog {
  id: string;
  uid: string;
  mealId: string;
  foodId: string;
  foodName: string;
  quantity: number;
  servingSize: string;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  loggedAt: Date;
  date: string;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  servingUnit: string;
  brand?: string;
  barcode?: string;
  source: 'nutritionix' | 'usda' | 'custom' | 'recipe';
}

export interface DailyLog {
  uid: string;
  date: string;
  foods: FoodLog[];
  water: number;
  weight?: number;
  sleep?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Habit {
  id: string;
  uid: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  targetDays?: number;
  icon?: string;
  color?: string;
  createdAt: Date;
}

export interface WeightEntry {
  id: string;
  uid: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface WaterLog {
  id: string;
  uid: string;
  date: string;
  ounces: number;
  entries: WaterEntry[];
}

export interface WaterEntry {
  id: string;
  timestamp: Date;
  ounces: number;
}

export interface FixMyDayResponse {
  analysis: string;
  suggestions: MealSuggestion[];
  swaps: FoodSwap[];
  adjustments: string[];
}

export interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipe?: string;
}

export interface FoodSwap {
  from: string;
  to: string;
  reason: string;
  macrosDifference: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Exchange {
  id: string;
  type: 'protein' | 'carb' | 'fat' | 'vegetable';
  name: string;
  servingSize: string;
  quantity: number;
  unit: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  foods: string[];
}
