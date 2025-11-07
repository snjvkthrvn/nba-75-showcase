"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

interface ParallaxStripProps {
  items: string[];
}

export function ParallaxStrip({ items }: ParallaxStripProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!trackRef.current) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, trackRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] py-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-base via-transparent to-base opacity-70" aria-hidden />
      <div
        ref={trackRef}
        className="relative flex w-max min-w-full gap-6 px-10 text-sm font-medium uppercase tracking-[0.3em] text-white/50"
      >
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full border border-white/10 px-6 py-2 text-white/60"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export default ParallaxStrip;
