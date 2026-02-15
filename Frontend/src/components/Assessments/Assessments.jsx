import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Layers, BarChart3, ChevronLeft, ArrowRight, CheckCircle2, 
  AlertCircle, PenTool, Timer, Eye, HelpCircle 
} from 'lucide-react';
import './Assessments.css';

const Assessments = () => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState([]); 
  const [customTopic, setCustomTopic] = useState("");
  const [userAnswers, setUserAnswers] = useState(Array(10).fill(null));
  const [statusTracker, setStatusTracker] = useState(Array(10).fill('not-visited')); 
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [error, setError] = useState("");
  const [bestScores, setBestScores] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const subjects = [
    { id: 'dsa', title: 'Data Structures & Algorithms', icon: <Layers size={24} />, color: 'blue' },
    { id: 'dbms', title: 'Database Management', icon: <BookOpen size={24} />, color: 'green' },
    { id: 'os', title: 'Operating Systems', icon: <BarChart3 size={24} />, color: 'purple' },
    { id: 'self', title: 'Self Assessment', icon: <PenTool size={24} />, color: 'purple', isCustom: true }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startAssessment = (level) => {
    if (activeSubject.id === 'self' && !customTopic.trim()) {
      setError("Please enter a topic for your self-assessment.");
      return;
    }
    let duration = level === 'Easy' ? 25 * 60 : level === 'Medium' ? 45 * 60 : 70 * 60; 
    setTimeLeft(duration);
    setDifficulty(level);
    const questions = [];
    const numSubjective = Math.floor(Math.random() * 3) + 1; 
    const numMCQ = 10 - numSubjective;
    const topicLabel = activeSubject.id === 'self' ? customTopic : activeSubject.title;

    for (let i = 0; i < numMCQ; i++) {
      questions.push({ 
        type: 'mcq', 
        text: `[${level}] ${topicLabel} MCQ question ${i + 1}.`, 
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: "Correct logic requires Option A for optimization."
      });
    }
    for (let i = 0; i < numSubjective; i++) {
      questions.push({ 
        type: 'subjective', 
        text: `[${level}] Logic: Describe concept ${i + 1} for ${topicLabel}.`,
        correctAnswer: "Detailed logic with O(n) complexity.",
        explanation: "Points are awarded for detailed descriptions (15+ characters)."
      });
    }
    setAssessmentData(questions.sort(() => Math.random() - 0.5));
    setCurrentStep(0);
    setUserAnswers(Array(10).fill(null));
    setStatusTracker(Array(10).fill('not-visited'));
    setShowResults(false);
    setReviewMode(false);
    setError("");
  };

  useEffect(() => {
    if (difficulty && timeLeft > 0 && !showResults) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && difficulty && !showResults) {
      finishAssessment();
    }
    return () => clearInterval(timerRef.current);
  }, [difficulty, timeLeft, showResults]);

  const handleNext = () => {
    const currentAnswer = userAnswers[currentStep];
    const newTracker = [...statusTracker];
    newTracker[currentStep] = (currentAnswer && String(currentAnswer).trim() !== "") ? 'completed' : 'unanswered';
    setStatusTracker(newTracker);
    if (currentStep < 9) setCurrentStep(currentStep + 1);
  };

  const skipQuestion = () => {
    const newTracker = [...statusTracker];
    newTracker[currentStep] = 'skipped';
    setStatusTracker(newTracker);
    if (currentStep < 9) setCurrentStep(currentStep + 1);
  };

  const finishAssessment = () => {
    const anyEmpty = userAnswers.some(ans => ans === null || String(ans).trim() === "");
    if (anyEmpty && timeLeft > 0) {
      setError("Please complete all questions before finishing.");
      return;
    }
    clearInterval(timerRef.current);

    const finalScore = assessmentData.reduce((total, q, i) => {
      const userAns = userAnswers[i];
      if (q.type === 'mcq') {
        return userAns === q.correctAnswer ? total + 1 : total;
      } else {
        return (userAns && userAns.trim().length > 15) ? total + 1 : total;
      }
    }, 0); // Corrected starting value

    const key = activeSubject.id === 'self' ? `self-${customTopic}-${difficulty}` : `${activeSubject.id}-${difficulty}`;
    if (!bestScores[key] || finalScore > bestScores[key]) {
      setBestScores({ ...bestScores, [key]: finalScore });
    }
    setShowResults(true);
  };

  if (reviewMode) {
    return (
      <div className="assessment-active slide-in-right">
        <header className="assessment-header">
          <button className="back-link" onClick={() => setReviewMode(false)}><ChevronLeft size={18} /> Results</button>
          <h2>Review</h2>
        </header>
        <div className="assessment-window glass-card">
          <div className="review-scroll-area">
            {assessmentData.map((q, i) => {
              const isCorrect = q.type === 'mcq' ? userAnswers[i] === q.correctAnswer : (userAnswers[i] && userAnswers[i].trim().length > 15);
              return (
                <div key={i} className={`review-item ${isCorrect ? 'correct-border' : 'wrong-border'}`}>
                  <div className="review-header-row">
                    <span className={`q-label ${q.type}`}>{i + 1}. {q.type.toUpperCase()}</span>
                    <div className="score-tag">{isCorrect ? "+1 Mark" : "+0 Marks"}</div>
                  </div>
                  <p className="question-text small">{q.text}</p>
                  <div className="answer-comparison">
                    <div className={`ans-box ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
                      <label>Your Input:</label>
                      <p>{userAnswers[i] || "Skipped"}</p>
                    </div>
                    {!isCorrect && <div className="ans-box actual-correct"><label>Correct Logic:</label><p>{q.correctAnswer}</p></div>}
                  </div>
                  <div className="explanation-box">
                    <div className="exp-header"><HelpCircle size={16} /><strong>Insight:</strong></div>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const scoreKey = activeSubject.id === 'self' ? `self-${customTopic}-${difficulty}` : `${activeSubject.id}-${difficulty}`;
    return (
      <div className="assessment-active slide-in-right">
        <div className="assessment-window glass-card results-container">
          <CheckCircle2 size={80} className="success-icon" />
          <h1>Completed</h1>
          <p className="final-score-text">Score: <span>{bestScores[scoreKey]}/10</span></p>
          <div className="results-actions">
            <button className="btn-secondary" onClick={() => setReviewMode(true)}><Eye size={18} /> Review</button>
            <button className="btn-submit" onClick={() => { setDifficulty(null); setShowResults(false); setCustomTopic(""); }}>Exit</button>
          </div>
        </div>
      </div>
    );
  }

  if (difficulty) {
    const q = assessmentData[currentStep];
    return (
      <div className="assessment-active slide-in-right">
        <header className="assessment-header">
          <button className="back-link" onClick={() => { if(window.confirm("Exit?")) setDifficulty(null); }}><ChevronLeft size={18} /> Exit</button>
          <div className="timer-display">
            <Timer size={20} className={timeLeft < 60 ? 'timer-warning' : ''} />
            <span className={timeLeft < 60 ? 'timer-warning' : ''}>{formatTime(timeLeft)}</span>
          </div>
          <span className={`diff-pill ${difficulty.toLowerCase()}`}>{difficulty}</span>
        </header>
        <div className="assessment-window glass-card">
          <div className="progress-stepper">
            {assessmentData.map((_, i) => (
              <div key={i} className={`step-dot ${currentStep === i ? 'active' : ''} ${statusTracker[i]}`} onClick={() => setCurrentStep(i)}>{i + 1}</div>
            ))}
          </div>
          <div className="question-area">
            <p className="question-text">{q.text}</p>
            {q.type === 'mcq' ? (
              <div className="options-grid">
                {q.options.map((opt, i) => (
                  <button key={i} className={`option-btn ${userAnswers[currentStep] === opt ? 'selected' : ''}`} onClick={() => {
                    const updated = [...userAnswers]; updated[currentStep] = opt; setUserAnswers(updated);
                  }}>{opt}</button>
                ))}
              </div>
            ) : (
              <textarea className="subjective-input" value={userAnswers[currentStep] || ""} onChange={(e) => {
                const updated = [...userAnswers]; updated[currentStep] = e.target.value; setUserAnswers(updated);
              }} placeholder="Enter logic..." />
            )}
          </div>
          {error && <div className="error-msg"><AlertCircle size={18} /> {error}</div>}
          <footer className="question-footer">
            <button className="btn-secondary" onClick={skipQuestion}>Skip</button>
            {currentStep < 9 ? (
              <button className="btn-submit" onClick={handleNext}>Next <ArrowRight size={18} /></button>
            ) : (
              <button className="btn-submit finish" onClick={finishAssessment}>Finish</button>
            )}
          </footer>
        </div>
      </div>
    );
  }

  if (activeSubject) {
    return (
      <div className="difficulty-selection animated-fade">
        <button className="back-link" onClick={() => setActiveSubject(null)}><ChevronLeft size={18} /> Back</button>
        <div className="selection-header">
          <h1>{activeSubject.title}</h1>
          {activeSubject.id === 'self' && (
            <input type="text" className="subjective-input custom-topic-field" placeholder="Topic: e.g. React, SQL" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} />
          )}
        </div>
        <div className="difficulty-grid">
          {['Easy', 'Medium', 'Hard'].map((level) => {
            const scoreKey = activeSubject.id === 'self' ? `self-${customTopic}-${level}` : `${activeSubject.id}-${level}`;
            return (
              <button key={level} className={`diff-card ${level.toLowerCase()}`} onClick={() => startAssessment(level)}>
                <div className="diff-icon"><CheckCircle2 size={32} /></div>
                <div className="diff-text">
                  <h3>{level}</h3>
                  {bestScores[scoreKey] !== undefined && <div className="high-score-badge">Best: {bestScores[scoreKey]}/10</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="assessments-container animated-fade">
      <div className="list-header"><h1>Assessments</h1></div>
      <div className="subjects-grid">
        {subjects.map((sub) => (
          <div key={sub.id} className={`subject-card glass-card ${sub.color}`} onClick={() => setActiveSubject(sub)}>
            <div className="subject-info"><div className="subject-icon">{sub.icon}</div><h3>{sub.title}</h3></div>
            <button className="start-btn">Choose Subject</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;