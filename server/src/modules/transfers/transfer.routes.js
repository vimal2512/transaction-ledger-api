import { Router } from "express";

import { createTransfer } from "./transfer.controller.js";
import { createTransferSchema } from "./transfer.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.post(
  "/",
  validate(createTransferSchema),
  createTransfer
);

export default router;
