
import { Router } from "express";
import {
  createTransaction,
  getTransactionHistory,
  getAllTransactions,
} from "./transaction.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createTransactionSchema,
  accountIdParamSchema,
  transactionHistoryQuerySchema,
} from "./transaction.validation.js";

const router = Router();

// GET all transactions across all accounts
router.get(
  "/",
  validate(transactionHistoryQuerySchema, "query"),
  getAllTransactions
);

// Create a transaction for a specific account
router.post(
  "/:id/transactions",
  validate(accountIdParamSchema, "params"),
  validate(createTransactionSchema),
  createTransaction
);

// Get transaction history for a specific account
router.get(
  "/:id/transactions",
  validate(accountIdParamSchema, "params"),
  validate(transactionHistoryQuerySchema, "query"),
  getTransactionHistory
);

export default router;
