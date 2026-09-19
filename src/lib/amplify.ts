import { Amplify } from "aws-amplify";

let configured = false;

function normalizeCognitoDomain(value: string | undefined) {
  return value?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function configureAmplify() {
  if (configured) return;

  const hostedUiDomain = normalizeCognitoDomain(process.env.NEXT_PUBLIC_COGNITO_DOMAIN);
  let redirectSignIn = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];
  let redirectSignOut = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];
  const socialProviders = (process.env.NEXT_PUBLIC_COGNITO_SOCIAL_PROVIDERS ?? "")
    .split(",")
    .map((provider) => provider.trim())
    .filter((provider): provider is "Google" | "Apple" => provider === "Google" || provider === "Apple");

  if (typeof window !== "undefined") {
    const origin = window.location.origin; // e.g. "http://localhost:3000" — never has trailing slash

    // Resolve the single authoritative redirect URI for the current environment.
    // Amplify v6 picks the LONGEST configured URL that window.location.href starts with,
    // so having BOTH "http://localhost:3000" and "http://localhost:3000/" causes it to
    // pick the slash-version, which may not be registered in Cognito. We pick ONE exact
    // match: prefer the exact origin (no slash), fall back to origin+slash if only that
    // is registered. All other environment URLs are kept at the end for completeness.
    const pickBestMatch = (urls: string[]): string[] => {
      const exactMatch = urls.find((u) => u === origin);
      const slashMatch = urls.find((u) => u === `${origin}/`);
      const authoritative = exactMatch ?? slashMatch ?? origin;
      const rest = urls.filter((u) => !u.startsWith(origin));
      return [authoritative, ...rest];
    };

    redirectSignIn = pickBestMatch(redirectSignIn);
    redirectSignOut = pickBestMatch(redirectSignOut);
  }

  // Deduplicate array entries
  redirectSignIn = Array.from(new Set(redirectSignIn));
  redirectSignOut = Array.from(new Set(redirectSignOut));

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: "ap-southeast-2_ZUNQA07nU",
        userPoolClientId: "66u4omk97m9kv9j2p69hsuobnu",
        loginWith: {
          email: true,
          ...(hostedUiDomain && redirectSignIn.length > 0 && redirectSignOut.length > 0 && socialProviders.length > 0
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

if (typeof window !== "undefined") {
  configureAmplify();
}

