import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { SavingsGoal } from "../features/goals/types/savingsGoal";
import { readStorageArray } from "../core/storage/readStorageArray";

const STORAGE_KEY = "moneyflow_savings_goals";

interface SavingsGoalState {
  goals: SavingsGoal[];
  loadGoals: () => Promise<void>;
  saveGoal: (goal: SavingsGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useSavingsGoalStore = create<SavingsGoalState>((set) => ({
  goals: [],
  loadGoals: async () => {
    try {
      set({ goals: await readStorageArray<SavingsGoal>(STORAGE_KEY) });
    } catch (error) {
      console.error("Unable to load savings goals:", error);
    }
  },
  saveGoal: async (goal) => {
    const existing = await readStorageArray<SavingsGoal>(STORAGE_KEY);
    const next = existing.some((item) => item.id === goal.id)
      ? existing.map((item) => item.id === goal.id ? goal : item)
      : [goal, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ goals: next });
  },
  deleteGoal: async (id) => {
    const existing = await readStorageArray<SavingsGoal>(STORAGE_KEY);
    const next = existing.filter((goal) => goal.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ goals: next });
  },
}));
