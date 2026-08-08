import { create } from "zustand";

import { Account } from "../features/accounts/types/account";
import { LocalAccountRepository } from "../repositories/account";

interface AccountState {
  accounts: Account[];
  loading: boolean;

  loadAccounts: () => Promise<void>;

  addAccount: (account: Account) => Promise<void>;

  updateAccount: (account: Account) => Promise<void>;

  deleteAccount: (id: string) => Promise<void>;
}

const repository = new LocalAccountRepository();

export const useAccountStore = create<AccountState>(
  (set) => ({
    accounts: [],
    loading: false,

    loadAccounts: async () => {
      set({ loading: true });

      const accounts = await repository.getAll();

      set({
        accounts,
        loading: false,
      });
    },

    addAccount: async (account) => {
      await repository.add(account);

      const accounts = await repository.getAll();

      set({ accounts });
    },

    updateAccount: async (account) => {
      await repository.update(account);

      const accounts = await repository.getAll();

      set({ accounts });
    },

    deleteAccount: async (id) => {
      await repository.delete(id);

      const accounts = await repository.getAll();

      set({ accounts });
    },
  })
);