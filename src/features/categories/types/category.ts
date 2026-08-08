export type CategoryType =
  | "expense"
  | "income"
  | "both";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}