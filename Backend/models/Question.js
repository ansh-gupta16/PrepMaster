const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  hidden: { type: Boolean, default: false }
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  desc: { type: String, required: true }, // Short description for cards
  description: { type: String, required: true }, // Long description for the problem page
  constraints: [String],
  examples: [{
    input: String,
    output: String
  }],
  testCases: [testCaseSchema],
  entryPoint: { type: String, required: true },
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
