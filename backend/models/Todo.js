const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ===== Required Fields =====
  text: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },

  // ===== Deprecated: Use 'status' field instead =====
  completed: {
    type: Boolean,
    default: false
  },

  // ===== Recurrence & Scheduling =====
  recurrence: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly", "yearly"],
    default: "none"
  },

  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  dueDate: {
    type: Date,
    default: null
  },

  endDate: {
    type: Date,
    default: null
  },

  // For recurring tasks: which days of week (0-6, where 0 is Sunday)
  recurrenceDays: {
    type: [Number],
    default: []
  },

  // Parent task ID for generated daily tasks
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Todo",
    default: null
  },

  // Track completion history
  completionHistory: [{
    completedAt: {
      type: Date,
      default: Date.now
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],

  category: {
    type: String,
    default: "general"
  },

  // ===== Metadata =====
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Todo", TodoSchema);
