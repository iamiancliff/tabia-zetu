import asyncHandler from "express-async-handler"
import Suggestion from "../models/Suggestion.js"
import Student from "../models/Student.js"
import BehaviorLog from "../models/BehaviorLog.js"
import generateSuggestion from "../utils/generateSuggestion.js"

// @desc    Get all suggestions for the authenticated teacher
// @route   GET /api/suggestions
// @access  Private (Teacher)
const getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await Suggestion.find({ teacher: req.user._id }).populate("student", "name stream")
  res.json(suggestions)
})

// @desc    Generate suggestions for a specific student based on their behavior logs
// @route   POST /api/suggestions/generate/:studentId
// @access  Private (Teacher)
const generateSuggestionForStudent = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId
  const teacherId = req.user._id

  const student = await Student.findOne({ _id: studentId, teacher: teacherId })
  if (!student) {
    res.status(404)
    throw new Error("Student not found or not authorized")
  }

  const behaviorLogs = await BehaviorLog.find({ student: studentId, teacher: teacherId }).sort({ date: -1 }).limit(10) // Get recent behaviors

  if (behaviorLogs.length === 0) {
    res.status(400)
    throw new Error("No behavior logs found for this student to generate suggestions.")
  }

  // Use the utility function to generate a suggestion
  const { behaviorPattern, suggestionText, category, priority } = generateSuggestion(student, behaviorLogs)

  const newSuggestion = await Suggestion.create({
    student: studentId,
    teacher: teacherId,
    behaviorPattern,
    suggestion: suggestionText,
    category,
    priority,
  })

  res.status(201).json(newSuggestion)
})

// @desc    Mark a suggestion as implemented
// @route   PUT /api/suggestions/:id/implement
// @access  Private (Teacher)
const markSuggestionImplemented = asyncHandler(async (req, res) => {
  const suggestion = await Suggestion.findOne({ _id: req.params.id, teacher: req.user._id })

  if (suggestion) {
    suggestion.isImplemented = true
    const updatedSuggestion = await suggestion.save()
    res.json(updatedSuggestion)
  } else {
    res.status(404)
    throw new Error("Suggestion not found or not authorized")
  }
})

// @desc    Delete a suggestion
// @route   DELETE /api/suggestions/:id
// @access  Private (Teacher)
const deleteSuggestion = asyncHandler(async (req, res) => {
  const suggestion = await Suggestion.findOne({ _id: req.params.id, teacher: req.user._id })

  if (suggestion) {
    await Suggestion.deleteOne({ _id: suggestion._id })
    res.json({ message: "Suggestion removed" })
  } else {
    res.status(404)
    throw new Error("Suggestion not found or not authorized")
  }
})

export { getSuggestions, generateSuggestionForStudent, markSuggestionImplemented, deleteSuggestion }
