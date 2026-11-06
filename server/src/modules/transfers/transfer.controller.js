import { createTransfer as createTransferService } from "./transfer.service.js";

export async function createTransfer(req, res, next) {
  try {
    const result = await createTransferService(req.body);

    return res.status(201).json({
      success: true,
      message: "Transfer completed successfully",
      data: {
        transfer: result.transfer,
        balances: {
          sourceAccountBalance: result.sourceBalance,
          destinationAccountBalance: result.destinationBalance,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
