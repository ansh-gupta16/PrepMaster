// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { 
// // //   Camera, CameraOff, Mic, MicOff, Power, Download, 
// // //   AlertCircle, BarChart, Lock, CheckCircle2 
// // // } from 'lucide-react';
// // // import jsPDF from 'jspdf';
// // // import { useToast } from '../../context/ToastContext';
// // // import { useAuth } from '../../context/AuthContext';
// // // import './Interview.css';

// // // const Interview = () => {
// // //   // --- Context & Hooks ---
// // //   const toast = useToast();
// // //   const { isAuthenticated } = useAuth();
// // //   const navigate = useNavigate();

// // //   // --- State Management ---
// // //   const [isInterviewStarted, setIsInterviewStarted] = useState(false);
// // //   const [isCameraOn, setIsCameraOn] = useState(false);
// // //   const [isMicOn, setIsMicOn] = useState(false);
  
// // //   // Timers
// // //   const [totalTime, setTotalTime] = useState(600); // 10 minutes total
// // //   const [questionTime, setQuestionTime] = useState(120); // 2 minutes per question
  
// // //   // Content & Logic
// // //   const [currentQuestion, setCurrentQuestion] = useState("");
// // //   const [transcript, setTranscript] = useState([]); 
// // //   const [liveUserText, setLiveUserText] = useState("");
// // //   const [sentiment, setSentiment] = useState("Steady");

// // //   // Refs
// // //   const videoRef = useRef(null);
// // //   const streamRef = useRef(null);
// // //   const recognitionRef = useRef(null);

// // //   // --- 1. Initialize Media on Load ---
// // //   useEffect(() => {
// // //     const initMedia = async () => {
// // //       try {
// // //         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// // //         streamRef.current = stream;
// // //         if (videoRef.current) {
// // //           videoRef.current.srcObject = stream;
// // //         }
// // //         setIsCameraOn(true);
// // //         setIsMicOn(true);
// // //       } catch (err) {
// // //         console.error("Media Access Denied:", err);
// // //         // Using toast inside useEffect caused loop previously because 'toast' was a dependency
// // //         toast.error("Media Access Denied: Camera and Microphone are required.");
// // //       }
// // //     };
// // //     initMedia();

// // //     // Cleanup on unmount
// // //     return () => {
// // //       if (streamRef.current) {
// // //         streamRef.current.getTracks().forEach(track => track.stop());
// // //       }
// // //       if (recognitionRef.current) {
// // //         recognitionRef.current.stop();
// // //       }
// // //       window.speechSynthesis.cancel();
// // //     };
// // //     // FIX: Removed 'toast' from dependency array to prevent infinite loop
// // //   }, []); 

// // //   // --- 2. Speech Recognition Setup ---
// // //   useEffect(() => {
// // //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// // //     if (SpeechRecognition) {
// // //       recognitionRef.current = new SpeechRecognition();
// // //       recognitionRef.current.continuous = true;
// // //       recognitionRef.current.interimResults = true;
// // //       recognitionRef.current.lang = 'en-US';

// // //       recognitionRef.current.onresult = (event) => {
// // //         let interim = '';
// // //         for (let i = event.resultIndex; i < event.results.length; ++i) {
// // //           const result = event.results[i][0].transcript;
// // //           if (event.results[i].isFinal) {
// // //             setTranscript(prev => [...prev, { role: "User", text: result }].slice(-500));
// // //             setLiveUserText("");
// // //             analyzeSentiment(result);
// // //             setQuestionTime(120); // Reset question timer on answer
// // //           } else {
// // //             interim += result;
// // //             setLiveUserText(interim);
// // //           }
// // //         }
// // //       };
// // //     }
// // //   }, []);

// // //   // --- 3. Timer Logic ---
// // //   useEffect(() => {
// // //     let interval;
// // //     if (isInterviewStarted && totalTime > 0) {
// // //       interval = setInterval(() => {
// // //         // Total Session Timer
// // //         setTotalTime(prev => {
// // //           if (prev <= 1) {
// // //             endInterview();
// // //             return 0;
// // //           }
// // //           return prev - 1;
// // //         });

// // //         // Question Timer
// // //         setQuestionTime(prev => {
// // //           if (prev <= 1) {
// // //             askQuestion("Time limit reached. Moving to next question: How do you handle state management in complex applications?");
// // //             toast.info("Time Limit Reached: Next Question.");
// // //             return 120; 
// // //           }
// // //           return prev - 1;
// // //         });
// // //       }, 1000);
// // //     }
// // //     return () => clearInterval(interval);
// // //     // FIX: Removed 'toast' from dependency array here as well
// // //   }, [isInterviewStarted, totalTime]);

// // //   // --- Helper Functions ---
// // //   const analyzeSentiment = (text) => {
// // //     const positive = ['confident', 'optimized', 'scalable', 'efficient', 'react', 'internship'];
// // //     const filler = ['um', 'uh', 'basically', 'actually', 'like', 'sort of'];
// // //     const words = text.toLowerCase().split(' ');
// // //     const pos = words.filter(w => positive.includes(w)).length;
// // //     const fill = words.filter(w => filler.includes(w)).length;
// // //     setSentiment(pos > fill ? "Confident" : fill > pos ? "Nervous" : "Steady");
// // //   };

// // //   const askQuestion = (text) => {
// // //     setCurrentQuestion(text);
// // //     setTranscript(prev => [...prev, { role: "AI", text }].slice(-500));
// // //     const utterance = new SpeechSynthesisUtterance(text);
// // //     utterance.rate = 0.95;
// // //     window.speechSynthesis.speak(utterance);
// // //   };

// // //   const toggleCamera = () => {
// // //     if (isInterviewStarted) {
// // //         toast.warning("Camera is locked during the active session.");
// // //         return; 
// // //     }
// // //     const track = streamRef.current?.getVideoTracks()[0];
// // //     if (track) { 
// // //       track.enabled = !track.enabled; 
// // //       setIsCameraOn(track.enabled);
// // //       track.enabled ? toast.success("Camera Enabled") : toast.info("Camera Disabled");
// // //     }
// // //   };

