import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Logic 1: Enforce lowercase for email immediately
    if (name === 'email') {
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Logic 1: Check for "@" symbol
    if (!formData.email.includes('@')) {
      alert("Invalid Email: Must contain '@' symbol.");
      return;
    }

    // Logic 2: Password Length (Min 8, Max 15)
    if (formData.password.length < 8 || formData.password.length > 15) {
      alert("Password Validation Failed: Must be between 8 and 15 characters.");
      return;
    }

    // If validations pass, proceed
    console.log("Form Submitted", formData);
    if(onLogin) onLogin(); 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* LEFT SIDE: FORM */}
        <div className="auth-form-section">
          <div className="auth-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="subtitle">
              {isLogin 
                ? 'Enter your credentials to access your dashboard.' 
                : 'Start your journey with PrepMaster today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
            )}

            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                maxLength={15}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" className="btn-primary-auth">
              {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={20} />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                className="link-btn" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '' });
                }}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: VISUAL (Restored & Cleaned) */}
        <div className="auth-visual-section">
          <div className="visual-content">
            {/* Logo Removed as requested */}
            <h2>Master Your Interviews</h2>
            <p>
              AI-driven mock interviews, real-time feedback, and comprehensive skill assessments.
            </p>
            {/* Floating Cards Removed as requested */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;