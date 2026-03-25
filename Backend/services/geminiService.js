// // const axios = require("axios");

// // console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY);

// // const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// // const GEMINI_URL =
// // `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// // /* ==================================================
// //    GEMINI QUEUE (ANTI RATE LIMIT)
// // ================================================== */

// // const requestQueue = [];
// // let isProcessing = false;
// // const QUEUE_DELAY = 2500;

// // const processQueue = async () => {

// //   if (isProcessing || requestQueue.length === 0) return;

// //   isProcessing = true;

// //   const item = requestQueue.shift();
// //   const { prompt, resolve, reject } = item;

// //   try {

// //     const response = await axios.post(
// //       GEMINI_URL,
// //       {
// //         contents: [
// //           { role: "user", parts: [{ text: prompt }] }
// //         ],
// //         generationConfig: {
// //           temperature: 0.6,
// //           maxOutputTokens: 4096
// //         }
// //       },
// //       { headers: { "Content-Type": "application/json" } }
// //     );

// //     const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

// //     if (!text) throw new Error("Invalid Gemini response");

// //     resolve(text);

// //   } catch (error) {
// //     reject(error);
// //   } finally {
// //     setTimeout(() => {
// //       isProcessing = false;
// //       processQueue();
// //     }, QUEUE_DELAY);
// //   }
// // };

// // const callGemini = (prompt) =>
// //   new Promise((resolve, reject) => {
// //     requestQueue.push({ prompt, resolve, reject });
// //     processQueue();
// //   });


// // /* ==================================================
// //    SAFE JSON PARSER
// // ================================================== */

// // const extractJSON = (text) => {

// //   const cleaned = text
// //     .replace(/```json/gi, "")
// //     .replace(/```/g, "")
// //     .trim();

// //   const start = cleaned.indexOf("{");
// //   const end = cleaned.lastIndexOf("}");

// //   if (start === -1 || end === -1)
// //     throw new Error("No JSON found");

// //   return JSON.parse(cleaned.slice(start, end + 1));
// // };


// // /* ==================================================
// //    QUESTION GENERATOR
// // ================================================== */

// // const generateQuestionsAI = async (topic, difficulty) => {

// //   const prompt = `
// // Generate EXACTLY 10 questions.
// // Topic: ${topic}
// // Difficulty: ${difficulty}

// // Return STRICT JSON:
// // {
// //  "questions":[
// //   {
// //    "type":"mcq",
// //    "text":"question",
// //    "options":["A","B","C","D"],
// //    "correctAnswer":"A",
// //    "concept":"Topic"
// //   },
// //   {
// //    "type":"subjective",
// //    "text":"question",
// //    "correctAnswer":"Expected explanation",
// //    "concept":"Topic"
// //   }
// //  ]
// // }
// // `;

// //   const aiText = await callGemini(prompt);
// //   return extractJSON(aiText);
// // };


// // /* ==================================================
// //    QUESTION REVIEW ENGINE
// // ================================================== */

// // const generateQuestionWiseReview = async (questions, answers) => {

// //   const reviews = [];

// //   for (let i = 0; i < questions.length; i++) {

// //     const q = questions[i];
// //     const userAnswer = answers[i];

// //     // ---------- MCQ ----------
// //     if (q.type === "mcq") {

// //       const isCorrect = userAnswer === q.correctAnswer;

// //       if (isCorrect) {
// //         reviews[i] = {
// //           status: "correct"
// //         };
// //       } else {
// //         reviews[i] = {
// //           status: "wrong",
// //           userAnswer: userAnswer || "No Answer",
// //           correctAnswer: q.correctAnswer,
// //           explanation: `Correct answer is "${q.correctAnswer}".`
// //         };
// //       }

// //     } 
// //     // ---------- SUBJECTIVE ----------
// //     else {

// //       const prompt = `
// // Evaluate the answer.

// // Question: ${q.text}
// // CorrectAnswer: ${q.correctAnswer}
// // UserAnswer: ${userAnswer}

// // Return STRICT JSON:
// // {
// //  "status":"correct | wrong",
// //  "explanation":"short explanation",
// //  "correctAnswer":"improved correct answer"
// // }
// // `;

