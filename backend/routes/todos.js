const router = require("express").Router();
const { randomUUID } = require("crypto");
const Todo = require("../models/Todo");
const analyticsService = require("../services/analyticsService");
const {
  addDays,
  buildOccurrenceCandidateQuery,
  getCompletionDateKey,
  getCurrentDateKey,
  getDateKey,
  parseDateKey,
  taskOccursInRange,
  taskOccursOnDate,
} = require("../utils/taskSchedule");

const sendError = (res, message, statusCode = 500) => {
  console.error("Error:", message);
  return res.status(statusCode).json({ error: message });
};

const buildOwnerQuery = (userId) => ({ ownerId: userId });

const findOwnedTodoById = (todoId, userId) =>
  Todo.findOne({ _id: todoId, ...buildOwnerQuery(userId) });

const findTasksForRange = async (userId, startDate, endDate) => {
  const todos = await Todo.find(
    buildOccurrenceCandidateQuery(userId, startDate, endDate)
  ).sort({
    dueDate: 1,
    priority: -1,
  });

  return todos.filter((todo) => taskOccursInRange(todo, startDate, endDate));
};

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find(buildOwnerQuery(req.userId)).sort({
      dueDate: 1,
      priority: -1,
    });

    console.log(`Found ${todos.length} todos for user ${req.userId}`);
    return res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error.message);
    return sendError(res, error.message);
  }
});

router.get("/daily/today", async (req, res) => {
  try {
    const today = getCurrentDateKey();
    const todos = await findTasksForRange(req.userId, today, today);

    return res.json(todos);
  } catch (error) {
    console.error("Error fetching daily tasks:", error.message);
    return sendError(res, error.message);
  }
});

router.get("/daily/:date", async (req, res) => {
  try {
    const requestedDate = getDateKey(req.params.date);

    if (!requestedDate) {
      return sendError(res, "Invalid date format", 400);
    }

    const todos = await findTasksForRange(req.userId, requestedDate, requestedDate);

    return res.json(todos);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.get("/weekly/:date", async (req, res) => {
  try {
    const requestedDate = getDateKey(req.params.date);

    if (!requestedDate) {
      return sendError(res, "Invalid date format", 400);
    }

    const startOfWeek = parseDateKey(requestedDate);
    const dayOfWeek = startOfWeek.getUTCDay();
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - dayOfWeek);
    const endOfWeek = addDays(startOfWeek, 6);

    const todos = await findTasksForRange(req.userId, startOfWeek, endOfWeek);

    return res.json(todos);
  } catch (error) {
    console.error("Error fetching weekly tasks:", error.message);
    return sendError(res, error.message);
  }
});

router.get("/monthly/:year/:month", async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return sendError(res, "Invalid month or year", 400);
    }

    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0));

    const todos = await findTasksForRange(req.userId, firstDay, lastDay);

    return res.json(todos);
  } catch (error) {
    console.error("Error fetching monthly tasks:", error.message);
    return sendError(res, error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      text,
      description,
      priority,
      startDate,
      dueDate,
      endDate,
      category,
      recurrence,
      recurrenceDays,
    } = req.body;

    if (!text || !text.trim()) {
      return sendError(res, "Todo title is required", 400);
    }

    const todo = new Todo({
      taskId: randomUUID(),
      ownerId: req.userId,
      ownerName: req.userName,
      text: text.trim(),
      description: description || "",
      priority: priority || "medium",
      startDate: startDate || new Date(),
      dueDate: dueDate || null,
      endDate: endDate || null,
      category: category || "general",
      recurrence: recurrence || "none",
      recurrenceDays: recurrenceDays || [],
      status: "pending",
      completed: false,
    });

    await todo.save();
    return res.status(201).json(todo);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      text,
      description,
      status,
      priority,
      startDate,
      dueDate,
      endDate,
      category,
      recurrence,
      recurrenceDays,
      completed,
    } = req.body;

    const todo = await findOwnedTodoById(req.params.id, req.userId);

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }

    if (text !== undefined) {
      if (!text.trim()) {
        return sendError(res, "Todo title is required", 400);
      }

      todo.text = text.trim();
    }
    if (description !== undefined) {
      todo.description = description;
    }
    if (status !== undefined) {
      todo.status = status;
    }
    if (priority !== undefined) {
      todo.priority = priority;
    }
    if (startDate !== undefined) {
      todo.startDate = startDate;
    }
    if (dueDate !== undefined) {
      todo.dueDate = dueDate;
    }
    if (endDate !== undefined) {
      todo.endDate = endDate;
    }
    if (category !== undefined) {
      todo.category = category;
    }
    if (recurrence !== undefined) {
      todo.recurrence = recurrence;
    }
    if (recurrenceDays !== undefined) {
      todo.recurrenceDays = recurrenceDays;
    }
    if (completed !== undefined) {
      todo.completed = completed;
      todo.status = completed ? "completed" : "pending";
    }

    await todo.save();
    return res.json(todo);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
});

