import { useEffect } from "react";
import { FlatList, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { router } from "expo-router";

import { useAccountStore } from "../../../store";

export default function AccountListScreen() {
  const { accounts, loadAccounts } = useAccountStore();

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button
        mode="contained"
        icon="plus"
        onPress={() => router.push("/accounts/add")}
      >
        Add Account
      </Button>

      <FlatList
        style={{ marginTop: 16 }}
        data={accounts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text>No accounts yet</Text>
        }
        renderItem={({ item }) => (
          <Card
            style={{
              marginBottom: 12,
              borderRadius: 18,
            }}
          >
            <Card.Content>
              <Text variant="titleMedium">
                {item.name}
              </Text>

              <Text>
                ₹{item.balance.toLocaleString("en-IN")}
              </Text>

              <Text>{item.type}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}