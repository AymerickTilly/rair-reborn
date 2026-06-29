import { signIn as amplifySignIn, fetchAuthSession } from 'aws-amplify/auth';
import { useAuthStore } from './AuthStore';

type SignInParameters = {
  username: string;
  password: string;
};

export async function signIn({ username, password }: SignInParameters) {
  const { setUser, setEmail, setGroups, setLoading } = useAuthStore.getState();

  try {
    setLoading(true);

    // Sign in with Amplify
    const user = await amplifySignIn({ username, password });

    // Fetch session to get tokens
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.payload;

    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Safely extract email
    const rawEmail = idToken.email;
    const email = typeof rawEmail === 'string' ? rawEmail : null;

    // Safely extract groups
    const rawGroups = idToken['cognito:groups'];
    const groups = Array.isArray(rawGroups) && rawGroups.every((g) => typeof g === 'string')
      ? rawGroups
      : [];

    // Extract sub
    const sub = idToken.sub;
    if (!sub) {
      throw new Error('No sub found in ID token');
    }

    // Update store
    setUser(user);
    setEmail(email);
    setGroups(groups);

    return { user, sub }; // Return both user and sub
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
  } finally {
    setLoading(false);
  }
}