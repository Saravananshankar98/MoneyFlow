import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

import { useAccountStore } from "../../../store";
import { useNotificationStore } from "../../../store/notificationStore";
import { useTransactionStore } from "../../../store/transactionStore";
import { Account } from "../types/account";

import AccountList from "../components/AccountList";
import AccountModal from "../components/AccountModal";

export default function AccountsScreen() {
  const theme = useTheme();

  const {
    accounts,
    loadAccounts,
    deleteAccount,
  } = useAccountStore();

  const {
    showNotification,
  } = useNotificationStore();

  const [modalVisible, setModalVisible] =
    useState(false);

  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [deleteDialogVisible, setDeleteDialogVisible] =
    useState(false);

  const [accountToDelete, setAccountToDelete] =
    useState<Account | null>(null);

  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleAdd = () => {
    setSelectedAccount(null);
    setModalVisible(true);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const handleDeleteRequest = (account: Account) => {
    setAccountToDelete(account);
    setDeleteDialogVisible(true);
  };

  const handleArchive = async (account: Account) => {
    await useAccountStore.getState().updateAccount({
      ...account,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    showNotification("Account archived. Your transaction history is unchanged.", "success");
  };

  const handleRestore = async (account: Account) => {
    await useAccountStore.getState().updateAccount({
      ...account,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    showNotification("Account restored.", "success");
  };

  const displayedAccounts = accounts.filter((account) => Boolean(account.isArchived) === showArchived);

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) {
      return;
    }

    try {
      await useTransactionStore
        .getState()
        .loadTransactions();

      const hasRelatedTransactions =
        useTransactionStore
          .getState()
          .transactions.some(
            (transaction) =>
              transaction.accountId ===
                accountToDelete.id ||
              transaction.toAccountId ===
                accountToDelete.id
          );

      if (hasRelatedTransactions) {
        setDeleteDialogVisible(false);
        setAccountToDelete(null);

        showNotification(
          "This account is used by transactions. Remove or move those transactions first.",
          "error"
        );

        return;
      }

      await deleteAccount(accountToDelete.id);

      setDeleteDialogVisible(false);
      setAccountToDelete(null);

      await loadAccounts();

      showNotification(
        "Account deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error("Account delete failed:", error);
      showNotification(
        "Unable to delete account.",
        "error"
      );
    }
  };

  const handleModalDismiss = () => {
    setModalVisible(false);
    setSelectedAccount(null);
    loadAccounts();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Accounts
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Keep your balances in one place.
        </Text>
        <Button compact mode="text" onPress={() => setShowArchived((current) => !current)}>
          {showArchived ? "Show active" : "Show archived"}
        </Button>
      </View>

      <AccountList
        accounts={displayedAccounts}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      <AccountModal
        visible={modalVisible}
        account={selectedAccount}
        onDismiss={handleModalDismiss}
      />

      <Button
        mode="contained"
        icon="plus"
        onPress={handleAdd}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
      >
        Add Account
      </Button>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() =>
            setDeleteDialogVisible(false)
          }
        >
          <Dialog.Title>
            Delete Account?
          </Dialog.Title>

          <Dialog.Content>
            <Text>
              Are you sure you want to delete{" "}
              <Text style={styles.accountName}>
                {accountToDelete?.name}
              </Text>
              ?
            </Text>

            <Text style={styles.warning}>
              This action cannot be undone.
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => {
                setDeleteDialogVisible(false);
                setAccountToDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button
              textColor="#D32F2F"
              onPress={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  addButton: {
    marginTop: 12,
    borderRadius: 14,
  },

  addButtonContent: {
    minHeight: 48,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748B",
  },

  accountName: {
    fontWeight: "700",
  },

  warning: {
    marginTop: 12,
    color: "#D32F2F",
  },
});
