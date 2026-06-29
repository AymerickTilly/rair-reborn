import { supabase } from '../lib/supabase';

async function handleUpdatePassword({
  newPassword
}: {
  oldPassword?: string;
  newPassword: string;
}) {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    console.log('Password updated successfully.');
  } catch (err) {
    console.log(err);
  }
}

export default handleUpdatePassword;