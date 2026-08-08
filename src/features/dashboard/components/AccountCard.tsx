import { Card, Text } from "react-native-paper";

interface Props {
  name: string;
  balance: number;
}

export default function AccountCard({
  name,
  balance,
}: Props) {
  return (
    <Card
      style={{
        marginVertical: 8,
        borderRadius: 18,
      }}
    >
      <Card.Content>
        <Text>{name}</Text>

        <Text variant="titleLarge">
          ₹{balance.toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );
}