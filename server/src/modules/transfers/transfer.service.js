import Decimal from "decimal.js";
import { Transaction as DbTransaction } from "sequelize";

import sequelize from "../../database/sequelize.js";
import { Account, Transaction, Transfer } from "../../database/models.js";
import { AppError } from "../../errors/AppError.js";
import {
  createTransfer as saveTransfer,
  findTransferByReference,
} from "./transfer.repository.js";

export async function createTransfer(input) {
  const {
    sourceAccountId,
    destinationAccountId,
    amount,
    referenceId,
  } = input;

  const transferAmount = new Decimal(amount);

 if (transferAmount.decimalPlaces() > 2) {
  throw new AppError(
    "Transfer amount cannot have more than two decimal places",
    400,
    "INVALID_AMOUNT"
  );
}

  try {
    return await sequelize.transaction(async (dbTransaction) => {
      // Lock accounts in a consistent order to reduce deadlock risk.
      const accountIds = [
        sourceAccountId,
        destinationAccountId,
      ].sort();

      const lockedAccounts = new Map();

      for (const accountId of accountIds) {
        const account = await Account.findByPk(accountId, {
          transaction: dbTransaction,
          lock: DbTransaction.LOCK.UPDATE,
        });

        if (account) {
          lockedAccounts.set(accountId, account);
        }
      }

      const sourceAccount = lockedAccounts.get(sourceAccountId);
      const destinationAccount = lockedAccounts.get(destinationAccountId);

      if (!sourceAccount) {
        throw new AppError(
          "Source account not found",
          404,
          "SOURCE_ACCOUNT_NOT_FOUND"
        );
      }

      if (!destinationAccount) {
        throw new AppError(
          "Destination account not found",
          404,
          "DESTINATION_ACCOUNT_NOT_FOUND"
        );
      }

      // Check whether this transfer reference was already used.
      const existingTransfer = await findTransferByReference(
        referenceId,
        { transaction: dbTransaction }
      );

      if (existingTransfer) {
        throw new AppError(
          "Transfer reference ID has already been used",
          409,
          "DUPLICATE_TRANSFER_REFERENCE"
        );
      }

      const sourceBalance = new Decimal(sourceAccount.balance);
      const destinationBalance = new Decimal(destinationAccount.balance);

      if (sourceBalance.lessThan(transferAmount)) {
        throw new AppError(
          "Insufficient account balance",
          422,
          "INSUFFICIENT_BALANCE"
        );
      }

      // Calculate balances without JavaScript floating-point arithmetic.
      const newSourceBalance = sourceBalance.minus(transferAmount);
      const newDestinationBalance =
        destinationBalance.plus(transferAmount);

      // Create the main transfer record.
      const transfer = await saveTransfer(
        {
          sourceAccountId,
          destinationAccountId,
          amount: transferAmount.toFixed(2),
          referenceId,
        },
        { transaction: dbTransaction }
      );

      // Update both accounts in the same database transaction.
      sourceAccount.balance = newSourceBalance.toFixed(2);
      destinationAccount.balance = newDestinationBalance.toFixed(2);

      await sourceAccount.save({ transaction: dbTransaction });
      await destinationAccount.save({ transaction: dbTransaction });

      // Create the debit entry.
      await Transaction.create(
        {
          accountId: sourceAccountId,
          type: "debit",
          amount: transferAmount.toFixed(2),
          referenceId: `TRF-${transfer.id}-DEBIT`,
          transferId: transfer.id,
        },
        { transaction: dbTransaction }
      );

      // Create the credit entry.
      await Transaction.create(
        {
          accountId: destinationAccountId,
          type: "credit",
          amount: transferAmount.toFixed(2),
          referenceId: `TRF-${transfer.id}-CREDIT`,
          transferId: transfer.id,
        },
        { transaction: dbTransaction }
      );

      return {
        transfer,
        sourceBalance: newSourceBalance.toFixed(2),
        destinationBalance: newDestinationBalance.toFixed(2),
      };
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // The database unique constraint also protects against simultaneous
    // requests using the same reference ID.
    if (
      error.name === "SequelizeUniqueConstraintError" &&
      error.parent?.constraint === "transfers_reference_unique"
    ) {
      throw new AppError(
        "Transfer reference ID has already been used",
        409,
        "DUPLICATE_TRANSFER_REFERENCE"
      );
    }

    throw error;
  }
}
