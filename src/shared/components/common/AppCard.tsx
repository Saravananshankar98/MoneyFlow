import { Card } from "react-native-paper";
import { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";

export default function AppCard({
  children,
}: PropsWithChildren) {
  return (
    <Card style={styles.card}>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    elevation: 2,
  },
});