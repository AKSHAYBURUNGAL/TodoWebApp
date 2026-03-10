const Todo = require("../models/Todo");

const buildOwnerQuery = (userId) => ({ ownerId: userId });

async function getDailyCompletionPercentage(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const todos = await Todo.find({
    ...buildOwnerQuery(userId),
    startDate: { $lte: endOfDay },
    $or: [
      { dueDate: { $gte: startOfDay, $lte: endOfDay } },
      { dueDate: null, createdAt: { $lte: endOfDay } },
    ],
  });

  if (todos.length === 0) {
    return 0;
  }

  const completed = todos.filter((todo) => todo.status === "completed").length;
  return Math.round((completed / todos.length) * 100);
}

async function getCompletionPercentageRange(userId, startDate, endDate) {
  const todos = await Todo.find({
    ...buildOwnerQuery(userId),
    startDate: { $lte: endDate },
    $or: [
      { dueDate: { $gte: startDate, $lte: endDate } },
      { dueDate: null, createdAt: { $lte: endDate } },
    ],
  });

  if (todos.length === 0) {
    return 0;
  }

  const completed = todos.filter((todo) => todo.status === "completed").length;
  return Math.round((completed / todos.length) * 100);
}

async function getDailyProductivity(userId, days = 30) {
  const data = [];
  const today = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);

    const percentage = await getDailyCompletionPercentage(userId, date);

    data.push({
      date: date.toISOString().split("T")[0],
      completion: percentage,
      displayDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    });
  }

  return data;
}

async function getWeeklyProductivity(userId, weeks = 12) {
  const data = [];
  const today = new Date();

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - index * 7);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    const percentage = await getCompletionPercentageRange(userId, startDate, endDate);
    const weekNumber = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));

    data.push({
      week: `Week ${weekNumber}`,
      completion: percentage,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  }

  return data;
}

async function getMonthlyProductivity(userId, months = 12) {
  const data = [];
  const today = new Date();

  for (let index = months - 1; index >= 0; index -= 1) {
    const endDate = new Date(today.getFullYear(), today.getMonth() - index, 1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    const percentage = await getCompletionPercentageRange(userId, startDate, endDate);

    data.push({
      month: startDate.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      completion: percentage,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
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
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const todos = await Todo.find({
    ...buildOwnerQuery(userId),
    completionHistory: { $exists: true, $ne: [] },
  });

  const history = [];
  const dateMap = {};

  for (let index = 0; index < days; index += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    dateMap[date.toISOString().split("T")[0]] = 0;
  }

  todos.forEach((todo) => {
    todo.completionHistory.forEach((completion) => {
      const completedDate = new Date(completion.completedAt);

      if (completedDate >= startDate && completedDate <= today) {
        const dateKey = completedDate.toISOString().split("T")[0];

        if (dateMap[dateKey] !== undefined) {
          dateMap[dateKey] += 1;
        }
      }
    });
  });

  Object.keys(dateMap)
    .sort()
    .forEach((date) => {
      history.push({
        date,
        tasksCompleted: dateMap[date],
        displayDate: new Date(date).toLocaleDateString("en-US", {
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
