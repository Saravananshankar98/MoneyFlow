import { View } from "react-native";
import { Text } from "react-native-paper";

export default function DashboardHeader() {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text variant="headlineMedium">
        Good Evening 👋
      </Text>

      <Text variant="bodyMedium">
        Welcome to MoneyFlow
      </Text>
    </View>
  );
}