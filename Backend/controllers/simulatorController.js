const { executeCode, LANG_CONFIG } = require("../services/dockerExecutor");
const callGemini = require("../services/geminiService");
const Question = require("../models/Question");
const User = require("../models/User");
const CompletedCode = require("../models/CompletedCode");

// ─── ERROR PARSING ENGINE ─────────────────────────────────────────────
/**
 * Parse raw stderr / compile_output into structured error info.
 * Returns { type, line, column, message, fullMessage } or null.
 */
function parseError(stderr, language, lineOffset = 0) {
  if (!stderr || !stderr.trim()) return null;

  const text = stderr.trim();
  let type = "RuntimeError";
  let line = null;
  let column = null;
  let message = text;

  // ─── C++ / g++ compilation errors ─────────────────────────────────
  if (language === "cpp") {
    // Pattern: solution.cpp:5:12: error: expected ';' before ...
    const compileMatch = text.match(/solution\.cpp:(\d+):(\d+):\s*(error|warning):\s*(.+)/i);
    if (compileMatch) {
      return {
        type: "CompilationError",
        line: Math.max(1, parseInt(compileMatch[1], 10) - lineOffset),
        column: parseInt(compileMatch[2], 10),
        message: compileMatch[4].split("\n")[0].trim(),
        fullMessage: text,
      };
    }
    const runtimeMatch = text.match(/line\s+(\d+)/i);
    if (runtimeMatch) {
      line = Math.max(1, parseInt(runtimeMatch[1], 10) - lineOffset);
    }
  }

  // ─── Java compilation errors ──────────────────────────────────────
  if (language === "java") {
    const compileMatch = text.match(/Main\.java:(\d+):\s*(error):\s*(.+)/i);
    if (compileMatch) {
      return {
        type: "CompilationError",
        line: Math.max(1, parseInt(compileMatch[1], 10) - lineOffset),
        column: null,
        message: compileMatch[3].split("\n")[0].trim(),
        fullMessage: text,
      };
    }
    const runtimeMatch = text.match(/Main\.java:(\d+)\)/);
    if (runtimeMatch) {
      line = Math.max(1, parseInt(runtimeMatch[1], 10) - lineOffset);
    }
    const exMatch = text.match(/(?:Exception|Error)(?:\s+in\s+.+)?:\s*(.+)/);
    if (exMatch) {
      message = exMatch[0].split("\n")[0].trim();
    }
  }

  // ─── Python errors ────────────────────────────────────────────────
  if (language === "python") {
    const syntaxMatch = text.match(/File\s+"[^"]*solution\.py",\s+line\s+(\d+)/);
    if (syntaxMatch) {
      line = Math.max(1, parseInt(syntaxMatch[1], 10) - lineOffset);
    }
    if (/SyntaxError/.test(text)) type = "SyntaxError";
    const lines = text.split("\n").filter((l) => l.trim());
    const lastLine = lines[lines.length - 1];
    if (lastLine && /Error/.test(lastLine)) {
      message = lastLine.trim();
    }
  }

  // ─── JavaScript errors ────────────────────────────────────────────
  if (language === "javascript") {
    const jsMatch = text.match(/solution\.js:(\d+)/);
    if (jsMatch) {
      line = Math.max(1, parseInt(jsMatch[1], 10) - lineOffset);
    }
    if (/SyntaxError/.test(text)) type = "SyntaxError";
    const msgMatch = text.match(/((?:Reference|Type|Syntax|Range|URI)Error:\s*.+)/);
    if (msgMatch) {
      message = msgMatch[1].split("\n")[0].trim();
    }
  }

  return { type, line, column, message, fullMessage: text };
}

/**
 * POST /api/simulator/run
 * Run code with optional custom stdin — returns raw output + parsed errors
 */
exports.runCode = async (req, res) => {
  try {
    const { code, language, stdin, entryPoint } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required." });
    }

    if (!LANG_CONFIG[language]) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const result = await executeCode(code, language, stdin || "", entryPoint);

    // Parse errors if present
    const errorText = result.stderr || result.compile_output || "";
    const parsedError = parseError(errorText, language, result.lineOffset);

    res.json({ ...result, parsedError });
  } catch (err) {
    console.error("runCode error:", err.message);
    res.status(500).json({ message: "Code execution failed", error: err.message });
  }
};

/**
 * GET /api/simulator/questions
 * Fetch all questions for the list view (summary only)
 */
