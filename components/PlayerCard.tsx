"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { forwardRef, type KeyboardEvent } from "react";

import type { PlayerSummary } from "@/lib/data";
import { formatSpan } from "@/lib/format";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

interface PlayerCardProps {
  player: PlayerSummary;
  onActivate?: (slug: string) => void;
  selected?: boolean;
  index?: number;
}

export const PlayerCard = forwardRef<HTMLDivElement, PlayerCardProps>(
({ player, onActivate, selected = false, index = 0 }, ref) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onActivate) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate(player.slug);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      role={onActivate ? "option" : undefined}
      aria-selected={onActivate ? selected : undefined}
      tabIndex={onActivate ? 0 : -1}
      onKeyDown={handleKeyDown}
      onClick={onActivate ? () => onActivate(player.slug) : undefined}
      ref={ref}
      data-player-card="true"
      data-player-slug={player.slug}
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-glass backdrop-blur-xl",
        "transition duration-300 ease-smooth hover:border-white/25 hover:bg-white/[0.08]",
        selected && "border-white/40 bg-white/[0.12]",
        onActivate && "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40",
      )}
    >
      <div className="relative h-64 w-full">
        <Image
          src={player.image}
          alt={player.name}
          fill
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(min-width: 768px) 280px, 80vw"
          className="object-cover object-top"
          priority={index < 2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent opacity-80" aria-hidden />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/70">
          <span>{player.positions.join(" / ")}</span>
          <span>{formatSpan(player.years)}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-xl font-semibold text-white">{player.name}</h3>
          <p className="mt-1 text-sm text-white/60">{player.headline}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 text-xs text-white/50">
          <span className="rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.24em]">
            {player.era}
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.24em]">
            {player.teams.join(" · ")}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

PlayerCard.displayName = "PlayerCard";

export default PlayerCard;
