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

/**
 * Returns balance changes caused by a transaction.
 *
 * Expense:
 *   account - amount
 *
 * Income:
 *   account + amount
 *
 * Transfer:
 *   source - amount
 *   destination + amount
 */
function getTransactionDeltas(
  transaction: Transaction
): Record<string, number> {
  const deltas: Record<
    string,
    number
  > = {};

  const addDelta = (
    accountId: string | undefined,
    amount: number
  ) => {
    if (!accountId) {
      return;
    }

    deltas[accountId] =
      (deltas[accountId] ?? 0) +
      amount;
  };

  // ======================================
  // EXPENSE
  // ======================================

  if (
    transaction.type === "expense"
  ) {
    addDelta(
      transaction.accountId,
      -transaction.amount
    );
  }

  // ======================================
  // INCOME
  // ======================================

  if (
    transaction.type === "income"
  ) {
    addDelta(
      transaction.accountId,
      transaction.amount
    );
  }

  // ======================================
  // TRANSFER
  // ======================================

  if (
    transaction.type === "transfer"
  ) {
    addDelta(
      transaction.accountId,
      -transaction.amount
    );

    addDelta(
      transaction.toAccountId,
      transaction.amount
    );
  }

  return deltas;
}

/**
 * Applies balance changes to accounts.
 */
async function applyBalanceDeltas(
  deltas: Record<string, number>
): Promise<TransactionResult> {
  const accountStore =
    useAccountStore.getState();

  const accounts =
    accountStore.accounts;

  const updatedAccounts =
    new Map(
      accounts.map((account) => [
        account.id,
        account,
      ])
    );

  // ======================================
  // VALIDATE ALL ACCOUNTS FIRST
  // ======================================

  for (const [
    accountId,
    delta,
  ] of Object.entries(deltas)) {
    const account =
      updatedAccounts.get(
        accountId
      );

    if (!account) {
      return {
        success: false,
        error:
          "Account not found",
      };
    }

    const newBalance =
      account.balance + delta;

    if (newBalance < 0) {
      return {
        success: false,
        error: `Insufficient balance in ${account.name}`,
      };
    }
  }

  // ======================================
  // APPLY CHANGES
  // ======================================

  for (const [
    accountId,
    delta,
  ] of Object.entries(deltas)) {
    const account =
      updatedAccounts.get(
        accountId
      );

    if (!account) {
      continue;
    }

    await accountStore.updateAccount(
      {
        ...account,

        balance:
          account.balance + delta,

        updatedAt:
          new Date().toISOString(),
      }
    );
  }

  return {
    success: true,
  };
}

