const {
  BODY_PARSES_ERROR_TYPES,
  DB_ERROR_CODES,
  ERROR_RESPONSES,
} = require("../errors/errorRegistry.js");

const globalErrorHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  if (BODY_PARSES_ERROR_TYPES.has(error.type)) {
    const { status, message } = ERROR_RESPONSES[error.type];
    return res.status(status).json({ error: message });
  }

  const status = Number(error.status ?? error.statusCode);

  if (status >= 400 && status < 500) {
    return res.status(status).json({
      error: error.message || "Invalid request.",
      details: error.details,
    });
  }

  if (DB_ERROR_CODES.has(error.code)) {
    const { status, message } = ERROR_RESPONSES[error.code];
    return res.status(status).json({ error: message });
  }

  res.status(500).json({ error: "Internal Server Error" });
};

module.exports = globalErrorHandler;
