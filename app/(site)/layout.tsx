import clsx from "clsx";
import { MotionConfig } from "framer-motion";
import Link from "next/link";

import type { ReactNode } from "react";

const navLinks = [
  { href: "/", label: "Showcase" },
  { href: "/players", label: "Players" },
  { href: "/compare", label: "Compare" },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-hidden">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[-30vh] z-0 h-[60vh] bg-gradient-to-b from-accent-500/20 via-transparent to-transparent blur-3xl"
        />
        <a
          href="#page-content"
          className={clsx(
            "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:mt-4 focus:ml-4",
            "focus:rounded-full focus:bg-white/10 focus:px-4 focus:py-2 focus:text-sm focus:text-white",
          )}
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 mx-auto mt-6 w-[min(1200px,92vw)] rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
            >
              NBA 75
            </Link>
            <nav aria-label="Primary navigation" className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition duration-200 ease-smooth hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main
          id="page-content"
          className="relative mx-auto mt-10 w-[min(1200px,92vw)] space-y-16 pb-24"
        >
          {children}
        </main>
        <footer className="mx-auto mb-12 mt-24 w-[min(1200px,92vw)] rounded-3xl border border-white/5 bg-white/[0.02] px-8 py-6 text-sm text-white/40 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>NBA 75 Showcase · Crafted with care for the legends.</span>
            <span className="text-white/30">
              Data is illustrative and not affiliated with the NBA.
            </span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
