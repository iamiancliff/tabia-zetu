const mongoose = require("mongoose");
const BehaviorLog = require("../models/BehaviorLog");
const generateSuggestion = require("../utils/generateSuggestion");

// Create a new behavior log
exports.createLog = async (req, res) => {
  try {
    const log = await BehaviorLog.create({ ...req.body, teacher: req.user._id });
    res.status(201).json({
      message: "Behavior log created successfully",
      log,
    });
  } catch (err) {
    console.error("Create Log Error:", err);
    res.status(500).json({
      message: "Failed to create behavior log",
      error: err.message,
    });
  }
};

// Get logs, filtered by student or date
exports.getLogs = async (req, res) => {
  try {
    const { student, date } = req.query;
    const filter = {};
    if (student) filter.student = student;
    if (date) filter.createdAt = { $gte: new Date(date) };

    const logs = await BehaviorLog.find(filter).populate("student");

    res.status(200).json({
      message: "Behavior logs fetched successfully",
      logs,
    });
  } catch (err) {
    console.error("Get Logs Error:", err);
    res.status(500).json({
      message: "Failed to fetch behavior logs",
      error: err.message,
    });
  }
};

// Generate report with suggestions for a specific student
exports.getReport = async (req, res) => {
  const studentId = req.params.studentId;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const logs = await BehaviorLog.find({ student: studentId });

    if (!logs.length) {
      return res.status(404).json({ message: "No logs found for this student" });
    }

    const suggestions = generateSuggestion(logs);

    res.status(200).json({
      message: "Report generated successfully",
      logs,
      suggestions,
    });
  } catch (error) {
    console.error("Generate Report Error:", error);
    res.status(500).json({
      message: "Failed to generate report",
      error: error.message,
    });
  }
};
