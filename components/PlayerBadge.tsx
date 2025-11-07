"use client";

import clsx from "clsx";

import type { PlayerSummary } from "@/lib/data";

interface PlayerBadgeProps {
  player: Pick<
    PlayerSummary,
    "name" | "positions" | "era" | "headline" | "thumbnail"
  > & { accent?: string };
  className?: string;
}

const getAccent = (index: number): string => {
  const palette = [
    "from-accent-500/70 to-accent-300/50",
    "from-emerald-500/70 to-emerald-300/40",
    "from-sky-500/70 to-sky-300/40",
    "from-amber-500/70 to-amber-300/40",
  ];
  return palette[index % palette.length];
};

export function PlayerBadge({ player, className }: PlayerBadgeProps) {
  const accent = player.accent ?? getAccent(player.name.length);

  return (
    <article
      className={clsx(
        "glass flex w-full flex-col gap-3 rounded-2xl border border-white/10 p-4",
        "shadow-glass transition duration-300 ease-smooth hover:border-white/20 hover:bg-white/[0.08]",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
        <span>{player.era}</span>
        <span>{player.positions.join(" / ")}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white drop-shadow-sm">
          {player.name}
        </h3>
        <p className="mt-1 text-sm text-white/60">{player.headline}</p>
      </div>
      <div
        className={clsx(
          "mt-auto h-1.5 w-full rounded-full bg-gradient-to-r",
          accent,
        )}
      />
    </article>
  );
}

export default PlayerBadge;
