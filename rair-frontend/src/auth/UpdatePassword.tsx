import { updatePassword, type UpdatePasswordInput } from 'aws-amplify/auth';

async function handleUpdatePassword({
  oldPassword,
  newPassword
}: UpdatePasswordInput) {
  try {
    await updatePassword({ oldPassword, newPassword });
  } catch (err) {
    console.log(err);
  }
}

export default handleUpdatePassword;