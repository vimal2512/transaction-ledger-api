import { Transaction, Account } from "../../database/models.js";

export function createTransaction(transactionData, options = {}) {
  return Transaction.create(transactionData, options);
}

export function findByAccountAndReference(
  accountId,
  referenceId,
  options = {}
) {
  return Transaction.findOne({
    where: { accountId, referenceId },
    ...options,
  });
}

export function findAccountTransactions(
  accountId,
  { limit, offset, transaction } = {}
) {
  return Transaction.findAndCountAll({
    where: { accountId },
    limit,
    offset,
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    transaction,
  });
}

// Fetch transactions across all accounts.
export function findAllTransactions({ limit, offset } = {}) {
  return Transaction.findAndCountAll({
    attributes: [
      "id",
      "transferId",
      "accountId",
      "description",
      "type",
      "amount",
      "referenceId",
      "createdAt",
    ],
    include: [
      {
        model: Account,
        as: "account",
        attributes: ["id", "name"],
        required: true,
      },
    ],
    limit,
    offset,
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    distinct: true,
  });
}
