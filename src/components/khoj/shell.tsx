"use client";

import { motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Command,
  Database,
  FileText,
  Home,
  ListFilter,
  Search,
  ScanFace,
  UserRound,
  UserSearch,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo, useToast } from "./ui";
import type { Navigate, View } from "@/lib/khoj/router";
import { signOut } from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify";

const NAV: { icon: ReactNode; label: string; view: View }[] = [
  { icon: <Home size={16} strokeWidth={1.8} />, label: "Home", view: "dashboard" },
  { icon: <Database size={16} strokeWidth={1.8} />, label: "Database", view: "database" },
  { icon: <UserSearch size={16} strokeWidth={1.8} />, label: "Find a Person", view: "find" },
  { icon: <ScanFace size={16} strokeWidth={1.8} />, label: "Scan & Identify", view: "scan" },
  { icon: <FileText size={16} strokeWidth={1.8} />, label: "Reports", view: "report" },
];

export function Topbar({ navigate }: { navigate: Navigate }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "match", title: "Potential match found", body: "Ramesh Sharma matches your recent search.", view: "match" as const },
    { id: "review", title: "Report under review", body: "Your report MP-2481 is being reviewed by our partners.", view: "report" as const },
  ]);
  const handleSignOut = async () => {
    try {
      configureAmplify();
      await signOut();
      navigate("auth");
    } catch {
      toast("We couldn't sign you out. Please try again.");
    }
  };
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center border-b border-line bg-paper/90 px-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex w-full max-w-[980px] items-center gap-3">
      <div className="relative hidden w-[220px] items-center sm:flex">
        <Search size={14.5} className="absolute left-3.5 text-ink3" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && query.trim()) {
              toast(`Searching the database for “${query.trim()}”`);
              navigate("database");
            }
          }}
          placeholder="Search by name, location, or case ID..."
          className="h-10 w-full rounded-[10px] border border-line bg-card pl-9 pr-12 text-[12.5px] text-ink placeholder:text-ink3 transition-all hover:border-ink/25 focus:border-ink/45 focus:outline-none focus:ring-4 focus:ring-rust/10"
        />
        <kbd className="absolute right-3 flex items-center gap-0.5 rounded-[5px] border border-line bg-paper2 px-1.5 py-0.5 text-[9.5px] font-medium text-ink3">
          <Command size={9} />K
        </kbd>
      </div>
      <button
        aria-label="Filters"
        onClick={() => toast("Use the database filters to narrow people by state, age, gender, date, and status.")}
        className="flex size-10 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-card text-ink2 transition-all hover:border-ink/30 hover:text-ink"
      >
        <ListFilter size={15} strokeWidth={1.8} />
      </button>
      <div className="flex-1" />
      <button
        aria-label="Notifications"
        onClick={() => setNotificationsOpen((open) => !open)}
        className="relative flex size-10 cursor-pointer items-center justify-center rounded-full text-ink2 transition-all hover:bg-paper2 hover:text-ink"
      >
        <Bell size={17} strokeWidth={1.8} />
        {notifications.length > 0 && <span className="absolute right-2 top-2 size-[7px] rounded-full bg-rust ring-2 ring-paper" />}
      </button>
      {notificationsOpen && (
        <div className="absolute right-16 top-14 z-40 w-[310px] overflow-hidden rounded-[14px] border border-line bg-card shadow-[0_18px_45px_-20px_rgba(35,32,27,0.45)]">
          <div className="flex items-center justify-between border-b border-line2 px-4 py-3">
            <span className="text-[13px] font-semibold text-ink">Notifications</span>
            <button
              className="text-[10.5px] font-medium text-ink3 hover:text-ink"
              onClick={() => setNotifications([])}
            >
              Mark all read
            </button>
          </div>
          {notifications.length > 0 ? notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                setNotifications((items) => items.filter((item) => item.id !== notification.id));
                setNotificationsOpen(false);
                navigate(notification.view);
              }}
              className="w-full border-b border-line2 px-4 py-3 text-left transition-colors hover:bg-paper2"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rust" />
                <span>
                  <span className="block text-[12px] font-medium text-ink">{notification.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-ink2">{notification.body}</span>
                </span>
              </div>
            </button>
          )) : (
            <div className="px-4 py-6 text-center text-[12px] text-ink3">You&rsquo;re all caught up.</div>
          )}
        </div>
      )}
      <button
        onClick={() => setProfileOpen((open) => !open)}
        className="flex cursor-pointer items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-paper2"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-rust text-[12px] font-semibold text-paper2">
          M
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[12px] font-semibold text-ink">Meet</span>
          <span className="block text-[10px] text-ink3">Citizen</span>
        </span>
        <ChevronDown size={13} className="text-ink3" />
      </button>
      {profileOpen && (
        <div className="absolute right-5 top-14 z-40 w-44 rounded-[12px] border border-line bg-card p-2 shadow-lg">
          <button className="w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-ink2 hover:bg-paper2" onClick={() => toast("Profile settings are ready to connect.")}>Profile settings</button>
          <button className="w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-rust hover:bg-peach/50" onClick={() => void handleSignOut()}>Sign out</button>
        </div>
      )}
      </div>
    </div>
  );
}

export default function AppShell({
  active,
  navigate,
  children,
}: {
  active: View;
  navigate: Navigate;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="relative flex h-full min-h-screen flex-col bg-night">
      <button
        onClick={() => {
          navigate("landing");
          setMobileOpen(false);
        }}
        aria-label="Go to KHOJ home"
        className="flex cursor-pointer items-center gap-2.5 px-5 pb-8 pt-6 text-left"
      >
        <span className="flex size-8 items-center justify-center rounded-[9px] bg-rust">
          <Search size={15} className="text-paper2" strokeWidth={2.2} />
        </span>
        <span className="font-serif text-[19px] font-semibold tracking-[0.12em] text-smoke">
          KHOJ
        </span>
      </button>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const isActive = n.view === active && n.label !== "Alerts" && n.label !== "Resources";
          return (
            <button
              key={n.label}
              onClick={() => {
                navigate(n.view);
                setMobileOpen(false);
              }}
              className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3.5 py-[9px] text-[13px] transition-all duration-300 ${
                isActive
                  ? "bg-white/[0.09] font-medium text-smoke"
                  : "text-smoke/55 hover:bg-white/[0.05] hover:text-smoke"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="side-active"
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-rust"
                />
              )}
              {n.icon}
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-[14px] bg-white/[0.06] p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-smoke">
              <UserRound size={16} strokeWidth={1.8} />
            </span>
            <div>
              <div className="text-[11px] font-medium text-smoke/60">Need help?</div>
              <div className="font-serif text-[16px] font-medium text-smoke">Dial 112</div>
              <div className="mt-0.5 text-[9.5px] text-smoke/40">or use in-app support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-paper">
      {/* mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-night/60" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-0 h-full w-[240px]"
          >
            {sidebar}
          </motion.div>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="ml-4 flex size-9 shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[9px] border border-line bg-card"
          >
            <span className="h-px w-4 bg-ink" />
            <span className="h-px w-4 bg-ink" />
          </button>
          <button onClick={() => navigate("landing")} className="px-3 text-left">
            <Logo size="sm" tagline={false} />
          </button>
        </div>
        <Topbar navigate={navigate} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
