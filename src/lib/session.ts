import { getCurrentUser, signOut } from "aws-amplify/auth";
import { isAmplifyConfigured } from "@/lib/amplify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface KhojSession {
  name: string;
  email: string;
  since: string; // ISO date
}

const SESSION_KEY = "khoj.demo.session";

export async function getSession(): Promise<KhojSession | null> {
  if (isAmplifyConfigured) {
    try {
      const user = await getCurrentUser();
      return {
        name: String(user.username),
        email: String(user.signInDetails?.loginId || user.username),
        since: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KhojSession;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: KhojSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession() {
  if (isAmplifyConfigured) {
    await signOut().catch(() => undefined);
  }
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "friend";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/**
 * Guard hook for app pages. Redirects to /signin when there is no session.
 * `ready` is false during the check so pages can render a quiet splash
 * instead of flashing content.
 */
export function useRequireSession(next = "/pipeline") {
  const router = useRouter();
  const [session, setSessionState] = useState<KhojSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Deferred so the check never cascades a synchronous re-render.
    const id = setTimeout(async () => {
      if (cancelled) return;
      const existing = await getSession();
      if (!existing) {
        router.replace(`/signin?next=${encodeURIComponent(next)}`);
        return;
      }
      setSessionState(existing);
      setReady(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [router, next]);

  return { session, ready };
}
