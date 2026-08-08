import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  IconButton,
  Menu,
  Text,
} from "react-native-paper";

import { Account } from "../types/account";

interface Props {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export default function AccountCard({
  account,
  onEdit,
  onDelete,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <Card
      style={styles.card}
      onPress={() => {
        // Future: Open Account Details
      }}
    >
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium">
              {account.name}
            </Text>

            <Text variant="bodySmall">
              {account.type}
            </Text>
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              leadingIcon="pencil"
              title="Edit"
              onPress={() => {
                setMenuVisible(false);
                onEdit(account);
              }}
            />

            <Menu.Item
              leadingIcon="delete"
              title="Delete"
              onPress={() => {
                setMenuVisible(false);
                onDelete(account);
              }}
            />
          </Menu>
        </View>

        <Text
          variant="headlineSmall"
          style={styles.balance}
        >
          ₹{account.balance.toLocaleString("en-IN")}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  balance: {
    marginTop: 16,
    fontWeight: "700",
  },
});