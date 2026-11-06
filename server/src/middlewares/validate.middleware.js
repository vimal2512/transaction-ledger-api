import { AppError } from "../errors/AppError.js";

export function validate(schema, property = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(
        new AppError(
          "Request validation failed",
          400,
          "VALIDATION_ERROR",
          details
        )
      );
    }

    if (property === "query") {
      // Express 5: req.query is getter-only.
      res.locals.validatedQuery = result.data;
    } else {
      req[property] = result.data;
    }

    next();
  };
}
