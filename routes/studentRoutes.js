const express = require("express");
const router = express.Router();
const { createStudent, getStudents } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

// a new student (only for authenticated users)
router.post("/", protect, async (req, res, next) => {
  try {
    await createStudent(req, res);
  } catch (err) {
    next(err);
  }
});

// Get students for the logged-in teacher
router.get("/", protect, async (req, res, next) => {
  try {
    await getStudents(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
