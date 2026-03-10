const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}/;

const padDateSegment = (value) => String(value).padStart(2, "0");

export const formatLocalDate = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && DATE_KEY_PATTERN.test(value)) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    padDateSegment(date.getMonth() + 1),
    padDateSegment(date.getDate()),
  ].join("-");
};

export const parseDateKey = (value) => {
  const dateKey = formatLocalDate(value);

  if (!dateKey) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const getDateInputValue = (value) => (value ? formatLocalDate(value) : "");

const getCompletionDateKey = (record) =>
  formatLocalDate(record?.completedDateKey || record?.completedAt);

const getTaskOccurrenceDateKey = (task) =>
  formatLocalDate(task?.dueDate || task?.startDate);

const getTaskStartDateKey = (task) =>
  formatLocalDate(task?.startDate) || getTaskOccurrenceDateKey(task);

const getTaskEndDateKey = (task) => formatLocalDate(task?.endDate);

const getDayOfWeek = (value) => {
  const date = parseDateKey(value);
  return date ? date.getDay() : null;
};

const getDayOfMonth = (value) => {
  const date = parseDateKey(value);
  return date ? date.getDate() : null;
};

const getMonthDayKey = (value) => {
  const dateKey = formatLocalDate(value);
  return dateKey ? dateKey.slice(5, 10) : "";
};

export const taskOccursOnDate = (task, date) => {
  const dateKey = formatLocalDate(date);

  if (!task || !dateKey) {
    return false;
  }

  const startDateKey = getTaskStartDateKey(task);
  const endDateKey = getTaskEndDateKey(task);

  if (startDateKey && dateKey < startDateKey) {
    return false;
  }

  if (endDateKey && dateKey > endDateKey) {
    return false;
  }

  switch (task.recurrence) {
    case "daily":
      return true;
    case "weekly": {
      const fallbackDay = getDayOfWeek(startDateKey);
      const recurrenceDays =
        Array.isArray(task.recurrenceDays) && task.recurrenceDays.length > 0
          ? task.recurrenceDays
          : fallbackDay === null
            ? []
            : [fallbackDay];

      return recurrenceDays.includes(getDayOfWeek(dateKey));
    }
    case "monthly":
      return getDayOfMonth(startDateKey) === getDayOfMonth(dateKey);
    case "yearly":
      return getMonthDayKey(startDateKey) === getMonthDayKey(dateKey);
    case "none":
    default:
      return getTaskOccurrenceDateKey(task) === dateKey;
  }
};

export const getTaskStatusForDate = (task, date) => {
  const dateKey = formatLocalDate(date);

  if (!task || !dateKey) {
    return "pending";
  }

  if (task.recurrence === "none") {
    return task.completed || task.status === "completed" ? "completed" : "pending";
  }

  const completedOnDate = (task.completionHistory || []).some(
    (record) => getCompletionDateKey(record) === dateKey
  );

  return completedOnDate ? "completed" : "pending";
};
