import { FOOTER_GROUPS, FOOTNOTES } from "@/lib/demo-data";
import { KhojMark } from "@/components/khoj/primitives";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Footer — mirrors the reference's dark footer: link groups, divider,        */
/*  disclaimers & footnotes. No fabricated contact details or social links.    */
/* -------------------------------------------------------------------------- */

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1360px] px-5 pb-10 pt-16 md:px-10 md:pt-20">
        {/* brand */}
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2.5">
            <KhojMark className="h-7 w-7 text-white" />
            <span className="text-[15px] font-semibold tracking-[0.26em] text-white">
              KHOJ
            </span>
          </span>
          <p className="text-[14.5px] text-white/60">
            Find someone. Follow the evidence.
          </p>
        </div>

        {/* link groups */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-[13px] text-white/45">{group.title}</p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-[15px] text-white/90 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="mt-16 border-white/12" />

        {/* disclaimers & footnotes */}
        <div className="mt-10 grid gap-8 md:grid-cols-[220px_1fr]">
          <p className="text-[13.5px] text-white/45">
            Disclaimers and footnotes
          </p>
          <div className="space-y-4">
            {FOOTNOTES.map((note, i) => (
              <p
                key={i}
                className="max-w-[760px] text-[13px] leading-relaxed text-white/55"
              >
                {i + 1}. {note}
              </p>
            ))}
          </div>
        </div>

        {/* bottom line */}
        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KHOJ</p>
          <p>Every lead includes its evidence.</p>
        </div>
      </div>
    </footer>
  );
}
