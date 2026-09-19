"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/* ───────────────────────────────────────────────────────────────── */
/*  Logo                                                            */
/* ───────────────────────────────────────────────────────────────── */

export function Logo({
  dark = false,
  tagline = true,
  size = "md",
}: {
  dark?: boolean;
  tagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const s =
    size === "lg" ? "text-[34px]" : size === "sm" ? "text-[21px]" : "text-[25px]";
  return (
    <div className="select-none leading-none">
      <div
        className={`font-serif font-semibold tracking-[0.14em] ${s} ${
          dark ? "text-smoke" : "text-ink"
        }`}
      >
        KHOJ
      </div>
      {tagline && (
        <div
          className={`mt-[5px] text-[10px] tracking-[0.01em] ${
            dark ? "text-smoke/50" : "text-ink2"
          }`}
        >
          People. Places. Possibilities.
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/*  Buttons                                                         */
/* ───────────────────────────────────────────────────────────────── */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "dark" | "outline" | "outlineDark" | "light" | "ghost" | "green" | "cream";
  arrow?: boolean;
};

export function Btn({
  variant = "dark",
  arrow = false,
  className = "",
  children,
  ...rest
}: BtnProps) {
  const base =
    "group/btn inline-flex items-center justify-center gap-2.5 h-11 whitespace-nowrap px-5 rounded-[10px] text-[13.5px] font-medium tracking-[-0.005em] transition-all duration-300 ease-out disabled:opacity-50 cursor-pointer";
  const styles = {
    dark: "bg-ink text-paper2 hover:bg-rustdeep hover:shadow-[0_10px_24px_-10px_rgba(35,32,27,0.45)] active:scale-[0.985]",
    outline:
      "border border-ink/20 bg-transparent text-ink hover:border-ink/45 hover:bg-card active:scale-[0.985]",
    outlineDark:
      "border border-smoke/40 bg-transparent text-smoke hover:border-smoke/75 hover:bg-white/5 active:scale-[0.985]",
    light:
      "bg-card border border-ink/10 text-ink hover:border-ink/30 hover:shadow-[0_10px_24px_-14px_rgba(35,32,27,0.35)] active:scale-[0.985]",
    ghost: "text-ink2 hover:text-ink",
    cream:
      "bg-smoke text-ink hover:bg-paper2 hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] active:scale-[0.985]",
    green:
      "border border-badgegt/35 text-badgegt bg-transparent hover:bg-badgeg/40 active:scale-[0.985]",
  }[variant];
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      <span className="relative">{children}</span>
      {arrow && (
        <ArrowRight
          size={15}
          strokeWidth={2}
          className="transition-transform duration-300 ease-out group-hover/btn:translate-x-1"
        />
      )}
    </button>
  );
}

/** Circular arrow button used on peach/blue/green cards */
export function ArrowCircle({
  color = "rust",
  onClick,
  className = "",
  label,
}: {
  color?: "rust" | "blue" | "green" | "ink";
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  const bg = {
    rust: "bg-rust",
    blue: "bg-blueicon",
    green: "bg-greenicon",
    ink: "bg-ink",
  }[color];
  return (
    <button
      aria-label={label ?? "Continue"}
      onClick={onClick}
      className={`group/ac relative flex size-10 shrink-0 items-center justify-center rounded-full text-paper2 transition-all duration-300 ease-out hover:scale-[1.06] active:scale-95 cursor-pointer ${bg} ${className}`}
    >
      <ArrowRight
        size={16}
        strokeWidth={2.2}
        className="transition-transform duration-300 ease-out group-hover/ac:translate-x-[3px]"
      />
    </button>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/*  Handwritten notes                                               */
/* ───────────────────────────────────────────────────────────────── */

export function ScriptNote({
  children,
  className = "",
  rotate = -4,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, delay: 0.6 }}
      className={`font-hand leading-[1.15] text-ink2 ${className}`}
      style={{ rotate }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/*  Form fields                                                     */
/* ───────────────────────────────────────────────────────────────── */

export function Field({
  label,
  required,
  children,
  className = "",
  htmlFor,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  let control = children;
  if (!htmlFor && isValidElement(children)) {
    control = cloneElement(children as ReactElement<{ id?: string }>, { id });
  }
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-[7px] block text-[12px] font-medium text-ink">
        {label} {required && <span className="text-rust">*</span>}
      </label>
      {control}
    </div>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-line bg-card px-3.5 text-[13.5px] text-ink placeholder:text-ink3 transition-all duration-200 hover:border-ink/25 focus:border-ink/45 focus:outline-none focus:ring-4 focus:ring-rust/10";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} h-11 ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputCls} py-3 min-h-[96px] resize-none leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function SelectInput({
  children,
  className = "",
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select
        {...rest}
        className={`${inputCls} h-11 cursor-pointer appearance-none pr-9 ${
          rest.value === "" ? "text-ink3" : "text-ink"
        }`}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3"
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/*  Trust badges                                                    */
/* ───────────────────────────────────────────────────────────────── */

export function TrustBadges({
  dark = false,
  items,
}: {
  dark?: boolean;
  items: { icon: ReactNode; label: ReactNode }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={dark ? "text-smoke/80" : "text-ink"}>{it.icon}</span>
          <span
            className={`text-[12px] leading-tight ${
              dark ? "text-smoke/70" : "text-ink2"
            }`}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/*  Reveal helpers                                                  */
/* ───────────────────────────────────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [forced, setForced] = useState(false);
  useEffect(() => {
    if (inView) return;
    const t = setTimeout(() => setForced(true), 2500);
    return () => clearTimeout(t);
  }, [inView]);
  const show = inView || forced;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

/** Masked line reveal for serif headlines */
const MOTION_TAGS = {
  div: motion.create("div"),
  h1: motion.create("h1"),
  h2: motion.create("h2"),
  h3: motion.create("h3"),
  span: motion.create("span"),
} as const;

/** Masked line reveal for serif headlines.
 *  Observes the un-clipped wrapper (not the translated child) to avoid
 *  the IntersectionObserver deadlock where a transformed child is fully
 *  clipped by its overflow-hidden parent and never "enters view". */
export function MaskLine({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "h1" | "h2" | "h3" | "span";
  className?: string;
}) {
  const MTag = MOTION_TAGS[Tag];
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [forced, setForced] = useState(false);
  useEffect(() => {
    if (inView) return;
    const t = setTimeout(() => setForced(true), 2500);
    return () => clearTimeout(t);
  }, [inView]);
  const show = inView || forced;
  return (
    <span ref={ref} className={`-mb-[0.12em] block overflow-hidden pb-[0.12em] ${className}`}>
      <MTag
        initial={{ y: "110%" }}
        animate={show ? { y: "0%" } : { y: "110%" }}
        transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
        className="block will-change-transform"
      >
        {children}
      </MTag>
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/*  CountUp number                                                  */
/* ───────────────────────────────────────────────────────────────── */

export function CountUp({
  to,
  suffix = "",
  className = "",
  duration = 1.6,
}: {
  to: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [forced, setForced] = useState(false);
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-US") + suffix);

  useEffect(() => {
    if (inView) return;
    const t = setTimeout(() => setForced(true), 2500);
    return () => clearTimeout(t);
  }, [inView]);

  useEffect(() => {
    if (!inView && !forced) return;
    const controls = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, forced, mv, to, duration]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{text}</motion.span>
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/*  Toast context (lightweight, frontend-demo friendly)             */
/* ───────────────────────────────────────────────────────────────── */

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  };

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          msg ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[12.5px] font-medium text-paper2 shadow-[0_18px_40px_-12px_rgba(23,19,16,0.5)]">
          <span className="size-1.5 rounded-full bg-rust" />
          {msg}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}
