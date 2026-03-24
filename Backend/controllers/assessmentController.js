const {
  generateQuestionsAI,
  generateTutorFeedback,
  generateQuestionWiseReview,
  generateInterviewScoring
} = require("../services/geminiService");

const {
  analyzePerformance,
  getNextDifficulty,
  generateRecommendations
} = require("../services/skillEngine");
const AssessmentResult = require("../models/AssessmentResult");

/*
===================================================
 AI GENERATE ASSESSMENT
===================================================
*/

exports.generateAssessment = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic || !difficulty) {
      return res.status(400).json({
        message: "Missing topic or difficulty"
      });
    }

    console.log("🤖 Generating AI Questions:", topic, difficulty);

    const aiData = await generateQuestionsAI(topic, difficulty);

    if (!aiData || !aiData.questions) {
      throw new Error("Invalid AI response format");
    }

    res.status(200).json(aiData);

  } catch (error) {
    console.error("❌ GENERATE ERROR:", error.message);

    res.status(500).json({
      message: "AI Generation Failed"
    });
  }
};


/*
===================================================
 🔥 NEW — INSTANT QUESTION FEEDBACK (ELITE LIVE MODE)
===================================================
*/

exports.submitSingleQuestion = async (req, res) => {
  try {

    const { question, answer } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question missing"
      });
    }

    console.log("⚡ Hybrid Review Running...");

    // ⭐ CALL HYBRID ENGINE
    const reviewData = await generateQuestionWiseReview(
      [question],
      [answer]
    );

    // ⭐ IMPORTANT: FRONTEND EXPECTS { review }
    const review =
      reviewData?.reviews?.[0] || {
        rating: "average",
        feedback: "No feedback generated.",
        improvedAnswer: question?.correctAnswer || ""
      };

    res.status(200).json({
      review
    });

  } catch (error) {
    console.error("❌ LIVE REVIEW ERROR:", error.message);

    res.status(500).json({
      message: "Live feedback failed"
    });
  }
};


/*
===================================================
 SUBMIT ASSESSMENT + ELITE AI ANALYSIS
===================================================
*/

exports.submitAssessment = async (req, res) => {
  try {
    const { questions, answers, topic, difficulty } = req.body;
    const userId = req.user.id;

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const detailedReview = [];

    questions.forEach((q, i) => {
      const userAnswer = answers[i];
      let status = "correct";

      if (!userAnswer) {
        skipped++;
        status = "skipped";
      } else if (q.type === "mcq") {
        if (userAnswer !== q.correctAnswer) {
          incorrect++;
          status = "incorrect";
        } else {
          correct++;
        }
      } else {
        // Subjective: simple length check for now
        if (userAnswer.length <= 15) {
          incorrect++;
          status = "incorrect";
        } else {
          correct++;
        }
      }

      detailedReview.push({
        questionNumber: i + 1,
        question: q.text,
        userAnswer: userAnswer || "Not Attempted",
        correctAnswer: q.correctAnswer,
        explanation: "", // Will be filled by AI
        status
      });
    });

    const percentage = Math.round((correct / questions.length) * 100);

    // FETCH AI EXPLANATIONS IN BATCH
    console.log("🧠 Generating Batch Explanations...");
    try {
      const { explanations } = await generateBatchExplanations(questions, answers);
      detailedReview.forEach((item, i) => {
        const aiExp = explanations.find(e => e.index === i);
        if (aiExp) item.explanation = aiExp.text;
      });
    } catch (aiErr) {
      console.error("AI Explanation Error:", aiErr.message);
    }

    res.status(200).json({
      percentage,
      correct,
      incorrect,
      skipped,
      detailedReview
    });

    // 🔥 PERSIST RESULT FOR DASHBOARD
    await AssessmentResult.create({
      userId,
      topic: topic || "General",
      totalQuestions: questions.length,
      correctAnswers: correct,
      difficulty: difficulty || "Medium",
      detailedReview // Save the full list of questions and answers
    });

  } catch (err) {
    console.error("Submission Failed:", err.message);
    res.status(500).json({ message: "Submission Failed" });
  }
};

/*
===================================================
📊 GET SKILL STATS (FOR DASHBOARD)
===================================================
*/

exports.getSkillStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await AssessmentResult.find({ userId });

    const totalTopicsInSystem = 4; // DSA, DBMS, OS, Self Assessment

    if (!results || results.length === 0) {
      return res.status(200).json({
        accuracy: 0,
        topicsCovered: `0 / ${totalTopicsInSystem}`,
        weakAreas: "No data yet",
        totalAssessments: 0
      });
    }

    let totalCorrect = 0;
    let totalQuestions = 0;
    const topicStats = {};

    results.forEach(r => {
      totalCorrect += r.correctAnswers;
      totalQuestions += r.totalQuestions;

      if (!topicStats[r.topic]) {
        topicStats[r.topic] = { correct: 0, total: 0 };
      }
      topicStats[r.topic].correct += r.correctAnswers;
      topicStats[r.topic].total += r.totalQuestions;
    });

    const accuracy = Math.round((totalCorrect / totalQuestions) * 100);
    const uniqueTopicsCount = Object.keys(topicStats).length;
    
    // Identify Weak Areas (< 60% accuracy)
    const weakAreas = Object.keys(topicStats)
      .filter(topic => {
        const stats = topicStats[topic];
        const acc = (stats.correct / stats.total) * 100;
        return acc < 60;
      })
      .slice(0, 3)
      .join(", ");

    res.status(200).json({
      accuracy,
      topicsCovered: `${uniqueTopicsCount} / ${totalTopicsInSystem}`,
      weakAreas: weakAreas || "None (Excellent!)",
      totalAssessments: results.length
    });

  } catch (error) {
    console.error("Stats Error:", error.message);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/*
===================================================
📜 GET ASSESSMENT HISTORY (FOR PROFILE)
===================================================
*/

exports.getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get the most recent 3 assessments with full details
    const history = await AssessmentResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("History Error:", error.message);
    res.status(500).json({ message: "Failed to fetch assessment history" });
  }
};

/*
===================================================
🔥 REVIEW SINGLE QUESTION (REAL TIME)
===================================================
*/

exports.reviewSingleQuestion = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const review = await generateQuestionWiseReview(
      [question],
      [answer]
    );

    res.status(200).json({
      review: review?.reviews?.[0] || null
    });

  } catch (error) {
    console.error("❌ SINGLE REVIEW ERROR:", error.message);
    res.status(500).json({ message: "Review failed" });
  }
};