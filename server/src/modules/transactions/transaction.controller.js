import * as transactionService from "./transaction.service.js";

export async function createTransaction(req, res, next) {
  try {
    const result = await transactionService.createTransaction(
      req.params.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.transaction.id,
        accountId: result.transaction.accountId,
        type: result.transaction.type,
        amount: result.transaction.amount,
        referenceId: result.transaction.referenceId,
        description: result.transaction.description,
        balance: result.balance,
        createdAt: result.transaction.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionHistory(req, res, next) {
  try {
    const result = await transactionService.getTransactionHistory(
      req.params.id,
      res.locals.validatedQuery
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}



export async function getAllTransactions(req, res, next) {
  try {
    const result = await transactionService.getAllTransactionHistory(
      res.locals.validatedQuery
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
