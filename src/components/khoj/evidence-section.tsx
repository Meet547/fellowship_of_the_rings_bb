"use client";

import { cn } from "@/lib/utils";
import { KhojMark, PillButton } from "@/components/khoj/primitives";
import { Reveal } from "@/components/khoj/reveal";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { FileSearch, MapPin, Newspaper, UserRound, UserRoundCheck, GitCompareArrows, CalendarClock } from "lucide-react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  "Every lead comes with its evidence."                                      */
/*  Mirrors the reference's tabbed trust section: tabs drive highlights in a   */
/*  polished relationship diagram (MISSING CASE → evidence → POTENTIAL LEAD).  */
/* -------------------------------------------------------------------------- */

type TabId = "source" | "match" | "contradiction" | "timeline";

const TABS: { id: TabId; label: string; caption: string }[] = [
  {
    id: "source",
    label: "Source",
    caption:
      "Every match names its sources — missing-person records, news reports, sightings and found-person records.",
  },
  {
    id: "match",
    label: "Match",
    caption:
      "A lead is only surfaced when multiple details agree — age, date, location and description.",
  },
  {
    id: "contradiction",
    label: "Contradiction",
    caption:
      "When details don't line up, KHOJ shows what contradicts — before you act on a lead.",
  },
  {
    id: "timeline",
    label: "Timeline",
    caption:
      "Events stay ordered in time — from last confirmed sighting to found-person report.",
  },
];

export function EvidenceSection() {
  const [tab, setTab] = React.useState<TabId>("source");

  return (
    <section
      id="evidence"
      aria-labelledby="evidence-title"
      className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-20 md:py-28"
    >
      <Reveal>
        <h2
          id="evidence-title"
          className="mx-auto max-w-[680px] text-balance text-center text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-ink md:text-[40px]"
        >
          Every lead comes with its evidence.
        </h2>
      </Reveal>

      {/* tabs */}
      <Reveal delay={0.08}>
        <div
          role="tablist"
          aria-label="What a lead shows"
          className="mt-9 flex justify-start gap-1 overflow-x-auto border-b border-linline md:justify-center no-scrollbar"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="evidence-panel"
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-[15px] transition-colors",
                tab === t.id
                  ? "font-medium text-ink"
                  : "text-body hover:text-ink"
              )}
            >
              {t.label}
              {tab === t.id && (
                <motion.span
                  layoutId="evidence-tab-underline"
                  className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-ink"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </button>
          ))}
        </div>
      </Reveal>

      {/* diagram panel */}
      <Reveal delay={0.12}>
        <div
          id="evidence-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className="mt-7 overflow-hidden rounded-[20px] border border-linline bg-lav-deep"
        >
          <div className="overflow-x-auto no-scrollbar">
            <EvidenceGraph tab={tab} />
          </div>
        </div>
      </Reveal>

      {/* tab caption */}
      <div className="mx-auto mt-5 h-12 max-w-[560px] px-2 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-[14px] leading-relaxed text-body"
          >
            {TABS.find((t) => t.id === tab)?.caption}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* statement + disclaimer */}
      <Reveal delay={0.05}>
        <p className="mx-auto mt-10 max-w-[640px] text-balance text-center text-[24px] font-medium leading-[1.25] tracking-[-0.02em] text-ink md:text-[32px]">
          AI shouldn&rsquo;t replace evidence.
          <br className="hidden md:block" /> It should connect it.
        </p>
        <p className="mx-auto mt-5 max-w-[520px] text-center text-[15px] leading-relaxed text-body">
          A potential match is not a confirmed identity. KHOJ shows you why
          something matched — so you can decide what to do next.
        </p>
        <div className="mt-8 text-center">
          <PillButton href="#how-it-works" variant="chip">
            How KHOJ works
          </PillButton>
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  The relationship diagram                                                  */
/* -------------------------------------------------------------------------- */

const W = 880;
const H = 380;
const LINE_Y = 190;

