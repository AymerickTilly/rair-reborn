import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';

const ConfirmRegisterRoute = () => {
  const { pendingUsername, loading } = useAuthStore();
  console.log('ConfirmRegisterRoute: pendingUsername=', pendingUsername, 'loading=', loading);
  if (loading) {
    console.log('ConfirmRegisterRoute: Showing loading state');
    return <div>Loading...</div>;
  }
  return pendingUsername ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ConfirmRegisterRoute;