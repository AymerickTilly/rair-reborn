import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "./AuthStore";

// Component to save and restore location
const LocationManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  // Save current location to localStorage (excluding login/register/confirm routes)
  useEffect(() => {
    if (user && !['/login', '/register', '/confirmRegister'].includes(location.pathname)) {
      localStorage.setItem('lastLocation', location.pathname + location.search);
    }
  }, [location, user]);

  // Restore location after auth initialization
  useEffect(() => {
    if (!loading && user) {
      const lastLocation = localStorage.getItem('lastLocation');
      if (lastLocation && location.pathname === '/') {
        navigate(lastLocation, { replace: true });
      }
    }
  }, [loading, user, navigate, location.pathname]);

  return null;
};

export default LocationManager;