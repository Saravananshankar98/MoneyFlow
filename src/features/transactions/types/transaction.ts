export type TransactionType =
  | "expense"
  | "income"
  | "transfer";

export type PaymentType =
  | "Cash"
  | "UPI"
  | "Debit Card"
  | "Credit Card"
  | "Net Banking"
  | "Cheque"
  | "Wallet";

export interface Transaction {
  id: string;

  type: TransactionType;

  amount: number;

  details: string;

  accountId: string;

  paymentType?: PaymentType;

  category?: string;

  notes?: string;

  date: string;

  createdAt: string;

  updatedAt: string;
}