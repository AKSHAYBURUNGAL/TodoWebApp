const router = require("express").Router();
const Todo = require("../models/Todo");
const analyticsService = require("../services/analyticsService");
const { randomUUID } = require("crypto");

const sendError = (res, message, statusCode = 500) => {
  console.error("Error:", message);
  res.status(statusCode).json({ error: message });
};


router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({})
      .sort({ dueDate: 1, priority: -1 });
    console.log(`✓ Found ${todos.length} todos`);
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err.message);
    sendError(res, err.message);
  }
});


router.get("/daily/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todos = await Todo.find({
      $or: [
        { dueDate: { $gte: today, $lt: tomorrow } },
        { 
          recurrence: "daily",
          startDate: { $lte: tomorrow },
          $or: [{ endDate: null }, { endDate: { $gte: today } }]
        },
        {
          recurrence: "weekly",
          startDate: { $lte: tomorrow },
          $or: [{ endDate: null }, { endDate: { $gte: today } }],
          recurrenceDays: today.getDay()
        }
      ]
    }).sort({ priority: -1 });

    res.json(todos);
  } catch (err) {
    console.error("Error fetching daily tasks:", err.message);
    sendError(res, err.message);
  }
});


router.get("/daily/:date", async (req, res) => {
  try {
    const requestedDate = new Date(req.params.date);
    requestedDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(requestedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const todos = await Todo.find({
      $or: [
        { dueDate: { $gte: requestedDate, $lt: nextDate } },
        { 
          recurrence: "daily",
          startDate: { $lte: nextDate },
          $or: [{ endDate: null }, { endDate: { $gte: requestedDate } }]
        },
        {
          recurrence: "weekly",
          startDate: { $lte: nextDate },
          $or: [{ endDate: null }, { endDate: { $gte: requestedDate } }],
          recurrenceDays: requestedDate.getDay()
        }
      ]
    }).sort({ priority: -1 });

    res.json(todos);
  } catch (err) {
    sendError(res, err.message);
  }
});


router.get("/weekly/:date", async (req, res) => {
  try {

    const startOfWeek = new Date(req.params.date);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const todos = await Todo.find({
      $or: [
        { 
          dueDate: { $gte: startOfWeek, $lte: endOfWeek }
        },
        { 
          recurrence: "daily",
          startDate: { $lte: endOfWeek },
          $or: [{ endDate: null }, { endDate: { $gte: startOfWeek } }]
        },
        {
          recurrence: "weekly",
          startDate: { $lte: endOfWeek },
          $or: [{ endDate: null }, { endDate: { $gte: startOfWeek } }]
        }
      ]
    }).sort({ priority: -1 });

    res.json(todos);
  } catch (err) {
    console.error("Error fetching weekly tasks:", err.message);
    sendError(res, err.message);
  }
});


router.get("/monthly/:year/:month", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const todos = await Todo.find({
      $or: [
        {
          dueDate: { $gte: firstDay, $lte: lastDay }
        },
        {
          recurrence: "daily",
          startDate: { $lte: lastDay },
          $or: [{ endDate: null }, { endDate: { $gte: firstDay } }]
        },
        {
          recurrence: "weekly",
          startDate: { $lte: lastDay },
          $or: [{ endDate: null }, { endDate: { $gte: firstDay } }]
        },
        {
          recurrence: "monthly",
          startDate: { $lte: lastDay },
          $or: [{ endDate: null }, { endDate: { $gte: firstDay } }]
        }
      ]
    }).sort({ priority: -1 });

    res.json(todos);
  } catch (err) {
    console.error("Error fetching monthly tasks:", err.message);
    sendError(res, err.message);
  }
});


