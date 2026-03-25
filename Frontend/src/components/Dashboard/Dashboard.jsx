import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Terminal, Bot } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const user = { name: "Harsh", readiness: 85 };

  // Added 'progress' and 'colorName' to match your CSS classes
  const modules = [
    {
      id: 1,
      title: "Skill Assessment",
      desc: "Evaluate your technical and soft skills with AI-powered assessments tailored to top recruiters' expectations.",
      icon: <BrainCircuit size={28} />, // Icon size adjusted to fit CSS
      action: "Start Quiz",
      colorName: "blue", // Matches .module-card__icon--blue
      path: "/assessment",
      progress: 72,
      statLabel: "Skills Mapped"
    },
    {
      id: 2,
      title: "Coding Simulator",
      desc: "Practice real interview coding challenges in a timed environment with instant feedback and hints.",
      icon: <Terminal size={28} />,
      action: "Open IDE",
      colorName: "green", // Matches .module-card__icon--green
      path: "/simulator",
      progress: 58,
      statLabel: "Problems Solved"
    },
    {
      id: 3,
      title: "AI Interview",
      desc: "Simulate face-to-face interviews with our AI interviewer. Get scored on communication, clarity, and confidence.",
      icon: <Bot size={28} />,
      action: "Start Session",
      colorName: "purple", // Matches .module-card__icon--purple
      path: "/interview",
      progress: 45,
      statLabel: "Sessions Done"
    }
  ];

  // Dummy stats data for the top row
  const stats = [
    { label: "Overall Score", value: "85%", change: "↑ +5% this week" },
    { label: "Practice Hours", value: "42h", change: "↑ +8h this month" },
    { label: "Challenges Done", value: "127", change: "↑ +12 this week" },
    { label: "Rank", value: "#23", change: "↑ Top 5%" },
  ];

  return (
    <div className="dashboard"> 

      <div className="main">
        {/* Header Section */}
        <header className="header glass-card">
          <div className="header__left">
            <h1 className="header__greeting">Welcome back, {user.name}! 👋</h1>
            <p className="header__subtitle">Your placement journey is looking great. Keep the momentum!</p>
          </div>
          
          <div className="header__badge pulse-glow">
            <span className="header__badge-dot"></span>
            Readiness: {user.readiness}%
          </div>
        </header>

        {/* Stats Row */}
        <div className="stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card glass-card">
              <span className="stat-card__label">{stat.label}</span>
              <div className="stat-card__value">{stat.value}</div>
              <span className="stat-card__change">{stat.change}</span>
            </div>
          ))}
        </div>

        {/* Modules Grid with Progress Bars */}
        <section className="modules">
          {modules.map((mod) => (
            <div 
              key={mod.id} 
              className="module-card glass-card"
              onClick={() => navigate(mod.path)}
            >
              {/* Icon */}
              <div className={`module-card__icon module-card__icon--${mod.colorName}`}>
                {mod.icon}
              </div>

              {/* Text Content */}
              <h3 className="module-card__title">{mod.title}</h3>
              <p className="module-card__desc">{mod.desc}</p>

              {/* Progress Bar Section */}
              <div className="module-card__progress">
                <div className="module-card__progress-label">
                  <span>{mod.statLabel}</span>
                  <span>{mod.progress}%</span>
                </div>
                
                <div className="module-card__progress-bar">
                  <div 
                    className={`module-card__progress-fill module-card__progress-fill--${mod.colorName}`}
                    style={{ width: `${mod.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;