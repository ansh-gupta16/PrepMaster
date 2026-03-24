import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BrainCircuit, Terminal, Bot, ArrowRight, Play,
  Target, BookOpen, AlertTriangle, Clock, 
  TrendingUp, Hash, Zap, MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [assessmentStats, setAssessmentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          axios.get('/api/auth/profile'),
          axios.get('/api/assessments/stats')
        ]);
        setUserData(profileRes.data);
        setAssessmentStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const modules = [
    {
      id: 1,
      title: "Skill Assessment",
      desc: "AI-powered skill evaluation tailored to top recruiters' expectations.",
      icon: <BrainCircuit size={24} />,
      path: "/assessment",
      rows: [
        { 
          icon: <Target size={14} />, 
          label: "Accuracy", 
          value: statsLoading ? "..." : (assessmentStats ? `${assessmentStats.accuracy}%` : "0%"), 
          accent: true 
        },
        { 
          icon: <BookOpen size={14} />, 
          label: "Topics Covered", 
          value: statsLoading ? "..." : (assessmentStats?.topicsCovered || "0 / 4") 
        },
        { 
          icon: <AlertTriangle size={14} />, 
          label: "Weak Areas", 
          value: statsLoading ? "..." : (assessmentStats?.weakAreas || "No data") 
        },
        { 
          icon: <Clock size={14} />, 
          label: "Last Activity", 
          value: userData?.lastActive ? new Date(userData.lastActive).toLocaleDateString() : "Just now" 
        },
      ]
    },
    {
      id: 2,
      title: "Coding Simulator",
      desc: "Real interview coding challenges in a timed environment with instant feedback.",
      icon: <Terminal size={24} />,
      path: "/simulator",
      rows: [
        { icon: <Hash size={14} />, label: "Problems Solved", value: userData?.problemsSolved || "0" },
        { icon: <TrendingUp size={14} />, label: "Performance", value: "Improving", accent: true },
        { icon: <Zap size={14} />, label: "Total Submissions", value: userData?.totalSubmissions || "0" },
        { icon: <Clock size={14} />, label: "Last Session", value: "Today" },
      ]
    },
    {
      id: 3,
      title: "AI Interview",
      desc: "Simulate face-to-face interviews. Scored on communication, clarity, and confidence.",
      icon: <Bot size={24} />,
      path: "/interview",
      rows: [
        { icon: <MessageSquare size={14} />, label: "Sessions Done", value: "8" },
        { icon: <TrendingUp size={14} />, label: "Confidence", value: "Needs Focus", warn: true },
        { icon: <Zap size={14} />, label: "Avg. Score", value: "7.2 / 10" },
        { icon: <Clock size={14} />, label: "Last Session", value: "5 days ago" },
      ]
    }
  ];

  const stats = [
    { label: "Problems Attempted", value: userData?.attemptedQuestions?.length || "0", change: "↑ +5% this week" },
    { label: "Practice Count", value: userData?.totalSubmissions || "0", change: "↑ +8h this month" },
    { label: "Challenges Solved", value: userData?.problemsSolved || "0", change: "↑ +12 this week" },
  ];



  return (
    <div className="dashboard">
      <div className="main">
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge pulse-glow">
              <span className="badge-dot"></span> PrepMaster AI is live
            </div>
            <h1 className="hero-title">
              Master Interviews.<br/>
              <span className="gradient-text">Track Skills.</span><br/>
              Get Hired.
            </h1>
            <p className="hero-desc">
              The ultimate AI-powered platform designed for developers. Practice coding, 
              simulate real interviews, and land your dream job with data-driven insights.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => navigate('/auth')}>
                Get Started <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
              </button>
              <button className="btn-ghost" onClick={() => navigate('/simulator')}>
                View Simulator <Play size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="code-preview glass-card animate-float">
              <div className="editor-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="editor-title">twoSum.js</span>
              </div>
              <pre className="editor-code">
                <code>
<span className="code-keyword">function</span> <span className="code-func">twoSum</span>(nums, target) {'{\n'}
  <span className="code-keyword">const</span> map = <span className="code-keyword">new</span> <span className="code-class">Map</span>();{'\n'}
  <span className="code-keyword">for</span> (<span className="code-keyword">let</span> i = 0; i {'<'} nums.length; i++) {'{\n'}
    <span className="code-keyword">const</span> comp = target - nums[i];{'\n'}
    <span className="code-keyword">if</span> (map.<span className="code-func">has</span>(comp)) {'{\n'}
      <span className="code-keyword">return</span> [map.<span className="code-func">get</span>(comp), i];{'\n'}
    {'}\n'}
    map.<span className="code-func">set</span>(nums[i], i);{'\n'}
  {'}\n'}
{'}'}
                </code>
              </pre>
            </div>
            <div className="hero-glow"></div>
          </div>
        </section>

        {/* Stats Row — Global Rank removed */}
        {/* Stats Row */}
        <section className="dashboard-metrics-row">
          <div className="metrics-full">
            <h2 className="section-title">Your Progress</h2>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card glass-card">
                  <span className="stat-card__label">{stat.label}</span>
                  <div className="stat-card__value">{stat.value}</div>
                  <span className="stat-card__change">{stat.change}</span>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Module Cards with Detail Strips */}
        <section className="modules-section">
          <h2 className="section-title">Core Modules</h2>
          <div className="modules">
            {modules.map((mod) => (
              <div 
                key={mod.id} 
                className="module-card glass-card"
                onClick={() => navigate(mod.path)}
              >
                <div className="module-card__top">
                  <div className="module-card__icon glass">
                    {mod.icon}
                  </div>
                  <ArrowUpRight size={18} className="module-card__arrow" />
                </div>

                <h3 className="module-card__title">{mod.title}</h3>
                <p className="module-card__desc">{mod.desc}</p>

                <div className="detail-strip">
                  {mod.rows.map((row, i) => (
                    <div key={i} className="detail-strip__row">
                      <div className="detail-strip__label">
                        <span className="detail-strip__icon">{row.icon}</span>
                        {row.label}
                      </div>
                      <span className={`detail-strip__value ${row.accent ? 'accent' : ''} ${row.warn ? 'warn' : ''}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;