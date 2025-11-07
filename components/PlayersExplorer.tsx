"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";

import PlayerCard from "@/components/PlayerCard";
import type { PlayerSummary } from "@/lib/data";

interface PlayersExplorerProps {
  players: readonly PlayerSummary[];
  positions: readonly string[];
  eras: readonly string[];
}

export function PlayersExplorer({ players, positions, eras }: PlayersExplorerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("all");
  const [era, setEra] = useState("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return players.filter((player) => {
      if (position !== "all" && !player.positions.includes(position)) {
        return false;
      }
      if (era !== "all" && player.era !== era) {
        return false;
      }
      if (activeOnly && !player.active) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${player.name} ${player.teams.join(" ")} ${player.headline}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [players, position, era, activeOnly, query]);

  const handleNavigate = (slug: string) => {
    router.push(`/player/${slug}`);
  };

  const handleKeyNav = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const keys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const cards = Array.from(
      containerRef.current.querySelectorAll<HTMLDivElement>("[data-player-card='true']"),
    );
    if (!cards.length) return;

    const currentElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const currentIndex = currentElement ? cards.indexOf(currentElement as HTMLDivElement) : -1;
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = Math.min(currentIndex + 1, cards.length - 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = cards.length - 1;
        break;
      default:
        break;
    }

    if (nextIndex !== currentIndex && cards[nextIndex]) {
      event.preventDefault();
      cards[nextIndex].focus();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-wrap gap-4">
          <label className="flex w-full flex-col gap-2 text-xs uppercase tracking-[0.26em] text-white/60 md:max-w-[200px]">
            Position
            <select
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              className="rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              <option value="all">All</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-full flex-col gap-2 text-xs uppercase tracking-[0.26em] text-white/60 md:max-w-[200px]">
            Era
            <select
              value={era}
              onChange={(event) => setEra(event.target.value)}
              className="rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              <option value="all">All</option>
              {eras.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-full flex-col gap-2 text-xs uppercase tracking-[0.26em] text-white/60 md:max-w-sm">
            Search
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, team, or storyline"
              className="rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => setActiveOnly((value) => !value)}
          className={clsx(
            "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] transition",
            activeOnly
              ? "border border-white/40 bg-white/20 text-base"
              : "border border-white/15 text-white/70 hover:border-white/30 hover:text-white",
          )}
          aria-pressed={activeOnly}
        >
          Active Only
        </button>
      </div>

      <div
        ref={containerRef}
        role="listbox"
        aria-label="NBA 75 players"
        tabIndex={-1}
        onKeyDownCapture={handleKeyNav}
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      >
        {filtered.map((player, index) => (
          <PlayerCard
            key={player.slug}
            index={index}
            player={player}
            onActivate={handleNavigate}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/60 backdrop-blur-xl">
          No players match the current filters. Adjust your search to continue exploring the legends.
        </p>
      )}
    </section>
  );
}

export default PlayersExplorer;
