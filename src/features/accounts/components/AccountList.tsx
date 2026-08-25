import { FlatList, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import AccountCard from "./AccountCard";

import { Account } from "../types/account";

interface Props {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onArchive: (account: Account) => void;
  onRestore: (account: Account) => void;
}

export default function AccountList({
  accounts,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: Props) {
  return (
    <FlatList
      data={accounts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.content,
        accounts.length === 0 && styles.emptyContent,
      ]}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <AccountCard
          account={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      )}
      ListEmptyComponent={
        <Text variant="bodyLarge" style={styles.emptyText}>
          No accounts yet. Add one to start tracking your money.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    paddingHorizontal: 24,
  },
});
