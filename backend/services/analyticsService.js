const Todo = require("../models/Todo");

/**
 * Get daily completion percentage for a specific date
 */
async function getDailyCompletionPercentage(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const todos = await Todo.find({
    userId,
    startDate: { $lte: endOfDay },
    $or: [
      { dueDate: { $gte: startOfDay, $lte: endOfDay } },
      { dueDate: null, createdAt: { $lte: endOfDay } }
    ]
  });

  if (todos.length === 0) return 0;

  const completed = todos.filter(t => t.status === "completed").length;
  return Math.round((completed / todos.length) * 100);
}

/**
 * Get completion percentage for a date range
 */
async function getCompletionPercentageRange(userId, startDate, endDate) {
  const todos = await Todo.find({
    userId,
    startDate: { $lte: endDate },
    $or: [
      { dueDate: { $gte: startDate, $lte: endDate } },
      { dueDate: null, createdAt: { $lte: endDate } }
    ]
  });

  if (todos.length === 0) return 0;

  const completed = todos.filter(t => t.status === "completed").length;
  return Math.round((completed / todos.length) * 100);
}

/**
 * Get daily productivity data for the last N days
 */
async function getDailyProductivity(userId, days = 30) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const percentage = await getDailyCompletionPercentage(userId, date);

    data.push({
      date: date.toISOString().split("T")[0],
      completion: percentage,
      displayDate: date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      })
    });
  }

  return data;
}

/**
 * Get weekly productivity data for the last N weeks
 */
async function getWeeklyProductivity(userId, weeks = 12) {
  const data = [];
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - i * 7);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    const percentage = await getCompletionPercentageRange(userId, startDate, endDate);
    const weekNumber = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));

    data.push({
      week: `Week ${weekNumber}`,
      completion: percentage,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0]
    });
  }

  return data;
}

/**
 * Get monthly productivity data for the last N months
 */
async function getMonthlyProductivity(userId, months = 12) {
  const data = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const endDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const percentage = await getCompletionPercentageRange(userId, startDate, endDate);

    data.push({
      month: startDate.toLocaleDateString("en-US", { 
        month: "short", 
        year: "2-digit" 
      }),
      completion: percentage,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0]
    });
  }

  return data;
}

/**
 * Get total task statistics
 */
async function getTaskStatistics(userId) {
  const todos = await Todo.find({ userId });

  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.status === "completed").length;
  const pendingTasks = todos.filter(t => t.status === "pending").length;

  const byPriority = {
    low: todos.filter(t => t.priority === "low").length,
    medium: todos.filter(t => t.priority === "medium").length,
    high: todos.filter(t => t.priority === "high").length
  };

  const byStatus = {
    completed: completedTasks,
    pending: pendingTasks
  };

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionPercentage: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    byPriority,
    byStatus
  };
}

/**
 * Get task completion history for the last N days
 */
async function getCompletionHistory(userId, days = 30) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const todos = await Todo.find({
    userId,
    completionHistory: { $exists: true, $ne: [] }
  });

  const history = [];
  const dateMap = {};

  // Initialize date map
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dateMap[dateStr] = 0;
  }

  // Count completions per day
  todos.forEach(todo => {
    todo.completionHistory.forEach(completion => {
      const completedDate = new Date(completion.completedAt);
      if (completedDate >= startDate && completedDate <= today) {
        const dateStr = completedDate.toISOString().split("T")[0];
        if (dateMap[dateStr] !== undefined) {
          dateMap[dateStr]++;
        }
      }
    });
  });

  // Convert to array sorted by date
  Object.keys(dateMap)
    .sort()
    .forEach(date => {
      history.push({
        date,
        tasksCompleted: dateMap[date],
        displayDate: new Date(date).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        })
      });
    });

  return history;
}

/**
 * Get overview dashboard data
 */
async function getDashboardOverview(userId) {
  const stats = await getTaskStatistics(userId);
  const dailyData = await getDailyProductivity(userId, 7);
  const weeklyData = await getWeeklyProductivity(userId, 4);
  const monthlyData = await getMonthlyProductivity(userId, 12);
  const completionHistory = await getCompletionHistory(userId, 30);

  return {
    statistics: stats,
    dailyTrends: dailyData,
    weeklyTrends: weeklyData,
    monthlyTrends: monthlyData,
    completionHistory
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
  getDashboardOverview
};
