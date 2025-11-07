"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

import { PlayerBadge } from "@/components/PlayerBadge";
import type { PlayerSummary } from "@/lib/data";

interface HeroProps {
  featuredPlayers: readonly PlayerSummary[];
}

const smoothEase = [0.33, 1, 0.68, 1] as const;

const headline: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: smoothEase },
  },
};

const subline: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.1, duration: 0.9, ease: smoothEase },
  },
};

const ctas: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, duration: 0.8, ease: smoothEase },
  },
};

export function Hero({ featuredPlayers }: HeroProps) {
  const highlights = featuredPlayers.slice(0, 3);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-10 pt-14 shadow-glass backdrop-blur-xl md:p-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 translate-x-1/3 rounded-full bg-gradient-to-br from-accent-500/40 via-accent-400/10 to-transparent blur-3xl"
      />
      <div className="relative flex flex-col gap-8">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={headline}
          className="max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          Celebrating the NBA 75 with cinematic storytelling and data-rich motion.
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={subline}
          className="max-w-2xl text-lg text-white/70 sm:text-xl"
        >
          Explore legendary profiles, interactive shot charts, and era-spanning comparisons crafted for high refresh displays.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={ctas}
          className="flex flex-wrap gap-4"
        >
          <Link
            href="/players"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-base transition duration-300 ease-smooth hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
          >
            Browse Legends
          </Link>
          <Link
            href="/compare"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/80 transition duration-300 ease-smooth hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            Compare Eras
          </Link>
        </motion.div>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {highlights.map((player, index) => (
          <motion.div
            key={player.slug}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + index * 0.08, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          >
            <PlayerBadge player={player} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Hero;
