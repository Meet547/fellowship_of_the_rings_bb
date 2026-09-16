"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Heart,
  Instagram,
  Layers,
  Linkedin,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon, HandNote, Logo, PillButton, Reveal } from "./shared";
import { useKhoj } from "@/lib/khoj/store";

const NAV = [
  { label: "Find Someone", view: "signin" as const },
  { label: "I Found Someone", view: "found" as const },
  { label: "Resources", view: "resources" as const },
  { label: "How It Works", anchor: "how" },
  { label: "About", anchor: "about" },
];

const STEPS = [
  {
    no: "01",
    title: "Share Information",
    desc: "Tell us what you know — text, voice or photo. You don't need to know everything.",
    icon: FileText,
  },
  {
    no: "02",
    title: "Khoj Investigates",
    desc: "We search across government databases, NGOs and public sources using advanced tools.",
    icon: Layers,
  },
  {
    no: "03",
    title: "Get Possible Matches",
    desc: "We show you relevant, verified results with source details.",
    icon: Search,
  },
  {
    no: "04",
    title: "Take the Next Step",
    desc: "Connect with authorities or support organisations to move forward.",
    icon: Users,
  },
];

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const dur = 1400;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const navigate = useKhoj((s) => s.navigate);
  const user = useKhoj((s) => s.user);

  const goSearch = () => navigate(user ? "find" : "signup");
  const goFound = () => navigate(user ? "found" : "signin");

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ================= Header ================= */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() =>
                  n.anchor
                    ? document
                        .getElementById(n.anchor)
                        ?.scrollIntoView({ behavior: "smooth" })
                    : navigate(n.view!)
                }
                className="text-[13.5px] font-medium text-ink-2 transition-colors hover:text-ink"
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            {user ? (
              <PillButton onClick={() => navigate("dashboard")} className="px-5 py-2.5">
                Open Dashboard
              </PillButton>
            ) : (
              <>
                <button
                  onClick={() => navigate("search")}
                  aria-label="Search"
                  className="hidden h-9 w-9 place-items-center rounded-full transition-colors hover:bg-black/[0.05] sm:grid"
                >
                  <Search className="h-4 w-4 text-ink-2" strokeWidth={1.8} />
                </button>
                <PillButton
                  onClick={() => navigate("signin")}
                  className="px-5 py-2.5 hidden sm:inline-flex"
                >
                  Report a Case
                </PillButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden" id="about">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-16 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-6 lg:px-8 lg:pb-24 lg:pt-16">
          {/* Left copy */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-ink-2"
            >
              A SAFER, MORE CONNECTED INDIA
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mt-6 text-[44px] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[58px] lg:text-[64px]"
            >
              Because
              <br />
              everyone belongs
              <br />
              <span className="text-ink-faint">somewhere.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 max-w-[420px] text-[15px] leading-relaxed text-ink-soft"
            >
              Khoj helps families, citizens, NGOs and authorities find missing
              people and reunite lives.
            </motion.p>

            {/* Action cards */}
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.26 }}
                whileHover={{ y: -4 }}
                onClick={goSearch}
                className="group relative overflow-hidden rounded-[22px] bg-ink p-5 text-left text-[#f4f2ee] shadow-[0_24px_48px_-24px_rgba(20,19,17,0.55)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-white/15">
                  <Search className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <span className="mt-8 block text-[15.5px] font-semibold">
                  I&apos;m looking for someone
                </span>
                <span className="mt-1 block text-[12.5px] text-white/60">
                  Search for a missing person
                </span>
                <span className="absolute bottom-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-all duration-300 group-hover:bg-[#f4f2ee] group-hover:text-ink">
                  <ArrowIcon />
                </span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.34 }}
                whileHover={{ y: -4 }}
                onClick={goFound}
                className="group relative overflow-hidden rounded-[22px] border border-line-2 bg-white/80 p-5 text-left shadow-[0_18px_40px_-28px_rgba(20,19,17,0.35)] hover:border-ink/30"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06] transition-colors group-hover:bg-ink/10">
                  <Plus className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <span className="mt-8 block text-[15.5px] font-semibold">
                  I found someone
                </span>
                <span className="mt-1 block text-[12.5px] text-ink-soft">
                  Help identify or reunite a person
                </span>
                <span className="absolute bottom-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-ink/[0.06] transition-all duration-300 group-hover:bg-ink group-hover:text-[#f4f2ee]">
                  <ArrowIcon />
                </span>
              </motion.button>
            </div>
          </div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.21, 0.65, 0.35, 1] }}
            className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[480px] lg:h-[560px]"
          >
            {/* breathing circles */}
            <div className="animate-breathe absolute right-[-40px] top-[-30px] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-white to-[#e8e4dc] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:h-[380px] sm:w-[380px]" />
            <div className="animate-breathe absolute bottom-[60px] left-[-10px] h-[200px] w-[200px] rounded-full bg-gradient-to-tl from-white/80 to-transparent sm:h-[240px] sm:w-[240px]" style={{ animationDelay: "-3.5s" }} />

            {/* hero image */}
            <div className="khoj-grain absolute bottom-0 left-1/2 h-[88%] w-[78%] -translate-x-1/2 overflow-hidden rounded-b-[120px] rounded-t-[999px]">
              { }
              <img
                src="/images/hero-boy.jpg"
                alt="A young boy gazing over the city, thinking of home"
                className="h-full w-full object-cover"
              />
            </div>

            {/* handwritten note in circle */}
            <div className="absolute left-[6%] top-[24%] hidden h-[150px] w-[150px] place-items-center rounded-full border border-ink/10 bg-white/85 shadow-sm backdrop-blur-sm sm:grid">
              <HandNote rotate={-8} size={21}>
                People find
                <br />
                people.
              </HandNote>
            </div>

            {/* vertical text */}
            <div className="vertical-rl absolute right-[2%] top-[16%] hidden text-[10.5px] font-semibold tracking-[0.34em] text-ink-faint lg:block">
              A BRIGHTER TOMORROW TOGETHER
            </div>
          </motion.div>
        </div>

        {/* ================= Stats ================= */}
        <div className="border-y border-line/70 bg-paper/60">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-y-8 px-5 py-9 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_0.8fr_1.1fr_auto] lg:px-8">
            {[
              { v: 120000, s: "+", label: "Families supported" },
              { v: 20, s: "+", label: "Government & NGO sources" },
              { v: 28, s: "", label: "States & UTs" },
            ].map((st, i) => (
              <Reveal key={st.label} delay={i * 0.08} className="pr-6">
                <div className="text-[26px] font-semibold tracking-tight sm:text-[30px]">
                  <CountUp to={st.v} suffix={st.s} />
                </div>
                <div className="mt-1 text-[12.5px] text-ink-soft">{st.label}</div>
              </Reveal>
            ))}
            <Reveal delay={0.24} className="pr-6">
              <div className="text-[26px] font-semibold leading-[1.15] tracking-tight sm:text-[30px]">
                Real People
                <br />
                <span className="text-[19px] font-medium text-ink-2 sm:text-[21px]">
                  Real Reunions
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.3} className="hidden lg:block">
              <div className="vertical-rl h-full text-[10px] font-semibold tracking-[0.3em] text-ink-faint" style={{ writingMode: "vertical-rl" }}>
                <span className="block max-h-[120px]">TECHNOLOGY&nbsp;&nbsp;PEOPLE&nbsp;&nbsp;COMPASSION</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= How it works ================= */}
      <section id="how" className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <div className="text-[11px] font-semibold tracking-[0.22em] text-ink-faint">
              HOW KHOJ WORKS
            </div>
            <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.025em] sm:text-[40px]">
              From information to reunions.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-center gap-6">
            <p className="max-w-[240px] text-[13px] leading-relaxed text-ink-soft">
              A simple process. A powerful network. A stronger India.
            </p>
            <PillButton variant="light" className="px-5 py-2.5" icon={<ArrowIcon />}>
              Learn more
            </PillButton>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.no} delay={i * 0.09}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group relative flex h-full min-h-[230px] flex-col rounded-[20px] border border-line bg-white/70 p-6 transition-colors hover:border-ink/25"
              >
                <div className="text-[12px] font-medium text-ink-faint">{step.no}</div>
                <h3 className="mt-4 text-[17px] font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">
                  {step.desc}
                </p>
                <div className="mt-auto pt-6">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.05] text-ink transition-colors group-hover:bg-ink group-hover:text-[#f4f2ee]">
                    <step.icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    className="absolute -right-[13px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-faint xl:block"
                    aria-hidden
                  />
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= You're not alone ================= */}
      <section className="mx-auto max-w-[1240px] px-5 pb-16 lg:px-8 lg:pb-24">
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <div className="khoj-grain relative overflow-hidden rounded-[24px] shadow-[0_30px_60px_-30px_rgba(20,19,17,0.45)]">
              { }
              <img
                src="/images/sunset-city.jpg"
                alt="Golden sunset over the city of Mumbai"
                className="h-[300px] w-full object-cover transition-transform duration-[2.5s] ease-out hover:scale-[1.04] sm:h-[380px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6 pt-16 text-[#f4f2ee]">
                <div className="text-[16px] font-medium leading-snug">
                  Real people.
                  <br />
                  Real reunions.
                </div>
                <div className="mt-3 text-right text-[10px] font-semibold tracking-[0.28em] text-white/70">
                  MUMBAI, INDIA
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="text-[11px] font-semibold tracking-[0.22em] text-ink-faint">
              A STRONGER TOMORROW
            </div>
            <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.025em] sm:text-[40px]">
              You&apos;re not alone.
            </h2>
            <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-ink-soft">
              Whether you&apos;re searching for a loved one or helping someone in
              need, Khoj is here to support you with trusted information, real
              connections and hope.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PillButton className="px-6 py-3" icon={<ArrowIcon />}>
                Get Help Now
              </PillButton>
              <PillButton variant="light" className="px-6 py-3" icon={<Play className="h-3.5 w-3.5 fill-current" />}>
                Watch Our Story
              </PillButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Trusted by ================= */}
      <section className="border-t border-line/70">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-10 gap-y-8 px-5 py-12 lg:px-8">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-ink-faint">
            TRUSTED&nbsp;BY
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-6">
            {[
              { icon: BadgeCheck, label: "Government of India" },
              { icon: ShieldCheck, label: "State Police Portals" },
              { icon: Users, label: "NGOs & Shelters" },
              { icon: Heart, label: "Community Partners" },
            ].map((t, i) => (
              <Reveal key={t.label} delay={i * 0.07}>
                <div className="flex items-center gap-2.5 text-ink-2">
                  <t.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  <span className="text-[13.5px] font-medium">{t.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="vertical-rl hidden h-[92px] text-[10px] font-semibold leading-[1.9] tracking-[0.28em] text-ink-faint md:block">
              A KINDER SAFER MORE CONNECTED INDIA
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-line/70 bg-paper">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-5 py-8 lg:px-8">
          <Logo size="sm" />
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Footer">
            {["About", "Privacy", "Contact", "For NGOs", "For Authorities"].map(
              (l) => (
                <button
                  key={l}
                  onClick={() =>
                    document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-[12.5px] text-ink-soft transition-colors hover:text-ink"
                >
                  {l}
                </button>
              )
            )}
          </nav>
          <div className="flex items-center gap-4 text-ink-soft">
            <Twitter className="h-4 w-4 cursor-pointer transition-colors hover:text-ink" aria-label="X" />
            <Instagram className="h-4 w-4 cursor-pointer transition-colors hover:text-ink" aria-label="Instagram" />
            <Linkedin className="h-4 w-4 cursor-pointer transition-colors hover:text-ink" aria-label="LinkedIn" />
            <Youtube className="h-4 w-4 cursor-pointer transition-colors hover:text-ink" aria-label="YouTube" />
          </div>
        </div>
      </footer>
    </div>
  );
}
