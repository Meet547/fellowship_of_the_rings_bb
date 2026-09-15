import { Issuer, generators, type Client } from "openid-client";

const cognitoDomain = process.env.COGNITO_DOMAIN;
const cognitoClientId = process.env.COGNITO_APP_CLIENT_ID;
const cognitoClientSecret = process.env.COGNITO_CLIENT_SECRET;
const redirectUri = process.env.COGNITO_REDIRECT_URI || "http://localhost:3000/api/cognito/callback";
const logoutUri = process.env.COGNITO_LOGOUT_URI || "http://localhost:3000";

export function getCognitoConfig() {
  if (!cognitoDomain || !cognitoClientId || !cognitoClientSecret) {
    throw new Error(
      "Missing Cognito OIDC environment variables: set COGNITO_DOMAIN, COGNITO_APP_CLIENT_ID, and COGNITO_CLIENT_SECRET.",
    );
  }

  return {
    cognitoDomain,
    cognitoClientId,
    cognitoClientSecret,
    redirectUri,
    logoutUri,
  };
}

let cognitoClient: Client | null = null;

export async function getCognitoClient() {
  if (cognitoClient) {
    return cognitoClient;
  }

  const { cognitoDomain, cognitoClientId, cognitoClientSecret, redirectUri } = getCognitoConfig();

  const issuer = await Issuer.discover(cognitoDomain);
  cognitoClient = new issuer.Client({
    client_id: cognitoClientId,
    client_secret: cognitoClientSecret,
    redirect_uris: [redirectUri],
    response_types: ["code"],
    token_endpoint_auth_method: "client_secret_post",
  });

  return cognitoClient;
}

export function createStateAndNonce() {
  return {
    nonce: generators.nonce(),
    state: generators.state(),
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
}

export function getCognitoLogoutUrl() {
  const { cognitoDomain, cognitoClientId, logoutUri } = getCognitoConfig();
  const url = new URL("/logout", cognitoDomain);
  url.searchParams.set("client_id", cognitoClientId);
  url.searchParams.set("logout_uri", logoutUri);
  return url.toString();
}
