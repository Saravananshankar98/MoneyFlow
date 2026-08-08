import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

interface Props {
  title: string;
  value: string;
}

export default function SummaryCard({
  title,
  value,
}: Props) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="labelMedium">{title}</Text>

        <Text variant="headlineSmall">
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 18,
  },
});