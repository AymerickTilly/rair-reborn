import { supabase } from '../lib/supabase';

type SignUpParameters = {
  username: string;
  password: string;
  email: string;
};

export async function handleSignUp({ username, password, email }: SignUpParameters) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // stored in user_metadata
      },
    });

    if (error) throw error;

    // Supabase sends a confirmation email automatically.
    // isSignUpComplete is false until the user confirms their email.
    return {
      isSignUpComplete: !!data.session, // session exists if email confirm is disabled
      userId: data.user?.id,
      nextStep: { signUpStep: 'CONFIRM_SIGN_UP' },
    };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}
