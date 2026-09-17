"use client";

import { useCallback, useEffect, useState } from "react";

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
] as const;

export type View = (typeof VIEWS)[number];

function viewFromHash(): View {
  if (typeof window === "undefined") return "landing";
  const h = window.location.hash.replace(/^#\/?/, "");
  return (VIEWS as readonly string[]).includes(h) ? (h as View) : "landing";
}

/** Tiny hash router — single-route app, browser back/forward works. */
export function useView() {
  const [view, setView] = useState<View>("landing");

  useEffect(() => {
    const sync = () => setView(viewFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = useCallback((v: View) => {
    if (viewFromHash() === v) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = `#/${v}`;
  }, []);

  return { view, navigate };
}
