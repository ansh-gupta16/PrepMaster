import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Layout.css';
import { 
  LayoutDashboard, BrainCircuit, Terminal, Bot, Menu, X, 
  GraduationCap, User, LogIn, LogOut 
} from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Intercept click for restricted items
  const handleRestrictedClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault(); // STOP navigation
      toast.error("Locked: Please Login to access this feature.");
      navigate('/auth'); // Redirect to login
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <nav className="mobile-header">
        <div className="brand-logo">
          <img src="/LOGO.png" alt="PrepMaster Logo" className="brand-logo-img" />
          <span>PrepMaster</span>
        </div>
        <button className="menu-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <img src="/LOGO.png" alt="PrepMaster Logo" className="brand-logo-img" />
          <h1>PrepMaster</h1>
        </div>

        <div className="nav-menu">
          {/* PUBLIC: Dashboard (No onClick handler) */}
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>

          {/* LOCKED: Simulator */}
          <NavLink 
            to="/simulator" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleRestrictedClick} // Locks this button
          >
            <Terminal size={20} /> Simulator
          </NavLink>

          {/* LOCKED: Assessments */}
          <NavLink 
            to="/assessment" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleRestrictedClick} // Locks this button
          >
            <BrainCircuit size={20} /> Assessments
          </NavLink>

          {/* LOCKED: AI Interview */}
          <NavLink 
            to="/interview" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleRestrictedClick} // Locks this button
          >
            <Bot size={20} /> AI Interview
          </NavLink>
          
          {/* LOCKED: Profile (Only shows if logged in anyway) */}
          {isAuthenticated && (
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <User size={20} /> My Profile
            </NavLink>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {isAuthenticated ? (
            <div className="sidebar-footer-authenticated">
              {!user ? (
                <div className="user-profile-loading">
                  <div className="avatar-loading spin-slow"></div>
                  <div className="details-loading">
                    <div className="skeleton-line name"></div>
                    <div className="skeleton-line role"></div>
                  </div>
                </div>
              ) : (
                <div 
                  className="user-profile-block" 
                  onClick={() => navigate('/profile')}
                  title="View Profile"
                >
                  <div className="avatar-wrapper">
                    <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div className="status-dot online"></div>
                  </div>
                  <div className="user-details">
                    <span className="name">{user?.name || 'User'}</span>
                    <span className="role">{user?.role || 'Student'}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-sidebar-login" onClick={() => navigate('/auth')}>
              <LogIn size={20} /> Login Now
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>

      {isSidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Layout;