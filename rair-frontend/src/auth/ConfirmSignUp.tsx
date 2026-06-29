import { supabase } from '../lib/supabase';

// In Supabase, email confirmation is handled via a magic link in the email.
// There's no manual OTP code entry like Cognito — Supabase verifies automatically.
// This function is kept for compatibility but redirects the user to check their email.
export const handleSignUpConfirmation = async ({
  username,
  confirmationCode,
}: {
  username: string;
  confirmationCode: string;
}) => {
  try {
    // Supabase uses OTP verification if you want code-based confirm
    const { error } = await supabase.auth.verifyOtp({
      email: username,
      token: confirmationCode,
      type: 'email',
    });

    if (error) {
      console.error('Confirmation error:', error);
      return { isSignUpComplete: false };
    }

    return { isSignUpComplete: true };
  } catch (error) {
    console.error('Confirmation error:', error);
    return { isSignUpComplete: false };
  }
};