export const useTransactionStore =
  create<TransactionState>(
    (set) => ({
      transactions: [],

      loading: false,

      // ====================================
      // LOAD TRANSACTIONS
      // ====================================

      loadTransactions:
        async () => {
          set({
            loading: true,
          });

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

      // ====================================
      // ADD TRANSACTION
      // ====================================

      addTransaction:
        async (
          transaction
        ) => {
          try {
            // ------------------------------
            // BASIC VALIDATION
            // ------------------------------

            if (
              transaction.amount <= 0
            ) {
              return {
                success: false,
                error:
                  "Amount must be greater than zero",
              };
            }

            // ------------------------------
            // TRANSFER VALIDATION
            // ------------------------------

            if (
              transaction.type ===
              "transfer"
            ) {
              if (
                !transaction.toAccountId
              ) {
                return {
                  success: false,
                  error:
                    "Transfer account is required",
                };
              }

              if (
                transaction.accountId ===
                transaction.toAccountId
              ) {
                return {
                  success: false,
                  error:
                    "Select two different accounts",
                };
              }
            }

            // ------------------------------
            // CALCULATE BALANCE CHANGES
            // ------------------------------

            const deltas =
              getTransactionDeltas(
                transaction
              );

            // ------------------------------
            // UPDATE ACCOUNTS
            // ------------------------------

            const balanceResult =
              await applyBalanceDeltas(
                deltas
              );

            if (
              !balanceResult.success
            ) {
              return balanceResult;
            }

            // ------------------------------
            // SAVE TRANSACTION
            // ------------------------------

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

      // ====================================
      // UPDATE TRANSACTION
      // ====================================

      updateTransaction:
        async (
          updatedTransaction
        ) => {
          try {
            // ------------------------------
            // BASIC VALIDATION
            // ------------------------------

            if (
              updatedTransaction.amount <=
              0
            ) {
              return {
                success: false,
                error:
                  "Amount must be greater than zero",
              };
            }

            // ------------------------------
            // TRANSFER VALIDATION
            // ------------------------------

            if (
              updatedTransaction.type ===
              "transfer"
            ) {
              if (
                !updatedTransaction.toAccountId
              ) {
                return {
                  success: false,
                  error:
                    "Transfer account is required",
                };
              }

              if (
                updatedTransaction.accountId ===
                updatedTransaction.toAccountId
              ) {
                return {
                  success: false,
                  error:
                    "Select two different accounts",
                };
              }
            }

            // ------------------------------
            // FIND OLD TRANSACTION
            // ------------------------------

            const transactions =
              await repository.getAll();

            const oldTransaction =
              transactions.find(
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

            // ------------------------------
            // OLD BALANCE EFFECT
            // ------------------------------

            const oldDeltas =
              getTransactionDeltas(
                oldTransaction
              );

            // ------------------------------
            // NEW BALANCE EFFECT
            // ------------------------------

            const newDeltas =
              getTransactionDeltas(
                updatedTransaction
              );

            // ------------------------------
            // COMBINE DELTAS
            //
            // Reverse old transaction
            // + apply new transaction
            // ------------------------------

            const combinedDeltas: Record<
              string,
              number
            > = {};

            // Reverse old
            Object.entries(
              oldDeltas
            ).forEach(
              ([
                accountId,
                delta,
              ]) => {
                combinedDeltas[
                  accountId
                ] =
                  (combinedDeltas[
                    accountId
                  ] ?? 0) - delta;
              }
            );

            // Apply new
            Object.entries(
              newDeltas
            ).forEach(
              ([
                accountId,
                delta,
              ]) => {
                combinedDeltas[
                  accountId
                ] =
                  (combinedDeltas[
                    accountId
                  ] ?? 0) + delta;
              }
            );

            // ------------------------------
            // REMOVE ZERO DELTAS
            // ------------------------------

            Object.keys(
              combinedDeltas
            ).forEach(
              (accountId) => {
                if (
                  combinedDeltas[
                    accountId
                  ] === 0
                ) {
                  delete combinedDeltas[
                    accountId
                  ];
                }
              }
            );

            // ------------------------------
            // UPDATE BALANCES
            // ------------------------------

            const balanceResult =
              await applyBalanceDeltas(
                combinedDeltas
              );

            if (
              !balanceResult.success
            ) {
              return balanceResult;
            }

            // ------------------------------
            // UPDATE TRANSACTION
            // ------------------------------

            await repository.update(
              updatedTransaction
            );

            const latestTransactions =
              await repository.getAll();

            set({
              transactions:
                latestTransactions,
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

      // ====================================
      // DELETE TRANSACTION
      // ====================================

      deleteTransaction:
        async (id) => {
          try {
            // ------------------------------
            // FIND TRANSACTION
            // ------------------------------

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

            // ------------------------------
            // GET CURRENT EFFECT
            // ------------------------------

            const transactionDeltas =
              getTransactionDeltas(
                transaction
              );

            // ------------------------------
            // REVERSE TRANSACTION
            // ------------------------------

            const reverseDeltas: Record<
              string,
              number
            > = {};

            Object.entries(
              transactionDeltas
            ).forEach(
              ([
                accountId,
                delta,
              ]) => {
                reverseDeltas[
                  accountId
                ] = -delta;
              }
            );

            // ------------------------------
            // RESTORE BALANCES
            // ------------------------------

            const balanceResult =
              await applyBalanceDeltas(
                reverseDeltas
              );

            if (
              !balanceResult.success
            ) {
              return balanceResult;
            }

            // ------------------------------
            // DELETE TRANSACTION
            // ------------------------------

            await repository.delete(
              id
            );

            const latestTransactions =
              await repository.getAll();

            set({
              transactions:
                latestTransactions,
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
    })
  );