router.post("/", async (req, res) => {
  try {
    const { text, description, priority, startDate, dueDate, endDate, category, recurrence, recurrenceDays } = req.body;

  
    if (!text || !text.trim()) {
      return sendError(res, "Todo title is required", 400);
    }
    const taskId = randomUUID();

    const todo = new Todo({
      taskId,
      text: text.trim(),
      description: description || "",
      priority: priority || "medium",
      startDate: startDate || new Date(),
      dueDate: dueDate || null,
      endDate: endDate || null,
      category: category || "general",
      recurrence: recurrence || "none",
      recurrenceDays: recurrenceDays || [],
      status: "pending"
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    sendError(res, err.message, 400);
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { text, description, status, priority, startDate, dueDate, endDate, category, recurrence, recurrenceDays, completed } = req.body;

   
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }

    
    if (text) todo.text = text.trim();
    if (description !== undefined) todo.description = description;
    if (status) todo.status = status;
    if (priority) todo.priority = priority;
    if (startDate) todo.startDate = startDate;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (endDate !== undefined) todo.endDate = endDate;
    if (category) todo.category = category;
    if (recurrence) todo.recurrence = recurrence;
    if (recurrenceDays) todo.recurrenceDays = recurrenceDays;
    if (completed !== undefined) todo.completed = completed;

    await todo.save();
    res.json(todo);
  } catch (err) {
    sendError(res, err.message, 400);
  }
});


router.patch("/:id/complete", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    const completionDate = req.query.date ? new Date(req.query.date) : new Date();

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }

    if (todo.recurrence !== "none") {
      if (!todo.completionHistory) {
        todo.completionHistory = [];
      }
      const dateStr = completionDate.toISOString().split("T")[0];
      const existingRecord = todo.completionHistory.find(
        (record) => record.completedAt.toISOString().split("T")[0] === dateStr
      );
      
      if (!existingRecord) {
        todo.completionHistory.push({
          completedAt: completionDate,
          completedBy: req.userId
        });
      }
    } else {
      todo.status = "completed";
      todo.completed = true;
      
      if (!todo.completionHistory) {
        todo.completionHistory = [];
      }
      todo.completionHistory.push({
        completedAt: completionDate,
        completedBy: req.userId
      });
    }

    await todo.save();
    res.json(todo);
  } catch (err) {
    sendError(res, err.message);
  }
});

router.patch("/:id/uncomplete", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    const completionDate = req.query.date ? new Date(req.query.date) : new Date();

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }


    if (todo.recurrence !== "none") {
      if (todo.completionHistory) {
        const dateStr = completionDate.toISOString().split("T")[0];
        todo.completionHistory = todo.completionHistory.filter(
          (record) => record.completedAt.toISOString().split("T")[0] !== dateStr
        );
      }
    } else {
      todo.status = "pending";
      todo.completed = false;
    }

    await todo.save();
    res.json(todo);
  } catch (err) {
    sendError(res, err.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return sendError(res, "Todo not found", 404);
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.json({ message: "Todo deleted successfully", taskId: req.params.id });
  } catch (err) {
    sendError(res, err.message);
  }
});

router.get("/analytics/dashboard/overview", async (req, res) => {
  try {
    const overview = await analyticsService.getDashboardOverview();
    res.json(overview);
  } catch (err) {
    sendError(res, err.message);
  }
});


router.get("/analytics/daily/:days", async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 30;
    const data = await analyticsService.getDailyProductivity(null, days);
    res.json(data);
  } catch (err) {
    sendError(res, err.message);
  }
});

router.get("/analytics/weekly/:weeks", async (req, res) => {
  try {
    const weeks = parseInt(req.params.weeks) || 12;
    const data = await analyticsService.getWeeklyProductivity(null, weeks);
    res.json(data);
  } catch (err) {
    sendError(res, err.message);
  }
});


router.get("/analytics/monthly/:months", async (req, res) => {
  try {
    const months = parseInt(req.params.months) || 12;
    const data = await analyticsService.getMonthlyProductivity(null, months);
    res.json(data);
  } catch (err) {
    sendError(res, err.message);
  }
});

router.get("/analytics/statistics", async (req, res) => {
  try {
    const stats = await analyticsService.getTaskStatistics();
    res.json(stats);
  } catch (err) {
    sendError(res, err.message);
  }
});

router.get("/analytics/history/:days", async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 30;
    const history = await analyticsService.getCompletionHistory(null, days);
    res.json(history);
  } catch (err) {
    sendError(res, err.message);
  }
});

module.exports = router;
