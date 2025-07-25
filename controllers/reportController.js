import asyncHandler from "express-async-handler"
import Student from "../models/Student.js"
import BehaviorLog from "../models/BehaviorLog.js"

// @desc    Generate a report for a specific student
// @route   GET /api/reports/student/:studentId
// @access  Private (Teacher)
const generateStudentReport = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId
  const teacherId = req.user._id

  const student = await Student.findOne({ _id: studentId, teacher: teacherId })

  if (!student) {
    res.status(404)
    throw new Error("Student not found or not authorized")
  }

  const behaviorLogs = await BehaviorLog.find({ student: studentId, teacher: teacherId }).sort({ date: 1 })

  // Basic report data aggregation
  const totalLogs = behaviorLogs.length
  const positiveLogs = behaviorLogs.filter((log) => log.behaviorType === "positive").length
  const negativeLogs = behaviorLogs.filter((log) => log.behaviorType === "negative").length

  const severityCounts = behaviorLogs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1
    return acc
  }, {})

  const behaviorTypeCounts = behaviorLogs.reduce((acc, log) => {
    acc[log.behaviorType] = (acc[log.behaviorType] || 0) + 1
    return acc
  }, {})

  // In a real application, you would generate a PDF here using a library like `pdfkit` or `jspdf` (if server-side rendering is set up).
  // For this example, we'll return the aggregated data.
  res.json({
    studentInfo: {
      name: student.name,
      stream: student.stream,
      age: student.age,
      school: student.school,
      parentContact: student.parentContact,
    },
    reportSummary: {
      totalLogs,
      positiveLogs,
      negativeLogs,
      severityCounts,
      behaviorTypeCounts,
    },
    behaviorDetails: behaviorLogs.map((log) => ({
      date: log.date.toISOString().split("T")[0],
      behaviorType: log.behaviorType,
      subject: log.subject,
      timeOfDay: log.timeOfDay,
      severity: log.severity,
      notes: log.notes,
      outcome: log.outcome,
    })),
    message: "Report data generated. For PDF export, integrate a PDF generation library.",
  })
})

// @desc    Generate a class report for the authenticated teacher's school
// @route   GET /api/reports/class
// @access  Private (Teacher)
const generateClassReport = asyncHandler(async (req, res) => {
  const teacherId = req.user._id
  const teacherSchool = req.user.school

  if (!teacherSchool) {
    res.status(400)
    throw new Error("Teacher must be associated with a school to generate a class report.")
  }

  // Get all students in the teacher's school
  const studentsInSchool = await Student.find({ school: teacherSchool })
  const studentIdsInSchool = studentsInSchool.map((s) => s._id)

  // Get all behavior logs for students in this school (logged by any teacher in the school)
  // For a class report, we might want to see all behaviors within the school, not just by the requesting teacher.
  // Adjust this query based on whether "class report" means "my students' behaviors" or "all behaviors in my school".
  const behaviorLogs = await BehaviorLog.find({ student: { $in: studentIdsInSchool } })
    .populate("student", "name stream")
    .sort({ date: 1 })

  // Aggregate data for the class report
  const totalStudents = studentsInSchool.length
  const totalBehaviors = behaviorLogs.length

  const behaviorTypeSummary = behaviorLogs.reduce((acc, log) => {
    acc[log.behaviorType] = (acc[log.behaviorType] || 0) + 1
    return acc
  }, {})

  const topBehaviors = await BehaviorLog.aggregate([
    { $match: { student: { $in: studentIdsInSchool } } },
    { $group: { _id: "$notes", count: { $sum: 1 } } }, // Group by notes for common behaviors
    { $sort: { count: -1 } },
    { $limit: 5 },
  ])

  const studentBehaviorCounts = await BehaviorLog.aggregate([
    { $match: { student: { $in: studentIdsInSchool } } },
    { $group: { _id: "$student", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    { $project: { _id: 0, studentName: "$studentInfo.name", stream: "$studentInfo.stream", count: 1 } },
  ])

  res.json({
    school: teacherSchool,
    summary: {
      totalStudents,
      totalBehaviors,
      behaviorTypeSummary,
      topBehaviors,
    },
    studentBehaviorCounts,
    message: "Class report data generated. For PDF export, integrate a PDF generation library.",
  })
})

export { generateStudentReport, generateClassReport }
