import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { Budget } from "../features/budgets/types/budget";
import { readStorageArray } from "../core/storage/readStorageArray";

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
      const budgets = await readStorageArray<Budget>(STORAGE_KEY);
      set({ budgets, loading: false });
    } catch (error) {
      console.error("Failed to load budgets:", error);
      set({ loading: false });
    }
  },

  saveBudget: async (budget) => {
    const existing = await readStorageArray<Budget>(STORAGE_KEY);
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
    const existing = await readStorageArray<Budget>(STORAGE_KEY);
    const next = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ budgets: next });
  },
}));
