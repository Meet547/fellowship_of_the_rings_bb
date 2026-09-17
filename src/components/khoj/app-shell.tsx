"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  FileText,
  Home,
  MessageSquare,
  Search,
  Settings,
  UserPlus,
  UserSearch,
} from "lucide-react";
import { useState } from "react";
import { EASE, Logo, Silhouette } from "./shared";
import { useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", icon: Home, view: "dashboard" },
  { label: "Find Someone", icon: UserSearch, view: "find" },
  { label: "I Found Someone", icon: UserPlus, view: "found" },
  { label: "My Cases", icon: FileText, view: "cases" },
  { label: "Messages", icon: MessageSquare, view: "messages" },
  { label: "Saved", icon: Bookmark, view: "saved" },
  { label: "Resources", icon: Search, view: "resources" },
] as const;

export function AppShell({
  active,
  children,
  title,
}: {
  active: string;
  children: React.ReactNode;
  title?: string;
}) {
  const { navigate, user, signOut } = useKhoj();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* ---------- Sidebar ---------- */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-paper px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo size="sm" tagline={false} onClick={() => navigate("dashboard")} />
        </div>

        <div className="micro mt-10 px-2 !text-[9px] text-ink-faint">Menu</div>
        <nav className="mt-3 flex-1 space-y-0.5" aria-label="App">
          {NAV.map((n) => {
            const isActive = active === n.view;
            return (
              <button
                key={n.label}
                onClick={() => navigate(n.view)}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13px] transition-all duration-200",
                  isActive
                    ? "bg-[#e9e6df] font-medium text-ink"
                    : "text-ink-soft hover:bg-[#edeae3] hover:text-ink"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="side-active"
                    className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-ink"
                  />
                )}
                <n.icon
                  className={cn(
                    "h-[16px] w-[16px] transition-colors",
                    isActive ? "text-ink" : "text-ink-faint group-hover:text-ink-2"
                  )}
                  strokeWidth={1.7}
                />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-line pt-3">
          <button
            onClick={() => navigate("profile")}
            className={cn(
              "flex w-full items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13px] transition-colors",
              active === "profile"
                ? "bg-[#e9e6df] font-medium text-ink"
                : "text-ink-soft hover:bg-[#edeae3] hover:text-ink"
            )}
          >
            <Settings className="h-[16px] w-[16px] text-ink-faint" strokeWidth={1.7} />
            Settings
          </button>

          <div className="relative">
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="absolute bottom-[66px] left-0 w-full overflow-hidden rounded-xl border border-line bg-paper-2 p-1 shadow-[0_16px_40px_-16px_rgba(22,21,17,0.25)]"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("profile");
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-[12.5px] hover:bg-paper"
                  >
                    Your profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-[12.5px] text-[#b3402f] hover:bg-[#f7ebe8]"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-[#edeae3]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-[10.5px] font-medium tracking-[0.05em] text-paper">
                {user?.initials ?? "MP"}
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-[12.5px] font-medium text-ink">
                  {user?.fullName ?? "Meet Pardeshi"}
                </span>
                <span className="micro block !text-[8.5px] text-ink-faint">View profile</span>
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-paper/90 px-5 py-3 backdrop-blur-md sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <Logo size="sm" tagline={false} onClick={() => navigate("dashboard")} />
            </div>

            <div className="relative mx-auto hidden w-full max-w-[420px] sm:block">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                strokeWidth={1.7}
              />
              <input
                placeholder="Search cases, names, or locations..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate("search");
                }}
                className="w-full rounded-full border border-line-2 bg-paper-2 py-2.5 pl-11 pr-4 text-[13px] outline-none transition-all placeholder:text-ink-faint hover:border-ink/25 focus:border-ink focus:bg-white"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-paper-2 transition-colors hover:border-ink/30"
              >
                <Bell className="h-[16px] w-[16px] text-ink-2" strokeWidth={1.7} />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#33693f] animate-pulse-ring" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="absolute right-0 top-12 z-50 w-[300px] rounded-2xl border border-line bg-paper-2 p-2 shadow-[0_20px_50px_-20px_rgba(22,21,17,0.3)]"
                  >
                    <div className="px-3 py-2">
                      <span className="micro !text-[8.5px] text-ink-faint">Notifications</span>
                    </div>
                    {[
                      { icon: false, title: "New possible match — 76%", desc: "Ramesh Kumar · 2 hours ago" },
                      { icon: true, title: "More info needed on #KHUJ-2026-002", desc: "Unknown (Found Person) · 1 day ago" },
                      { icon: false, title: "Sighting reported near Dadar", desc: "Community · 1 day ago" },
                    ].map((n) => (
                      <div
                        key={n.title}
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-paper"
                      >
                        {n.icon ? (
                          <Silhouette className="h-9 w-9 shrink-0 rounded-full" />
                        ) : (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#33693f]" />
                        )}
                        <div>
                          <div className="text-[12.5px] font-medium leading-snug">{n.title}</div>
                          <div className="micro mt-0.5 !text-[8.5px] normal-case tracking-[0.04em] text-ink-faint">
                            {n.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* mobile nav */}
          <div className="khoj-scroll mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => navigate(n.view)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] transition-colors",
                  active === n.view
                    ? "bg-ink text-paper"
                    : "border border-line-2 bg-paper-2 text-ink-soft"
                )}
              >
                {n.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">
          {title && <h1 className="display-xl mb-6 text-[30px]">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}
