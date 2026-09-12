import { TECH_STACK } from "@/lib/demo-data";
import { Reveal } from "@/components/khoj/reveal";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  "Built to investigate at scale." — deliberately understated, per brief.    */
/*  Occupies the reference's large-table slot (pricing) with a spec-sheet       */
/*  instead: KHOJ has no pricing to sell.                                      */
/* -------------------------------------------------------------------------- */

export function TechnologySection() {
  return (
    <section
      id="technology"
      aria-labelledby="technology-title"
      className="scroll-mt-20 bg-cream pb-20 md:pb-28"
    >
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <h2
            id="technology-title"
            className="mx-auto max-w-[620px] text-balance text-center text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-ink md:text-[40px]"
          >
            Built to investigate at scale.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-center text-[16.5px] leading-[1.55] text-body">
            Under the hood, KHOJ runs on AWS — designed to stay fast and
            reliable as searches grow.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-[980px] overflow-hidden rounded-[16px] border border-linec bg-surface shadow-[0_20px_48px_-20px_rgba(24,22,35,0.12)]">
            <div className="flex items-center justify-between border-b border-linec px-6 py-4 md:px-8">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-faint">
                Technology
              </p>
              <p className="text-[11.5px] text-faint">
                Public &amp; authorized sources only
              </p>
            </div>
            <ul>
              {TECH_STACK.map((t, i) => (
                <li
                  key={t.name}
                  className={
                    "grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-[15px] md:grid-cols-[280px_1fr_auto] md:px-8 " +
                    (i > 0 ? "border-t border-linec/80" : "")
                  }
                >
                  <span className="text-[12.5px] font-semibold tracking-[0.12em] text-ink">
                    {t.name}
                  </span>
                  <span className="hidden text-[14px] text-body md:block">
                    {t.role}
                  </span>
                  <span className="text-[13px] text-body md:hidden">
                    {t.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
