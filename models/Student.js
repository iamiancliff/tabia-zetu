const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stream: { type: String, required: true },
  subjects: [{ type: String }],
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  classLevel: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
