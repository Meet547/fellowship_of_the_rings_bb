"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "./auth-state";

export const VIEWS = [
  "landing",
  "auth",
  "dashboard",
  "database",
  "find",
  "scan",
  "report",
  "searching",
  "match",
  "not-found",
] as const;

export type View = (typeof VIEWS)[number];
export type Navigate = (view: View) => void;

function viewFromHash(): View {
  if (typeof window === "undefined") return "landing";
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h) return "landing";
  return (VIEWS as readonly string[]).includes(h) ? (h as View) : "not-found";
}

function isOAuthCallback() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("code") || params.has("state") || params.has("error");
}

/** Tiny hash router — single-route app, browser back/forward works. */
export function useView() {
  const [view, setView] = useState<View>("landing");
  const [oauthCallbackPending, setOAuthCallbackPending] = useState(isOAuthCallback);
  const authStatus = useAuthState();

  useEffect(() => {
    const sync = () => {
      const next = viewFromHash();
      const isPublic = next === "landing" || next === "auth" || next === "not-found";
      if (authStatus === "loading") return;
      if (authStatus === "authenticated" && (next === "auth" || oauthCallbackPending)) {
        setOAuthCallbackPending(false);
        window.location.hash = "#/dashboard";
        return;
      }
      setView(!isPublic && authStatus !== "authenticated" ? "auth" : next);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [authStatus, oauthCallbackPending]);

  const navigate = useCallback((v: View) => {
    if (typeof window !== "undefined" && v !== "landing" && v !== "auth") {
      if (authStatus !== "authenticated") {
        window.location.hash = "#/auth";
        return;
      }
    }
    if (viewFromHash() === v) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = `#/${v}`;
  }, [authStatus]);

  return { view, navigate, authStatus };
}
