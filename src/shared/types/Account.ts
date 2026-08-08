export type AccountType =
  | "Savings"
  | "Current"
  | "Cash"
  | "CreditCard"
  | "UPI";

export interface Account {
  id: string;
  name: string;
  balance: number;
  color: string;
  type: AccountType;
}