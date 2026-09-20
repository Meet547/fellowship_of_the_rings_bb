"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { configureAmplify } from "@/lib/amplify";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

function isOAuthCallback() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("code") || params.has("state") || params.has("error");
}

export function useAuthState() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    configureAmplify();
    let active = true;
    const isOAuth = isOAuthCallback();

    const checkSession = async (): Promise<boolean> => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens?.accessToken) return true;
      } catch { /* attempt one forced token refresh below */ }

      // getCurrentUser() can succeed from cached browser metadata even when no
      // usable access token exists. Only mark the user authenticated after an
      // actual access token is available for the protected backend APIs.
      try {
        const refreshed = await fetchAuthSession({ forceRefresh: true });
        return Boolean(refreshed.tokens?.accessToken);
      } catch {
        return false;
      }
    };

    // Track whether any retry has confirmed authentication yet
    let oauthResolved = false;

    const refresh = async (isOAuthRetry = false) => {
      const isAuth = await checkSession();
      if (!active) return;
      if (isAuth) {
        oauthResolved = true;
        setStatus("authenticated");
      } else if (!isOAuth || !isOAuthRetry) {
        // Only mark unauthenticated from a retry (not initial check) if we're
        // NOT in an OAuth callback — avoids racing with Amplify's code exchange.
        if (!isOAuth) setStatus("unauthenticated");
      }
      // If in an OAuth callback and still not resolved, keep "loading" until retries exhaust.
    };

    void refresh(false);

    // If OAuth redirect callback in URL (?code=...), retry checks to allow Amplify code exchange.
    // Use more retries + longer window to safely cover slow network / PKCE exchanges.
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    let t3: ReturnType<typeof setTimeout> | undefined;
    let t4: ReturnType<typeof setTimeout> | undefined;
    let t5: ReturnType<typeof setTimeout> | undefined;

    if (isOAuth) {
      t1 = setTimeout(() => { if (active) void refresh(true); }, 300);
      t2 = setTimeout(() => { if (active) void refresh(true); }, 800);
      t3 = setTimeout(() => { if (active) void refresh(true); }, 1600);
      t4 = setTimeout(() => { if (active) void refresh(true); }, 2800);
      t5 = setTimeout(() => { if (active) void refresh(true); }, 4200);
    }

    // Failsafe timer: Ensure loading NEVER blocks indefinitely.
    // Only resolve to unauthenticated if the OAuth code exchange didn't succeed.
    const failsafe = setTimeout(() => {
      if (active && !oauthResolved) {
        setStatus("unauthenticated");
      }
    }, 5500);

    const listener = Hub.listen("auth", ({ payload }) => {
      if (!active) return;
      if (payload.event === "signedIn" || payload.event === "signInWithRedirect") {
        // Amplify fires "signInWithRedirect" after a successful OAuth code exchange.
        // Immediately verify the session to confirm tokens exist.
        oauthResolved = true;
        void refresh(true);
      } else if (payload.event === "tokenRefresh") {
        void refresh(true);
      } else if (
        payload.event === "signedOut" ||
        payload.event === "tokenRefresh_failure" ||
        payload.event === "signInWithRedirect_failure"
      ) {
        oauthResolved = false;
        setStatus("unauthenticated");
      }
    });

    return () => {
      active = false;
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
      if (t4) clearTimeout(t4);
      if (t5) clearTimeout(t5);
      clearTimeout(failsafe);
      listener();
    };
  }, []);

  return status;
}
