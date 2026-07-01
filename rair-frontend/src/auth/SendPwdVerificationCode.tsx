import { supabase } from '../lib/supabase';

// Sends a password reset email — Supabase equivalent of Cognito's resetPassword()
async function handleResetPassword(username: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(username, {
      redirectTo: `${window.location.origin}/resetPassword`,
    });
    if (error) throw error;
    console.log('Password reset email sent');
  } catch (error) {
    console.log(error);
  }
}

export default handleResetPassword;
