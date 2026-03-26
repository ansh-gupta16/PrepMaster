import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Camera, CameraOff, Mic, MicOff, Power, Download,
  BarChart, ChevronRight, Briefcase, Globe, Gauge,
  AlertTriangle, Eye, Shield
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './Interview.css';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */

const DOMAINS = [
  "Frontend Development", "Backend Development", "Full Stack Development",
  "DevOps & Cloud", "Data Science & ML", "Mobile Development",
  "Cybersecurity", "Database Administration", "System Design",
  "Product Management", "UI/UX Design", "QA & Testing",
  "Embedded Systems", "Blockchain", "Game Development",
];

const JOB_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "DevOps Engineer", "Data Scientist",
  "Machine Learning Engineer", "Product Manager", "UI/UX Designer",
  "Mobile Developer", "Cloud Architect", "Security Engineer",
  "QA Engineer", "Database Engineer", "Blockchain Developer",
];

const DIFFICULTIES = [
  { key: "Easy",   label: "Easy",   desc: "Beginner friendly, conceptual questions", color: "#10b981" },
  { key: "Medium", label: "Medium", desc: "Technical + behavioural mix",              color: "#f59e0b" },
  { key: "Hard",   label: "Hard",   desc: "Advanced, system design, deep-dive",       color: "#ef4444" },
];

const TOTAL_DURATION = 600;

// Violation messages written to transcript
const VIOLATION = {
  MULTIPLE_FACES:    "VIOLATION: Multiple faces detected in the camera frame. Interview terminated for integrity.",
  NO_FACE:           "WARNING: No face detected — please stay visible in the camera.",
  CAMERA_DISCONNECT: "VIOLATION: Camera was disconnected during the interview. Session terminated.",
  TAB_SWITCH:        "VIOLATION: Tab switch or window focus loss detected. Interview terminated.",
};

// Consecutive-frame thresholds before action is taken
const NO_FACE_WARN_FRAMES      = 10; // ~5 s at 500 ms poll — warn
const MULTI_FACE_TERM_FRAMES   = 3;  // ~1.5 s — terminate

const POSITIVE_WORDS = [
  'confident','optimized','scalable','efficient','implemented',
  'designed','solved','built','improved','achieved','delivered',
  'managed','led','created','developed','deployed','integrated',
  'tested','documented','reduced','increased','automated',
];

/* ─────────────────────────────────────────────
   face-api.js — lazy CDN loader
   Resolves even if the CDN fails so the
   interview still starts in degraded mode.
───────────────────────────────────────────── */
let faceApiReady   = false;
let faceApiLoading = false;

