const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}/;

const padDateSegment = (value) => String(value).padStart(2, "0");

const getCurrentDateKey = () => {
  const now = new Date();

  return [
    now.getFullYear(),
    padDateSegment(now.getMonth() + 1),
    padDateSegment(now.getDate()),
  ].join("-");
};

const getDateKey = (value) => {
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

  return date.toISOString().slice(0, 10);
};

const parseDateKey = (value) => {
  const dateKey = getDateKey(value);

  if (!dateKey) {
    return null;
  }

  return new Date(`${dateKey}T00:00:00.000Z`);
};

const getEndOfDate = (value) => {
  const dateKey = getDateKey(value);

  if (!dateKey) {
    return null;
  }

  return new Date(`${dateKey}T23:59:59.999Z`);
};

const addDays = (value, amount) => {
  const date = parseDateKey(value);

  if (!date) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + amount);
  return date;
};

const getDayOfWeek = (value) => {
  const date = parseDateKey(value);
  return date ? date.getUTCDay() : null;
};

const getDayOfMonth = (value) => {
  const date = parseDateKey(value);
  return date ? date.getUTCDate() : null;
};

const getMonthDayKey = (value) => {
  const dateKey = getDateKey(value);
  return dateKey ? dateKey.slice(5, 10) : "";
};

const getTaskOccurrenceDateKey = (task) =>
  getDateKey(task?.dueDate || task?.startDate);

const getTaskStartDateKey = (task) =>
  getDateKey(task?.startDate) || getTaskOccurrenceDateKey(task);

const getTaskEndDateKey = (task) => getDateKey(task?.endDate);

const getCompletionDateKey = (completion) =>
  getDateKey(completion?.completedDateKey || completion?.completedAt);

const taskOccursOnDate = (task, date) => {
  const dateKey = getDateKey(date);

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

const taskOccursInRange = (task, startDate, endDate) => {
  const startDateKey = getDateKey(startDate);
  const endDateKey = getDateKey(endDate);

  if (!startDateKey || !endDateKey || endDateKey < startDateKey) {
    return false;
  }

  let cursor = parseDateKey(startDateKey);

  while (cursor) {
    const dateKey = getDateKey(cursor);

    if (dateKey > endDateKey) {
      break;
    }

    if (taskOccursOnDate(task, dateKey)) {
      return true;
    }

    cursor = addDays(cursor, 1);
  }

  return false;
};

const isTaskCompletedOnDate = (task, date) => {
  const dateKey = getDateKey(date);

  if (!task || !dateKey) {
    return false;
  }

  if (task.recurrence === "none") {
    return task.completed || task.status === "completed";
  }

  return (task.completionHistory || []).some(
    (completion) => getCompletionDateKey(completion) === dateKey
  );
};

const countTaskOccurrencesInRange = (tasks, startDate, endDate) => {
  const startDateKey = getDateKey(startDate);
  const endDateKey = getDateKey(endDate);
  let total = 0;
  let completed = 0;
  let cursor = parseDateKey(startDateKey);

  while (cursor) {
    const dateKey = getDateKey(cursor);

    if (dateKey > endDateKey) {
      break;
    }

    tasks.forEach((task) => {
      if (taskOccursOnDate(task, dateKey)) {
        total += 1;

        if (isTaskCompletedOnDate(task, dateKey)) {
          completed += 1;
        }
      }
    });

    cursor = addDays(cursor, 1);
  }

  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};

const buildOccurrenceCandidateQuery = (userId, startDate, endDate) => {
  const rangeStart = parseDateKey(startDate);
  const rangeEnd = getEndOfDate(endDate);

  return {
    ownerId: userId,
    $or: [
      {
        recurrence: "none",
        $or: [
          { dueDate: { $gte: rangeStart, $lte: rangeEnd } },
          {
            dueDate: null,
            startDate: { $gte: rangeStart, $lte: rangeEnd },
          },
        ],
      },
      {
        recurrence: { $ne: "none" },
        startDate: { $lte: rangeEnd },
        $or: [{ endDate: null }, { endDate: { $gte: rangeStart } }],
      },
    ],
  };
};

const formatDisplayDate = (value, options) => {
  const date = parseDateKey(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
};

module.exports = {
  addDays,
  buildOccurrenceCandidateQuery,
  countTaskOccurrencesInRange,
  formatDisplayDate,
  getCompletionDateKey,
  getCurrentDateKey,
  getDateKey,
  parseDateKey,
  taskOccursInRange,
  taskOccursOnDate,
  isTaskCompletedOnDate,
};
