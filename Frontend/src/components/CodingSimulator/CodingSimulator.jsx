import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Send, Settings, RefreshCw, ChevronLeft, Code2 } from 'lucide-react';
import './CodingSimulator.css';

// --- MOCK DATA FOR PROBLEMS ---
const problemsData = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    desc: "Find indices of two numbers that add up to target.",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }]
  },
  {
    id: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    desc: "Add two non-negative integers represented by linked lists.",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order.",
    constraints: ["List node values are 0-9", "No leading zeros"],
    examples: [{ input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]" }]
  },
  {
    id: 3,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    desc: "Find the median of two sorted arrays of different sizes.",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    constraints: ["nums1.length == m", "nums2.length == n"],
    examples: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" }]
  },
  {
    id: 4,
    title: "Valid Palindrome",
    difficulty: "Easy",
    desc: "Check if a string is a palindrome after removing non-alphanumeric chars.",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    constraints: ["1 <= s.length <= 2 * 10^5"],
    examples: [{ input: "s = \"A man, a plan, a canal: Panama\"", output: "true" }]
  }
];

const CodingSimulator = () => {
  // View State
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [filter, setFilter] = useState('All');
  
  // Editor State
  const [activeTab, setActiveTab] = useState('testcases');
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  
  // Resizing & Ref State
  const [outputHeight, setOutputHeight] = useState(200); 
  const [isDragging, setIsDragging] = useState(false);
  const editorContainerRef = useRef(null);
  const lineNumbersRef = useRef(null); // Reference for sync scrolling

  const boilerplates = {
    java: `class Solution {\n    public void solve() {\n        // Write your code here\n    }\n}`,
    python: `class Solution:\n    def solve(self):\n        # Write your code here\n        pass`,
    cpp: `class Solution {\npublic:\n    void solve() {\n        // Write your code here\n    }\n};`
  };

  // Set initial code when language/problem changes
  useEffect(() => {
    if (selectedProblem) {
      setCode(boilerplates[language]);
    }
  }, [language, selectedProblem]);

  // --- SYNC SCROLL LOGIC ---
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // --- RESIZING LOGIC ---
  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsDragging(false);
  }, []);

  const doResize = useCallback((e) => {
    if (isDragging && editorContainerRef.current) {
      const containerRect = editorContainerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      
      // Constraints: Min 40px, Max 90% of container height
      const maxHeight = containerRect.height * 0.9;
      
      if (newHeight > 40 && newHeight < maxHeight) {
        setOutputHeight(newHeight);
      }
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

  // --- FILTERING ---
  const filteredProblems = problemsData.filter(p => 
    filter === 'All' ? true : p.difficulty === filter
  );

  // --- RENDER: PROBLEM LIST VIEW ---
  if (!selectedProblem) {
    return (
      <div className="problem-list-container">
        <div className="list-header">
          <h1>Coding Challenges</h1>
          <p>Select a problem to start practicing.</p>
        </div>
        
        <div className="filter-nav">
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

        <div className="problems-grid">
          {filteredProblems.map(prob => (
            <div key={prob.id} className="problem-card" onClick={() => setSelectedProblem(prob)}>
              <div className="card-top">
                <Code2 size={24} className={`card-icon ${prob.difficulty.toLowerCase()}`} />
                <span className={`badge ${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
              </div>
              <h3>{prob.title}</h3>
              <p>{prob.desc}</p>
              <button className="solve-btn">Solve Challenge →</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER: IDE VIEW ---
  // Calculate line numbers based on current code
  const lineCount = code.split('\n').length;

  return (
    <div className="ide-wrapper">
      <div className="ide-nav">
        <button className="back-btn" onClick={() => setSelectedProblem(null)}>
          <ChevronLeft size={20} /> Back to Problems
        </button>
        <span className="current-problem-name">{selectedProblem.title}</span>
      </div>

      <div className="ide-container">
        
        {/* LEFT PANEL: Problem Description */}
        <div className="panel left-panel slide-in-left">
          <div className="panel-header">
            <div className="problem-title">
              <span className="problem-id">{selectedProblem.id}. {selectedProblem.title}</span>
              <span className={`difficulty-badge ${selectedProblem.difficulty.toLowerCase()}`}>
                {selectedProblem.difficulty}
              </span>
            </div>
          </div>
          <div className="problem-content">
            <p className="description-text">{selectedProblem.description}</p>
            
            {selectedProblem.examples.map((ex, index) => (
              <div key={index} className="example-box">
                <strong className="example-label">Example {index + 1}:</strong>
                <div className="code-block">
                  <span className="var-name">Input:</span> {ex.input} <br/>
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

        {/* RIGHT PANEL: Editor & Output */}
        <div className="panel right-panel slide-in-right" ref={editorContainerRef}>
          
          <div className="editor-header">
            <div className="lang-selector">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div className="editor-actions">
              <Settings size={18} className="icon-btn" />
              <RefreshCw size={18} className="icon-btn" />
            </div>
          </div>

          {/* CODE EDITOR AREA */}
          <div className="code-area">
            {/* Line Numbers with Ref for Sync Scroll */}
            <div className="line-numbers" ref={lineNumbersRef}>
              {[...Array(lineCount)].map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            
            {/* Text Input with onScroll Handler */}
            <textarea 
              className="code-input" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              spellCheck="false"
            ></textarea>
          </div>

          {/* RESIZER HANDLE */}
          <div className="resizer-handle" onMouseDown={startResize}>
            <div className="handle-bar"></div>
          </div>

          {/* OUTPUT SECTION (Dynamic Height) */}
          <div className="output-section" style={{ height: `${outputHeight}px` }}>
            <div className="output-tabs">
              <button 
                className={`tab-btn ${activeTab === 'testcases' ? 'active' : ''}`} 
                onClick={() => setActiveTab('testcases')}
              >
                Test Cases
              </button>
              <button 
                className={`tab-btn ${activeTab === 'result' ? 'active' : ''}`} 
                onClick={() => setActiveTab('result')}
              >
                Test Result
              </button>
            </div>
            
            <div className="output-content">
              {activeTab === 'testcases' ? (
                <div className="testcase-block">
                   Case 1<br/>
                   Input: nums = [2,7,11,15], target = 9
                </div>
              ) : (
                <div className="result-placeholder">Run code to see logic...</div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="editor-footer">
            <button className="btn-secondary">Console</button>
            <div className="action-buttons">
              <button className="btn-run"><Play size={16} /> Run</button>
              <button className="btn-submit"><Send size={16} /> Submit</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CodingSimulator;