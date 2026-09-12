"use client";

import { MockCheck, PillButton, SectionHeader } from "@/components/khoj/primitives";
import { Reveal } from "@/components/khoj/reveal";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Search, UserRoundPlus } from "lucide-react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  KHOJ works in two directions — mirrors the reference's card-pair rhythm    */
/* -------------------------------------------------------------------------- */

export function TwoSided() {
  const reduce = useReducedMotion();
  const rise = {
    initial: reduce ? undefined : ({ opacity: 0, y: 24 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
  };
  return (
    <section
      id="two-sided"
      aria-labelledby="two-sided-title"
      className="scroll-mt-20 bg-paper pb-20 md:pb-28"
    >
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <SectionHeader
            id="two-sided-title"
            title="KHOJ works in two directions."
            sub="Missing, or found — the same evidence, connected in both directions."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
          {/* LOOKING FOR SOMEONE */}
          <motion.article {...rise} className="overflow-hidden rounded-[20px] bg-lav-deep">
            <div className="px-7 pt-8 sm:px-9 sm:pt-10">
              <div
                role="img"
                aria-label="An active investigation with three leads"
                className="rounded-xl border border-linec bg-surface p-4 shadow-[0_14px_36px_-12px_rgba(24,22,35,0.14)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                    Your investigation
                  </p>
                  <span className="inline-flex h-6 items-center gap-1 rounded-full bg-accent-soft px-2 text-[10.5px] font-semibold text-accent">
                    <Search className="h-3 w-3" /> Active
                  </span>
                </div>
                <p className="mt-2 text-[15px] font-medium text-ink">
                  Rahul Sharma · 17 · Mumbai
                </p>
                <ul className="mt-3 space-y-1.5 text-[12.5px] text-body">
                  <li className="flex items-center gap-2">
                    <MockCheck className="h-3.5 w-3.5" /> 12 sources searched
                  </li>
                  <li className="flex items-center gap-2">
                    <MockCheck className="h-3.5 w-3.5" /> 4 evidence items connected
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-soft text-[8px] font-bold text-accent">
                      3
                    </span>
                    potential leads waiting for review
                  </li>
                </ul>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-lav-chip px-3 py-2 text-[11.5px] text-faint">
                  <MapPin className="h-3 w-3" />
                  Latest: found-person report · Surat · Aug 14
                </div>
              </div>
            </div>
            <div className="px-7 pb-8 pt-7 sm:px-9 sm:pb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                Looking for someone
              </p>
              <h3 className="mt-2.5 max-w-[360px] text-balance text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink md:text-[27px]">
                Describe who you&rsquo;re looking for and let KHOJ investigate.
              </h3>
              <PillButton href="#intake" className="mt-6">
                Start a search
              </PillButton>
            </div>
          </motion.article>

          {/* FOUND SOMEONE */}
          <motion.article
            {...rise}
            transition={{ ...rise.transition, delay: 0.1 }}
            className="overflow-hidden rounded-[20px] bg-lav-deep"
          >
            <div className="px-7 pt-8 sm:px-9 sm:pt-10">
              <div
                role="img"
                aria-label="A found-person report matched to a case"
                className="rounded-xl border border-linec bg-surface p-4 shadow-[0_14px_36px_-12px_rgba(24,22,35,0.14)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                    Found-person report
                  </p>
                  <span className="inline-flex h-6 items-center gap-1 rounded-full bg-lav-chip px-2 text-[10.5px] font-semibold text-body">
                    <UserRoundPlus className="h-3 w-3" /> Just now
                  </span>
                </div>
                <p className="mt-2 text-[15px] font-medium text-ink">
                  Surat · Aug 14 · 16:10
                </p>
                <p className="mt-1 text-[12.5px] text-body">
                  Male, appears ~17, grey hoodie, black backpack.
                </p>
                <div className="mt-3 rounded-lg border border-accent/25 bg-accent-soft/60 px-3 py-2.5">
                  <div className="flex items-center justify-between text-[12px] font-semibold text-accent">
                    <span>Possible match · Case #0142</span>
                    <span>91%</span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-body">
                    Age, location and description all agree.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-7 pb-8 pt-7 sm:px-9 sm:pb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                Found someone
              </p>
              <h3 className="mt-2.5 max-w-[360px] text-balance text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink md:text-[27px]">
                Upload what you know and search for potential matches.
              </h3>
              <PillButton href="#found" variant="outline" className="mt-6">
                Find a match
              </PillButton>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
