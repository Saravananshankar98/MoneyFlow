import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  IconButton,
  Searchbar,
  Text,
} from "react-native-paper";

import {
  useFocusEffect,
} from "expo-router";

import {
  useTransactionStore,
} from "../../src/store/transactionStore";

import {
  useAccountStore,
} from "../../src/store/accountStore";

import {
  useCategoryStore,
} from "../../src/store/categoryStore";

import ExpenseModal from "../../src/features/transactions/components/ExpenseModal";

import IncomeModal from "../../src/features/transactions/components/IncomeModal";

import { Transaction } from "../../src/features/transactions/types/transaction";

type FilterType =
  | "all"
  | "income"
  | "expense";

type GroupedTransactions = {
  title: string;
  data: Transaction[];
};

export default function TransactionsScreen() {
  const {
    transactions,
    loadTransactions,
    deleteTransaction,
  } =
    useTransactionStore();

  const {
    accounts,
    loadAccounts,
  } =
    useAccountStore();

  const {
    categories,
    loadCategories,
  } =
    useCategoryStore();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<FilterType>("all");

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    expenseVisible,
    setExpenseVisible,
  ] = useState(false);

  const [
    incomeVisible,
    setIncomeVisible,
  ] = useState(false);

  const [
    selectedTransaction,
    setSelectedTransaction,
  ] =
    useState<Transaction | null>(
      null
    );

  // ========================================
  // LOAD DATA
  // ========================================

  const loadData =
    useCallback(async () => {
      await Promise.all([
        loadTransactions(),
        loadAccounts(),
        loadCategories(),
      ]);
    }, [
      loadTransactions,
      loadAccounts,
      loadCategories,
    ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ========================================
  // REFRESH
  // ========================================

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadData();

      setRefreshing(false);
    };

  // ========================================
  // FORMAT MONEY
  // ========================================

  const formatMoney = (
    amount: number
  ) => {
    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  // ========================================
  // GET ACCOUNT
  // ========================================

  const getAccountName = (
    accountId: string
  ) => {
    return (
      accounts.find(
        (account) =>
          account.id === accountId
      )?.name ??
      "Unknown account"
    );
  };

  // ========================================
  // GET CATEGORY
  // ========================================

  const getCategoryName = (
    categoryId?: string
  ) => {
    if (!categoryId) {
      return "Other";
    }

    return (
      categories.find(
        (category) =>
          category.id ===
          categoryId
      )?.name ??
      categoryId ??
      "Other"
    );
  };

  // ========================================
  // FILTER
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
            if (
              filter !==
                "all" &&
              transaction.type !==
                filter
            ) {
              return false;
            }

            if (!query) {
              return true;
            }

            const accountName =
              getAccountName(
                transaction.accountId
              );

            const categoryName =
              getCategoryName(
                transaction.category
              );

            return (
              transaction.details
                ?.toLowerCase()
                .includes(query) ||
              transaction.notes
                ?.toLowerCase()
                .includes(query) ||
              accountName
                .toLowerCase()
                .includes(query) ||
              categoryName
                .toLowerCase()
                .includes(query) ||
              transaction.paymentType
                ?.toLowerCase()
                .includes(query)
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
      filter,
      search,
      accounts,
      categories,
    ]);

  // ========================================
  // DATE HELPERS
  // ========================================

  const isSameDay = (
    first: Date,
    second: Date
  ) => {
    return (
      first.getFullYear() ===
        second.getFullYear() &&
      first.getMonth() ===
        second.getMonth() &&
      first.getDate() ===
        second.getDate()
    );
  };

  const getDateGroup = (
    dateString: string
  ) => {
    const date =
      new Date(dateString);

    const today =
      new Date();

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      isSameDay(
        date,
        today
      )
    ) {
      return "Today";
    }

    if (
      isSameDay(
        date,
        yesterday
      )
    ) {
      return "Yesterday";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ========================================
  // GROUP TRANSACTIONS
  // ========================================

  const groupedTransactions =
    useMemo(() => {
      const groups =
        new Map<
          string,
          Transaction[]
        >();

      filteredTransactions.forEach(
        (transaction) => {
          const group =
            getDateGroup(
              transaction.date
            );

          const existing =
            groups.get(group);

          if (existing) {
            existing.push(
              transaction
            );
          } else {
            groups.set(
              group,
              [transaction]
            );
          }
        }
      );

      return Array.from(
        groups.entries()
      ).map(
        ([
          title,
          data,
        ]) => ({
          title,
          data,
        })
      );
    }, [
      filteredTransactions,
    ]);

  // ========================================
  // TOTALS
  // ========================================

  const totalIncome =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "income"
      )
      .reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0
      );

  const totalExpense =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0
      );

  // ========================================
  // DELETE
  // ========================================

  const handleDelete =
    async (
      transaction: Transaction
    ) => {
      await deleteTransaction(
        transaction.id
      );

      await loadData();
    };

  // ========================================
  // EDIT
  // ========================================

  const handleEdit =
    (
      transaction: Transaction
    ) => {
      setSelectedTransaction(
        transaction
      );

      if (
        transaction.type ===
        "expense"
      ) {
        setExpenseVisible(
          true
        );
      } else {
        setIncomeVisible(
          true
        );
      }
    };

  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeExpense =
    () => {
      setExpenseVisible(
        false
      );

      setSelectedTransaction(
        null
      );

      loadData();
    };

  const closeIncome =
    () => {
      setIncomeVisible(
        false
      );

      setSelectedTransaction(
        null
      );

      loadData();
    };

  // ========================================
  // TRANSACTION ITEM
  // ========================================

  const renderTransaction =
    (
      transaction: Transaction
    ) => {
      const isExpense =
        transaction.type ===
        "expense";

      const accountName =
        getAccountName(
          transaction.accountId
        );

      const categoryName =
        getCategoryName(
          transaction.category
        );

      const transactionDate =
        new Date(
          transaction.date
        );

      return (
        <View
          key={transaction.id}
        >
          <View
            style={
              styles.transactionRow
            }
          >
            {/* LEFT */}
            <View
              style={
                styles.leftSection
              }
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      isExpense
                        ? "#FEE2E2"
                        : "#DCFCE7",
                  },
                ]}
              >
                <Icon
                  source={
                    isExpense
                      ? "arrow-up"
                      : "arrow-down"
                  }
                  size={21}
                  color={
                    isExpense
                      ? "#D32F2F"
                      : "#16A34A"
                  }
                />
              </View>

              <View
                style={
                  styles.transactionInfo
                }
              >
                <Text
                  variant="titleSmall"
                  style={
                    styles.transactionTitle
                  }
                  numberOfLines={1}
                >
                  {transaction.details ||
                    "Transaction"}
                </Text>

                <Text
                  variant="bodySmall"
                  style={
                    styles.secondaryText
                  }
                  numberOfLines={1}
                >
                  {accountName}
                  {" • "}
                  {categoryName}
                </Text>

                <Text
                  variant="bodySmall"
                  style={
                    styles.dateText
                  }
                >
                  {transactionDate.toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                  {" • "}
                  {
                    transaction.paymentType
                  }
                </Text>
              </View>
            </View>

            {/* RIGHT */}
            <View
              style={
                styles.rightSection
              }
            >
              <Text
                variant="titleSmall"
                style={
                  isExpense
                    ? styles.expense
                    : styles.income
                }
              >
                {isExpense
                  ? "-"
                  : "+"}
                {formatMoney(
                  transaction.amount
                )}
              </Text>

              <View
                style={
                  styles.actions
                }
              >
                <IconButton
                  icon="pencil-outline"
                  size={18}
                  onPress={() =>
                    handleEdit(
                      transaction
                    )
                  }
                />

                <IconButton
                  icon="delete-outline"
                  size={18}
                  iconColor="#D32F2F"
                  onPress={() =>
                    handleDelete(
                      transaction
                    )
                  }
                />
              </View>
            </View>
          </View>

          <Divider />
        </View>
      );
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
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <View
          style={
            styles.header
          }
        >
          <View>
            <Text
              variant="headlineMedium"
              style={
                styles.title
              }
            >
              Transactions
            </Text>

            <Text
              variant="bodySmall"
              style={
                styles.subtitle
              }
            >
              {
                filteredTransactions.length
              }{" "}
              transactions
            </Text>
          </View>
        </View>

        {/* ================================= */}
        {/* SEARCH */}
        {/* ================================= */}

        <Searchbar
          placeholder="Search transactions"
          value={search}
          onChangeText={
            setSearch
          }
          style={
            styles.searchbar
          }
        />

        {/* ================================= */}
        {/* FILTER */}
        {/* ================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterContainer
          }
        >
          <Chip
            selected={
              filter === "all"
            }
            onPress={() =>
              setFilter("all")
            }
            style={
              styles.chip
            }
          >
            All
          </Chip>

          <Chip
            selected={
              filter === "income"
            }
            onPress={() =>
              setFilter("income")
            }
            style={
              styles.chip
            }
            icon="arrow-down"
          >
            Income
          </Chip>

          <Chip
            selected={
              filter === "expense"
            }
            onPress={() =>
              setFilter("expense")
            }
            style={
              styles.chip
            }
            icon="arrow-up"
          >
            Expense
          </Chip>
        </ScrollView>

        {/* ================================= */}
        {/* SUMMARY */}
        {/* ================================= */}

        <Card
          style={
            styles.summaryCard
          }
        >
          <Card.Content>
            <View
              style={
                styles.summaryRow
              }
            >
              <View>
                <Text
                  variant="bodySmall"
                  style={
                    styles.secondaryText
                  }
                >
                  Income
                </Text>

                <Text
                  variant="titleMedium"
                  style={
                    styles.income
                  }
                >
                  +{formatMoney(
                    totalIncome
                  )}
                </Text>
              </View>

              <View>
                <Text
                  variant="bodySmall"
                  style={
                    styles.secondaryText
                  }
                >
                  Expense
                </Text>

                <Text
                  variant="titleMedium"
                  style={
                    styles.expense
                  }
                >
                  -{formatMoney(
                    totalExpense
                  )}
                </Text>
              </View>

              <View>
                <Text
                  variant="bodySmall"
                  style={
                    styles.secondaryText
                  }
                >
                  Count
                </Text>

                <Text
                  variant="titleMedium"
                  style={
                    styles.bold
                  }
                >
                  {
                    filteredTransactions.length
                  }
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* ================================= */}
        {/* EMPTY */}
        {/* ================================= */}

        {groupedTransactions.length ===
        0 ? (
          <Card
            style={
              styles.emptyCard
            }
          >
            <Card.Content
              style={
                styles.emptyContent
              }
            >
              <Icon
                source="receipt-text-outline"
                size={52}
                color="#999"
              />

              <Text
                variant="titleMedium"
                style={
                  styles.emptyTitle
                }
              >
                No transactions
              </Text>

              <Text
                variant="bodyMedium"
                style={
                  styles.emptyText
                }
              >
                {search
                  ? "No transactions match your search."
                  : "Your transactions will appear here."}
              </Text>

              {search && (
                <Button
                  mode="outlined"
                  onPress={() =>
                    setSearch("")
                  }
                  style={
                    styles.clearButton
                  }
                >
                  Clear Search
                </Button>
              )}
            </Card.Content>
          </Card>
        ) : (
          /* ================================= */
          /* GROUPS */
          /* ================================= */

          groupedTransactions.map(
            (group) => (
              <View
                key={
                  group.title
                }
                style={
                  styles.group
                }
              >
                <Text
                  variant="titleSmall"
                  style={
                    styles.groupTitle
                  }
                >
                  {
                    group.title
                  }
                </Text>

                <Card
                  style={
                    styles.transactionCard
                  }
                >
                  <Card.Content
                    style={
                      styles.transactionContent
                    }
                  >
                    {group.data.map(
                      (
                        transaction
                      ) =>
                        renderTransaction(
                          transaction
                        )
                    )}
                  </Card.Content>
                </Card>
              </View>
            )
          )
        )}
      </ScrollView>

      {/* ================================== */}
      {/* EXPENSE MODAL */}
      {/* ================================== */}

      <ExpenseModal
        visible={
          expenseVisible
        }
        transaction={
          selectedTransaction
        }
        onDismiss={
          closeExpense
        }
      />

      {/* ================================== */}
      {/* INCOME MODAL */}
      {/* ================================== */}

      <IncomeModal
        visible={
          incomeVisible
        }
        transaction={
          selectedTransaction
        }
        onDismiss={
          closeIncome
        }
      />
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
      paddingBottom: 40,
    },

    header: {
      marginBottom: 16,
    },

    title: {
      fontWeight: "700",
    },

    subtitle: {
      color: "#777",
      marginTop: 3,
    },

    searchbar: {
      borderRadius: 12,
      marginBottom: 12,
    },

    filterContainer: {
      gap: 8,
      paddingBottom: 14,
    },

    chip: {
      borderRadius: 20,
    },

    summaryCard: {
      borderRadius: 14,
      marginBottom: 22,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    group: {
      marginBottom: 18,
    },

    groupTitle: {
      fontWeight: "700",
      color: "#555",
      marginBottom: 8,
    },

    transactionCard: {
      borderRadius: 14,
      overflow: "hidden",
    },

    transactionContent: {
      paddingVertical: 0,
      paddingHorizontal: 14,
    },

    transactionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      minHeight: 78,
      paddingVertical: 10,
    },

    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    iconContainer: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent:
        "center",
    },

    transactionInfo: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
    },

    transactionTitle: {
      fontWeight: "600",
    },

    secondaryText: {
      color: "#777",
      marginTop: 2,
    },

    dateText: {
      color: "#999",
      marginTop: 2,
    },

    rightSection: {
      alignItems: "flex-end",
    },

    actions: {
      flexDirection: "row",
      marginRight: -8,
      marginTop: -4,
    },

    income: {
      color: "#16A34A",
      fontWeight: "700",
    },

    expense: {
      color: "#D32F2F",
      fontWeight: "700",
    },

    bold: {
      fontWeight: "700",
    },

    emptyCard: {
      borderRadius: 16,
      marginTop: 10,
    },

    emptyContent: {
      alignItems: "center",
      paddingVertical: 40,
    },

    emptyTitle: {
      fontWeight: "600",
      marginTop: 12,
    },

    emptyText: {
      color: "#777",
      textAlign: "center",
      marginTop: 6,
    },

    clearButton: {
      marginTop: 16,
    },
  });
