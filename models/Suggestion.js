import express from "express"
import { getDashboardData, getAllUsers, updateUserStatus } from "../controllers/adminController.js"
import { protect, admin } from "../middleware/auth.js"

const router = express.Router()

// All admin routes are protected by both `protect` (authentication) and `admin` (role check) middleware
router.get("/dashboard", protect, admin, getDashboardData)
router.get("/users", protect, admin, getAllUsers)
router.put("/users/:id/status", protect, admin, updateUserStatus) // Correct path: /api/admin/users/:id/status

export default router;
