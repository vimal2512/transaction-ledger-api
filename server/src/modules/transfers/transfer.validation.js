import { z } from "zod";

export const createTransferSchema = z
  .object({
    sourceAccountId: z
      .string()
      .uuid("Source account ID must be a valid UUID"),

    destinationAccountId: z
      .string()
      .uuid("Destination account ID must be a valid UUID"),

    amount: z
      .string()
      .trim()
      .regex(
        /^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/,
        "Amount must be a valid decimal with up to two decimal places"
      )
      .refine((value) => /[1-9]/.test(value), {
        message: "Amount must be greater than zero",
      }),

    referenceId: z
      .string()
      .trim()
      .min(1, "Reference ID is required")
      .max(100, "Reference ID cannot exceed 100 characters"),
  })
  .strict()
  .refine(
    (data) => data.sourceAccountId !== data.destinationAccountId,
    {
      message: "Source and destination accounts must be different",
      path: ["destinationAccountId"],
    }
  );
