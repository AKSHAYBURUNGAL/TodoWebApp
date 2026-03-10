const TODO_PRIORITIES = ["low", "medium", "high"];
const TODO_STATUSES = ["pending", "completed"];
const TODO_RECURRENCES = ["none", "daily", "weekly", "monthly", "yearly"];

const DEFAULT_TODO_PRIORITY = "medium";
const DEFAULT_TODO_STATUS = "pending";
const DEFAULT_TODO_RECURRENCE = "none";
const DEFAULT_TODO_CATEGORY = "general";

module.exports = {
  DEFAULT_TODO_CATEGORY,
  DEFAULT_TODO_PRIORITY,
  DEFAULT_TODO_RECURRENCE,
  DEFAULT_TODO_STATUS,
  TODO_PRIORITIES,
  TODO_RECURRENCES,
  TODO_STATUSES,
};
