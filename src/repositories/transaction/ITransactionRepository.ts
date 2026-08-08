import { Transaction } from "../../features/transactions/types/transaction";

export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;

  getById(id: string): Promise<Transaction | null>;

  add(transaction: Transaction): Promise<void>;

  update(transaction: Transaction): Promise<void>;

  delete(id: string): Promise<void>;
}