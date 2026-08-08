import { Account } from "../../features/accounts/types/account";

export interface IAccountRepository {
  getAll(): Promise<Account[]>;

  add(account: Account): Promise<void>;

  update(account: Account): Promise<void>;

  delete(id: string): Promise<void>;
}