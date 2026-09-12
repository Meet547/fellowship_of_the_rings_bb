"use client";

import { FigureCaption, PillButton } from "@/components/khoj/primitives";
import { Reveal } from "@/components/khoj/reveal";
import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Figure A — the investigation flower                                        */
/*  The reference's overlapping-circle diagram, relabelled for KHOJ:           */
/*  PERSON at the centre, connected to CASE, SIGHTING, NEWS, PUBLIC RECORD,    */
/*  FOUND PERSON and EVIDENCE.                                                 */
/* -------------------------------------------------------------------------- */

const CENTER = 280;
const PETAL_R = 126;
const PETAL_D = 126; // distance from flower centre
const OUTER_R = 252;

const PETALS = [
  { angle: -90, num: "02", name: "Case" },
  { angle: -30, num: "03", name: "Sighting" },
  { angle: 30, num: "04", name: "News" },
  { angle: 90, num: "05", name: "Public", name2: "record" },
  { angle: 150, num: "06", name: "Found", name2: "person" },
  { angle: 210, num: "07", name: "Evidence" },
] as const;

function petalPoint(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(a),
    y: CENTER + radius * Math.sin(a),
  };
}

export function FigureFlower() {
  const reduce = useReducedMotion();
  const draw = (i: number) => ({
    initial: reduce ? undefined : { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-60px" },
    transition: {
      duration: 1.1,
      delay: 0.08 * i,
      ease: [0.3, 0.6, 0.3, 1] as const,
    },
  });
  const label = (i: number) => ({
    initial: reduce ? undefined : { opacity: 0, y: 6 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay: 0.7 + i * 0.07 },
  });

  return (
    <div className="relative">
      <svg
        viewBox="0 0 560 560"
        className="h-auto w-full"
        role="img"
        aria-label="Diagram: a person at the centre of an investigation, connected to case information, sightings, news, public records, found-person reports and evidence"
      >
        {/* outer circle */}
        <motion.circle
          {...draw(0)}
          cx={CENTER}
          cy={CENTER}
          r={OUTER_R}
          fill="none"
          stroke="#C6C4E6"
          strokeWidth="1"
        />
        {/* petals */}
        {PETALS.map((p, i) => {
          const pt = petalPoint(p.angle, PETAL_D);
          return (
            <motion.circle
              key={p.num}
              {...draw(i + 1)}
              cx={pt.x}
              cy={pt.y}
              r={PETAL_R}
              fill="none"
              stroke="#C6C4E6"
              strokeWidth="1"
            />
          );
        })}
        {/* centre double ring */}
        <motion.circle
          {...draw(7)}
          cx={CENTER}
          cy={CENTER}
          r={74}
          fill="none"
          stroke="#B4B2DC"
          strokeWidth="1"
        />
        <motion.circle
          {...draw(8)}
          cx={CENTER}
          cy={CENTER}
          r={64}
          fill="none"
          stroke="#C6C4E6"
          strokeWidth="1"
        />

        {/* centre label */}
        <motion.g {...label(0)}>
          <text
            x={CENTER}
            y={CENTER - 16}
            textAnchor="middle"
            className="fill-[#7B79A8] text-[10px]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            01
          </text>
          <text
            x={CENTER}
            y={CENTER + 4}
            textAnchor="middle"
            className="fill-[#26243E] text-[16px] font-medium"
          >
            Person
          </text>
        </motion.g>

        {/* petal labels */}
        {PETALS.map((p, i) => {
          const pt = petalPoint(p.angle, 208);
          const dy = p.name2 ? 0 : 0;
          return (
            <motion.g key={`label-${p.num}`} {...label(i + 1)}>
              <text
                x={pt.x}
                y={pt.y - 12 + dy}
                textAnchor="middle"
                className="fill-[#8785B0] text-[10px]"
              >
                {p.num}
              </text>
              <text
                x={pt.x}
                y={pt.y + 7 + dy}
                textAnchor="middle"
                className="fill-[#3F3D5C] text-[14px] font-medium"
              >
                {p.name}
                {p.name2 && (
                  <tspan x={pt.x} dy="16">
                    {p.name2}
                  </tspan>
                )}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <FigureCaption
        figure="Figure A"
        label="KHOJ"
        className="absolute -bottom-2 right-1 md:right-4"
      />
    </div>
  );
}

export function FlowerSection() {
  return (
    <section
      id="how-khoj-fits"
      aria-labelledby="flower-title"
      className="mx-auto max-w-[1200px] px-5 py-20 md:py-28 lg:py-32"
    >
      <div className="grid items-center gap-14 lg:grid-cols-[0.86fr_1fr] lg:gap-8">
        <Reveal>
          <h2
            id="flower-title"
            className="max-w-[420px] text-balance text-[28px] font-medium leading-[1.16] tracking-[-0.025em] text-ink md:text-[36px]"
          >
            Let evidence power your search
          </h2>
          <p className="mt-5 max-w-[400px] text-pretty text-[16.5px] leading-[1.6] text-body">
            Finding someone should not require hiring an investigator. KHOJ
            connects everything known about a person — sightings, reports,
            records — into one investigation, and shows the evidence behind
            every lead.
          </p>
          <PillButton href="#how-it-works" variant="chip" arrow="upright" className="mt-8">
            See how it works
          </PillButton>
        </Reveal>
        <Reveal delay={0.12}>
          <FigureFlower />
        </Reveal>
      </div>
    </section>
  );
}
