import CompareWorkspace from "@/components/CompareWorkspace";
import { getAllPlayerStats, getPlayers } from "@/lib/data";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Line up legends side-by-side with radar and timeline charts normalized by career year.",
};

export default async function ComparePage() {
  const [players, stats] = await Promise.all([
    getPlayers(),
    getAllPlayerStats(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Comparisons</p>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Cross-Era Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-white/60">
          Select up to three icons to visualize their scoring profiles. Radar metrics use career totals while the timelines align seasons by career year for quick era translation.
        </p>
      </header>
      <CompareWorkspace players={players} stats={stats} />
    </div>
  );
}
