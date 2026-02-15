import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, CameraOff, Mic, MicOff, MessageSquare, Power, Video, 
  Download, AlertCircle, BarChart, Lock, CheckCircle2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import './Interview.css';

const Interview = () => {
  // --- State Management ---
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  
  // Timers
  const [totalTime, setTotalTime] = useState(600); // 10 minutes total
  const [questionTime, setQuestionTime] = useState(120); // 2 minutes per question
  
  // Content & Logic
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState([]); 
  const [liveUserText, setLiveUserText] = useState("");
  const [sentiment, setSentiment] = useState("Steady");

  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  // --- 1. Initialize Media on Load (Pre-check) ---
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        setIsMicOn(true);
      } catch (err) {
        console.error("Media Access Denied:", err);
        alert("CRITICAL: Camera and Microphone access are mandatory for this session.");
      }
    };
    initMedia();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- 2. Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => [...prev, { role: "User", text: result }].slice(-500));
            setLiveUserText("");
            analyzeSentiment(result);
            setQuestionTime(120); // Reset 2-min timer on answer
          } else {
            interim += result;
            setLiveUserText(interim);
          }
        }
      };
    }
  }, []);

  // --- 3. Dual Timer Logic ---
  useEffect(() => {
    let interval;
    if (isInterviewStarted && totalTime > 0) {
      interval = setInterval(() => {
        // Total Session Timer
        setTotalTime(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });

        // Hidden Question Timer
        setQuestionTime(prev => {
          if (prev <= 1) {
            askQuestion("Time elapsed for this topic. Moving to the next question: How do you optimize React performance?");
            return 120; // Reset
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewStarted, totalTime]);

  // --- Helper Functions ---
  const analyzeSentiment = (text) => {
    const positive = ['confident', 'optimized', 'scalable', 'efficient', 'react', 'internship'];
    const filler = ['um', 'uh', 'basically', 'actually', 'like', 'sort of'];
    const words = text.toLowerCase().split(' ');
    const pos = words.filter(w => positive.includes(w)).length;
    const fill = words.filter(w => filler.includes(w)).length;
    setSentiment(pos > fill ? "Confident" : fill > pos ? "Nervous" : "Steady");
  };

  const askQuestion = (text) => {
    setCurrentQuestion(text);
    setTranscript(prev => [...prev, { role: "AI", text }].slice(-500));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const toggleCamera = () => {
    if (isInterviewStarted) return; // Locked during interview
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { 
      track.enabled = !track.enabled; 
      setIsCameraOn(track.enabled); 
    }
  };

  const toggleMic = () => {
    if (isInterviewStarted) return; // Locked during interview
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { 
      track.enabled = !track.enabled; 
      setIsMicOn(track.enabled); 
    }
  };

  const startInterview = () => {
    if (!isCameraOn || !isMicOn) {
      alert("Please enable both Camera and Mic to start.");
      return;
    }
    setIsInterviewStarted(true);
    if (recognitionRef.current) recognitionRef.current.start();
    setTimeout(() => askQuestion("Welcome. All media is now locked. You have 2 minutes per question. Please explain your experience with React and Frontend development."), 1000);
  };

  const endInterview = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsInterviewStarted(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AI Interview Transcript", 20, 20);
    doc.setFontSize(11);
    let y = 30;
    
    transcript.forEach(t => {
      const line = `${t.role}: ${t.text}`;
      const splitLines = doc.splitTextToSize(line, 170);
      
      if (y + splitLines.length * 7 > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(splitLines, 20, y);
      y += (splitLines.length * 7) + 5;
    });
    
    doc.save("Interview_Report.pdf");
  };

  // --- Render ---
  return (
    <div className="interview-container animated-fade">
      <div className="interview-layout">
        
        {/* LEFT PANEL: VIDEO FEED */}
        <div className="video-panel glass-card">
          <div className="video-header">
            {isInterviewStarted && (
              <div className="sentiment-tag">
                <BarChart size={14}/> {sentiment}
              </div>
            )}
            <div className="timer-badge">
              Total: {Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}
            </div>
          </div>

          <div className="video-wrapper">
            <video ref={videoRef} autoPlay playsInline muted />
            
            {/* Overlay if Camera is manually turned off before start */}
            {!isCameraOn && (
              <div className="blocked-overlay">
                <CameraOff size={48} />
                <p>Camera Access Required</p>
              </div>
            )}

            <div className={`media-controls ${isInterviewStarted ? 'locked' : ''}`}>
              <button 
                className={isCameraOn ? "on" : "off"} 
                onClick={toggleCamera} 
                disabled={isInterviewStarted}
              >
                {isCameraOn ? <Camera size={20}/> : <CameraOff size={20}/>}
              </button>
              <button 
                className={isMicOn ? "on" : "off"} 
                onClick={toggleMic} 
                disabled={isInterviewStarted}
              >
                {isMicOn ? <Mic size={20}/> : <MicOff size={20}/>}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI & TRANSCRIPT */}
        <div className="ai-panel glass-card">
          <div className="ai-content-wrapper">
            {isInterviewStarted ? (
              <>
                <div className="ai-bubble animated-fade">
                  {currentQuestion || "Initializing AI Question..."}
                </div>
                
                <div className="transcript-container">
                  <label className="transcript-label">Live Transcript</label>
                  <div className="transcript-scroll">
                    {transcript.map((t, i) => (
                      <p key={i} className={t.role.toLowerCase()}>
                        <strong>{t.role}:</strong> {t.text}
                      </p>
                    ))}
                    {liveUserText && (
                      <p className="user interim">
                        <strong>User:</strong> {liveUserText}...
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="start-prompt">
                <Lock size={60} className="lock-icon" />
                <h2>Media Verification</h2>
                <p>Hardware check required to initiate session.</p>
                
                <div className="system-check">
                  <div className={`check-item ${isCameraOn ? 'pass' : 'fail'}`}>
                    {isCameraOn ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>} Camera
                  </div>
                  <div className={`check-item ${isMicOn ? 'pass' : 'fail'}`}>
                    {isMicOn ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>} Mic
                  </div>
                </div>

                <button 
                  className={`btn-start ${(!isCameraOn || !isMicOn) ? 'disabled' : ''}`} 
                  onClick={startInterview} 
                  disabled={!isCameraOn || !isMicOn}
                >
                  <Power size={18}/> Initiate Session
                </button>
              </div>
            )}
          </div>

          {/* Download Button (Only after finish or if data exists) */}
          {(totalTime === 0 || (!isInterviewStarted && transcript.length > 0)) && (
            <button className="btn-download" onClick={downloadPDF}>
              <Download size={18}/> Download Transcript
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Interview;