import { Amplify } from "aws-amplify";
import { generatedAuthConfig } from "@/lib/amplify-generated";

const configuredAuth = generatedAuthConfig ?? {
  region: process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
};

export const isAmplifyConfigured = Boolean(
  configuredAuth.userPoolId && configuredAuth.userPoolClientId && configuredAuth.region,
);

if (
  configuredAuth.userPoolId &&
  configuredAuth.userPoolClientId &&
  configuredAuth.region
) {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: configuredAuth.userPoolId,
          userPoolClientId: configuredAuth.userPoolClientId,
          loginWith: {
            email: true,
          },
        },
      },
    },
    { ssr: true },
  );
}