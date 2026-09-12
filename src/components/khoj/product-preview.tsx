"use client";

import {
  Bell,
  ChevronDown,
  FileText,
  MapPin,
  Search,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import {
  DEMO_CASE,
  DEMO_LEAD,
  INVESTIGATION_STEPS,
} from "@/lib/demo-data";
import { MockCheck } from "@/components/khoj/primitives";
import { motion, useReducedMotion } from "framer-motion";

const SIDENAV = [
  { label: "Overview", active: true },
  { label: "Timeline" },
  { label: "Evidence" },
  { label: "Sources" },
  { label: "Matches", badge: "3" },
  { label: "Settings" },
];

/**
 * KHOJ investigation dashboard — replaces the reference's banking dashboard
 * in the hero. Data comes from lib/demo-data (illustrative only).
 */
export function ProductPreview() {
  const reduce = useReducedMotion();
  const ease = [0.21, 0.47, 0.32, 0.98] as const;

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div
        role="img"
        aria-label="KHOJ investigation dashboard showing an active case with three potential leads"
        className="mx-auto w-[920px] max-w-none overflow-hidden rounded-xl border border-linec bg-surface text-left shadow-[0_24px_64px_-16px_rgba(24,22,35,0.22),0_2px_8px_rgba(24,22,35,0.06)] sm:w-full"
      >
        {/* top bar */}
        <div className="flex h-[54px] items-center justify-between gap-3 border-b border-linec/90 bg-surface px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              tabIndex={-1}
              className="flex shrink-0 items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-ink/[0.04]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink text-[11px] font-semibold text-white">
                RS
              </span>
              <span className="whitespace-nowrap text-[13.5px] font-medium text-ink">
                Sharma family · Case {DEMO_CASE.caseNo}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-faint" />
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-linec bg-white py-1.5 pl-3 pr-2.5 text-[13px] text-faint lg:flex">
              <Search className="h-3.5 w-3.5" />
              <span className="w-44">Search people, places, records</span>
              <kbd className="rounded border border-linec bg-lav px-1.5 py-0.5 text-[10px] text-body">
                ⌘K
              </kbd>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 text-[12.5px] font-medium text-white">
                <Sparkles className="h-3.5 w-3.5" />
                New search
              </span>
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-body">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lav-deep text-[11px] font-semibold text-body">
                PK
              </span>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* sidebar */}
          <div className="hidden w-[188px] shrink-0 flex-col border-r border-linec/90 bg-surface px-3 py-4 md:flex">
            <p className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
              Investigation
            </p>
            <ul className="space-y-0.5">
              {SIDENAV.map((item) => (
                <li key={item.label}>
                  <span
                    className={
                      "flex items-center justify-between rounded-lg px-2.5 py-[7px] text-[13.5px] " +
                      (item.active
                        ? "bg-lav-chip font-medium text-ink"
                        : "text-body")
                    }
                  >
                    {item.label}
                    {item.badge && (
                      <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-accent">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-auto space-y-0.5 pt-6">
              <span className="flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] text-faint">
                <FileText className="h-3.5 w-3.5" /> Safety guide
              </span>
              <span className="flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] text-faint">
                <Settings className="h-3.5 w-3.5" /> Preferences
              </span>
            </div>
          </div>

          {/* main */}
          <div className="min-w-0 flex-1 bg-lav/60 px-4 py-5 md:px-6">
            {/* case header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lav-deep text-[14px] font-semibold text-body">
                  RS
                </span>
                <div>
                  <p className="text-[17px] font-medium tracking-[-0.01em] text-ink">
                    {DEMO_CASE.person}
                  </p>
                  <p className="text-[12.5px] text-body">
                    {DEMO_CASE.age} years old · {DEMO_CASE.status} ·{" "}
                    {DEMO_CASE.city} · Reported {DEMO_CASE.reported}
                  </p>
                </div>
              </div>
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-linec bg-white px-3 text-[12.5px] font-medium text-ink">
                <Share2 className="h-3.5 w-3.5 text-body" />
                Share case
              </span>
            </div>

            {/* content grid */}
            <div className="mt-4 grid gap-3.5 lg:grid-cols-[1.05fr_0.95fr]">
              {/* investigation checklist */}
              <div className="rounded-xl border border-linec bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                    Investigation
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-lav-chip px-2 py-0.5 text-[11px] font-medium text-body">
                    Live
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {INVESTIGATION_STEPS.map((step, i) => (
                    <motion.li
                      key={step.id}
                      className="flex items-center gap-2.5 text-[13.5px] text-ink"
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 + i * 0.18, duration: 0.4, ease }}
                    >
                      <motion.span
                        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.45 + i * 0.18,
                          duration: 0.35,
                          ease,
                        }}
                      >
                        <MockCheck />
                      </motion.span>
                      {step.label}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-3.5 flex items-center justify-between border-t border-linec/80 pt-3">
                  <p className="text-[12.5px] text-body">
                    <span className="font-semibold text-accent">
                      {DEMO_CASE.leadCount} potential leads
                    </span>{" "}
                    · {DEMO_CASE.sourcesSearched} sources searched
                  </p>
                  <span className="text-[12px] text-faint">
                    Updated {DEMO_CASE.lastUpdated}
                  </span>
                </div>
              </div>

              {/* potential match */}
              <div className="rounded-xl border border-linec bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                    Potential match
                  </p>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                    Evidence attached
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3.5">
                  <ScoreRing value={DEMO_LEAD.score} />
                  <div>
                    <p className="text-[15.5px] font-medium text-ink">
                      {DEMO_LEAD.name}
                    </p>
                    <p className="text-[12.5px] text-body">
                      {DEMO_LEAD.place} · {DEMO_LEAD.date}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-faint">
                      <MapPin className="h-3 w-3" />
                      240 km from last sighting
                    </p>
                  </div>
                </div>
                <ul className="mt-3.5 space-y-1.5 rounded-lg bg-lav/70 p-2.5">
                  {DEMO_LEAD.checks.map((c) => (
                    <li
                      key={c.field}
                      className="flex items-center justify-between text-[12.5px]"
                    >
                      <span className="flex items-center gap-2 text-body">
                        <MockCheck className="h-3.5 w-3.5" />
                        {c.field}
                      </span>
                      <span className="text-faint">
                        {c.caseValue}
                        <span className="mx-1 text-diagram">→</span>
                        <span className="font-medium text-ink">
                          {c.matchValue}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  tabIndex={-1}
                  className="mt-3.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-linec bg-white text-[13px] font-medium text-ink transition-colors hover:bg-lav-chip"
                >
                  View evidence
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {/* bottom strip */}
            <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-linec bg-surface px-4 py-3 text-[12.5px] text-body">
              <span>
                <span className="font-semibold text-ink">
                  {DEMO_CASE.evidenceConnected}
                </span>{" "}
                evidence items connected
              </span>
              <span className="hidden h-3 w-px bg-linec sm:block" />
              <span>
                <span className="font-semibold text-ink">
                  {DEMO_CASE.leadCount}
                </span>{" "}
                potential leads
              </span>
              <span className="hidden h-3 w-px bg-linec sm:block" />
              <span>
                A potential match is not a confirmed identity
                <span className="text-faint"> — verify before acting</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Animated 0–91 score ring. */
function ScoreRing({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="#E5E4EE"
          strokeWidth="6"
        />
        <motion.circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="#556AEC"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold tracking-[-0.02em] text-ink">
        {value}%
      </span>
    </div>
  );
}
