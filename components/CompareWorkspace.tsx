"use client";

import { useMemo, useState } from "react";

import CompareCharts from "@/components/CompareCharts";
import CompareControls from "@/components/CompareControls";
import type { PlayerStats, PlayerSummary } from "@/lib/data";

import type { ComparisonSelection } from "./CompareCharts";

interface CompareWorkspaceProps {
  players: readonly PlayerSummary[];
  stats: readonly PlayerStats[];
}

export function CompareWorkspace({ players, stats }: CompareWorkspaceProps) {
  const [selected, setSelected] = useState<string[]>(() =>
    players.slice(0, 2).map((player) => player.slug),
  );

  const statsBySlug = useMemo(() => {
    const index = new Map<string, PlayerStats>();
    stats.forEach((entry) => index.set(entry.slug, entry));
    return index;
  }, [stats]);

  const selections: ComparisonSelection[] = useMemo(() => {
    const mapped: ComparisonSelection[] = selected
      .map((slug) => {
        const summary = players.find((player) => player.slug === slug);
        const stat = statsBySlug.get(slug);
        if (!summary || !stat) return undefined;
        return { summary, stats: stat };
      })
      .filter(
        (
          entry,
        ): entry is ComparisonSelection => entry !== undefined,
      );

    return mapped;
  }, [selected, players, statsBySlug]);

  const chartSelections: ComparisonSelection[] = useMemo(
    () => Array.from(selections),
    [selections],
  );

  return (
    <div className="space-y-8">
      <CompareControls players={players} selected={selected} onChange={setSelected} />
      {chartSelections.length ? (
        <CompareCharts selections={chartSelections} />
      ) : (
        <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60 backdrop-blur-xl">
          Choose at least one player to render comparison charts.
        </p>
      )}
    </div>
  );
}

export default CompareWorkspace;
