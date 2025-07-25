import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import Student from "../models/Student.js"
import BehaviorLog from "../models/BehaviorLog.js"

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

export { getDashboardData, getAllUsers, updateUserStatus }
