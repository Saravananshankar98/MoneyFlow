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

  /**
   * First day of the billing cycle, 1-31.
   * Used only when type === "Credit Card".
   */
  billingCycleStartDay?: number;

  /**
   * Last day of the billing cycle, 1-31.
   * Used only when type === "Credit Card".
   */
  billingCycleEndDay?: number;

  /**
   * Day of month the bill payment is due, 1-31.
   * Used only when type === "Credit Card".
   */
  dueDateDay?: number;

  createdAt: string;

  updatedAt: string;
}