// // //   const toggleMic = () => {
// // //     if (isInterviewStarted) {
// // //         toast.warning("Microphone is locked during the active session.");
// // //         return; 
// // //     }
// // //     const track = streamRef.current?.getAudioTracks()[0];
// // //     if (track) { 
// // //       track.enabled = !track.enabled; 
// // //       setIsMicOn(track.enabled);
// // //       track.enabled ? toast.success("Microphone Enabled") : toast.info("Microphone Disabled");
// // //     }
// // //   };

// // //   const startInterview = () => {
// // //     // 1. AUTH CHECK
// // //     if (!isAuthenticated) {
// // //       toast.error("Login Required: Please sign in to start an interview.");
// // //       navigate('/auth');
// // //       return;
// // //     }

// // //     // 2. HARDWARE CHECK
// // //     if (!isCameraOn || !isMicOn) {
// // //       toast.warning("Hardware Check Failed: Please enable both Camera and Mic.");
// // //       return;
// // //     }

// // //     // 3. START
// // //     setIsInterviewStarted(true);
// // //     if (recognitionRef.current) recognitionRef.current.start();
// // //     toast.success("Interview Started. Good luck!");
// // //     setTimeout(() => askQuestion("Welcome. All media is now locked. You have 2 minutes per question. Please explain your experience with React and Frontend development."), 1000);
// // //   };

// // //   const endInterview = () => {
// // //     if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
// // //     if (recognitionRef.current) recognitionRef.current.stop();
// // //     setIsInterviewStarted(false);
// // //     toast.info("Interview Ended. Transcript is ready.");
// // //   };

// // //   const downloadPDF = () => {
// // //     const doc = new jsPDF();
// // //     doc.setFontSize(16);
// // //     doc.text("AI Interview Transcript", 20, 20);
// // //     doc.setFontSize(11);
// // //     let y = 30;
    
// // //     transcript.forEach(t => {
// // //       const line = `${t.role}: ${t.text}`;
// // //       const splitLines = doc.splitTextToSize(line, 170);
// // //       if (y + splitLines.length * 7 > 280) {
// // //         doc.addPage();
// // //         y = 20;
// // //       }
// // //       doc.text(splitLines, 20, y);
// // //       y += (splitLines.length * 7) + 5;
// // //     });
    
// // //     doc.save("Interview_Report.pdf");
// // //     toast.success("Transcript Downloaded.");
// // //   };

// // //   // --- Render ---
// // //   return (
// // //     <div className="interview-container animated-fade">
// // //       <div className="interview-layout">
        
// // //         {/* LEFT PANEL: VIDEO */}
// // //         <div className="video-panel glass-card">
// // //           <div className="video-header">
// // //             {isInterviewStarted && (
// // //               <div className="sentiment-tag"><BarChart size={14}/> {sentiment}</div>
// // //             )}
// // //             <div className="timer-badge">
// // //               Total: {Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}
// // //             </div>
// // //           </div>

// // //           <div className="video-wrapper">
// // //             <video ref={videoRef} autoPlay playsInline muted />
// // //             {!isCameraOn && (
// // //               <div className="blocked-overlay">
// // //                 <CameraOff size={48} />
// // //                 <p>Camera Access Required</p>
// // //               </div>
// // //             )}
// // //             <div className={`media-controls ${isInterviewStarted ? 'locked' : ''}`}>
// // //               <button className={isCameraOn ? "on" : "off"} onClick={toggleCamera} disabled={isInterviewStarted}>
// // //                 {isCameraOn ? <Camera size={20}/> : <CameraOff size={20}/>}
// // //               </button>
// // //               <button className={isMicOn ? "on" : "off"} onClick={toggleMic} disabled={isInterviewStarted}>
// // //                 {isMicOn ? <Mic size={20}/> : <MicOff size={20}/>}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* RIGHT PANEL: AI & TRANSCRIPT */}
// // //         <div className="ai-panel glass-card">
// // //           <div className="ai-content-wrapper">
// // //             {isInterviewStarted ? (
// // //               <>
// // //                 <div className="ai-bubble animated-fade">
// // //                   {currentQuestion || "Initializing AI..."}
// // //                 </div>
// // //                 <div className="transcript-container">
// // //                   <label className="transcript-label">Live Transcript</label>
// // //                   <div className="transcript-scroll">
// // //                     {transcript.map((t, i) => (
// // //                       <p key={i} className={t.role.toLowerCase()}>
// // //                         <strong>{t.role}:</strong> {t.text}
// // //                       </p>
// // //                     ))}
// // //                     {liveUserText && (
// // //                       <p className="user interim"><strong>User:</strong> {liveUserText}...</p>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               </>
// // //             ) : (
// // //               <div className="start-prompt">
// // //                 <Lock size={60} className="lock-icon" />
// // //                 <h2>Media Verification</h2>
// // //                 <p>Hardware check required to initiate session.</p>
// // //                 <div className="system-check">
// // //                   <div className={`check-item ${isCameraOn ? 'pass' : 'fail'}`}>
// // //                     {isCameraOn ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>} Camera
// // //                   </div>
// // //                   <div className={`check-item ${isMicOn ? 'pass' : 'fail'}`}>
// // //                     {isMicOn ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>} Mic
// // //                   </div>
// // //                 </div>
// // //                 <button 
// // //                   className={`btn-start ${(!isCameraOn || !isMicOn) ? 'disabled' : ''}`} 
// // //                   onClick={startInterview} 
// // //                   disabled={!isCameraOn || !isMicOn}
// // //                 >
// // //                   <Power size={18}/> Initiate Session
// // //                 </button>
// // //               </div>
// // //             )}
// // //           </div>
// // //           {(totalTime === 0 || (!isInterviewStarted && transcript.length > 0)) && (
// // //             <button className="btn-download" onClick={downloadPDF}>
// // //               <Download size={18}/> Download Transcript
// // //             </button>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Interview;








