import { create } from "zustand";

import { Transaction } from "../features/transactions/types/transaction";
import { LocalTransactionRepository } from "../repositories/transaction";
import { useAccountStore } from "./accountStore";

interface TransactionResult {
  success: boolean;
  error?: string;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;

  loadTransactions: () => Promise<void>;

  addTransaction: (
    transaction: Transaction
  ) => Promise<TransactionResult>;

  updateTransaction: (
    transaction: Transaction
  ) => Promise<TransactionResult>;

  deleteTransaction: (
    id: string
  ) => Promise<TransactionResult>;
}

const repository =
  new LocalTransactionRepository();

export const useTransactionStore =
  create<TransactionState>((set) => ({
    transactions: [],
    loading: false,

    // ========================================
    // LOAD TRANSACTIONS
    // ========================================

    loadTransactions: async () => {
      set({ loading: true });

      try {
        const transactions =
          await repository.getAll();

        set({
          transactions,
          loading: false,
        });
      } catch (error) {
        console.error(
          "Failed to load transactions:",
          error
        );

        set({
          loading: false,
        });
      }
    },

    // ========================================
    // ADD TRANSACTION
    // ========================================

    addTransaction: async (
      transaction
    ) => {
      try {
        const accountStore =
          useAccountStore.getState();

        const account =
          accountStore.accounts.find(
            (item) =>
              item.id ===
              transaction.accountId
          );

        if (!account) {
          return {
            success: false,
            error:
              "Account not found",
          };
        }

        // ====================================
        // EXPENSE
        // ====================================

        if (
          transaction.type ===
          "expense"
        ) {
          if (
            account.balance <
            transaction.amount
          ) {
            return {
              success: false,
              error: `Insufficient balance in ${account.name}`,
            };
          }

          await accountStore.updateAccount(
            {
              ...account,

              balance:
                account.balance -
                transaction.amount,

              updatedAt:
                new Date().toISOString(),
            }
          );
        }

        // ====================================
        // INCOME
        // ====================================

        if (
          transaction.type ===
          "income"
        ) {
          await accountStore.updateAccount(
            {
              ...account,

              balance:
                account.balance +
                transaction.amount,

              updatedAt:
                new Date().toISOString(),
            }
          );
        }

        // ====================================
        // SAVE TRANSACTION
        // ====================================

        await repository.add(
          transaction
        );

        const transactions =
          await repository.getAll();

        set({
          transactions,
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "Failed to add transaction:",
          error
        );

        return {
          success: false,
          error:
            "Unable to save transaction",
        };
      }
    },

    // ========================================
    // UPDATE TRANSACTION
    // ========================================

    updateTransaction: async (
      updatedTransaction
    ) => {
      try {
        const accountStore =
          useAccountStore.getState();

        // ====================================
        // FIND OLD TRANSACTION
        // ====================================

        const oldTransaction =
          (
            await repository.getAll()
          ).find(
            (item) =>
              item.id ===
              updatedTransaction.id
          );

        if (!oldTransaction) {
          return {
            success: false,
            error:
              "Transaction not found",
          };
        }

        // ====================================
        // SAME ACCOUNT
        // ====================================

        if (
          oldTransaction.accountId ===
          updatedTransaction.accountId
        ) {
          const account =
            accountStore.accounts.find(
              (item) =>
                item.id ===
                updatedTransaction.accountId
            );

          if (!account) {
            return {
              success: false,
              error:
                "Account not found",
            };
          }

          let newBalance =
            account.balance;

          // --------------------------------
          // OLD EXPENSE
          // --------------------------------

          if (
            oldTransaction.type ===
            "expense"
          ) {
            newBalance +=
              oldTransaction.amount;
          }

          // --------------------------------
          // OLD INCOME
          // --------------------------------

          if (
            oldTransaction.type ===
            "income"
          ) {
            newBalance -=
              oldTransaction.amount;
          }

          // --------------------------------
          // NEW EXPENSE
          // --------------------------------

          if (
            updatedTransaction.type ===
            "expense"
          ) {
            newBalance -=
              updatedTransaction.amount;
          }

          // --------------------------------
          // NEW INCOME
          // --------------------------------

          if (
            updatedTransaction.type ===
            "income"
          ) {
            newBalance +=
              updatedTransaction.amount;
          }

          // --------------------------------
          // NEGATIVE BALANCE CHECK
          // --------------------------------

          if (newBalance < 0) {
            return {
              success: false,
              error: `Insufficient balance in ${account.name}`,
            };
          }

          await accountStore.updateAccount(
            {
              ...account,

              balance:
                newBalance,

              updatedAt:
                new Date().toISOString(),
            }
          );
        }

        // ====================================
        // ACCOUNT CHANGED
        // ====================================

        else {
          const oldAccount =
            accountStore.accounts.find(
              (item) =>
                item.id ===
                oldTransaction.accountId
            );

          const newAccount =
            accountStore.accounts.find(
              (item) =>
                item.id ===
                updatedTransaction.accountId
            );

          if (!oldAccount) {
            return {
              success: false,
              error:
                "Old account not found",
            };
          }

          if (!newAccount) {
            return {
              success: false,
              error:
                "New account not found",
            };
          }

          let oldAccountBalance =
            oldAccount.balance;

          let newAccountBalance =
            newAccount.balance;

          // --------------------------------
          // REVERSE OLD TRANSACTION
          // --------------------------------

          if (
            oldTransaction.type ===
            "expense"
          ) {
            oldAccountBalance +=
              oldTransaction.amount;
          }

          if (
            oldTransaction.type ===
            "income"
          ) {
            oldAccountBalance -=
              oldTransaction.amount;
          }

          // --------------------------------
          // APPLY NEW TRANSACTION
          // --------------------------------

          if (
            updatedTransaction.type ===
            "expense"
          ) {
            newAccountBalance -=
              updatedTransaction.amount;
          }

          if (
            updatedTransaction.type ===
            "income"
          ) {
            newAccountBalance +=
              updatedTransaction.amount;
          }

          // --------------------------------
          // CHECK NEW ACCOUNT
          // --------------------------------

          if (
            newAccountBalance < 0
          ) {
            return {
              success: false,
              error: `Insufficient balance in ${newAccount.name}`,
            };
          }

          // --------------------------------
          // UPDATE OLD ACCOUNT
          // --------------------------------

          await accountStore.updateAccount(
            {
              ...oldAccount,

              balance:
                oldAccountBalance,

              updatedAt:
                new Date().toISOString(),
            }
          );

          // --------------------------------
          // UPDATE NEW ACCOUNT
          // --------------------------------

          await accountStore.updateAccount(
            {
              ...newAccount,

              balance:
                newAccountBalance,

              updatedAt:
                new Date().toISOString(),
            }
          );
        }

        // ====================================
        // UPDATE TRANSACTION
        // ====================================

        await repository.update(
          updatedTransaction
        );

        const transactions =
          await repository.getAll();

        set({
          transactions,
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "Failed to update transaction:",
          error
        );

        return {
          success: false,
          error:
            "Unable to update transaction",
        };
      }
    },

    // ========================================
    // DELETE TRANSACTION
    // ========================================

    deleteTransaction: async (
      id
    ) => {
      try {
        const accountStore =
          useAccountStore.getState();

        const transactions =
          await repository.getAll();

        const transaction =
          transactions.find(
            (item) =>
              item.id === id
          );

        if (!transaction) {
          return {
            success: false,
            error:
              "Transaction not found",
          };
        }

        const account =
          accountStore.accounts.find(
            (item) =>
              item.id ===
              transaction.accountId
          );

        if (!account) {
          return {
            success: false,
            error:
              "Account not found",
          };
        }

        let newBalance =
          account.balance;

        // ====================================
        // DELETE EXPENSE
        // ====================================

        if (
          transaction.type ===
          "expense"
        ) {
          newBalance +=
            transaction.amount;
        }

        // ====================================
        // DELETE INCOME
        // ====================================

        if (
          transaction.type ===
          "income"
        ) {
          newBalance -=
            transaction.amount;
        }

        // ====================================
        // NEGATIVE BALANCE
        // ====================================

        if (newBalance < 0) {
          return {
            success: false,
            error:
              "Unable to delete transaction",
          };
        }

        // ====================================
        // UPDATE ACCOUNT
        // ====================================

        await accountStore.updateAccount(
          {
            ...account,

            balance:
              newBalance,

            updatedAt:
              new Date().toISOString(),
          }
        );

        // ====================================
        // DELETE TRANSACTION
        // ====================================

        await repository.delete(id);

        const updatedTransactions =
          await repository.getAll();

        set({
          transactions:
            updatedTransactions,
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "Failed to delete transaction:",
          error
        );

        return {
          success: false,
          error:
            "Unable to delete transaction",
        };
      }
    },
  }));