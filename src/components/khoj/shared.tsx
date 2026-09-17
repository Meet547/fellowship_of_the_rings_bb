"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Search, User, Check } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { SourceKind } from "@/lib/khoj/data";

/* ---------------- Motion language ----------------
   One easing pair used everywhere — the signature of a system. */
export const EASE = [0.16, 1, 0.3, 1] as const; // easeOutExpo — entrances
export const EASE_INOUT = [0.76, 0, 0.24, 1] as const; // masked reveals / exits

/* ---------------- Logo ---------------- */

export function Logo({
  size = "md",
  onClick,
  tagline = true,
}: {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  tagline?: boolean;
}) {
  const s =
    size === "lg" ? "text-[24px]" : size === "sm" ? "text-[16px]" : "text-[19px]";
  const tag = size === "lg" ? "text-[12px]" : size === "sm" ? "text-[9.5px]" : "text-[10px]";
  return (
    <button
      onClick={onClick}
      className={cn("group flex items-baseline gap-2.5", onClick && "cursor-pointer")}
      aria-label="KHOJ home"
    >
      <span
        className={cn(
          "font-bold uppercase leading-none tracking-[0.06em] text-ink transition-opacity duration-300 group-hover:opacity-60",
          s
        )}
      >
        KHOJ
        <span className="align-super text-[0.45em] font-medium tracking-normal">®</span>
      </span>
      {tagline && (
        <span className={cn("micro hidden text-ink-faint sm:inline-block", tag)}>
          People. Connected.
        </span>
      )}
    </button>
  );
}

/* ---------------- Magnetic wrapper (subtle, 3px max) ---------------- */

