// ✅ FILE: auth/AuthStore.ts
import { create } from 'zustand';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

type AuthStore = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  userId: string;
  loading: boolean;
  email: string | null;
  groups: string[];
  pendingUsername: string | null;
  passwordReset: boolean | null;
  address: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const initAuth = async () => {
  const { setLoading, setUser, setEmail, setGroups, setUserId, resetAuth } = useAuthStore.getState();
  setLoading(true);

  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.payload;

    if (!idToken) throw new Error('No ID token found');

    const rawEmail = idToken.email;
    const email = typeof rawEmail === 'string' ? rawEmail : null;
    const rawGroups = idToken['cognito:groups'];
    const groups = Array.isArray(rawGroups) && rawGroups.every((g) => typeof g === 'string') ? rawGroups : [];
    const sub = idToken.sub;
    if (typeof sub === 'string') setUserId(sub); // ✅ NEW: Save userId from token

    setUser(user);
    setEmail(email);
    setGroups(groups);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'UserUnAuthenticatedException') {
      console.log('User not signed in yet');
    } else {
      console.error('Error initializing auth:', error);
    }
    resetAuth();
  } finally {
    setLoading(false);
  }
};

export const getIdToken = async () => {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || null;
};
