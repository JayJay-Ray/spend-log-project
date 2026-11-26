const { rateLimit } = require("express-rate-limit");

function positiveInteger(value, fallback) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const apiRateLimiter = rateLimit({
  windowMs: positiveInteger(process.env.RATE_LIMIT_WINDOWS_MS, 60_000),
  limit: positiveInteger(process.env.RATE_LIMIT_MAX, 100),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  handler: (_req, res, _next, options) => {
    res
      .status(options.statusCode)
      .json({ error: "Too many requests. Please try again later." });
  },
});

module.exports = apiRateLimiter;
