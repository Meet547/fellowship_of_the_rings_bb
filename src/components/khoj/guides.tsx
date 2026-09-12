import { Reveal } from "@/components/khoj/reveal";
import { PillButton } from "@/components/khoj/primitives";
import { Clock3, FileText, Waypoints } from "lucide-react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Guides for the search — occupies the reference's story-card slot.          */
/*  Illustrations are drawn with CSS/SVG only (no stock photography).          */
/* -------------------------------------------------------------------------- */

const GUIDES = [
  {
    icon: FileText,
    tint: "bg-[#DEDCF6]",
    art: <DescriptionArt />,
    title: "Describing a person clearly",
    note: "What to include — and what can wait.",
    href: "#how-it-works",
  },
  {
    icon: Clock3,
    tint: "bg-[#D9E4DC]",
    art: <ClockArt />,
    title: "The first 48 hours",
    note: "What to do while the search is fresh.",
    href: "#timeline",
  },
  {
    icon: Waypoints,
    tint: "bg-[#D7DBF3]",
    art: <NodesArt />,
    title: "How matches and evidence work",
    note: "Why a lead appears — and how to check it.",
    href: "#evidence",
  },
] as const;

export function Guides() {
  return (
    <section
      id="guides"
      aria-label="Guides for the search"
      className="bg-cream py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="grid gap-5 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col rounded-[16px] bg-[#EFEDE8] p-3.5 transition-shadow duration-300 hover:shadow-[0_16px_36px_-14px_rgba(24,22,35,0.14)]">
                <div
                  className={`relative flex h-[168px] items-center justify-center overflow-hidden rounded-[10px] ${g.tint}`}
                >
                  {g.art}
                </div>
                <div className="flex flex-1 flex-col px-2.5 pb-3 pt-5">
                  <h3 className="max-w-[240px] text-balance text-[19px] font-medium leading-[1.25] tracking-[-0.015em] text-ink">
                    {g.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] text-body">{g.note}</p>
                  <div className="mt-auto pt-5">
                    <PillButton href={g.href} variant="outline" arrow="upright" className="h-10 bg-transparent text-[14px]">
                      Read the guide
                    </PillButton>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- tiny illustrations (pure CSS/SVG, muted tones) ---------------------- */

function DescriptionArt() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full p-6" fill="none" aria-hidden="true">
      <rect x="46" y="10" width="128" height="100" rx="8" fill="#FCFCFA" />
      <rect x="60" y="26" width="44" height="8" rx="4" fill="#C6C4E6" />
      <rect x="60" y="44" width="100" height="5" rx="2.5" fill="#E5E4EE" />
      <rect x="60" y="56" width="86" height="5" rx="2.5" fill="#E5E4EE" />
      <rect x="60" y="68" width="94" height="5" rx="2.5" fill="#E5E4EE" />
      <circle cx="66" cy="92" r="6" fill="#556AEC" opacity="0.85" />
      <rect x="78" y="89" width="52" height="6" rx="3" fill="#D9D7F2" />
      <rect x="150" y="86" width="24" height="12" rx="6" fill="#556AEC" />
    </svg>
  );
}

function ClockArt() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full p-6" fill="none" aria-hidden="true">
      <circle cx="110" cy="60" r="42" fill="#FCFCFA" />
      <circle cx="110" cy="60" r="34" fill="none" stroke="#E5E4EE" strokeWidth="2" />
      <path
        d="M110 34 a26 26 0 1 1 -24.6 17.6"
        stroke="#16834B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M110 60 L110 40 M110 60 L124 68" stroke="#181623" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="110" cy="60" r="3" fill="#181623" />
      <rect x="160" y="30" width="34" height="5" rx="2.5" fill="#B9C9BE" />
      <rect x="160" y="42" width="26" height="5" rx="2.5" fill="#CBDAD0" />
      <rect x="26" y="78" width="30" height="5" rx="2.5" fill="#CBDAD0" />
    </svg>
  );
}

function NodesArt() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full p-6" fill="none" aria-hidden="true">
      <g stroke="#A9B4E4" strokeWidth="1.4">
        <path d="M110 60 L58 30" />
        <path d="M110 60 L52 88" />
        <path d="M110 60 L162 26" />
        <path d="M110 60 L168 84" />
        <path d="M110 60 L110 14" />
      </g>
      <circle cx="110" cy="60" r="13" fill="#556AEC" />
      <circle cx="110" cy="60" r="5" fill="white" />
      {[
        [58, 30],
        [52, 88],
        [162, 26],
        [168, 84],
        [110, 14],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7.5" fill="#FCFCFA" stroke="#C6C4E6" strokeWidth="1.4" />
      ))}
    </svg>
  );
}
