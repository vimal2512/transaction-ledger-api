import express from "express";
import helmet from "helmet";
import cors from "cors";
import accountRoutes from "./modules/accounts/account.routes.js"
import transactionRoutes from "./modules/transactions/transaction.routes.js";
import transferRoutes from "./modules/transfers/transfer.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";


const app = express();

// Security-related HTTP headers
app.use(helmet());

// Allow frontend requests from configured origins.
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json({ limit: "1mb" }));

// Temporary health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Application is running",
  });
});

app.use("/api/accounts", accountRoutes);
app.use("/api/accounts", transactionRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(errorMiddleware);

export default app;
