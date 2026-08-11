import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .or(z.literal(""));

export const expenseSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  details: z
    .string()
    .trim()
    .min(1, "Details are required"),

  accountId: z
    .string()
    .min(1, "Account is required"),

  paymentType: z
    .string()
    .min(1, "Payment type is required"),

  category: optionalText,

  notes: optionalText,

  attachmentUri: optionalText,

  attachmentName: optionalText,

  date: z
    .string()
    .min(1, "Date is required"),
});

export type ExpenseForm = z.infer<
  typeof expenseSchema
>;

export const incomeSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  details: z
    .string()
    .trim()
    .min(1, "Details are required"),

  accountId: z
    .string()
    .min(1, "Please select an account"),

  paymentType: z
    .string()
    .min(1, "Please select payment type"),

  category: z
    .string()
    .min(1, "Please select a category"),

  notes: optionalText,

  attachmentUri: optionalText,

  attachmentName: optionalText,

  date: z
    .string()
    .min(1, "Date is required"),
});

export type IncomeForm =
  z.infer<typeof incomeSchema>;

export const transferSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  details: z
    .string()
    .trim()
    .min(1, "Details are required"),

  accountId: z
    .string()
    .min(1, "From account is required"),

  toAccountId: z
    .string()
    .min(1, "To account is required"),

  notes: optionalText,

  date: z
    .string()
    .min(1, "Date is required"),
}).refine(
  (value) =>
    value.accountId !== value.toAccountId,
  {
    message:
      "Choose two different accounts",
    path: ["toAccountId"],
  }
);

export type TransferForm =
  z.infer<typeof transferSchema>;
