const express = require("express");
const { getReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/:studentId", protect, getReport);

module.exports = router;