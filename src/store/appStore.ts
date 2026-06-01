import { create } from 'zustand';
import { UserProfile, MacroTargets, MealConfig, DailyLog, Habit, WeightEntry, WaterLog } from '@/types/index';

interface AppStore {
  user: UserProfile | null;
  macroTargets: MacroTargets | null;
  mealConfig: MealConfig | null;
  dailyLogs: DailyLog[];
  habits: Habit[];
  weights: WeightEntry[];
  waterLog: WaterLog | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: UserProfile | null) => void;
  setMacroTargets: (targets: MacroTargets) => void;
  setMealConfig: (config: MealConfig) => void;
  setDailyLogs: (logs: DailyLog[]) => void;
  setHabits: (habits: Habit[]) => void;
  setWeights: (weights: WeightEntry[]) => void;
  setWaterLog: (log: WaterLog) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (auth: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  macroTargets: null,
  mealConfig: null,
  dailyLogs: [],
  habits: [],
  weights: [],
  waterLog: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user }),
  setMacroTargets: (targets) => set({ macroTargets: targets }),
  setMealConfig: (config) => set({ mealConfig: config }),
  setDailyLogs: (logs) => set({ dailyLogs: logs }),
  setHabits: (habits) => set({ habits }),
  setWeights: (weights) => set({ weights }),
  setWaterLog: (log) => set({ waterLog: log }),
  setLoading: (loading) => set({ isLoading: loading }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  reset: () => set({
    user: null,
    macroTargets: null,
    mealConfig: null,
    dailyLogs: [],
    habits: [],
    weights: [],
    waterLog: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));
