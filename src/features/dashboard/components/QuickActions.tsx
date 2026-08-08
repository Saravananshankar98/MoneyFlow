import { View } from "react-native";
import { Button } from "react-native-paper";

export default function QuickActions() {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Button mode="contained">
        Expense
      </Button>

      <Button mode="contained-tonal">
        Income
      </Button>
    </View>
  );
}