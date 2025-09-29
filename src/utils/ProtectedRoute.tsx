import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    // Redirect to /signin if not authenticated
    return <Navigate to="/auth" />;
  }
  return children; // Render the protected route
};

export default ProtectedRoute;
