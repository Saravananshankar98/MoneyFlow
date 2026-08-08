import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

type Props = {
  title: string;
  amount: number;
};

export default function BalanceCard({
  title,
  amount,
}: Props) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{title}</Text>

        <View style={{ height: 8 }} />

        <Text variant="displaySmall">
          ₹{amount.toLocaleString("en-IN")}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
  },
});