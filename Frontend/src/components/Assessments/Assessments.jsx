import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Layers,
  BarChart3,
  ChevronLeft,
  ArrowRight,
  PenTool,
  Timer,
  Lightbulb,
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
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [backendResult, setBackendResult] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

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
      setExpandedCategory(null);

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
      <div className="assessment-active results-dashboard animated-fade">
        <div className="assessment-window glass-card results-container">
          <div className="results-header slide-in-bottom">
            <div className="confetti-icon">🎉</div>
            <h1>Assessment Completed</h1>
            <div className="score-main">
              <div className="score-circle">
                <span className="score-number">{backendResult.percentage}%</span>
                <span className="score-label">Overall Score</span>
              </div>
            </div>
          </div>          <div className="results-grid slide-in-bottom" style={{ animationDelay: "0.1s" }}>
            <div className="summary-dashboard">
              <h3>📊 Performance Review</h3>
              <p className="summary-lead">Click a category below to review your answers and learn from the AI explanations.</p>
              
              <div className="dropdown-container">
                {['correct', 'incorrect', 'skipped'].map((cat) => {
                  const label = cat.charAt(0).toUpperCase() + cat.slice(1);
                  const count = backendResult[cat] || 0;
                  const isExpanded = expandedCategory === cat;
                  
                  // Filter items for this category
                  const items = backendResult.detailedReview.filter(item => item.status === cat);

                  if (count === 0 && items.length === 0) return null;

                  return (
                    <div key={cat} className={`dropdown-section ${cat} ${isExpanded ? 'expanded' : ''}`}>
                      <button 
                        className="dropdown-trigger" 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                      >
                        <div className="trigger-left">
                          <span className="status-dot"></span>
                          <span className="category-label">{label}</span>
                        </div>
                        <div className="trigger-right">
                          <span className="category-count">{count} Questions</span>
                          <ArrowRight className="chevron-icon" size={18} />
                        </div>
                      </button>

                      <div className="dropdown-content">
                        <div className="review-scroll-wrapper">
                          <div className="scroll-gradient top"></div>
                          <div className="review-scroll-area">
                            <div className="review-list">
                              {items.map((item) => (
                                <div key={item.questionNumber} className="review-card-modern">
                                  <div className="q-header">
                                    <span className="q-badge">Question {item.questionNumber}</span>
                                    <p className="q-text-bold">{item.question}</p>
                                  </div>

                                  <div className="q-comparison">
                                    <div className="ans-box user">
                                      <label>Your Answer</label>
                                      <div className="ans-val">{item.userAnswer === "Not Attempted" ? "Skipped" : item.userAnswer}</div>
                                    </div>
                                    <div className="ans-box correct">
                                      <label>Correct Answer</label>
                                      <div className="ans-val">{item.correctAnswer}</div>
                                    </div>
                                  </div>

                                  {item.explanation && (
                                    <div className="explanation-box-elite">
                                      <div className="exp-heading">
                                        <Lightbulb size={14} />
                                        <span>AI Explanation</span>
                                      </div>
                                      <p>{item.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="scroll-gradient bottom"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        

          <div className="results-footer">
            <button
              className="btn-submit-premium"
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

          <footer className="question-footer">
            <button className="btn-secondary-modern" onClick={handleSkip}>
              Skip
            </button>

            {currentStep < assessmentData.length - 1 ? (
              <button
                className="btn-submit-modern"
                onClick={handleNext}
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button
                className="btn-submit-modern finish"
                onClick={finishAssessment}
              >
                Finish Assessment
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
              {level}
            </button>
          ))}
        </div>

        {/* --- LOADING OVERLAY --- */}
        {loadingAI && (
          <div className="loading-overlay animated-fade">
            <div className="loader-popup slide-in-bottom">
              <div className="loader-spinner"></div>
              <p>Questions are getting ready, please wait.</p>
            </div>
          </div>
        )}
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
            <div className="subject-icon-wrapper">
              <div className="subject-icon">{sub.icon}</div>
              <div className="subject-glow"></div>
            </div>
            <div className="subject-content">
              <h3>{sub.title}</h3>
              <p>Master your skills in {sub.title} with AI-generated challenges.</p>
            </div>
            <button className="start-btn-premium">
              <span>Choose Subject</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;