function EvidenceGraph({ tab }: { tab: TabId }) {
  const reduce = useReducedMotion();
  const dim = (active: boolean) =>
    cn(
      "transition-all duration-300",
      active
        ? "opacity-100"
        : "opacity-45"
    );

  const evidenceTop = [
    { id: "news", label: "NEWS REPORT", icon: Newspaper, x: 262 },
    { id: "sighting", label: "SIGHTING", icon: MapPin, x: 618 },
  ];
  const evidenceBottom = [
    { id: "location", label: "LOCATION", icon: MapPin, x: 262 },
    { id: "found", label: "FOUND-PERSON RECORD", icon: UserRoundCheck, x: 618 },
  ];

  const draw = (delay: number) => ({
    initial: reduce ? undefined : { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true },
    transition: { duration: 0.9, delay, ease: "easeOut" as const },
  });

  return (
    <div className="relative mx-auto h-[400px] w-[880px]">
      {/* connector lines */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="absolute inset-0"
        aria-hidden="true"
        fill="none"
      >
        {/* main axis */}
        <motion.line
          {...draw(0.15)}
          x1={56}
          y1={LINE_Y}
          x2={W - 56}
          y2={LINE_Y}
          stroke="#C6C4E6"
          strokeWidth="1.2"
        />
        {/* evidence drop lines */}
        {evidenceTop.map((e, i) => (
          <motion.line
            key={`t-${e.id}`}
            {...draw(0.4 + i * 0.15)}
            x1={e.x}
            y1={LINE_Y - 80}
            x2={e.x}
            y2={LINE_Y - 12}
            stroke="#C6C4E6"
            strokeWidth="1.2"
          />
        ))}
        {evidenceBottom.map((e, i) => (
          <motion.line
            key={`b-${e.id}`}
            {...draw(0.55 + i * 0.15)}
            x1={e.x}
            y1={LINE_Y + 12}
            x2={e.x}
            y2={LINE_Y + 80}
            stroke="#C6C4E6"
            strokeWidth="1.2"
          />
        ))}
        {/* dashed orbits around KHOJ, as in the reference */}
        <motion.circle
          initial={reduce ? undefined : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ transformOrigin: "440px 190px" }}
          cx={440}
          cy={LINE_Y}
          r={92}
          stroke="#C6C4E6"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <motion.circle
          initial={reduce ? undefined : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.62 }}
          style={{ transformOrigin: "440px 190px" }}
          cx={440}
          cy={LINE_Y}
          r={128}
          stroke="#C6C4E6"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        {/* timeline ticks (timeline tab) */}
        <AnimatePresence>
          {tab === "timeline" && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {[
                { x: 205, label: "AUG 12" },
                { x: 262, label: "AUG 13" },
                { x: 618, label: "AUG 14" },
              ].map((t) => (
                <g key={`${t.x}-${t.label}`}>
                  <circle cx={t.x} cy={LINE_Y} r={4.5} fill="#556AEC" opacity={0.85} />
                  <text
                    x={t.x}
                    y={LINE_Y - 14}
                    textAnchor="middle"
                    className="fill-[#556AEC] text-[10px] font-semibold"
                    style={{ letterSpacing: "0.08em" }}
                  >
                    {t.label}
                  </text>
                </g>
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* MISSING CASE node */}
      <div
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2",
          dim(tab !== "contradiction")
        )}
        style={{ transform: "translateY(-50%)", left: 0 }}
      >
        <GraphNode
          icon={<FileSearch className="h-4 w-4" />}
          label="MISSING CASE"
          sub="Case #0142 · Mumbai"
        />
      </div>

      {/* KHOJ centre */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(24,22,35,0.10)]">
          <KhojMark className="h-11 w-11 text-ink" strokeWidth={1.5} />
        </div>
        <p className="mt-2.5 text-center text-[13.5px] font-medium tracking-[-0.01em] text-accent">
          KHOJ
        </p>
      </div>

      {/* POTENTIAL LEAD node */}
      <div
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2",
          dim(tab === "match" || tab === "source" || tab === "timeline")
        )}
      >
        <GraphNode
          icon={<GitCompareArrows className="h-4 w-4" />}
          label="POTENTIAL LEAD"
          sub="Needs verification"
          accent
        />
      </div>

      {/* evidence chips */}
      {evidenceTop.map((e) => (
        <div
          key={e.id}
          className={cn("absolute -translate-x-1/2", dim(true))}
          style={{ left: e.x, top: LINE_Y - 118 }}
        >
          <EvidenceChip
            icon={<e.icon className="h-3.5 w-3.5" />}
            label={e.label}
            active={tab === "source"}
          />
        </div>
      ))}
      {evidenceBottom.map((e) => (
        <div
          key={e.id}
          className={cn("absolute -translate-x-1/2", dim(true))}
          style={{ left: e.x, top: LINE_Y + 76 }}
        >
          <EvidenceChip
            icon={<e.icon className="h-3.5 w-3.5" />}
            label={e.label}
            active={tab === "source"}
          />
        </div>
      ))}

      {/* match score chip */}
      <div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
          tab === "match"
            ? "opacity-100 scale-100"
            : "opacity-40 scale-95"
        )}
        style={{ left: 748, top: LINE_Y - 88 }}
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(85,106,236,0.35)]">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px]">
            91
          </span>
          91% match
        </span>
      </div>

      {/* contradiction chip */}
      <AnimatePresence>
        {tab === "contradiction" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="absolute -translate-x-1/2"
            style={{ left: 440, top: LINE_Y + 128 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7D9B8] bg-[#FBF3E2] px-3 py-1.5 text-[12px] font-medium text-flag shadow-sm">
              <UserRound className="h-3.5 w-3.5" />
              Height differs — check before acting
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GraphNode({
  icon,
  label,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-[152px] rounded-xl border bg-surface px-3.5 py-3 text-center shadow-[0_8px_22px_rgba(24,22,35,0.07)]",
        accent ? "border-accent/35" : "border-linec"
      )}
    >
      <span
        className={cn(
          "mx-auto flex h-8 w-8 items-center justify-center rounded-full",
          accent ? "bg-accent-soft text-accent" : "bg-lav-chip text-body"
        )}
      >
        {icon}
      </span>
      <p className="mt-2 text-[11px] font-semibold tracking-[0.1em] text-ink">
        {label}
      </p>
      <p className="mt-0.5 text-[10.5px] text-faint">{sub}</p>
    </div>
  );
}

function EvidenceChip({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] transition-colors duration-300",
        active
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-linline bg-white/80 text-body"
      )}
    >
      {icon}
      {label}
    </span>
  );
}
