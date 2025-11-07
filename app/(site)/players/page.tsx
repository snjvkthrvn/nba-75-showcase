import PlayersExplorer from "@/components/PlayersExplorer";
import { getPlayers, listEras, listPositions } from "@/lib/data";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legends",
  description:
    "Filter and explore the NBA 75 roster with quick navigation across positions and eras.",
};

export default async function PlayersPage() {
  const [players, positions, eras] = await Promise.all([
    getPlayers(),
    listPositions(),
    listEras(),
  ]);

  const orderedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Roster</p>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Top 75 Legends
        </h1>
        <p className="max-w-2xl text-sm text-white/60">
          Curated storytelling cards across positions, eras, and active careers. Use the keyboard arrows or filters to move swiftly through the grid.
        </p>
      </header>
      <PlayersExplorer players={orderedPlayers} positions={positions} eras={eras} />
    </div>
  );
}
