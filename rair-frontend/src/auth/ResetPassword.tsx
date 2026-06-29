import { confirmResetPassword, type ConfirmResetPasswordInput } from 'aws-amplify/auth';

async function handleConfirmResetPassword({
  username,
  confirmationCode,
  newPassword
}: ConfirmResetPasswordInput) {
  try {
    await confirmResetPassword({ username, confirmationCode, newPassword });
  } catch (error) {
    console.log(error);
  }
}

export default handleConfirmResetPassword;