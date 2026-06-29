import { supabase } from '../lib/supabase';

// Called after user clicks the reset link in their email.
// Supabase handles the token automatically via the URL hash.
async function handleConfirmResetPassword({ newPassword }: { username?: string; confirmationCode?: string; newPassword: string }) {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    console.log('Successfully reset password.');
  } catch (error) {
    console.log(error);
  }
}

export default handleConfirmResetPassword;
