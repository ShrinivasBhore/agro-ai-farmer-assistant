import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAppContext();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
