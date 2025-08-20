import asyncHandler from "express-async-handler"
import Student from "../models/Student.js"
import BehaviorLog from "../models/BehaviorLog.js"

// @desc    Get all students for the authenticated teacher
// @route   GET /api/students
// @access  Private (Teacher)
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ teacher: req.user._id })
  res.json(students)
})

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Teacher)
const createStudent = asyncHandler(async (req, res) => {
  const { name, stream, age, subjects, parentContact, notes } = req.body

  if (!name || !stream || !age) {
    res.status(400)
    throw new Error("Please provide student name, stream, and age")
  }

  const student = await Student.create({
    name,
    stream,
    age,
    subjects,
    teacher: req.user._id,
    school: req.user.school, // Assign student to teacher's school
    parentContact,
    notes,
  })

  res.status(201).json(student)
})

// @desc    Get a single student by ID
// @route   GET /api/students/:id
// @access  Private (Teacher)
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, teacher: req.user._id })

  if (student) {
    res.json(student)
  } else {
    res.status(404)
    throw new Error("Student not found or not authorized")
  }
})

// @desc    Update a student by ID
// @route   PUT /api/students/:id
// @access  Private (Teacher)
const updateStudent = asyncHandler(async (req, res) => {
  const { name, stream, age, subjects, parentContact, notes } = req.body

  const student = await Student.findOne({ _id: req.params.id, teacher: req.user._id })

  if (student) {
    student.name = name || student.name
    student.stream = stream || student.stream
    student.age = age || student.age
    student.subjects = subjects || student.subjects
    student.parentContact = parentContact || student.parentContact
    student.notes = notes || student.notes

    const updatedStudent = await student.save()
    res.json(updatedStudent)
  } else {
    res.status(404)
    throw new Error("Student not found or not authorized")
  }
})

// @desc    Delete a student by ID
// @route   DELETE /api/students/:id
// @access  Private (Teacher)
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, teacher: req.user._id })

  if (student) {
    await Student.deleteOne({ _id: student._id }) // Use deleteOne for Mongoose 6+
    res.json({ message: "Student removed" })
  } else {
    res.status(404)
    throw new Error("Student not found or not authorized")
  }
})

// @desc    Get behavior logs for a specific student
// @route   GET /api/students/:id/behaviors
// @access  Private (Teacher)
const getStudentBehaviors = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, teacher: req.user._id })

  if (!student) {
    res.status(404)
    throw new Error("Student not found or not authorized")
  }

  const behaviors = await BehaviorLog.find({ student: req.params.id, teacher: req.user._id }).sort({ date: -1 })
  res.json(behaviors)
})

export { getStudents, createStudent, getStudentById, updateStudent, deleteStudent, getStudentBehaviors }
