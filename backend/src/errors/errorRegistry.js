const BODY_PARSES_ERROR_TYPES = new Set([
  "entity.parse.failed",
  "entity.too.large",
]);

const DB_ERROR_CODES = new Set(["23514", "22003", "22P02", "22007", "22008"]);

const ERROR_RESPONSES = {
  "entity.parse.failed": { status: 400, message: "Invalid JSON body." },
  "entity.too.large": { status: 413, message: "Request body too large." },
  23514: { status: 400, message: "Value violates a database constraint." },
  22003: { status: 400, message: "Numeric value is out of range." },
  "22P02": { status: 400, message: "Invalid input value." },
  22007: { status: 400, message: "Invalid expense date." },
  22008: { status: 400, message: "Invalid expense date." },
};

module.exports = {
  BODY_PARSES_ERROR_TYPES,
  DB_ERROR_CODES,
  ERROR_RESPONSES,
};
