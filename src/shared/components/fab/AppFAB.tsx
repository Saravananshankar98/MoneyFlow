import { useState } from "react";
import { Portal, FAB } from "react-native-paper";

interface Props {
  onExpensePress: () => void;
  onIncomePress: () => void;
}

export default function AppFAB({
  onExpensePress,
  onIncomePress,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible
        icon={open ? "close" : "plus"}
        actions={[
          {
            icon: "arrow-down-bold",
            label: "Expense",
            onPress: onExpensePress,
          },
          {
            icon: "arrow-up-bold",
            label: "Income",
            onPress: onIncomePress,
          },
        ]}
        onStateChange={({ open }) =>
          setOpen(open)
        }
      />
    </Portal>
  );
}