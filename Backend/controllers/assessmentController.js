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
    const { questions, answers } = req.body;

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const detailedReview = [];

    questions.forEach((q, i) => {

      const userAnswer = answers[i];

      // Skipped
      if (!userAnswer) {
        skipped++;
        detailedReview.push({
          question: q.text,
          userAnswer: "Not Attempted",
          correctAnswer: q.correctAnswer,
          explanation: `Correct answer is "${q.correctAnswer}".`
        });
        return;
      }

      // MCQ
      if (q.type === "mcq") {

        if (userAnswer === q.correctAnswer) {
          correct++;
        } else {
          incorrect++;
          detailedReview.push({
            question: q.text,
            userAnswer,
            correctAnswer: q.correctAnswer,
            explanation: `Correct answer is "${q.correctAnswer}".`
          });
        }
      }

      // SUBJECTIVE
      else {

        if (userAnswer.length > 15) {
          correct++;
        } else {
          incorrect++;
          detailedReview.push({
            question: q.text,
            userAnswer,
            correctAnswer: q.correctAnswer,
            explanation: "Answer lacks depth. Review the concept."
          });
        }
      }

    });

    const percentage = Math.round((correct / questions.length) * 100);

    res.status(200).json({
      percentage,
      correct,
      incorrect,
      skipped,
      detailedReview
    });

  } catch (err) {
    res.status(500).json({ message: "Submission Failed" });
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