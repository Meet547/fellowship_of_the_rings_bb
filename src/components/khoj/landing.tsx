"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Heart,
  Instagram,
  Layers,
  Linkedin,
  Plus,
  Search,
  ShieldCheck,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowIcon,
  Asterisk,
  Button,
  EASE,
  Eyebrow,
  HandNote,
  Logo,
  Marquee,
  MaskLines,
  MaskLinesOnMount,
  Reveal,
} from "./shared";
import { useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

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
    title: "Share information",
    desc: "Tell us what you know — text, voice or photo. You don't need to know everything.",
    icon: FileText,
  },
  {
    no: "02",
    title: "Khoj investigates",
    desc: "We search across government databases, NGOs and public sources using advanced tools.",
    icon: Layers,
  },
  {
    no: "03",
    title: "Get possible matches",
    desc: "We show you relevant, verified results with source details.",
    icon: Search,
  },
  {
    no: "04",
    title: "Take the next step",
    desc: "Connect with authorities or support organisations to move forward.",
    icon: Users,
  },
];

const FOOTER_LINKS = ["About", "Privacy", "Contact", "For NGOs", "For Authorities"];

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
          const dur = 1800;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 4);
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
    <span ref={ref} className="tabular">
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ---------------- Header — hides on scroll down ---------------- */

