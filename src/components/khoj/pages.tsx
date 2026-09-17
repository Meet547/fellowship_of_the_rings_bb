"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  ChevronRight,
  CreditCard,
  FileText,
  HeartHandshake,
  LifeBuoy,
  Link2,
  LogOut,
  MapPin,
  MessageSquare,
  Pencil,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { Button, EASE, HandNote, PersonPhoto } from "./shared";
import { RECENT_CASES, SEARCH_RESULTS } from "@/lib/khoj/data";
import { useKhoj } from "@/lib/khoj/store";

/* ==================== Profile / Settings ==================== */
export function Profile() {
  const { user, navigate, signOut } = useKhoj();

  const rows = [
    { icon: CreditCard, title: "Account", desc: "Manage your information" },
    { icon: Bell, title: "Messages", desc: "Message and update preferences" },
    { icon: ShieldCheck, title: "Privacy", desc: "Manage your data" },
    { icon: Link2, title: "Connected Accounts", desc: "Google, Apple" },
  ];

  return (
    <AppShell active="profile">
      <div className="mx-auto max-w-[860px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="display-xl text-[clamp(30px,3.4vw,40px)]">
            Your Profile
          </h1>
          <p className="mt-2.5 text-[13.5px] text-ink-soft">
            Manage your account and preferences.
          </p>
        </motion.div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_280px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-line bg-paper-2 p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ink font-mono text-[13px] font-medium tracking-[0.05em] text-paper">
                  {user?.initials ?? "MP"}
                </span>
                <div>
                  <div className="text-[15.5px] font-medium">{user?.fullName ?? "Meet Pardeshi"}</div>
                  <div className="text-[12.5px] text-ink-faint">
                    {user?.email ?? "meet@example.com"} · {user?.role ?? "Family Member"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => useKhoj.getState().navigate("onboarding")}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-[12px] font-medium transition-all duration-300 hover:border-ink"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.6} /> Edit
              </button>
            </div>

            <div className="mt-6 divide-y divide-line/80 border-t border-line/80">
              {rows.map((r) => (
                <button
                  key={r.title}
                  onClick={() => useKhoj.getState().navigate("profile")}
                  className="group flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="flex items-center gap-3.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-line-2 bg-paper transition-colors group-hover:border-ink/30">
                      <r.icon className="h-4 w-4 text-ink-2" strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-medium">{r.title}</span>
                      <span className="block text-[11.5px] text-ink-faint">{r.desc}</span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>

            <button
              onClick={signOut}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#e5c9c3] bg-[#f9efec] px-5 py-2.5 text-[12.5px] font-medium text-[#b3402f] transition-colors hover:bg-[#f4e3df]"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.6} /> Sign out
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="khoj-grain relative min-h-[320px] overflow-hidden rounded-2xl"
          >
            { }
            <img
              src="/images/profile-mountains.jpg"
              alt="Mountain ridges at golden hour"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />
            <div className="absolute right-5 top-5">
              <HandNote size={22} rotate={-6} className="max-w-[120px] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                A safer brighter India
              </HandNote>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

/* ==================== My Cases ==================== */
export function MyCases() {
  const { openCase } = useKhoj();
  const STATUS: Record<string, string> = {
    Searching: "bg-match-green text-match-green-text",
    "More Info Needed": "bg-match-amber text-match-amber-text",
  };
  return (
    <AppShell active="cases" title="My Cases">
      <div className="mx-auto max-w-[820px] space-y-3">
        {RECENT_CASES.concat(RECENT_CASES.map((c) => ({ ...c, id: c.id.replace("00", "03") }))).map(
          (c, i) => (
            <motion.button
              key={c.id + i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              onClick={() => openCase(c.id)}
              className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-paper-2 p-5 text-left transition-colors hover:border-ink/30"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-2 bg-paper">
                  <FileText className="h-4 w-4 text-ink-2" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-medium tracking-[0.04em]">{c.id}</div>
                  <div className="mt-0.5 truncate text-[12px] text-ink-soft">
                    {c.person} · {c.detail}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium ${STATUS[c.status]}`}>
                  <span className="h-1 w-1 rounded-full bg-current" /> {c.status}
                </span>
                <div className="micro mt-1 !text-[8.5px] normal-case tracking-[0.04em] text-ink-faint">Updated {c.updated}</div>
              </div>
            </motion.button>
          )
        )}
      </div>
    </AppShell>
  );
}

/* ==================== Messages ==================== */
export function Messages() {
  const msgs = [
    { from: "Khoj Team", text: "We found a new possible match for case #KHUJ-2026-001. Review it when you get a moment.", time: "2h", unread: true },
    { from: "Mumbai NGO Network", text: "Thank you for your report. Our shelter partner has scheduled an intake review.", time: "1d", unread: true },
    { from: "Maharashtra Police", text: "Verification for case #KHUJ-2026-002 is in progress. No action needed from you.", time: "2d", unread: false },
  ];
  return (
    <AppShell active="messages" title="Messages">
      <div className="mx-auto max-w-[720px] space-y-3">
        {msgs.map((m, i) => (
          <motion.div
            key={m.from}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="flex items-start gap-4 rounded-2xl border border-line bg-paper-2 p-5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-2 bg-paper">
              <MessageSquare className="h-4 w-4 text-ink-2" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-medium">{m.from}</span>
                <span className="micro !text-[8.5px] normal-case tracking-[0.04em] text-ink-faint">{m.time} ago</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{m.text}</p>
            </div>
            {m.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600 animate-pulse-ring" />}
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}

/* ==================== Saved ==================== */
export function SavedPage() {
  const { saved, openCase } = useKhoj();
  const items = SEARCH_RESULTS.filter((p) => saved.includes(p.id));

  return (
    <AppShell active="saved" title="Saved">
      {items.length === 0 ? (
        <div className="mx-auto flex max-w-[480px] flex-col items-center rounded-2xl border border-dashed border-line-2 bg-paper-2 px-8 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/12 bg-paper">
            <Bookmark className="h-5 w-5 text-ink-2" strokeWidth={1.5} />
          </span>
          <h2 className="mt-4 text-[16px] font-medium">Nothing saved yet</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            When you find a possible match, tap Save on a case and it will appear here
            for quick access.
          </p>
          <Button
            onClick={() => useKhoj.getState().navigate("search")}
            className="mt-5"
            icon={<Search className="h-3.5 w-3.5" strokeWidth={1.6} />}
          >
            Start a search
          </Button>
        </div>
      ) : (
        <div className="mx-auto max-w-[820px] space-y-3">
          {items.map((p) => (
            <button
              key={p.id}
              onClick={() => openCase(p.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-line bg-paper-2 p-4 text-left transition-colors hover:border-ink/30"
            >
              <PersonPhoto photo={p.photo} name={p.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium">{p.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-soft">
                  <MapPin className="h-3 w-3" /> {p.location}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-faint" />
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

/* ==================== Resources ==================== */
export function Resources() {
  const { navigate } = useKhoj();
  const cards = [
    {
      icon: HeartHandshake,
      title: "NGOs & Shelters",
      desc: "Verified organisations across 28 states that help with shelter, tracing and family reunification.",
      action: "Browse directory",
    },
    {
      icon: LifeBuoy,
      title: "Helplines",
      desc: "Childline 1098 · Police 112 · Women 181 · Elder line 14567. Available 24×7, free to call.",
      action: "See all numbers",
    },
    {
      icon: FileText,
      title: "Filing a missing person report",
      desc: "A step-by-step guide to filing an FIR, what documents help, and what to expect next.",
      action: "Read the guide",
    },
  ];
  return (
    <AppShell active="resources" title="Resources">
      <div className="mx-auto grid max-w-[900px] gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            whileHover={{ y: -4 }}
            className="flex flex-col rounded-2xl border border-line bg-paper-2 p-5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-paper">
              <c.icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.5} />
            </span>
            <h3 className="mt-4 text-[15px] font-medium tracking-[-0.01em]">{c.title}</h3>
            <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-soft">{c.desc}</p>
            <button
              onClick={() => navigate("search")}
              className="mt-4 inline-flex items-center gap-1.5 self-start text-[12.5px] font-medium text-ink"
            >
              <span className="border-b border-ink/30 pb-0.5 transition-colors hover:border-ink">{c.action}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
