import { Router } from "express";
import {
  createAccount,
  getAccountById,
  getAllAccounts,
  getPaginatedAccounts,
  getAccountSummary,
} from "./account.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createAccountSchema,
  accountIdParamSchema,
  paginationQuerySchema,
} from "./account.validation.js";

const router = Router();

router.post("/", validate(createAccountSchema), createAccount);

router.get(
  "/",
  validate(paginationQuerySchema, "query"),
  getPaginatedAccounts
);

router.get("/summary", getAccountSummary);

// Used by the transfer form to load all accounts
router.get("/all", getAllAccounts);

router.get(
  "/:id",
  validate(accountIdParamSchema, "params"),
  getAccountById
);

export default router;
