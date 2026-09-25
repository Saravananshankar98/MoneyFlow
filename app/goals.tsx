import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, IconButton, Modal, Portal, ProgressBar, Text, TextInput, useTheme } from "react-native-paper";
import { useSavingsGoalStore } from "../src/store/savingsGoalStore";
import { useCurrencyFormatter } from "../src/store/settingsStore";

export default function GoalsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { goals, loadGoals, saveGoal, deleteGoal } = useSavingsGoalStore();
  const { formatMoney } = useCurrencyFormatter();
  const [visible, setVisible] = useState(false);
  const [contributionGoal, setContributionGoal] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [contribution, setContribution] = useState("");

  useFocusEffect(useCallback(() => { loadGoals(); }, [loadGoals]));

  const createGoal = async () => {
    const targetAmount = Number(target);
    if (!name.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0) return;
    const now = new Date().toISOString();
    await saveGoal({ id: `${Date.now()}`, name: name.trim(), targetAmount, savedAmount: 0, createdAt: now, updatedAt: now });
    setVisible(false); setName(""); setTarget("");
  };

  const addContribution = async () => {
    const amount = Number(contribution);
    const goal = goals.find((item) => item.id === contributionGoal);
    if (!goal || !Number.isFinite(amount) || amount <= 0) return;
    await saveGoal({ ...goal, savedAmount: goal.savedAmount + amount, updatedAt: new Date().toISOString() });
    setContributionGoal(null); setContribution("");
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><IconButton icon="arrow-left" onPress={() => router.back()} /><Text variant="headlineMedium" style={styles.title}>Savings Goals</Text></View>
        <Text variant="bodyMedium" style={styles.subtitle}>Track what you are saving for.</Text>
        {goals.map((goal) => {
          const progress = goal.savedAmount / goal.targetAmount;
          return <Card key={goal.id} style={styles.card}><Card.Content>
            <View style={styles.row}><View style={styles.grow}><Text variant="titleMedium">{goal.name}</Text><Text variant="bodySmall" style={styles.muted}>{formatMoney(goal.savedAmount)} of {formatMoney(goal.targetAmount)}</Text></View><IconButton icon="delete-outline" iconColor={theme.colors.error} onPress={() => deleteGoal(goal.id)} /></View>
            <ProgressBar progress={Math.min(progress, 1)} style={styles.progress} />
            <View style={styles.row}><Text variant="bodySmall" style={styles.muted}>{Math.min(Math.round(progress * 100), 100)}% complete</Text><Button compact onPress={() => setContributionGoal(goal.id)}>Add money</Button></View>
          </Card.Content></Card>;
        })}
        {goals.length === 0 ? <Card style={styles.card}><Card.Content><Text variant="titleMedium">No savings goals yet</Text><Text style={styles.muted}>Create a goal for travel, an emergency fund, or a major purchase.</Text></Card.Content></Card> : null}
        <Button mode="contained" icon="plus" onPress={() => setVisible(true)} contentStyle={styles.buttonContent}>Add Savings Goal</Button>
      </ScrollView>
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}><Text variant="headlineSmall" style={styles.modalTitle}>New savings goal</Text><TextInput mode="outlined" label="Goal name" value={name} onChangeText={setName} /><TextInput mode="outlined" label="Target amount" keyboardType="decimal-pad" value={target} onChangeText={setTarget} style={styles.field} /><Button mode="contained" onPress={createGoal} disabled={!name.trim() || Number(target) <= 0} style={styles.saveButton}>Create Goal</Button></Modal>
        <Modal visible={Boolean(contributionGoal)} onDismiss={() => setContributionGoal(null)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}><Text variant="headlineSmall" style={styles.modalTitle}>Add contribution</Text><TextInput mode="outlined" label="Amount" keyboardType="decimal-pad" value={contribution} onChangeText={setContribution} /><Button mode="contained" onPress={addContribution} disabled={Number(contribution) <= 0} style={styles.saveButton}>Add Money</Button></Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, content: { padding: 16, paddingBottom: 40 }, header: { flexDirection: "row", alignItems: "center", marginLeft: -12 }, title: { fontWeight: "700" }, subtitle: { color: "#64748B", marginTop: 8, marginBottom: 20 }, card: { borderRadius: 16, marginBottom: 12 }, row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, grow: { flex: 1 }, muted: { color: "#64748B", marginTop: 4 }, progress: { height: 8, borderRadius: 4, marginVertical: 14 }, buttonContent: { minHeight: 48 }, modal: { width: "92%", maxWidth: 480, alignSelf: "center", borderRadius: 24, padding: 20 }, modalTitle: { fontWeight: "700", marginBottom: 20 }, field: { marginTop: 16 }, saveButton: { marginTop: 20 } });
