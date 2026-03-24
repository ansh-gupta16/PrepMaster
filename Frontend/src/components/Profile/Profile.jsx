import React, { useState, useEffect } from 'react';
import {
    Mail, MapPin, Calendar, Award, TrendingUp, Clock, CheckCircle, LogOut, BarChart2, Loader2, Bot
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext'; 
import './Profile.css';

const Profile = () => {
    const toast = useToast();
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assessmentHistory, setAssessmentHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/auth/profile');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError("Could not load profile data.");
                toast.error("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        const fetchAssessmentHistory = async () => {
            setHistoryLoading(true);
            try {
                const res = await axios.get('/api/assessments/history');
                setAssessmentHistory(res.data.data);
            } catch (err) {
                console.error("Failed to fetch assessment history:", err);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchProfile();
        fetchAssessmentHistory();
    }, [toast]);

    const handleLogout = () => {
        toast.info("Securely logging out...");
        setTimeout(() => {
            logout();
            window.location.href = "/";
        }, 1500);
    };

    if (loading) {
        return (
            <div className="profile-loading-state">
                <div className="loading-spinner-container">
                    <div className="custom-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error-state glass-card">
                <BarChart2 size={48} className="error-icon" />
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">Try Again</button>
            </div>
        );
    }

    // Map DB fields to UI Display
    const userData = {
        name: profile.name,
        role: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
        email: profile.email,
        location: profile.location || "Indore, India", // Default or mock
        joined: new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avatar: profile.name.charAt(0).toUpperCase(),
        stats: {
            problemsSolved: profile.problemsSolved || 0,
            totalSubmissions: profile.totalSubmissions || 0,
            attempted: profile.attemptedQuestions?.length || 0,
            streak: profile.streak || 0
        },
        recentActivity: profile.recentActivity || []
    };

    return (
        <div className="profile-container animated-fade">

            {/* 1. PROFILE HEADER */}
            <div className="profile-header glass-card">
                <div className="header-content">

                    {/* Avatar */}
                    <div className="avatar-wrapper">
                        <div className="profile-avatar">
                            {userData.avatar}
                        </div>
                        <div className="online-badge"></div>
                    </div>

                    {/* User Info */}
                    <div className="user-details">
                        <div className="name-row">
                            <h1>{userData.name}</h1>
                            <span className="role-badge">{userData.role}</span>
                        </div>

                        <div className="meta-info">
                            <span className="meta-item"><Mail size={14} /> {userData.email}</span>
                            <span className="meta-item"><MapPin size={14} /> {userData.location}</span>
                            <span className="meta-item"><Calendar size={14} /> Joined {userData.joined}</span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* 2. STATS GRID */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="icon-box blue"><BarChart2 size={24} /></div>
                    <div className="stat-text">
                        <h3>{userData.stats.problemsSolved}</h3>
                        <p>Problems Solved</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="icon-box green"><TrendingUp size={24} /></div>
                    <div className="stat-text">
                        <h3>{userData.stats.attempted}</h3>
                        <p>Problems Attempted</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="icon-box purple"><Award size={24} /></div>
                    <div className="stat-text">
                        <h3>{userData.stats.totalSubmissions}</h3>
                        <p>Total Submissions</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="icon-box orange"><Clock size={24} /></div>
                    <div className="stat-text">
                        <h3>{userData.stats.streak} Days</h3>
                        <p>Current Streak</p>
                    </div>
                </div>
            </div>

            {/* 3. RECENT CODING ACTIVITY */}
            <div className="activity-section glass-card">
                <div className="section-header">
                    <h2><Clock size={20} /> Recent Coding Activity</h2>
                </div>

                <div className="activity-list scrollable-activity-feed">
                    <div className="activity-scroll-content">
                        {userData.recentActivity.length > 0 ? (
                            userData.recentActivity.map((act, i) => (
                                <div key={i} className="activity-item">
                                    <div className={`status-dot ${act.status.toLowerCase()}`}></div>
                                    <div className="activity-info">
                                        <span className="activity-title">{act.problemTitle}</span>
                                        <span className="activity-meta">{act.language} • {new Date(act.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`activity-status ${act.status.toLowerCase()}`}>{act.status}</div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-activity">
                                <p>No coding activity yet. Start solving problems to see your progress!</p>
                            </div>
                        )}
                    </div>
                    <div className="feed-fade-overlay"></div>
                </div>
            </div>

            {/* 4. RECENT ASSESSMENTS SECTION */}
            <div className="activity-section glass-card" style={{ marginTop: '2rem' }}>
                <div className="section-header">
                    <h2><TrendingUp size={20} /> Recent Assessments</h2>
                </div>

                <div className="assessment-history-list">
                    {historyLoading ? (
                        <div className="history-loader">
                            <Loader2 className="animate-spin" size={24} />
                            <p>Loading assessments...</p>
                        </div>
                    ) : assessmentHistory.length > 0 ? (
                        assessmentHistory.map((session, idx) => (
                            <div key={idx} className="assessment-history-card">
                                <div className="session-main">
                                    <div className="session-info">
                                        <h4>{session.topic}</h4>
                                        <span className="session-date">{new Date(session.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`session-score ${session.correctAnswers / session.totalQuestions >= 0.7 ? 'high' : 'low'}`}>
                                        {Math.round((session.correctAnswers / session.totalQuestions) * 100)}%
                                    </div>
                                </div>

                                <div className="session-details">
                                    {session.detailedReview?.slice(0, 3).map((q, qIdx) => (
                                        <div key={qIdx} className="history-q-item">
                                            <p className="q-text-small">{q.question}</p>
                                            <div className="q-ans-row">
                                                <span className={`ans-pill ${q.status === 'correct' ? 'correct' : 'incorrect'}`}>
                                                    {q.userAnswer}
                                                </span>
                                                {q.status !== 'correct' && (
                                                    <span className="ans-pill correct-hint">
                                                        Correct: {q.correctAnswer}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {session.detailedReview?.length > 3 && (
                                        <p className="more-qs">+{session.detailedReview.length - 3} more questions</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-activity">
                            <p>No assessment attempts found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. RECENT INTERVIEW TRANSCRIPTS SECTION (PLACEHOLDER) */}
            <div className="activity-section glass-card" style={{ marginTop: '2rem' }}>
                <div className="section-header">
                    <h2><Bot size={20} /> Recent Interview Transcripts</h2>
                </div>
                <div className="empty-activity placeholder">
                    <p>No interview transcripts available yet. Start an AI interview to see your feedback here!</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;