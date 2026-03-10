const Todo = require("../models/Todo");
const {
  addDays,
  buildOccurrenceCandidateQuery,
  countTaskOccurrencesInRange,
  formatDisplayDate,
  getCompletionDateKey,
  getCurrentDateKey,
  getDateKey,
  taskOccursInRange,
} = require("../utils/taskSchedule");

const buildOwnerQuery = (userId) => ({ ownerId: userId });

async function getTasksForRange(userId, startDate, endDate) {
  const todos = await Todo.find(
    buildOccurrenceCandidateQuery(userId, startDate, endDate)
  );

  return todos.filter((todo) => taskOccursInRange(todo, startDate, endDate));
}

async function getDailyCompletionPercentage(userId, date) {
  const dateKey = getDateKey(date);

  if (!dateKey) {
    return 0;
  }

  const todos = await getTasksForRange(userId, dateKey, dateKey);
  return countTaskOccurrencesInRange(todos, dateKey, dateKey).percentage;
}

async function getCompletionPercentageRange(userId, startDate, endDate) {
  const startDateKey = getDateKey(startDate);
  const endDateKey = getDateKey(endDate);

  if (!startDateKey || !endDateKey) {
    return 0;
  }

  const todos = await getTasksForRange(userId, startDateKey, endDateKey);
  return countTaskOccurrencesInRange(todos, startDateKey, endDateKey).percentage;
}

async function getDailyProductivity(userId, days = 30) {
  const data = [];
  const today = getCurrentDateKey();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = addDays(today, -index);
    const dateKey = getDateKey(date);
    const percentage = await getDailyCompletionPercentage(userId, dateKey);

    data.push({
      date: dateKey,
      completion: percentage,
      displayDate: formatDisplayDate(dateKey, {
        month: "short",
        day: "numeric",
      }),
    });
  }

  return data;
}

async function getWeeklyProductivity(userId, weeks = 12) {
  const data = [];
  const today = getCurrentDateKey();

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const endDate = addDays(today, -(index * 7));
    const startDate = addDays(endDate, -6);
    const percentage = await getCompletionPercentageRange(userId, startDate, endDate);
    const startDateKey = getDateKey(startDate);
    const endDateKey = getDateKey(endDate);

    data.push({
      week: formatDisplayDate(startDateKey, {
        month: "short",
        day: "numeric",
      }),
      completion: percentage,
      startDate: startDateKey,
      endDate: endDateKey,
    });
  }

  return data;
}

async function getMonthlyProductivity(userId, months = 12) {
  const data = [];
  const today = new Date();

  for (let index = months - 1; index >= 0; index -= 1) {
    const startDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - index, 1)
    );
    const endDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - index + 1, 0)
    );
    const percentage = await getCompletionPercentageRange(userId, startDate, endDate);
    const startDateKey = getDateKey(startDate);
    const endDateKey = getDateKey(endDate);

    data.push({
      month: formatDisplayDate(startDateKey, {
        month: "short",
        year: "2-digit",
      }),
      completion: percentage,
      startDate: startDateKey,
      endDate: endDateKey,
    });
  }

  return data;
}

async function getTaskStatistics(userId) {
  const todos = await Todo.find(buildOwnerQuery(userId));

  const totalTasks = todos.length;
  const completedTasks = todos.filter((todo) => todo.status === "completed").length;
  const pendingTasks = todos.filter((todo) => todo.status === "pending").length;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionPercentage:
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    byPriority: {
      low: todos.filter((todo) => todo.priority === "low").length,
      medium: todos.filter((todo) => todo.priority === "medium").length,
      high: todos.filter((todo) => todo.priority === "high").length,
    },
    byStatus: {
      completed: completedTasks,
      pending: pendingTasks,
    },
  };
}

async function getCompletionHistory(userId, days = 30) {
  const today = getCurrentDateKey();
  const startDate = addDays(today, -(days - 1));
  const startDateKey = getDateKey(startDate);
  const todos = await Todo.find({
    ...buildOwnerQuery(userId),
    completionHistory: { $exists: true, $ne: [] },
  });

  const history = [];
  const dateMap = {};

  for (let index = 0; index < days; index += 1) {
    const date = addDays(today, -index);
    const dateKey = getDateKey(date);
    dateMap[dateKey] = 0;
  }

  todos.forEach((todo) => {
    todo.completionHistory.forEach((completion) => {
      const dateKey = getCompletionDateKey(completion);

      if (
        dateKey &&
        dateKey >= startDateKey &&
        dateKey <= today &&
        dateMap[dateKey] !== undefined
      ) {
        dateMap[dateKey] += 1;
      }
    });
  });

  Object.keys(dateMap)
    .sort()
    .forEach((date) => {
      history.push({
        date,
        tasksCompleted: dateMap[date],
        displayDate: formatDisplayDate(date, {
          month: "short",
          day: "numeric",
        }),
      });
    });

  return history;
}

async function getDashboardOverview(userId) {
  const statistics = await getTaskStatistics(userId);
  const dailyTrends = await getDailyProductivity(userId, 7);
  const weeklyTrends = await getWeeklyProductivity(userId, 4);
  const monthlyTrends = await getMonthlyProductivity(userId, 12);
  const completionHistory = await getCompletionHistory(userId, 30);

  return {
    statistics,
    dailyTrends,
    weeklyTrends,
    monthlyTrends,
    completionHistory,
  };
}

module.exports = {
  getDailyCompletionPercentage,
  getCompletionPercentageRange,
  getDailyProductivity,
  getWeeklyProductivity,
  getMonthlyProductivity,
  getTaskStatistics,
  getCompletionHistory,
  getDashboardOverview,
};
