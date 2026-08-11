import { useState } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Card,
  Icon,
  IconButton,
  Menu,
  Text,
} from "react-native-paper";

import { Account } from "../types/account";

interface Props {
  account: Account;

  onEdit: (
    account: Account
  ) => void;

  onDelete: (
    account: Account
  ) => void;
}

// ========================================
// ACCOUNT TYPE CONFIG
// ========================================

const ACCOUNT_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: string;
    color: string;
    background: string;
  }
> = {
  Savings: {
    label: "Savings Account",
    icon: "bank",
    color: "#2563EB",
    background: "#DBEAFE",
  },

  Current: {
    label: "Current Account",
    icon: "bank-outline",
    color: "#7C3AED",
    background: "#EDE9FE",
  },

  "Credit Card": {
    label: "Credit Card",
    icon: "credit-card-outline",
    color: "#DC2626",
    background: "#FEE2E2",
  },

  Cash: {
    label: "Cash",
    icon: "cash",
    color: "#16A34A",
    background: "#DCFCE7",
  },

  Wallet: {
    label: "Wallet",
    icon: "wallet-outline",
    color: "#EA580C",
    background: "#FFEDD5",
  },

  Investment: {
    label: "Investment",
    icon: "chart-line",
    color: "#0891B2",
    background: "#CFFAFE",
  },

  Loan: {
    label: "Loan",
    icon: "cash-minus",
    color: "#B91C1C",
    background: "#FEE2E2",
  },

  UPI: {
    label: "UPI",
    icon: "cellphone",
    color: "#9333EA",
    background: "#F3E8FF",
  },

  Other: {
    label: "Other",
    icon: "wallet-outline",
    color: "#64748B",
    background: "#F1F5F9",
  },
};

// ========================================
// COMPONENT
// ========================================

export default function AccountCard({
  account,
  onEdit,
  onDelete,
}: Props) {
  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  const typeConfig =
    ACCOUNT_TYPE_CONFIG[
      account.type
    ] ??
    ACCOUNT_TYPE_CONFIG.Other;

  return (
    <Card
      style={styles.card}
      onPress={() => {
        // Future:
        // Open Account Details
      }}
    >
      <Card.Content>
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.accountHeader
            }
          >
            {/* ============================= */}
            {/* ACCOUNT ICON */}
            {/* ============================= */}

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    typeConfig.background,
                },
              ]}
            >
              <Icon
                source={
                  typeConfig.icon
                }
                size={24}
                color={
                  typeConfig.color
                }
              />
            </View>

            {/* ============================= */}
            {/* NAME + TYPE */}
            {/* ============================= */}

            <View
              style={
                styles.accountInfo
              }
            >
              <Text
                variant="titleMedium"
                style={
                  styles.accountName
                }
                numberOfLines={1}
              >
                {account.name}
              </Text>

              <View
                style={
                  styles.typeRow
                }
              >
                <Text
                  variant="bodySmall"
                  style={[
                    styles.accountType,
                    {
                      color:
                        typeConfig.color,
                    },
                  ]}
                >
                  {
                    typeConfig.label
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* ================================= */}
          {/* MENU */}
          {/* ================================= */}

          <Menu
            visible={
              menuVisible
            }
            onDismiss={() =>
              setMenuVisible(
                false
              )
            }
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() =>
                  setMenuVisible(
                    true
                  )
                }
              />
            }
          >
            <Menu.Item
              leadingIcon="pencil"
              title="Edit"
              onPress={() => {
                setMenuVisible(
                  false
                );

                onEdit(account);
              }}
            />

            <Menu.Item
              leadingIcon="delete"
              title="Delete"
              onPress={() => {
                setMenuVisible(
                  false
                );

                onDelete(account);
              }}
            />
          </Menu>
        </View>

        {/* ================================= */}
        {/* BALANCE */}
        {/* ================================= */}

        <View
          style={
            styles.balanceSection
          }
        >
          <Text
            variant="bodySmall"
            style={
              styles.balanceLabel
            }
          >
            {account.type ===
            "Credit Card"
              ? "Current Balance"
              : "Available Balance"}
          </Text>

          <Text
            variant="headlineSmall"
            style={[
              styles.balance,
              {
                color:
                  typeConfig.color,
              },
            ]}
          >
            ₹
            {account.balance.toLocaleString(
              "en-IN"
            )}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

// ========================================
// STYLES
// ========================================

const styles =
  StyleSheet.create({
    card: {
      marginBottom: 12,

      borderRadius: 20,
    },

    header: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",
    },

    accountHeader: {
      flexDirection: "row",

      alignItems: "center",

      flex: 1,

      minWidth: 0,
    },

    iconContainer: {
      width: 48,

      height: 48,

      borderRadius: 24,

      alignItems: "center",

      justifyContent:
        "center",
    },

    accountInfo: {
      flex: 1,

      marginLeft: 12,

      minWidth: 0,
    },

    accountName: {
      fontWeight: "700",
    },

    typeRow: {
      flexDirection: "row",

      marginTop: 3,
    },

    accountType: {
      fontWeight: "600",
    },

    balanceSection: {
      marginTop: 18,

      paddingTop: 14,

      borderTopWidth: 1,

      borderTopColor:
        "#E5E7EB",
    },

    balanceLabel: {
      color: "#777",

      marginBottom: 3,
    },

    balance: {
      fontWeight: "700",
    },
  });