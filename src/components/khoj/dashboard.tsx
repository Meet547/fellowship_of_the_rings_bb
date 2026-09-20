"use client";

import CaseDashboard from "./case-dashboard";
import { motion } from "framer-motion";
import {
  AudioWaveform,
  Camera,
  BellRing,
  MapPinned,
  Search,
} from "lucide-react";
import { ArrowCircle, MaskLine, Reveal, ScriptNote } from "./ui";
import { IndiaMap } from "./india-map";
import type { Navigate } from "@/lib/khoj/router";
import { useUserProfile } from "@/lib/khoj/use-user";

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
    body: "Type a description and let AI search for potential matches.",
    color: "blue" as const,
    to: "find" as const,
  },
  {
    bg: "bg-sage",
    icon: <Camera size={21} strokeWidth={1.9} className="text-greenicon" />,
    title: "Scan & Identify",
    body: "Read a missing-person poster and review the extracted details.",
    color: "green" as const,
    to: "scan" as const,
  },
];

export default function Dashboard({ navigate }: { navigate: Navigate }) {
  const profile = useUserProfile();
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-9">
      {/* greeting */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="display-hero text-[clamp(26px,3vw,32px)]">
          <MaskLine>{profile.name ? `Welcome back, ${profile.name}.` : "Welcome back."}</MaskLine>
          <MaskLine delay={0.09}>Every search brings hope.</MaskLine>
        </h1>
        <ScriptNote rotate={-4} className="mt-2 max-w-[190px] text-right text-[20px]">
          &ldquo;Log kho jaate hain, zimmedari nahi.&rdquo;
        </ScriptNote>
      </div>

      <CaseDashboard />

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

      <Reveal delay={0.12}>
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { icon: <BellRing size={18} />, title: "Smart alerts", body: "Get notified when a new record matches your saved search.", color: "bg-peach text-rust" },
            { icon: <MapPinned size={18} />, title: "Live case map", body: "See verified sightings and partner updates on one secure map.", color: "bg-sage text-greenicon" },
          ].map((feature) => (
            <article key={feature.title} className="flex items-start gap-4 rounded-[16px] border border-line bg-card p-5">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${feature.color}`}>{feature.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-[17px] font-medium text-ink">{feature.title}</h3>
                  <span className="rounded-full border border-line bg-paper2 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink3">Coming soon</span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink2">{feature.body}</p>
              </div>
            </article>
          ))}
        </section>
      </Reveal>

      {/* map strip */}
      <Reveal delay={0.15}>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-[18px] border border-line bg-paper2 px-6 py-7">
          <IndiaMap className="h-[120px] w-auto" fill="rgba(35,32,27,0.12)" stroke="rgba(35,32,27,0.3)" />
          <p className="text-center text-[12.5px] font-medium leading-snug text-ink">
            Together
            <br />
            for a safer,
            <br />
            kinder India.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
