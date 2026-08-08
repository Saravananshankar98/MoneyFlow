import { z } from "zod";

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

  category: z
    .string()
    .optional(),

  notes: z
    .string()
    .optional(),

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
    .min(
      1,
      "Details are required"
    ),

  accountId: z
    .string()
    .min(
      1,
      "Please select an account"
    ),

  paymentType: z
    .string()
    .min(
      1,
      "Please select payment type"
    ),

  category: z
    .string()
    .min(
      1,
      "Please select a category"
    ),

  notes: z
    .string()
    .optional()
    .or(z.literal("")),

  date: z.string(),
});

export type IncomeForm =
  z.infer<typeof incomeSchema>;