// //       const aiText = await callGemini(prompt);
// //       const aiData = extractJSON(aiText);

// //       reviews[i] = aiData;
// //     }
// //   }

// //   return { reviews };
// // };


// // /* ==================================================
// //    TUTOR FEEDBACK
// // ================================================== */

// // const generateTutorFeedback = async (
// //   topic,
// //   difficulty,
// //   score,
// //   weakAreas
// // ) => {

// //   const prompt = `
// // Give short feedback.

// // Return STRICT JSON:
// // {
// //  "strengths":"text",
// //  "weaknesses":"text",
// //  "improvementPlan":"text",
// //  "aiAdvice":"text"
// // }
// // `;

// //   const aiText = await callGemini(prompt);
// //   return extractJSON(aiText);
// // };


// // /* ==================================================
// //    AI INTERVIEW ENGINE
// // ================================================== */

// // const generateInterviewResponse = async (history, currentMessage, jobRole, difficulty) => {
// //   const prompt = `
// //     You are an expert technical interviewer for the role of ${jobRole}.
// //     Difficulty Level: ${difficulty}.
    
// //     Current Conversation History:
// //     ${history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join("\n")}
    
// //     Candidate's Latest Response: "${currentMessage}"
    
// //     Task: 
// //     1. Analyze the candidate's response for technical accuracy.
// //     2. Provide a very brief feedback/acknowledgment.
// //     3. Ask the NEXT logical technical or behavioral question to continue the interview.
    
// //     Return STRICT JSON:
// //     {
// //       "feedback": "Short feedback on previous answer",
// //       "nextQuestion": "The next interview question",
// //       "isEnd": false
// //     }
// //   `;

// //   const aiText = await callGemini(prompt);
// //   return extractJSON(aiText);
// // };


// // /* ==================================================
// //    EXPORTS
// // ================================================== */

// // module.exports = {
// //   generateQuestionsAI,
// //   generateQuestionWiseReview,
// //   generateTutorFeedback,
// //   generateInterviewResponse
// // };

// const axios = require("axios");

// console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY);

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// // 🔥 KEEPING YOUR WORKING URL EXACTLY AS IS
// const GEMINI_URL =
// `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// /* ==================================================
//    GEMINI QUEUE (ANTI RATE LIMIT)
// ================================================== */

// const requestQueue = [];
// let isProcessing = false;
// const QUEUE_DELAY = 2500;

// const processQueue = async () => {

//   if (isProcessing || requestQueue.length === 0) return;

//   isProcessing = true;

//   const item = requestQueue.shift();
//   const { prompt, resolve, reject } = item;

//   try {

//     const response = await axios.post(
//       GEMINI_URL,
//       {
//         contents: [
//           { role: "user", parts: [{ text: prompt }] }
//         ],
//         generationConfig: {
//           temperature: 0.6,
//           maxOutputTokens: 4096
//         }
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );

//     const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!text) throw new Error("Invalid Gemini response");

//     resolve(text);

//   } catch (error) {
//     // 🔥 NEW: Identify 429 specifically so the Frontend can trigger the exit
//     if (error.response && error.response.status === 429) {
//         reject({ status: 429, message: "RPM Limit Reached" });
//     } else {
//         reject(error);
//     }
//   } finally {
//     setTimeout(() => {
//       isProcessing = false;
//       processQueue();
//     }, QUEUE_DELAY);
//   }
// };

// const callGemini = (prompt) =>
//   new Promise((resolve, reject) => {
//     requestQueue.push({ prompt, resolve, reject });
//     processQueue();
//   });


// /* ==================================================
//    SAFE JSON PARSER
// ================================================== */

// const extractJSON = (text) => {

//   const cleaned = text
//     .replace(/```json/gi, "")
//     .replace(/```/g, "")
//     .trim();

//   const start = cleaned.indexOf("{");
//   const end = cleaned.lastIndexOf("}");

//   if (start === -1 || end === -1)
//     throw new Error("No JSON found");

//   return JSON.parse(cleaned.slice(start, end + 1));
// };


// /* ==================================================
//    QUESTION GENERATOR
// ================================================== */

// const generateQuestionsAI = async (topic, difficulty) => {

