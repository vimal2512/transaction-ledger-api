import { AppError } from "../errors/AppError.js";

export function errorMiddleware(err, req, res, next) {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;

  const code = isAppError
    ? err.code
    : "INTERNAL_SERVER_ERROR";

  const message = isAppError
    ? err.message
    : "An unexpected error occurred";

  if (!isAppError) {
    console.error(err);
  }

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (isAppError && err.details) {
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
}
