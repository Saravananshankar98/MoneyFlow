import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getDaysUntilDue, getOutstanding } from "../features/accounts/utils/creditCard";
import { useAccountStore } from "../store/accountStore";
import { useBudgetStore } from "../store/budgetStore";
import { formatMoney, useSettingsStore } from "../store/settingsStore";
import { useRecurringStore } from "../store/recurringStore";
import { useTransactionStore } from "../store/transactionStore";
import { useCategoryStore } from "../store/categoryStore";
import { readStorageArray } from "../core/storage/readStorageArray";

const SENT_REMINDERS_KEY = "moneyflow_sent_reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission() {
  if (Platform.OS === "web") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("moneyflow-reminders", {
      name: "MoneyFlow reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function notifyOnce(key: string, title: string, body: string) {
  const sent = await readStorageArray<string>(SENT_REMINDERS_KEY);
  if (sent.includes(key)) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: false },
    trigger: null,
  });

  const next = [...sent.slice(-150), key];
  await AsyncStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify(next));
}

export async function checkFinancialReminders() {
  if (!useSettingsStore.getState().notificationsEnabled) return;
  if (!(await ensureNotificationPermission())) return;

  await Promise.all([
    useAccountStore.getState().loadAccounts(),
    useTransactionStore.getState().loadTransactions(),
    useBudgetStore.getState().loadBudgets(),
    useCategoryStore.getState().loadCategories(),
    useRecurringStore.getState().loadItems(),
  ]);

  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const currency = useSettingsStore.getState().currency;
  const transactions = useTransactionStore.getState().transactions;
  const categories = useCategoryStore.getState().categories;

  for (const budget of useBudgetStore.getState().budgets.filter((item) => item.month === month)) {
    const spent = transactions
      .filter((transaction) => transaction.type === "expense" && transaction.category === budget.categoryId && transaction.date.slice(0, 7) === month)
      .reduce((total, transaction) => total + transaction.amount, 0);
    const ratio = spent / budget.amount;
    const categoryName = categories.find((category) => category.id === budget.categoryId)?.name ?? "Category";
    if (ratio >= 1) await notifyOnce(`budget-${budget.id}-100-${month}`, "Budget limit reached", `${categoryName} has reached ${formatMoney(spent, currency)} of its budget.`);
    else if (ratio >= 0.8) await notifyOnce(`budget-${budget.id}-80-${month}`, "Budget alert", `${categoryName} has reached ${Math.round(ratio * 100)}% of its monthly budget.`);
  }

  for (const account of useAccountStore.getState().accounts) {
    if (account.type !== "Credit Card" || account.isArchived || getOutstanding(account) <= 0) continue;
    const days = getDaysUntilDue(account, now);
    if (days >= 0 && days <= 3) {
      await notifyOnce(`credit-due-${account.id}-${now.toISOString().slice(0, 10)}`, "Credit card payment due", `${account.name} has ${formatMoney(getOutstanding(account), currency)} due ${days === 0 ? "today" : `in ${days} days`}.`);
    }
  }

  for (const item of useRecurringStore.getState().items) {
    if (!item.active) continue;
    const days = Math.ceil((new Date(item.nextRunAt).getTime() - now.getTime()) / 86_400_000);
    if (days >= 0 && days <= 2) {
      await notifyOnce(`recurring-${item.id}-${item.nextRunAt}`, "Upcoming recurring payment", `${item.details} (${formatMoney(item.amount, currency)}) is due ${days === 0 ? "today" : `in ${days} days`}.`);
    }
  }
}
