const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  
  taskId: {
    type: String,
    unique: true,
    required: true
  },
  text: {
    type: String,
    required: true
  },

  ownerId: {
    type: String,
    required: true,
    index: true
  },

  ownerName: {
    type: String,
    required: true,
    trim: true
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

  completed: {
    type: Boolean,
    default: false
  },

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

  recurrenceDays: {
    type: [Number],
    default: []
  },

  completionHistory: [{
    completedAt: {
      type: Date,
      default: Date.now
    },
    completedDateKey: {
      type: String,
      default: null
    },
    completedBy: {
      type: String,
      default: null
    }
  }],

  category: {
    type: String,
    default: "general"
  },


  createdAt: {
    type: Date,
    default: Date.now
  },
}, { strict: false });

module.exports = mongoose.model("Todo", TodoSchema);
