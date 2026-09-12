"use client";

import { cn } from "@/lib/utils";
import { MockCheck, PillButton, SectionHeader } from "@/components/khoj/primitives";
import { Reveal } from "@/components/khoj/reveal";
import { DEMO_LEAD, TIMELINE } from "@/lib/demo-data";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Camera, MapPin } from "lucide-react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  "Your whole investigation. Zero complexity."                               */
/*  Mirrors the reference's alternating feature rows on the near-white band.   */
/* -------------------------------------------------------------------------- */

export function FeatureSection() {
  return (
    <section
      id="workflows"
      aria-labelledby="workflows-title"
      className="scroll-mt-20 bg-paper py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <SectionHeader
            id="workflows-title"
            title={
              <>
                Every piece of the investigation.
                <br className="hidden md:block" /> One place.
              </>
            }
            sub="With KHOJ powering the search, every sighting, report and record stays connected — in language a family can actually use."
          />
        </Reveal>

        <div className="mt-16 space-y-24 md:mt-24 md:space-y-32">
          <FeatureRow
            id="matching"
            title="Leads you can check — not just scores"
            cta="How matching works"
            href="#evidence"
            bullets={[
              "Potential leads are ranked using multiple pieces of evidence, not a single similarity score",
              "Every match shows the details that agree — and the ones that don't",
              "Sources stay attached, so anyone can verify a lead",
              "You decide which leads to pursue, in your own time",
            ]}
            visual={<MatchVisual />}
          />
          <FeatureRow
            id="timeline"
            reverse
            title="The investigation, in order"
            cta="Explore the timeline"
            href="#timeline"
            bullets={[
              "See sightings, reports and locations connected in chronological order",
              "Every entry links back to where it came from",
              "Spot gaps — and what to confirm next",
              "Share the timeline with everyone involved",
            ]}
            visual={<TimelineVisual />}
          />
          <FeatureRow
            id="found"
            title="Found someone? Work backwards."
            cta="Find a match"
            href="#two-sided"
            bullets={[
              "Enter what you know about the person you found",
              "KHOJ compares it against open missing-person cases",
              "Potential matches surface with their evidence attached",
              "You see the case details before anyone reaches out",
            ]}
            visual={<FoundVisual />}
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Row scaffold — text column + visual panel, alternating                     */
/* -------------------------------------------------------------------------- */

function FeatureRow({
  id,
  title,
  cta,
  href,
  bullets,
  visual,
  reverse,
}: {
  id: string;
  title: string;
  cta: string;
  href: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      id={id}
      className="grid scroll-mt-24 items-center gap-12 lg:grid-cols-2 lg:gap-20"
    >
      <Reveal className={cn(reverse && "lg:order-2")}>
        <h3 className="max-w-[380px] text-balance text-[26px] font-medium leading-[1.18] tracking-[-0.02em] text-ink md:text-[30px]">
          {title}
        </h3>
        <PillButton href={href} variant="chip" className="mt-6">
          {cta}
        </PillButton>
        <hr className="mt-8 border-linec" />
        <ul className="mt-7 space-y-4">
          {bullets.map((b, i) => (
            <motion.li
              key={b}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="flex gap-3 text-[16px] leading-[1.55] text-body"
            >
              <ArrowRight
                className="mt-[5px] h-4 w-4 shrink-0 text-faint"
                strokeWidth={1.8}
              />
              <span className="max-w-[420px]">{b}</span>
            </motion.li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.1} className={cn(reverse && "lg:order-1")}>
        <div className="panel-grid relative overflow-hidden rounded-[20px] border border-linline bg-lav-deep">
          <div className="panel-fade pointer-events-none absolute inset-0" />
          <div className="relative px-6 py-12 sm:px-12 md:py-14">{visual}</div>
        </div>
      </Reveal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Visual 1 — evidence-backed match card                                     */
/* -------------------------------------------------------------------------- */

function MatchVisual() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="mx-auto w-full max-w-[440px] rounded-xl border border-linec bg-surface p-5 shadow-[0_18px_44px_-14px_rgba(24,22,35,0.16)]"
      role="img"
      aria-label="A potential lead compared field by field: age, date, location and description"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          Potential match
        </p>
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
          {DEMO_LEAD.score}%
        </span>
      </div>

      <p className="mt-2.5 text-[17px] font-medium tracking-[-0.01em] text-ink">
        {DEMO_LEAD.name}
      </p>
      <p className="text-[12.5px] text-body">
        {DEMO_LEAD.place} · {DEMO_LEAD.date} · Found-person report
      </p>

      <ul className="mt-4 space-y-2">
        {DEMO_LEAD.checks.map((c) => (
          <li
            key={c.field}
            className="flex items-center justify-between rounded-lg bg-lav/80 px-3 py-2 text-[12.5px]"
          >
            <span className="w-[86px] font-medium text-ink">{c.field}</span>
            <span className="flex-1 text-faint">{c.caseValue}</span>
            <span className="text-diagram">↔</span>
            <span className="flex-1 pl-2 text-ink">{c.matchValue}</span>
            <MockCheck className="h-4 w-4" />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-linec/80 pt-3.5 text-[12px]">
        <span className="text-body">4 of 4 details agree</span>
        <span className="font-medium text-accent">View full evidence →</span>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Visual 2 — investigation timeline (Aug 12 → Aug 14)                        */
/* -------------------------------------------------------------------------- */

function TimelineVisual() {
  const reduce = useReducedMotion();
  return (
    <motion.ol
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="mx-auto w-full max-w-[420px] rounded-xl border border-linec bg-surface p-5 shadow-[0_18px_44px_-14px_rgba(24,22,35,0.16)]"
      aria-label="Investigation timeline from August 12 to August 14"
    >
      {TIMELINE.map((ev, i) => {
        const last = i === TIMELINE.length - 1;
        return (
          <motion.li
            key={`${ev.date}-${ev.time}`}
            initial={reduce ? undefined : { opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 + i * 0.16 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* spine */}
            {!last && (
              <span
                aria-hidden="true"
                className="absolute left-[7px] top-5 h-full w-px bg-linline"
              />
            )}
            <span
              aria-hidden="true"
              className={
                "relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 bg-surface " +
                (last ? "border-accent bg-accent/15" : "border-diagram")
              }
            >
              {last && (
                <motion.span
                  initial={reduce ? undefined : { scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.16 + 0.25, duration: 0.35 }}
                  className="absolute inset-[3px] rounded-full bg-accent"
                />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[10.5px] font-semibold tracking-[0.12em] text-faint">
                  {ev.date.toUpperCase()}
                </p>
                <p className="text-[11.5px] tabular-nums text-faint">
                  {ev.time}
                </p>
              </div>
              <p
                className={cn(
                  "mt-0.5 text-[14px] font-medium text-ink",
                  last && "text-accent"
                )}
              >
                {ev.title}
              </p>
              {ev.place && (
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-body">
                  <MapPin className="h-3 w-3 text-faint" />
                  {ev.place}
                </p>
              )}
              {last && (
                <p className="mt-1 text-[12px] leading-snug text-body">
                  Score 91% — evidence attached, ready to verify.
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Visual 3 — found-person report matched to a case                          */
/* -------------------------------------------------------------------------- */

function FoundVisual() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="mx-auto w-full max-w-[430px] rounded-xl border border-linec bg-surface p-5 shadow-[0_18px_44px_-14px_rgba(24,22,35,0.16)]"
      role="img"
      aria-label="A found-person report compared against an open missing-person case"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          I found someone
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-linec px-2.5 py-1 text-[11px] font-medium text-body">
          <Camera className="h-3 w-3" />
          Photo added
        </span>
      </div>

      <div className="mt-3.5 space-y-2.5">
        <div className="flex items-center gap-2.5 rounded-lg border border-linec bg-white px-3 py-2.5 text-[13px]">
          <span className="text-faint">Where</span>
          <span className="font-medium text-ink">Surat</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-linec bg-white px-3 py-2.5 text-[13px]">
          <span className="text-faint">When</span>
          <span className="font-medium text-ink">Aug 14 · 16:10</span>
        </div>
        <div className="rounded-lg border border-linec bg-white px-3 py-2.5 text-[13px]">
          <span className="text-faint">Details · </span>
          <span className="text-ink">
            Male, appears ~17, grey hoodie, black backpack
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-accent/25 bg-accent-soft/60 p-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-accent">
            Possible match · Case #0142
          </p>
          <span className="text-[12px] font-semibold text-accent">91%</span>
        </div>
        <p className="mt-1 text-[12.5px] leading-snug text-body">
          Rahul Sharma, 17 — missing from Mumbai since Aug 12.
        </p>
        <p className="mt-2 text-[12px] font-medium text-accent">
          View case & evidence →
        </p>
      </div>
    </motion.div>
  );
}