// // import React, { useState, useEffect, useRef } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios'; // 🔥 NEW: Required for Backend communication
// // import { 
// //   Camera, CameraOff, Mic, MicOff, Power, Download, 
// //   AlertCircle, BarChart, Lock, CheckCircle2 
// // } from 'lucide-react';
// // import jsPDF from 'jsPDF';
// // import { useToast } from '../../context/ToastContext';
// // import { useAuth } from '../../context/AuthContext';
// // import './Interview.css';

// // const Interview = () => {
// //   const toast = useToast();
// //   const { isAuthenticated, user } = useAuth();
// //   const navigate = useNavigate();

// //   const [isInterviewStarted, setIsInterviewStarted] = useState(false);
// //   const [isCameraOn, setIsCameraOn] = useState(false);
// //   const [isMicOn, setIsMicOn] = useState(false);
// //   const [totalTime, setTotalTime] = useState(600);
// //   const [questionTime, setQuestionTime] = useState(120);
// //   const [currentQuestion, setCurrentQuestion] = useState("");
// //   const [transcript, setTranscript] = useState([]); 
// //   const [liveUserText, setLiveUserText] = useState("");
// //   const [sentiment, setSentiment] = useState("Steady");

// //   const videoRef = useRef(null);
// //   const streamRef = useRef(null);
// //   const recognitionRef = useRef(null);

// //   useEffect(() => {
// //     const initMedia = async () => {
// //       try {
// //         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// //         streamRef.current = stream;
// //         if (videoRef.current) videoRef.current.srcObject = stream;
// //         setIsCameraOn(true);
// //         setIsMicOn(true);
// //       } catch (err) {
// //         toast.error("Media Access Denied: Camera and Microphone are required.");
// //       }
// //     };
// //     initMedia();
// //     return () => {
// //       if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
// //       if (recognitionRef.current) recognitionRef.current.stop();
// //       window.speechSynthesis.cancel();
// //     };
// //   }, []);

// //   // --- 2. Speech Recognition (Now with Live AI Trigger) ---
// //   useEffect(() => {
// //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// //     if (SpeechRecognition) {
// //       recognitionRef.current = new SpeechRecognition();
// //       recognitionRef.current.continuous = true;
// //       recognitionRef.current.interimResults = true;
// //       recognitionRef.current.lang = 'en-US';

// //       recognitionRef.current.onresult = async (event) => {
// //         let interim = '';
// //         for (let i = event.resultIndex; i < event.results.length; ++i) {
// //           const result = event.results[i][0].transcript;
// //           if (event.results[i].isFinal) {
// //             // Update UI with user's answer
// //             setTranscript(prev => [...prev, { role: "user", text: result }]);
// //             setLiveUserText("");
// //             analyzeSentiment(result);
// //             setQuestionTime(120);

// //             // 🔥 NEW: GET LIVE AI RESPONSE
// //             try {
// //               const res = await axios.post('http://localhost:5000/api/interview/process', {
// //                 history: transcript,
// //                 currentMessage: result,
// //                 jobRole: user?.role || "Software Developer",
// //                 difficulty: "Intermediate"
// //               }, {
// //                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// //               });

// //               // Ask the next question generated by Gemini
// //               askQuestion(`${res.data.feedback} ${res.data.nextQuestion}`);
// //             } catch (err) {
// //               console.error("AI Error:", err);
// //             }
// //           } else {
// //             interim += result;
// //             setLiveUserText(interim);
// //           }
// //         }
// //       };
// //     }
// //   }, [transcript, user]); // Dependencies ensure AI has the full context

// //   // --- 3. Timer Logic ---
// //   useEffect(() => {
// //     let interval;
// //     if (isInterviewStarted && totalTime > 0) {
// //       interval = setInterval(() => {
// //         setTotalTime(prev => {
// //           if (prev <= 1) { endInterview(); return 0; }
// //           return prev - 1;
// //         });
// //         setQuestionTime(prev => {
// //           if (prev <= 1) {
// //             // Static fallback if time runs out
// //             askQuestion("Time is up for this one. Let's move to the next topic.");
// //             return 120; 
// //           }
// //           return prev - 1;
// //         });
// //       }, 1000);
// //     }
// //     return () => clearInterval(interval);
// //   }, [isInterviewStarted, totalTime]);

// //   const analyzeSentiment = (text) => {
// //     const positive = ['confident', 'optimized', 'scalable', 'efficient', 'react'];
// //     const filler = ['um', 'uh', 'basically', 'actually'];
// //     const words = text.toLowerCase().split(' ');
// //     const pos = words.filter(w => positive.includes(w)).length;
// //     const fill = words.filter(w => filler.includes(w)).length;
// //     setSentiment(pos > fill ? "Confident" : fill > pos ? "Nervous" : "Steady");
// //   };

// //   const askQuestion = (text) => {
// //     setCurrentQuestion(text);
// //     setTranscript(prev => [...prev, { role: "assistant", text }].slice(-500));
// //     const utterance = new SpeechSynthesisUtterance(text);
// //     utterance.rate = 0.95;
// //     window.speechSynthesis.speak(utterance);
// //   };

// //   const toggleCamera = () => {
// //     if (isInterviewStarted) return;
// //     const track = streamRef.current?.getVideoTracks()[0];
// //     if (track) { track.enabled = !track.enabled; setIsCameraOn(track.enabled); }
// //   };

// //   const toggleMic = () => {
// //     if (isInterviewStarted) return;
// //     const track = streamRef.current?.getAudioTracks()[0];
// //     if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
// //   };

