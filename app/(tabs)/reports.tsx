import { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Card,
  Divider,
  Text,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";

import { useAccountStore } from "../../src/store/accountStore";
import { useTransactionStore } from "../../src/store/transactionStore";

export default function ReportsScreen() {
  const {
    accounts,
    loadAccounts,
  } = useAccountStore();

  const {
    transactions,
    loadTransactions,
  } = useTransactionStore();

  const [refreshing, setRefreshing] =
    useState(false);

  // ========================================
  // LOAD DATA
  // ========================================

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      loadTransactions();
    }, [
      loadAccounts,
      loadTransactions,
    ])
  );

  // ========================================
  // CURRENT MONTH
  // ========================================

  const monthTransactions =
    useMemo(() => {
      const now = new Date();

      return transactions.filter(
        (transaction) => {
          const date = new Date(
            transaction.date
          );

          return (
            date.getMonth() ===
              now.getMonth() &&
            date.getFullYear() ===
              now.getFullYear()
          );
        }
      );
    }, [transactions]);

  // ========================================
  // MONTH NAME
  // ========================================

  const currentMonthName =
    useMemo(() => {
      return new Date().toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric",
        }
      );
    }, []);

  // ========================================
  // INCOME
  // ========================================

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "income"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }, [monthTransactions]);

  // ========================================
  // EXPENSE
  // ========================================

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter(
        (transaction) =>
          transaction.type ===
          "expense"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }, [monthTransactions]);

  // ========================================
  // SAVINGS
  // ========================================

  const savings =
    totalIncome - totalExpense;

  // ========================================
  // TOTAL BALANCE
  // ========================================

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (total, account) =>
        total + account.balance,
      0
    );
  }, [accounts]);

  // ========================================
  // CATEGORY EXPENSES
  // ========================================

  const categoryExpenses =
    useMemo(() => {
      const map: Record<
        string,
        number
      > = {};

      monthTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .forEach((transaction) => {
          const category =
            transaction.category?.trim() ||
            "Other";

          map[category] =
            (map[category] ?? 0) +
            transaction.amount;
        });

      return Object.entries(map)
        .map(
          ([
            category,
            amount,
          ]) => ({
            category,
            amount,
          })
        )
        .sort(
          (a, b) =>
            b.amount - a.amount
        );
    }, [monthTransactions]);

  // ========================================
  // ACCOUNT EXPENSES
  // ========================================

  const accountExpenses =
    useMemo(() => {
      const map: Record<
        string,
        number
      > = {};

      monthTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .forEach((transaction) => {
          map[transaction.accountId] =
            (map[
              transaction.accountId
            ] ?? 0) +
            transaction.amount;
        });

      return Object.entries(map)
        .map(
          ([
            accountId,
            amount,
          ]) => {
            const account =
              accounts.find(
                (item) =>
                  item.id ===
                  accountId
              );

            return {
              accountId,
              name:
                account?.name ??
                "Unknown account",
              amount,
            };
          }
        )
        .sort(
          (a, b) =>
            b.amount - a.amount
        );
    }, [
      monthTransactions,
      accounts,
    ]);

  // ========================================
  // MAX CATEGORY
  // ========================================

  const maxCategoryExpense =
    categoryExpenses.length
      ? categoryExpenses[0].amount
      : 0;

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
  // REFRESH
  // ========================================

  const handleRefresh =
    async () => {
      setRefreshing(true);

      try {
        await Promise.all([
          loadAccounts(),
          loadTransactions(),
        ]);
      } finally {
        setRefreshing(false);
      }
    };

  // ========================================
  // UI
  // ========================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={
            handleRefresh
          }
        />
      }
    >
      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <Text
        variant="headlineMedium"
        style={styles.title}
      >
        Reports
      </Text>

      <Text
        variant="bodyMedium"
        style={styles.month}
      >
        {currentMonthName}
      </Text>

      {/* ================================== */}
      {/* TOTAL BALANCE */}
      {/* ================================== */}

      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text
            variant="bodyMedium"
            style={styles.label}
          >
            Total Balance
          </Text>

          <Text
            variant="displaySmall"
            style={styles.balance}
          >
            {formatMoney(
              totalBalance
            )}
          </Text>
        </Card.Content>
      </Card>

      {/* ================================== */}
      {/* SUMMARY */}
      {/* ================================== */}

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.label}>
              Income
            </Text>

            <Text
              variant="titleLarge"
              style={styles.income}
            >
              +{formatMoney(
                totalIncome
              )}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.label}>
              Expense
            </Text>

            <Text
              variant="titleLarge"
              style={styles.expense}
            >
              -{formatMoney(
                totalExpense
              )}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* ================================== */}
      {/* SAVINGS */}
      {/* ================================== */}

      <Card style={styles.savingsCard}>
        <Card.Content>
          <Text style={styles.label}>
            Monthly Savings
          </Text>

          <Text
            variant="headlineSmall"
            style={
              savings >= 0
                ? styles.income
                : styles.expense
            }
          >
            {formatMoney(savings)}
          </Text>

          <Text
            variant="bodySmall"
            style={styles.secondary}
          >
            Income minus expenses
          </Text>
        </Card.Content>
      </Card>

      {/* ================================== */}
      {/* CATEGORY */}
      {/* ================================== */}

      <Text
        variant="titleLarge"
        style={styles.sectionTitle}
      >
        Expense by Category
      </Text>

      {categoryExpenses.length ===
      0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              No expenses this month.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.listCard}>
          {categoryExpenses.map(
            (item, index) => {
              const percentage =
                maxCategoryExpense >
                0
                  ? (item.amount /
                      maxCategoryExpense) *
                    100
                  : 0;

              return (
                <View
                  key={
                    item.category
                  }
                >
                  <View
                    style={
                      styles.itemRow
                    }
                  >
                    <View
                      style={
                        styles.itemInfo
                      }
                    >
                      <Text variant="titleMedium">
                        {
                          item.category
                        }
                      </Text>

                      <View
                        style={
                          styles.progressBackground
                        }
                      >
                        <View
                          style={[
                            styles.progress,
                            {
                              width: `${percentage}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <Text
                      variant="titleMedium"
                      style={
                        styles.expense
                      }
                    >
                      {formatMoney(
                        item.amount
                      )}
                    </Text>
                  </View>

                  {index <
                    categoryExpenses.length -
                      1 && (
                    <Divider />
                  )}
                </View>
              );
            }
          )}
        </Card>
      )}

      {/* ================================== */}
      {/* ACCOUNT */}
      {/* ================================== */}

      <Text
        variant="titleLarge"
        style={styles.sectionTitle}
      >
        Expense by Account
      </Text>

      {accountExpenses.length ===
      0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              No account expenses
              this month.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.listCard}>
          {accountExpenses.map(
            (item, index) => (
              <View key={item.accountId}>
                <View
                  style={
                    styles.itemRow
                  }
                >
                  <Text variant="titleMedium">
                    {item.name}
                  </Text>

                  <Text
                    variant="titleMedium"
                    style={
                      styles.expense
                    }
                  >
                    {formatMoney(
                      item.amount
                    )}
                  </Text>
                </View>

                {index <
                  accountExpenses.length -
                    1 && (
                  <Divider />
                )}
              </View>
            )
          )}
        </Card>
      )}

      {/* ================================== */}
      {/* MONTH TRANSACTION COUNT */}
      {/* ================================== */}

      <Card style={styles.countCard}>
        <Card.Content>
          <Text style={styles.label}>
            Transactions this month
          </Text>

          <Text
            variant="headlineSmall"
            style={styles.count}
          >
            {monthTransactions.length}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontWeight: "700",
  },

  month: {
    color: "#777",
    marginTop: 4,
    marginBottom: 20,
  },

  balanceCard: {
    borderRadius: 18,
    marginBottom: 12,
  },

  balance: {
    fontWeight: "700",
    marginTop: 8,
  },

  label: {
    color: "#777",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 16,
  },

  income: {
    color: "#2E7D32",
    fontWeight: "700",
    marginTop: 6,
  },

  expense: {
    color: "#D32F2F",
    fontWeight: "700",
    marginTop: 6,
  },

  savingsCard: {
    marginTop: 12,
    borderRadius: 16,
  },

  secondary: {
    color: "#777",
    marginTop: 4,
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontWeight: "600",
  },

  listCard: {
    borderRadius: 16,
    overflow: "hidden",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  itemInfo: {
    flex: 1,
    marginRight: 16,
  },

  progressBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },

  progress: {
    height: 6,
    backgroundColor: "#2563EB",
    borderRadius: 3,
  },

  emptyCard: {
    borderRadius: 16,
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
  },

  countCard: {
    marginTop: 24,
    borderRadius: 16,
  },

  count: {
    fontWeight: "700",
    marginTop: 6,
  },
});