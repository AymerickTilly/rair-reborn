import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useAuthStore } from '../auth/AuthStore';

const AuthenticationRoutes = () => {
  const { user, loading, pendingUsername } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  // Show loading UI while checking
  if (loading || isChecking) {
    return <div>Loading...</div>;
  }

  // Redirect authenticated users or those in registration to "/"
  if (isAuthenticated || user || pendingUsername) {
    return <Navigate to="/" replace />;
  }

  // Allow access to /login or /register
  return <Outlet />;
};

export default AuthenticationRoutes;