//   const prompt = `
// Generate EXACTLY 10 questions.
// Topic: ${topic}
// Difficulty: ${difficulty}

// Return STRICT JSON:
// {
//  "questions":[
//   {
//    "type":"mcq",
//    "text":"question",
//    "options":["A","B","C","D"],
//    "correctAnswer":"A",
//    "concept":"Topic"
//   },
//   {
//    "type":"subjective",
//    "text":"question",
//    "correctAnswer":"Expected explanation",
//    "concept":"Topic"
//   }
//  ]
// }
// `;

//   const aiText = await callGemini(prompt);
//   return extractJSON(aiText);
// };


// /* ==================================================
//    QUESTION REVIEW ENGINE
// ================================================== */

// const generateQuestionWiseReview = async (questions, answers) => {

//   const reviews = [];

//   for (let i = 0; i < questions.length; i++) {

//     const q = questions[i];
//     const userAnswer = answers[i];

//     // ---------- MCQ ----------
//     if (q.type === "mcq") {

//       const isCorrect = userAnswer === q.correctAnswer;

//       if (isCorrect) {
//         reviews[i] = {
//           status: "correct"
//         };
//       } else {
//         reviews[i] = {
//           status: "wrong",
//           userAnswer: userAnswer || "No Answer",
//           correctAnswer: q.correctAnswer,
//           explanation: `Correct answer is "${q.correctAnswer}".`
//         };
//       }

//     } 
//     // ---------- SUBJECTIVE ----------
//     else {

//       const prompt = `
// Evaluate the answer.

// Question: ${q.text}
// CorrectAnswer: ${q.correctAnswer}
// UserAnswer: ${userAnswer}

// Return STRICT JSON:
// {
//  "status":"correct | wrong",
//  "explanation":"short explanation",
//  "correctAnswer":"improved correct answer"
// }
// `;

//       const aiText = await callGemini(prompt);
//       const aiData = extractJSON(aiText);

//       reviews[i] = aiData;
//     }
//   }

//   return { reviews };
// };


// /* ==================================================
//    TUTOR FEEDBACK
// ================================================== */

// const generateTutorFeedback = async (
//   topic,
//   difficulty,
//   score,
//   weakAreas
// ) => {

//   const prompt = `
// Give short feedback.

// Return STRICT JSON:
// {
//  "strengths":"text",
//  "weaknesses":"text",
//  "improvementPlan":"text",
//  "aiAdvice":"text"
// }
// `;

//   const aiText = await callGemini(prompt);
//   return extractJSON(aiText);
// };


// /* ==================================================
//    AI INTERVIEW ENGINE
// ================================================== */

// const generateInterviewResponse = async (history, currentMessage, jobRole, difficulty) => {
//   const prompt = `
//     You are an expert technical interviewer for the role of ${jobRole}.
//     Difficulty Level: ${difficulty}.
    
//     Current Conversation History:
//     ${history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join("\n")}
    
//     Candidate's Latest Response: "${currentMessage}"
    
//     Task: 
//     1. Analyze the candidate's response for technical accuracy.
//     2. Provide a very brief feedback/acknowledgment.
//     3. Ask the NEXT logical technical or behavioral question to continue the interview.
    
//     Return STRICT JSON:
//     {
//       "feedback": "Short feedback on previous answer",
//       "nextQuestion": "The next interview question",
//       "isEnd": false
//     }
//   `;

//   const aiText = await callGemini(prompt);
//   return extractJSON(aiText);
// };


// /* ==================================================
//    EXPORTS
// ================================================== */

// module.exports = {
//   generateQuestionsAI,
//   generateQuestionWiseReview,
//   generateTutorFeedback,
//   generateInterviewResponse
// };




const axios = require("axios");

console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


/* ==================================================
   GEMINI QUEUE (ANTI RATE LIMIT)
================================================== */

const requestQueue = [];
let isProcessing = false;
const QUEUE_DELAY = 2500;

