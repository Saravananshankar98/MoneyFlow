import { useState } from "react";
import { Portal, FAB } from "react-native-paper";

import AccountModal from "../../../features/accounts/components/AccountModal";
import CategoryModal from "../../../features/categories/components/CategoryModal";
import ExpenseModal from "../../../features/transactions/components/ExpenseModal";
import IncomeModal from "../../../features/transactions/components/IncomeModal";
import TransferModal from "../../../features/transactions/components/TransferModal";
import { useAccountStore } from "../../../store/accountStore";
import { useNotificationStore } from "../../../store/notificationStore";

export default function AppFAB() {
  const [open, setOpen] = useState(false);
  const [expenseVisible, setExpenseVisible] = useState(false);
  const [incomeVisible, setIncomeVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const { showNotification } = useNotificationStore();

  const showForm = (show: () => void) => {
    setOpen(false);
    show();
  };

  const showTransactionForm = async (show: () => void) => {
    setOpen(false);

    await useAccountStore.getState().loadAccounts();

    if (useAccountStore.getState().accounts.length === 0) {
      showNotification(
        "Create an account before recording a transaction.",
        "info"
      );
      setAccountVisible(true);
      return;
    }

    show();
  };

  return (
    <>
      <Portal>
        <FAB.Group
          open={open}
          visible
          icon={open ? "close" : "plus"}
          accessibilityLabel="Quick add"
          style={{ bottom: 72 }}
          actions={[
            {
              icon: "arrow-up-bold",
              label: "Add expense",
              onPress: () => showTransactionForm(() => setExpenseVisible(true)),
            },
            {
              icon: "arrow-down-bold",
              label: "Add income",
              onPress: () => showTransactionForm(() => setIncomeVisible(true)),
            },
            {
              icon: "swap-horizontal",
              label: "Transfer money",
              onPress: () => showTransactionForm(() => setTransferVisible(true)),
            },
            {
              icon: "wallet-plus-outline",
              label: "Add account",
              onPress: () => showForm(() => setAccountVisible(true)),
            },
            {
              icon: "tag-plus-outline",
              label: "Add category",
              onPress: () => showForm(() => setCategoryVisible(true)),
            },
          ]}
          onStateChange={({ open: nextOpen }) => setOpen(nextOpen)}
        />
      </Portal>

      <ExpenseModal visible={expenseVisible} onDismiss={() => setExpenseVisible(false)} />
      <IncomeModal visible={incomeVisible} onDismiss={() => setIncomeVisible(false)} />
      <TransferModal visible={transferVisible} onDismiss={() => setTransferVisible(false)} />
      <AccountModal visible={accountVisible} onDismiss={() => setAccountVisible(false)} />
      <CategoryModal visible={categoryVisible} onDismiss={() => setCategoryVisible(false)} />
    </>
  );
}
