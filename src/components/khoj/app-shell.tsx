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
import { Logo, Silhouette } from "./shared";
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
    <div className="flex min-h-screen bg-[#f6f5f2]">
      {/* ---------- Sidebar ---------- */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line/70 bg-[#f6f5f2] px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo size="sm" tagline={false} onClick={() => navigate("dashboard")} />
        </div>

        <nav className="mt-8 flex-1 space-y-1" aria-label="App">
          {NAV.map((n) => {
            const isActive = active === n.view;
            return (
              <button
                key={n.label}
                onClick={() => navigate(n.view)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] transition-all duration-200",
                  isActive
                    ? "bg-white font-semibold text-ink shadow-[0_10px_24px_-16px_rgba(20,19,17,0.3)]"
                    : "text-ink-soft hover:bg-white/60 hover:text-ink"
                )}
              >
                <n.icon
                  className={cn("h-[17px] w-[17px]", isActive ? "text-ink" : "text-ink-faint group-hover:text-ink-2")}
                  strokeWidth={1.7}
                />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-line/70 pt-4">
          <button
            onClick={() => navigate("profile")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] transition-colors",
              active === "profile"
                ? "bg-white font-semibold text-ink"
                : "text-ink-soft hover:bg-white/60 hover:text-ink"
            )}
          >
            <Settings className="h-[17px] w-[17px] text-ink-faint" strokeWidth={1.7} />
            Settings
          </button>

          <div className="relative">
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute bottom-[70px] left-0 w-full overflow-hidden rounded-xl border border-line bg-white p-1 shadow-[0_16px_40px_-16px_rgba(20,19,17,0.3)]"
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
                    className="w-full rounded-lg px-3 py-2 text-left text-[12.5px] text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/70"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-bold text-[#f4f2ee]">
                {user?.initials ?? "MP"}
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-[12.5px] font-semibold text-ink">
                  {user?.fullName ?? "Meet Pardeshi"}
                </span>
                <span className="block text-[11px] text-ink-faint">View profile</span>
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line/70 bg-[#f6f5f2]/85 px-5 py-3.5 backdrop-blur-md sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <Logo size="sm" tagline={false} onClick={() => navigate("dashboard")} />
            </div>

            <div className="relative mx-auto hidden w-full max-w-[440px] sm:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.7} />
              <input
                placeholder="Search cases, names, or locations..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate("search");
                }}
                className="w-full rounded-full border border-line-2 bg-white py-2.5 pl-11 pr-4 text-[13px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-white transition-colors hover:border-ink/30"
              >
                <Bell className="h-[17px] w-[17px] text-ink-2" strokeWidth={1.7} />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-green-600" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-12 z-50 w-[300px] rounded-2xl border border-line bg-white p-2 shadow-[0_20px_50px_-20px_rgba(20,19,17,0.4)]"
                  >
                    <div className="px-3 py-2 text-[11px] font-semibold tracking-wide text-ink-faint">
                      NOTIFICATIONS
                    </div>
                    {[
                      { icon: false, title: "New possible match — 76%", desc: "Ramesh Kumar · 2 hours ago" },
                      { icon: true, title: "More info needed on #KHUJ-2026-002", desc: "Unknown (Found Person) · 1 day ago" },
                      { icon: false, title: "Sighting reported near Dadar", desc: "Community · 1 day ago" },
                    ].map((n) => (
                      <div key={n.title} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-paper">
                        {n.icon ? (
                          <Silhouette className="h-9 w-9 shrink-0 rounded-full" />
                        ) : (
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-600 animate-pulse-ring" />
                        )}
                        <div>
                          <div className="text-[12.5px] font-medium leading-snug">{n.title}</div>
                          <div className="text-[11px] text-ink-faint">{n.desc}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* mobile nav */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden khoj-scroll">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => navigate(n.view)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] transition-colors",
                  active === n.view
                    ? "bg-ink text-[#f4f2ee]"
                    : "border border-line-2 bg-white text-ink-soft"
                )}
              >
                {n.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-5 py-7 sm:px-8">
          {title && (
            <h1 className="mb-5 text-[22px] font-semibold tracking-tight">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