exports.getQuestions = async (req, res) => {
  try {
    const questionsList = await Question.find({}, "title difficulty desc");
    
    // FETCH COMPLETED QUESTIONS FOR THIS USER FROM RELATIONAL TABLE
    let completedIds = [];
    if (req.user && req.user.id) {
      const completions = await CompletedCode.find({ userId: req.user.id }, "questionId");
      completedIds = completions.map(c => c.questionId.toString());
    }

    const processedQuestions = questionsList.map(q => ({
      ...q._doc,
      isCompleted: completedIds.includes(q._id.toString())
    }));

    res.json(processedQuestions);
  } catch (err) {
    console.error("getQuestions error:", err.message);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

/**
 * GET /api/simulator/questions/:id
 * Fetch full details for a single question
 */
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (err) {
    console.error("getQuestionById error:", err.message);
    res.status(500).json({ message: "Failed to fetch question details" });
  }
};

/**
 * POST /api/simulator/submit
 * Run code against multiple test cases retrieved from DB
 * Body: { code, language, questionId }
 */
exports.submitCode = async (req, res) => {
  try {
    const { code, language, questionId, entryPoint } = req.body;
    console.log(`[CONTROLLER DEBUG] language: ${language}, questionId: ${questionId}`);

    if (!code || !language || !questionId) {
      return res
        .status(400)
        .json({ message: "Code, language, and questionId are required." });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const testCases = question.testCases;
    const finalEntryPoint = entryPoint || question.entryPoint;

    if (!LANG_CONFIG[language]) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const results = [];

    for (const tc of testCases) {
      const result = await executeCode(code, language, tc.input || "", finalEntryPoint);

      const actualOutput = (result.stdout || "").trim();
      const expectedOutput = (tc.expectedOutput || "").trim();

      // Parse errors
      const errorText = result.stderr || result.compile_output || "";
      const parsedError = parseError(errorText, language);

      // Determine pass: only pass if no error AND output matches (ignoring spaces)
      const hasError = result.status.id !== 3;
      const normalizedActual = actualOutput.replace(/\s+/g, "");
      const normalizedExpected = expectedOutput.replace(/\s+/g, "");
      const passed = !hasError && normalizedActual === normalizedExpected;

      results.push({
        passed,
        hidden: tc.hidden || false,
        input: tc.hidden ? undefined : tc.input,
        expectedOutput: tc.hidden ? undefined : tc.expectedOutput,
        actualOutput: tc.hidden ? undefined : actualOutput,
        status: result.status,
        time: result.time,
        memory: result.memory,
        stderr: errorText,
        parsedError,
      });
    }

    const allPassed = results.every((r) => r.passed);
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    // ─── UPDATE USER PROGRESS ──────────────────────────────────────────
    if (req.user && req.user.id) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          user.totalSubmissions += 1;
          
          if (allPassed) {
            // RELATIONAL PERSISTENCE: Insert into CompletedCode mapping table
            try {
              const existingRecord = await CompletedCode.findOne({ 
                userId: req.user.id, 
                questionId 
              });

              if (!existingRecord) {
                await CompletedCode.create({ 
                  userId: req.user.id, 
                  questionId 
                });
                
                // Also increment the problemsSolved counter on the user
                await User.findByIdAndUpdate(req.user.id, { $inc: { problemsSolved: 1 } });
              }
            } catch (mappingErr) {
              console.error("Relational mapping insertion failed:", mappingErr.message);
            }
          }

          // Update accuracy: (Total Accepted Submissions across all problems) / (Total Submissions)
          const totalSuccessfulRaw = Math.round((user.accuracy / 100) * (user.totalSubmissions - 1));
          const newSuccessful = allPassed ? totalSuccessfulRaw + 1 : totalSuccessfulRaw;
          user.accuracy = Math.round((newSuccessful / user.totalSubmissions) * 100);

          // Update recent activity (keep last 10)
          user.recentActivity.unshift({
            problemId: questionId,
            problemTitle: question.title,
            status: allPassed ? 'Accepted' : 'Failed',
            language,
            timestamp: new Date()
          });
          if (user.recentActivity.length > 10) user.recentActivity.pop();

          // Update unique attempted questions (using addToSet to ensure uniqueness)
          if (!user.attemptedQuestions) user.attemptedQuestions = [];
          if (!user.attemptedQuestions.includes(questionId)) {
            user.attemptedQuestions.push(questionId);
          }

          user.lastActive = new Date();
          await user.save();
        }
      } catch (updateErr) {
        console.error("Failed to update user progress:", updateErr.message);
      }
    }

    res.json({ 
      allPassed, 
      status: allPassed ? "accepted" : "failed",
      questionId,
      passedCount, 
      totalCount, 
      results 
    });
  } catch (err) {
    console.error("submitCode error:", err.message);
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
};

/**
 * POST /api/simulator/evaluate  (Gemini-based feedback)
 */
exports.evaluateCode = async (req, res) => {
  try {
    const { code, language, problem } = req.body;

    const prompt = `
Evaluate this ${language} code.

Problem:
${problem}

Code:
${code}

Give:
- score out of 100
- time complexity
- optimization tips
`;

    const feedback = await callGemini(prompt);

    res.json({ feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Code evaluation failed" });
  }
};