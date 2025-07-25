import express from "express"
import {
  getBehaviorLogs,
  createBehaviorLog,
  getBehaviorLogById,
  updateBehaviorLog,
  deleteBehaviorLog,
  getBehaviorAnalytics,
} from "../controllers/behaviorController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.route("/").get(protect, getBehaviorLogs).post(protect, createBehaviorLog)
router.route("/:id").get(protect, getBehaviorLogById).put(protect, updateBehaviorLog).delete(protect, deleteBehaviorLog)
router.get("/analytics/summary", protect, getBehaviorAnalytics) // Correct path: /api/behaviors/analytics/summary

export default router;
