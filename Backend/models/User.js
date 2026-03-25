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
        type: Date
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);