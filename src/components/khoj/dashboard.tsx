"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  AudioWaveform,
  Camera,
  Search,
  UsersRound,
} from "lucide-react";
import { ArrowCircle, CountUp, MaskLine, Reveal, ScriptNote } from "./ui";
import { IndiaMap } from "./india-map";
import { DB_STATS } from "@/lib/khoj/data";
import type { Navigate } from "@/lib/khoj/router";

const CARDS = [
  {
    bg: "bg-peach",
    icon: <Search size={21} strokeWidth={1.9} className="text-rust" />,
    title: "Search Database",
    body: "Browse missing and unidentified persons.",
    color: "rust" as const,
    to: "database" as const,
  },
  {
    bg: "bg-sky",
    icon: <AudioWaveform size={21} strokeWidth={1.9} className="text-blueicon" />,
    title: "Find a Person",
    body: "Describe, type or speak to search using AI.",
    color: "blue" as const,
    to: "find" as const,
  },
  {
    bg: "bg-sage",
    icon: <Camera size={21} strokeWidth={1.9} className="text-greenicon" />,
    title: "Scan & Identify",
    body: "Upload a photo to find possible matches.",
    color: "green" as const,
    to: "scan" as const,
  },
];

export default function Dashboard({ navigate }: { navigate: Navigate }) {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-9">
      {/* greeting */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="display-hero text-[clamp(26px,3vw,32px)]">
          <MaskLine>Welcome back, Meet.</MaskLine>
          <MaskLine delay={0.09}>Every search brings hope.</MaskLine>
        </h1>
        <ScriptNote rotate={-4} className="mt-2 max-w-[190px] text-right text-[20px]">
          &ldquo;Log kho jaate hain, zimmedari nahi.&rdquo;
        </ScriptNote>
      </div>

      {/* action cards */}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={0.08 + i * 0.1}>
            <motion.article
              whileHover={{ y: -5 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={`group flex h-full flex-col rounded-[18px] ${c.bg} p-6`}
            >
              <div className="flex size-[46px] items-center justify-center rounded-full bg-card/70">
                {c.icon}
              </div>
              <h3 className="mt-5 font-serif text-[19.5px] font-medium text-ink">
                {c.title}
              </h3>
              <p className="mt-1.5 max-w-[230px] text-[12.5px] leading-relaxed text-ink2">
                {c.body}
              </p>
              <div className="mt-6 flex justify-end">
                <ArrowCircle color={c.color} onClick={() => navigate(c.to)} label={c.title} />
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>

      {/* stats + map */}
      <Reveal delay={0.15}>
        <div className="mt-8 grid overflow-hidden rounded-[18px] border border-line bg-card lg:grid-cols-[1fr_300px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[rgba(35,32,27,0.08)]">
            {DB_STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-7 py-8 ${i >= 2 ? "border-t border-line2 lg:border-t-0" : ""}`}
              >
                <div className="font-serif text-[27px] font-medium leading-none text-ink">
                  <CountUp to={s.value} suffix={s.suffix} duration={2} />
                </div>
                <div className="mt-2.5 text-[11.5px] leading-snug text-ink2">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-3 border-t border-line bg-paper2 px-6 py-7 lg:border-l lg:border-t-0">
            <IndiaMap className="h-[120px] w-auto" fill="rgba(35,32,27,0.12)" stroke="rgba(35,32,27,0.3)" />
            <p className="text-center text-[12.5px] font-medium leading-snug text-ink">
              Together
              <br />
              for a safer,
              <br />
              kinder India.
            </p>
          </div>
        </div>
      </Reveal>

      {/* recent activity hint row */}
      <Reveal delay={0.2}>
        <div className="mt-8 flex items-center justify-between rounded-[18px] border border-line bg-card px-6 py-5">
          <div className="flex items-center gap-3.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-peach text-rust">
              <UsersRound size={16} strokeWidth={1.9} />
            </span>
            <div>
              <div className="text-[13px] font-semibold text-ink">
                Potential match found — Ramesh Sharma (78%)
              </div>
              <div className="text-[11.5px] text-ink2">
                Found in Thane via a public report · reviewed by NGO Database
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("match")}
            className="group inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink"
          >
            <span className="link-sweep">View match</span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </Reveal>
    </div>
  );
}
