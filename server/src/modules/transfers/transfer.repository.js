import { Transfer } from "../../database/models.js";

export function createTransfer(transferData, options = {}) {
  return Transfer.create(transferData, options);
}

export function findTransferByReference(referenceId, options = {}) {
  return Transfer.findOne({
    where: { referenceId },
    ...options,
  });
}
