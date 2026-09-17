"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Database,
  Heart,
  Lock,
  Search,
  ShieldCheck,
  UsersRound,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { useRef } from "react";
import {
  ArrowCircle,
  Btn,
  CountUp,
  Logo,
  MaskLine,
  Reveal,
  ScriptNote,
  TrustBadges,
} from "./ui";
import type { View, Navigate } from "@/lib/khoj/router";

/* ───────────────────────────────────────────────────────────────── */

function SiteHeader({ navigate }: { navigate: Navigate }) {
  const links: { label: string; to: View }[] = [
    { label: "Find", to: "auth" },
    { label: "Report", to: "auth" },
    { label: "Support", to: "landing" },
    { label: "About", to: "landing" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-[1200px] items-center justify-between px-6">
        <button onClick={() => navigate("landing")} className="cursor-pointer text-left">
          <Logo />
        </button>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => navigate(l.to)}
              className="link-sweep cursor-pointer text-[13px] font-medium text-ink2 transition-colors hover:text-ink"
            >
              {l.label}
            </button>
          ))}
        </nav>
        <Btn onClick={() => navigate("auth")} className="h-10 px-5 text-[13px]">
          Get Help
        </Btn>
      </div>
    </header>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function Hero({ navigate }: { navigate: Navigate }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 pb-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:pt-6">
        {/* left — headline */}
        <motion.div style={{ opacity: fade }} className="relative z-10">
          <h1 className="display-hero text-[clamp(42px,5.6vw,68px)]">
            <MaskLine delay={0.05}>Because</MaskLine>
            <MaskLine delay={0.14}>every person</MaskLine>
            <MaskLine delay={0.23}>has a place to</MaskLine>
            <MaskLine delay={0.32}>
              <span className="text-rust">belong.</span>
            </MaskLine>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[400px] text-[15px] leading-relaxed text-ink2"
          >
            KHOJ uses AI, open data and community effort to help find missing people
            across India.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            <Btn arrow onClick={() => navigate("auth")}>
              Report a Missing Person
            </Btn>
            <Btn variant="outline" onClick={() => navigate("scan")}>
              I Found Someone
            </Btn>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="mt-10"
          >
            <TrustBadges
              items={[
                { icon: <ShieldCheck size={15} />, label: "Safe" },
                { icon: <UsersRound size={15} />, label: "Trusted" },
                { icon: <UsersRound size={15} />, label: "Community Driven" },
                {
                  icon: <Heart size={15} />,
                  label: (
                    <>
                      For a Safer
                      <br />
                      India
                    </>
                  ),
                },
              ]}
            />
          </motion.div>
        </motion.div>

        {/* right — detective illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <motion.div style={{ y: imgY }} className="relative">
            { }
            <img
              src="/images/khoj-hero-detective.jpg"
              alt="A man in a fedora hat looking over the city"
              className="mx-auto aspect-square w-full max-w-[520px] object-cover [mask-image:radial-gradient(closest-side,black_62%,transparent_100%)]"
            />
            <ScriptNote
              rotate={-5}
              className="absolute right-0 top-[30%] max-w-[190px] text-right text-[21px] lg:-right-2"
            >
              <span className="text-[26px] leading-none">&ldquo;</span>Koi ghum nahin
              hota hamesha.<span className="text-[26px] leading-none">&rdquo;</span>
            </ScriptNote>
            <div className="absolute bottom-1 right-2 text-right text-[9.5px] font-semibold uppercase leading-[1.7] tracking-[0.34em] text-ink3">
              A Safer India
              <br />
              Together
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function StatsBand() {
  return (
    <Reveal>
      <section className="border-y border-line2 bg-paper2">
        <div className="mx-auto grid max-w-[1200px] gap-y-8 px-6 py-12 sm:grid-cols-3 sm:divide-x sm:divide-[rgba(35,32,27,0.1)]">
          <div className="sm:px-8 sm:first:pl-0">
            <div className="font-serif text-[34px] font-medium leading-none text-rust">
              <CountUp to={100000} suffix="+" />
            </div>
            <p className="mt-3 max-w-[220px] text-[12.5px] leading-relaxed text-ink2">
              Missing person cases reported annually in India
            </p>
          </div>
          <div className="sm:px-8">
            <div className="font-serif text-[34px] font-medium leading-none text-rust">
              1 in 3
            </div>
            <p className="mt-3 max-w-[220px] text-[12.5px] leading-relaxed text-ink2">
              are children or senior citizens
            </p>
          </div>
          <div className="sm:px-8">
            <p className="font-serif text-[26px] font-medium leading-[1.25] text-ink">
              But together,
              <br />
              we can change this.
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function TwoWays({ navigate }: { navigate: Navigate }) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="text-center">
        <MaskLine as="h2" className="display-hero mx-auto text-[clamp(30px,3.4vw,40px)]">
          Two ways to make a difference
        </MaskLine>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-4 max-w-[430px] text-[14px] leading-relaxed text-ink2">
            Whether you&rsquo;re looking for a loved one or have found someone who needs
            help, KHOJ is here to guide you.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-12 grid max-w-[900px] gap-6 md:grid-cols-2">
        {[
          {
            bg: "bg-peach",
            icon: <UsersRound size={22} strokeWidth={1.8} className="text-rust" />,
            title: "Report a Missing Person",
            body: "Provide details and let our AI search across databases, news and social media.",
            color: "rust" as const,
            to: "report" as View,
          },
          {
            bg: "bg-sky",
            icon: <UsersRound size={22} strokeWidth={1.8} className="text-blueicon" />,
            title: "I Found Someone",
            body: "Upload a photo and description. We'll help identify and connect them with support.",
            color: "blue" as const,
            to: "scan" as View,
          },
        ].map((c, i) => (
          <Reveal key={c.title} delay={0.1 + i * 0.12}>
            <motion.article
              whileHover={{ y: -5 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={`group flex h-full flex-col rounded-[20px] ${c.bg} p-7 pb-6`}
            >
              <div className="flex size-[52px] items-center justify-center rounded-full bg-card/70">
                {c.icon}
              </div>
              <h3 className="mt-6 font-serif text-[23px] font-medium text-ink">
                {c.title}
              </h3>
              <p className="mt-2.5 max-w-[330px] text-[13.5px] leading-relaxed text-ink2">
                {c.body}
              </p>
              <div className="mt-7 flex justify-end">
                <ArrowCircle color={c.color} onClick={() => navigate(c.to)} label={c.title} />
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function PhotoSplit({ navigate }: { navigate: Navigate }) {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="relative min-h-[340px] overflow-hidden lg:min-h-[440px]">
        { }
        <motion.img
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          src="/images/khoj-varanasi.jpg"
          alt="Elderly man and child at the ghats of Varanasi at sunset"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <ScriptNote
          rotate={-3}
          className="absolute left-7 top-8 max-w-[240px] text-[24px] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]"
        >
          &ldquo;Har kahani ka ek ghar hota hai.&rdquo;
        </ScriptNote>
      </div>
      <div className="flex items-center bg-paper2">
        <div className="mx-auto max-w-[400px] px-8 py-16 lg:px-14">
          <MaskLine as="h3" className="display-hero text-[clamp(26px,2.6vw,32px)]">
            More than technology.
          </MaskLine>
          <MaskLine as="h3" delay={0.1} className="display-hero text-[clamp(26px,2.6vw,32px)]">
            A more compassionate India.
          </MaskLine>
          <Reveal delay={0.2}>
            <p className="mt-5 text-[13.5px] leading-relaxed text-ink2">
              KHOJ works with government databases, NGOs, media sources and citizens to
              bring people home faster.
            </p>
            <button
              onClick={() => navigate("database")}
              className="group mt-7 inline-flex cursor-pointer items-center gap-2 text-[13.5px] font-medium text-ink"
            >
              <span className="link-sweep">Learn how it works</span>
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function DarkInterlude({ navigate }: { navigate: Navigate }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["end end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-night">
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110">
        { }
        <img
          src="/images/khoj-dark-hero.jpg"
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-night/55" />
      </motion.div>

      <div className="relative mx-auto flex min-h-[620px] max-w-[1200px] flex-col justify-center px-6 py-20">
        <div className="max-w-[560px]">
          <h2 className="display-hero text-[clamp(38px,4.6vw,56px)] text-smoke">
            <MaskLine>Still searching.</MaskLine>
            <MaskLine delay={0.12}>Still hoping.</MaskLine>
          </h2>
          <Reveal delay={0.25}>
            <p className="mt-5 max-w-[420px] text-[14px] leading-relaxed text-smoke/70">
              KHOJ uses the power of AI, public data and community to help find missing
              people across India
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Btn variant="cream" arrow onClick={() => navigate("auth")}>
                Report a Missing Person
              </Btn>
              <Btn variant="outlineDark" onClick={() => navigate("scan")}>
                I Found Someone
              </Btn>
            </div>
            <div className="mt-10">
              <TrustBadges
                dark
                items={[
                  { icon: <ShieldCheck size={15} />, label: "Safe" },
                  { icon: <UsersRound size={15} />, label: "Trusted" },
                  { icon: <UsersRound size={15} />, label: "Community Driven" },
                  { icon: <Heart size={15} />, label: "For a Safer India" },
                ]}
              />
            </div>
          </Reveal>
        </div>

        <ScriptNote
          rotate={-4}
          className="absolute bottom-[190px] right-8 hidden max-w-[250px] text-right text-[22px] text-smoke/75 lg:block"
        >
          &ldquo;Kisi ko dhoondna sirf ek kaam nahi, ek zimmedari hai.&rdquo;
        </ScriptNote>

        {/* dark stats */}
        <Reveal delay={0.2}>
          <div className="mt-16 grid gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
            <div className="sm:pr-8">
              <div className="font-serif text-[26px] font-medium text-smoke">
                <CountUp to={100000} suffix="+" />
              </div>
              <p className="mt-1.5 text-[12px] text-smoke/60">
                Missing person cases reported annually in India
              </p>
            </div>
            <div className="sm:px-8">
              <div className="font-serif text-[26px] font-medium text-smoke">1 in 3</div>
              <p className="mt-1.5 text-[12px] text-smoke/60">
                are children or senior citizens
              </p>
            </div>
            <div className="sm:px-8">
              <p className="font-serif text-[22px] font-medium leading-snug text-smoke">
                Together, we can bring them home.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function Features() {
  const items = [
    { icon: <Search size={19} strokeWidth={1.7} />, label: <>AI Powered<br />Search</> },
    { icon: <Database size={19} strokeWidth={1.7} />, label: <>Multi-Source<br />Verification</> },
    { icon: <UsersRound size={19} strokeWidth={1.7} />, label: <>NGO & Police<br />Partnerships</> },
    { icon: <ShieldCheck size={19} strokeWidth={1.7} />, label: <>Community<br />Support</> },
    { icon: <Lock size={19} strokeWidth={1.7} />, label: <>Privacy<br />First</> },
  ];
  return (
    <section className="border-t border-line2 bg-paper">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-10 px-6 py-14 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <div className="flex flex-col items-start gap-3.5 text-ink">
              {it.icon}
              <div className="text-[12.5px] font-medium leading-snug text-ink2">
                {it.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function DarkCTA() {
  return (
    <section className="relative overflow-hidden bg-night">
      <div className="absolute inset-0">
        { }
        <img
          src="/images/khoj-detective-walk.jpg"
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30" />
      </div>
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-20 md:flex-row md:items-center md:justify-between">
        <h2 className="display-hero max-w-[430px] text-[clamp(28px,3vw,36px)] text-smoke">
          <MaskLine>Not just missing people.</MaskLine>
          <MaskLine delay={0.12}>A more connected India.</MaskLine>
        </h2>
        <div className="text-right">
          <div className="font-serif text-[30px] font-semibold tracking-[0.16em] text-smoke">
            KHOJ
          </div>
          <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.4em] text-smoke/50">
            People. Places. Possibilities
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function SiteFooter({ navigate }: { navigate: Navigate }) {
  const socials = [Twitter, Instagram, Youtube, Linkedin];
  return (
    <footer className="border-t border-line2 bg-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-7 px-6 py-9 md:flex-row">
        <Logo size="sm" />
        <nav className="flex items-center gap-7">
          {(["Find", "Report", "Support", "About"] as const).map((l) => (
            <button
              key={l}
              onClick={() => navigate(l === "Find" ? "find" : l === "Report" ? "report" : "landing")}
              className="link-sweep cursor-pointer text-[12.5px] text-ink2 transition-colors hover:text-ink"
            >
              {l}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3.5">
            {socials.map((Icon, i) => (
              <button
                key={i}
                aria-label="Social link"
                className="cursor-pointer text-ink3 transition-all duration-300 hover:-translate-y-0.5 hover:text-ink"
              >
                <Icon size={16} strokeWidth={1.8} />
              </button>
            ))}
          </div>
          <div className="text-right text-[12px] leading-snug text-ink2">
            A Safer India
            <br />
            Together.
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────────────────────────────────────────────── */

export default function Landing({ navigate }: { navigate: Navigate }) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader navigate={navigate} />
      <Hero navigate={navigate} />
      <StatsBand />
      <TwoWays navigate={navigate} />
      <PhotoSplit navigate={navigate} />
      <DarkInterlude navigate={navigate} />
      <Features />
      <DarkCTA />
      <SiteFooter navigate={navigate} />
    </div>
  );
}