// //   // --- 4. Start Interview (Now with Live AI Greeting) ---
// //   const startInterview = async () => {
// //     if (!isAuthenticated) { navigate('/auth'); return; }
// //     if (!isCameraOn || !isMicOn) { toast.warning("Check Hardware"); return; }

// //     setIsInterviewStarted(true);
// //     if (recognitionRef.current) recognitionRef.current.start();
    
// //     // 🔥 NEW: FETCH INITIAL QUESTION FROM GEMINI
// //     try {
// //       const res = await axios.post('http://localhost:5000/api/interview/start', {
// //         jobRole: user?.role || "Software Developer",
// //         difficulty: "Intermediate"
// //       }, {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// //       });
// //       setTimeout(() => askQuestion(res.data.nextQuestion), 1000);
// //     } catch (err) {
// //       // Original fallback if server is down
// //       setTimeout(() => askQuestion("Welcome. Let's start. Please tell me about yourself."), 1000);
// //     }
// //   };

// //   const endInterview = () => {
// //     if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
// //     if (recognitionRef.current) recognitionRef.current.stop();
// //     setIsInterviewStarted(false);
// //     toast.info("Interview Ended.");
// //   };

// //   const downloadPDF = () => {
// //     const doc = new jsPDF();
// //     doc.text("Interview Transcript", 20, 20);
// //     let y = 30;
// //     transcript.forEach(t => {
// //       const line = `${t.role.toUpperCase()}: ${t.text}`;
// //       const splitLines = doc.splitTextToSize(line, 170);
// //       doc.text(splitLines, 20, y);
// //       y += (splitLines.length * 7) + 5;
// //     });
// //     doc.save("Interview_Report.pdf");
// //   };

// //   return (
// //     <div className="interview-container animated-fade">
// //       <div className="interview-layout">
// //         <div className="video-panel glass-card">
// //           <div className="video-header">
// //             {isInterviewStarted && <div className="sentiment-tag"><BarChart size={14}/> {sentiment}</div>}
// //             <div className="timer-badge">Total: {Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}</div>
// //           </div>
// //           <div className="video-wrapper">
// //             <video ref={videoRef} autoPlay playsInline muted />
// //             {!isCameraOn && <div className="blocked-overlay"><CameraOff size={48} /><p>Camera Required</p></div>}
// //             <div className={`media-controls ${isInterviewStarted ? 'locked' : ''}`}>
// //               <button className={isCameraOn ? "on" : "off"} onClick={toggleCamera} disabled={isInterviewStarted}>
// //                 {isCameraOn ? <Camera size={20}/> : <CameraOff size={20}/>}
// //               </button>
// //               <button className={isMicOn ? "on" : "off"} onClick={toggleMic} disabled={isInterviewStarted}>
// //                 {isMicOn ? <Mic size={20}/> : <MicOff size={20}/>}
// //               </button>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="ai-panel glass-card">
// //           <div className="ai-content-wrapper">
// //             {isInterviewStarted ? (
// //               <>
// //                 <div className="ai-bubble animated-fade">{currentQuestion || "AI is thinking..."}</div>
// //                 <div className="transcript-container">
// //                   <div className="transcript-scroll">
// //                     {transcript.map((t, i) => (
// //                       <p key={i} className={t.role}><strong>{t.role}:</strong> {t.text}</p>
// //                     ))}
// //                     {liveUserText && <p className="user interim"><strong>User:</strong> {liveUserText}...</p>}
// //                   </div>
// //                 </div>
// //               </>
// //             ) : (
// //               <div className="start-prompt">
// //                 <Lock size={60} className="lock-icon" />
// //                 <h2>Verification</h2>
// //                 <div className="system-check">
// //                   <div className={`check-item ${isCameraOn ? 'pass' : 'fail'}`}>Camera {isCameraOn ? '✔' : '✘'}</div>
// //                   <div className={`check-item ${isMicOn ? 'pass' : 'fail'}`}>Mic {isMicOn ? '✔' : '✘'}</div>
// //                 </div>
// //                 <button className="btn-start" onClick={startInterview} disabled={!isCameraOn || !isMicOn}><Power size={18}/> Start</button>
// //               </div>
// //             )}
// //           </div>
// //           {(totalTime === 0 || (!isInterviewStarted && transcript.length > 0)) && (
// //             <button className="btn-download" onClick={downloadPDF}><Download size={18}/> Download PDF</button>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Interview;

// // import React, { useState, useEffect, useRef } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios'; 
// // import { 
// //   Camera, CameraOff, Mic, MicOff, Power, Download, 
// //   AlertCircle, BarChart, Lock, CheckCircle2 
// // } from 'lucide-react';
// // import jsPDF from 'jsPDF';
// // import { useToast } from '../../context/ToastContext';
// // import { useAuth } from '../../context/AuthContext';
// // import './Interview.css';

// // const Interview = () => {
// //   const toast = useToast();
// //   const { isAuthenticated, user } = useAuth();
// //   const navigate = useNavigate();

// //   const [isInterviewStarted, setIsInterviewStarted] = useState(false);
// //   const [isCameraOn, setIsCameraOn] = useState(false);
// //   const [isMicOn, setIsMicOn] = useState(false);
// //   const [totalTime, setTotalTime] = useState(600);
// //   const [questionTime, setQuestionTime] = useState(120);
// //   const [currentQuestion, setCurrentQuestion] = useState("");
// //   const [transcript, setTranscript] = useState([]); 
// //   const [liveUserText, setLiveUserText] = useState("");
// //   const [sentiment, setSentiment] = useState("Steady");
// //   const [isAiProcessing, setIsAiProcessing] = useState(false); // 🛡️ Anti-double trigger

// //   const videoRef = useRef(null);
// //   const streamRef = useRef(null);
// //   const recognitionRef = useRef(null);

