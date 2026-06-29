import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';

const AuthenticationRoutes = () => {
  const { user, loading, pendingUsername } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user || pendingUsername) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthenticationRoutes;