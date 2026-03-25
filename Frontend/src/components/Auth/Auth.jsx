import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Auth.css";

// Set backend base URL
axios.defaults.baseURL = "http://127.0.0.1:5000";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? value.toLowerCase() : value,
    }));
  };

  // Handle Login / Register
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // 🔐 LOGIN
        const res = await axios.post("/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        login(res.data.user, res.data.token);
      } else {
        // 📝 REGISTER
        const res = await axios.post("/api/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        login(res.data.user, res.data.token);
      }

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* LEFT SIDE */}
        <div className="auth-form-section">
          <div className="auth-header">
            <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
            <p className="subtitle">
              {isLogin
                ? "Enter your credentials to access your dashboard."
                : "Start your journey with PrepMaster today."}
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
              {isLogin ? "Sign In" : "Sign Up"} <ArrowRight size={20} />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: "", email: "", password: "" });
                }}
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-visual-section">
          <div className="visual-content">
            <h2>Master Your Interviews</h2>
            <p>
              AI-driven mock interviews, real-time feedback, and comprehensive
              skill assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;