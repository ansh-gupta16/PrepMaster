const mongoose = require("mongoose");

const completedCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a user can only complete a specific question once
completedCodeSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("CompletedCode", completedCodeSchema);
