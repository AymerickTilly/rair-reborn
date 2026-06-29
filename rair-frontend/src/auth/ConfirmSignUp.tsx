import { confirmSignUp } from 'aws-amplify/auth';

export const handleSignUpConfirmation = async ({
  username,
  confirmationCode,
}: {
  username: string;
  confirmationCode: string;
}) => {
  try {
    await confirmSignUp({ username, confirmationCode });
  } catch (error) {
    console.error('Confirmation error:', error);
    return { isSignUpComplete: false };
  }
};
