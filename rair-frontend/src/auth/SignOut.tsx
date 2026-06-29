import { signOut as amplifySignOut } from 'aws-amplify/auth';
import { useAuthStore } from './AuthStore';

export const signOut = async () => {
  const { resetAuth, setLoading } = useAuthStore.getState();

  try {
    setLoading(true);
    await amplifySignOut();
  } catch (error) {
    console.error('Error during sign out:', error);
  } finally {
    resetAuth(); // Clear Zustand store state
    setLoading(false); // Reset loading state
    localStorage.removeItem('lastLocation');
  }
};
