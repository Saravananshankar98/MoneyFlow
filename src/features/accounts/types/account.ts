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

  /**
   * Credit card maximum spending limit.
   * Used only when type === "Credit Card".
   */
  creditLimit?: number;

  /**
   * Amount currently owed on the credit card.
   * Used only when type === "Credit Card".
   */
  outstanding?: number;

  createdAt: string;

  updatedAt: string;
}