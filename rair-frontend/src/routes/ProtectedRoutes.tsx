import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';

const ProtectedRoutes = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>; // Better UX than returning null
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
