import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Login
  const login = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  }, []);

  // Logout — clears everything and accepts optional navigate callback
  const logout = useCallback((navigateFn) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    // Clear any simulator cached code
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("pm_code_")) {
        localStorage.removeItem(key);
      }
    });

    // Force redirect if navigate function provided
    if (typeof navigateFn === "function") {
      navigateFn("/", { replace: true });
    }
  }, []);

  // Attach token and fetch profile
  useEffect(() => {
    const fetchUser = async (authToken) => {
      try {
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (res.data) {
          setUser(res.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Session expired or invalid token");
        logout();
      }
    };

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
      if (!user) {
        fetchUser(token);
      } else {
        setIsAuthenticated(true);
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token, user, logout]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};