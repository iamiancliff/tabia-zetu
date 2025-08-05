import express from "express"
import { getSuggestions, generateSuggestionForStudent, markSuggestionImplemented, deleteSuggestion } from "../controllers/suggestionController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

console.log("Registering suggestion route: /")
router.route("/").get(protect, getSuggestions)

console.log("Registering suggestion route: /generate/:studentId")
router.post("/generate/:studentId", protect, generateSuggestionForStudent)

console.log("Registering suggestion route: /:id/implement")
router.put("/:id/implement", protect, markSuggestionImplemented)

console.log("Registering suggestion route: /:id")
router.delete("/:id", protect, deleteSuggestion)

export default router;
