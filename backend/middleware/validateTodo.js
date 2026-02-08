/**
 * Request Validation Middleware
 * Validates todo data before processing
 */

const validateTodo = (req, res, next) => {
  // Only validate on POST and PUT requests (skip GET, DELETE)
  if (req.method !== "POST" && req.method !== "PUT") {
    return next();
  }

  const { text, priority, category, dueDate } = req.body || {};
  const errors = [];

  // Validate text (title) - required for POST
  if (req.method === "POST" && (!text || !text.trim())) {
    errors.push("Todo title is required");
  }

  // Validate priority
  if (priority && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be 'low', 'medium', or 'high'");
  }

  // Validate category
  if (category && !["general", "work", "personal", "shopping"].includes(category)) {
    errors.push("Category must be 'general', 'work', 'personal', or 'shopping'");
  }

  // Validate due date format
  if (dueDate && isNaN(new Date(dueDate).getTime())) {
    errors.push("Invalid date format for dueDate");
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }

  next();
};

module.exports = validateTodo;
