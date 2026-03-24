const mongoose = require("mongoose");

const assessmentResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    detailedReview: [
      {
        questionNumber: Number,
        question: String,
        userAnswer: String,
        correctAnswer: String,
        explanation: String,
        status: String // 'correct', 'incorrect', 'skipped'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssessmentResult", assessmentResultSchema);
