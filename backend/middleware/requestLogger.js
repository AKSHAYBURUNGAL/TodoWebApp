/**
 * Request Logger Middleware
 * Logs all incoming requests with timestamp and method
 */

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;

  console.log(`[${timestamp}] ${method} ${path}`);
  next();
};

module.exports = requestLogger;
