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
  Card,
  Divider,
  IconButton,
  ProgressBar,
  Text,
  useTheme,
} from "react-native-paper";

import { useFocusEffect } from "expo-router";

import { useAccountStore } from "../../src/store/accountStore";
import { useCategoryStore } from "../../src/store/categoryStore";
import { useTransactionStore } from "../../src/store/transactionStore";
import {
  formatCreditCardDate,
  getAvailableLimit,
  getDaysUntilDue,
  getOutstanding,
  getPaymentDueDate,
} from "../../src/features/accounts/utils/creditCard";

export default function ReportsScreen() {
  const theme = useTheme();

  const {
    transactions,
    loadTransactions,
  } = useTransactionStore();

  const {
    accounts,
    loadAccounts,
  } = useAccountStore();

  const {
    categories,
    loadCategories,
  } = useCategoryStore();

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    new Date()
  );

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  // ========================================
  // LOAD
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
  // MONTH NAVIGATION
  // ========================================

  const changeMonth = (
    amount: number
  ) => {
    setSelectedMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() +
            amount,
          1
        )
    );
  };

  // ========================================
  // MONTH RANGE
  // ========================================

  const monthStart =
    useMemo(() => {
      return new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        1,
        0,
        0,
        0,
        0
      );
    }, [selectedMonth]);

  const monthEnd =
    useMemo(() => {
      return new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() +
          1,
        0,
        23,
        59,
        59,
        999
      );
    }, [selectedMonth]);

  // ========================================
  // MONTH TRANSACTIONS
  // ========================================

  const monthTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const date =
            new Date(
              transaction.date
            );

          return (
            date >= monthStart &&
            date <= monthEnd
          );
        }
      );
    }, [
      transactions,
      monthStart,
      monthEnd,
    ]);

  // ========================================
  // INCOME
  // ========================================

  const monthlyIncome =
    useMemo(() => {
      return monthTransactions
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
    }, [monthTransactions]);

  // ========================================
  // EXPENSE
  // ========================================

  const monthlyExpense =
    useMemo(() => {
      return monthTransactions
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
    }, [monthTransactions]);

  // ========================================
  // SAVINGS
  // ========================================

  const savings =
    monthlyIncome -
    monthlyExpense;

  const savingsRate =
    monthlyIncome > 0
      ? (savings /
          monthlyIncome) *
        100
      : 0;

  // ========================================
  // BALANCE
  // ========================================

  const totalBalance =
    accounts.reduce(
      (total, account) => {
        if (
          account.type ===
          "Credit Card"
        ) {
          return (
            total -
            getOutstanding(
              account
            )
          );
        }

        return (
          total +
          account.balance
        );
      },
      0
    );

  const creditCardReports =
    useMemo(() => {
      return accounts
        .filter(
          (account) =>
            account.type ===
            "Credit Card"
        )
        .map((account) => {
          const cardSpend =
            monthTransactions
              .filter(
                (transaction) =>
                  transaction.type ===
                    "expense" &&
                  transaction.accountId ===
                    account.id
              )
              .reduce(
                (
                  total,
                  transaction
                ) =>
                  total +
                  transaction.amount,
                0
              );

          const cardPayments =
            monthTransactions
              .filter(
                (transaction) =>
                  transaction.type ===
                    "transfer" &&
                  transaction.toAccountId ===
                    account.id
              )
              .reduce(
                (
                  total,
                  transaction
                ) =>
                  total +
                  transaction.amount,
                0
              );

          return {
            ...account,
            outstanding:
              getOutstanding(
                account
              ),
            availableLimit:
              getAvailableLimit(
                account
              ),
            daysUntilDue:
              getDaysUntilDue(
                account
              ),
            dueDate:
              getPaymentDueDate(
                account
              ),
            cardSpend,
            cardPayments,
          };
        });
    }, [
      accounts,
      monthTransactions,
    ]);

  // ========================================
  // CATEGORY EXPENSE
  // ========================================

  const categoryExpenses =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      monthTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .forEach(
          (transaction) => {
            const categoryId =
              transaction.category ??
              "Other";

            const current =
              map.get(
                categoryId
              ) ?? 0;

            map.set(
              categoryId,
              current +
                transaction.amount
            );
          }
        );

      return Array.from(
        map.entries()
      )
        .map(
          ([
            categoryId,
            amount,
          ]) => {
            const category =
              categories.find(
                (item) =>
                  item.id ===
                  categoryId
              );

            return {
              id: categoryId,
              name:
                category?.name ??
                "Other",
              amount,
            };
          }
        )
        .sort(
          (a, b) =>
            b.amount -
            a.amount
        );
    }, [
      monthTransactions,
      categories,
    ]);

  // ========================================
  // ACCOUNT ACTIVITY
  // ========================================

  const accountActivity =
    useMemo(() => {
      return accounts
        .map((account) => {
          const income =
            monthTransactions
              .filter(
                (transaction) =>
                  transaction.type ===
                    "income" &&
                  transaction.accountId ===
                    account.id
              )
              .reduce(
                (
                  total,
                  transaction
                ) =>
                  total +
                  transaction.amount,
                0
              );

          const expense =
            monthTransactions
              .filter(
                (transaction) =>
                  transaction.type ===
                    "expense" &&
                  transaction.accountId ===
                    account.id
              )
              .reduce(
                (
                  total,
                  transaction
                ) =>
                  total +
                  transaction.amount,
                0
              );

          return {
            ...account,
            monthlyIncome:
              income,
            monthlyExpense:
              expense,
            net:
              income -
              expense,
          };
        })
        .filter(
          (account) =>
            account.monthlyIncome >
              0 ||
            account.monthlyExpense >
              0
        );
    }, [
      accounts,
      monthTransactions,
    ]);

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
  // MONTH NAME
  // ========================================

  const monthName =
    selectedMonth.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  // ========================================
  // CURRENT MONTH CHECK
  // ========================================

  const now =
    new Date();

  const isCurrentMonth =
    selectedMonth.getMonth() ===
      now.getMonth() &&
    selectedMonth.getFullYear() ===
      now.getFullYear();

  // ========================================
  // UI
  // ========================================

  return (
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

      <Text
        variant="headlineMedium"
        style={styles.title}
      >
        Reports
      </Text>

      {/* ================================= */}
      {/* MONTH SELECTOR */}
      {/* ================================= */}

      <Card
        style={styles.monthCard}
      >
        <Card.Content>
          <View
            style={
              styles.monthSelector
            }
          >
            <IconButton
              icon="chevron-left"
              onPress={() =>
                changeMonth(-1)
              }
            />

            <View
              style={
                styles.monthCenter
              }
            >
              <Text
                variant="titleLarge"
                style={
                  styles.monthText
                }
              >
                {monthName}
              </Text>

              {isCurrentMonth && (
                <Text
                  variant="bodySmall"
                  style={
                    styles.currentText
                  }
                >
                  Current month
                </Text>
              )}
            </View>

            <IconButton
              icon="chevron-right"
              onPress={() =>
                changeMonth(1)
              }
            />
          </View>
        </Card.Content>
      </Card>

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
            style={styles.label}
          >
            Current Total Balance
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
        </Card.Content>
      </Card>

      {/* ================================= */}
      {/* SUMMARY */}
      {/* ================================= */}

      <Text
        variant="titleMedium"
        style={
          styles.sectionTitle
        }
      >
        Monthly Summary
      </Text>

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
            <Text
              style={styles.label}
            >
              Income
            </Text>

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
            <Text
              style={styles.label}
            >
              Expense
            </Text>

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
          <Text
            style={styles.label}
          >
            Net Savings
          </Text>

          <Text
            variant="headlineSmall"
            style={
              savings >= 0
                ? styles.income
                : styles.expense
            }
          >
            {savings >= 0
              ? "+"
              : "-"}
            {formatMoney(
              Math.abs(savings)
            )}
          </Text>

          <Text
            variant="bodySmall"
            style={styles.label}
          >
            Savings rate{" "}
            {Math.round(
              savingsRate
            )}
            %
          </Text>
        </Card.Content>
      </Card>

      {/* ================================= */}
      {/* CATEGORY */}
      {/* ================================= */}

      <Text
        variant="titleMedium"
        style={
          styles.sectionTitle
        }
      >
        Expense by Category
      </Text>

      <Card
        style={styles.card}
      >
        <Card.Content>
          {categoryExpenses.length ===
          0 ? (
            <Text
              style={
                styles.emptyText
              }
            >
              No expenses for{" "}
              {monthName}.
            </Text>
          ) : (
            categoryExpenses.map(
              (
                category,
                index
              ) => {
                const percentage =
                  monthlyExpense >
                  0
                    ? category.amount /
                      monthlyExpense
                    : 0;

                return (
                  <View
                    key={
                      category.id
                    }
                  >
                    <View
                      style={
                        styles.categoryHeader
                      }
                    >
                      <Text>
                        {
                          category.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.bold
                        }
                      >
                        {formatMoney(
                          category.amount
                        )}
                      </Text>
                    </View>

                    <ProgressBar
                      progress={
                        percentage
                      }
                      style={
                        styles.progress
                      }
                    />

                    <Text
                      variant="bodySmall"
                      style={
                        styles.percentage
                      }
                    >
                      {Math.round(
                        percentage *
                          100
                      )}
                      %
                    </Text>

                    {index <
                      categoryExpenses.length -
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

      {/* ================================= */}
      {/* CREDIT CARDS */}
      {/* ================================= */}

      <Text
        variant="titleMedium"
        style={
          styles.sectionTitle
        }
      >
        Credit Card Report
      </Text>

      <Card
        style={styles.card}
      >
        <Card.Content>
          {creditCardReports.length ===
          0 ? (
            <Text
              style={
                styles.emptyText
              }
            >
              No credit cards added.
            </Text>
          ) : (
            creditCardReports.map(
              (
                account,
                index
              ) => {
                const usedRatio =
                  account.creditLimit
                    ? account.outstanding /
                      account.creditLimit
                    : 0;

                return (
                  <View
                    key={
                      account.id
                    }
                  >
                    <View
                      style={
                        styles.accountHeader
                      }
                    >
                      <Text
                        variant="bodyLarge"
                        style={
                          styles.bold
                        }
                      >
                        {
                          account.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.expense
                        }
                      >
                        {formatMoney(
                          account.outstanding
                        )}
                      </Text>
                    </View>

                    <ProgressBar
                      progress={Math.min(
                        1,
                        usedRatio
                      )}
                      style={
                        styles.progress
                      }
                    />

                    <View
                      style={
                        styles.creditDetails
                      }
                    >
                      <View
                        style={
                          styles.creditMetricRow
                        }
                      >
                        <View
                          style={
                            styles.creditMetric
                          }
                        >
                          <Text
                            variant="bodySmall"
                            style={
                              styles.label
                            }
                          >
                            Limit
                          </Text>

                          <Text
                            style={
                              styles.creditMetricValue
                            }
                          >
                            {formatMoney(
                              account.creditLimit ??
                                0
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.creditMetric
                          }
                        >
                          <Text
                            variant="bodySmall"
                            style={
                              styles.label
                            }
                          >
                            Available
                          </Text>

                          <Text
                            style={
                              styles.creditMetricValue
                            }
                          >
                            {formatMoney(
                              account.availableLimit
                            )}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.creditMetricRow
                        }
                      >
                        <View
                          style={
                            styles.creditMetric
                          }
                        >
                          <Text
                            variant="bodySmall"
                            style={
                              styles.label
                            }
                          >
                            Spend
                          </Text>

                          <Text
                            style={
                              styles.creditMetricValue
                            }
                          >
                            {formatMoney(
                              account.cardSpend
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.creditMetric
                          }
                        >
                          <Text
                            variant="bodySmall"
                            style={
                              styles.label
                            }
                          >
                            Paid
                          </Text>

                          <Text
                            style={
                              styles.creditMetricValue
                            }
                          >
                            {formatMoney(
                              account.cardPayments
                            )}
                          </Text>
                        </View>
                      </View>

                      <Text
                        variant="bodySmall"
                        style={
                          styles.creditDueText
                        }
                      >
                        Due{" "}
                        {account.daysUntilDue < 0
                          ? `${Math.abs(
                              account.daysUntilDue
                            )} days overdue`
                          : account.daysUntilDue ===
                            0
                          ? "today"
                          : `in ${account.daysUntilDue} days`}
                        {" "}on{" "}
                        {formatCreditCardDate(
                          account.dueDate
                        )}
                      </Text>
                    </View>

                    {index <
                      creditCardReports.length -
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

      {/* ================================= */}
      {/* ACCOUNT ACTIVITY */}
      {/* ================================= */}

      <Text
        variant="titleMedium"
        style={
          styles.sectionTitle
        }
      >
        Account Activity
      </Text>

      <Card
        style={styles.card}
      >
        <Card.Content>
          {accountActivity.length ===
          0 ? (
            <Text
              style={
                styles.emptyText
              }
            >
              No account activity
              for {monthName}.
            </Text>
          ) : (
            accountActivity.map(
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
                      styles.accountHeader
                    }
                  >
                    <View
                      style={
                        styles.accountName
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

                      <Text
                        variant="bodyLarge"
                      >
                        {
                          account.name
                        }
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.bold,
                        account.net >=
                        0
                          ? styles.income
                          : styles.expense,
                      ]}
                    >
                      {account.net >=
                      0
                        ? "+"
                        : "-"}
                      {formatMoney(
                        Math.abs(
                          account.net
                        )
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.accountDetails
                    }
                  >
                    <Text
                      variant="bodySmall"
                      style={
                        styles.income
                      }
                    >
                      Income{" "}
                      {formatMoney(
                        account.monthlyIncome
                      )}
                    </Text>

                    <Text
                      variant="bodySmall"
                      style={
                        styles.expense
                      }
                    >
                      Expense{" "}
                      {formatMoney(
                        account.monthlyExpense
                      )}
                    </Text>
                  </View>

                  {index <
                    accountActivity.length -
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
      {/* TRANSACTION COUNT */}
      {/* ================================= */}

      <Card
        style={
          styles.transactionCard
        }
      >
        <Card.Content>
          <Text
            variant="bodyMedium"
            style={styles.label}
          >
            Transactions in{" "}
            {monthName}
          </Text>

          <Text
            variant="headlineSmall"
            style={styles.bold}
          >
            {
              monthTransactions.length
            }
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
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

    title: {
      fontWeight: "700",
      marginBottom: 16,
    },

    monthCard: {
      borderRadius: 16,
      marginBottom: 12,
    },

    monthSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    monthCenter: {
      alignItems: "center",
    },

    monthText: {
      fontWeight: "600",
    },

    currentText: {
      color: "#2563EB",
      marginTop: 2,
    },

    balanceCard: {
      borderRadius: 18,
      marginBottom: 20,
    },

    balance: {
      fontWeight: "700",
      marginTop: 4,
    },

    label: {
      color: "#777",
    },

    sectionTitle: {
      fontWeight: "600",
      marginBottom: 10,
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

    income: {
      color: "#16A34A",
      fontWeight: "700",
    },

    expense: {
      color: "#D32F2F",
      fontWeight: "700",
    },

    savingsCard: {
      borderRadius: 14,
      marginTop: 12,
      marginBottom: 22,
    },

    card: {
      borderRadius: 14,
      marginBottom: 22,
    },

    categoryHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    progress: {
      marginTop: 8,
      height: 7,
      borderRadius: 5,
    },

    percentage: {
      color: "#777",
      marginTop: 4,
    },

    divider: {
      marginVertical: 12,
    },

    bold: {
      fontWeight: "700",
    },

    accountHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    accountName: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    accountDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },

    accountDetails: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 8,
    },

    creditGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      gap: 8,
      marginTop: 8,
    },

    emptyText: {
      color: "#777",
      textAlign: "center",
      paddingVertical: 10,
    },

    
  creditMetricRow: {
    flexDirection: "row",
    gap: 12,
  },

  creditMetric: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
  },

  creditMetricValue: {
    marginTop: 4,
    fontWeight: "700",
    fontSize: 15,
  },

  creditDueText: {
    color: "#6B7280",
    marginTop: 14,
    fontWeight: "500",
  },
  
    transactionCard: {
      borderRadius: 14,
      marginBottom: 10,
    },
  });
