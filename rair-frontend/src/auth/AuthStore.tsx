import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type AuthStore = {
  user: any | null;
  userId: string;
  loading: boolean;
  email: string | null;
  groups: string[];
  pendingUsername: string | null;
  passwordReset: boolean | null;
  address: string | null;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  setEmail: (email: string | null) => void;
  setGroups: (groups: string[]) => void;
  setPendingUsername: (username: string | null) => void;
  setPasswordReset: (passwordReset: boolean | null) => void;
  setAddress: (address: string | null) => void;
  setUserId: (userId: string) => void;
  resetAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userId: "",
  loading: true,
  email: null,
  groups: [],
  pendingUsername: null,
  passwordReset: null,
  address: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setEmail: (email) => set({ email }),
  setGroups: (groups) => set({ groups }),
  setPendingUsername: (username) => set({ pendingUsername: username }),
  setPasswordReset: (passwordReset) => set({ passwordReset }),
  setAddress: (address) => set({ address }),
  setUserId: (userId) => set({ userId }),
  resetAuth: () =>
    set({
      user: null,
      userId: "",
      email: null,
      groups: [],
      pendingUsername: null,
      loading: false,
      passwordReset: null,
    }),
}));

// Called once on app load to restore session from Supabase.
// Supabase persists the session in localStorage automatically.
export const initAuth = async () => {
  const { setLoading, setUser, setEmail, setGroups, setUserId, resetAuth } = useAuthStore.getState();
  setLoading(true);

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      resetAuth();
      return;
    }

    const user = session.user;
    // Supabase stores custom role in user_metadata or app_metadata
    const role = user.app_metadata?.role ?? user.user_metadata?.role ?? 'Customer';
    const groups = [role];

    setUser(user);
    setEmail(user.email ?? null);
    setGroups(groups);
    setUserId(user.id);
  } catch (error) {
    console.error('Error initializing auth:', error);
    resetAuth();
  } finally {
    setLoading(false);
  }
};

// Returns the current JWT access token — used in every API call header.
// Supabase equivalent of Cognito's fetchAuthSession().tokens.idToken
export const getIdToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};
