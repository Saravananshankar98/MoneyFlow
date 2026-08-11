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
      }
    }
  );

export type AccountForm =
  z.infer<
    typeof accountSchema
  >;