import { supabase } from '../lib/supabase';
import { useAuthStore } from './AuthStore';

type SignInParameters = {
  username: string; // email in Supabase
  password: string;
};

export async function signIn({ username, password }: SignInParameters) {
  const { setUser, setEmail, setGroups, setLoading, setUserId } = useAuthStore.getState();

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error) throw new Error(error.message);

    const user = data.user;
    const role = user.app_metadata?.role ?? user.user_metadata?.role ?? 'Customer';

    setUser(user);
    setEmail(user.email ?? null);
    setGroups([role]);
    setUserId(user.id);

    return { user, sub: user.id };
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
  } finally {
    setLoading(false);
  }
}
