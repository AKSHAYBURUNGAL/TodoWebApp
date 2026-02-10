const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI

const app = express();

app.use(cors());
app.use(express.json());

const todoRoutes = require("./routes/todos");

app.use("/api/todos", todoRoutes);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✓ MongoDB connected successfully"))
  .catch(err => console.error("✗ MongoDB connection error:", err.message));

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
