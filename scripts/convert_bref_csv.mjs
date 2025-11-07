#!/usr/bin/env node

/**
 * Stub converter for Basketball-Reference CSV exports to the showcase JSON format.
 *
 * Usage:
 *   node scripts/convert_bref_csv.mjs --players top75.csv --stats stats.csv --shots shots.csv --out-dir public/data
 *
 * Expected inputs:
 *  - players:  Basketball-Reference "NBA 75" player list with basic metadata.
 *  - stats:    Season or career box score totals.
 *  - shots:    Play-by-play or tracking export normalized to half-court coordinates.
 *
 * The script is intentionally lightweight: it outlines the transformation pipeline,
 * validates arguments, and documents where custom business logic should live.
 * Replace the TODO blocks with project-specific parsing when real data is available.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (!key || !value || !key.startsWith("--")) break;
  args.set(key.slice(2), value);
}

if (!args.size || args.has("help")) {
  console.info(`Usage:
  node scripts/convert_bref_csv.mjs --players players.csv --stats stats.csv --shots shots.csv --out-dir public/data

Arguments:
  --players   CSV export containing player metadata.
  --stats     CSV export containing season or career totals.
  --shots     CSV export containing shot chart coordinates.
  --out-dir   Directory where JSON artifacts will be written (default: public/data).
`);
  process.exit(0);
}

const outDir = resolve(process.cwd(), args.get("out-dir") ?? "public/data");

async function loadCsv(path) {
  const file = await readFile(path, "utf-8");
  return file.split(/\r?\n/).filter(Boolean);
}

async function main() {
  const [playerRows, statRows, shotRows] = await Promise.all([
    loadCsv(resolve(args.get("players") ?? "")),
    loadCsv(resolve(args.get("stats") ?? "")),
    loadCsv(resolve(args.get("shots") ?? "")),
  ]);

  // TODO: Parse playerRows into PlayerSummary objects.
  const players = playerRows.slice(1, 2);

  // TODO: Parse statRows into PlayerStats collections.
  const stats = statRows.slice(1, 2);

  // TODO: Parse shotRows into PlayerShotCollection items.
  const shots = shotRows.slice(1, 2);

  await Promise.all([
    writeFile(resolve(outDir, "top75.json"), JSON.stringify(players, null, 2)),
    writeFile(
      resolve(outDir, "stats.json"),
      JSON.stringify({ players: stats }, null, 2),
    ),
    writeFile(
      resolve(outDir, "shots.json"),
      JSON.stringify(shots, null, 2),
    ),
  ]);

  console.info("Conversion complete. Replace stub logic with real parsing steps.");
}

main().catch((error) => {
  console.error("Failed to transform CSV input:", error);
  process.exitCode = 1;
});
