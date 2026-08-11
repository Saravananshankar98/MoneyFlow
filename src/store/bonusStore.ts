import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type BonusItemType =
  | "emi"
  | "loan"
  | "savings"
  | "recurring"
  | "notification";

export interface BonusItem {
  id: string;
  type: BonusItemType;
  title: string;
  amount: number;
  dueDate: string;
  accountId?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BonusState {
  items: BonusItem[];
  loading: boolean;
  loadItems: () => Promise<void>;
  addItem: (item: BonusItem) => Promise<void>;
  updateItem: (item: BonusItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

const STORAGE_KEY = "moneyflow_bonus_items";

async function readItems() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeItems(items: BonusItem[]) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items)
  );
}

export const useBonusStore = create<BonusState>(
  (set) => ({
    items: [],
    loading: false,

    loadItems: async () => {
      set({ loading: true });

      const items = await readItems();

      set({
        items,
        loading: false,
      });
    },

    addItem: async (item) => {
      const items = await readItems();
      const next = [item, ...items];

      await writeItems(next);
      set({ items: next });
    },

    updateItem: async (item) => {
      const items = await readItems();
      const next = items.map((current) =>
        current.id === item.id ? item : current
      );

      await writeItems(next);
      set({ items: next });
    },

    deleteItem: async (id) => {
      const items = await readItems();
      const next = items.filter((item) => item.id !== id);

      await writeItems(next);
      set({ items: next });
    },

    toggleComplete: async (id) => {
      const items = await readItems();
      const now = new Date().toISOString();
      const next = items.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              updatedAt: now,
            }
          : item
      );

      await writeItems(next);
      set({ items: next });
    },
  })
);
