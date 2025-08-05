import express from "express"
import { generateStudentReport, generateClassReport } from "../controllers/reportController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.get("/student/:studentId", protect, generateStudentReport) // Correct path: /api/reports/student/:studentId
router.get("/class", protect, generateClassReport) // Correct path: /api/reports/class

export default router;
