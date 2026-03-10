const mongoose = require("mongoose");
const {
  DEFAULT_TODO_CATEGORY,
  DEFAULT_TODO_PRIORITY,
  DEFAULT_TODO_RECURRENCE,
  DEFAULT_TODO_STATUS,
  TODO_PRIORITIES,
  TODO_RECURRENCES,
  TODO_STATUSES,
} = require("../constants/todo");

const normalizeRecurrenceDays = (days = []) => {
  if (!Array.isArray(days)) {
    return [];
  }

  return [...new Set(days.map(Number).filter((day) => Number.isInteger(day)))]
    .filter((day) => day >= 0 && day <= 6)
    .sort((left, right) => left - right);
};

const completionHistorySchema = new mongoose.Schema(
  {
    completedAt: {
      type: Date,
      default: Date.now,
    },
    completedDateKey: {
      type: String,
      default: null,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    completedBy: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const todoSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: TODO_PRIORITIES,
      default: DEFAULT_TODO_PRIORITY,
    },
    status: {
      type: String,
      enum: TODO_STATUSES,
      default: DEFAULT_TODO_STATUS,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: String,
      enum: TODO_RECURRENCES,
      default: DEFAULT_TODO_RECURRENCE,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    recurrenceDays: {
      type: [Number],
      default: [],
      set: normalizeRecurrenceDays,
      validate: {
        validator: (days) => days.every((day) => day >= 0 && day <= 6),
        message: "Recurrence days must be between 0 and 6.",
      },
    },
    completionHistory: {
      type: [completionHistorySchema],
      default: [],
    },
    category: {
      type: String,
      default: DEFAULT_TODO_CATEGORY,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

todoSchema.index({ ownerId: 1, dueDate: 1, priority: -1 });
todoSchema.index({ ownerId: 1, recurrence: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Todo", todoSchema);
