import { StyleSheet, View } from "react-native";
import {
  Button,
  SegmentedButtons,
  TextInput,
} from "react-native-paper";
import AppSelect from "../../../shared/components/inputs/AppSelect";

export type TransactionFilterType =
  | "all"
  | "income"
  | "expense";

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  search: string;
  type: TransactionFilterType;
  accountId: string;
  category: string;

  accountOptions: SelectOption[];
  categoryOptions: SelectOption[];

  onSearchChange: (value: string) => void;

  onTypeChange: (
    value: TransactionFilterType
  ) => void;

  onAccountChange: (
    value: string
  ) => void;

  onCategoryChange: (
    value: string
  ) => void;

  onClear: () => void;
}

export default function TransactionFilters({
  search,
  type,
  accountId,
  category,
  accountOptions,
  categoryOptions,
  onSearchChange,
  onTypeChange,
  onAccountChange,
  onCategoryChange,
  onClear,
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Search transactions"
        placeholder="Breakfast, Salary..."
        value={search}
        onChangeText={onSearchChange}
        left={
          <TextInput.Icon icon="magnify" />
        }
      />

      <SegmentedButtons
        value={type}
        onValueChange={(value) =>
          onTypeChange(
            value as TransactionFilterType
          )
        }
        buttons={[
          {
            value: "all",
            label: "All",
          },
          {
            value: "income",
            label: "Income",
          },
          {
            value: "expense",
            label: "Expense",
          },
        ]}
      />

      <AppSelect
        label="Account"
        value={accountId}
        placeholder="All accounts"
        options={[
          {
            label: "All accounts",
            value: "",
          },
          ...accountOptions,
        ]}
        onChange={onAccountChange}
      />

      <AppSelect
        label="Category"
        value={category}
        placeholder="All categories"
        options={[
          {
            label: "All categories",
            value: "",
          },
          ...categoryOptions,
        ]}
        onChange={onCategoryChange}
      />

      <Button
        mode="outlined"
        icon="filter-remove"
        onPress={onClear}
      >
        Clear Filters
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 12,
  },
});