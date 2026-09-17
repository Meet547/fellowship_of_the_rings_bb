"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

/** Lightweight navigation loader; the full orbit animation belongs to active searches. */
export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-paper/95 backdrop-blur-sm"
      role="status"
      aria-label="Loading KHOJ"
    >
      <div className="flex flex-col items-center">
        <motion.span
          animate={{ scale: [1, 1.06, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-14 items-center justify-center rounded-[16px] bg-rust text-paper2 shadow-[0_14px_30px_-14px_rgba(192,69,43,0.7)]"
        >
          <Search size={24} strokeWidth={2} />
        </motion.span>
        <div className="mt-5 font-serif text-[19px] font-semibold tracking-[0.14em] text-ink">
          KHOJ
        </div>
        <div className="mt-3 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((item) => (
            <motion.span
              key={item}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1, repeat: Infinity, delay: item * 0.15 }}
              className="size-1.5 rounded-full bg-rust"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
