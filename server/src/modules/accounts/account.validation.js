import { z } from "zod";

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account name is required")
    .max(100, "Account name cannot exceed 100 characters"),
}).strict();

export const accountIdParamSchema = z.object({
  id: z.string().uuid("Account ID must be a valid UUID"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
