import { PillButton } from "@/components/khoj/primitives";
import { Reveal } from "@/components/khoj/reveal";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Final CTA — mirrors the reference's quiet centered close.                  */
/* -------------------------------------------------------------------------- */

export function FinalCTA() {
  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-title"
      className="scroll-mt-20 bg-cream px-5 pb-28 pt-8 md:pb-36"
    >
      <Reveal className="mx-auto max-w-[820px] text-center">
        <h2
          id="final-cta-title"
          className="text-balance text-[34px] font-medium leading-[1.1] tracking-[-0.03em] text-ink md:text-[52px]"
        >
          Someone is missing.
          <br />
          Start with what you know.
        </h2>
        <p className="mx-auto mt-5 max-w-[520px] text-balance text-[17px] leading-[1.55] text-body">
          KHOJ helps turn scattered information into potential leads, with the
          evidence behind them.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PillButton href="/signin" className="h-12 px-6">
            Start a search
          </PillButton>
          <PillButton href="/signin" variant="outline" arrow="none" className="h-12 px-6">
            I already have a case
          </PillButton>
        </div>
      </Reveal>
    </section>
  );
}
