"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  formatter?: (value: number) => string;
  accentClassName?: string;
}

export function StatBar({
  label,
  value,
  max,
  formatter = (input) => input.toFixed(1),
  accentClassName = "from-accent-500 to-accent-300",
}: StatBarProps) {
  const ratio = max ? Math.min(value / max, 1) : 1;
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
        <span>{label}</span>
        <span>{formatter(value)}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={shouldReduceMotion ? undefined : { scaleX: 0 }}
          animate={{ scaleX: ratio }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
          }
          className={clsx(
            "origin-left h-full w-full bg-gradient-to-r",
            accentClassName,
          )}
        />
      </div>
    </div>
  );
}

export default StatBar;
