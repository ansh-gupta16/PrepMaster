import React, { useState, useEffect, useRef } from 'react';
import './EntryLoader.css';

const GET_STATUS_TEXT = (pct) => {
  if (pct < 20) return "Initializing system...";
  if (pct < 40) return "Loading datasets...";
  if (pct < 60) return "Analyzing patterns...";
  if (pct < 80) return "Optimizing algorithms...";
  if (pct < 95) return "Running final computations...";
  return "Finalizing results...";
};

const EntryLoader = ({ onComplete }) => {
  const [bars, setBars] = useState([]);
  const [sortState, setSortState] = useState({
    left: 0,
    right: 15,
    current: 0,
    forward: true,
    swappedInPass: false,
    sortedLeft: -1,
    sortedRight: 16
  });
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const barCount = 16;
  const timerRef = useRef(null);
  const failsafeRef = useRef(null);

  // Initialize random bars
  useEffect(() => {
    const initialBars = Array.from({ length: barCount }, (_, idx) => ({
      id: idx,
      value: Math.floor(Math.random() * 66) + 20,
    }));
    setBars(initialBars);

    // Failsafe: Force complete after 6 seconds
    failsafeRef.current = setTimeout(() => {
      console.warn("EntryLoader: Failsafe triggered.");
      setIsDone(true);
    }, 6000);

    return () => {
      if (failsafeRef.current) clearTimeout(failsafeRef.current);
    }
  }, []);

  // Cocktail Sort (Bidirectional)
  useEffect(() => {
    if (bars.length === 0 || isDone) return;

    timerRef.current = setInterval(() => {
      setSortState(prev => {
        let { left, right, current, forward, swappedInPass, sortedLeft, sortedRight } = prev;
        const newBars = [...bars];
        
        let didSwap = false;
        
        // Forward pass
        if (forward) {
          if (newBars[current].value > newBars[current + 1].value) {
            const temp = newBars[current];
            newBars[current] = newBars[current + 1];
            newBars[current + 1] = temp;
            didSwap = true;
            swappedInPass = true;
          }
          current++;
          
          if (current >= right) {
            sortedRight = right;
            right--;
            forward = false;
            current = right - 1;
            
            // If No Swaps occurred in the forward pass, we might be done
            // But for true Cocktail sort, we check after a full cycle or if range is empty
            if (!swappedInPass || left >= right) {
              setIsDone(true);
              return prev;
            }
            swappedInPass = false;
          }
        } 
        // Backward pass
        else {
          if (newBars[current].value > newBars[current + 1].value) {
            const temp = newBars[current];
            newBars[current] = newBars[current + 1];
            newBars[current + 1] = temp;
            didSwap = true;
            swappedInPass = true;
          }
          current--;
          
          if (current < left) {
            sortedLeft = left;
            left++;
            forward = true;
            current = left;
            
            if (!swappedInPass || left >= right) {
              setIsDone(true);
              return prev;
            }
            swappedInPass = false;
          }
        }

        if (didSwap) setBars(newBars);

        // Progress = percentage of elements locked into sorted boundaries
        const sortedCount = (barCount - (right - left + 1));
        const calculatedProgress = (sortedCount / barCount) * 100;
        
        setProgress(p => {
          // Linear interpolation to make it feel smooth
          const target = Math.max(p, calculatedProgress);
          const inc = target > 85 ? 0.1 : 0.5;
          return Math.min(target + inc, 99.8);
        });

        return { left, right, current, forward, swappedInPass, sortedLeft, sortedRight };
      });
    }, 25); // Fast processing (25ms)

    return () => clearInterval(timerRef.current);
  }, [bars, isDone]);

  // Completion Sequence
  useEffect(() => {
    if (isDone) {
      if (failsafeRef.current) clearTimeout(failsafeRef.current);
      clearInterval(timerRef.current);
      
      setProgress(100);
      
      // Final delay to admire the green state
      setTimeout(() => {
        setIsExiting(true);
        // Inform App.jsx that we are ready to open
        if (onComplete) onComplete();
      }, 400);
    }
  }, [isDone, onComplete]);

  return (
    <div className={`entry-loader ${isExiting ? 'exit' : ''}`}>
      <div className="loader-container">
        <div className="sorting-canvas">
          {bars.map((bar, idx) => {
            const isComparing = idx === sortState.current || idx === sortState.current + 1;
            const isSorted = idx <= sortState.sortedLeft || idx >= sortState.sortedRight || isDone;
            const isPulse = isDone;

            return (
              <div
                key={bar.id}
                className={`viz-bar ${isComparing ? 'active' : ''} ${isSorted ? 'done' : ''} ${isPulse ? 'pulse' : ''}`}
                style={{ 
                  height: `${bar.value}%`,
                  transition: `all ${isDone ? '0.6s' : '0.1s'} cubic-bezier(0.4, 0, 0.2, 1)`
                }}
              >
                {isComparing && <div className="bar-active-glow"></div>}
              </div>
            );
          })}
        </div>

        <div className="status-panel">
          <div className="progress-metrics">
            <div className="msg-wrap">
              <div className="status-indicator"></div>
              <span className="status-text">{GET_STATUS_TEXT(progress)}</span>
            </div>
            <span className="status-pct">{Math.floor(progress)}%</span>
          </div>
          <div className="progress-track-outer">
            <div 
              className="progress-track-inner"
              style={{ width: `${progress}%` }}
            >
              <div className="progress-energy"></div>
            </div>
          </div>
          <div className="algo-footer">
             <span className="algo-code">STRAT: COCKTAIL_BIDIRECTIONAL</span>
             <span className="algo-ver">READY_OK</span>
          </div>
        </div>
      </div>

      <div className="visual-fx">
        <div className="scanline"></div>
        <div className="noise-film"></div>
        <div className="vignette"></div>
      </div>
    </div>
  );
};

export default EntryLoader;
