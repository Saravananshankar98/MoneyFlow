import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Minimum 2 characters"),

  balance: z.number().min(0),

  color: z.string(),

  type: z.enum([
    "Savings",
    "Current",
    "Cash",
    "Credit Card",
    "UPI",
  ]),
});

export type AccountForm =
  z.infer<typeof accountSchema>;