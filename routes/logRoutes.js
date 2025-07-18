const express = require("express");
const { createLog, getLogs } = require("../controllers/logController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createLog);
router.get("/", protect, getLogs);

module.exports = router;