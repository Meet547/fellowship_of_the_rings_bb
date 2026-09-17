"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { configureAmplify } from "@/lib/amplify";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuthState() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    configureAmplify();
    let active = true;

    const refresh = async () => {
      try {
        await getCurrentUser();
        const session = await fetchAuthSession();
        if (active) setStatus(session.tokens ? "authenticated" : "unauthenticated");
      } catch {
        if (active) setStatus("unauthenticated");
      }
    };

    void refresh();
    const listener = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        setStatus("authenticated");
        void refresh();
      } else if (payload.event === "tokenRefresh") {
        void refresh();
      } else if (payload.event === "signedOut") {
        setStatus("unauthenticated");
      } else if (payload.event === "tokenRefresh_failure") {
        setStatus("unauthenticated");
      }
    });

    return () => {
      active = false;
      listener();
    };
  }, []);

  return status;
}
