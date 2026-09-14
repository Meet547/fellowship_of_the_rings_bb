"use client";

import * as React from "react";

const HEADER_OFFSET = 76;
const SCROLL_DURATION = 560;

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function SmoothScroll() {
  React.useEffect(() => {
    let frame = 0;

    const scrollToTarget = (target: HTMLElement) => {
      const start = window.scrollY;
      const end = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
      );
      const distance = end - start;
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / SCROLL_DURATION);
        window.scrollTo(0, start + distance * easeInOutCubic(progress));
        if (progress < 1) frame = window.requestAnimationFrame(step);
      };

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(step);
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!link || link.target === "_blank") return;

      const id = link.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      event.preventDefault();
      window.history.pushState(null, "", `#${id}`);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(
          0,
          Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET),
        );
      } else {
        scrollToTarget(target);
      }
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}