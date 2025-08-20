import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import Student from "../models/Student.js"
import BehaviorLog from "../models/BehaviorLog.js"

// @desc    Get comprehensive admin reports data
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAdminReports = asyncHandler(async (req, res) => {
  // Get all data across the system
  const [totalUsers, totalStudents, totalBehaviorLogs] = await Promise.all([
    User.countDocuments(),
    Student.countDocuments(),
    BehaviorLog.countDocuments()
  ])

  // Get users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } }
  ])

  // Get behavior statistics
  const behaviorStats = await BehaviorLog.aggregate([
    { $group: { _id: "$behaviorType", count: { $sum: 1 } } }
  ])

  // Get school statistics
  const schoolStats = await User.aggregate([
    { $match: { role: "teacher" } },
    { $group: { _id: "$school", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])

  // Get recent behaviors
  const recentBehaviors = await BehaviorLog.find({})
    .populate("student", "name stream")
    .populate("teacher", "firstName lastName email")
    .sort({ date: -1 })
    .limit(10)

  // Get top performing and challenging students
  const studentBehaviorCounts = await BehaviorLog.aggregate([
    { $group: { _id: "$student", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "_id",
        as: "studentInfo"
      }
    },
    { $unwind: "$studentInfo" },
    { $project: { _id: 0, studentName: "$studentInfo.name", stream: "$studentInfo.stream", count: 1 } }
  ])

  res.json({
    summary: {
      totalUsers,
      totalStudents,
      totalBehaviorLogs,
      usersByRole,
      behaviorStats,
      schoolStats
    },
    recentBehaviors,
    topStudents: studentBehaviorCounts,
    message: "Admin reports data generated successfully"
  })
})

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardData = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()
  const totalStudents = await Student.countDocuments()
  const totalBehaviorLogs = await BehaviorLog.countDocuments()

  const usersByRole = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])

  const activeUsers = await User.countDocuments({ isActive: true })
  const inactiveUsers = await User.countDocuments({ isActive: false })

  res.json({
    totalUsers,
    totalStudents,
    totalBehaviorLogs,
    usersByRole,
    activeUsers,
    inactiveUsers,
  })
})

// @desc    Get all users (teachers and admins)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password") // Exclude passwords
  res.json(users)
})

// @desc    Get all teachers (admin access)
// @route   GET /api/admin/teachers
// @access  Private (Admin)
const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: "teacher" }).select("-password")
  res.json({ teachers })
})

// @desc    Get all behaviors (admin access)
// @route   GET /api/admin/behaviors
// @access  Private (Admin)
const getAllBehaviors = asyncHandler(async (req, res) => {
  const behaviors = await BehaviorLog.find({})
    .populate("student", "name stream")
    .populate("teacher", "firstName lastName email")
  res.json({ behaviors })
})

// @desc    Delete a teacher (admin access)
// @route   DELETE /api/admin/teachers/:id
// @access  Private (Admin)
const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.params.id)

  if (!teacher) {
    res.status(404)
    throw new Error("Teacher not found")
  }

  if (teacher.role !== "teacher") {
    res.status(400)
    throw new Error("Can only delete teachers")
  }

  // Delete associated students and behavior logs
  await Student.deleteMany({ teacher: teacher._id })
  await BehaviorLog.deleteMany({ teacher: teacher._id })
  
  // Delete the teacher
  await User.deleteOne({ _id: teacher._id })

  res.json({ message: "Teacher and associated data removed successfully" })
})

// @desc    Update user status (active/inactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body

  const user = await User.findById(req.params.id)

  if (user) {
    user.isActive = isActive
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
      message: "User status updated successfully",
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export { 
  getDashboardData, 
  getAllUsers, 
  getAllTeachers, 
  getAllBehaviors, 
  deleteTeacher, 
  updateUserStatus,
  getAdminReports
}
