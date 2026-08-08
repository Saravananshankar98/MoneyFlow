import { FlatList } from "react-native";

import AccountCard from "./AccountCard";

import { Account } from "../types/account";

interface Props {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export default function AccountList({
  accounts,
  onEdit,
  onDelete,
}: Props) {
  return (
    <FlatList
      data={accounts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AccountCard
          account={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}