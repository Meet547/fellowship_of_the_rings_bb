"use client";

import { Mic } from "lucide-react";
import { SectionHeader } from "@/components/khoj/primitives";
import { Reveal } from "@/components/khoj/reveal";
import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

const STAGES = [
  {
    num: "01",
    name: "DESCRIBE",
    text: "Tell KHOJ what you know. Type it, or simply speak.",
  },
  {
    num: "02",
    name: "SEARCH",
    text: "KHOJ searches connected public and authorized sources.",
  },
  {
    num: "03",
    name: "CONNECT",
    text: "AI connects relevant evidence into potential leads.",
  },
] as const;

export function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-20 md:py-28"
    >
      <Reveal>
        <SectionHeader
          id="how-title"
          title="From a description to a lead."
          sub="Describe someone in your own words. KHOJ turns it into structured case information — then follows the evidence for you."
        />
      </Reveal>

      <div className="mt-14 grid items-center gap-12 md:mt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        {/* left: three stages */}
        <Reveal>
          <h3 className="max-w-[380px] text-balance text-[26px] font-medium leading-[1.18] tracking-[-0.02em] text-ink md:text-[30px]">
            An investigation, in three steps
          </h3>
          <ol className="mt-9 space-y-0">
            {STAGES.map((s, i) => (
              <motion.li
                key={s.num}
                initial={reduce ? undefined : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.12 }}
                className={
                  "flex gap-5 py-5 " +
                  (i > 0 ? "border-t border-linline/80" : "")
                }
              >
                <span className="pt-0.5 text-[13px] font-medium tabular-nums text-faint">
                  {s.num}
                </span>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                    {s.name}
                  </p>
                  <p className="mt-1.5 max-w-[340px] text-[16px] leading-[1.55] text-body">
                    {s.text}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </Reveal>

        {/* right: intake demo panel */}
        <Reveal delay={0.1}>
          <div className="panel-grid relative overflow-hidden rounded-[20px] border border-linline bg-lav-deep">
            <div className="panel-fade pointer-events-none absolute inset-0" />
            <div className="relative px-6 py-12 sm:px-12 md:py-16">
              <IntakeCard />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** The intake modal — KHOJ's version of the reference's transfer dialog. */
function IntakeCard() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 26, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="mx-auto w-full max-w-[430px] rounded-xl border border-linec bg-surface p-5 shadow-[0_24px_56px_-16px_rgba(24,22,35,0.18)]"
      role="img"
      aria-label="KHOJ intake form describing a missing person"
    >
      <p className="text-[16.5px] font-medium tracking-[-0.01em] text-ink">
        Describe the person you&rsquo;re looking for
      </p>
      <p className="mt-1 text-[12.5px] text-faint">
        Write like you&rsquo;d tell a friend — KHOJ does the structuring.
      </p>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-[1fr_84px] gap-3">
          <Field label="Full name" value="Rahul Sharma" />
          <Field label="Age" value="17" />
        </div>
        <Field label="Last seen" value="Andheri Station, Mumbai" />
        <div>
          <p className="mb-1.5 text-[11.5px] font-medium text-faint">
            Anything else you remember
          </p>
          <div className="rounded-lg border border-linec bg-white px-3 py-2.5 text-[13px] leading-snug text-ink">
            He was carrying a black backpack and wearing a grey hoodie.
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-linec px-3 py-1.5 text-[12px] font-medium text-body">
          <Mic className="h-3.5 w-3.5" />
          Describe by voice
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-faint">
            Save draft
          </span>
          <span className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-[13px] font-medium text-white">
            Start investigation
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-medium text-faint">{label}</p>
      <div className="rounded-lg border border-linec bg-white px-3 py-2.5 text-[13px] text-ink">
        {value}
      </div>
    </div>
  );
}