// //   useEffect(() => {
// //     const initMedia = async () => {
// //       try {
// //         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// //         streamRef.current = stream;
// //         if (videoRef.current) videoRef.current.srcObject = stream;
// //         setIsCameraOn(true);
// //         setIsMicOn(true);
// //       } catch (err) {
// //         toast.error("Media Access Denied: Camera and Microphone are required.");
// //       }
// //     };
// //     initMedia();
// //     return () => {
// //       if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
// //       if (recognitionRef.current) recognitionRef.current.stop();
// //       window.speechSynthesis.cancel();
// //     };
// //   }, []);

// //   // --- 2. Speech Recognition (Now with Emergency RPM Exit) ---
// //   useEffect(() => {
// //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// //     if (SpeechRecognition) {
// //       recognitionRef.current = new SpeechRecognition();
// //       recognitionRef.current.continuous = true;
// //       recognitionRef.current.interimResults = true;
// //       recognitionRef.current.lang = 'en-US';

// //       recognitionRef.current.onresult = async (event) => {
// //         if (isAiProcessing) return; // Ignore mic while AI is thinking

// //         let interim = '';
// //         for (let i = event.resultIndex; i < event.results.length; ++i) {
// //           const result = event.results[i][0].transcript;
// //           if (event.results[i].isFinal) {
// //             setIsAiProcessing(true);
// //             const updatedTranscript = [...transcript, { role: "user", text: result }];
// //             setTranscript(updatedTranscript);
// //             setLiveUserText("");
// //             analyzeSentiment(result);
// //             setQuestionTime(120);

// //             try {
// //               const res = await axios.post('http://localhost:5000/api/interview/process', {
// //                 history: updatedTranscript,
// //                 currentMessage: result,
// //                 jobRole: user?.role || "Software Developer",
// //                 difficulty: "Intermediate"
// //               }, {
// //                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// //               });

// //               askQuestion(`${res.data.feedback} ${res.data.nextQuestion}`);
// //               setIsAiProcessing(false);
// //             } catch (err) {
// //               console.error("AI Error:", err);
// //               // 🔥 EMERGENCY EXIT: Handle RPM Limit
// //               if (err.response && err.response.status === 429) {
// //                 const exitMsg = "The AI system has reached its request limit. We are concluding the interview now to ensure your report is generated.";
// //                 askQuestion(exitMsg);
// //                 toast.error("RPM Limit Reached. Closing Session.");
// //                 setTimeout(() => endInterview(), 6000);
// //               } else {
// //                 setIsAiProcessing(false);
// //               }
// //             }
// //           } else {
// //             interim += result;
// //             setLiveUserText(interim);
// //           }
// //         }
// //       };
// //     }
// //   }, [transcript, user, isAiProcessing]);

// //   // --- 3. Timer Logic ---
// //   useEffect(() => {
// //     let interval;
// //     if (isInterviewStarted && totalTime > 0) {
// //       interval = setInterval(() => {
// //         setTotalTime(prev => {
// //           if (prev <= 1) { endInterview(); return 0; }
// //           return prev - 1;
// //         });
// //         setQuestionTime(prev => {
// //           if (prev <= 1) {
// //             askQuestion("Time is up for this one. Let's move to the next topic.");
// //             return 120; 
// //           }
// //           return prev - 1;
// //         });
// //       }, 1000);
// //     }
// //     return () => clearInterval(interval);
// //   }, [isInterviewStarted, totalTime]);

// //   const analyzeSentiment = (text) => {
// //     const positive = ['confident', 'optimized', 'scalable', 'efficient', 'react'];
// //     const filler = ['um', 'uh', 'basically', 'actually'];
// //     const words = text.toLowerCase().split(' ');
// //     const pos = words.filter(w => positive.includes(w)).length;
// //     const fill = words.filter(w => filler.includes(w)).length;
// //     setSentiment(pos > fill ? "Confident" : fill > pos ? "Nervous" : "Steady");
// //   };

// //   const askQuestion = (text) => {
// //     setCurrentQuestion(text);
// //     setTranscript(prev => [...prev, { role: "assistant", text }].slice(-500));
// //     const utterance = new SpeechSynthesisUtterance(text);
// //     utterance.rate = 0.95;
// //     window.speechSynthesis.speak(utterance);
// //   };

// //   const toggleCamera = () => {
// //     if (isInterviewStarted) return;
// //     const track = streamRef.current?.getVideoTracks()[0];
// //     if (track) { track.enabled = !track.enabled; setIsCameraOn(track.enabled); }
// //   };

// //   const toggleMic = () => {
// //     if (isInterviewStarted) return;
// //     const track = streamRef.current?.getAudioTracks()[0];
// //     if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
// //   };

// //   const startInterview = async () => {
// //     if (!isAuthenticated) { navigate('/auth'); return; }
// //     if (!isCameraOn || !isMicOn) { toast.warning("Check Hardware"); return; }

// //     setIsInterviewStarted(true);
// //     if (recognitionRef.current) recognitionRef.current.start();
    
// //     try {
// //       const res = await axios.post('http://localhost:5000/api/interview/start', {
// //         jobRole: user?.role || "Software Developer",
// //         difficulty: "Intermediate"
// //       }, {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// //       });
// //       setTimeout(() => askQuestion(res.data.nextQuestion), 1000);
// //     } catch (err) {
// //       if (err.response && err.response.status === 429) {
// //         askQuestion("API Limit reached. Concluding session.");
// //         endInterview();
// //       } else {
// //         setTimeout(() => askQuestion("Welcome. Let's start. Please tell me about yourself."), 1000);
// //       }
// //     }
// //   };

// //   const endInterview = () => {
// //     if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
// //     if (recognitionRef.current) recognitionRef.current.stop();
// //     window.speechSynthesis.cancel();
// //     setIsInterviewStarted(false);
// //     setIsAiProcessing(false);
// //     toast.info("Interview Ended.");
// //   };

