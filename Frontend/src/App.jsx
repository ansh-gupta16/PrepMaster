import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Assessments from './components/Assessments/Assessments';
import CodingSimulator from './components/CodingSimulator/CodingSimulator';
import Interview from './components/Interview/Interview';
import Profile from './components/Profile/Profile';
import Auth from './components/Auth/Auth';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import EntryLoader from './components/EntryLoader/EntryLoader';

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  const handleLoaderComplete = () => {
    setAppLoading(false);
    // Allow time for the loader's exit transition (0.8s)
    setTimeout(() => {
      setShowLoader(false);
    }, 850);
  };

  return (
    <ToastProvider>
      <AuthProvider>
        {showLoader && <EntryLoader onComplete={handleLoaderComplete} />}
        <BrowserRouter>
          <Routes>
            {/* 1. Public Route for Login */}
            <Route path="/auth" element={<Auth />} />

            {/* 2. Main Layout (Visible to Guests) */}
            <Route path="/" element={<Layout />}>
              
              {/* PUBLIC: Dashboard is open to everyone */}
              <Route index element={<Dashboard />} />
              
              {/* LOCKED: These require login */}
              <Route path="assessment" element={
                <ProtectedRoute>
                  <Assessments />
                </ProtectedRoute>
              } />
              
              <Route path="simulator" element={
                <ProtectedRoute>
                  <CodingSimulator />
                </ProtectedRoute>
              } />
              
              <Route path="interview" element={
                <ProtectedRoute>
                  <Interview />
                </ProtectedRoute>
              } />

              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;