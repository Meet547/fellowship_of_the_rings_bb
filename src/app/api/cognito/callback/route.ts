import { NextResponse } from "next/server";

import { getAppUrl, getCognitoClient, getCognitoConfig } from "@/lib/cognito-oidc";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return undefined;
  }

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const state = getCookieValue(cookieHeader, "cognito_state");
  const nonce = getCookieValue(cookieHeader, "cognito_nonce");
  const next = getCookieValue(cookieHeader, "cognito_next") || "/";

  if (!state || !nonce) {
    return NextResponse.redirect(new URL("/cognito-demo", getAppUrl()));
  }

  const client = await getCognitoClient();
  const { redirectUri } = getCognitoConfig();
  const params = client.callbackParams(new URL(request.url));

  try {
    const tokenSet = await client.callback(redirectUri, params, {
      state,
      nonce,
    });

    if (!tokenSet.access_token) {
      throw new Error("Cognito did not return an access token");
    }

    const userInfo = await client.userinfo(tokenSet.access_token);
    const response = NextResponse.redirect(new URL(next, getAppUrl()));

    response.cookies.set("cognito_user", JSON.stringify(userInfo), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    response.cookies.delete("cognito_state");
    response.cookies.delete("cognito_nonce");
    response.cookies.delete("cognito_next");

    return response;
  } catch (error) {
    console.error("Cognito callback error:", error);
    const response = NextResponse.redirect(new URL("/cognito-demo", getAppUrl()));
    response.cookies.delete("cognito_state");
    response.cookies.delete("cognito_nonce");
    response.cookies.delete("cognito_next");
    return response;
  }
}