// //   const downloadPDF = () => {
// //     const doc = new jsPDF();
// //     doc.text("Interview Transcript", 20, 20);
// //     let y = 30;
// //     transcript.forEach(t => {
// //       const line = `${t.role.toUpperCase()}: ${t.text}`;
// //       const splitLines = doc.splitTextToSize(line, 170);
// //       doc.text(splitLines, 20, y);
// //       y += (splitLines.length * 7) + 5;
// //     });
// //     doc.save("Interview_Report.pdf");
// //   };

// //   return (
// //     <div className="interview-container animated-fade">
// //       <div className="interview-layout">
// //         <div className="video-panel glass-card">
// //           <div className="video-header">
// //             {isInterviewStarted && <div className="sentiment-tag"><BarChart size={14}/> {sentiment}</div>}
// //             <div className="timer-badge">Total: {Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}</div>
// //           </div>
// //           <div className="video-wrapper">
// //             <video ref={videoRef} autoPlay playsInline muted />
// //             {!isCameraOn && <div className="blocked-overlay"><CameraOff size={48} /><p>Camera Required</p></div>}
// //             <div className={`media-controls ${isInterviewStarted ? 'locked' : ''}`}>
// //               <button className={isCameraOn ? "on" : "off"} onClick={toggleCamera} disabled={isInterviewStarted}>
// //                 {isCameraOn ? <Camera size={20}/> : <CameraOff size={20}/>}
// //               </button>
// //               <button className={isMicOn ? "on" : "off"} onClick={toggleMic} disabled={isInterviewStarted}>
// //                 {isMicOn ? <Mic size={20}/> : <MicOff size={20}/>}
// //               </button>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="ai-panel glass-card">
// //           <div className="ai-content-wrapper">
// //             {isInterviewStarted ? (
// //               <>
// //                 <div className="ai-bubble animated-fade">{currentQuestion || (isAiProcessing ? "AI is thinking..." : "Ready")}</div>
// //                 <div className="transcript-container">
// //                   <div className="transcript-scroll">
// //                     {transcript.map((t, i) => (
// //                       <p key={i} className={t.role}><strong>{t.role.toUpperCase()}:</strong> {t.text}</p>
// //                     ))}
// //                     {liveUserText && <p className="user interim"><strong>User:</strong> {liveUserText}...</p>}
// //                   </div>
// //                 </div>
// //               </>
// //             ) : (
// //               <div className="start-prompt">
// //                 <Lock size={60} className="lock-icon" />
// //                 <h2>Verification</h2>
// //                 <div className="system-check">
// //                   <div className={`check-item ${isCameraOn ? 'pass' : 'fail'}`}>Camera {isCameraOn ? '✔' : '✘'}</div>
// //                   <div className={`check-item ${isMicOn ? 'pass' : 'fail'}`}>Mic {isMicOn ? '✔' : '✘'}</div>
// //                 </div>
// //                 <button className="btn-start" onClick={startInterview} disabled={!isCameraOn || !isMicOn}><Power size={18}/> Start</button>
// //               </div>
// //             )}
// //           </div>
// //           {(totalTime === 0 || (!isInterviewStarted && transcript.length > 0)) && (
// //             <button className="btn-download" onClick={downloadPDF}><Download size={18}/> Download PDF</button>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Interview;

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; 
// import { 
//   Camera, CameraOff, Mic, MicOff, Power, Download, 
//   BarChart, Lock 
// } from 'lucide-react';
// import jsPDF from 'jspdf';
// import { useToast } from '../../context/ToastContext';
// import { useAuth } from '../../context/AuthContext';
// import './Interview.css';

// const Interview = () => {
//   const toast = useToast();
//   const { isAuthenticated, user } = useAuth();
//   const navigate = useNavigate();

//   // --- States ---
//   const [isInterviewStarted, setIsInterviewStarted] = useState(false);
//   const [isCameraOn, setIsCameraOn] = useState(false);
//   const [isMicOn, setIsMicOn] = useState(false);
//   const [totalTime, setTotalTime] = useState(600);
//   const [questionTime, setQuestionTime] = useState(120);
//   const [currentQuestion, setCurrentQuestion] = useState("");
//   const [transcript, setTranscript] = useState([]); 
//   const [liveUserText, setLiveUserText] = useState("");
//   const [sentiment, setSentiment] = useState("Steady");
//   const [isAiProcessing, setIsAiProcessing] = useState(false); 

//   // --- Refs (The Fix for "Deafness") ---
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   const recognitionRef = useRef(null);
//   const transcriptRef = useRef([]); // 🛡️ ALWAYS holds the latest conversation

//   useEffect(() => {
//     const initMedia = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;
//         setIsCameraOn(true);
//         setIsMicOn(true);
//       } catch (err) {
//         toast.error("Media Access Denied: Camera and Microphone are required.");
//       }
//     };
//     initMedia();
//     return () => {
//       if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
//       if (recognitionRef.current) recognitionRef.current.stop();
//       window.speechSynthesis.cancel();
//     };
//   }, []);

//   // --- 2. Speech Recognition Logic ---
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;
//       recognitionRef.current.lang = 'en-US';

//       recognitionRef.current.onresult = async (event) => {
//         // 🛡️ Block mic input while AI is thinking/speaking
//         if (isAiProcessing) return; 

//         let interim = '';
//         for (let i = event.resultIndex; i < event.results.length; ++i) {
//           const result = event.results[i][0].transcript;
//           if (event.results[i].isFinal) {
//             handleUserResponse(result);
//             setLiveUserText("");
//           } else {
//             interim += result;
//             setLiveUserText(interim);
//           }
//         }
//       };
//     }
//   }, [isAiProcessing]); // Dependency on processing lock

//   const handleUserResponse = async (userText) => {
//     setIsAiProcessing(true);
    
//     // 1. Sync Ref and State immediately
//     const userEntry = { role: "user", text: userText };
//     const updatedHistory = [...transcriptRef.current, userEntry];
//     transcriptRef.current = updatedHistory;
//     setTranscript(updatedHistory);

