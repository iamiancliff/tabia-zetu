import asyncHandler from "express-async-handler"
import BehaviorLog from "../models/BehaviorLog.js"
import Student from "../models/Student.js"

// @desc    Get all behavior logs for the authenticated teacher
// @route   GET /api/behaviors
// @access  Private (Teacher)
const getBehaviorLogs = asyncHandler(async (req, res) => {
  const behaviors = await BehaviorLog.find({ teacher: req.user._id }).populate("student", "name stream")
  res.json(behaviors)
})

// @desc    Create a new behavior log
// @route   POST /api/behaviors
// @access  Private (Teacher)
const createBehaviorLog = asyncHandler(async (req, res) => {
  const { studentId, behaviorType, subject, timeOfDay, severity, notes, outcome, date } = req.body

  // Debug logging
  console.log("🔍 [Backend] Received request body:", req.body)
  console.log("🔍 [Backend] Extracted fields:", { studentId, behaviorType, subject, timeOfDay, severity, notes, outcome, date })
  console.log("🔍 [Backend] User making request:", req.user._id)

  if (!studentId || !behaviorType || !notes) {
    console.log("❌ [Backend] Validation failed:", { 
      hasStudentId: !!studentId, 
      hasBehaviorType: !!behaviorType, 
      hasNotes: !!notes,
      studentIdType: typeof studentId,
      behaviorTypeType: typeof behaviorType,
      notesType: typeof notes
    })
    res.status(400)
    throw new Error("Please provide student, behavior type, and notes")
  }

  // Ensure the student belongs to the authenticated teacher
  const student = await Student.findOne({ _id: studentId, teacher: req.user._id })
  if (!student) {
    console.log("❌ [Backend] Student not found or not authorized:", { studentId, teacherId: req.user._id })
    res.status(404)
    throw new Error("Student not found or not authorized")
  }

  console.log("✅ [Backend] Student found:", student.name)

  const behaviorLog = await BehaviorLog.create({
    student: studentId,
    teacher: req.user._id,
    behaviorType,
    subject,
    timeOfDay,
    severity,
    notes,
    outcome,
    date: date || Date.now(),
  })

  console.log("✅ [Backend] Behavior log created successfully:", behaviorLog._id)
  res.status(201).json(behaviorLog)
})

// @desc    Get a single behavior log by ID
// @route   GET /api/behaviors/:id
// @access  Private (Teacher)
const getBehaviorLogById = asyncHandler(async (req, res) => {
  const behaviorLog = await BehaviorLog.findOne({ _id: req.params.id, teacher: req.user._id }).populate(
    "student",
    "name stream",
  )

  if (behaviorLog) {
    res.json(behaviorLog)
  } else {
    res.status(404)
    throw new Error("Behavior log not found or not authorized")
  }
})

// @desc    Update a behavior log by ID
// @route   PUT /api/behaviors/:id
// @access  Private (Teacher)
const updateBehaviorLog = asyncHandler(async (req, res) => {
  const { behaviorType, subject, timeOfDay, severity, notes, outcome, date } = req.body

  const behaviorLog = await BehaviorLog.findOne({ _id: req.params.id, teacher: req.user._id })

  if (behaviorLog) {
    behaviorLog.behaviorType = behaviorType || behaviorLog.behaviorType
    behaviorLog.subject = subject || behaviorLog.subject
    behaviorLog.timeOfDay = timeOfDay || behaviorLog.timeOfDay
    behaviorLog.severity = severity || behaviorLog.severity
    behaviorLog.notes = notes || behaviorLog.notes
    behaviorLog.outcome = outcome || behaviorLog.outcome
    behaviorLog.date = date || behaviorLog.date

    const updatedBehaviorLog = await behaviorLog.save()
    res.json(updatedBehaviorLog)
  } else {
    res.status(404)
    throw new Error("Behavior log not found or not authorized")
  }
})

// @desc    Delete a behavior log by ID
// @route   DELETE /api/behaviors/:id
// @access  Private (Teacher)
const deleteBehaviorLog = asyncHandler(async (req, res) => {
  const behaviorLog = await BehaviorLog.findOne({ _id: req.params.id, teacher: req.user._id })

  if (behaviorLog) {
    await BehaviorLog.deleteOne({ _id: behaviorLog._id })
    res.json({ message: "Behavior log removed" })
  } else {
    res.status(404)
    throw new Error("Behavior log not found or not authorized")
  }
})

// @desc    Get behavior analytics summary for the authenticated teacher
// @route   GET /api/behaviors/analytics/summary
// @access  Private (Teacher)
const getBehaviorAnalytics = asyncHandler(async (req, res) => {
  const teacherId = req.user._id

  // Total behaviors
  const totalBehaviors = await BehaviorLog.countDocuments({ teacher: teacherId })

  // Behaviors by type
  const behaviorsByType = await BehaviorLog.aggregate([
    { $match: { teacher: teacherId } },
    { $group: { _id: "$behaviorType", count: { $sum: 1 } } },
  ])

  // Behaviors by severity
  const behaviorsBySeverity = await BehaviorLog.aggregate([
    { $match: { teacher: teacherId } },
    { $group: { _id: "$severity", count: { $sum: 1 } } },
  ])

  // Top students with most negative behaviors
  const topNegativeStudents = await BehaviorLog.aggregate([
    { $match: { teacher: teacherId, behaviorType: "negative" } },
    { $group: { _id: "$student", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "students", // The collection name for Student model
        localField: "_id",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    { $project: { _id: 0, studentName: "$studentInfo.name", count: 1 } },
  ])

  res.json({
    totalBehaviors,
    behaviorsByType,
    behaviorsBySeverity,
    topNegativeStudents,
  })
})

export {
  getBehaviorLogs,
  createBehaviorLog,
  getBehaviorLogById,
  updateBehaviorLog,
  deleteBehaviorLog,
  getBehaviorAnalytics,
}