router.patch("/:id/complete", async (req, res) => {
  try {
    const todo = await findOwnedTodoById(req.params.id, req.userId);
    const completionDateKey = req.query.date
      ? getDateKey(req.query.date)
      : getCurrentDateKey();

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }

    if (!completionDateKey) {
      return sendError(res, "Invalid date format", 400);
    }

    if (todo.recurrence !== "none" && !taskOccursOnDate(todo, completionDateKey)) {
      return sendError(res, "Task does not occur on the selected date", 400);
    }

    const completionDate = parseDateKey(completionDateKey) || new Date();

    if (todo.recurrence !== "none") {
      if (!todo.completionHistory) {
        todo.completionHistory = [];
      }

      const existingRecord = todo.completionHistory.find(
        (record) => getCompletionDateKey(record) === completionDateKey
      );

      if (!existingRecord) {
        todo.completionHistory.push({
          completedAt: completionDate,
          completedDateKey: completionDateKey,
          completedBy: req.userId,
        });
      }
    } else {
      todo.status = "completed";
      todo.completed = true;

      if (!todo.completionHistory) {
        todo.completionHistory = [];
      }

      const existingRecord = todo.completionHistory.find(
        (record) => getCompletionDateKey(record) === completionDateKey
      );

      if (!existingRecord) {
        todo.completionHistory.push({
          completedAt: completionDate,
          completedDateKey: completionDateKey,
          completedBy: req.userId,
        });
      }
    }

    await todo.save();
    return res.json(todo);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.patch("/:id/uncomplete", async (req, res) => {
  try {
    const todo = await findOwnedTodoById(req.params.id, req.userId);
    const completionDateKey = req.query.date
      ? getDateKey(req.query.date)
      : getCurrentDateKey();

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }

    if (!completionDateKey) {
      return sendError(res, "Invalid date format", 400);
    }

    if (todo.recurrence !== "none" && !taskOccursOnDate(todo, completionDateKey)) {
      return sendError(res, "Task does not occur on the selected date", 400);
    }

    if (todo.recurrence !== "none") {
      if (todo.completionHistory) {
        todo.completionHistory = todo.completionHistory.filter(
          (record) => getCompletionDateKey(record) !== completionDateKey
        );
      }
    } else {
      todo.status = "pending";
      todo.completed = false;
      todo.completionHistory = [];
    }

    await todo.save();
    return res.json(todo);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const todo = await findOwnedTodoById(req.params.id, req.userId);

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }

    await Todo.deleteOne({ _id: req.params.id, ...buildOwnerQuery(req.userId) });
    return res.json({ message: "Todo deleted successfully", taskId: req.params.id });
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.get("/analytics/dashboard/overview", async (req, res) => {
  try {
    const overview = await analyticsService.getDashboardOverview(req.userId);
    return res.json(overview);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.get("/analytics/daily/:days", async (req, res) => {
  try {
    const days = parseInt(req.params.days, 10) || 30;
    const data = await analyticsService.getDailyProductivity(req.userId, days);
    return res.json(data);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.get("/analytics/weekly/:weeks", async (req, res) => {
  try {
    const weeks = parseInt(req.params.weeks, 10) || 12;
    const data = await analyticsService.getWeeklyProductivity(req.userId, weeks);
    return res.json(data);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.get("/analytics/monthly/:months", async (req, res) => {
  try {
    const months = parseInt(req.params.months, 10) || 12;
    const data = await analyticsService.getMonthlyProductivity(req.userId, months);
    return res.json(data);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.get("/analytics/statistics", async (req, res) => {
  try {
    const stats = await analyticsService.getTaskStatistics(req.userId);
    return res.json(stats);
  } catch (error) {
    return sendError(res, error.message);
  }
});

router.get("/analytics/history/:days", async (req, res) => {
  try {
    const days = parseInt(req.params.days, 10) || 30;
    const history = await analyticsService.getCompletionHistory(req.userId, days);
    return res.json(history);
  } catch (error) {
    return sendError(res, error.message);
  }
});

module.exports = router;
