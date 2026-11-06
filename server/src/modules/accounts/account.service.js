import * as accountRepository from "./account.repository.js";
import { AppError } from "../../errors/AppError.js";

export async function createAccount(accountData) {
  const name = accountData.name.trim();

  if (!name) {
    throw new AppError(
      "Account name is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (name.length > 100) {
    throw new AppError(
      "Account name cannot exceed 100 characters",
      400,
      "VALIDATION_ERROR"
    );
  }

  return accountRepository.createAccount({
    name,
    balance: "0.00",
  });
}

export async function getAccountById(id) {
  const account = await accountRepository.findAccountById(id);

  if (!account) {
    throw new AppError(
      "Account not found",
      404,
      "ACCOUNT_NOT_FOUND"
    );
  }

  return account;
}

export async function getAllAccounts() {
  return accountRepository.findAllAccounts({
    order: [["createdAt", "DESC"]],
  });
}


export async function getPaginatedAccounts(query) {
  const { page, limit } = query;
  const offset = (page - 1) * limit;

  const result = await accountRepository.findPaginatedAccounts({
    limit,
    offset,
  });

  return {
    accounts: result.rows,
    pagination: {
      page,
      limit,
      totalRecords: result.count,
      totalPages: Math.ceil(result.count / limit),
    },
  };
}



export async function getAccountSummary() {
  return accountRepository.getAccountSummary();
}