const loadFaceApi = () =>
  new Promise((resolve) => {
    if (faceApiReady && window.faceapi) { resolve(true); return; }
    if (faceApiLoading) {
      const poll = setInterval(() => {
        if (faceApiReady) { clearInterval(poll); resolve(true); }
      }, 200);
      return;
    }
    faceApiLoading = true;

    const script  = document.createElement('script');
    script.src    = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    script.async  = true;

    script.onload = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/';
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        faceApiReady = true;
        resolve(true);
      } catch (e) {
        console.warn('[face-api] model load failed — detection disabled:', e.message);
        resolve(false);
      }
    };

    script.onerror = () => {
      console.warn('[face-api] CDN load failed — detection disabled.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Interview = () => {
  const toast    = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  /* ── Setup state ── */
  const [setupStep,          setSetupStep]          = useState(1);
  const [selectedRole,       setSelectedRole]       = useState(user?.role || "");
  const [selectedDomain,     setSelectedDomain]     = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [customRole,         setCustomRole]         = useState("");

  /* ── Interview state ── */
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCameraOn,         setIsCameraOn]         = useState(false);
  const [isMicOn,            setIsMicOn]            = useState(false);
  const [totalTime,          setTotalTime]          = useState(TOTAL_DURATION);
  const [currentQuestion,    setCurrentQuestion]    = useState("");
  const [transcript,         setTranscript]         = useState([]);
  const [liveUserText,       setLiveUserText]       = useState("");
  const [sentiment,          setSentiment]          = useState("Steady");
  const [isAiProcessing,     setIsAiProcessing]     = useState(false);
  const [isSpeaking,         setIsSpeaking]         = useState(false);

  /* ── Proctoring state ── */
  const [faceStatus,    setFaceStatus]    = useState("ok");      // "ok" | "warn" | "violation"
  const [faceCount,     setFaceCount]     = useState(1);
  const [isTerminating, setIsTerminating] = useState(false);

  /* ── Refs ── */
  const videoRef             = useRef(null);
  const streamRef            = useRef(null);
  const recognitionRef       = useRef(null);
  const transcriptRef        = useRef([]);
  const isAiProcessingRef    = useRef(false);
  const isSpeakingRef        = useRef(false);
  const timerRef             = useRef(null);
  const faceLoopRef          = useRef(null);
  const isInterviewActiveRef = useRef(false);  // sync mirror of isInterviewStarted
  const terminatingRef       = useRef(false);  // guards against double-termination
  const noFaceCount          = useRef(0);
  const multiFaceCount       = useRef(0);
  const noFaceWarnedRef      = useRef(false);

  /* ══════════════════════════════════════════
     VIOLATION LOGGER
     Appends a system entry to the transcript
     with role="violation" for special rendering.
  ══════════════════════════════════════════ */
  const logViolation = useCallback((message) => {
    const entry = {
      role:      "violation",
      text:      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    transcriptRef.current = [...transcriptRef.current, entry];
    setTranscript([...transcriptRef.current]);
    console.warn('[PROCTORING]', message);
  }, []);

  /* ══════════════════════════════════════════
     HARD TERMINATE (proctoring violations)
     Logs the reason, tears everything down,
     shows termination overlay.
  ══════════════════════════════════════════ */
  const terminateInterview = useCallback((reason) => {
    if (terminatingRef.current) return;
    terminatingRef.current       = true;
    isInterviewActiveRef.current = false;

    logViolation(reason);

    if (faceLoopRef.current) { clearInterval(faceLoopRef.current); faceLoopRef.current = null; }

    streamRef.current?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);

    isAiProcessingRef.current = false;
    isSpeakingRef.current     = false;

    setIsTerminating(true);
    setIsInterviewStarted(false);
    setIsAiProcessing(false);
    setIsSpeaking(false);
    setIsCameraOn(false);
    setIsMicOn(false);
    setFaceStatus("violation");

    // Announce to user via TTS (best-effort)
    try {
      const msg = new SpeechSynthesisUtterance(
        "Interview terminated due to a proctoring violation. Please download your transcript."
      );
      window.speechSynthesis.speak(msg);
    } catch { /* ignore */ }

    toast.error("Interview terminated: integrity violation detected.");
  }, [logViolation, toast]);

  /* ══════════════════════════════════════════
     FACE DETECTION LOOP (500 ms)
  ══════════════════════════════════════════ */
  const startFaceLoop = useCallback(() => {
    if (faceLoopRef.current) clearInterval(faceLoopRef.current);

    faceLoopRef.current = setInterval(async () => {
      if (!isInterviewActiveRef.current || terminatingRef.current) return;
      if (!videoRef.current || videoRef.current.readyState < 2)    return;
      if (!faceApiReady || !window.faceapi)                        return;

      // Camera track liveness check
      const videoTrack = streamRef.current?.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState === 'ended') {
        terminateInterview(VIOLATION.CAMERA_DISCONNECT);
        return;
      }

      try {
        const detections = await window.faceapi.detectAllFaces(
          videoRef.current,
          new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );
        const count = detections.length;
        setFaceCount(count);

        /* ── Multiple faces ── */
        if (count > 1) {
          multiFaceCount.current++;
          noFaceCount.current = 0;
          setFaceStatus("violation");

          if (multiFaceCount.current === 1) {
            logViolation(
              `WARNING: ${count} faces detected — interview will terminate if this persists.`
            );
            toast.error(`⚠ Multiple faces (${count}) detected! Terminating shortly…`);
          }

          if (multiFaceCount.current >= MULTI_FACE_TERM_FRAMES) {
            terminateInterview(VIOLATION.MULTIPLE_FACES);
          }
          return;
        }

        // Reset multi-face streak
        multiFaceCount.current = 0;

        /* ── No face ── */
        if (count === 0) {
          noFaceCount.current++;

          if (noFaceCount.current >= NO_FACE_WARN_FRAMES) {
            setFaceStatus("warn");
            if (!noFaceWarnedRef.current) {
              noFaceWarnedRef.current = true;
              logViolation(VIOLATION.NO_FACE);
              toast.warning("No face detected — please stay visible in the camera.");
            }
          }
          return;
        }

        /* ── Exactly one face ── */
        noFaceCount.current     = 0;
        noFaceWarnedRef.current = false;
        multiFaceCount.current  = 0;
        setFaceStatus("ok");

      } catch (err) {
        // Non-fatal — skip frame silently
        console.warn('[face-api] frame error (skipped):', err.message);
      }
    }, 500);
  }, [logViolation, terminateInterview, toast]);

  /* ══════════════════════════════════════════
     CAMERA TRACK ENDED EVENT
     Fires immediately if the OS revokes the
     device (cable pull, system dialog, etc.)
  ══════════════════════════════════════════ */
  const attachTrackEndedListener = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const onEnded = () => {
      if (!isInterviewActiveRef.current || terminatingRef.current) return;
      terminateInterview(VIOLATION.CAMERA_DISCONNECT);
    };

    track.addEventListener('ended', onEnded);
    track._endedHandler = onEnded; // store for cleanup
  }, [terminateInterview]);

  /* ══════════════════════════════════════════
     TAB SWITCH / WINDOW BLUR
  ══════════════════════════════════════════ */
  useEffect(() => {
    const onVisibility = () => {
      if (!isInterviewActiveRef.current || terminatingRef.current) return;
      if (document.hidden) terminateInterview(VIOLATION.TAB_SWITCH);
    };

    const onBlur = () => {
      if (!isInterviewActiveRef.current || terminatingRef.current) return;
      setTimeout(() => {
        if (!isInterviewActiveRef.current || terminatingRef.current) return;
        if (!document.hasFocus()) terminateInterview(VIOLATION.TAB_SWITCH);
      }, 500);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [terminateInterview]);

  /* ══════════════════════════════════════════
     MEDIA INIT — once on mount
  ══════════════════════════════════════════ */
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        setIsMicOn(true);
      } catch {
        toast.error("Camera and Microphone access denied. Both are required.");
      }
    })();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
      if (timerRef.current)    clearInterval(timerRef.current);
      if (faceLoopRef.current) clearInterval(faceLoopRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ══════════════════════════════════════════
     SPEECH RECOGNITION — once on mount
  ══════════════════════════════════════════ */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition unavailable. Please use Chrome.");
      return;
    }

    const rec         = new SR();
    rec.continuous    = true;
    rec.interimResults = true;
    rec.lang          = 'en-US';

    rec.onresult = (event) => {
      if (isAiProcessingRef.current || isSpeakingRef.current) return;
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          handleUserStep(text.trim()); // eslint-disable-line no-use-before-define
          setLiveUserText("");
        } else {
          interim += text;
          setLiveUserText(interim);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return;
      console.warn('Speech recognition error:', e.error);
    };

    recognitionRef.current = rec;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ══════════════════════════════════════════
     COUNTDOWN TIMER
  ══════════════════════════════════════════ */
  useEffect(() => {
    if (!isInterviewStarted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); endInterview(); return 0; } // eslint-disable-line no-use-before-define
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isInterviewStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ══════════════════════════════════════════
     ASK QUESTION — TTS
     Stops recognition while speaking so the
     mic cannot capture the AI's own voice.
  ══════════════════════════════════════════ */
  const askQuestion = useCallback((text) => {
    setCurrentQuestion(text);
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    const utt  = new SpeechSynthesisUtterance(text);
    utt.rate   = 0.95;

    const done = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      try { recognitionRef.current?.start(); } catch { /* ignore */ }
    };

    utt.onend   = done;
    utt.onerror = done;
    window.speechSynthesis.speak(utt);
  }, []);

  /* ══════════════════════════════════════════
     USER SPEECH → AI
  ══════════════════════════════════════════ */
  const handleUserStep = useCallback(async (userText) => {
    if (!userText) return;

    isAiProcessingRef.current = true;
    setIsAiProcessing(true);

    const updatedHistory = [...transcriptRef.current, { role: "user", text: userText }];
    transcriptRef.current = updatedHistory;
    setTranscript([...updatedHistory]);
    analyzeSentiment(userText);

    const jobRole = selectedRole || customRole || "Software Engineer";
    const domain  = selectedDomain || "General Technology";

    try {
      const res = await axios.post(
        'http://localhost:5000/api/interview/process',
        { history: updatedHistory, currentMessage: userText, jobRole, difficulty: selectedDifficulty, domain },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const aiText  = `${res.data.feedback} ${res.data.nextQuestion}`;
      transcriptRef.current = [...transcriptRef.current, { role: "assistant", text: aiText }];
      setTranscript([...transcriptRef.current]);

      isAiProcessingRef.current = false;
      setIsAiProcessing(false);

      if (res.data.isEnd) { askQuestion(aiText); setTimeout(() => endInterview(), 8000); return; } // eslint-disable-line no-use-before-define
      askQuestion(aiText);

    } catch (err) {
      const is429    = err.response?.status === 429;
      const errorMsg = is429
        ? "The AI system has reached its request limit. Session closing now."
        : "Connection to the server was lost. Session closing now.";

      toast.error(is429 ? "Rate Limit Reached" : "Connection Lost");
      askQuestion(errorMsg);
      isAiProcessingRef.current = false;
      setIsAiProcessing(false);
      setTimeout(() => endInterview(), 7000); // eslint-disable-line no-use-before-define
    }
  }, [selectedRole, customRole, selectedDomain, selectedDifficulty, askQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ══════════════════════════════════════════
     START INTERVIEW
  ══════════════════════════════════════════ */
  const startInterview = async () => {
    if (!isAuthenticated)        { navigate('/auth'); return; }
    if (!isCameraOn || !isMicOn) { toast.warning("Camera and Microphone must be enabled."); return; }

    const jobRole = selectedRole || customRole;
    if (!jobRole)        { toast.warning("Please select or enter a job role."); return; }
    if (!selectedDomain) { toast.warning("Please select a domain."); return; }

    // Reset all proctoring state
    terminatingRef.current       = false;
    noFaceCount.current          = 0;
    multiFaceCount.current       = 0;
    noFaceWarnedRef.current      = false;
    isInterviewActiveRef.current = true;

    setIsInterviewStarted(true);
    setIsTerminating(false);
    setFaceStatus("ok");
    setTotalTime(TOTAL_DURATION);

    attachTrackEndedListener();

    try { recognitionRef.current?.start(); } catch { /* already active */ }

    // Load face-api and start detection (non-blocking)
    loadFaceApi().then((loaded) => {
      if (loaded && isInterviewActiveRef.current) startFaceLoop();
      else if (!loaded) console.warn('[face-api] running without face detection.');
    });

    // Get opening question
    try {
      const res = await axios.post(
        'http://localhost:5000/api/interview/start',
        { jobRole, difficulty: selectedDifficulty, domain: selectedDomain },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const startMsg       = res.data.nextQuestion || res.data.feedback;
      const initialHistory = [{ role: "assistant", text: startMsg }];
      transcriptRef.current = initialHistory;
      setTranscript(initialHistory);
      setTimeout(() => askQuestion(startMsg), 800);

    } catch {
      const fallback = `Welcome to your ${selectedDifficulty} level ${jobRole} interview in ${selectedDomain}. Please start by introducing yourself.`;
      transcriptRef.current = [{ role: "assistant", text: fallback }];
      setTranscript([...transcriptRef.current]);
      setTimeout(() => askQuestion(fallback), 800);
    }
  };

  /* ══════════════════════════════════════════
     END INTERVIEW — normal finish
  ══════════════════════════════════════════ */
  const endInterview = useCallback(() => {
    if (terminatingRef.current) return; // proctoring violation already handling teardown
    isInterviewActiveRef.current = false;

    if (faceLoopRef.current) { clearInterval(faceLoopRef.current); faceLoopRef.current = null; }

    // Remove track-ended listener
    const track = streamRef.current?.getVideoTracks()[0];
    if (track?._endedHandler) {
      track.removeEventListener('ended', track._endedHandler);
      delete track._endedHandler;
    }

    streamRef.current?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);

    isAiProcessingRef.current = false;
    isSpeakingRef.current     = false;

    setIsInterviewStarted(false);
    setIsAiProcessing(false);
    setIsSpeaking(false);
    setIsCameraOn(false);
    setIsMicOn(false);
    setFaceStatus("ok");
    toast.info("Interview session ended.");
  }, [toast]);

  /* ══════════════════════════════════════════
     DOWNLOAD PDF
     Colour-codes violations in red.
     Handles multi-page overflow.
  ══════════════════════════════════════════ */
  const downloadPDF = () => {
    const doc    = new jsPDF();
    const pageH  = doc.internal.pageSize.height;
    const margin = 20;
    const maxW   = 170;
    const lineH  = 7;

    // Header
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Interview Transcript", margin, margin);

    doc.setFontSize(10);
    doc.text(
      `Role: ${selectedRole || customRole}  |  Domain: ${selectedDomain}  |  Difficulty: ${selectedDifficulty}`,
      margin, 30
    );
    doc.text(`Date: ${new Date().toLocaleString()}`, margin, 38);

    const violations = transcriptRef.current.filter(t => t.role === "violation");
    if (violations.length > 0) {
      doc.setTextColor(180, 30, 30);
      doc.text(`Integrity Violations Recorded: ${violations.length}`, margin, 46);
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(11);
    let y = 55;

    transcriptRef.current.forEach((t) => {
      let label, rgb;
      if      (t.role === "assistant") { label = "INTERVIEWER";           rgb = [16, 140, 100]; }
      else if (t.role === "violation") { label = `[SYSTEM ${t.timestamp || ""}]`; rgb = [180, 30, 30]; }
      else                             { label = "YOU";                   rgb = [0, 0, 0];   }

      const lines   = doc.splitTextToSize(`${label}: ${t.text}`, maxW);
      const blockH  = lines.length * lineH + 5;

      if (y + blockH > pageH - margin) { doc.addPage(); y = margin; }

      doc.setTextColor(...rgb);
      doc.text(lines, margin, y);
      y += blockH;
    });

    doc.save(`Interview_${(selectedRole || customRole).replace(/\s+/g, '_')}_${selectedDifficulty}.pdf`);
  };

  /* ══════════════════════════════════════════
     CAMERA / MIC TOGGLES
  ══════════════════════════════════════════ */
  const toggleCamera = () => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setIsCameraOn(t.enabled); }
  };

  const toggleMic = () => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setIsMicOn(t.enabled); }
  };

  /* ══════════════════════════════════════════
     SENTIMENT
  ══════════════════════════════════════════ */
  const analyzeSentiment = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const count = words.filter(w => POSITIVE_WORDS.includes(w)).length;
    setSentiment(count >= 2 ? "Confident" : count === 1 ? "Engaged" : "Steady");
  };

  /* ══════════════════════════════════════════
     DISPLAY HELPERS
  ══════════════════════════════════════════ */
  const formatTime  = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timerDanger = totalTime < 120;

  const faceLabel = () => {
    if (faceStatus === "violation") return `⛔ ${faceCount > 1 ? `${faceCount} Faces` : "Violation"}`;
    if (faceStatus === "warn")      return "⚠ No Face";
    return `👤 ${faceCount} Face`;
  };

  /* ══════════════════════════════════════════
     SETUP WIZARD
  ══════════════════════════════════════════ */
  const renderSetup = () => (
    <div className="setup-wizard">
      <div className="setup-steps">
        {[1, 2, 3].map(s => (
          <div key={s} className={`setup-step-dot ${setupStep >= s ? 'active' : ''} ${setupStep > s ? 'done' : ''}`}>
            {s}
          </div>
        ))}
      </div>

      {setupStep === 1 && (
        <div className="setup-section animated-fade">
          <Briefcase size={36} className="setup-icon" />
          <h2>What role are you interviewing for?</h2>
          <p className="setup-hint">Select a role or type a custom one</p>
          <div className="role-grid">
            {JOB_ROLES.map(role => (
              <button key={role} className={`role-chip ${selectedRole === role ? 'selected' : ''}`}
                onClick={() => { setSelectedRole(role); setCustomRole(""); }}>
                {role}
              </button>
            ))}
          </div>
          <div className="custom-input-row">
            <input type="text" placeholder="Or type a custom role…" value={customRole}
              className="custom-input"
              onChange={e => { setCustomRole(e.target.value); setSelectedRole(""); }} />
          </div>
          <button className="btn-next" disabled={!selectedRole && !customRole.trim()} onClick={() => setSetupStep(2)}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {setupStep === 2 && (
        <div className="setup-section animated-fade">
          <Globe size={36} className="setup-icon" />
          <h2>Which domain or field?</h2>
          <p className="setup-hint">Choose the primary area for this interview</p>
          <div className="role-grid">
            {DOMAINS.map(domain => (
              <button key={domain} className={`role-chip ${selectedDomain === domain ? 'selected' : ''}`}
                onClick={() => setSelectedDomain(domain)}>
                {domain}
              </button>
            ))}
          </div>
          <div className="setup-nav">
            <button className="btn-back" onClick={() => setSetupStep(1)}>Back</button>
            <button className="btn-next" disabled={!selectedDomain} onClick={() => setSetupStep(3)}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {setupStep === 3 && (
        <div className="setup-section animated-fade">
          <Gauge size={36} className="setup-icon" />
          <h2>Choose difficulty level</h2>
          <p className="setup-hint">This controls question depth and feedback tone</p>
          <div className="difficulty-cards">
            {DIFFICULTIES.map(d => (
              <button key={d.key} className={`difficulty-card ${selectedDifficulty === d.key ? 'selected' : ''}`}
                style={{ '--diff-color': d.color }} onClick={() => setSelectedDifficulty(d.key)}>
                <span className="diff-label">{d.label}</span>
                <span className="diff-desc">{d.desc}</span>
              </button>
            ))}
          </div>
          <div className="setup-summary">
            <span>🎯 {selectedRole || customRole}</span>
            <span>📂 {selectedDomain}</span>
            <span>⚡ {selectedDifficulty}</span>
          </div>
          <div className="setup-nav">
            <button className="btn-back" onClick={() => setSetupStep(2)}>Back</button>
          </div>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="interview-container animated-fade">
      <div className="interview-layout">

        {/* ─────── LEFT: VIDEO PANEL ─────── */}
        <div className="video-panel glass-card">
          <div className="video-header">
            <div className="header-left">
              {isInterviewStarted && (
                <div className="sentiment-tag"><BarChart size={14} /> {sentiment}</div>
              )}
              {isInterviewStarted && (
                <div className={`face-status-tag face-${faceStatus}`}>
                  <Eye size={14} /> {faceLabel()}
                </div>
              )}
            </div>
            <div className={`timer-badge ${timerDanger ? 'danger' : ''}`}>
              {formatTime(totalTime)}
            </div>
          </div>

          <div className="video-wrapper">
            <video ref={videoRef} autoPlay playsInline muted />

            {/* Camera off overlay — only if NOT terminated (termination has its own overlay) */}
            {!isCameraOn && !isTerminating && (
              <div className="blocked-overlay">
                <CameraOff size={48} /><p>Camera Required</p>
              </div>
            )}

            {/* ── TERMINATION OVERLAY ── */}
            {isTerminating && (
              <div className="termination-overlay">
                <AlertTriangle size={60} className="term-icon-overlay" />
                <h3>Interview Terminated</h3>
                <p>An integrity violation was detected.</p>
                <p className="term-reason-text">
                  {(() => {
                    const last = transcriptRef.current.filter(t => t.role === "violation").slice(-1)[0];
                    return last?.text || "Proctoring violation.";
                  })()}
                </p>
              </div>
            )}

            {/* ── Multi-face live banner ── */}
            {isInterviewStarted && !isTerminating && faceStatus === "violation" && (
              <div className="face-violation-banner">
                <AlertTriangle size={15} />
                Multiple faces detected — terminating shortly…
              </div>
            )}

            {/* ── No-face warning banner ── */}
            {isInterviewStarted && faceStatus === "warn" && (
              <div className="face-warn-banner">
                <Eye size={15} />
                No face detected — please return to the camera
              </div>
            )}

            {/* ── AI speaking ── */}
            {isSpeaking && !isTerminating && (
              <div className="speaking-indicator">
                <span /><span /><span />AI Speaking…
              </div>
            )}

            <div className={`media-controls ${isInterviewStarted ? 'locked' : ''}`}>
              <button className={isCameraOn ? "on" : "off"} onClick={toggleCamera} disabled={isInterviewStarted}>
                {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>
              <button className={isMicOn ? "on" : "off"} onClick={toggleMic} disabled={isInterviewStarted}>
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </div>
          </div>

          {isInterviewStarted && (
            <div className="proctoring-notice">
              <Shield size={12} /> Proctored — face detection active
            </div>
          )}
        </div>

        {/* ─────── RIGHT: AI PANEL ─────── */}
        <div className="ai-panel glass-card">
          <div className="ai-content-wrapper">

            {isInterviewStarted ? (
              /* ── LIVE INTERVIEW ── */
              <>
                <div className="interview-meta-bar">
                  <span className="meta-chip">{selectedRole || customRole}</span>
                  <span className="meta-chip">{selectedDomain}</span>
                  <span className={`meta-chip diff-${selectedDifficulty.toLowerCase()}`}>
                    {selectedDifficulty}
                  </span>
                </div>

                <div className="ai-bubble animated-fade">
                  {currentQuestion || (isAiProcessing ? "AI is thinking…" : "Listening…")}
                </div>

                <div className="transcript-container">
                  <div className="transcript-scroll">
                    {transcript.map((t, i) => (
                      <p key={i} className={t.role}>
                        {t.role === "violation" ? (
                          <span className="violation-entry">
                            <AlertTriangle size={12} className="v-icon" />
                            <span className="v-label">SYSTEM [{t.timestamp}]</span>
                            {" "}{t.text}
                          </span>
                        ) : (
                          <><strong>{t.role === "assistant" ? "INTERVIEWER" : "YOU"}:</strong> {t.text}</>
                        )}
                      </p>
                    ))}
                    {liveUserText && (
                      <p className="user interim"><strong>YOU:</strong> {liveUserText}…</p>
                    )}
                  </div>
                </div>

                <button className="btn-end" onClick={endInterview}>End Interview</button>
              </>

            ) : isTerminating ? (
              /* ── POST-TERMINATION SUMMARY ── */
              <div className="termination-summary">
                <AlertTriangle size={48} className="term-icon" />
                <h2>Session Terminated</h2>
                <p className="term-desc">
                  Your interview was stopped due to an integrity violation.
                  The full transcript is preserved below and available to download.
                </p>
                <div className="transcript-container" style={{ flex: 1 }}>
                  <div className="transcript-scroll">
                    {transcript.map((t, i) => (
                      <p key={i} className={t.role}>
                        {t.role === "violation" ? (
                          <span className="violation-entry">
                            <AlertTriangle size={12} className="v-icon" />
                            <span className="v-label">SYSTEM [{t.timestamp}]</span>
                            {" "}{t.text}
                          </span>
                        ) : (
                          <><strong>{t.role === "assistant" ? "INTERVIEWER" : "YOU"}:</strong> {t.text}</>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

            ) : (
              /* ── SETUP ── */
              <>
                {setupStep < 3 ? renderSetup() : (
                  <div className="start-prompt">
                    {renderSetup()}
                    <div className="system-check">
                      <div className={`check-item ${isCameraOn ? 'pass' : 'fail'}`}>
                        Camera {isCameraOn ? '✔' : '✘'}
                      </div>
                      <div className={`check-item ${isMicOn ? 'pass' : 'fail'}`}>
                        Mic {isMicOn ? '✔' : '✘'}
                      </div>
                    </div>
                    <div className="proctoring-warning">
                      <Shield size={14} />
                      This session is AI-proctored. Tab switching, multiple faces, or camera disconnection will immediately terminate the interview and be logged.
                    </div>
                    <button className="btn-start" onClick={startInterview} disabled={!isCameraOn || !isMicOn}>
                      <Power size={18} /> Start Interview
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Download always shown when transcript exists and interview not active */}
          {transcript.length > 0 && !isInterviewStarted && (
            <button className="btn-download" onClick={downloadPDF}>
              <Download size={18} /> Download PDF Report
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Interview;