function Header() {
  const navigate = useKhoj((s) => s.navigate);
  const user = useKhoj((s) => s.user);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prev = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
    if (menuOpen) return setHidden(false);
    if (y > prev.current && y > 140) setHidden(true);
    else setHidden(false);
    prev.current = y;
  });

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-500",
          scrolled ? "border-b border-line bg-paper/90 backdrop-blur-md" : "border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-6 lg:px-10">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() =>
                  n.anchor
                    ? document.getElementById(n.anchor)?.scrollIntoView({ behavior: "smooth" })
                    : navigate(n.view!)
                }
                className="link-sweep micro !text-[10px] text-ink-2 hover:text-ink"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Button onClick={() => navigate("dashboard")} magnetic>
                Open Dashboard
              </Button>
            ) : (
              <>
                <button
                  onClick={() => navigate("search")}
                  aria-label="Search"
                  className="hidden h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink sm:grid"
                >
                  <Search className="h-4 w-4" strokeWidth={1.7} />
                </button>
                <Button
                  onClick={() => navigate("signin")}
                  className="hidden sm:inline-flex"
                  magnetic
                >
                  Report a Case
                </Button>
              </>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 lg:hidden"
            >
              <span className="flex flex-col gap-[5px]">
                <span className={cn("block h-px w-4 bg-ink transition-transform duration-300", menuOpen && "translate-y-[3px] rotate-45")} />
                <span className={cn("block h-px w-4 bg-ink transition-transform duration-300", menuOpen && "-translate-y-[3px] -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-30 flex flex-col justify-center bg-paper px-8 lg:hidden"
          >
            {NAV.map((n, i) => (
              <motion.button
                key={n.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: EASE }}
                onClick={() => {
                  setMenuOpen(false);
                  if (n.anchor)
                    document.getElementById(n.anchor)?.scrollIntoView({ behavior: "smooth" });
                  else navigate(n.view!);
                }}
                className="border-b border-line py-5 text-left font-display text-[34px] leading-tight text-ink"
              >
                {n.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- Landing ---------------- */

export default function Landing() {
  const navigate = useKhoj((s) => s.navigate);
  const user = useKhoj((s) => s.user);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const ornY = useTransform(scrollYProgress, [0, 1], [0, -56]);

  const goSearch = () => navigate(user ? "find" : "signup");
  const goFound = () => navigate(user ? "found" : "signin");

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />

      {/* ================= Hero ================= */}
      <section ref={heroRef} id="about" className="relative overflow-hidden pt-[68px]">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="grid items-end gap-12 pb-14 pt-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8 lg:pb-20 lg:pt-20">
            {/* — Copy — */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Eyebrow index="01">Missing Persons Network — India</Eyebrow>
              </motion.div>

              <MaskLinesOnMount
                as="h1"
                delay={0.15}
                className="display-xl mt-7 text-[clamp(48px,6.4vw,92px)] text-ink"
                lines={[
                  <>Because everyone</>,
                  <>
                    belongs <em className="text-ink-soft">somewhere.</em>
                  </>,
                ]}
              />

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                className="mt-7 max-w-[400px] text-[15px] leading-[1.7] text-ink-soft"
              >
                Khoj helps families, citizens, NGOs and authorities find missing
                people and reunite lives — with technology that works quietly in
                the background.
              </motion.p>

              {/* Action rows — fill-sweep on hover */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.62, ease: EASE }}
                className="mt-11 border-y border-ink/15"
              >
                {[
                  {
                    no: "A",
                    title: "I'm looking for someone",
                    sub: "Search for a missing person",
                    onClick: goSearch,
                    icon: Search,
                  },
                  {
                    no: "B",
                    title: "I found someone",
                    sub: "Help identify or reunite a person",
                    onClick: goFound,
                    icon: Plus,
                  },
                ].map((a) => (
                  <button
                    key={a.no}
                    onClick={a.onClick}
                    className="fill-sweep group flex w-full items-center gap-5 border-b border-ink/15 px-1 py-5 text-left last:border-b-0 sm:px-3"
                  >
                    <span className="micro w-5 text-ink-faint transition-colors duration-300 group-hover:text-paper/60">
                      {a.no}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-medium tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:text-paper">
                        {a.title}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-ink-faint transition-colors duration-300 group-hover:text-paper/60">
                        {a.sub}
                      </span>
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/20 text-ink transition-colors duration-300 group-hover:border-paper/40 group-hover:text-paper">
                      <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* — Visual — */}
            <div className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[520px] lg:h-[620px]">
              {/* flat hairline ornaments */}
              <motion.div
                style={{ y: ornY }}
                className="absolute right-[4%] top-[2%] hidden h-[300px] w-[300px] rounded-full border border-ink/10 sm:block"
                aria-hidden
              />
              <motion.div
                style={{ y: ornY }}
                className="absolute bottom-[8%] left-[-2%] hidden h-[130px] w-[130px] rounded-full border border-ink/10 sm:block"
                aria-hidden
              />

              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 1.2, delay: 0.25, ease: [0.76, 0, 0.24, 1] }}
                className="khoj-grain absolute bottom-0 left-1/2 h-[86%] w-[76%] -translate-x-1/2 overflow-hidden rounded-b-[140px] rounded-t-[999px]"
              >
                <motion.img
                  style={{ y: imgY }}
                  src="/images/hero-boy.jpg"
                  alt="A young boy gazing over the city, thinking of home"
                  className="h-[112%] w-full object-cover"
                />
              </motion.div>

              {/* handwritten badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
                className="absolute left-[2%] top-[20%] hidden h-[148px] w-[148px] place-items-center rounded-full border border-ink/10 bg-paper-2 sm:grid"
              >
                <HandNote rotate={-8} size={21}>
                  People find
                  <br />
                  people.
                </HandNote>
              </motion.div>

              {/* vertical caption */}
              <div className="vertical-rl absolute right-[1%] top-[14%] hidden text-[10px] font-medium uppercase tracking-[0.32em] text-ink-faint lg:block">
                A brighter tomorrow together
              </div>

              {/* fig caption */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="absolute bottom-[-4px] left-1/2 flex w-[76%] -translate-x-1/2 items-center justify-between"
              >
                <span className="micro !text-[9px] text-ink-faint">Fig. 01 — Someone is waiting</span>
                <Asterisk className="h-3 w-3 animate-spin-slow text-ink/40" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ================= Marquee ================= */}
        <div className="border-y border-ink/12 py-3.5">
          <Marquee
            itemClassName="micro !text-[10px] text-ink-2"
            items={[
              "Real people",
              "Real reunions",
              "19,000+ families supported",
              "28 states & union territories",
              "Government & NGO network",
              "Technology — People — Compassion",
            ]}
          />
        </div>

        {/* ================= Stats ================= */}
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { v: 120000, s: "+", label: "Families supported" },
              { v: 20, s: "+", label: "Government & NGO sources" },
              { v: 28, s: "", label: "States & UTs covered" },
              { v: 4600, s: "+", label: "Reunions facilitated" },
            ].map((st, i) => (
              <Reveal key={st.label} delay={i * 0.08} className="border-l border-ink/12 pl-5 lg:pl-7">
                <div className="font-mono text-[30px] font-medium leading-none tracking-[-0.02em] text-ink sm:text-[38px]">
                  <CountUp to={st.v} suffix={st.s} />
                </div>
                <div className="mt-3 text-[12.5px] text-ink-soft">{st.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= How it works ================= */}
      <section id="how" className="border-t border-ink/12">
        <div className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Reveal>
              <Eyebrow index="02">How Khoj works</Eyebrow>
              <MaskLines
                as="h2"
                className="display-xl mt-6 text-[clamp(36px,4.4vw,60px)]"
                lines={[<>From information</>, <>to reunions.</>]}
              />
            </Reveal>
            <Reveal delay={0.12} className="max-w-[300px]">
              <p className="text-[13.5px] leading-[1.7] text-ink-soft">
                A simple process. A powerful network. Four steps between you and
                the answers you need.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-y-12 md:grid-cols-2 md:gap-x-10 xl:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.no} delay={i * 0.09}>
                <div className="group relative border-t border-ink/15 pt-6 md:h-full">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[12px] text-ink-faint transition-colors duration-300 group-hover:text-ink">
                      /{step.no}
                    </span>
                    <step.icon
                      className="h-[18px] w-[18px] text-ink-2 transition-colors duration-300 group-hover:text-ink"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="mt-14 text-[17px] font-medium tracking-[-0.01em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-[250px] text-[13px] leading-[1.65] text-ink-soft">
                    {step.desc}
                  </p>
                  <span className="mt-6 block h-px w-0 bg-ink transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= You're not alone ================= */}
      <section className="border-t border-ink/12">
        <div className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <Reveal>
              <Eyebrow index="03">A stronger tomorrow</Eyebrow>
              <MaskLines
                as="h2"
                className="display-xl mt-6 text-[clamp(36px,4.4vw,60px)]"
                lines={[<>You&apos;re not</>, <>
                    alone. <em className="text-ink-soft">Ever.</em>
                  </>]}
              />
              <p className="mt-7 max-w-[440px] text-[15px] leading-[1.7] text-ink-soft">
                Whether you&apos;re searching for a loved one or helping someone in
                need, Khoj is here — with trusted information, real connections
                and people who have done this before.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3.5">
                <Button onClick={() => navigate(user ? "find" : "signup")} magnetic icon={<ArrowIcon />}>
                  Get help now
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                  magnetic
                >
                  Watch our story
                </Button>
              </div>

              <div className="mt-14 border-t border-ink/12 pt-6">
                <HandNote rotate={-2} size={24} className="text-ink-2">
                  &ldquo;Every small lead can change a life.&rdquo;
                </HandNote>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="frame-zoom khoj-grain relative overflow-hidden">
                <img
                  src="/images/sunset-city.jpg"
                  alt="Golden sunset over the city of Mumbai"
                  className="h-[320px] w-full object-cover sm:h-[440px]"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-6 pt-20 text-paper">
                  <span className="text-[15px] font-medium leading-snug">
                    Real people.
                    <br />
                    Real reunions.
                  </span>
                  <span className="micro !text-[9px] text-paper/70">Mumbai, India</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= Trusted by ================= */}
      <section className="border-t border-ink/12">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-12 gap-y-7 px-6 py-12 lg:px-10">
          <div className="micro text-ink-faint">Trusted by</div>
          <div className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-5">
            {[
              { icon: BadgeCheck, label: "Government of India" },
              { icon: ShieldCheck, label: "State Police Portals" },
              { icon: Users, label: "NGOs & Shelters" },
              { icon: Heart, label: "Community Partners" },
            ].map((t, i) => (
              <Reveal key={t.label} delay={i * 0.07} y={12}>
                <div className="flex items-center gap-2.5 text-ink-2 transition-colors duration-300 hover:text-ink">
                  <t.icon className="h-[17px] w-[17px]" strokeWidth={1.5} />
                  <span className="text-[13px] font-medium">{t.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-ink/12 bg-paper">
        <div className="mx-auto max-w-[1320px] px-6 pb-8 pt-16 lg:px-10">
          <div className="grid gap-12 pb-20 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <Logo size="lg" tagline={false} />
              <p className="mt-5 max-w-[280px] text-[13px] leading-[1.7] text-ink-soft">
                Because everyone belongs somewhere. A public-interest initiative
                to reunite families across India.
              </p>
              <div className="mt-7 flex items-center gap-4 text-ink-soft">
                {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                  <button
                    key={i}
                    aria-label="Social link"
                    className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    <Icon className="h-[15px] w-[15px]" strokeWidth={1.6} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="micro text-ink-faint">Navigate</div>
              <div className="mt-5 flex flex-col items-start gap-3">
                {FOOTER_LINKS.map((l) => (
                  <button
                    key={l}
                    onClick={() =>
                      document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="link-sweep text-[13.5px] text-ink-2 hover:text-ink"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="micro text-ink-faint">Emergency</div>
              <div className="mt-5 flex flex-col items-start gap-3 text-[13.5px] text-ink-2">
                <span className="tabular">Police — 112</span>
                <span className="tabular">Childline — 1098</span>
                <span className="tabular">Missing — 1094</span>
                <span className="tabular">Women — 1091</span>
              </div>
            </div>
          </div>

          {/* Giant wordmark */}
          <div className="select-none overflow-hidden border-t border-ink/12 pt-10" aria-hidden>
            <MaskLines
              as="div"
              className="display-xl text-center text-[clamp(90px,17vw,240px)] leading-[0.85] text-ink/[0.92]"
              lines={[<>KHOJ<sup className="text-[0.22em] align-super">®</sup></>]}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink/12 pt-6">
            <span className="micro !text-[9px] text-ink-faint">© 2026 Khoj — Made for Bharat</span>
            <span className="micro !text-[9px] text-ink-faint">People. Connected.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
