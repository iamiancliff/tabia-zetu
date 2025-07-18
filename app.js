const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const logRoutes = require("./routes/logRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Route prefixes now include /api
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reports", reportRoutes);

//  Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;
