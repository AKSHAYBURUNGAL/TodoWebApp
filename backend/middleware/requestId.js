/**
 * Request ID Middleware
 * Adds a unique request ID for tracking purposes
 */

const crypto = require("crypto");

const requestId = (req, res, next) => {
  // Generate unique request ID
  req.id = crypto.randomUUID();

  // Add request ID to response headers
  res.setHeader("X-Request-ID", req.id);

  next();
};

module.exports = requestId;
