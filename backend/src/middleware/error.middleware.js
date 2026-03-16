const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  console.error("[api:error]", {
    statusCode,
    message: error.message,
    details: error.details || null,
    stack: error.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    details: error.details || null
  });
};

module.exports = { errorHandler };
