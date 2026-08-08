export type AccountType =
  | "Savings"
  | "Current"
  | "Cash"
  | "Credit Card"
  | "UPI";

export interface Account {
  id: string;

  name: string;

  balance: number;

  color: string;

  type: AccountType;

  createdAt: string;

  updatedAt: string;
}