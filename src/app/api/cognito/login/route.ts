import { NextResponse } from "next/server";

import { createStateAndNonce, getCognitoClient, getCognitoConfig } from "@/lib/cognito-oidc";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/";
  const { nonce, state } = createStateAndNonce();
  const client = await getCognitoClient();
  const { redirectUri } = getCognitoConfig();

  const authUrl = client.authorizationUrl({
    scope: "openid profile email aws.cognito.signin.user.admin",
    state,
    nonce,
    redirect_uri: redirectUri,
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("cognito_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  response.cookies.set("cognito_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  response.cookies.set("cognito_next", next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
