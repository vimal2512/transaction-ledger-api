import * as accountService from "./account.service.js";

export async function createAccount(req, res, next) {
  try {
    const account = await accountService.createAccount(req.body);

    return res.status(201).json({
      success: true,
      data: {
        id: account.id,
        name: account.name,
        balance: account.balance,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAccountById(req, res, next) {
  try {
    const account = await accountService.getAccountById(req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        id: account.id,
        name: account.name,
        balance: account.balance,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllAccounts(req, res, next) {
  try {
    const accounts = await accountService.getAllAccounts();

    return res.status(200).json({
      success: true,
      data: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        createdAt: account.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}



export async function getPaginatedAccounts(req, res, next) {
  try {
    const result = await accountService.getPaginatedAccounts(
      res.locals.validatedQuery
    );

    return res.status(200).json({
      success: true,
      data: {
        accounts: result.accounts.map((account) => ({
          id: account.id,
          name: account.name,
          balance: account.balance,
          createdAt: account.createdAt,
        })),
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}



export async function getAccountSummary(req, res, next) {
  try {
    const summary = await accountService.getAccountSummary();

    return res.status(200).json({
      success: true,
      data: {
        totalAccounts: Number(summary.totalAccounts),
        totalBalance: String(summary.totalBalance),
      },
    });
  } catch (error) {
    next(error);
  }
}
