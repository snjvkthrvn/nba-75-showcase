"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";

import type { PlayerSummary } from "@/lib/data";

interface CompareControlsProps {
  players: readonly PlayerSummary[];
  selected: string[];
  onChange: (next: string[]) => void;
  maxSelections?: number;
}

export function CompareControls({
  players,
  selected,
  onChange,
  maxSelections = 3,
}: CompareControlsProps) {
  const [query, setQuery] = useState("");

  const filteredPlayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return players;
    return players.filter((player) =>
      `${player.name} ${player.era} ${player.positions.join(" ")}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [players, query]);

  const selectionsRemaining = maxSelections - selected.length;

  const toggleSelection = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((entry) => entry !== slug));
    } else if (selectionsRemaining > 0) {
      onChange([...selected, slug]);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Select Players</h2>
          <p className="text-sm text-white/60">
            Choose up to {maxSelections} legends to render the comparison charts.
          </p>
        </div>
        <label className="relative flex w-full max-w-xs items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
          <span className="sr-only">Search players</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, era, or position"
            className="w-full bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {filteredPlayers.map((player) => {
          const isSelected = selected.includes(player.slug);
          const canSelect = isSelected || selectionsRemaining > 0;

          return (
            <button
              key={player.slug}
              type="button"
              onClick={() => toggleSelection(player.slug)}
              className={clsx(
                "group flex flex-col gap-2 rounded-2xl border border-white/10 p-4 text-left transition duration-200 ease-smooth",
                isSelected
                  ? "border-white/40 bg-white/[0.12]"
                  : "hover:border-white/20 hover:bg-white/[0.08]",
                !canSelect && "cursor-not-allowed opacity-40",
              )}
              disabled={!canSelect}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                <span>{player.positions.join(" / ")}</span>
                <span>{player.era}</span>
              </div>
              <span className="text-sm font-semibold text-white">{player.name}</span>
              <span className="text-xs text-white/50">{player.headline}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {selectionsRemaining} selections remaining.
      </p>
    </section>
  );
}

export default CompareControls;
