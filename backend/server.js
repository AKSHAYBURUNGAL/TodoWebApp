const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

// Allow same-origin and configured cross-origin calls.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const todoRoutes = require("./routes/todos");

let dbConnectPromise;
const connectToDatabase = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!dbConnectPromise) {
    dbConnectPromise = mongoose.connect(MONGODB_URI)
      .then(() => {
        console.log("✓ MongoDB connected successfully");
      })
      .catch((err) => {
        dbConnectPromise = null;
        throw err;
      });
  }

  return dbConnectPromise;
};

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("✗ MongoDB connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/todos", todoRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
