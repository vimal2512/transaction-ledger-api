import * as transactionRepository from "./transaction.repository.js";
import Decimal from "decimal.js";
import sequelize from "../../database/sequelize.js";
import { Account, Transaction } from "../../database/models.js";
import { AppError } from "../../errors/AppError.js";

export async function createTransaction(accountId, input) {
  const amount = new Decimal(input.amount);

  if (!amount.isFinite() || amount.lte(0)) {
    throw new AppError(
      "Amount must be greater than zero",
      400,
      "INVALID_AMOUNT"
    );
  }

  if (amount.decimalPlaces() > 2) {
    throw new AppError(
      "Amount cannot have more than two decimal places",
      400,
      "INVALID_AMOUNT"
    );
  }

  const normalizedAmount = amount.toFixed(2);
  const referenceId = input.referenceId.trim();
  const description = input.description?.trim() || null;

  if (!referenceId) {
    throw new AppError(
      "Reference ID is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  try {
    return await sequelize.transaction(async (dbTransaction) => {
      const account = await Account.findByPk(accountId, {
        transaction: dbTransaction,
        lock: dbTransaction.LOCK.UPDATE,
      });

      if (!account) {
        throw new AppError(
          "Account not found",
          404,
          "ACCOUNT_NOT_FOUND"
        );
      }

      const existingTransaction = await Transaction.findOne({
        where: { accountId, referenceId },
        transaction: dbTransaction,
      });

      if (existingTransaction) {
        throw new AppError(
          "Reference ID has already been used for this account",
          409,
          "DUPLICATE_REFERENCE"
        );
      }

      const currentBalance = new Decimal(account.balance);

      let updatedBalance;

      if (input.type === "credit") {
        updatedBalance = currentBalance.plus(amount);
      } else if (input.type === "debit") {
        if (currentBalance.lt(amount)) {
          throw new AppError(
            "Insufficient account balance",
            422,
            "INSUFFICIENT_BALANCE"
          );
        }

        updatedBalance = currentBalance.minus(amount);
      } else {
        throw new AppError(
          "Transaction type must be credit or debit",
          400,
          "INVALID_TRANSACTION_TYPE"
        );
      }

      account.balance = updatedBalance.toFixed(2);

      await account.save({ transaction: dbTransaction });

      const transactionRecord = await Transaction.create(
        {
          accountId,
          type: input.type,
          amount: normalizedAmount,
          referenceId,
          description,
        },
        { transaction: dbTransaction }
      );

      return {
        transaction: transactionRecord,
        balance: updatedBalance.toFixed(2),
      };
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      throw new AppError(
        "Reference ID has already been used for this account",
        409,
        "DUPLICATE_REFERENCE"
      );
    }

    throw error;
  }
}

export async function getTransactionHistory(accountId, query) {
  const account = await Account.findByPk(accountId);

  if (!account) {
    throw new AppError(
      "Account not found",
      404,
      "ACCOUNT_NOT_FOUND"
    );
  }

  const { page, limit } = query;
  const offset = (page - 1) * limit;

  const result = await transactionRepository.findAccountTransactions(
    accountId,
    { limit, offset }
  );

  return {
    transactions: result.rows,
    pagination: {
      page,
      limit,
      totalRecords: result.count,
      totalPages: Math.ceil(result.count / limit),
    },
  };
}



export async function getAllTransactionHistory(query) {
  const { page, limit } = query;
  const offset = (page - 1) * limit;

  const result = await transactionRepository.findAllTransactions({
    limit,
    offset,
  });

  return {
    transactions: result.rows.map((transaction) => {
      const record = transaction.toJSON();

      return {
        id: record.id,
        transferId: record.transferId,
        accountId: record.accountId,
        accountName: record.account?.name ?? null,
        description: record.description,
        type: record.type,
        amount: record.amount,
        referenceId: record.referenceId,
        createdAt: record.createdAt,
      };
    }),
    pagination: {
      page,
      limit,
      totalRecords: result.count,
      totalPages: Math.ceil(result.count / limit),
    },
  };
}

