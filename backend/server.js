/**
 * Todo App Backend Server
 * Express server with MongoDB integration
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ===== Middleware Imports =====
const requestLogger = require("./middleware/requestLogger");
const requestId = require("./middleware/requestId");
const validateTodo = require("./middleware/validateTodo");
const errorHandler = require("./middleware/errorHandler");

// ===== Configuration =====
const PORT = 5000;
const MONGODB_URI = "mongodb://127.0.0.1:27017/todoapp";

const app = express();

// ===== Middleware Setup =====
// IMPORTANT: Order matters - middleware must be before routes

// Request tracking
app.use(requestId);
app.use(requestLogger);

// CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request validation for todo routes
app.use("/api/todos", validateTodo);

// ===== Routes Setup =====
const todoRoutes = require("./routes/todos");
const authRoutes = require("./routes/auth");

app.use("/api/todos", todoRoutes);
app.use("/api/auth", authRoutes);

// ===== Error Handling Middleware =====
// MUST be last - catches errors from all routes
app.use(errorHandler);

// ===== Database Connection =====
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✓ MongoDB connected successfully"))
  .catch(err => console.error("✗ MongoDB connection error:", err.message));

// ===== Server Startup =====
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
