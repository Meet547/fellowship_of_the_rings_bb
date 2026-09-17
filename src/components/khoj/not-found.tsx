"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass, Search } from "lucide-react";
import { Btn, Logo } from "./ui";
import type { Navigate } from "@/lib/khoj/router";

export default function NotFoundView({ navigate }: { navigate: Navigate }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[520px] text-center">
        <Logo size="lg" />
        <div className="mx-auto mt-12 flex size-24 items-center justify-center rounded-full bg-peach text-rust"><Compass size={42} strokeWidth={1.5} /></div>
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-rust">404 · Page not found</p>
        <h1 className="mt-3 font-serif text-[clamp(32px,5vw,48px)] font-medium text-ink">This trail went quiet.</h1>
        <p className="mx-auto mt-4 max-w-[390px] text-[14px] leading-relaxed text-ink2">The page you&rsquo;re looking for may have moved, or the link may be incomplete.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Btn variant="outline" onClick={() => navigate("landing")}><ArrowLeft size={14} /> Go back</Btn>
          <Btn onClick={() => navigate("landing")}><Search size={14} /> Go to KHOJ</Btn>
        </div>
      </motion.section>
    </main>
  );
}