//     analyzeSentiment(userText);
//     setQuestionTime(120);

//     try {
//       const res = await axios.post('http://localhost:5000/api/interview/process', {
//         history: updatedHistory, // Sending the LIVE ref data
//         currentMessage: userText,
//         jobRole: user?.role || "Software Developer",
//         difficulty: "Intermediate"
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });

//       const aiText = `${res.data.feedback} ${res.data.nextQuestion}`;
      
//       // 2. Sync AI response to Ref
//       const aiEntry = { role: "assistant", text: aiText };
//       transcriptRef.current = [...transcriptRef.current, aiEntry];
//       setTranscript(transcriptRef.current);

//       askQuestion(aiText);
//       setIsAiProcessing(false);
//     } catch (err) {
//       console.error("AI Error:", err);
//       if (err.response && err.response.status === 429) {
//         const exitMsg = "The AI system has reached its limit. Ending session now.";
//         askQuestion(exitMsg);
//         setTimeout(() => endInterview(), 6000);
//       } else {
//         setIsAiProcessing(false);
//       }
//     }
//   };

//   const askQuestion = (text) => {
//     setCurrentQuestion(text);
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.95;
//     window.speechSynthesis.speak(utterance);
//   };

//   const startInterview = async () => {
//     if (!isAuthenticated) { navigate('/auth'); return; }
//     if (!isCameraOn || !isMicOn) { toast.warning("Check Hardware"); return; }

//     setIsInterviewStarted(true);
//     if (recognitionRef.current) recognitionRef.current.start();
    
//     try {
//       const res = await axios.post('http://localhost:5000/api/interview/start', {
//         jobRole: user?.role || "Software Developer"
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });

//       const startMsg = res.data.nextQuestion;
//       const initialHistory = [{ role: "assistant", text: startMsg }];
      
//       // 🛡️ Critical: Set the starting Ref
//       transcriptRef.current = initialHistory;
//       setTranscript(initialHistory);
      
//       setTimeout(() => askQuestion(startMsg), 1000);
//     } catch (err) {
//       const fallback = "Welcome. Please tell me about yourself.";
//       transcriptRef.current = [{ role: "assistant", text: fallback }];
//       setTranscript(transcriptRef.current);
//       setTimeout(() => askQuestion(fallback), 1000);
//     }
//   };

//   // --- Helpers ---
//   useEffect(() => {
//     let interval;
//     if (isInterviewStarted && totalTime > 0) {
//       interval = setInterval(() => {
//         setTotalTime(prev => (prev <= 1 ? (endInterview(), 0) : prev - 1));
//         setQuestionTime(prev => (prev <= 1 ? (askQuestion("Let's move to the next question."), 120) : prev - 1));
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isInterviewStarted, totalTime]);

//   const endInterview = () => {
//     if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
//     if (recognitionRef.current) recognitionRef.current.stop();
//     window.speechSynthesis.cancel();
//     setIsInterviewStarted(false);
//     toast.info("Interview Concluded.");
//   };

//   const analyzeSentiment = (text) => {
//     const positive = ['optimized', 'scalable', 'efficient'];
//     const words = text.toLowerCase().split(' ');
//     const posCount = words.filter(w => positive.includes(w)).length;
//     setSentiment(posCount > 0 ? "Confident" : "Steady");
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Interview Transcript", 20, 20);
//     let y = 30;
//     transcript.forEach(t => {
//       const line = `${t.role.toUpperCase()}: ${t.text}`;
//       const splitLines = doc.splitTextToSize(line, 170);
//       doc.text(splitLines, 20, y);
//       y += (splitLines.length * 7) + 5;
//     });
//     doc.save("Interview_Report.pdf");
//   };

//   return (
//     <div className="interview-container animated-fade">
//       <div className="interview-layout">
//         <div className="video-panel glass-card">
//           <div className="video-header">
//             {isInterviewStarted && <div className="sentiment-tag"><BarChart size={14}/> {sentiment}</div>}
//             <div className="timer-badge">Total: {Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}</div>
//           </div>
//           <div className="video-wrapper">
//             <video ref={videoRef} autoPlay playsInline muted />
//           </div>
//         </div>

//         <div className="ai-panel glass-card">
//           <div className="ai-content-wrapper">
//             {isInterviewStarted ? (
//               <>
//                 <div className="ai-bubble animated-fade">{currentQuestion || (isAiProcessing ? "AI is processing..." : "Ready")}</div>
//                 <div className="transcript-container">
//                   <div className="transcript-scroll">
//                     {transcript.map((t, i) => (
//                       <p key={i} className={t.role}><strong>{t.role.toUpperCase()}:</strong> {t.text}</p>
//                     ))}
//                     {liveUserText && <p className="user interim"><strong>User:</strong> {liveUserText}...</p>}
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="start-prompt">
//                 <Lock size={60} className="lock-icon" />
//                 <h2>Verification</h2>
//                 <button className="btn-start" onClick={startInterview} disabled={!isCameraOn || !isMicOn}><Power size={18}/> Start Session</button>
//               </div>
//             )}
//           </div>
//           {(!isInterviewStarted && transcript.length > 0) && (
//             <button className="btn-download" onClick={downloadPDF}><Download size={18}/> Download PDF</button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Interview;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  Camera, CameraOff, Mic, MicOff, Power, Download, 
  AlertCircle, BarChart, Lock, CheckCircle2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './Interview.css';

