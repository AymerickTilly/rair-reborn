import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';

const ResetPasswordRoute = () => {
  const { passwordReset, loading } = useAuthStore();
  console.log('ResetPasswordRoute: resetPassword=', passwordReset, 'loading=', loading);
  if (loading) {
    console.log('ConfirmRegisterRoute: Showing loading state');
    return <div>Loading...</div>;
  }
  return passwordReset ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ResetPasswordRoute;