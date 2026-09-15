import { NextResponse } from "next/server";

import { getAppUrl, getCognitoLogoutUrl } from "@/lib/cognito-oidc";

export async function GET() {
  const response = NextResponse.redirect(new URL("/cognito-demo", getAppUrl()));
  const logoutUrl = getCognitoLogoutUrl();

  response.cookies.delete("cognito_user");
  response.cookies.delete("cognito_state");
  response.cookies.delete("cognito_nonce");
  response.cookies.delete("cognito_next");

  return NextResponse.redirect(logoutUrl);
}
