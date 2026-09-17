"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  FileText,
  Flag,
  HeartHandshake,
  MapPin,
  Newspaper,
  Phone,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Btn, useToast } from "./ui";
import { RouteMap } from "./india-map";
import { MATCH } from "@/lib/khoj/data";
import type { Navigate } from "@/lib/khoj/router";

const ROWS = [
  { icon: <UserRound size={14} />, label: "Age (approx)", value: "62 years" },
  { icon: <UserRound size={14} />, label: "Gender", value: "Male" },
  { icon: <MapPin size={14} />, label: "Last seen", value: "Dadar, Mumbai (2 days ago)" },
  { icon: <MapPin size={14} />, label: "Found in", value: "Thane (via public report)" },
  { icon: <Newspaper size={14} />, label: "Source", value: "NGO Database + News Article" },
  { icon: <HeartHandshake size={14} />, label: "Possible relative", value: "Contact available" },
];

export default function Match({ navigate }: { navigate: Navigate }) {
  const toast = useToast();
  const [feedback, setFeedback] = useState<null | "yes" | "no">(null);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-[1150px] px-6">
        {/* top bar */}
        <div className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate("database")}
            className="group inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink2 transition-colors hover:text-ink"
          >
            <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Results
          </button>
          <button
            onClick={() => toast("Loading next match\u2026")}
            className="group inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink2 transition-colors hover:text-ink"
          >
            Next Match
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* main grid */}
        <div className="grid items-start gap-8 pb-14 lg:grid-cols-[300px_1fr_330px]">
          {/* photo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            { }
            <img
              src={MATCH.img}
              alt={MATCH.name}
              className="h-[310px] w-full rounded-[18px] object-cover"
            />
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {[
                MATCH.img,
                "/images/khoj-rameshkumar.jpg",
                "/images/khoj-unknown.jpg",
              ].map((src, i) => (
                 
                <img
                  key={i}
                  src={src}
                  alt="Additional photo"
                  className="aspect-square w-full cursor-pointer rounded-[10px] object-cover opacity-90 transition-all duration-300 hover:opacity-100"
                />
              ))}
              <div className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-[10px] bg-night text-[12px] font-medium text-smoke transition-transform duration-300 hover:scale-[1.03]">
                +2
              </div>
            </div>
          </motion.div>

          {/* details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex h-7 items-center rounded-full bg-badgeg px-3 text-[11.5px] font-semibold text-badgegt">
              Potential Match ({MATCH.match}%)
            </span>
            <h1 className="mt-3 font-serif text-[28px] font-medium tracking-[-0.01em] text-ink">
              {MATCH.name}
            </h1>

            <div className="mt-5 divide-y divide-line2">
              {ROWS.map((r) => (
                <div key={r.label} className="flex items-center gap-3 py-[9px]">
                  <span className="text-ink3">{r.icon}</span>
                  <span className="w-[118px] shrink-0 text-[12px] text-ink3">{r.label}</span>
                  <span className="text-[13px] font-medium text-ink">{r.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Btn onClick={() => toast("Opening full report\u2026")}>
                <span className="flex items-center gap-2">
                  <FileText size={14} /> View Full Report
                </span>
              </Btn>
              <Btn variant="outline" onClick={() => toast("Compare images side-by-side")}>
                <span className="flex items-center gap-2">
                  <Eye size={14} /> Compare Images
                </span>
              </Btn>
              <Btn variant="ghost" onClick={() => toast("Thank you \u2014 our team will review.")}>
                <span className="flex items-center gap-1.5">
                  <Flag size={13} /> Report as Incorrect
                </span>
              </Btn>
            </div>
          </motion.div>

          {/* right column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {/* map */}
            <div className="rounded-[18px] border border-line bg-card p-4">
              <div className="relative overflow-hidden rounded-[12px] bg-[#eef1ea]">
                <RouteMap className="h-[190px] w-full" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-card px-3 py-1 text-[10.5px] font-medium text-ink shadow-sm">
                  15 km away
                </span>
              </div>
            </div>

            {/* feedback */}
            <div className="rounded-[18px] border border-line bg-card p-5">
              <div className="text-[13.5px] font-semibold text-ink">
                Does this match look correct?
              </div>
              <p className="mt-1 text-[12px] text-ink2">
                Your feedback helps improve KHOJ.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setFeedback("yes");
                    toast("Thank you for confirming.");
                  }}
                  className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border text-[11.5px] font-medium transition-all duration-300 active:scale-[0.98] ${
                    feedback === "yes"
                      ? "border-badgegt bg-badgeg text-badgegt"
                      : "border-badgegt/35 text-badgegt hover:bg-badgeg/35"
                  }`}
                >
                  <ThumbsUp size={13} /> Yes, this is correct
                </button>
                <button
                  onClick={() => {
                    setFeedback("no");
                    toast("We\u2019ll re-check this match.");
                  }}
                  className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border text-[11.5px] font-medium transition-all duration-300 active:scale-[0.98] ${
                    feedback === "no"
                      ? "border-ink bg-ink text-paper2"
                      : "border-line text-ink2 hover:border-ink/35 hover:text-ink"
                  }`}
                >
                  <ThumbsDown size={13} /> No, not a match
                </button>
              </div>
            </div>

            {/* contact card */}
            <div className="rounded-[18px] bg-peach p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-rust text-paper2">
                  <Phone size={15} strokeWidth={1.9} />
                </span>
                <div>
                  <div className="text-[12px] font-semibold text-ink">Know this person?</div>
                  <div className="text-[11px] text-ink2">Connect through our verified network</div>
                </div>
              </div>
              <Btn className="mt-4 h-9 w-full rounded-[9px] text-[12px]" onClick={() => toast("Request sent to the reporting NGO.")}>
                Request Contact Details
              </Btn>
            </div>
          </motion.div>
        </div>
      </div>

      {/* dark CTA */}
      <section className="relative overflow-hidden bg-night">
        <div className="absolute inset-0">
          { }
          <img
            src="/images/khoj-detective-walk.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30" />
        </div>
        <div className="relative mx-auto flex max-w-[1150px] flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <h2 className="display-hero max-w-[430px] text-[clamp(26px,3vw,34px)] text-smoke">
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                Not just missing people.
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                A more connected India.
              </motion.span>
            </span>
          </h2>
          <div className="text-right">
            <div className="font-serif text-[28px] font-semibold tracking-[0.16em] text-smoke">
              KHOJ
            </div>
            <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.4em] text-smoke/50">
              People. Places. Possibilities
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
