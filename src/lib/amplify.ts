import { Amplify } from "aws-amplify";

let configured = false;

function normalizeCognitoDomain(value: string | undefined) {
  return value?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function configureAmplify() {
  if (configured) return;

  const hostedUiDomain = normalizeCognitoDomain(process.env.NEXT_PUBLIC_COGNITO_DOMAIN);
  const redirectSignIn = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN?.split(",").map((value) => value.trim()).filter(Boolean);
  const redirectSignOut = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT?.split(",").map((value) => value.trim()).filter(Boolean);
  const socialProviders = (process.env.NEXT_PUBLIC_COGNITO_SOCIAL_PROVIDERS ?? "")
    .split(",")
    .map((provider) => provider.trim())
    .filter((provider): provider is "Google" | "Apple" => provider === "Google" || provider === "Apple");

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: "ap-southeast-2_ZUNQA07nU",
        userPoolClientId: "66u4omk97m9kv9j2p69hsuobnu",
        loginWith: {
          email: true,
          ...(hostedUiDomain && redirectSignIn && redirectSignOut && socialProviders.length > 0
            ? {
                oauth: {
                  domain: hostedUiDomain,
                  scopes: ["openid", "email"],
                  redirectSignIn,
                  redirectSignOut,
                  responseType: "code" as const,
                  providers: socialProviders,
                },
              }
            : {}),
        },
      },
    },
  });
  configured = true;
}