export function Magnetic({
  children,
  className,
  strength = 0.18,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Arrow ---------------- */

export function ArrowIcon({
  className,
  strokeWidth = 1.6,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn("h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", className)}
      aria-hidden
    >
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- Button system ----------------
   primary — ink solid, paper text, arrow slide on hover
   secondary — hairline border, ink fill sweep on hover
   ghost — text only with underline sweep               */

export function Button({
  children,
  onClick,
  variant = "primary",
  className,
  icon,
  type = "button",
  disabled,
  magnetic = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "paper";
  className?: string;
  icon?: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  magnetic?: boolean;
}) {
  const btn = (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn(
        "group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full text-[13px] font-medium tracking-[-0.005em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-35",
        variant === "primary" &&
          "bg-ink px-5 py-2.5 text-paper hover:bg-[#000]",
        variant === "paper" &&
          "bg-paper px-5 py-2.5 text-ink hover:bg-white",
        variant === "secondary" &&
          "border border-ink/20 bg-transparent px-5 py-2.5 text-ink hover:border-ink hover:bg-ink hover:text-paper",
        variant === "ghost" && "text-ink-soft hover:text-ink",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      {icon && (
        <span className="relative z-10 inline-flex overflow-hidden">
          <span className="inline-flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-5">
            {icon}
          </span>
          <span
            className="absolute left-0 top-0 inline-flex -translate-x-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0"
            aria-hidden
          >
            {icon}
          </span>
        </span>
      )}
    </motion.button>
  );
  return magnetic ? (
    <Magnetic className={className?.includes("w-full") ? "block w-full" : undefined}>
      {btn}
    </Magnetic>
  ) : (
    btn
  );
}

/* Circular icon button — used for arrows on cards */
export function CircleArrow({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 place-items-center overflow-hidden rounded-full transition-colors duration-300",
        dark ? "bg-paper text-ink" : "bg-ink text-paper",
        className
      )}
    >
      <span className="relative block h-3.5 w-3.5 overflow-hidden">
        <ArrowIcon className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4" />
        <ArrowIcon className="absolute inset-0 -translate-x-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
      </span>
    </span>
  );
}

/* ---------------- Text link ---------------- */

export function TextLink({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "link-sweep inline-flex items-center gap-1 text-[13px] font-medium text-ink",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- Eyebrow (mono micro label) ---------------- */

export function Eyebrow({
  children,
  index,
  className,
  light = false,
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "micro flex items-center gap-2.5",
        light ? "text-paper/60" : "text-ink-faint",
        className
      )}
    >
      {index && (
        <>
          <span className={light ? "text-paper" : "text-ink"}>( {index} )</span>
          <span className={cn("h-px w-5", light ? "bg-paper/30" : "bg-ink/20")} />
        </>
      )}
      <span>{children}</span>
    </div>
  );
}

/* ---------------- Masked line reveal ----------------
   Each line rises out of an overflow mask — the $10K headline.
   useInView on the container: the translated inner span is clipped,
   so the observer must watch the mask, not the span. */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  duration = 1,
  as: Tag = "span",
  once = true,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "span" | "div" | "p";
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.4 });
  const MotionTag = motion[Tag as "span"];
  return (
    <MotionTag ref={ref as never} className={cn("block", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            initial={{ y: "112%" }}
            animate={inView ? { y: "0%" } : { y: "112%" }}
            transition={{ duration, delay: inView ? delay + i * stagger : 0, ease: EASE_INOUT }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/* Same mask reveal but driven on mount (hero above the fold) */
export function MaskLinesOnMount({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  duration = 1,
  as: Tag = "span",
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "span" | "div" | "p";
}) {
  const MotionTag = motion[Tag as "span"];
  return (
    <MotionTag className={cn("block", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            initial={{ y: "112%" }}
            animate={{ y: "0%" }}
            transition={{ duration, delay: delay + i * stagger, ease: EASE_INOUT }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/* ---------------- Scroll reveal wrapper ---------------- */

export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  amount = 0.3,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Marquee ---------------- */

export function Marquee({
  items,
  className,
  itemClassName,
}: {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  const row = (
    <>
      {items.map((it, i) => (
        <span key={i} className={cn("flex shrink-0 items-center gap-8 pr-8", itemClassName)}>
          {it}
          <Asterisk className="h-3 w-3 text-ink/40" />
        </span>
      ))}
    </>
  );
  return (
    <div className={cn("marquee-pause relative flex overflow-hidden", className)}>
      <div className="animate-marquee flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}

export function Asterisk({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------- Badges ---------------- */

export function MatchBadge({ pct }: { pct: number }) {
  const tone =
    pct >= 70
      ? "bg-match-green text-match-green-text"
      : pct >= 60
        ? "bg-match-amber text-match-amber-text"
        : "bg-match-yellow text-match-yellow-text";
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11px] font-medium tracking-[0.02em]",
        tone
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {pct}% match
    </span>
  );
}

export function SourceBadge({ source }: { source: SourceKind }) {
  return (
    <span className="micro inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-paper-2 px-2.5 py-[5px] !text-[9.5px] text-ink-2">
      <span className="grid h-3 w-3 place-items-center rounded-full bg-ink text-paper">
        <svg viewBox="0 0 10 10" className="h-[7px] w-[7px]" fill="currentColor" aria-hidden>
          <path d="M5 0l1.2 3.1L9.5 3.4 7.1 5.6l.7 3.2L5 7.1 2.2 8.8l.7-3.2L.5 3.4l3.3-.3L5 0z" />
        </svg>
      </span>
      <span className="normal-case tracking-[0.08em]">{source}</span>
    </span>
  );
}

/* ---------------- Silhouette placeholder (flat — no gradients) ---------------- */

export function Silhouette({ className }: { className?: string }) {
  return (
    <div
      className={cn("grid place-items-center bg-[#e7e3da]", className)}
      aria-label="Unidentified person silhouette"
    >
      <svg viewBox="0 0 64 64" className="h-3/5 w-3/5 text-[#b4afa4]" fill="currentColor" aria-hidden>
        <circle cx="32" cy="22" r="12" />
        <path d="M10 58c2.5-12.5 11-19 22-19s19.5 6.5 22 19v6H10v-6z" />
      </svg>
    </div>
  );
}

/* ---------------- Person photo ---------------- */

export function PersonPhoto({
  photo,
  name,
  className,
}: {
  photo: string | null;
  name: string;
  className?: string;
}) {
  if (!photo) return <Silhouette className={className} />;
  return (
    <img
      src={photo}
      alt={`Photo of ${name}`}
      className={cn("object-cover", className)}
      draggable={false}
    />
  );
}

/* ---------------- Stepper ---------------- */

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: string[];
  current: number;
  onStepClick?: (i: number) => void;
}) {
  return (
    <nav aria-label="Progress" className="flex items-center">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div key={label} className="flex items-center">
            <button
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick || i > current}
              className={cn(
                "flex items-center gap-2.5 rounded-full px-1.5 py-1 transition-colors",
                onStepClick && i <= current && "hover:bg-ink/[0.04]"
              )}
            >
              <span
                className={cn(
                  "tabular grid h-[22px] w-[22px] place-items-center rounded-full text-[10px] font-medium transition-all duration-500",
                  active && "bg-ink text-paper",
                  !active && done && "border border-ink/60 text-ink",
                  !active && !done && "border border-line-2 text-ink-faint"
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={2.4} /> : `0${i + 1}`}
              </span>
              <span
                className={cn(
                  "micro hidden !text-[9.5px] tracking-[0.14em] md:inline-block",
                  active ? "text-ink" : "text-ink-faint"
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && <span className="h-px w-5 bg-line-2 sm:w-8" />}
          </div>
        );
      })}
    </nav>
  );
}

/* ---------------- Handwritten note ---------------- */

export function HandNote({
  children,
  className,
  rotate = -4,
  size = 22,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "font-hand inline-block leading-[1.05] text-ink animate-float",
        className
      )}
      style={
        {
          fontSize: size,
          "--hand-rot": `${rotate}deg`,
          transform: `rotate(${rotate}deg)`,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}

/* ---------------- Shared field class ---------------- */

export const fieldCls =
  "w-full rounded-[10px] border border-line-2 bg-paper-2 px-4 py-3 text-[13.5px] text-ink outline-none transition-all duration-300 placeholder:text-ink-faint hover:border-ink/30 focus:border-ink focus:bg-white";

export const labelCls =
  "micro !text-[9.5px] !tracking-[0.16em] text-ink-soft";

/* ---------------- Misc glyphs ---------------- */

export function SearchGlyph({ className }: { className?: string }) {
  return <Search className={cn("h-4 w-4", className)} strokeWidth={1.8} aria-hidden />;
}

export function UserGlyph({ className }: { className?: string }) {
  return <User className={cn("h-4 w-4", className)} strokeWidth={1.8} aria-hidden />;
}

/* ---------------- Divider with centered label ---------------- */

export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-7 flex items-center gap-4">
      <span className="h-px flex-1 bg-line" />
      <span className="micro !text-[9.5px] text-ink-faint">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export { AnimatePresence };
