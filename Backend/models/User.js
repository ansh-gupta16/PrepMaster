const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    role: {
      type: String,
      default: "student"
    },
    streak: {
      type: Number,
      default: 0
    },
    totalAssessments: {
      type: Number,
      default: 0
    },
    totalInterviews: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    recentActivity: [
      {
        problemId: mongoose.Schema.Types.ObjectId,
        problemTitle: String,
        status: String, // 'Accepted', 'Failed', 'Error'
        language: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    attemptedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);