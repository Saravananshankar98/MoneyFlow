import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function DashboardHeader() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">
        Good Evening 👋
      </Text>

      <Text variant="bodyMedium">
        Welcome to MoneyFlow
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});