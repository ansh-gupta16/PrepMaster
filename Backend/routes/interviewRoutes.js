const express = require("express");
const router = express.Router();

// 1. Import your controller functions
const { 
  startInterview, 
  processInterviewStep 
} = require("../controllers/interviewController");

// 2. Import the middleware directly (it is exported as a single function)
const protect = require("../middleware/authMiddleware");

// 3. Use 'protect' in your routes
router.post("/start", protect, startInterview);
router.post("/process", protect, processInterviewStep);

module.exports = router;