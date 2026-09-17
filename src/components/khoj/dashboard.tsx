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
import { CircleArrow, EASE, HandNote } from "./shared";
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

const card = "rounded-2xl border border-line bg-paper-2";

export default function Dashboard() {
  const { navigate, user, openCase } = useKhoj();
  const firstName = user?.firstName ?? "Meet";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell active="dashboard">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="display-xl text-[clamp(30px,3.4vw,40px)]">
            {greeting()}, {firstName}.
          </h1>
          <p className="mt-2 text-[13.5px] text-ink-soft">
            Every search matters. People find people.
          </p>
        </div>
        <div className="micro !text-[9px] text-ink-faint">{today}</div>
      </motion.div>

      <div className="mt-9 grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* ---------- Main column ---------- */}
        <div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* I'm looking for someone — ink card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
              className="group relative overflow-hidden rounded-2xl bg-ink p-6 text-paper"
            >
              <div className="flex items-start justify-between">
                <span className="micro !text-[9px] text-paper/50">01 — Search</span>
                <SearchCheck className="h-[18px] w-[18px] text-paper/80" strokeWidth={1.5} />
              </div>
              <h2 className="mt-14 text-[19px] font-medium tracking-[-0.01em]">
                I&apos;m looking for someone
              </h2>
              <p className="mt-1.5 max-w-[250px] text-[12.5px] leading-relaxed text-paper/60">
                Start a new search with the help of Khoj&apos;s AI.
              </p>
              <button
                onClick={() => navigate("find")}
                className="mt-6 inline-flex items-center gap-2.5 text-[12.5px] font-medium text-paper"
              >
                <span className="border-b border-paper/40 pb-0.5 transition-colors group-hover:border-paper">
                  Start search
                </span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* I found someone — flat card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: EASE }}
              className="group relative overflow-hidden rounded-2xl border border-line bg-paper-2 p-6"
            >
              <div className="flex items-start justify-between">
                <span className="micro !text-[9px] text-ink-faint">02 — Report</span>
                <Handshake className="h-[18px] w-[18px] text-ink-2" strokeWidth={1.5} />
              </div>
              <h2 className="mt-14 text-[19px] font-medium tracking-[-0.01em] text-ink">
                I found someone
              </h2>
              <p className="mt-1.5 max-w-[250px] text-[12.5px] leading-relaxed text-ink-soft">
                Help identify or reunite a person with their family.
              </p>
              <button
                onClick={() => navigate("found")}
                className="mt-6 inline-flex items-center gap-2.5 text-[12.5px] font-medium text-ink"
              >
                <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-ink">
                  Report a person
                </span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Recent activity — flat hairline list */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24, ease: EASE }}
            className={card + " mt-5 p-6"}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-medium tracking-[-0.01em] text-ink">
                Your recent activity
              </h3>
              <button
                onClick={() => navigate("cases")}
                className="micro flex items-center gap-1.5 !text-[9px] text-ink-soft transition-colors hover:text-ink"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-line">
              {RECENT_CASES.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.09, duration: 0.45, ease: EASE }}
                  onClick={() => openCase(c.id)}
                  className="group flex w-full items-center justify-between gap-4 py-3.5 text-left transition-colors first:pt-1 last:pb-1"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 bg-paper transition-colors group-hover:border-ink/30">
                      <Search className="h-3.5 w-3.5 text-ink-2" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] font-medium tracking-[0.04em] text-ink">
                        {c.id}
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-ink-soft">
                        {c.person} · {c.detail}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium",
                          STATUS_STYLES[c.status]
                        )}
                      >
                        <span className="h-1 w-1 rounded-full bg-current" />
                        {c.status}
                      </span>
                      <div className="micro mt-1 hidden !text-[8.5px] normal-case tracking-[0.04em] text-ink-faint sm:block">
                        Updated {c.updated}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ---------- Right column ---------- */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
            className="khoj-grain relative min-h-[220px] flex-1 overflow-hidden rounded-2xl"
          >
            <img
              src="/images/dashboard-city.jpg"
              alt="A bridge leading into the city at dusk"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-5 pt-16">
              <HandNote size={22} rotate={-5} className="text-paper">
                Same people.
                <br />
                Brighter tomorrows.
              </HandNote>
            </div>
          </motion.div>

          {/* Quick actions — flat rows */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: EASE }}
            className={card + " p-2"}
          >
            <div className="px-3 pb-1 pt-2.5">
              <span className="micro !text-[8.5px] text-ink-faint">Quick actions</span>
            </div>
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
                  className="group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-[#edeae3]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-line-2 bg-paper transition-colors group-hover:border-ink/30">
                    <Icon className="h-3.5 w-3.5 text-ink-2" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-medium text-ink">{a.label}</span>
                    <span className="block truncate text-[11px] text-ink-faint">{a.desc}</span>
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Report CTA */}
          <motion.button
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.36, ease: EASE }}
            onClick={() => navigate("found")}
            className="group flex items-center justify-between rounded-2xl bg-ink p-5 text-left text-paper transition-colors hover:bg-[#000]"
          >
            <div>
              <div className="text-[13.5px] font-medium">Report a new case</div>
              <div className="micro mt-1 !text-[8.5px] text-paper/50">
                It takes under 2 minutes
              </div>
            </div>
            <CircleArrow dark />
          </motion.button>
        </div>
      </div>
    </AppShell>
  );
}
