const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();

// Configure CORS with frontend URL
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

const todoRoutes = require("./routes/todos");

app.use("/api/todos", todoRoutes);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✓ MongoDB connected successfully"))
  .catch(err => console.error("✗ MongoDB connection error:", err.message));

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
