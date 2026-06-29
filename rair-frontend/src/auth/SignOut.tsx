import { supabase } from '../lib/supabase';
import { useAuthStore } from './AuthStore';

export const signOut = async () => {
  const { resetAuth, setLoading } = useAuthStore.getState();

  try {
    setLoading(true);
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error during sign out:', error);
  } finally {
    resetAuth();
    setLoading(false);
    localStorage.removeItem('lastLocation');
  }
};
