const axios = require("axios");

console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY ? "✅ Found" : "❌ Missing");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


/* ==================================================
   GEMINI QUEUE (ANTI RATE LIMIT)
   - Uses separate queues for interview vs quiz so
     they cannot starve each other
   - rejects with proper Error objects (not plain objects)
     so controller instanceof / .status checks work reliably
================================================== */

const createQueue = (delayMs = 2500) => {
  const queue = [];
  let processing = false;

  const process = async () => {
    if (processing || queue.length === 0) return;
    processing = true;

    const { prompt, resolve, reject } = queue.shift();

    try {
      const response = await axios.post(
        GEMINI_URL,
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 4096
          }
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Invalid Gemini response: no text returned");
      resolve(text);

    } catch (error) {
      // Reject with a proper Error so .status and .message are both reliable
      if (error.response && error.response.status === 429) {
        const rpmError = new Error("RPM Limit Reached");
        rpmError.status = 429;
        reject(rpmError);
      } else {
        reject(error);
      }
    } finally {
      setTimeout(() => {
        processing = false;
        process();
      }, delayMs);
    }
  };

  const enqueue = (prompt) =>
    new Promise((resolve, reject) => {
      queue.push({ prompt, resolve, reject });
      process();
    });

  return enqueue;
};

// Separate queues: interview gets priority (lower delay), quiz runs independently
const callGeminiInterview = createQueue(2000);
const callGeminiQuiz = createQueue(2500);


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
    throw new Error("No JSON object found in Gemini response");

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
  "questions": [
    {
      "type": "mcq",
      "text": "question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "concept": "Topic"
    },
    {
      "type": "subjective",
      "text": "question",
      "correctAnswer": "Expected explanation",
      "concept": "Topic"
    }
  ]
}
`;

  const aiText = await callGeminiQuiz(prompt);
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

    if (q.type === "mcq") {
      const isCorrect = userAnswer === q.correctAnswer;
      reviews[i] = isCorrect
        ? { status: "correct" }
        : {
            status: "wrong",
            userAnswer: userAnswer || "No Answer",
            correctAnswer: q.correctAnswer,
            explanation: `Correct answer is "${q.correctAnswer}".`
          };
    } else {
      const prompt = `
Evaluate the answer.

Question: ${q.text}
CorrectAnswer: ${q.correctAnswer}
UserAnswer: ${userAnswer}

Return STRICT JSON:
{
  "status": "correct | wrong",
  "explanation": "short explanation",
  "correctAnswer": "improved correct answer"
}
`;
      const aiText = await callGeminiQuiz(prompt);
      reviews[i] = extractJSON(aiText);
    }
  }

  return { reviews };
};


/* ==================================================
   TUTOR FEEDBACK
================================================== */

const generateTutorFeedback = async (topic, difficulty, score, weakAreas) => {
  const prompt = `
Give short feedback for a student.
Topic: ${topic}
Difficulty: ${difficulty}
Score: ${score}
Weak Areas: ${weakAreas}

Return STRICT JSON:
{
  "strengths": "text",
  "weaknesses": "text",
  "improvementPlan": "text",
  "aiAdvice": "text"
}
`;

  const aiText = await callGeminiQuiz(prompt);
  return extractJSON(aiText);
};


/* ==================================================
   AI INTERVIEW ENGINE

   Difficulty behaviour:
   - Easy:   Beginner-friendly, conceptual, forgiving tone
   - Medium: Standard technical + behavioural mix
   - Hard:   Deep-dive, follow-up on gaps, no hints

   The full conversation history is embedded as structured
   turns in the prompt so Gemini maintains context across
   the session without multi-turn API calls.
================================================== */

const DIFFICULTY_INSTRUCTIONS = {
  Easy: `
- Ask beginner-friendly questions on fundamentals.
- Keep questions clear and concise with no ambiguity.
- Be encouraging in your feedback tone.
- Do NOT ask trick questions or deep algorithmic problems.
- If the answer is partially correct, acknowledge what was right.`,

  Medium: `
- Mix technical questions with behavioural (STAR-format) ones.
- Ask follow-up questions if an answer is vague or incomplete.
- Keep a professional, neutral tone in feedback.
- Expect solid understanding, not expert-level depth.`,

  Hard: `
- Ask advanced, nuanced, or system-design-level questions.
- Critically analyse the candidate's answer for gaps or assumptions.
- Do NOT give hints or simplify questions.
- Apply pressure through realistic follow-ups like a senior engineer would.
- Reward precision; note any hand-waving or vague answers.`
};

const generateInterviewResponse = async (history, currentMessage, jobRole, difficulty, domain) => {
  const difficultyGuide = DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS["Medium"];

  const historyText = history.length > 0
    ? history
        .map(h => `${h.role === "user" ? "Candidate" : "Interviewer"}: ${h.text}`)
        .join("\n")
    : "No prior conversation yet.";

  const prompt = `
You are an expert technical interviewer conducting a ${difficulty}-level interview.
Job Role: ${jobRole}
Domain / Field: ${domain || "General Technology"}

Difficulty Instructions:
${difficultyGuide}

Conversation so far:
${historyText}

Candidate's latest response: "${currentMessage}"

Your tasks:
1. Briefly acknowledge or give feedback on the candidate's response (1-2 sentences, match the difficulty tone).
2. Ask the next logical interview question suited to the role, domain, and difficulty level.
3. Set "isEnd" to true ONLY if 10 or more exchanges have happened OR if the candidate explicitly asks to end the interview.

Return STRICT JSON only — no markdown, no preamble:
{
  "feedback": "Short feedback on the candidate's previous answer",
  "nextQuestion": "The next interview question",
  "isEnd": false
}
`;

  const aiText = await callGeminiInterview(prompt);
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
