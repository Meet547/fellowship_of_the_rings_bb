"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Handshake,
  MapPin,
  Phone,
  Plus,
  Search,
  SearchCheck,
  Flag,
} from "lucide-react";
import { HandNote } from "./shared";
import { AppShell } from "./app-shell";
import { QUICK_ACTIONS, RECENT_CASES } from "@/lib/khoj/data";
import { useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

const ACTION_ICONS = { search: Search, flag: Flag, map: MapPin, phone: Phone } as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const STATUS_STYLES: Record<string, string> = {
  Searching: "bg-match-green text-match-green-text",
  "In Review": "bg-match-amber text-match-amber-text",
  "More Info Needed": "bg-match-amber text-match-amber-text",
  Reunited: "bg-match-green text-match-green-text",
};

export default function Dashboard() {
  const { navigate, user, openCase } = useKhoj();
  const firstName = user?.firstName ?? "Meet";

  return (
    <AppShell active="dashboard">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
          {greeting()}, {firstName}.
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-soft">
          Every search matters. People find people.
        </p>
      </motion.div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* ---------- Main column ---------- */}
        <div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* I'm looking for someone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#fdeadd] via-[#fbe7d8] to-[#f6ded0] p-5 shadow-[0_18px_40px_-24px_rgba(20,19,17,0.3)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-sm">
                <SearchCheck className="h-5 w-5 text-ink" strokeWidth={1.6} />
              </span>
              <h2 className="mt-9 text-[17px] font-semibold tracking-tight">
                I&apos;m looking for someone
              </h2>
              <p className="mt-1 max-w-[240px] text-[12.5px] leading-relaxed text-ink-2/80">
                Start a new search with the help of Khoj&apos;s AI.
              </p>
              <button
                onClick={() => navigate("find")}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12.5px] font-medium text-[#f4f2ee] transition-all hover:bg-black hover:shadow-lg"
              >
                Start Search <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>

            {/* I found someone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-[22px] border border-line bg-white/80 p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-ink/[0.05]">
                <Handshake className="h-5 w-5 text-ink" strokeWidth={1.6} />
              </span>
              <h2 className="mt-9 text-[17px] font-semibold tracking-tight">
                I found someone
              </h2>
              <p className="mt-1 max-w-[240px] text-[12.5px] leading-relaxed text-ink-soft">
                Help identify or reunite a person with their family.
              </p>
              <button
                onClick={() => navigate("found")}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-line-2 bg-white px-5 py-2.5 text-[12.5px] font-medium transition-all hover:border-ink/40 hover:bg-[#faf9f6]"
              >
                Report a Person <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-6 rounded-[22px] border border-line bg-white/80 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold tracking-tight">Your Recent Activity</h3>
              <button
                onClick={() => navigate("cases")}
                className="flex items-center gap-1.5 text-[12px] text-ink-soft transition-colors hover:text-ink"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {RECENT_CASES.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  onClick={() => openCase(c.id)}
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition-all hover:border-ink/25 hover:shadow-[0_14px_30px_-20px_rgba(20,19,17,0.35)]"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/[0.05]">
                      <Search className="h-4 w-4 text-ink-2" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-ink">{c.id}</div>
                      <div className="mt-0.5 truncate text-[12px] text-ink-soft">
                        {c.person} · {c.detail}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          STATUS_STYLES[c.status]
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {c.status}
                      </span>
                      <div className="mt-1 hidden text-[11px] text-ink-faint sm:block">
                        Updated {c.updated}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ---------- Right column ---------- */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="khoj-grain relative min-h-[230px] flex-1 overflow-hidden rounded-[22px] shadow-[0_20px_44px_-24px_rgba(20,19,17,0.4)]"
          >
            { }
            <img
              src="/images/dashboard-city.jpg"
              alt="A bridge leading into the city at dusk"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
            <div className="absolute right-5 top-5">
              <HandNote size={24} rotate={-7} className="max-w-[130px] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                Same people. Brighter tomorrows.
              </HandNote>
            </div>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="rounded-[22px] border border-line bg-white/80 p-5"
          >
            <HandNote size={26} rotate={-3} className="leading-snug text-ink">
              &ldquo;Every small lead can change a life.&rdquo;
            </HandNote>
            <span className="mt-3 block h-px w-12 bg-line-2" />
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="rounded-[22px] border border-line bg-white/80 p-4"
          >
            <h3 className="px-1 pb-2 text-[13px] font-semibold tracking-tight">Quick actions</h3>
            {QUICK_ACTIONS.map((a) => {
              const Icon = ACTION_ICONS[a.icon];
              return (
                <button
                  key={a.label}
                  onClick={() => {
                    if (a.icon === "search") navigate("search");
                    else if (a.icon === "flag") navigate("found");
                    else if (a.icon === "map") navigate("resources");
                    else navigate("messages");
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-ink/[0.04]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-line-2 bg-white transition-colors group-hover:border-ink/30">
                    <Icon className="h-3.5 w-3.5 text-ink-2" strokeWidth={1.7} />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-medium">{a.label}</span>
                    <span className="block text-[11px] text-ink-faint">{a.desc}</span>
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Report CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate("found")}
            className="flex items-center justify-between rounded-[22px] bg-ink p-5 text-left text-[#f4f2ee] shadow-[0_20px_44px_-22px_rgba(20,19,17,0.6)]"
          >
            <div>
              <div className="text-[13.5px] font-semibold">Report a new case</div>
              <div className="mt-0.5 text-[11.5px] text-white/60">It takes under 2 minutes</div>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
              <Plus className="h-4 w-4" />
            </span>
          </motion.button>
        </div>
      </div>
    </AppShell>
  );
}
