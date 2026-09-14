import { Amplify } from "aws-amplify";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION;

export const isAmplifyConfigured = Boolean(userPoolId && userPoolClientId && region);

if (userPoolId && userPoolClientId && region) {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            email: true,
          },
        },
      },
    },
    { ssr: true },
  );
}