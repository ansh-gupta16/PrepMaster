// // const {
// //   generateInterviewResponse
// // } = require("../services/geminiService");

// // /*
// // ===================================================
// //  🤖 AI INTERVIEW SESSION (LIVE CHAT)
// // ===================================================
// // */

// // exports.processInterviewStep = async (req, res) => {
// //   try {
// //     const { history, currentMessage, jobRole, difficulty } = req.body;

// //     if (!currentMessage || !jobRole) {
// //       return res.status(400).json({
// //         message: "Missing message or job role"
// //       });
// //     }

// //     console.log(`⚡ AI Interview Processing: [${jobRole}] - ${difficulty}`);

// //     const aiData = await generateInterviewResponse(
// //       history || [], 
// //       currentMessage, 
// //       jobRole, 
// //       difficulty || "Intermediate"
// //     );

// //     if (!aiData || !aiData.nextQuestion) {
// //       throw new Error("Invalid AI response format");
// //     }

// //     res.status(200).json(aiData);

// //   } catch (error) {
// //     console.error("❌ INTERVIEW ERROR:", error.message);

// //     res.status(500).json({
// //       message: "AI Interview Failed to respond"
// //     });
// //   }
// // };

// // /*
// // ===================================================
// //  🔥 START INTERVIEW (INITIAL QUESTION)
// // ===================================================
// // */

// // exports.startInterview = async (req, res) => {
// //   try {
// //     const { jobRole, difficulty } = req.body;

// //     console.log("🤖 Initializing AI Interview for:", jobRole);

// //     // We send an empty history and a "Hello" to trigger the first question
// //     const aiData = await generateInterviewResponse(
// //       [], 
// //       "Hello, I am ready for the interview.", 
// //       jobRole, 
// //       difficulty
// //     );

// //     res.status(200).json(aiData);

// //   } catch (error) {
// //     console.error("❌ START ERROR:", error.message);
// //     res.status(500).json({ message: "Failed to start interview" });
// //   }
// // };

// const {
//   generateInterviewResponse
// } = require("../services/geminiService");

// /*
// ===================================================
//  🤖 AI INTERVIEW SESSION (LIVE CHAT)
// ===================================================
// */

// exports.processInterviewStep = async (req, res) => {
//   try {
//     const { history, currentMessage, jobRole, difficulty } = req.body;

//     if (!currentMessage || !jobRole) {
//       return res.status(400).json({
//         message: "Missing message or job role"
//       });
//     }

//     console.log(`⚡ AI Interview Processing: [${jobRole}] - ${difficulty}`);

//     const aiData = await generateInterviewResponse(
//       history || [], 
//       currentMessage, 
//       jobRole, 
//       difficulty || "Intermediate"
//     );

//     if (!aiData || !aiData.nextQuestion) {
//       throw new Error("Invalid AI response format");
//     }

//     res.status(200).json(aiData);

//   } catch (error) {
//     console.error("❌ INTERVIEW ERROR:", error.message);

//     // 🔥 NEW: Check for the 429 Rate Limit from geminiService
//     if (error.status === 429 || error.message?.includes("429")) {
//         return res.status(429).json({
//             message: "Gemini API Rate Limit Reached. Concluding session."
//         });
//     }

//     res.status(500).json({
//       message: "AI Interview Failed to respond"
//     });
//   }
// };

// /*
// ===================================================
//  🔥 START INTERVIEW (INITIAL QUESTION)
// ===================================================
// */

// exports.startInterview = async (req, res) => {
//   try {
//     const { jobRole, difficulty } = req.body;

//     console.log("🤖 Initializing AI Interview for:", jobRole);

//     // We send an empty history and a "Hello" to trigger the first question
//     const aiData = await generateInterviewResponse(
//       [], 
//       "Hello, I am ready for the interview.", 
//       jobRole, 
//       difficulty
//     );

//     res.status(200).json(aiData);

//   } catch (error) {
//     console.error("❌ START ERROR:", error.message);

//     // 🔥 NEW: Handle RPM limit during start
//     if (error.status === 429 || error.message?.includes("429")) {
//         return res.status(429).json({ message: "RPM Limit Reached" });
//     }

//     res.status(500).json({ message: "Failed to start interview" });
//   }
// };



const {
  generateInterviewResponse
} = require("../services/geminiService");

/*
===================================================
 🤖 AI INTERVIEW SESSION (LIVE CHAT)
===================================================
*/

exports.processInterviewStep = async (req, res) => {
  try {
    const { history, currentMessage, jobRole, difficulty } = req.body;

    if (!currentMessage || !jobRole) {
      return res.status(400).json({
        message: "Missing message or job role"
      });
    }

    console.log(`⚡ AI Interview Processing: [${jobRole}] - ${difficulty}`);

    const aiData = await generateInterviewResponse(
      history || [], 
      currentMessage, 
      jobRole, 
      difficulty || "Intermediate"
    );

    if (!aiData || !aiData.nextQuestion) {
      throw new Error("Invalid AI response format");
    }

    res.status(200).json(aiData);

  } catch (error) {
    console.error("❌ INTERVIEW ERROR:", error.message);

    // 🔥 NEW: Send 429 status if rate limit was reached
    if (error.status === 429 || error.message?.includes("429")) {
        return res.status(429).json({ message: "RPM Limit Reached" });
    }

    res.status(500).json({
      message: "AI Interview Failed to respond"
    });
  }
};

/*
===================================================
 🔥 START INTERVIEW (INITIAL QUESTION)
===================================================
*/

exports.startInterview = async (req, res) => {
  try {
    const { jobRole, difficulty } = req.body;

    console.log("🤖 Initializing AI Interview for:", jobRole);

    // We send an empty history and a "Hello" to trigger the first question
    const aiData = await generateInterviewResponse(
      [], 
      "Hello, I am ready for the interview.", 
      jobRole, 
      difficulty
    );

    res.status(200).json(aiData);

  } catch (error) {
    console.error("❌ START ERROR:", error.message);
    
    if (error.status === 429 || error.message?.includes("429")) {
        return res.status(429).json({ message: "RPM Limit Reached" });
    }

    res.status(500).json({ message: "Failed to start interview" });
  }
};