import type { PaymentType, TransactionType } from "../../transactions/types/transaction";

export type RecurringFrequency = "weekly" | "monthly";

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  details: string;
  accountId: string;
  toAccountId?: string;
  paymentType?: PaymentType;
  category?: string;
  notes?: string;
  frequency: RecurringFrequency;
  nextRunAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
