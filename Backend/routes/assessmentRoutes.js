const express = require("express");
const router = express.Router();

const {
  generateAssessment,
  submitAssessment,
  submitSingleQuestion,
  getSkillStats,
  getAssessmentHistory
} = require("../controllers/assessmentController");
const authMiddleware = require("../middleware/authMiddleware");

// AI GENERATE (Protected)
router.post("/generate", authMiddleware, generateAssessment);

// SUBMIT FULL ASSESSMENT (Protected)
router.post("/submit", authMiddleware, submitAssessment);

// GET SKILL STATS (Protected)
router.get("/stats", authMiddleware, getSkillStats);
router.get("/history", authMiddleware, getAssessmentHistory);

// REVIEW SINGLE QUESTION
router.post("/review-question", submitSingleQuestion);

module.exports = router;