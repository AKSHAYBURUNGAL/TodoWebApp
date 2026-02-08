/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error status and message
  let statusCode = 500;
  let message = "Internal server error";

  // MongoDB validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(", ");
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  // MongoDB cast error (invalid ID format)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  res.status(statusCode).json({
    error: message,
    status: statusCode
  });
};

module.exports = errorHandler;
