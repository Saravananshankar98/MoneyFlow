import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  Divider,
  Icon,
  Text,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";

import { useAccountStore } from "../../src/store/accountStore";
import { useTransactionStore } from "../../src/store/transactionStore";

import ExpenseModal from "../../src/features/transactions/components/ExpenseModal";
import IncomeModal from "../../src/features/transactions/components/IncomeModal";

export default function Dashboard() {
  const {
    accounts,
    loadAccounts,
  } = useAccountStore();

  const {
    transactions,
    loadTransactions,
  } = useTransactionStore();

  const [
    expenseVisible,
    setExpenseVisible,
  ] = useState(false);

  const [
    incomeVisible,
    setIncomeVisible,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  // ========================================
  // LOAD
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
  // REFRESH
  // ========================================

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await Promise.all([
        loadAccounts(),
        loadTransactions(),
      ]);

      setRefreshing(false);
    };

  // ========================================
  // TOTAL BALANCE
  // ========================================

  const totalBalance =
    accounts.reduce(
      (total, account) =>
        total + account.balance,
      0
    );

  // ========================================
  // TOTAL INCOME
  // ========================================

  const totalIncome =
    transactions
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

  // ========================================
  // TOTAL EXPENSE
  // ========================================

  const totalExpense =
    transactions
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
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <View
          style={styles.header}
        >
          <View>
            <Text
              variant="bodyMedium"
              style={
                styles.subtitle
              }
            >
              Good day 👋
            </Text>

            <Text
              variant="headlineMedium"
              style={
                styles.title
              }
            >
              MoneyFlow
            </Text>
          </View>
        </View>

        {/* ================================= */}
        {/* TOTAL BALANCE */}
        {/* ================================= */}

        <Card
          style={
            styles.balanceCard
          }
        >
          <Card.Content>
            <Text
              variant="bodyMedium"
              style={
                styles.balanceLabel
              }
            >
              Total Balance
            </Text>

            <Text
              variant="displaySmall"
              style={
                styles.balance
              }
            >
              {formatMoney(
                totalBalance
              )}
            </Text>

            <Text
              variant="bodySmall"
              style={
                styles.accountCount
              }
            >
              {accounts.length}{" "}
              {accounts.length ===
              1
                ? "account"
                : "accounts"}
            </Text>
          </Card.Content>
        </Card>

        {/* ================================= */}
        {/* INCOME / EXPENSE */}
        {/* ================================= */}

        <View
          style={
            styles.summaryRow
          }
        >
          <Card
            style={[
              styles.summaryCard,
              styles.incomeCard,
            ]}
          >
            <Card.Content>
              <View
                style={
                  styles.summaryHeader
                }
              >
                <Icon
                  source="arrow-down"
                  size={22}
                  color="#16A34A"
                />

                <Text
                  variant="bodyMedium"
                  style={
                    styles.summaryLabel
                  }
                >
                  Income
                </Text>
              </View>

              <Text
                variant="titleLarge"
                style={
                  styles.incomeText
                }
              >
                +{formatMoney(
                  totalIncome
                )}
              </Text>
            </Card.Content>
          </Card>

          <Card
            style={[
              styles.summaryCard,
              styles.expenseCard,
            ]}
          >
            <Card.Content>
              <View
                style={
                  styles.summaryHeader
                }
              >
                <Icon
                  source="arrow-up"
                  size={22}
                  color="#D32F2F"
                />

                <Text
                  variant="bodyMedium"
                  style={
                    styles.summaryLabel
                  }
                >
                  Expense
                </Text>
              </View>

              <Text
                variant="titleLarge"
                style={
                  styles.expenseText
                }
              >
                -{formatMoney(
                  totalExpense
                )}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* ================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================= */}

        <Text
          variant="titleMedium"
          style={
            styles.sectionTitle
          }
        >
          Quick Add
        </Text>

        <View
          style={
            styles.actionRow
          }
        >
          <Button
            mode="contained"
            icon="arrow-up"
            buttonColor="#D32F2F"
            style={
              styles.actionButton
            }
            onPress={() =>
              setExpenseVisible(
                true
              )
            }
          >
            Expense
          </Button>

          <Button
            mode="contained"
            icon="arrow-down"
            buttonColor="#16A34A"
            style={
              styles.actionButton
            }
            onPress={() =>
              setIncomeVisible(
                true
              )
            }
          >
            Income
          </Button>
        </View>

        {/* ================================= */}
        {/* ACCOUNTS */}
        {/* ================================= */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            variant="titleMedium"
            style={
              styles.sectionTitle
            }
          >
            My Accounts
          </Text>

          <Text
            variant="bodySmall"
            style={
              styles.viewAll
            }
          >
            {accounts.length} total
          </Text>
        </View>

        {accounts.length ===
        0 ? (
          <Card
            style={
              styles.emptyCard
            }
          >
            <Card.Content>
              <Text
                variant="bodyMedium"
                style={
                  styles.emptyText
                }
              >
                No accounts added
                yet.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          accounts.map(
            (account) => (
              <Card
                key={account.id}
                style={
                  styles.accountCard
                }
              >
                <Card.Content>
                  <View
                    style={
                      styles.accountRow
                    }
                  >
                    <View
                      style={
                        styles.accountLeft
                      }
                    >
                      <View
                        style={[
                          styles.accountIcon,
                          {
                            backgroundColor:
                              account.color,
                          },
                        ]}
                      >
                        <Icon
                          source="wallet"
                          size={22}
                          color="white"
                        />
                      </View>

                      <View>
                        <Text
                          variant="titleMedium"
                        >
                          {
                            account.name
                          }
                        </Text>

                        <Text
                          variant="bodySmall"
                          style={
                            styles.accountType
                          }
                        >
                          {
                            account.type
                          }
                        </Text>
                      </View>
                    </View>

                    <Text
                      variant="titleMedium"
                      style={
                        styles.accountBalance
                      }
                    >
                      {formatMoney(
                        account.balance
                      )}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )
          )
        )}

        {/* ================================= */}
        {/* RECENT TRANSACTIONS */}
        {/* ================================= */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            variant="titleMedium"
            style={
              styles.sectionTitle
            }
          >
            Recent Transactions
          </Text>

          <Text
            variant="bodySmall"
            style={
              styles.viewAll
            }
          >
            {transactions.length}{" "}
            total
          </Text>
        </View>

        {transactions.length ===
        0 ? (
          <Card
            style={
              styles.emptyCard
            }
          >
            <Card.Content>
              <Text
                style={
                  styles.emptyText
                }
              >
                No transactions yet.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          transactions
            .slice()
            .sort(
              (a, b) =>
                new Date(
                  b.date
                ).getTime() -
                new Date(
                  a.date
                ).getTime()
            )
            .slice(0, 5)
            .map(
              (transaction) => {
                const isExpense =
                  transaction.type ===
                  "expense";

                const account =
                  accounts.find(
                    (item) =>
                      item.id ===
                      transaction.accountId
                  );

                return (
                  <View
                    key={
                      transaction.id
                    }
                  >
                    <View
                      style={
                        styles.transactionRow
                      }
                    >
                      <View
                        style={
                          styles.transactionLeft
                        }
                      >
                        <View
                          style={[
                            styles.transactionIcon,
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
                            size={20}
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
                          >
                            {
                              transaction.details
                            }
                          </Text>

                          <Text
                            variant="bodySmall"
                            style={
                              styles.secondary
                            }
                          >
                            {account?.name ??
                              "Unknown account"}
                          </Text>
                        </View>
                      </View>

                      <Text
                        variant="titleSmall"
                        style={
                          isExpense
                            ? styles.expenseText
                            : styles.incomeText
                        }
                      >
                        {isExpense
                          ? "-"
                          : "+"}
                        {formatMoney(
                          transaction.amount
                        )}
                      </Text>
                    </View>

                    <Divider />
                  </View>
                );
              }
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
        onDismiss={() =>
          setExpenseVisible(
            false
          )
        }
      />

      {/* ================================== */}
      {/* INCOME MODAL */}
      {/* ================================== */}

      <IncomeModal
        visible={
          incomeVisible
        }
        onDismiss={() =>
          setIncomeVisible(
            false
          )
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
      marginBottom: 20,
    },

    subtitle: {
      color: "#777",
    },

    title: {
      fontWeight: "700",
      marginTop: 2,
    },

    balanceCard: {
      borderRadius: 20,
      marginBottom: 14,
    },

    balanceLabel: {
      color: "#777",
    },

    balance: {
      fontWeight: "700",
      marginTop: 4,
    },

    accountCount: {
      color: "#777",
      marginTop: 4,
    },

    summaryRow: {
      flexDirection: "row",
      gap: 12,
    },

    summaryCard: {
      flex: 1,
      borderRadius: 16,
    },

    incomeCard: {
      borderLeftWidth: 4,
      borderLeftColor:
        "#16A34A",
    },

    expenseCard: {
      borderLeftWidth: 4,
      borderLeftColor:
        "#D32F2F",
    },

    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    summaryLabel: {
      color: "#777",
    },

    incomeText: {
      color: "#16A34A",
      fontWeight: "700",
      marginTop: 6,
    },

    expenseText: {
      color: "#D32F2F",
      fontWeight: "700",
      marginTop: 6,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 24,
      marginBottom: 10,
    },

    sectionTitle: {
      fontWeight: "600",
    },

    viewAll: {
      color: "#777",
    },

    actionRow: {
      flexDirection: "row",
      gap: 12,
    },

    actionButton: {
      flex: 1,
      borderRadius: 10,
    },

    accountCard: {
      borderRadius: 14,
      marginBottom: 10,
    },

    accountRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    accountLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    accountIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent:
        "center",
    },

    accountType: {
      color: "#777",
      marginTop: 2,
    },

    accountBalance: {
      fontWeight: "700",
    },

    emptyCard: {
      borderRadius: 14,
    },

    emptyText: {
      color: "#777",
      textAlign: "center",
      paddingVertical: 10,
    },

    transactionRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },

    transactionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    transactionIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent:
        "center",
    },

    transactionInfo: {
      marginLeft: 10,
      flex: 1,
    },

    secondary: {
      color: "#777",
      marginTop: 2,
    },
  });