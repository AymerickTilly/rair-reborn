import { signUp } from 'aws-amplify/auth';

type SignUpParameters = {
  username: string;
  password: string;
  email: string;
};

export async function handleSignUp({
  username,
  password,
  email,
}: SignUpParameters) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
        },
        autoSignIn: false,
      },
    });

    console.log("User ID:", userId);
    return {
      isSignUpComplete,
      userId,
      nextStep,
    };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}
