import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from the .env file
dotenv.config();

// Define the expected environment variable structure
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DB_HOST: z.string().trim().min(1).default("localhost"),

  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),

  DB_NAME: z.string().trim().min(1),

  DB_USER: z.string().trim().min(1),

  DB_PASSWORD: z.string().min(1),
});

// Validate environment variables
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");

  console.error(
    z.prettifyError(result.error)
  );

  process.exit(1);
}

// Export a clean configuration object
const env = {
  port: result.data.PORT,
  nodeEnv: result.data.NODE_ENV,

  database: {
    host: result.data.DB_HOST,
    port: result.data.DB_PORT,
    name: result.data.DB_NAME,
    user: result.data.DB_USER,
    password: result.data.DB_PASSWORD,
  },
};

export default env;
