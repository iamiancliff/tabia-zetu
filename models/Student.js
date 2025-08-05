import mongoose from "mongoose"

const studentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stream: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    subjects: [
      {
        type: String,
      },
    ],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    parentContact: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const Student = mongoose.model("Student", studentSchema)

export default Student;
