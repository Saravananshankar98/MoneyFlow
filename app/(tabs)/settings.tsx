import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  exportBackup,
  importBackup,
} from "../../src/services/backupService";
import {
  resetAllData,
} from "../../src/services/resetService";
import {
  Button,
  Card,
  Divider,
  List,
  Portal,
  Dialog,
  Text,
} from "react-native-paper";

import { useAccountStore } from "../../src/store/accountStore";
import { useTransactionStore } from "../../src/store/transactionStore";
import { useCategoryStore } from "../../src/store/categoryStore";

export default function SettingsScreen() {
  const {
    accounts,
    loadAccounts,
  } = useAccountStore();

  const {
    transactions,
    loadTransactions,
  } = useTransactionStore();

  const {
    categories,
    loadCategories,
  } = useCategoryStore();

  const [
    resetDialogVisible,
    setResetDialogVisible,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ========================================
  // DATA SUMMARY
  // ========================================

  const accountCount =
    accounts.length;

  const transactionCount =
    transactions.length;

  const categoryCount =
    categories.length;

  // ========================================
  // RELOAD
  // ========================================

  const reloadData =
    async () => {
      await Promise.all([
        loadAccounts(),
        loadTransactions(),
        loadCategories(),
      ]);
    };

  // ========================================
  // RESET DATA
  // ========================================

  const handleResetData =
  async () => {
    try {
      setLoading(true);

      await resetAllData();

      await reloadData();

      setResetDialogVisible(
        false
      );

      Alert.alert(
        "Data Reset",
        "All MoneyFlow data has been deleted."
      );
    } catch (error) {
      console.error(
        "Reset data failed:",
        error
      );

      Alert.alert(
        "Reset Failed",
        "Unable to delete your data."
      );
    } finally {
      setLoading(false);
    }
  };


    const handleExportBackup =
  async () => {
    try {
      setLoading(true);

      await exportBackup();

      Alert.alert(
        "Backup Ready",
        "Your MoneyFlow backup has been created."
      );
    } catch (error) {
      console.error(
        "Export backup failed:",
        error
      );

      Alert.alert(
        "Backup Failed",
        "Unable to create the backup."
      );
    } finally {
      setLoading(false);
    }
  };

const handleImportBackup =
  async () => {
    try {
      setLoading(true);

      const result =
        await importBackup();

      if (result.canceled) {
        return;
      }

      await reloadData();

      Alert.alert(
        "Restore Complete",
        "Your MoneyFlow data has been restored successfully."
      );
    } catch (error) {
      console.error(
        "Import backup failed:",
        error
      );

      Alert.alert(
        "Restore Failed",
        error instanceof Error
          ? error.message
          : "Unable to restore backup."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <Text
          variant="headlineMedium"
          style={styles.title}
        >
          Settings
        </Text>

        <Text
          variant="bodyMedium"
          style={styles.subtitle}
        >
          Manage your MoneyFlow
          app.
        </Text>

        {/* ================================= */}
        {/* DATA */}
        {/* ================================= */}

        <Text
          variant="titleMedium"
          style={styles.sectionTitle}
        >
          Your Data
        </Text>

        <Card
          style={styles.card}
        >
          <List.Item
            title="Accounts"
            description={`${accountCount} ${
              accountCount ===
              1
                ? "account"
                : "accounts"
            }`}
            left={(props) => (
              <List.Icon
                {...props}
                icon="wallet"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Transactions"
            description={`${transactionCount} ${
              transactionCount ===
              1
                ? "transaction"
                : "transactions"
            }`}
            left={(props) => (
              <List.Icon
                {...props}
                icon="swap-horizontal"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Categories"
            description={`${categoryCount} ${
              categoryCount ===
              1
                ? "category"
                : "categories"
            }`}
            left={(props) => (
              <List.Icon
                {...props}
                icon="shape"
              />
            )}
          />
        </Card>

        {/* ================================= */}
        {/* DATA MANAGEMENT */}
        {/* ================================= */}

        <Text
          variant="titleMedium"
          style={styles.sectionTitle}
        >
          Data Management
        </Text>

        <Card
          style={styles.card}
        >
          <List.Item
            title="Export Backup"
            description="Create a JSON backup of your MoneyFlow data"
            left={(props) => (
                <List.Icon
                {...props}
                icon="export"
                />
            )}
            onPress={
                handleExportBackup
            }
            />

            <Divider />

            <List.Item
            title="Import Backup"
            description="Restore MoneyFlow from a backup file"
            left={(props) => (
                <List.Icon
                {...props}
                icon="import"
                />
            )}
            onPress={
                handleImportBackup
            }
            />

          <Divider />

          <List.Item
            title="Reset Data"
            description="Delete all accounts and transactions"
            titleStyle={
              styles.dangerText
            }
            descriptionStyle={
              styles.dangerDescription
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon="delete-outline"
                color="#D32F2F"
              />
            )}
            onPress={() =>
              setResetDialogVisible(
                true
              )
            }
          />
        </Card>

        {/* ================================= */}
        {/* APP */}
        {/* ================================= */}

        <Text
          variant="titleMedium"
          style={styles.sectionTitle}
        >
          App
        </Text>

        <Card
          style={styles.card}
        >
          <List.Item
            title="Currency"
            description="Indian Rupee (₹)"
            left={(props) => (
              <List.Icon
                {...props}
                icon="currency-inr"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Theme"
            description="System default"
            left={(props) => (
              <List.Icon
                {...props}
                icon="theme-light-dark"
              />
            )}
            onPress={() =>
              Alert.alert(
                "Theme",
                "Theme selection will be added later."
              )
            }
          />
        </Card>

        {/* ================================= */}
        {/* ABOUT */}
        {/* ================================= */}

        <Text
          variant="titleMedium"
          style={styles.sectionTitle}
        >
          About
        </Text>

        <Card
          style={styles.card}
        >
          <List.Item
            title="MoneyFlow"
            description="Personal Finance Tracker"
            left={(props) => (
              <List.Icon
                {...props}
                icon="cash-multiple"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => (
              <List.Icon
                {...props}
                icon="information-outline"
              />
            )}
          />
        </Card>

        {/* ================================= */}
        {/* REFRESH */}
        {/* ================================= */}

        <View
          style={
            styles.refreshContainer
          }
        >
          <Button
            mode="outlined"
            icon="refresh"
            loading={loading}
            onPress={reloadData}
          >
            Refresh Data
          </Button>
        </View>

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <Text
          variant="bodySmall"
          style={styles.footer}
        >
          MoneyFlow
        </Text>

        <Text
          variant="bodySmall"
          style={styles.footerSub}
        >
          Your money. Your control.
        </Text>
      </ScrollView>

      {/* ================================== */}
      {/* RESET DIALOG */}
      {/* ================================== */}

      <Portal>
        <Dialog
          visible={
            resetDialogVisible
          }
          onDismiss={() =>
            setResetDialogVisible(
              false
            )
          }
        >
          <Dialog.Title>
            Reset all data?
          </Dialog.Title>

          <Dialog.Content>
            <Text>
                This will permanently delete:
            </Text>

            <Text style={styles.resetItem}>
                • All accounts
            </Text>

            <Text style={styles.resetItem}>
                • All transactions
            </Text>

            <Text style={styles.resetItem}>
                • All categories
            </Text>

            <Text style={styles.warning}>
                This action cannot be undone.
            </Text>
            </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() =>
                setResetDialogVisible(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              textColor="#D32F2F"
               loading={loading}
                disabled={loading}
                onPress={
                    handleResetData
                }
            >
               Delete Everything
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

// ========================================
// STYLES
// ========================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      padding: 16,
      paddingBottom: 50,
    },

    title: {
      fontWeight: "700",
    },

    subtitle: {
      color: "#777",
      marginTop: 4,
      marginBottom: 22,
    },

    sectionTitle: {
      fontWeight: "600",
      marginBottom: 10,
      marginTop: 8,
    },

    card: {
      borderRadius: 14,
      marginBottom: 20,
      overflow: "hidden",
    },

    dangerText: {
      color: "#D32F2F",
    },

    dangerDescription: {
      color: "#D32F2F",
    },

    refreshContainer: {
      marginTop: 4,
      marginBottom: 20,
    },

    warning: {
      color: "#D32F2F",
      marginTop: 12,
      fontWeight: "600",
    },

    footer: {
      textAlign: "center",
      color: "#777",
      marginTop: 10,
    },

    footerSub: {
      textAlign: "center",
      color: "#999",
      marginTop: 4,
    },

    resetItem: {
      marginTop: 6,
    },
  });
