import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { Budget } from "../features/budgets/types/budget";

const STORAGE_KEY = "moneyflow_budgets";

interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  loadBudgets: () => Promise<void>;
  saveBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  loading: false,

  loadBudgets: async () => {
    set({ loading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      set({ budgets: Array.isArray(parsed) ? parsed as Budget[] : [], loading: false });
    } catch (error) {
      console.error("Failed to load budgets:", error);
      set({ loading: false });
    }
  },

  saveBudget: async (budget) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: Budget[] = raw ? JSON.parse(raw) : [];
    const index = existing.findIndex(
      (item) => item.categoryId === budget.categoryId && item.month === budget.month
    );
    const next = index >= 0
      ? existing.map((item, itemIndex) => itemIndex === index ? { ...budget, id: item.id, createdAt: item.createdAt } : item)
      : [...existing, budget];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ budgets: next });
  },

  deleteBudget: async (id) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: Budget[] = raw ? JSON.parse(raw) : [];
    const next = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ budgets: next });
  },
}));
