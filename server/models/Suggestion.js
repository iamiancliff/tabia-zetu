import mongoose from "mongoose"

const suggestionSchema = mongoose.Schema(
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
    behaviorPattern: {
      type: String,
      required: true,
    },
    suggestion: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["academic", "social", "emotional", "behavioral", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isImplemented: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Suggestion = mongoose.model("Suggestion", suggestionSchema)

export default Suggestion;
