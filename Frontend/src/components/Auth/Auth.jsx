import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import Context
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth(); // Access login function from context
  const navigate = useNavigate(); // For redirecting after login
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- DUMMY IDP LOGIC ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.includes('@')) {
      alert("Invalid Email: Must contain '@' symbol.");
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 15) {
      alert("Password Validation Failed: Must be between 8 and 15 characters.");
      return;
    }

    // Retrieve our "Database" from Local Storage
    const usersDB = JSON.parse(localStorage.getItem('dummy_users_db')) || [];

    if (isLogin) {
      // SIGN IN LOGIC
      const existingUser = usersDB.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (existingUser) {
        // Successful Login
        login({ name: existingUser.name, email: existingUser.email, role: "Student" });
        navigate('/'); // Redirect to Dashboard
      } else {
        // Failed Login
        alert("Invalid email or password. Please try again or create an account.");
      }

    } else {
      // SIGN UP LOGIC
      const emailExists = usersDB.some((u) => u.email === formData.email);

      if (emailExists) {
        alert("This email is already registered. Please sign in instead.");
      } else {
        // Create new user and save to "Database"
        const newUser = { 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        };
        
        localStorage.setItem('dummy_users_db', JSON.stringify([...usersDB, newUser]));
        
        // Log them in immediately after signing up
        login({ name: newUser.name, email: newUser.email, role: "Student" });
        navigate('/'); // Redirect to Dashboard
      }
    }
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

        {/* RIGHT SIDE: VISUAL */}
        <div className="auth-visual-section">
          <div className="visual-content">
            <h2>Master Your Interviews</h2>
            <p>
              AI-driven mock interviews, real-time feedback, and comprehensive skill assessments.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;