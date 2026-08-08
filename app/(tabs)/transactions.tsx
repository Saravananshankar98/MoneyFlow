import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  Menu,
  Portal,
  Text,
} from "react-native-paper";

import { useFocusEffect } from "expo-router";

import { useAccountStore } from "../../src/store/accountStore";

import { useCategoryStore } from "../../src/store/categoryStore";

import {
  useTransactionStore,
} from "../../src/store/transactionStore";

import ExpenseModal from "../../src/features/transactions/components/ExpenseModal";

import type {
  Transaction,
} from "../../src/features/transactions/types/transaction";

import TransactionFilters, {
  TransactionFilterType,
} from "../../src/features/transactions/components/TransactionFilters";

export default function TransactionsScreen() {
  // ========================================
  // STORES
  // ========================================

  const {
    transactions,
    loading,
    loadTransactions,
    deleteTransaction,
  } = useTransactionStore();

  const {
    accounts,
    loadAccounts,
  } = useAccountStore();

  const {
    categories,
    loadCategories,
  } = useCategoryStore();

  // ========================================
  // MENU STATE
  // ========================================

  const [
    menuTransactionId,
    setMenuTransactionId,
  ] = useState<string | null>(null);

  // ========================================
  // DELETE STATE
  // ========================================

  const [
    deleteDialogVisible,
    setDeleteDialogVisible,
  ] = useState(false);

  const [
    transactionToDelete,
    setTransactionToDelete,
  ] = useState<Transaction | null>(
    null
  );

  // ========================================
  // EDIT STATE
  // ========================================

  const [
    editTransaction,
    setEditTransaction,
  ] = useState<Transaction | null>(
    null
  );

  const [
    editModalVisible,
    setEditModalVisible,
  ] = useState(false);

  // ========================================
  // FILTER STATE
  // ========================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filterType,
    setFilterType,
  ] =
    useState<TransactionFilterType>(
      "all"
    );

  const [
    filterAccountId,
    setFilterAccountId,
  ] = useState("");

  const [
    filterCategory,
    setFilterCategory,
  ] = useState("");

  // ========================================
  // ACCOUNT OPTIONS
  // ========================================

  const accountOptions = useMemo(
    () => {
      return accounts.map(
        (account) => ({
          label: account.name,
          value: account.id,
        })
      );
    },
    [accounts]
  );

  // ========================================
  // CATEGORY OPTIONS
  // ========================================

  const categoryOptions = useMemo(
    () => {
      return categories
        .filter(
          (category) =>
            category.type ===
              "expense" ||
            category.type ===
              "both"
        )
        .sort((a, b) =>
          a.name.localeCompare(
            b.name
          )
        )
        .map((category) => ({
          label: category.name,
          value: category.id,
        }));
    },
    [categories]
  );

  // ========================================
  // LOAD DATA
  // ========================================

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadAccounts();
      loadCategories();
    }, [
      loadTransactions,
      loadAccounts,
      loadCategories,
    ])
  );

  // ========================================
  // ACCOUNT NAME
  // ========================================

  const getAccountName = (
    accountId: string
  ) => {
    const account =
      accounts.find(
        (item) =>
          item.id === accountId
      );

    return (
      account?.name ??
      "Unknown account"
    );
  };

  // ========================================
  // CATEGORY NAME
  // ========================================

  const getCategoryName = (
    categoryId?: string
  ) => {
    if (!categoryId) {
      return "No category";
    }

    const category =
      categories.find(
        (item) =>
          item.id === categoryId
      );

    return (
      category?.name ??
      "No category"
    );
  };

  // ========================================
  // FORMAT AMOUNT
  // ========================================

  const formatAmount = (
    amount: number
  ) => {
    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ========================================
  // DELETE REQUEST
  // ========================================

  const handleDeleteRequest = (
    transaction: Transaction
  ) => {
    setMenuTransactionId(
      null
    );

    setTransactionToDelete(
      transaction
    );

    setDeleteDialogVisible(
      true
    );
  };

  // ========================================
  // DELETE CONFIRM
  // ========================================

  const handleDeleteConfirm =
    async () => {
      if (
        !transactionToDelete
      ) {
        return;
      }

      const result =
        await deleteTransaction(
          transactionToDelete.id
        );

      if (!result.success) {
        console.error(
          "Delete failed:",
          result.error
        );

        return;
      }

      setDeleteDialogVisible(
        false
      );

      setTransactionToDelete(
        null
      );

      await loadTransactions();
      await loadAccounts();
    };

  // ========================================
  // EDIT TRANSACTION
  // ========================================

  const handleEdit = (
    transaction: Transaction
  ) => {
    setMenuTransactionId(
      null
    );

    setEditTransaction(
      transaction
    );

    setEditModalVisible(
      true
    );
  };

  // ========================================
  // CLOSE EDIT MODAL
  // ========================================

  const handleEditDismiss =
    async () => {
      setEditModalVisible(
        false
      );

      setEditTransaction(
        null
      );

      await loadTransactions();
      await loadAccounts();
    };

  // ========================================
  // FILTER TRANSACTIONS
  // ========================================

  const filteredTransactions =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return transactions
        .filter(
          (transaction) => {
            // ==============================
            // TYPE
            // ==============================

            const matchesType =
              filterType ===
                "all" ||
              transaction.type ===
                filterType;

            if (!matchesType) {
              return false;
            }

            // ==============================
            // ACCOUNT
            // ==============================

            const matchesAccount =
              !filterAccountId ||
              transaction.accountId ===
                filterAccountId;

            if (!matchesAccount) {
              return false;
            }

            // ==============================
            // CATEGORY
            // ==============================

            const matchesCategory =
              !filterCategory ||
              transaction.category ===
                filterCategory;

            if (!matchesCategory) {
              return false;
            }

            // ==============================
            // SEARCH
            // ==============================

            if (!query) {
              return true;
            }

            const categoryName =
              getCategoryName(
                transaction.category
              );

            const accountName =
              getAccountName(
                transaction.accountId
              );

            const searchableText =
              [
                transaction.details,
                transaction.category,
                categoryName,
                transaction.paymentType,
                transaction.notes,
                accountName,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
              query
            );
          }
        )
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        );
    }, [
      transactions,
      search,
      filterType,
      filterAccountId,
      filterCategory,
      accounts,
      categories,
    ]);

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const handleClearFilters =
    () => {
      setSearch("");
      setFilterType("all");
      setFilterAccountId("");
      setFilterCategory("");
    };

  // ========================================
  // REFRESH
  // ========================================

  const handleRefresh =
    useCallback(
      async () => {
        await Promise.all([
          loadTransactions(),
          loadAccounts(),
          loadCategories(),
        ]);
      },
      [
        loadTransactions,
        loadAccounts,
        loadCategories,
      ]
    );

  // ========================================
  // RENDER TRANSACTION
  // ========================================

  const renderTransaction = ({
    item,
  }: {
    item: Transaction;
  }) => {
    const isExpense =
      item.type ===
      "expense";

    const isMenuOpen =
      menuTransactionId ===
      item.id;

    const accountName =
      getAccountName(
        item.accountId
      );

    const categoryName =
      getCategoryName(
        item.category
      );

    return (
      <Card
        style={styles.card}
      >
        <Card.Content>
          <View
            style={styles.row}
          >
            {/* ================================= */}
            {/* LEFT SIDE */}
            {/* ================================= */}

            <View
              style={
                styles.details
              }
            >
              <Text
                variant="titleMedium"
                style={
                  styles.transactionTitle
                }
              >
                {item.details ||
                  "Transaction"}
              </Text>

              {/* CATEGORY */}

              <Text
                variant="bodyMedium"
                style={
                  styles.secondary
                }
              >
                🏷️ {categoryName}
              </Text>

              {/* ACCOUNT */}

              <Text
                variant="bodyMedium"
                style={
                  styles.secondary
                }
              >
                🏦 {accountName}
              </Text>

              {/* PAYMENT + DATE */}

              <Text
                variant="bodySmall"
                style={
                  styles.secondary
                }
              >
                {item.paymentType ||
                  "Payment"}{" "}
                •{" "}
                {formatDate(
                  item.date
                )}
              </Text>

              {/* NOTES */}

              {!!item.notes && (
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                  style={
                    styles.notes
                  }
                >
                  {item.notes}
                </Text>
              )}
            </View>

            {/* ================================= */}
            {/* RIGHT SIDE */}
            {/* ================================= */}

            <View
              style={
                styles.rightSection
              }
            >
              {/* AMOUNT */}

              <Text
                variant="titleMedium"
                style={[
                  styles.amount,
                  isExpense
                    ? styles.expense
                    : styles.income,
                ]}
              >
                {isExpense
                  ? "-"
                  : "+"}
                {formatAmount(
                  item.amount
                )}
              </Text>

              {/* MENU */}

              <Menu
                visible={
                  isMenuOpen
                }
                onDismiss={() =>
                  setMenuTransactionId(
                    null
                  )
                }
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() =>
                      setMenuTransactionId(
                        item.id
                      )
                    }
                  />
                }
              >
                {/* EDIT */}

                <Menu.Item
                  leadingIcon="pencil"
                  title="Edit"
                  onPress={() =>
                    handleEdit(
                      item
                    )
                  }
                />

                {/* DELETE */}

                <Menu.Item
                  leadingIcon="delete"
                  title="Delete"
                  onPress={() =>
                    handleDeleteRequest(
                      item
                    )
                  }
                />
              </Menu>
            </View>
          </View>
        </Card.Content>

        <Divider />
      </Card>
    );
  };

  // ========================================
  // EMPTY STATE
  // ========================================

  const isEmpty =
    filteredTransactions.length ===
    0;

  // ========================================
  // UI
  // ========================================

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ================================== */}
      {/* TITLE */}
      {/* ================================== */}

      <Text
        variant="headlineSmall"
        style={styles.title}
      >
        Transactions
      </Text>

      {/* ================================== */}
      {/* FILTERS */}
      {/* ================================== */}

      <TransactionFilters
        search={search}
        type={filterType}
        accountId={
          filterAccountId
        }
        category={
          filterCategory
        }
        accountOptions={
          accountOptions
        }
        categoryOptions={
          categoryOptions
        }
        onSearchChange={
          setSearch
        }
        onTypeChange={
          setFilterType
        }
        onAccountChange={
          setFilterAccountId
        }
        onCategoryChange={
          setFilterCategory
        }
        onClear={
          handleClearFilters
        }
      />

      {/* ================================== */}
      {/* TRANSACTION LIST */}
      {/* ================================== */}

      <FlatList
        data={
          filteredTransactions
        }
        keyExtractor={(item) =>
          item.id
        }
        renderItem={
          renderTransaction
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={
              handleRefresh
            }
          />
        }
        contentContainerStyle={
          isEmpty
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyState
            }
          >
            <Text
              variant="titleLarge"
              style={
                styles.emptyTitle
              }
            >
              {transactions.length ===
              0
                ? "No transactions yet"
                : "No matching transactions"}
            </Text>

            <Text
              variant="bodyMedium"
              style={
                styles.emptyText
              }
            >
              {transactions.length ===
              0
                ? "Your income and expenses will appear here."
                : "Try changing your search or filters."}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={
          false
        }
      />

      {/* ================================== */}
      {/* DELETE DIALOG */}
      {/* ================================== */}

      <Portal>
        <Dialog
          visible={
            deleteDialogVisible
          }
          onDismiss={() => {
            setDeleteDialogVisible(
              false
            );

            setTransactionToDelete(
              null
            );
          }}
        >
          <Dialog.Title>
            Delete Transaction?
          </Dialog.Title>

          <Dialog.Content>
            <Text>
              Are you sure you want
              to delete this
              transaction?
            </Text>

            {transactionToDelete && (
              <View
                style={
                  styles.deleteInfo
                }
              >
                <Text
                  variant="titleMedium"
                  style={
                    styles.bold
                  }
                >
                  {
                    transactionToDelete.details
                  }
                </Text>

                <Text
                  variant="bodyMedium"
                >
                  {formatAmount(
                    transactionToDelete.amount
                  )}
                </Text>

                <Text
                  variant="bodySmall"
                  style={
                    styles.warning
                  }
                >
                  The account balance
                  will also be
                  updated.
                </Text>
              </View>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => {
                setDeleteDialogVisible(
                  false
                );

                setTransactionToDelete(
                  null
                );
              }}
            >
              Cancel
            </Button>

            <Button
              textColor="#D32F2F"
              onPress={
                handleDeleteConfirm
              }
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ================================== */}
      {/* EDIT EXPENSE */}
      {/* ================================== */}

      <ExpenseModal
        visible={
          editModalVisible
        }
        transaction={
          editTransaction
        }
        onDismiss={
          handleEditDismiss
        }
      />
    </View>
  );
}

// ========================================
// STYLES
// ========================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },

    title: {
      marginBottom: 16,
      fontWeight: "600",
    },

    list: {
      paddingBottom: 100,
      gap: 10,
    },

    emptyContainer: {
      flexGrow: 1,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    emptyTitle: {
      fontWeight: "600",
      textAlign: "center",
    },

    emptyText: {
      color: "#777",
      textAlign: "center",
      marginTop: 8,
    },

    card: {
      borderRadius: 14,
      overflow: "hidden",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    details: {
      flex: 1,
      marginRight: 12,
    },

    transactionTitle: {
      fontWeight: "600",
    },

    secondary: {
      marginTop: 4,
      color: "#777",
    },

    notes: {
      marginTop: 5,
      color: "#555",
      fontStyle: "italic",
    },

    rightSection: {
      alignItems: "flex-end",
    },

    amount: {
      fontWeight: "700",
    },

    expense: {
      color: "#D32F2F",
    },

    income: {
      color: "#2E7D32",
    },

    deleteInfo: {
      marginTop: 14,
      gap: 4,
    },

    bold: {
      fontWeight: "700",
    },

    warning: {
      color: "#D32F2F",
      marginTop: 8,
    },
  });