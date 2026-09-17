"use client";

import { ArrowUpRight, Heart, Instagram, Linkedin, Mail, ShieldCheck, Twitter, Youtube } from "lucide-react";
import { Logo, useToast } from "./ui";
import type { Navigate } from "@/lib/khoj/router";

export default function SiteFooter({ navigate }: { navigate: Navigate }) {
  const toast = useToast();
  const links = [
    { label: "Find a person", action: () => navigate("find") },
    { label: "Report missing", action: () => navigate("report") },
    { label: "Database", action: () => navigate("database") },
    { label: "How it works", action: () => navigate("landing") },
  ];

  return (
    <footer className="relative overflow-hidden bg-night text-smoke">
      <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full border border-smoke/10" />
      <div className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full border border-smoke/10" />
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid gap-12 border-b border-smoke/10 py-14 md:grid-cols-[1.35fr_1fr_1fr_1.1fr] md:gap-8">
          <div>
            <Logo dark size="md" />
            <p className="mt-5 max-w-[290px] text-[13px] leading-relaxed text-smoke/60">
              A trusted, compassionate network helping families find their way back to one another.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-smoke/15 bg-smoke/[0.05] px-3 py-2 text-[10.5px] text-smoke/65">
              <ShieldCheck size={14} className="text-rust" />
              Privacy-first by design
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-smoke/40">Explore</div>
            <nav className="mt-5 space-y-3.5">
              {links.map((link) => (
                <button key={link.label} onClick={link.action} className="group flex items-center gap-1.5 text-[12.5px] text-smoke/70 transition-colors hover:text-smoke">
                  {link.label}
                  <ArrowUpRight size={12} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </button>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-smoke/40">Support</div>
            <div className="mt-5 space-y-3.5 text-[12.5px] text-smoke/70">
              <button onClick={() => toast("Emergency support: please call 112.")} className="block transition-colors hover:text-smoke">Emergency help · 112</button>
              <button onClick={() => toast("Support resources will be available through our verified network.")} className="block transition-colors hover:text-smoke">Support resources</button>
              <button onClick={() => toast("Write to hello@khoj.org")} className="flex items-center gap-2 transition-colors hover:text-smoke"><Mail size={13} /> hello@khoj.org</button>
            </div>
          </div>

          <div className="rounded-[18px] border border-smoke/10 bg-smoke/[0.05] p-5">
            <div className="flex items-center gap-2 text-[12px] font-medium text-smoke">
              <Heart size={14} className="text-rust" fill="currentColor" />
              Help make a difference
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-smoke/55">
              Every report, share and search gives someone a better chance of coming home.
            </p>
            <button onClick={() => navigate("report")} className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-smoke transition-colors hover:text-rust">
              Start a report <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 py-6 text-[11px] text-smoke/40 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} KHOJ. Built for a safer India.</div>
          <div className="flex flex-wrap items-center gap-5">
            <button onClick={() => toast("Privacy policy details will be available before launch.")} className="hover:text-smoke/70">Privacy</button>
            <button onClick={() => toast("Terms of use will be available before launch.")} className="hover:text-smoke/70">Terms</button>
            <div className="flex items-center gap-3.5 text-smoke/45">
              <button aria-label="KHOJ on Twitter" onClick={() => toast("Social channels will be available soon.")} className="hover:text-smoke"><Twitter size={14} /></button>
              <button aria-label="KHOJ on Instagram" onClick={() => toast("Social channels will be available soon.")} className="hover:text-smoke"><Instagram size={14} /></button>
              <button aria-label="KHOJ on YouTube" onClick={() => toast("Social channels will be available soon.")} className="hover:text-smoke"><Youtube size={14} /></button>
              <button aria-label="KHOJ on LinkedIn" onClick={() => toast("Social channels will be available soon.")} className="hover:text-smoke"><Linkedin size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
