import AsyncStorage from "@react-native-async-storage/async-storage";

import { Account } from "../../features/accounts/types/account";
import { IAccountRepository } from "./IAccountRepository";

const STORAGE_KEY = "moneyflow_accounts";

export class LocalAccountRepository
  implements IAccountRepository
{
  async getAll(): Promise<Account[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);

      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Handle old Zustand persist format
      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed?.state?.accounts && Array.isArray(parsed.state.accounts)) {
        return parsed.state.accounts;
      }

      return [];
    } catch (error) {
      console.error("Failed to load accounts:", error);
      return [];
    }
  }
  async add(account: Account): Promise<void> {
    const accounts = await this.getAll();

    accounts.push(account);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(accounts)
    );
  }

  async update(account: Account): Promise<void> {
    const accounts = await this.getAll();

    const updated = accounts.map((item) =>
      item.id === account.id ? account : item
    );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  }

  async delete(id: string): Promise<void> {
    const accounts = await this.getAll();

    const filtered = accounts.filter(
      (item) => item.id !== id
    );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered)
    );
  }
}