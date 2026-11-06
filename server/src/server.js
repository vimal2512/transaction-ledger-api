import app from "./app.js";
import env from "./config/env.js";
import sequelize from "./database/sequelize.js";

async function startServer() {
  try {
    // Verify the database connection
    await sequelize.authenticate();

    console.log("PostgreSQL connection successful");

    // Start accepting HTTP requests
    const server = app.listen(env.port, () => {
      console.log(
        `Server running on port ${env.port} in ${env.nodeEnv} mode`
      );
    });

    return server;
  } catch (error) {
    console.error("Application startup failed:", error.message);

    await sequelize.close().catch(() => {});

    process.exitCode = 1;
  }
}

startServer();
