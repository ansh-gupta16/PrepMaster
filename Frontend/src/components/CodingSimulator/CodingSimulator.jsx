import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Send, RefreshCw, ChevronLeft, Code2, Terminal, CheckCircle, XCircle, Clock, Cpu, Loader2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, Decoration, gutter, GutterMarker } from '@codemirror/view';
import { EditorState, StateField, StateEffect, RangeSet } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput, bracketMatching, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import axios from 'axios';
import './CodingSimulator.css';

axios.defaults.baseURL = 'http://127.0.0.1:5000';

// ─── PROBLEM DATA WITH TEST CASES ────────────────────────────────────
// ─── LANGUAGE CONFIG ─────────────────────────────────────────────────

// ─── LANGUAGE CONFIG ─────────────────────────────────────────────────
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', cmLang: javascript },
  { id: 'python', label: 'Python', cmLang: python },
  { id: 'java', label: 'Java', cmLang: java },
  { id: 'cpp', label: 'C++', cmLang: cpp },
];

// ─── CODEMIRROR THEME OVERRIDES ──────────────────────────────────────
const goldTheme = EditorView.theme({
  '&': { backgroundColor: '#0A0A0A', height: '100%' },
  '.cm-gutters': { backgroundColor: '#0A0A0A', borderRight: '1px solid #1E1E1E', color: '#4A4A4A' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#C6A96B' },
  '.cm-activeLine': { backgroundColor: 'rgba(198, 169, 107, 0.04)' },
  '.cm-cursor': { borderLeftColor: '#C6A96B' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(198, 169, 107, 0.15) !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(198, 169, 107, 0.2) !important' },
  '.cm-content': { caretColor: '#C6A96B', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '14px', lineHeight: '1.6' },
  '.cm-scroller': { overflow: 'auto' },
  // Error line styling
  '.cm-error-line': { backgroundColor: 'rgba(248, 113, 113, 0.08)' },
  '.cm-error-gutter': { color: '#F87171', fontSize: '14px' },
});

// ─── CODEMIRROR ERROR DECORATIONS ────────────────────────────────────
const setErrorEffect = StateEffect.define();
const clearErrorEffect = StateEffect.define();

// Error line decoration
const errorLineDeco = Decoration.line({ class: 'cm-error-line' });

// Error gutter marker
class ErrorMarker extends GutterMarker {
  toDOM() {
    const el = document.createElement('span');
    el.textContent = '●';
    el.className = 'cm-error-gutter';
    return el;
  }
}
const errorMarker = new ErrorMarker();

// StateField to hold error decorations
const errorField = StateField.define({
  create() { return { decos: Decoration.none, line: null }; },
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(clearErrorEffect)) {
        return { decos: Decoration.none, line: null };
      }
      if (e.is(setErrorEffect)) {
        const { line } = e.value;
        if (line && line >= 1 && line <= tr.state.doc.lines) {
          const lineObj = tr.state.doc.line(line);
          return {
            decos: Decoration.set([errorLineDeco.range(lineObj.from)]),
            line,
          };
        }
      }
    }
    return value;
  },
  provide: (f) => EditorView.decorations.from(f, val => val.decos),
});

// Error gutter
const errorGutter = gutter({
  class: 'cm-error-gutter-col',
  markers: (view) => {
    const state = view.state.field(errorField);
    if (!state.line) return RangeSet.empty;
    if (state.line >= 1 && state.line <= view.state.doc.lines) {
      const lineObj = view.state.doc.line(state.line);
      return RangeSet.of([errorMarker.range(lineObj.from)]);
    }
    return RangeSet.empty;
  },
});

// ─── LOCAL STORAGE HELPERS ───────────────────────────────────────────
function getStoredCode(problemId, lang) {
  try {
    return localStorage.getItem(`pm_code_${problemId}_${lang}`);
  } catch { return null; }
}

