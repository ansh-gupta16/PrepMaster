import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Layers,
  BarChart3,
  ChevronLeft,
  ArrowRight,
  PenTool,
  Timer,
} from "lucide-react";
import "./Assessments.css";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";

const Assessments = () => {

  const [activeSubject, setActiveSubject] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [customTopic, setCustomTopic] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionFeedback, setQuestionFeedback] = useState([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [backendResult, setBackendResult] = useState(null);

  const timerRef = useRef(null);

  const subjects = [
    { id: "dsa", title: "Data Structures & Algorithms", icon: <Layers size={24} />, color: "blue" },
    { id: "dbms", title: "Database Management", icon: <BookOpen size={24} />, color: "green" },
    { id: "os", title: "Operating Systems", icon: <BarChart3 size={24} />, color: "purple" },
    { id: "self", title: "Self Assessment", icon: <PenTool size={24} />, color: "purple", isCustom: true },
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatToBullets = (text) => {
    if (!text) return null;
    return text
      .split(/\n|\d+\./)
      .filter(line => line.trim() !== "")
      .map((line, index) => (
        <li key={index}>{line.trim()}</li>
      ));
  };

  /*
  ============================
  START ASSESSMENT
  ============================
  */

  const startAssessment = async (level) => {
    try {

      if (activeSubject.id === "self" && !customTopic.trim()) return;

      setLoadingAI(true);

      const topic =
        activeSubject.id === "self"
          ? customTopic
          : activeSubject.title;

      const res = await axios.post("/api/assessments/generate", {
        topic,
        difficulty: level,
      });

      const questions = res?.data?.questions || [];

      setAssessmentData(questions);
      setUserAnswers(Array(questions.length).fill(null));
      setQuestionFeedback(Array(questions.length).fill(null));
      setCurrentStep(0);
      setDifficulty(level);

      const duration =
        level === "Easy" ? 25 * 60 :
        level === "Medium" ? 45 * 60 :
        70 * 60;

      setTimeLeft(duration);
      setLoadingAI(false);

    } catch (err) {
      console.log(err);
      setLoadingAI(false);
    }
  };

  /*
  ============================
  TIMER
  ============================
  */

  useEffect(() => {
    if (!difficulty) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [difficulty]);

  /*
  ============================
  PER QUESTION REVIEW
  ============================
  */

  const submitCurrentQuestion = async () => {
    try {

      const q = assessmentData[currentStep];
      const ans = userAnswers[currentStep];

      if (!ans) return;

      setLoadingReview(true);

      const res = await axios.post(
        "/api/assessments/review-question",
        { question: q, answer: ans }
      );

      const updated = [...questionFeedback];
      updated[currentStep] = res.data.review;
      setQuestionFeedback(updated);

      setLoadingReview(false);

    } catch (err) {
      console.log(err);
      setLoadingReview(false);
    }
  };

  const handleNext = () => {
    if (currentStep < assessmentData.length - 1)
      setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (currentStep < assessmentData.length - 1)
      setCurrentStep(currentStep + 1);
    else
      finishAssessment();
  };

  /*
  ============================
  FINAL SUBMIT
  ============================
  */

  const finishAssessment = async () => {
    try {

      clearInterval(timerRef.current);

      const topic =
        activeSubject?.id === "self"
          ? customTopic
          : activeSubject?.title;

      const res = await axios.post("/api/assessments/submit", {
        topic,
        questions: assessmentData,
        answers: userAnswers,
        difficulty,
      });

      setBackendResult(res.data);
      setShowResults(true);

    } catch (err) {
      console.log(err);
    }
  };

  /*
  ============================
  RESULTS SCREEN
  ============================
  */

  if (showResults && backendResult) {

  return (
    <div className="assessment-active slide-in-right">
      <div className="assessment-window glass-card results-container">

        <h1>🎉 Assessment Completed</h1>

        <p className="final-score-text">
          Score: <span>{backendResult.percentage}%</span>
        </p>

        <div className="ai-card">
          <h3>📊 Performance Summary</h3>
          <p>✅ Correct: {backendResult.correct}</p>
          <p>❌ Incorrect: {backendResult.incorrect}</p>
          <p>⏭ Skipped: {backendResult.skipped}</p>
        </div>

        {backendResult.detailedReview.length > 0 && (
          <div className="ai-card">
            <h3>📘 Detailed Review</h3>

            {backendResult.detailedReview.map((item, index) => (
              <div key={index} className="review-item">

                <p><strong>Question:</strong> {item.question}</p>

                <p style={{ color: "#ff6b6b" }}>
                  <strong>Your Answer:</strong> {item.userAnswer}
                </p>

                <p style={{ color: "lightgreen" }}>
                  <strong>Correct Answer:</strong> {item.correctAnswer}
                </p>

                <p>
                  <strong>Why Correct:</strong> {item.explanation}
                </p>

                <hr style={{ margin: "15px 0" }} />

              </div>
            ))}

          </div>
        )}

        <button
          className="btn-submit"
          onClick={() => {
            setShowResults(false);
            setDifficulty(null);
            setActiveSubject(null);
          }}
        >
          Back to Assessments
        </button>

      </div>
    </div>
  );
}

  /*
  ============================
  QUESTION SCREEN
  ============================
  */

  if (difficulty) {

    const q = assessmentData?.[currentStep];

    return (
      <div className="assessment-active slide-in-right">
        <header className="assessment-header">
          <button className="back-link" onClick={() => setDifficulty(null)}>
            <ChevronLeft size={18} /> Exit
          </button>

          <div className="timer-display">
            <Timer size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <span className={`diff-pill ${difficulty.toLowerCase()}`}>
            {difficulty}
          </span>
        </header>

        <div className="assessment-window glass-card">

          <p className="question-text">
            Q{currentStep + 1} / {assessmentData.length}. {q?.text}
          </p>

          {q?.options ? (
            <div className="options-grid">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={questionFeedback[currentStep]}
                  className={`option-btn ${
                    userAnswers[currentStep] === opt ? "selected" : ""
                  }`}
                  onClick={() => {
                    const updated = [...userAnswers];
                    updated[currentStep] = opt;
                    setUserAnswers(updated);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              disabled={questionFeedback[currentStep]}
              className="subjective-input"
              value={userAnswers[currentStep] || ""}
              onChange={(e) => {
                const updated = [...userAnswers];
                updated[currentStep] = e.target.value;
                setUserAnswers(updated);
              }}
            />
          )}

          {!questionFeedback[currentStep] && (
            <button
              className="btn-submit small-submit"
              onClick={submitCurrentQuestion}
            >
              {loadingReview ? "AI Reviewing..." : "Submit & Get Feedback"}
            </button>
          )}

          {questionFeedback[currentStep] && (
  <div className="ai-review-card">

    {questionFeedback[currentStep].status === "correct" ? (
      <p style={{ color: "lightgreen", fontWeight: "bold" }}>
        ✅ Correct Answer
      </p>
    ) : (
      <>
        <p style={{ color: "#ff6b6b", fontWeight: "bold" }}>
          ❌ Your Answer: {questionFeedback[currentStep].userAnswer}
        </p>

        <p style={{ color: "lightgreen", fontWeight: "bold" }}>
          ✅ Correct Answer: {questionFeedback[currentStep].correctAnswer}
        </p>

        <p style={{ marginTop: "8px" }}>
          💡 {questionFeedback[currentStep].explanation}
        </p>
      </>
    )}

  </div>
)}
          <footer className="question-footer">

            <button className="btn-secondary" onClick={handleSkip}>
              Skip
            </button>

            {currentStep < assessmentData.length - 1 ? (
              <button
                className="btn-submit"
                disabled={!questionFeedback[currentStep]}
                onClick={handleNext}
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button
                className="btn-submit finish"
                onClick={finishAssessment}
              >
                Finish
              </button>
            )}

          </footer>

        </div>
      </div>
    );
  }

  /*
  ============================
  SUBJECT SELECTION
  ============================
  */

  if (activeSubject) {
    return (
      <div className="difficulty-selection animated-fade">
        <button className="back-link" onClick={() => setActiveSubject(null)}>
          <ChevronLeft size={18} /> Back
        </button>

        <div className="selection-header">
          <h1>{activeSubject.title}</h1>

          {activeSubject.id === "self" && (
            <input
              type="text"
              className="subjective-input custom-topic-field"
              placeholder="Topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          )}
        </div>

        <div className="difficulty-grid">
          {["Easy", "Medium", "Hard"].map((level) => (
            <button
              key={level}
              className={`diff-card ${level.toLowerCase()}`}
              onClick={() => startAssessment(level)}
            >
              {loadingAI ? "Generating AI..." : level}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /*
  ============================
  SUBJECT LIST
  ============================
  */

  return (
    <div className="assessments-container animated-fade">
      <div className="subjects-grid">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className={`subject-card glass-card ${sub.color}`}
            onClick={() => setActiveSubject(sub)}
          >
            <div className="subject-info">
              <div className="subject-icon">{sub.icon}</div>
              <h3>{sub.title}</h3>
            </div>
            <button className="start-btn">Choose Subject</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;