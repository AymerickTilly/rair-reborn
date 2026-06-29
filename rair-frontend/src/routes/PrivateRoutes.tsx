import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';

interface PrivateRouteProps {
  allowedGroups: string[];
}

const PrivateRoutes = ({ allowedGroups }: PrivateRouteProps) => {
  const { user, groups, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  const isAllowed = groups.some(group => allowedGroups.includes(group));

  return user && isAllowed ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoutes;