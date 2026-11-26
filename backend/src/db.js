const pg = require("pg");
const { Pool, types } = pg;

types.setTypeParser(types.builtins.DATE, (value) => value);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS),
  statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS),
});

pool.on("error", (error) => {
  console.error("Unexpected database pool error:", error.message);
});

module.exports = { pool };
