"use client";

import { MockCheck, PillButton } from "@/components/khoj/primitives";
import { Reveal } from "@/components/khoj/reveal";
import { SOURCE_SEARCH, VOICE_INTAKE } from "@/lib/demo-data";
import { motion, useReducedMotion } from "framer-motion";
import { Mic } from "lucide-react";
import * as React from "react";

/**
 * Two capability cards — mirrors the reference's lavender 2-card grid.
 * Card A: natural-language / voice intake. Card B: connected search.
 */
export function FeatureCards() {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pb-20 md:pb-28"
    >
      <h2 id="capabilities-title" className="sr-only">
        Capabilities
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        <CapabilityCard
          mock={<VoiceMock />}
          title="Describe in your own words"
          sub="Type it or simply speak — KHOJ turns your description into structured case information."
          cta="Try the intake"
          href="#how-it-works"
        />
        <CapabilityCard
          mock={<SourcesMock />}
          title="One search, connected sources"
          sub="Search missing-person records, news and authorized sources from a single investigation."
          cta="Explore sources"
          href="#evidence"
        />
      </div>
    </section>
  );
}

function CapabilityCard({
  mock,
  title,
  sub,
  cta,
  href,
}: {
  mock: React.ReactNode;
  title: string;
  sub: string;
  cta: string;
  href: string;
}) {
  return (
    <Reveal className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[20px] bg-lav-deep">
        <div className="px-7 pt-8 sm:px-9 sm:pt-10">{mock}</div>
        <div className="flex flex-1 flex-col px-7 pb-8 pt-7 sm:px-9 sm:pb-10">
          <h3 className="max-w-[340px] text-balance text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink md:text-[27px]">
            {title}
          </h3>
          <p className="mt-3 max-w-[360px] text-pretty text-[15.5px] leading-[1.55] text-body">
            {sub}
          </p>
          <div className="mt-6">
            <PillButton href={href} variant="chip">
              {cta}
            </PillButton>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card A mock — voice capture with live waveform + transcript               */
/* -------------------------------------------------------------------------- */

function VoiceMock() {
  const reduce = useReducedMotion();
  const bars = [10, 18, 26, 14, 30, 22, 34, 18, 26, 12, 28, 20, 14, 24, 32, 16, 22, 12, 18, 26, 14, 20, 10, 16];
  return (
    <div
      role="img"
      aria-label="Voice intake: KHOJ transcribes a spoken description and extracts name, age and last seen location"
      className="relative mx-auto w-full max-w-[430px] rounded-xl border border-linec bg-surface p-5 shadow-[0_18px_44px_-14px_rgba(24,22,35,0.16)]"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          Describe by voice
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Listening
        </span>
      </div>

      {/* waveform */}
      <div className="mt-4 flex h-12 items-center gap-[3px] rounded-lg bg-lav-chip px-3.5" aria-hidden="true">
        {bars.map((h, i) => (
          <span
            key={i}
            className={reduce ? "" : "wave-bar"}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: i % 4 === 0 ? "#556AEC" : "#B7BAF1",
              animationDelay: `${(i % 8) * 0.12}s`,
            }}
          />
        ))}
      </div>

      {/* transcript */}
      <p className="mt-4 text-[14px] leading-[1.6] text-ink">
        “{VOICE_INTAKE.transcript}
        <span className="caret-blink ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] bg-accent" />
      </p>

      {/* extracted fields */}
      <div className="mt-4 flex flex-wrap gap-2">
        {VOICE_INTAKE.fields.map((f) => (
          <span
            key={f.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-linec bg-white px-3 py-1.5 text-[12px] text-body"
          >
            <span className="text-faint">{f.label}</span>
            <span className="font-medium text-ink">{f.value}</span>
            <MockCheck className="h-3.5 w-3.5" />
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-linec/80 pt-3.5">
        <span className="inline-flex items-center gap-2 text-[12px] text-faint">
          <span className="mic-live flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
            <Mic className="h-3.5 w-3.5" />
          </span>
          Speak anytime — pause or type instead
        </span>
        <span className="whitespace-nowrap text-[12px] font-medium text-accent">Done →</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card B mock — connected source search checklist                           */
/* -------------------------------------------------------------------------- */

function SourcesMock() {
  const reduce = useReducedMotion();
  return (
    <div
      role="img"
      aria-label="Connected search: missing-person records, news sources and public records searched; matches being compared"
      className="relative mx-auto w-full max-w-[430px] rounded-xl border border-linec bg-surface p-5 shadow-[0_18px_44px_-14px_rgba(24,22,35,0.16)]"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          Connected search
        </p>
        <span className="text-[11.5px] font-medium text-faint">
          Investigation #0142
        </span>
      </div>

      <ul className="mt-3.5 divide-y divide-linec/70">
        {SOURCE_SEARCH.map((s, i) => (
          <motion.li
            key={s.source}
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.14 }}
            className="flex items-center justify-between py-3"
          >
            <span className="flex items-center gap-2.5 text-[13.5px] text-ink">
              {s.status === "done" ? (
                <MockCheck />
              ) : (
                <span
                  aria-hidden="true"
                  className="h-[15px] w-[15px] rounded-full border-2 border-diagram border-t-accent motion-safe:animate-spin"
                  style={{ animationDuration: "1.4s" }}
                />
              )}
              {s.source}
            </span>
            <span
              className={
                "text-[11.5px] font-medium " +
                (s.status === "done" ? "text-success" : "text-accent")
              }
            >
              {s.note}
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-2 rounded-lg bg-lav-chip px-3.5 py-3 text-[12px] leading-relaxed text-body">
        <span className="font-semibold text-ink">3 potential leads</span> found
        across 12 sources — every one comes with its source attached.
      </div>
    </div>
  );
}
