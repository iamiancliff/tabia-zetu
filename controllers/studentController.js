const Student = require("../models/Student");

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create({ ...req.body, teacher: req.user._id });
    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (err) {
    console.error("Create Student Error:", err);
    res.status(500).json({ message: "Failed to create student", error: err.message });
  }
};

// Get all students for the logged-in teacher
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user._id });
    res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (err) {
    console.error("Get Students Error:", err);
    res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({
      message: "Student fetched successfully",
      student,
    });
  } catch (err) {
    console.error("Get Student By ID Error:", err);
    res.status(500).json({ message: "Failed to fetch student", error: err.message });
  }
};

//  Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student not found or not authorized" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete Student Error:", err);
    res.status(500).json({ message: "Failed to delete student", error: err.message });
  }
};
