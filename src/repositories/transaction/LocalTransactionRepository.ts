import AsyncStorage from "@react-native-async-storage/async-storage";

import { Transaction } from "../../features/transactions/types/transaction";

import { ITransactionRepository } from "./ITransactionRepository";

const STORAGE_KEY = "moneyflow_transactions";

export class LocalTransactionRepository
  implements ITransactionRepository
{
  async getAll(): Promise<Transaction[]> {
    try {
      const data =
        await AsyncStorage.getItem(STORAGE_KEY);

      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(
        "Failed to load transactions:",
        error
      );

      return [];
    }
  }

  async getById(
    id: string
  ): Promise<Transaction | null> {
    const transactions = await this.getAll();

    return (
      transactions.find(
        (transaction) => transaction.id === id
      ) ?? null
    );
  }

  async add(
    transaction: Transaction
  ): Promise<void> {
    const transactions = await this.getAll();

    transactions.unshift(transaction);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );
  }

  async update(
    transaction: Transaction
  ): Promise<void> {
    const transactions = await this.getAll();

    const updated = transactions.map((item) =>
      item.id === transaction.id
        ? transaction
        : item
    );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  }

  async delete(id: string): Promise<void> {
    const transactions = await this.getAll();

    const updated = transactions.filter(
      (item) => item.id !== id
    );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  }
}