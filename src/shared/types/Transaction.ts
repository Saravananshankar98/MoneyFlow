export type TransactionType =
  | "income"
  | "expense"
  | "transfer";

export interface Transaction {
  id: string;

  accountId: string;

  amount: number;

  description: string;

  category?: string;

  paymentType?: string;

  date: string;

  type: TransactionType;
}