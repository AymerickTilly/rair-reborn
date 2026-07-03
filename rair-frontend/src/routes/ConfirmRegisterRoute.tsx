import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import Spinner from '../components/Spinner';

const ConfirmRegisterRoute = () => {
  const { pendingUsername, loading } = useAuthStore();
  if (loading) return <Spinner />;
  return pendingUsername ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ConfirmRegisterRoute;