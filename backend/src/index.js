require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { pool } = require("./db.js");
const expensesRouter = require("./routes/expenses.js");
const reportRouter = require("./routes/reports/index.js");
const apiRateLimiter = require("./middleware/ratelimit.js");
const globalErrorHandler = require("./middleware/errorHandler.js");

const app = express();
app.disable("x-powered-by");

const trustProxy = Number(process.env.TRUST_PROXY);
if (trustProxy > 0) {
  app.set("trust proxy", trustProxy);
}

const port = Number(process.env.PORT) || 3000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split()
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  }),
);
app.use("/api/", apiRateLimiter);
app.use(express.json({ limit: "10kb" }));

app.get("/db/health-check", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "up" });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(503).json({ status: "error", database: "down" });
  }
});

app.use("/api/expenses", expensesRouter);
app.use("/api/reports", reportRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use(globalErrorHandler);

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});
