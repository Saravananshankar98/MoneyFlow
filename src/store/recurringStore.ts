import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { RecurringTransaction } from "../features/recurring/types/recurringTransaction";
import type { Transaction } from "../features/transactions/types/transaction";
import { useAccountStore } from "./accountStore";
import { useTransactionStore } from "./transactionStore";

const STORAGE_KEY = "moneyflow_recurring_transactions";

function getNextRunAt(value: string, frequency: RecurringTransaction["frequency"]) {
  const next = new Date(value);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  return next.toISOString();
}

interface RecurringState {
  items: RecurringTransaction[];
  loading: boolean;
  loadItems: () => Promise<void>;
  saveItem: (item: RecurringTransaction) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  processDueItems: () => Promise<number>;
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  items: [],
  loading: false,

  loadItems: async () => {
    set({ loading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      set({ items: Array.isArray(parsed) ? parsed as RecurringTransaction[] : [], loading: false });
    } catch (error) {
      console.error("Failed to load recurring transactions:", error);
      set({ loading: false });
    }
  },

  saveItem: async (item) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: RecurringTransaction[] = raw ? JSON.parse(raw) : [];
    const next = existing.some((current) => current.id === item.id)
      ? existing.map((current) => current.id === item.id ? item : current)
      : [item, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ items: next });
  },

  deleteItem: async (id) => {
    const next = get().items.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ items: next });
  },

  toggleItem: async (id) => {
    const now = new Date().toISOString();
    const next = get().items.map((item) => item.id === id ? { ...item, active: !item.active, updatedAt: now } : item);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ items: next });
  },

  processDueItems: async () => {
    await get().loadItems();
    await Promise.all([
      useAccountStore.getState().loadAccounts(),
      useTransactionStore.getState().loadTransactions(),
    ]);

    const now = new Date();
    let processed = 0;
    let nextItems = get().items;

    for (const item of nextItems) {
      if (!item.active || new Date(item.nextRunAt) > now) continue;

      const alreadyCreated = useTransactionStore.getState().transactions.some(
        (transaction) => transaction.recurringId === item.id && transaction.date === item.nextRunAt
      );

      if (!alreadyCreated) {
        const createdAt = new Date().toISOString();
        const transaction: Transaction = {
          id: `${Date.now()}-${item.id}`,
          type: item.type,
          amount: item.amount,
          details: item.details,
          accountId: item.accountId,
          toAccountId: item.toAccountId,
          paymentType: item.paymentType,
          category: item.category,
          notes: item.notes,
          recurringId: item.id,
          date: item.nextRunAt,
          createdAt,
          updatedAt: createdAt,
        };
        const result = await useTransactionStore.getState().addTransaction(transaction);
        if (!result.success) continue;
        processed += 1;
      }

      const updatedAt = new Date().toISOString();
      nextItems = nextItems.map((current) => current.id === item.id
        ? { ...current, nextRunAt: getNextRunAt(current.nextRunAt, current.frequency), updatedAt }
        : current);
    }

    if (processed > 0 || nextItems !== get().items) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
      set({ items: nextItems });
    }
    return processed;
  },
}));
