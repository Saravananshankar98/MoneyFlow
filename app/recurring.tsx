import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, IconButton, Modal, Portal, SegmentedButtons, Switch, Text, TextInput, useTheme } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import AppSelect from "../src/shared/components/inputs/AppSelect";
import { useAccountStore } from "../src/store/accountStore";
import { useRecurringStore } from "../src/store/recurringStore";
import type { RecurringFrequency } from "../src/features/recurring/types/recurringTransaction";
import { useCurrencyFormatter } from "../src/store/settingsStore";
import { useNotificationStore } from "../src/store/notificationStore";


export default function RecurringScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { accounts, loadAccounts } = useAccountStore();
  const { items, loadItems, saveItem, deleteItem, toggleItem, processDueItems } = useRecurringStore();
  const { currency, formatMoney } = useCurrencyFormatter();
  const { showNotification } = useNotificationStore();
  const [visible, setVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [accountId, setAccountId] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [firstRun, setFirstRun] = useState(new Date());

  const loadData = useCallback(async () => { await Promise.all([loadAccounts(), loadItems()]); }, [loadAccounts, loadItems]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const openCreate = () => {
    setType("expense"); setAccountId(accounts.find((account) => !account.isArchived)?.id ?? ""); setDetails(""); setAmount(""); setFrequency("monthly"); setFirstRun(new Date()); setVisible(true);
  };

  const save = async () => {
    const numericAmount = Number(amount);
    if (!accountId || !details.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    const now = new Date().toISOString();
    await saveItem({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type, amount: numericAmount, details: details.trim(), accountId,
      frequency, nextRunAt: firstRun.toISOString(), active: true, createdAt: now, updatedAt: now,
    });
    setVisible(false);
  };

  const runDueItems = async () => {
    try {
      const processed = await processDueItems();
      await loadData();
      showNotification(
        processed > 0
          ? `${processed} recurring ${processed === 1 ? "transaction" : "transactions"} created.`
          : "No recurring transactions are due right now.",
        "success"
      );
    } catch (error) {
      console.error("Unable to run recurring items:", error);
      showNotification("Unable to process recurring transactions.", "error");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}><IconButton icon="arrow-left" onPress={() => router.back()} /><Text variant="headlineMedium" style={styles.title}>Recurring</Text></View>
        <Text variant="bodyMedium" style={styles.subtitle}>Automate regular income and expenses. Due items are created when you open the app.</Text>
        <Button mode="outlined" icon="refresh" onPress={runDueItems} style={styles.runButton}>Run due items</Button>

        {items.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <View style={styles.grow}>
                  <Text variant="titleMedium">{item.details}</Text>
                  <Text variant="bodySmall" style={styles.muted}>{item.type === "income" ? "Income" : "Expense"} · {item.frequency} · Next: {new Date(item.nextRunAt).toLocaleDateString(currency.locale)}</Text>
                </View>
                <Switch value={item.active} onValueChange={() => toggleItem(item.id)} />
                <IconButton icon="delete-outline" iconColor={theme.colors.error} onPress={() => deleteItem(item.id)} />
              </View>
              <Text variant="headlineSmall" style={item.type === "income" ? styles.income : styles.expense}>{item.type === "income" ? "+" : "-"}{formatMoney(item.amount)}</Text>
            </Card.Content>
          </Card>
        ))}

        {items.length === 0 && <Card style={styles.emptyCard}><Card.Content><Text variant="titleMedium">No recurring items</Text><Text style={styles.muted}>Add salary, rent, EMI, or subscription payments here.</Text></Card.Content></Card>}
        <Button mode="contained" icon="plus" onPress={openCreate} contentStyle={styles.buttonContent}>Add Recurring Item</Button>
      </ScrollView>

      <Portal><Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text variant="headlineSmall" style={styles.modalTitle}>Recurring transaction</Text>
          <SegmentedButtons value={type} onValueChange={(value) => setType(value as "expense" | "income")} buttons={[{ value: "expense", label: "Expense" }, { value: "income", label: "Income" }]} />
          <TextInput mode="outlined" label="Details" value={details} onChangeText={setDetails} style={styles.field} />
          <TextInput mode="outlined" label="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} style={styles.field} />
          <AppSelect label="Account" value={accountId} onChange={setAccountId} options={accounts.filter((account) => !account.isArchived).map((account) => ({ label: account.name, value: account.id }))} placeholder="Select account" />
          <AppSelect label="Frequency" value={frequency} onChange={(value: string) => setFrequency(value as RecurringFrequency)} options={[{ label: "Every week", value: "weekly" }, { label: "Every month", value: "monthly" }]} />
          <TextInput mode="outlined" label="First run date" value={firstRun.toLocaleDateString("en-GB")} editable={false} right={<TextInput.Icon icon="calendar" onPress={() => setDatePickerVisible(true)} />} onPressIn={() => setDatePickerVisible(true)} />
          <Button mode="contained" onPress={save} style={styles.saveButton} disabled={!accountId || !details.trim() || Number(amount) <= 0}>Save Recurring Item</Button>
        </ScrollView>
      </Modal>
      <DatePickerModal locale="en" mode="single" visible={datePickerVisible} date={firstRun} onDismiss={() => setDatePickerVisible(false)} onConfirm={({ date }) => { setDatePickerVisible(false); if (date) setFirstRun(date); }} />
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 40 }, pageHeader: { flexDirection: "row", alignItems: "center", marginLeft: -12 }, title: { fontWeight: "700" }, subtitle: { marginTop: 4, marginBottom: 20, color: "#64748B" },
  card: { borderRadius: 16, marginBottom: 12 }, emptyCard: { borderRadius: 16, marginBottom: 16 }, row: { flexDirection: "row", alignItems: "center" }, grow: { flex: 1 }, muted: { color: "#64748B", marginTop: 4 }, income: { color: "#16A34A", marginTop: 14, fontWeight: "700" }, expense: { color: "#DC2626", marginTop: 14, fontWeight: "700" },
  buttonContent: { minHeight: 48 }, runButton: { marginBottom: 16 }, modal: { width: "92%", maxWidth: 480, maxHeight: "88%", alignSelf: "center", borderRadius: 24, padding: 20 }, modalTitle: { marginBottom: 20, fontWeight: "700" }, field: { marginTop: 16 }, saveButton: { marginTop: 20 },
});
