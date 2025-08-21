import mongoose from "mongoose"

const behaviorLogSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    behaviorType: {
      type: String,
      required: true,
      // Allow detailed behavior slugs from the UI (e.g., 'helping_others', 'organized')
    },
    subject: {
      type: String,
    },
    timeOfDay: {
      type: String,
      // Store the full label from UI, e.g., 'Morning (8:00 - 10:00 AM)'
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    notes: {
      type: String,
      required: true,
    },
    outcome: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const BehaviorLog = mongoose.model("BehaviorLog", behaviorLogSchema)

export default BehaviorLog;
