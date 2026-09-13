"use client";

import { cn } from "@/lib/utils";
import { KhojMark } from "@/components/khoj/primitives";
import {
  clearSession,
  initialsOf,
  useRequireSession,
  type KhojSession,
} from "@/lib/session";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, MessagesSquare, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Shared application shell for the authenticated product flow               */
/*  (pipeline + chat). Landing keeps its own marketing navbar.                */
/* -------------------------------------------------------------------------- */

const APP_LINKS = [
  { label: "Pipeline", href: "/pipeline", icon: Workflow },
  { label: "Case chat", href: "/chat", icon: MessagesSquare },
] as const;

function TopBar({ session }: { session: KhojSession }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const lastToggle = React.useRef(0);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  /* Guard against duplicate click dispatches (automation tools, double-tap)
     so the menu never opens and instantly closes. */
  const toggleMenu = () => {
    const now = Date.now();
    if (now - lastToggle.current < 250) return;
    lastToggle.current = now;
    setMenuOpen((v) => !v);
  };

  const signOut = () => {
    clearSession();
    router.push("/signin");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-linec bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
        {/* Left: brand + app nav */}
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/pipeline"
            aria-label="KHOJ app home"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <KhojMark className="h-[24px] w-[24px] text-ink" />
            <span className="hidden text-[13px] font-semibold tracking-[0.26em] text-ink sm:inline">
              KHOJ
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-linec sm:block" aria-hidden="true" />
          <nav aria-label="App" className="flex items-center gap-0.5 rounded-full bg-lav-chip p-1">
            {APP_LINKS.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                    active ? "text-ink" : "text-body hover:text-ink"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="app-nav-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(24,22,35,0.10)]"
                      transition={{ type: "spring", stiffness: 480, damping: 40 }}
                    />
                  )}
                  <Icon className="relative z-10 hidden h-3.5 w-3.5 md:block" strokeWidth={2} />
                  <span className="relative z-10 whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: demo chip + account */}
        <div className="flex items-center gap-2.5" ref={menuRef}>
          <span className="hidden items-center rounded-full border border-linec bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint md:inline-flex">
            Demo data
          </span>
          <div className="relative">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent-deep transition-colors hover:bg-[#e2e4fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              onClick={toggleMenu}
            >
              {initialsOf(session.name)}
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-60 origin-top-right rounded-xl border border-linec bg-white p-1.5 shadow-[0_16px_40px_rgba(24,22,35,0.14)]"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-[14px] font-medium text-ink">{session.name}</p>
                    <p className="truncate text-[12.5px] text-faint">{session.email}</p>
                  </div>
                  <div className="my-1 h-px bg-linec" aria-hidden="true" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] text-body transition-colors hover:bg-lav hover:text-ink"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center gap-2.5"
      >
        <KhojMark className="h-7 w-7 text-ink" />
        <span className="text-[13px] font-semibold tracking-[0.26em] text-ink">KHOJ</span>
      </motion.div>
    </div>
  );
}

export function AppShell({
  children,
  next = "/pipeline",
  width = "wide",
}: {
  children: React.ReactNode;
  /** Where to return after sign-in if the session is missing. */
  next?: string;
  width?: "wide" | "narrow";
}) {
  const { session, ready } = useRequireSession(next);
  if (!ready || !session) return <Splash />;

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <TopBar session={session} />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={cn(
          "mx-auto w-full flex-1 px-5 pb-16 pt-8 md:px-8 md:pt-10",
          width === "narrow" ? "max-w-[800px]" : "max-w-[1200px]"
        )}
      >
        {children}
      </motion.main>
      <footer className="border-t border-linec/70">
        <p className="mx-auto max-w-[1200px] px-5 py-4 text-[12px] leading-relaxed text-faint md:px-8">
          Demonstration environment · sample case #0142 · a potential match is not a
          confirmed identity.
        </p>
      </footer>
    </div>
  );
}
