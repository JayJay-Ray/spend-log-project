function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || source,
        message: issue.message,
      }));
      return next(error);
    }

    req.validated = req.validated || {};
    req.validated[source] = result.data;

    next();
  };
}

module.exports = validate;
