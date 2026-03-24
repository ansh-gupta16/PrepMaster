const express = require("express");
const router = express.Router();

const { runCode, submitCode, evaluateCode, getQuestions, getQuestionById } = require("../controllers/simulatorController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

router.get("/questions", optionalAuth, getQuestions);
router.get("/questions/:id", getQuestionById);
router.post("/run", runCode);
router.post("/submit", authMiddleware, submitCode);
router.post("/evaluate", authMiddleware, evaluateCode);

module.exports = router;