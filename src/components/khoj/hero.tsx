"use client";

import { HeroArt } from "@/components/khoj/hero-art";
import { ProductPreview } from "@/components/khoj/product-preview";
import { PillButton } from "@/components/khoj/primitives";
import {
  DEMO_CASE,
} from "@/lib/demo-data";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, MapPin, Mic, Percent } from "lucide-react";
import * as React from "react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const [listening, setListening] = React.useState(false);

  const fade = (delay: number) => ({
    initial: reduce ? undefined : ({ opacity: 0, y: 26 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section id="top" aria-labelledby="hero-title" className="relative">
      {/* ---- editorial top: cream ---- */}
      <div className="bg-cream px-5 pb-10 pt-[132px] md:pb-14 md:pt-[168px]">
        <div className="mx-auto max-w-[1360px]">
          <motion.p
            {...fade(0.05)}
            className="text-center text-[11.5px] font-semibold uppercase tracking-[0.2em] text-body"
          >
            KHOJ&ensp;/&ensp;Finding people
          </motion.p>
          <motion.h1
            {...fade(0.12)}
            id="hero-title"
            className="mx-auto mt-5 max-w-[820px] text-balance text-center text-[46px] font-medium leading-[1.04] tracking-[-0.038em] text-ink sm:text-[62px] md:text-[76px]"
          >
            Find someone.
            <br />
            Follow the evidence.
          </motion.h1>
          <motion.p
            {...fade(0.2)}
            className="mx-auto mt-6 max-w-[590px] text-balance text-center text-[17px] leading-[1.55] text-body md:text-[19px]"
          >
            KHOJ helps families and investigators turn scattered information
            into actionable leads when someone goes missing.
          </motion.p>

          {/* intake pill — the reference's email input, adapted to KHOJ */}
          <motion.div
            {...fade(0.28)}
            id="intake"
            className="mx-auto mt-9 flex max-w-[660px] flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            role="search"
            aria-label="Start an investigation"
          >
            <form
              className="flex w-full flex-col gap-2 rounded-[28px] border border-linec/70 bg-lav-chip p-2 shadow-[inset_0_1px_2px_rgba(24,22,35,0.03)] sm:h-[54px] sm:w-auto sm:min-w-0 sm:flex-1 sm:flex-row sm:items-center sm:gap-1 sm:rounded-full sm:p-1.5 sm:pl-2"
              onSubmit={(e) => {
                e.preventDefault();
                document
                  .querySelector("#how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  onClick={() => setListening((v) => !v)}
                  aria-pressed={listening}
                  aria-label={
                    listening ? "Stop voice description" : "Describe by voice"
                  }
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors " +
                    (listening
                      ? "mic-live bg-accent text-white"
                      : "text-body hover:bg-white/70")
                  }
                >
                  <Mic className="h-[17px] w-[17px]" />
                </button>
                <label htmlFor="hero-intake" className="sr-only">
                  Tell us what you know
                </label>
                <input
                  id="hero-intake"
                  type="text"
                  placeholder={
                    listening
                      ? "Listening…"
                      : "Tell us what you know…"
                  }
                  className="h-10 min-w-0 flex-1 bg-transparent px-2 text-[15.5px] text-ink placeholder:text-faint focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 text-[14.5px] font-medium text-white transition-colors hover:bg-accent-deep"
              >
                Start a search
                <span aria-hidden="true">→</span>
              </button>
            </form>
            <PillButton
              href="#two-sided"
              variant="outline"
              className="h-[54px] sm:px-6"
            >
              I found someone
            </PillButton>
          </motion.div>

          {/* voice hint */}
          <motion.p
            {...fade(0.34)}
            className="mx-auto mt-4 max-w-[520px] text-center text-[13px] leading-relaxed text-faint"
          >
            {listening
              ? "“My brother Rahul is 17 and was last seen near Andheri station…”"
              : "Type it, or simply speak — in your own words."}
          </motion.p>
        </div>
      </div>

      {/* ---- art band + dashboard preview ---- */}
      <div className="relative px-5 pb-14">
        <HeroArt />
        <div className="relative mx-auto max-w-[1200px] pt-2 md:pt-6">
          {/* floating cards — clipped at the edges, as in the reference */}
          <FloatingCards />

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="relative z-10"
          >
            {/* the window extends past the section edge, as in the reference */}
            <div className="h-[600px] overflow-hidden md:h-[640px]">
              <ProductPreview />
            </div>
          </motion.div>

          {/* disclaimer bar, as the reference's regulatory notice */}
          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
            className="absolute inset-x-5 bottom-6 z-20 mx-auto max-w-[1080px] rounded-lg bg-ink px-5 py-3 text-center text-[12.5px] leading-relaxed text-white/90 shadow-[0_10px_28px_rgba(24,22,35,0.28)] sm:bottom-8"
          >
            KHOJ is an investigation assistant, not a government agency. Every
            lead includes its evidence — a potential match is not a confirmed
            identity.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/** Edge-clipped floating cards over the art (desktop only). */
function FloatingCards() {
  const reduce = useReducedMotion();
  const item = (delay: number) => ({
    initial: reduce ? undefined : ({ opacity: 0, y: 30 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });
  return (
    <>
      {/* left: sighting + case file */}
      <motion.div
        {...item(0.55)}
        aria-hidden="true"
        className="absolute -left-24 top-10 z-0 hidden w-[232px] rounded-xl border border-white/60 bg-white/80 p-3.5 shadow-[0_16px_40px_rgba(24,22,35,0.14)] backdrop-blur-sm xl:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink">
              Sighting reported
            </p>
            <p className="text-[11.5px] text-body">Borivali · Aug 13, 09:20</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-lav-chip px-3 py-2 text-[11.5px] leading-snug text-body">
          Linked to case #{DEMO_CASE.caseNo} — {DEMO_CASE.person}
        </div>
      </motion.div>

      <motion.div
        {...item(0.7)}
        aria-hidden="true"
        className="absolute -left-16 bottom-24 z-0 hidden w-[212px] rounded-xl border border-white/60 bg-white/80 p-3.5 shadow-[0_16px_40px_rgba(24,22,35,0.12)] backdrop-blur-sm xl:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lav-deep text-body">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink">Case file</p>
            <p className="text-[11.5px] text-body">
              #{DEMO_CASE.caseNo} · Filed {DEMO_CASE.reported}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5" >
          <span className="block h-1.5 w-4/5 rounded-full bg-lav-deep" />
          <span className="block h-1.5 w-3/5 rounded-full bg-lav-deep" />
          <span className="block h-1.5 w-2/3 rounded-full bg-lav-deep" />
        </div>
      </motion.div>

      {/* right: found-person report + lead score */}
      <motion.div
        {...item(0.6)}
        aria-hidden="true"
        className="absolute -right-20 top-16 z-0 hidden w-[224px] rounded-xl border border-white/60 bg-white/80 p-3.5 shadow-[0_16px_40px_rgba(24,22,35,0.14)] backdrop-blur-sm xl:block"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Found-person report
          </p>
          <Percent className="h-3.5 w-3.5 text-faint" />
        </div>
        <p className="mt-2 text-[13.5px] font-medium text-ink">Surat · Aug 14</p>
        <p className="text-[11.5px] text-body">16:10 · Reported by a citizen</p>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-[11.5px] font-medium text-accent">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
            91
          </span>
          Possible match with case #{DEMO_CASE.caseNo}
        </div>
      </motion.div>

      <motion.div
        {...item(0.75)}
        aria-hidden="true"
        className="absolute -right-12 bottom-32 z-0 hidden w-[196px] rounded-xl border border-white/60 bg-white/80 p-3.5 shadow-[0_16px_40px_rgba(24,22,35,0.12)] backdrop-blur-sm xl:block"
      >
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          Potential lead
        </p>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-[26px] font-medium leading-none tracking-[-0.02em] text-ink">
            91%
          </span>
          <span className="pb-0.5 text-[11px] text-body">match</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-lav-deep">
          <div className="h-full w-[91%] rounded-full bg-accent" />
        </div>
      </motion.div>
    </>
  );
}
