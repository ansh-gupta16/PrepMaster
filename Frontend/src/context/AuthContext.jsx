import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // 🔥 Attach token automatically
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  }, [token]);

  // 🔐 Login
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  // 🚪 Logout
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};