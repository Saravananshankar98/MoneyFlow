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

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) {
      return;
    }

    try {
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
      <AccountList
        accounts={accounts}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
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

  accountName: {
    fontWeight: "700",
  },

  warning: {
    marginTop: 12,
    color: "#D32F2F",
  },
});
