const BehaviorLog = require("../models/BehaviorLog");
const generateSuggestion = require("../utils/generateSuggestion");

// Get report for a student (logs + suggestions)
exports.getReport = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const logs = await BehaviorLog.find({ student: studentId });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No logs found for this student" });
    }

    const suggestions = generateSuggestion(logs);

    res.status(200).json({
      message: "Report generated successfully",
      logs,
      suggestions,
    });
  } catch (err) {
    console.error("Get Report Error:", err);
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
};