const processQueue = async () => {

  if (isProcessing || requestQueue.length === 0) return;

  isProcessing = true;

  const item = requestQueue.shift();
  const { prompt, resolve, reject } = item;

  try {

    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 4096
        }
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Invalid Gemini response");

    resolve(text);

  } catch (error) {
    // 🔥 NEW: Specifically identify 429 status
    if (error.response && error.response.status === 429) {
        reject({ status: 429, message: "Limit Reached" });
    } else {
        reject(error);
    }
  } finally {
    setTimeout(() => {
      isProcessing = false;
      processQueue();
    }, QUEUE_DELAY);
  }
};

const callGemini = (prompt) =>
  new Promise((resolve, reject) => {
    requestQueue.push({ prompt, resolve, reject });
    processQueue();
  });


/* ==================================================
   SAFE JSON PARSER
================================================== */

const extractJSON = (text) => {

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1)
    throw new Error("No JSON found");

  return JSON.parse(cleaned.slice(start, end + 1));
};


/* ==================================================
   QUESTION GENERATOR
================================================== */

const generateQuestionsAI = async (topic, difficulty) => {

  const prompt = `
Generate EXACTLY 10 questions.
Topic: ${topic}
Difficulty: ${difficulty}

Return STRICT JSON:
{
 "questions":[
  {
   "type":"mcq",
   "text":"question",
   "options":["A","B","C","D"],
   "correctAnswer":"A",
   "concept":"Topic"
  },
  {
   "type":"subjective",
   "text":"question",
   "correctAnswer":"Expected explanation",
   "concept":"Topic"
  }
 ]
}
`;

  const aiText = await callGemini(prompt);
  return extractJSON(aiText);
};


/* ==================================================
   QUESTION REVIEW ENGINE
================================================== */

const generateQuestionWiseReview = async (questions, answers) => {

  const reviews = [];

  for (let i = 0; i < questions.length; i++) {

    const q = questions[i];
    const userAnswer = answers[i];

    // ---------- MCQ ----------
    if (q.type === "mcq") {

      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) {
        reviews[i] = {
          status: "correct"
        };
      } else {
        reviews[i] = {
          status: "wrong",
          userAnswer: userAnswer || "No Answer",
          correctAnswer: q.correctAnswer,
          explanation: `Correct answer is "${q.correctAnswer}".`
        };
      }

    } 
    // ---------- SUBJECTIVE ----------
    else {

      const prompt = `
Evaluate the answer.

Question: ${q.text}
CorrectAnswer: ${q.correctAnswer}
UserAnswer: ${userAnswer}

Return STRICT JSON:
{
 "status":"correct | wrong",
 "explanation":"short explanation",
 "correctAnswer":"improved correct answer"
}
`;

      const aiText = await callGemini(prompt);
      const aiData = extractJSON(aiText);

      reviews[i] = aiData;
    }
  }

  return { reviews };
};


/* ==================================================
   TUTOR FEEDBACK
================================================== */

const generateTutorFeedback = async (
  topic,
  difficulty,
  score,
  weakAreas
) => {

  const prompt = `
Give short feedback.

Return STRICT JSON:
{
 "strengths":"text",
 "weaknesses":"text",
 "improvementPlan":"text",
 "aiAdvice":"text"
}
`;

  const aiText = await callGemini(prompt);
  return extractJSON(aiText);
};


/* ==================================================
   AI INTERVIEW ENGINE
================================================== */

const generateInterviewResponse = async (history, currentMessage, jobRole, difficulty) => {
  const prompt = `
    You are an expert technical interviewer for the role of ${jobRole}.
    Difficulty Level: ${difficulty}.
    
    Current Conversation History:
    ${history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join("\n")}
    
    Candidate's Latest Response: "${currentMessage}"
    
    Task: 
    1. Analyze the candidate's response for technical accuracy.
    2. Provide a very brief feedback/acknowledgment.
    3. Ask the NEXT logical technical or behavioral question to continue the interview.
    
    Return STRICT JSON:
    {
      "feedback": "Short feedback on previous answer",
      "nextQuestion": "The next interview question",
      "isEnd": false
    }
  `;

  const aiText = await callGemini(prompt);
  return extractJSON(aiText);
};


/* ==================================================
   EXPORTS
================================================== */

module.exports = {
  generateQuestionsAI,
  generateQuestionWiseReview,
  generateTutorFeedback,
  generateInterviewResponse
};