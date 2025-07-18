const mongoose = require("mongoose");

const behaviorLogSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  behaviorType: { type: String, required: true },
  subject: { type: String },
  timeOfDay: { type: String },
  contextNotes: { type: String },
  outcome: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BehaviorLog", behaviorLogSchema);
