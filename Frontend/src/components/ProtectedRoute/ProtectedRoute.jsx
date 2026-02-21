import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Access Denied: Please Login first.");
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated) return null;

  return children;
};

export default ProtectedRoute;