const Interview = () => {
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [totalTime, setTotalTime] = useState(600);
  const [questionTime, setQuestionTime] = useState(120);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState([]); 
  const [liveUserText, setLiveUserText] = useState("");
  const [sentiment, setSentiment] = useState("Steady");
  const [isAiProcessing, setIsAiProcessing] = useState(false); 

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef([]); // 🛡️ Fix for AI not hearing properly

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        setIsMicOn(true);
      } catch (err) {
        toast.error("Media Access Denied: Camera and Microphone are required.");
      }
    };
    initMedia();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event) => {
        if (isAiProcessing) return; 

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            handleUserStep(result);
            setLiveUserText("");
          } else {
            interim += result;
            setLiveUserText(interim);
          }
        }
      };
    }
  }, [isAiProcessing]);

  const handleUserStep = async (userText) => {
    setIsAiProcessing(true);
    const updatedHistory = [...transcriptRef.current, { role: "user", text: userText }];
    transcriptRef.current = updatedHistory;
    setTranscript(updatedHistory);
    analyzeSentiment(userText);
    setQuestionTime(120);

    try {
      const res = await axios.post('http://localhost:5000/api/interview/process', {
        history: updatedHistory,
        currentMessage: userText,
        jobRole: user?.role || "Software Developer",
        difficulty: "Intermediate"
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const aiText = `${res.data.feedback} ${res.data.nextQuestion}`;
      const aiEntry = { role: "assistant", text: aiText };
      transcriptRef.current = [...transcriptRef.current, aiEntry];
      setTranscript(transcriptRef.current);

      askQuestion(aiText);
      setIsAiProcessing(false);
    } catch (err) {
      console.error("AI Error:", err);
      
      // 🔥 NEW: Connection Lost / RPM Exit Logic
      let errorMsg = "Connection lost with the interview server. Closing the session now.";
      if (err.response && err.response.status === 429) {
        errorMsg = "The AI system has reached its request limit. We must conclude the session now to save your progress.";
      }

      askQuestion(errorMsg); 
      toast.error(err.response?.status === 429 ? "Rate Limit Reached" : "Connection Lost");
      
      setTimeout(() => endInterview(), 6000); 
    }
  };

  const askQuestion = (text) => {
    setCurrentQuestion(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = async () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (!isCameraOn || !isMicOn) { toast.warning("Check Hardware"); return; }

    setIsInterviewStarted(true);
    if (recognitionRef.current) recognitionRef.current.start();
    
    try {
      const res = await axios.post('http://localhost:5000/api/interview/start', {
        jobRole: user?.role || "Software Developer",
        difficulty: "Intermediate"
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const startMsg = res.data.nextQuestion;
      const initialHistory = [{ role: "assistant", text: startMsg }];
      transcriptRef.current = initialHistory;
      setTranscript(initialHistory);

      setTimeout(() => askQuestion(startMsg), 1000);
    } catch (err) {
      setTimeout(() => askQuestion("Welcome. Please tell me about yourself."), 1000);
    }
  };

  const endInterview = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    setIsInterviewStarted(false);
    setIsAiProcessing(false);
    toast.info("Interview Ended.");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Interview Transcript", 20, 20);
    let y = 30;
    transcript.forEach(t => {
      const line = `${t.role.toUpperCase()}: ${t.text}`;
      const splitLines = doc.splitTextToSize(line, 170);
      doc.text(splitLines, 20, y);
      y += (splitLines.length * 7) + 5;
    });
    doc.save("Interview_Report.pdf");
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsCameraOn(track.enabled); }
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
  };

  const analyzeSentiment = (text) => {
    const positive = ['confident', 'optimized', 'scalable'];
    const words = text.toLowerCase().split(' ');
    const pos = words.filter(w => positive.includes(w)).length;
    setSentiment(pos > 0 ? "Confident" : "Steady");
  };

  return (
    <div className="interview-container animated-fade">
      <div className="interview-layout">
        <div className="video-panel glass-card">
          <div className="video-header">
            {isInterviewStarted && <div className="sentiment-tag"><BarChart size={14}/> {sentiment}</div>}
            <div className="timer-badge">Total: {Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}</div>
          </div>
          <div className="video-wrapper">
            <video ref={videoRef} autoPlay playsInline muted />
            {!isCameraOn && <div className="blocked-overlay"><CameraOff size={48} /><p>Camera Required</p></div>}
            <div className={`media-controls ${isInterviewStarted ? 'locked' : ''}`}>
              <button className={isCameraOn ? "on" : "off"} onClick={toggleCamera} disabled={isInterviewStarted}>
                {isCameraOn ? <Camera size={20}/> : <CameraOff size={20}/>}
              </button>
              <button className={isMicOn ? "on" : "off"} onClick={toggleMic} disabled={isInterviewStarted}>
                {isMicOn ? <Mic size={20}/> : <MicOff size={20}/>}
              </button>
            </div>
          </div>
        </div>

        <div className="ai-panel glass-card">
          <div className="ai-content-wrapper">
            {isInterviewStarted ? (
              <>
                <div className="ai-bubble animated-fade">{currentQuestion || (isAiProcessing ? "AI is thinking..." : "Ready")}</div>
                <div className="transcript-container">
                  <div className="transcript-scroll">
                    {transcript.map((t, i) => (
                      <p key={i} className={t.role}><strong>{t.role.toUpperCase()}:</strong> {t.text}</p>
                    ))}
                    {liveUserText && <p className="user interim"><strong>User:</strong> {liveUserText}...</p>}
                  </div>
                </div>
              </>
            ) : (
              <div className="start-prompt">
                <Lock size={60} className="lock-icon" />
                <h2>Verification</h2>
                <div className="system-check">
                  <div className={`check-item ${isCameraOn ? 'pass' : 'fail'}`}>Camera {isCameraOn ? '✔' : '✘'}</div>
                  <div className={`check-item ${isMicOn ? 'pass' : 'fail'}`}>Mic {isMicOn ? '✔' : '✘'}</div>
                </div>
                <button className="btn-start" onClick={startInterview} disabled={!isCameraOn || !isMicOn}><Power size={18}/> Start Session</button>
              </div>
            )}
          </div>
          {(transcript.length > 0 && !isInterviewStarted) && (
            <button className="btn-download" onClick={downloadPDF}><Download size={18}/> Download PDF</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;