import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../auth/AuthStore';
import Spinner from '../components/Spinner';

const ResetPasswordRoute = () => {
  const { passwordReset, loading } = useAuthStore();
  if (loading) return <Spinner />;
  return passwordReset ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ResetPasswordRoute;