function storeCode(problemId, lang, code) {
  try {
    localStorage.setItem(`pm_code_${problemId}_${lang}`, code);
  } catch { /* ignore */ }
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
const CodingSimulator = () => {
  // View state
  const [questions, setQuestions] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Completed, Uncompleted
  const [completedIds, setCompletedIds] = useState([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isProblemLoading, setIsProblemLoading] = useState(false);

  // Editor state
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);

  // Execution state
  const [activeTab, setActiveTab] = useState('testcases');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResults, setSubmitResults] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReattemptModal, setShowReattemptModal] = useState(false);
  const [pendingProblem, setPendingProblem] = useState(null);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const timerIntervalRef = useRef(null);

  // Resizing
  const [outputHeight, setOutputHeight] = useState(260);
  const [isDragging, setIsDragging] = useState(false);
  const editorContainerRef = useRef(null);

  // ─── Error annotation helpers ────────────────────────────────────
  const clearEditorErrors = useCallback(() => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        effects: clearErrorEffect.of(null),
      });
    }
  }, []);

  const setEditorError = useCallback((line) => {
    if (editorViewRef.current && line) {
      editorViewRef.current.dispatch({
        effects: setErrorEffect.of({ line }),
      });
      // Scroll to error line
      try {
        const lineInfo = editorViewRef.current.state.doc.line(line);
        editorViewRef.current.dispatch({
          selection: { anchor: lineInfo.from },
          scrollIntoView: true,
        });
      } catch { /* ignore */ }
    }
  }, []);

  // ─── CodeMirror Setup ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProblem || !editorRef.current) return;

    const langConfig = LANGUAGES.find(l => l.id === language);
    const langExt = langConfig ? langConfig.cmLang() : javascript();

    const stored = getStoredCode(selectedProblem._id, language);
    const initialCode = stored || (selectedProblem.starterCode && selectedProblem.starterCode[language]) || '// Start coding...';

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        bracketMatching(),
        indentOnInput(),
        keymap.of([...defaultKeymap, indentWithTab]),
        langExt,
        oneDark,
        goldTheme,
        errorField,
        errorGutter,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            setCode(newCode);
            storeCode(selectedProblem._id, language, newCode);
          }
        }),
      ],
    });

    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }

    editorViewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    setCode(initialCode);
    setIsInitialLoad(false);

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }
    };
  }, [selectedProblem, language]);

  // ─── Timer Logic ──────────────────────────────────────────────────
  useEffect(() => {
    if (selectedProblem && !isInitialLoad && !showSuccessModal) {
      setTimerActive(true);
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setTimerActive(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [selectedProblem, isInitialLoad, showSuccessModal]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Resize Logic ────────────────────────────────────────────────
  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const stopResize = useCallback(() => setIsDragging(false), []);

  const doResize = useCallback((e) => {
    if (isDragging && editorContainerRef.current) {
      const rect = editorContainerRef.current.getBoundingClientRect();
      const newH = rect.bottom - e.clientY;
      const max = rect.height * 0.85;
      if (newH > 60 && newH < max) setOutputHeight(newH);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', doResize);
      window.addEventListener('mouseup', stopResize);
    } else {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    }
    return () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isDragging, doResize, stopResize]);

  // ─── Run Code ────────────────────────────────────────────────────
  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab('result');
    // Soft Validation
    if (!code.trim() || code.length < 10) {
      setRunResult({ stderr: "Error: Please write some code before running.", status: { id: 0, description: "Validation Error" } });
      setIsRunning(false);
      return;
    }
    if (!code.includes("return") && !code.includes("void")) {
       // Just a warning/soft check
    }

    try {
      const res = await axios.post('/api/simulator/run', {
        code,
        language,
        stdin: customInput,
        entryPoint: selectedProblem.entryPoint,
      });
      setRunResult(res.data);

      // Apply error annotation if parsedError has a line
      if (res.data.parsedError?.line) {
        setEditorError(res.data.parsedError.line);
      }
    } catch (err) {
      setRunResult({
        stderr: err.response?.data?.message || 'Execution failed. Check your connection.',
        status: { id: 0, description: 'Error' },
        parsedError: null,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ─── Submit Code ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitting || !selectedProblem?.testCases) return;
    setIsSubmitting(true);
    setActiveTab('result');
    setRunResult(null);
    setSubmitResults(null);
    clearEditorErrors();

    // Soft Validation
    if (!code.trim() || code.length < 10) {
      setSubmitResults({ allPassed: false, passedCount: 0, totalCount: selectedProblem.testCases?.length || 0, results: [{ passed: false, stderr: "Error: Please write your solution before submitting." }] });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post('/api/simulator/submit', {
        code,
        language,
        questionId: selectedProblem._id,
        entryPoint: selectedProblem.entryPoint,
      });
      setSubmitResults(res.data);

      // Apply error annotation from first failed test with a parsedError line
      const firstError = res.data.results?.find(r => r.parsedError?.line);
      if (firstError) {
        setEditorError(firstError.parsedError.line);
      }

      if (res.data.status === 'accepted' || res.data.status === 'already_completed') {
        setTimerActive(false);
        // Optimistic update
        setCompletedIds(prev => {
           if (!prev.includes(res.data.questionId)) {
             return [...prev, res.data.questionId];
           }
           return prev;
        });
        setTimeout(() => setShowSuccessModal(true), 600);
      }
    } catch (err) {
      setSubmitResults({
        allPassed: false,
        passedCount: 0,
        totalCount: selectedProblem.testCases?.length || 0,
        results: [{ passed: false, stderr: err.response?.data?.message || 'Submission failed.' }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Reset Code ──────────────────────────────────────────────────
  const handleReset = () => {
    if (!selectedProblem) return;
    const starter = (selectedProblem.starterCode && selectedProblem.starterCode[language]) || '';
    storeCode(selectedProblem._id, language, starter);

    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: starter,
        },
      });
    }
    setRunResult(null);
    setSubmitResults(null);
    clearEditorErrors();
  };

  // ─── Go to error line ────────────────────────────────────────────
  const handleGoToLine = (line) => {
    if (editorViewRef.current && line) {
      try {
        const lineInfo = editorViewRef.current.state.doc.line(line);
        editorViewRef.current.dispatch({
          selection: { anchor: lineInfo.from },
          scrollIntoView: true,
        });
        editorViewRef.current.focus();
      } catch { /* ignore */ }
    }
  };

  // ─── Fetch Questions ──────────────────────────────────────────────
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsListLoading(true);
      try {
        const [qRes, pRes] = await Promise.all([
          axios.get('/api/simulator/questions'),
          axios.get('/api/auth/profile').catch(() => ({ data: { completedQuestions: [] } }))
        ]);
        setQuestions(qRes.data);
        if (pRes.data?.completedQuestions) {
          setCompletedIds(pRes.data.completedQuestions.map(q => typeof q === 'string' ? q : q._id));
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setIsListLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelectProblem = async (prob) => {
    const isCompleted = completedIds.includes(prob._id);
    
    if (isCompleted) {
      setPendingProblem(prob);
      setShowReattemptModal(true);
      return;
    }
    
    proceedToProblem(prob);
  };

  const proceedToProblem = async (prob) => {
    setIsProblemLoading(true);
    setShowReattemptModal(false);
    try {
      const res = await axios.get(`/api/simulator/questions/${prob._id}`);
      setSelectedProblem(res.data);
      // Reset view states
      setRunResult(null);
      setSubmitResults(null);
      setActiveTab('testcases');
      setIsInitialLoad(true);
      setElapsedTime(0);
      setShowSuccessModal(false);
    } catch (err) {
      console.error("Failed to fetch problem details:", err);
    } finally {
      setIsProblemLoading(false);
      setPendingProblem(null);
    }
  };

  // ─── Filtering ───────────────────────────────────────────────────
  const filteredProblems = questions.filter(p => {
    const matchesDiff = filter === 'All' ? true : p.difficulty === filter;
    const isCompleted = completedIds.includes(p._id);
    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Completed' ? isCompleted :
      !isCompleted;
    return matchesDiff && matchesStatus;
  });

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: PROBLEM LIST VIEW
  // ═══════════════════════════════════════════════════════════════════
  if (!selectedProblem) {
    return (
      <div className="problem-list-container">
        <div className="list-header">
          <h1>Coding Challenges</h1>
          <p>Select a problem to start practicing.</p>
        </div>

        {isListLoading ? (
          <div className="list-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading challenges...</p>
          </div>
        ) : (
          <>

        <div className="filter-nav">
          <div className="filter-group">
            <span className="filter-label">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            {['All', 'Completed', 'Uncompleted'].map(sf => (
              <button
                key={sf}
                className={`filter-btn ${statusFilter === sf ? 'active' : ''}`}
                onClick={() => setStatusFilter(sf)}
              >
                {sf}
              </button>
            ))}
          </div>
        </div>

          <div className="problems-grid">
            {filteredProblems.map(prob => {
              const isComp = completedIds.includes(prob._id);
              return (
                <div 
                  key={prob._id} 
                  className={`problem-card ${isComp ? 'completed' : ''}`} 
                  onClick={() => handleSelectProblem(prob)}
                >
                  <div className="card-top">
                    <div className="icon-group">
                      <Code2 size={24} className={`card-icon ${prob.difficulty.toLowerCase()}`} />
                      {isComp && (
                        <div className="completed-check-icon" title="Completed">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                    <span className={`badge ${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
                  </div>
                  <h3>{prob.title}</h3>
                  <p>{prob.desc}</p>
                  <button className="solve-btn">
                    {isProblemLoading && (selectedProblem?._id === prob._id || pendingProblem?._id === prob._id) ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      isComp ? 'Quick Review →' : 'Solve Challenge →'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Reattempt Confirmation Modal */}
          {showReattemptModal && (
            <div className="reattempt-modal-overlay">
              <div className="reattempt-modal glass-card animated-fade-in">
                <div className="modal-icon-wrap">
                  <CheckCircle size={32} color="#10b981" />
                </div>
                <h2>Already Completed</h2>
                <p>You have already solved this challenge. Would you like to try it again?</p>
                <div className="modal-actions">
                  <button 
                    className="modal-btn secondary" 
                    onClick={() => setShowReattemptModal(false)}
                  >
                    No, Go Back
                  </button>
                  <button 
                    className="modal-btn primary" 
                    onClick={() => proceedToProblem(pendingProblem)}
                  >
                    Yes, Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: IDE VIEW
  // ═══════════════════════════════════════════════════════════════════
  const statusOk = runResult?.status?.id === 3;
  const hasError = runResult?.stderr || runResult?.compile_output;
  const parsedError = runResult?.parsedError;

  // Determine error type for styled display
  const getErrorTypeLabel = (pe) => {
    if (!pe) return 'Error';
    switch (pe.type) {
      case 'CompilationError': return 'Compilation Error';
      case 'SyntaxError': return 'Syntax Error';
      case 'RuntimeError': return 'Runtime Error';
      default: return 'Error';
    }
  };

  const getErrorIcon = (pe) => {
    if (!pe) return <XCircle size={16} />;
    if (pe.type === 'CompilationError' || pe.type === 'SyntaxError') return <AlertTriangle size={16} />;
    return <XCircle size={16} />;
  };

  return (
    <div className="ide-wrapper">
      {/* Top Nav */}
      <div className="ide-nav">
        <button className="back-btn" onClick={() => { setSelectedProblem(null); setRunResult(null); setSubmitResults(null); clearEditorErrors(); }}>
          <ChevronLeft size={20} /> Back to Problems
        </button>
        <span className="current-problem-name">{selectedProblem.title}</span>
      </div>

      <div className="ide-container">
        {/* ─── LEFT PANEL: Problem ──────────────────────────────── */}
        <div className="panel left-panel">
          <div className="panel-header">
            <div className="problem-title">
              <span className="problem-name">{selectedProblem.title}</span>
              <span className={`difficulty-badge ${selectedProblem.difficulty.toLowerCase()}`}>
                {selectedProblem.difficulty}
              </span>
              <div className="session-timer">
                <Clock size={14} />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>
          <div className="problem-content">
            <p className="description-text">{selectedProblem.description}</p>

            {selectedProblem.examples.map((ex, index) => (
              <div key={index} className="example-box">
                <strong className="example-label">Example {index + 1}:</strong>
                <div className="code-block">
                  <span className="var-name">Input:</span> {ex.input} <br />
                  <span className="var-name">Output:</span> {ex.output}
                </div>
              </div>
            ))}

            <div className="constraints-box">
              <h3>Constraints:</h3>
              <ul>{selectedProblem.constraints?.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Editor + Output ─────────────────────── */}
        <div className="panel right-panel" ref={editorContainerRef}>

          {/* Editor Header */}
          <div className="editor-top-bar">
            <div className="lang-selector">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="editor-info-msg">
              <Zap size={14} />
              <span>Write your solution inside the function below</span>
            </div>
            <div className="editor-actions">
              <button className="icon-btn" onClick={handleReset} title="Reset Code">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* CodeMirror Editor Mount Point */}
          <div className="cm-editor-mount" ref={editorRef}></div>

          {/* Resizer */}
          <div className="resizer-handle" onMouseDown={startResize}>
            <div className="handle-bar"></div>
          </div>

          {/* Output Section */}
          <div className="output-section" style={{ height: `${outputHeight}px` }}>
            <div className="output-tabs">
              <button
                className={`tab-btn ${activeTab === 'testcases' ? 'active' : ''}`}
                onClick={() => setActiveTab('testcases')}
              >
                <Terminal size={14} /> Test Cases
              </button>
              <button
                className={`tab-btn ${activeTab === 'input' ? 'active' : ''}`}
                onClick={() => setActiveTab('input')}
              >
                Custom Input
              </button>
              <button
                className={`tab-btn ${activeTab === 'result' ? 'active' : ''}`}
                onClick={() => setActiveTab('result')}
              >
                Output
              </button>
            </div>

            <div className="output-content">
              {/* Test Cases Tab */}
              {activeTab === 'testcases' && (
                <div className="testcases-list">
                  {selectedProblem.testCases.filter(tc => !tc.hidden).map((tc, i) => (
                    <div key={i} className="tc-item">
                      <strong>Case {i + 1}</strong>
                      <div className="tc-row"><span className="tc-label">Input:</span><pre>{tc.input}</pre></div>
                      <div className="tc-row"><span className="tc-label">Expected:</span><pre>{tc.expectedOutput}</pre></div>
                    </div>
                  ))}
                  <div className="tc-hidden-note">
                    + {selectedProblem.testCases?.filter(tc => tc.hidden).length || 0} hidden test case(s)
                  </div>
                </div>
              )}

              {/* Custom Input Tab */}
              {activeTab === 'input' && (
                <textarea
                  className="custom-input-area"
                  placeholder="Enter custom input here..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  spellCheck={false}
                />
              )}

              {/* Result Tab */}
              {activeTab === 'result' && (
                <div className="result-area">
                  {/* Loading state */}
                  {(isRunning || isSubmitting) && (
                    <div className="exec-loading">
                      <div className="exec-loading-spinner">
                        <Loader2 size={22} className="spin" />
                      </div>
                      <div className="exec-loading-text">
                        <span className="exec-loading-title">{isSubmitting ? 'Running Test Cases' : 'Executing Code'}</span>
                        <span className="exec-loading-sub">{isSubmitting ? 'Validating against all test cases...' : 'Compiling and running your code...'}</span>
                      </div>
                    </div>
                  )}

                  {/* ─── Run result ─── */}
                  {runResult && !isRunning && (
                    <div className="run-output">
                      {/* Status bar */}
                      <div className="exec-meta">
                        <span className={`exec-status ${statusOk ? 'pass' : 'fail'}`}>
                          {statusOk ? <CheckCircle size={14} /> : getErrorIcon(parsedError)}
                          {runResult.status?.description || 'Unknown'}
                        </span>
                        {runResult.time && <span className="exec-stat"><Clock size={12} /> {runResult.time}s</span>}
                        {runResult.memory && <span className="exec-stat"><Cpu size={12} /> {(runResult.memory / 1024).toFixed(1)} MB</span>}
                      </div>

                      {/* Success output */}
                      {statusOk && runResult.stdout && (
                        <div className="output-block success">
                          <span className="block-label">Output</span>
                          <pre>{runResult.stdout}</pre>
                        </div>
                      )}

                      {/* Structured error display */}
                      {hasError && parsedError && (
                        <div className="error-card">
                          <div className="error-card-header">
                            {getErrorIcon(parsedError)}
                            <span className="error-type-label">{getErrorTypeLabel(parsedError)}</span>
                            {parsedError.line && (
                              <button className="error-line-badge" onClick={() => handleGoToLine(parsedError.line)}>
                                Line {parsedError.line} <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                          <div className="error-card-message">
                            {parsedError.message}
                          </div>
                          <details className="error-details">
                            <summary>Full Output</summary>
                            <pre>{parsedError.fullMessage}</pre>
                          </details>
                        </div>
                      )}

                      {/* Fallback raw error (no parsedError) */}
                      {hasError && !parsedError && (
                        <div className="output-block error">
                          <span className="block-label">Error</span>
                          <pre>{runResult.stderr || runResult.compile_output}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Submit results ─── */}
                  {submitResults && !isSubmitting && (
                    <div className="submit-output">
                      {/* Summary banner */}
                      <div className={`submit-verdict ${submitResults.allPassed ? 'pass' : 'fail'}`}>
                        <div className="verdict-icon-wrap">
                          {submitResults.allPassed ? (
                            <div className="success-icon-animated">
                              <CheckCircle size={24} />
                            </div>
                          ) : (
                            <XCircle size={24} />
                          )}
                        </div>
                        <div className="verdict-text">
                          <span className="verdict-title">
                            {submitResults.allPassed ? 'All Test Cases Passed!' : 'Some Test Cases Failed'}
                          </span>
                          <span className="verdict-sub">
                            {submitResults.passedCount ?? submitResults.results.filter(r => r.passed).length} / {submitResults.totalCount ?? submitResults.results.length} test cases passed
                          </span>
                        </div>
                        {submitResults.allPassed && (
                          <Zap size={20} className="verdict-zap" />
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="results-progress-bar">
                        <div
                          className={`results-progress-fill ${submitResults.allPassed ? 'pass' : 'fail'}`}
                          style={{
                            width: `${((submitResults.passedCount ?? submitResults.results.filter(r => r.passed).length)
                              / (submitResults.totalCount ?? submitResults.results.length)) * 100}%`
                          }}
                        />
                      </div>

                      {/* Per-test-case results */}
                      <div className="tc-results">
                        {submitResults.results.map((r, i) => (
                          <div key={i} className={`tc-result-item ${r.passed ? 'pass' : 'fail'}`}>
                            <div className="tc-result-header">
                              {r.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              <span>Test Case {i + 1} {r.hidden ? '(Hidden)' : ''}</span>
                              {r.time && <span className="tc-time">{r.time}s</span>}
                              <span className={`tc-status-pill ${r.passed ? 'pass' : 'fail'}`}>
                                {r.passed ? 'Passed' : (r.parsedError ? r.parsedError.type : 'Failed')}
                              </span>
                            </div>

                            {/* Error for this test case */}
                            {!r.passed && r.parsedError && (
                              <div className="tc-error-card">
                                <span className="tc-error-type">{getErrorTypeLabel(r.parsedError)}</span>
                                {r.parsedError.line && (
                                  <button className="error-line-badge small" onClick={() => handleGoToLine(r.parsedError.line)}>
                                    Line {r.parsedError.line} <ArrowRight size={10} />
                                  </button>
                                )}
                                <span className="tc-error-msg">{r.parsedError.message}</span>
                              </div>
                            )}

                            {/* Diff comparison for wrong-answer cases */}
                            {!r.hidden && !r.passed && !r.parsedError && (
                              <div className="tc-diff">
                                <div className="tc-diff-row">
                                  <span className="tc-diff-label">Input</span>
                                  <pre className="tc-diff-value">{r.input}</pre>
                                </div>
                                <div className="tc-diff-row expected">
                                  <span className="tc-diff-label">Expected</span>
                                  <pre className="tc-diff-value">{r.expectedOutput}</pre>
                                </div>
                                <div className="tc-diff-row actual">
                                  <span className="tc-diff-label">Got</span>
                                  <pre className="tc-diff-value">{r.actualOutput || '(no output)'}</pre>
                                </div>
                              </div>
                            )}

                            {/* Raw stderr fallback */}
                            {r.stderr && !r.parsedError && <pre className="tc-error">{r.stderr}</pre>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Placeholder when no result */}
                  {!runResult && !submitResults && !isRunning && !isSubmitting && (
                    <div className="result-placeholder">
                      <Terminal size={24} />
                      <span>Run or submit your code to see results</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="editor-footer">
            <div className="footer-left">
              <span className="lang-label">{LANGUAGES.find(l => l.id === language)?.label}</span>
            </div>
            <div className="action-buttons">
              <button className="btn-run" onClick={handleRun} disabled={isRunning || isSubmitting}>
                {isRunning ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
                Run
              </button>
              <button 
                className={`btn-submit ${completedIds.includes(selectedProblem._id) ? 'solved' : ''}`} 
                onClick={handleSubmit} 
                disabled={isRunning || isSubmitting || completedIds.includes(selectedProblem._id)}
              >
                {isSubmitting ? <Loader2 size={16} className="spin" /> : 
                 completedIds.includes(selectedProblem._id) ? <CheckCircle size={16} /> : <Send size={16} />}
                {completedIds.includes(selectedProblem._id) ? 'Solved' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          time={formatTime(elapsedTime)}
          onContinue={() => {
            setShowSuccessModal(false);
            // Return to list
            setSelectedProblem(null);
          }}
          onBack={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

// ─── SUCCESS MODAL COMPONENT ─────────────────────────────────────────
const SuccessModal = ({ onContinue, onBack, time }) => {
  return (
    <div className="modal-overlay">
      <div className="success-modal glass-card animated-scale-in">
        <div className="modal-icon">
          <CheckCircle size={48} color="#10b981" />
        </div>
        <h2>Challenge Accepted!</h2>
        <p>You successfully completed this question.</p>
        <div className="modal-stats">
          <div className="modal-stat-item">
            <Clock size={16} />
            <span>Time Taken: {time}</span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-modal-primary" onClick={onContinue}>
            Continue Improving <ArrowRight size={18} />
          </button>
          <button className="btn-modal-secondary" onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodingSimulator;