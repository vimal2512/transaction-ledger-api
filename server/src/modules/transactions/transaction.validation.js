import { z } from "zod";

export const createTransactionSchema = z
  .object({
    type: z.enum(["credit", "debit"]),
    amount: z
      .string()
      .trim()
      .regex(
        /^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/,
        "Amount must be a valid decimal with up to two decimal places"
      )
      .refine((value) => Number(value) > 0, {
        message: "Amount must be greater than zero",
      }),

    description: z.string()
    .trim()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),

    referenceId: z
      .string()
      .trim()
      .min(1, "Reference ID is required")
      .max(100, "Reference ID cannot exceed 100 characters"),
  })
  .strict();

export const accountIdParamSchema = z.object({
  id: z.string().uuid("Account ID must be a valid UUID"),
});



export const transactionHistoryQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});
