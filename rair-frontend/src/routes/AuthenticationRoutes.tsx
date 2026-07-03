import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import Spinner from '../components/Spinner';

const AuthenticationRoutes = () => {
  const { user, loading, pendingUsername } = useAuthStore();

  if (loading) return <Spinner />;

  if (user || pendingUsername) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthenticationRoutes;