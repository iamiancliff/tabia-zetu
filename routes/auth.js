import express from "express"
import { registerUser, loginUser, getMe, updateProfile, changePassword, deleteAccount, uploadProfileImage } from "../controllers/authController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", protect, getMe)
router.put("/profile", protect, updateProfile)
router.post("/upload-image", protect, uploadProfileImage)
router.put("/change-password", protect, changePassword)
router.delete("/delete-account", protect, deleteAccount)

export default router;
