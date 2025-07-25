import express from "express"
import {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentBehaviors,
} from "../controllers/studentController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.route("/").get(protect, getStudents).post(protect, createStudent)
router.route("/:id").get(protect, getStudentById).put(protect, updateStudent).delete(protect, deleteStudent)
router.get("/:id/behaviors", protect, getStudentBehaviors) // Correct path: /api/students/:id/behaviors

export default router;
