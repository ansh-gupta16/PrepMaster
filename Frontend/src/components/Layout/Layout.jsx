import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Terminal, 
  Bot, 
  Menu, 
  X, 
  GraduationCap 
} from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <nav className="mobile-header">
        <div className="brand-logo">
          <GraduationCap size={28} />
          <span>PrepMaster</span>
        </div>
        <button className="menu-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <GraduationCap size={32} />
          <h1>PrepMaster</h1>
        </div>

        <div className="nav-menu">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/assessment" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BrainCircuit size={20} /> Assessments
          </NavLink>
          <NavLink to="/simulator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Terminal size={20} /> Simulator
          </NavLink>
          <NavLink to="/interview" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bot size={20} /> AI Interview
          </NavLink>
        </div>

        <div className="user-profile">
          <div className="avatar">H</div>
          <div className="user-details">
            <span className="name">Harsh</span>
            <span className="role">Student</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Layout;