import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import Spinner from '../components/Spinner';

const ProtectedRoutes = () => {
  const { user, loading } = useAuthStore();

  if (loading) return <Spinner />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
