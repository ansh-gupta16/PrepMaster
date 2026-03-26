const {
  generateInterviewResponse
} = require("../services/geminiService");


/* ==================================================
   🤖 AI INTERVIEW SESSION (LIVE CHAT)
================================================== */

exports.processInterviewStep = async (req, res) => {
  try {
    const { history, currentMessage, jobRole, difficulty, domain } = req.body;

    // --- Input validation ---
    if (!currentMessage || typeof currentMessage !== "string" || !currentMessage.trim()) {
      return res.status(400).json({ message: "Missing or empty message" });
    }
    if (!jobRole || typeof jobRole !== "string" || !jobRole.trim()) {
      return res.status(400).json({ message: "Missing job role" });
    }
    if (!domain || typeof domain !== "string" || !domain.trim()) {
      return res.status(400).json({ message: "Missing domain / field" });
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    const resolvedDifficulty = validDifficulties.includes(difficulty) ? difficulty : "Medium";

    console.log(`⚡ AI Interview Processing: [${jobRole}] [${domain}] [${resolvedDifficulty}]`);

    const aiData = await generateInterviewResponse(
      history || [],
      currentMessage.trim(),
      jobRole.trim(),
      resolvedDifficulty,
      domain.trim()
    );

    if (!aiData || !aiData.nextQuestion) {
      throw new Error("Invalid AI response: missing nextQuestion field");
    }

    return res.status(200).json(aiData);

  } catch (error) {
    console.error("❌ INTERVIEW STEP ERROR:", error.message);

    // Proper check — geminiService now rejects with Error objects that have .status
    if (error.status === 429) {
      return res.status(429).json({ message: "RPM limit reached. Please wait a moment." });
    }

    return res.status(500).json({ message: "AI interview failed to respond. Please try again." });
  }
};


/* ==================================================
   🔥 START INTERVIEW (INITIAL QUESTION)
================================================== */

exports.startInterview = async (req, res) => {
  try {
    const { jobRole, difficulty, domain } = req.body;

    // --- Input validation (matches processInterviewStep) ---
    if (!jobRole || typeof jobRole !== "string" || !jobRole.trim()) {
      return res.status(400).json({ message: "Missing job role" });
    }
    if (!domain || typeof domain !== "string" || !domain.trim()) {
      return res.status(400).json({ message: "Missing domain / field" });
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    const resolvedDifficulty = validDifficulties.includes(difficulty) ? difficulty : "Medium";

    console.log(`🤖 Starting AI Interview: [${jobRole}] [${domain}] [${resolvedDifficulty}]`);

    // Send an empty history and a trigger message to get the opening question
    const aiData = await generateInterviewResponse(
      [],
      "Hello, I am ready to begin the interview.",
      jobRole.trim(),
      resolvedDifficulty,
      domain.trim()
    );

    if (!aiData || !aiData.nextQuestion) {
      throw new Error("Invalid AI response: missing nextQuestion field");
    }

    return res.status(200).json(aiData);

  } catch (error) {
    console.error("❌ START INTERVIEW ERROR:", error.message);

    if (error.status === 429) {
      return res.status(429).json({ message: "RPM limit reached. Please wait a moment." });
    }

    return res.status(500).json({ message: "Failed to start interview. Please try again." });
  }
};
