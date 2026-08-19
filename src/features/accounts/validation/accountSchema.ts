import { z } from "zod";

export const accountTypes = [
  "Savings",
  "Current",
  "Cash",
  "Credit Card",
  "Wallet",
  "Investment",
  "Loan",
  "UPI",
  "Other",
] as const;

export const accountSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        1,
        "Account name is required"
      ),

    balance: z
      .number()
      .min(
        0,
        "Balance cannot be negative"
      ),

    color: z
      .string()
      .min(
        1,
        "Color is required"
      ),

    type: z.enum(
      accountTypes
    ),

    creditLimit: z
      .number()
      .min(
        0,
        "Credit limit cannot be negative"
      ),

    outstanding: z
      .number()
      .min(
        0,
        "Outstanding cannot be negative"
      ),

    billingCycleStartDay: z
      .number()
      .int("Billing start day must be a whole number")
      .min(1, "Billing start day must be between 1 and 31")
      .max(31, "Billing start day must be between 1 and 31"),

    billingCycleEndDay: z
      .number()
      .int("Billing end day must be a whole number")
      .min(1, "Billing end day must be between 1 and 31")
      .max(31, "Billing end day must be between 1 and 31"),

    dueDateDay: z
      .number()
      .int("Due date day must be a whole number")
      .min(1, "Due date day must be between 1 and 31")
      .max(31, "Due date day must be between 1 and 31"),
  })
  .superRefine(
    (data, ctx) => {
      if (
        data.type ===
        "Credit Card"
      ) {
        if (
          data.creditLimit <=
          0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode
              .custom,
            path: [
              "creditLimit",
            ],
            message:
              "Credit limit is required.",
          });
        }

        if (
          data.outstanding >
          data.creditLimit
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode
              .custom,
            path: [
              "outstanding",
            ],
            message:
              "Outstanding cannot exceed credit limit.",
          });
        }

        if (
          data.billingCycleStartDay ===
          data.billingCycleEndDay
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode
              .custom,
            path: [
              "billingCycleEndDay",
            ],
            message:
              "Billing cycle start and end days must be different.",
          });
        }
      }
    }
  );

export type AccountForm =
  z.infer<
    typeof accountSchema
  >;
