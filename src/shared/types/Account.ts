export type AccountType =
  | "Savings"
  | "Current"
  | "Cash"
  | "Credit Card"
  | "Wallet"
  | "Investment"
  | "Loan"
  | "UPI"
  | "Other";

export interface Account {
  id: string;
  name: string;
  balance: number;
  color: string;
  type: AccountType;
  creditLimit?: number;
  outstanding?: number;
  billingCycleStartDay?: number;
  billingCycleEndDay?: number;
  dueDateDay?: number;
}
