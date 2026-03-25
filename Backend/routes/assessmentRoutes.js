const express = require("express");
const router = express.Router();

const {
  generateAssessment,
  submitAssessment,
  submitSingleQuestion
} = require("../controllers/assessmentController");

// AI GENERATE
router.post("/generate", generateAssessment);

// SUBMIT FULL ASSESSMENT
router.post("/submit", submitAssessment);

// REVIEW SINGLE QUESTION
router.post("/review-question", submitSingleQuestion);

module.exports = router;