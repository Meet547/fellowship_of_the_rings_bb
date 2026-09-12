"use client";

import { cn } from "@/lib/utils";
import { KhojMark } from "@/components/khoj/primitives";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import * as React from "react";

interface NavItem {
  label: string;
  href: string;
  menu?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "How it works", href: "#how-it-works" },
  {
    label: "Investigate",
    href: "#evidence",
    menu: [
      { label: "Cases", href: "#preview" },
      { label: "Evidence", href: "#evidence" },
      { label: "Timeline", href: "#timeline" },
    ],
  },
  {
    label: "Capabilities",
    href: "#capabilities",
    menu: [
      { label: "Case intake", href: "#capabilities" },
      { label: "Connected search", href: "#capabilities" },
      { label: "Matching", href: "#workflows" },
    ],
  },
  { label: "Technology", href: "#technology" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-linec/80 bg-cream/85 backdrop-blur-md"
          : "border-b border-transparent bg-cream"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between px-5 md:px-10"
      >
        {/* Brand */}
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label="KHOJ home"
        >
          <KhojMark className="h-[26px] w-[26px] text-ink" />
          <span className="text-[14px] font-semibold tracking-[0.26em] text-ink">
            KHOJ
          </span>
        </a>

        {/* Center links (desktop) */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className="group relative">
              <a
                href={item.href}
                className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] text-ink/90 transition-colors hover:bg-ink/[0.045] hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
                aria-haspopup={item.menu ? "true" : undefined}
              >
                {item.label}
                {item.menu && (
                  <ChevronDown
                    className="h-3.5 w-3.5 text-body transition-transform duration-200 group-hover:rotate-180"
                    strokeWidth={2}
                  />
                )}
              </a>
              {item.menu && (
                <div className="invisible absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="rounded-xl border border-linec bg-white p-1.5 shadow-[0_12px_32px_rgba(24,22,35,0.10)]">
                    {item.menu.map((m) => (
                      <a
                        key={m.label}
                        href={m.href}
                        className="block rounded-lg px-3 py-2 text-[14px] text-body transition-colors hover:bg-lav hover:text-ink"
                      >
                        {m.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <a
            href="#final-cta"
            className="hidden rounded-full px-3.5 py-2 text-[15px] text-ink/90 transition-colors hover:bg-ink/[0.045] hover:text-ink sm:block"
          >
            Sign in
          </a>
          <a
            href="#intake"
            className="hidden h-10 items-center rounded-full bg-accent px-4 text-[14.5px] font-medium text-white shadow-[0_1px_2px_rgba(24,22,35,0.18)] transition-colors hover:bg-accent-deep sm:inline-flex"
          >
            Start a search
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.05] lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-linec bg-cream lg:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[16px] font-medium text-ink hover:bg-ink/[0.04]"
                  >
                    {item.label}
                  </a>
                  {item.menu && (
                    <div className="ml-3 border-l border-linec pl-3">
                      {item.menu.map((m) => (
                        <a
                          key={m.label}
                          href={m.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg px-3 py-2 text-[15px] text-body hover:text-ink"
                        >
                          {m.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-3">
                <a
                  href="#intake"
                  onClick={() => setOpen(false)}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-accent text-[15px] font-medium text-white"
                >
                  Start a search
                </a>
                <a
                  href="#final-cta"
                  onClick={() => setOpen(false)}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-linec bg-white text-[15px] font-medium text-ink"
                >
                  Sign in
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
