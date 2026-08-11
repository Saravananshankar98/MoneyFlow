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
  Divider,
  Icon,
  Text,
  useTheme,
} from "react-native-paper";

import { useFocusEffect } from "expo-router";

import { useAccountStore } from "../../src/store/accountStore";
import { useTransactionStore } from "../../src/store/transactionStore";

import ExpenseModal from "../../src/features/transactions/components/ExpenseModal";
import IncomeModal from "../../src/features/transactions/components/IncomeModal";
import TransferModal from "../../src/features/transactions/components/TransferModal";

export default function DashboardScreen() {
  const theme = useTheme();

  const {
    accounts,
    loadAccounts,
  } = useAccountStore();

  const {
    transactions,
    loadTransactions,
  } = useTransactionStore();

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    expenseVisible,
    setExpenseVisible,
  ] = useState(false);
const [
  transferVisible,
  setTransferVisible,
] = useState(false);

  const [
    incomeVisible,
    setIncomeVisible,
  ] = useState(false);

  // ========================================
  // LOAD DATA
  // ========================================

  const loadData =
    useCallback(async () => {
      await Promise.all([
        loadAccounts(),
        loadTransactions(),
      ]);
    }, [
      loadAccounts,
      loadTransactions,
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
  // TOTAL BALANCE
  // ========================================

  const totalBalance =
    useMemo(() => {
      return accounts.reduce(
        (total, account) =>
          total + account.balance,
        0
      );
    }, [accounts]);

  // ========================================
  // CURRENT MONTH
  // ========================================

  const currentMonthTransactions =
    useMemo(() => {
      const now =
        new Date();

      return transactions.filter(
        (transaction) => {
          const date =
            new Date(
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
  // INCOME
  // ========================================

  const monthlyIncome =
    useMemo(() => {
      return currentMonthTransactions
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
    }, [
      currentMonthTransactions,
    ]);

  // ========================================
  // EXPENSE
  // ========================================

  const monthlyExpense =
    useMemo(() => {
      return currentMonthTransactions
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
    }, [
      currentMonthTransactions,
    ]);

  // ========================================
  // SAVINGS
  // ========================================

  const monthlySavings =
    monthlyIncome -
    monthlyExpense;

  // ========================================
  // RECENT TRANSACTIONS
  // ========================================

  const recentTransactions =
    useMemo(() => {
      return [...transactions]
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        )
        .slice(0, 5);
    }, [transactions]);

  // ========================================
  // ACCOUNT NAME
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
  // DATE
  // ========================================

  const formatDate = (
    dateString: string
  ) => {
    const date =
      new Date(dateString);

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // ========================================
  // CURRENT MONTH NAME
  // ========================================

  const monthName =
    new Date().toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  // ========================================
  // UI
  // ========================================

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
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
          style={styles.header}
        >
          <View>
            <Text
              variant="headlineMedium"
              style={styles.title}
            >
              MoneyFlow
            </Text>

            <Text
              variant="bodyMedium"
              style={
                styles.subtitle
              }
            >
              {monthName}
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Icon
              source="wallet"
              size={28}
              color="#2563EB"
            />
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
                styles.balanceAmount
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
              Across{" "}
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
                  styles.summaryIconRow
                }
              >
                <View
                  style={
                    styles.incomeIcon
                  }
                >
                  <Icon
                    source="arrow-down"
                    size={18}
                    color="#16A34A"
                  />
                </View>

                <Text
                  variant="bodyMedium"
                  style={
                    styles.label
                  }
                >
                  Income
                </Text>
              </View>

              <Text
                variant="titleLarge"
                style={
                  styles.income
                }
              >
                +{formatMoney(
                  monthlyIncome
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
                  styles.summaryIconRow
                }
              >
                <View
                  style={
                    styles.expenseIcon
                  }
                >
                  <Icon
                    source="arrow-up"
                    size={18}
                    color="#D32F2F"
                  />
                </View>

                <Text
                  variant="bodyMedium"
                  style={
                    styles.label
                  }
                >
                  Expense
                </Text>
              </View>

              <Text
                variant="titleLarge"
                style={
                  styles.expense
                }
              >
                -{formatMoney(
                  monthlyExpense
                )}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* ================================= */}
        {/* SAVINGS */}
        {/* ================================= */}

        <Card
          style={
            styles.savingsCard
          }
        >
          <Card.Content>
            <View
              style={
                styles.savingsHeader
              }
            >
              <View>
                <Text
                  variant="bodyMedium"
                  style={
                    styles.label
                  }
                >
                  Monthly Savings
                </Text>

                <Text
                  variant="headlineSmall"
                  style={
                    monthlySavings >=
                    0
                      ? styles.income
                      : styles.expense
                  }
                >
                  {monthlySavings >=
                  0
                    ? "+"
                    : "-"}
                  {formatMoney(
                    Math.abs(
                      monthlySavings
                    )
                  )}
                </Text>
              </View>

              <Icon
                source="piggy-bank-outline"
                size={34}
                color="#2563EB"
              />
            </View>

            {monthlyIncome >
              0 && (
              <View
                style={
                  styles.savingsProgress
                }
              >
                <View
                  style={
                    styles.progressHeader
                  }
                >
                  <Text
                    variant="bodySmall"
                    style={
                      styles.label
                    }
                  >
                    Savings rate
                  </Text>

                  <Text
                    variant="bodySmall"
                    style={
                      styles.bold
                    }
                  >
                    {Math.round(
                      (monthlySavings /
                        monthlyIncome) *
                        100
                    )}
                    %
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* ================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================= */}

        <Text
          variant="titleMedium"
          style={
            styles.sectionTitle
          }
        >
          Quick Actions
        </Text>

        <View
          style={
            styles.actionRow
          }
        >
          <Button
            mode="contained"
            icon="arrow-up"
            style={
              styles.actionButton
            }
            buttonColor="#D32F2F"
            onPress={() =>
              setExpenseVisible(
                true
              )
            }
          >
            Add Expense
          </Button>

          <Button
            mode="contained"
            icon="arrow-down"
            style={
              styles.actionButton
            }
            buttonColor="#16A34A"
            onPress={() =>
              setIncomeVisible(
                true
              )
            }
          >
            Add Income
          </Button>

          <Button
            mode="contained"
            icon="swap-horizontal"
            style={
              styles.actionButton
            }
            buttonColor="#2563EB"
            onPress={() =>
              setTransferVisible(true)
            }
          >
            Transfer
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
              styles.sectionTitleNoMargin
            }
          >
            Accounts
          </Text>

          <Text
            variant="bodySmall"
            style={
              styles.secondaryText
            }
          >
            {accounts.length}
          </Text>
        </View>

        <Card
          style={styles.card}
        >
          <Card.Content
            style={
              styles.accountContent
            }
          >
            {accounts.length ===
            0 ? (
              <View
                style={
                  styles.emptySmall
                }
              >
                <Icon
                  source="wallet-outline"
                  size={32}
                  color="#999"
                />

                <Text
                  style={
                    styles.secondaryText
                  }
                >
                  No accounts yet
                </Text>
              </View>
            ) : (
              accounts.map(
                (
                  account,
                  index
                ) => (
                  <View
                    key={
                      account.id
                    }
                  >
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
                            styles.accountDot,
                            {
                              backgroundColor:
                                account.color,
                            },
                          ]}
                        />

                        <View>
                          <Text
                            variant="bodyLarge"
                            style={
                              styles.accountName
                            }
                          >
                            {
                              account.name
                            }
                          </Text>

                          <Text
                            variant="bodySmall"
                            style={
                              styles.secondaryText
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
                          styles.bold
                        }
                      >
                        {formatMoney(
                          account.balance
                        )}
                      </Text>
                    </View>

                    {index <
                      accounts.length -
                        1 && (
                      <Divider
                        style={
                          styles.divider
                        }
                      />
                    )}
                  </View>
                )
              )
            )}
          </Card.Content>
        </Card>

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
              styles.sectionTitleNoMargin
            }
          >
            Recent Transactions
          </Text>

          <Text
            variant="bodySmall"
            style={
              styles.secondaryText
            }
          >
            Latest 5
          </Text>
        </View>

        <Card
          style={styles.card}
        >
          <Card.Content
            style={
              styles.transactionContent
            }
          >
            {recentTransactions.length ===
            0 ? (
              <View
                style={
                  styles.emptySmall
                }
              >
                <Icon
                  source="receipt-text-outline"
                  size={32}
                  color="#999"
                />

                <Text
                  style={
                    styles.secondaryText
                  }
                >
                  No transactions yet
                </Text>
              </View>
            ) : (
              recentTransactions.map(
                (
                  transaction,
                  index
                ) => {
                  const isExpense =
                    transaction.type ===
                    "expense";

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
                              size={18}
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
                              variant="bodyLarge"
                              style={
                                styles.bold
                              }
                              numberOfLines={
                                1
                              }
                            >
                              {
                                transaction.details
                              }
                            </Text>

                            <Text
                              variant="bodySmall"
                              style={
                                styles.secondaryText
                              }
                            >
                              {getAccountName(
                                transaction.accountId
                              )}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.transactionRight
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

                          <Text
                            variant="bodySmall"
                            style={
                              styles.secondaryText
                            }
                          >
                            {formatDate(
                              transaction.date
                            )}
                          </Text>
                        </View>
                      </View>

                      {index <
                        recentTransactions.length -
                          1 && (
                        <Divider
                          style={
                            styles.divider
                          }
                        />
                      )}
                    </View>
                  );
                }
              )
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* ================================= */}
      {/* EXPENSE MODAL */}
      {/* ================================= */}

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

      {/* ================================= */}
      {/* INCOME MODAL */}
      {/* ================================= */}

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

      <TransferModal
        visible={transferVisible}
        transaction={null}
        onDismiss={() =>
          setTransferVisible(false)
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
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 18,
    },

    title: {
      fontWeight: "700",
    },

    subtitle: {
      color: "#777",
      marginTop: 3,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    balanceCard: {
      borderRadius: 18,
      marginBottom: 12,
    },

    balanceLabel: {
      color: "#777",
    },

    balanceAmount: {
      fontWeight: "700",
      marginTop: 5,
    },

    accountCount: {
      color: "#999",
      marginTop: 5,
    },

    summaryRow: {
      flexDirection: "row",
      gap: 12,
    },

    summaryCard: {
      flex: 1,
      borderRadius: 14,
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

    summaryIconRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    incomeIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        "#DCFCE7",
      alignItems: "center",
      justifyContent:
        "center",
    },

    expenseIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        "#FEE2E2",
      alignItems: "center",
      justifyContent:
        "center",
    },

    label: {
      color: "#777",
    },

    income: {
      color: "#16A34A",
      fontWeight: "700",
      marginTop: 6,
    },

    expense: {
      color: "#D32F2F",
      fontWeight: "700",
      marginTop: 6,
    },

    savingsCard: {
      borderRadius: 14,
      marginTop: 12,
      marginBottom: 22,
    },

    savingsHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    savingsProgress: {
      marginTop: 12,
    },

    progressHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    bold: {
      fontWeight: "700",
    },

    sectionTitle: {
      fontWeight: "600",
      marginBottom: 10,
    },

    sectionTitleNoMargin: {
      fontWeight: "600",
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 10,
    },

    actionRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 22,
    },

    actionButton: {
      flex: 1,
      borderRadius: 10,
    },

    card: {
      borderRadius: 14,
      marginBottom: 22,
    },

    accountContent: {
      paddingVertical: 4,
    },

    accountRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },

    accountLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    accountDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 10,
    },

    accountName: {
      fontWeight: "600",
    },

    secondaryText: {
      color: "#777",
    },

    divider: {
      marginVertical: 4,
    },

    transactionContent: {
      paddingVertical: 4,
    },

    transactionRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },

    transactionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    transactionInfo: {
      flex: 1,
      minWidth: 0,
    },

    transactionRight: {
      alignItems: "flex-end",
      marginLeft: 10,
    },

    emptySmall: {
      alignItems: "center",
      paddingVertical: 22,
      gap: 8,
    },
  });
