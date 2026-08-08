import { Card, List } from "react-native-paper";

export default function RecentTransactions() {
  return (
    <Card
      style={{
        marginTop: 20,
      }}
    >
      <List.Item
        title="Breakfast"
        description="- ₹100"
        left={(props) => (
          <List.Icon
            {...props}
            icon="food"
          />
        )}
      />

      <List.Item
        title="Lunch"
        description="- ₹250"
        left={(props) => (
          <List.Icon
            {...props}
            icon="silverware-fork-knife"
          />
        )}
      />
    </Card>
  );
}