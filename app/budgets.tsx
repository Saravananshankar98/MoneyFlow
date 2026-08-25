import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, IconButton, Modal, Portal, ProgressBar, Text, TextInput, useTheme } from "react-native-paper";
import AppSelect from "../src/shared/components/inputs/AppSelect";
import { useBudgetStore } from "../src/store/budgetStore";
import { useCategoryStore } from "../src/store/categoryStore";
import { useTransactionStore } from "../src/store/transactionStore";
import { useCurrencyFormatter } from "../src/store/settingsStore";

const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function BudgetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { budgets, loadBudgets, saveBudget, deleteBudget } = useBudgetStore();
  const { categories, loadCategories } = useCategoryStore();
  const { transactions, loadTransactions } = useTransactionStore();
  const { currency, formatMoney } = useCurrencyFormatter();
  const [visible, setVisible] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([loadBudgets(), loadCategories(), loadTransactions()]);
  }, [loadBudgets, loadCategories, loadTransactions]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const expenseCategories = categories.filter((category) => category.type === "expense" || category.type === "both");
  const month = currentMonth();
  const monthBudgets = budgets.filter((budget) => budget.month === month);
  const previousMonth = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  }, []);
  const previousMonthBudgets = budgets.filter((budget) => budget.month === previousMonth);

  const spentByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    transactions
      .filter((transaction) => transaction.type === "expense" && transaction.date.slice(0, 7) === month && transaction.category)
      .forEach((transaction) => totals.set(transaction.category!, (totals.get(transaction.category!) ?? 0) + transaction.amount));
    return totals;
  }, [month, transactions]);

  const openCreate = () => {
    setCategoryId(expenseCategories.find((category) => !monthBudgets.some((budget) => budget.categoryId === category.id))?.id ?? "");
    setAmount("");
    setVisible(true);
  };

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (!categoryId || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    const now = new Date().toISOString();
    await saveBudget({ id: `${Date.now()}`, categoryId, amount: numericAmount, month, createdAt: now, updatedAt: now });
    setVisible(false);
  };

  const copyPreviousBudgets = async () => {
    const now = new Date().toISOString();
    const currentCategoryIds = new Set(monthBudgets.map((budget) => budget.categoryId));
    const missingBudgets = previousMonthBudgets.filter((budget) => !currentCategoryIds.has(budget.categoryId));

    for (const budget of missingBudgets) {
      await saveBudget({
        ...budget,
        id: `${Date.now()}-${budget.categoryId}`,
        month,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false); }} />}
      >
        <View style={styles.pageHeader}><IconButton icon="arrow-left" onPress={() => router.back()} /><Text variant="headlineMedium" style={styles.title}>Budgets</Text></View>
        <Text variant="bodyMedium" style={styles.subtitle}>Set spending limits for {new Date().toLocaleDateString(currency.locale, { month: "long", year: "numeric" })}.</Text>

        {monthBudgets.map((budget) => {
          const category = categories.find((item) => item.id === budget.categoryId);
          const spent = spentByCategory.get(budget.categoryId) ?? 0;
          const ratio = spent / budget.amount;
          return (
            <Card key={budget.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.grow}>
                    <Text variant="titleMedium">{category?.name ?? "Deleted category"}</Text>
                    <Text variant="bodySmall" style={styles.muted}>{formatMoney(spent)} of {formatMoney(budget.amount)}</Text>
                  </View>
                  <IconButton icon="delete-outline" iconColor={theme.colors.error} onPress={() => deleteBudget(budget.id)} />
                </View>
                <ProgressBar progress={Math.min(ratio, 1)} color={ratio >= 1 ? theme.colors.error : theme.colors.primary} style={styles.progress} />
                <Text variant="bodySmall" style={[styles.remaining, ratio >= 1 && { color: theme.colors.error }]}>
                  {ratio >= 1 ? `${formatMoney(spent - budget.amount)} over budget` : `${formatMoney(budget.amount - spent)} remaining`}
                </Text>
              </Card.Content>
            </Card>
          );
        })}

        {monthBudgets.length === 0 && <Card style={styles.emptyCard}><Card.Content><Text variant="titleMedium">No budgets yet</Text><Text style={styles.muted}>Create a category budget to see your progress here.</Text>{previousMonthBudgets.length > 0 ? <Button mode="outlined" icon="content-copy" onPress={copyPreviousBudgets} style={styles.copyButton}>Copy last month’s budgets</Button> : null}</Card.Content></Card>}
        <Button mode="contained" icon="plus" onPress={openCreate} contentStyle={styles.buttonContent}>Add Budget</Button>
      </ScrollView>

      <Portal><Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineSmall" style={styles.modalTitle}>Add monthly budget</Text>
        <AppSelect label="Expense category" value={categoryId} onChange={setCategoryId} options={expenseCategories.map((category) => ({ label: category.name, value: category.id }))} placeholder="Select category" />
        <TextInput mode="outlined" label="Budget amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
        <Button mode="contained" onPress={handleSave} style={styles.saveButton} disabled={!categoryId || Number(amount) <= 0}>Save Budget</Button>
      </Modal></Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 40 }, pageHeader: { flexDirection: "row", alignItems: "center", marginLeft: -12 }, title: { fontWeight: "700" }, subtitle: { marginTop: 4, marginBottom: 20, color: "#64748B" },
  card: { marginBottom: 12, borderRadius: 16 }, emptyCard: { marginBottom: 16, borderRadius: 16 }, cardHeader: { flexDirection: "row", alignItems: "center" }, grow: { flex: 1 }, muted: { color: "#64748B", marginTop: 4 }, progress: { height: 8, borderRadius: 4, marginTop: 14 }, remaining: { marginTop: 8, color: "#16A34A" },
  buttonContent: { minHeight: 48 }, copyButton: { marginTop: 16 }, modal: { width: "92%", maxWidth: 480, alignSelf: "center", borderRadius: 24, padding: 20 }, modalTitle: { marginBottom: 20, fontWeight: "700" }, saveButton: { marginTop: 8 },
});
