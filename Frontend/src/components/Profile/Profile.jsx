import React from 'react';
import {
    Mail, MapPin, Calendar, Award, TrendingUp, Clock, CheckCircle, LogOut, BarChart2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext'; // 1. Import Toast Hook
import './Profile.css';

const Profile = () => {
    const toast = useToast(); // 2. Initialize Toast

    // Mock User Data
    const user = {
        name: "Harsh",
        role: "Frontend Developer Intern",
        email: "harsh@prepmaster.com",
        location: "Indore, India",
        joined: "September 2025",
        avatar: "H",
        stats: {
            assessmentsTaken: 14,
            interviewsCompleted: 6,
            avgScore: "8.5",
            streak: 7
        }
    };

    const handleLogout = () => {
        // 3. Trigger Toast Notification
        toast.info("Securely logging out...");

        // Simulate a short delay before redirecting so the user sees the message
        setTimeout(() => {
            window.location.href = "/";
        }, 1500);
    };

    return (
        <div className="profile-container animated-fade">

            {/* 1. PROFILE HEADER */}
            <div className="profile-header glass-card">
                <div className="header-content">

                    {/* Avatar */}
                    <div className="avatar-wrapper">
                        <div className="profile-avatar">
                            {user.avatar}
                        </div>
                        <div className="online-badge"></div>
                    </div>

                    {/* User Info */}
                    <div className="user-details">
                        <div className="name-row">
                            <h1>{user.name}</h1>
                            <span className="role-badge">{user.role}</span>
                        </div>

                        <div className="meta-info">
                            <span className="meta-item"><Mail size={14} /> {user.email}</span>
                            <span className="meta-item"><MapPin size={14} /> {user.location}</span>
                            <span className="meta-item"><Calendar size={14} /> Joined {user.joined}</span>
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
                    <div className="icon-box blue"><Award size={24} /></div>
                    <div className="stat-text">
                        <h3>{user.stats.assessmentsTaken}</h3>
                        <p>Assessments Passed</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="icon-box green"><CheckCircle size={24} /></div>
                    <div className="stat-text">
                        <h3>{user.stats.interviewsCompleted}</h3>
                        <p>Interviews Cracked</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="icon-box purple"><TrendingUp size={24} /></div>
                    <div className="stat-text">
                        <h3>{user.stats.avgScore}/10</h3>
                        <p>Average Score</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="icon-box orange"><Clock size={24} /></div>
                    <div className="stat-text">
                        <h3>{user.stats.streak} Days</h3>
                        <p>Current Streak</p>
                    </div>
                </div>
            </div>

            {/* 3. ACTIVITY SECTION */}
            <div className="analytics-section glass-card">
                <div className="section-header">
                    <h2><BarChart2 size={20} /> Weekly Activity</h2>
                    <select className="time-filter">
                        <option>This Week</option>
                        <option>Last Month</option>
                    </select>
                </div>

                <div className="activity-graph">
                    <div className="graph-bars">
                        <div className="bar-container"><div className="bar" style={{ height: '40%' }} data-tooltip="4 Hrs"></div><span className="day">Mon</span></div>
                        <div className="bar-container"><div className="bar active" style={{ height: '75%' }} data-tooltip="7.5 Hrs"></div><span className="day">Tue</span></div>
                        <div className="bar-container"><div className="bar" style={{ height: '50%' }} data-tooltip="5 Hrs"></div><span className="day">Wed</span></div>
                        <div className="bar-container"><div className="bar" style={{ height: '90%' }} data-tooltip="9 Hrs"></div><span className="day">Thu</span></div>
                        <div className="bar-container"><div className="bar" style={{ height: '60%' }} data-tooltip="6 Hrs"></div><span className="day">Fri</span></div>
                        <div className="bar-container"><div className="bar" style={{ height: '30%' }} data-tooltip="3 Hrs"></div><span className="day">Sat</span></div>
                        <div className="bar-container"><div className="bar" style={{ height: '20%' }} data-tooltip="2 Hrs"></div><span className="day">Sun</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;