import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="w-full min-h-screen flex items-center justify-center text-muted">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
