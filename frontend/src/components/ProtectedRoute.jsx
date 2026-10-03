import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-red-200 text-center shadow-md">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="font-heading text-xl font-bold text-text-dark">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          Your current account role (<span className="font-bold uppercase text-deep-purple">{user.role}</span>) does not have permission to view this module.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-deep-purple text-white text-xs font-bold rounded-lg hover:bg-mid-purple transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
