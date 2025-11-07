import { promises as fs } from "node:fs";
import { join } from "node:path";

import { cache } from "react";
import { z } from "zod";

const DATA_DIR = join(process.cwd(), "public", "data");
const STATS_FALLBACK = "stats.sample.json";
const SHOTS_FALLBACK = "shots.sample.json";

const shotLocationSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    make: z.boolean(),
  })
  .strict();

const shotCollectionSchema = z
  .object({
    slug: z.string(),
    shots: z.array(shotLocationSchema).readonly(),
  })
  .strict();

const shotsArraySchema = z.array(shotCollectionSchema).readonly();

const playerCareerTotalsSchema = z
  .object({
    games: z.number(),
    minutes: z.number(),
    pts: z.number(),
    ast: z.number(),
    reb: z.number(),
    stl: z.number(),
    blk: z.number(),
    fgm: z.number(),
    fga: z.number(),
    fg3m: z.number(),
    fg3a: z.number(),
    ftm: z.number(),
    fta: z.number(),
  })
  .strict();

const seasonTotalsSchema = playerCareerTotalsSchema.extend({
  season: z.string(),
  age: z.number(),
  team: z.string(),
});

const playerStatsSchema = z
  .object({
    slug: z.string(),
    career: playerCareerTotalsSchema,
    seasons: z.array(seasonTotalsSchema).readonly(),
  })
  .strict();

const statsSchema = z
  .object({
    players: z.array(playerStatsSchema).readonly(),
  })
  .strict();

const playerSummarySchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    headline: z.string(),
    positions: z.array(z.string()).readonly(),
    era: z.string(),
    active: z.boolean(),
    years: z.string(),
    teams: z.array(z.string()).readonly(),
    height: z.string(),
    weight: z.number(),
    birthDate: z.string(),
    numbers: z.array(z.number()).readonly(),
    achievements: z.array(z.string()).readonly(),
    image: z.string(),
    thumbnail: z.string(),
    heroQuote: z.string(),
    heroAttribution: z.string(),
  })
  .strict();

const playersSchema = z.array(playerSummarySchema).readonly();

export type PlayerSummary = Readonly<z.infer<typeof playerSummarySchema>>;
export type PlayerCareerTotals = Readonly<z.infer<typeof playerCareerTotalsSchema>>;
export type PlayerSeasonTotals = Readonly<z.infer<typeof seasonTotalsSchema>>;
export type PlayerStats = Readonly<z.infer<typeof playerStatsSchema>>;
export type ShotLocation = Readonly<z.infer<typeof shotLocationSchema>>;
export type PlayerShotCollection = Readonly<z.infer<typeof shotCollectionSchema>>;

type JsonSchema<T> = z.ZodType<T>;

const readJsonFile = async <T>(
  filename: string,
  schema: JsonSchema<T>,
): Promise<T | null> => {
  const filePath = join(DATA_DIR, filename);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.error(`[data] Invalid shape for ${filename}`, parsed.error.flatten());
      return null;
    }

    return parsed.data;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      console.error(`[data] Failed to load ${filename}`, err);
    }
    return null;
  }
};

const loadPlayers = cache(async (): Promise<readonly PlayerSummary[]> => {
  const players = await readJsonFile("top75.json", playersSchema);
  if (!players) {
    throw new Error("Unable to load player summaries from public/data/top75.json");
  }
  return players;
});

const loadStats = cache(async (): Promise<readonly PlayerStats[]> => {
  const stats =
    (await readJsonFile("stats.json", statsSchema)) ??
    (await readJsonFile(STATS_FALLBACK, statsSchema));

  if (!stats) {
    throw new Error(
      "Unable to load player stats (expected stats.json or stats.sample.json).",
    );
  }

  return stats.players;
});

const loadShotsFromDirectory = async (): Promise<
  readonly PlayerShotCollection[] | null
> => {
  const directory = join(DATA_DIR, "shots");

  try {
    const files = await fs.readdir(directory);
    if (!files.length) {
      return null;
    }

    const collections: PlayerShotCollection[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await fs.readFile(join(directory, file), "utf-8");
      const json = JSON.parse(raw) as unknown;
      const baseRecord =
        typeof json === "object" && json !== null
          ? (json as Record<string, unknown>)
          : null;
      const parsed = shotCollectionSchema.safeParse(
        baseRecord && "shots" in baseRecord && !("slug" in baseRecord)
          ? { slug: file.replace(".json", ""), ...baseRecord }
          : json,
      );

      if (!parsed.success) {
        console.error(
          `[data] Invalid shot file ${file}`,
          parsed.error.flatten().fieldErrors,
        );
        continue;
      }

      collections.push(parsed.data);
    }

    if (!collections.length) {
      return null;
    }

    return collections;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      console.error("[data] Failed to read shots directory", err);
    }
    return null;
  }
};

const loadShots = cache(async (): Promise<readonly PlayerShotCollection[]> => {
  const directoryShots = await loadShotsFromDirectory();
  if (directoryShots) {
    return directoryShots;
  }

  const fallback =
    (await readJsonFile(SHOTS_FALLBACK, shotsArraySchema)) ?? shotsArraySchema.parse([]);
  return fallback;
});

export async function getPlayers(): Promise<readonly PlayerSummary[]> {
  return loadPlayers();
}

export async function getPlayerBySlug(
  slug: string,
): Promise<PlayerSummary | undefined> {
  const players = await loadPlayers();
  return players.find((player) => player.slug === slug);
}

export async function getPlayerStats(
  slug: string,
): Promise<PlayerStats | undefined> {
  const stats = await loadStats();
  return stats.find((player) => player.slug === slug);
}

export async function getAllPlayerStats(): Promise<readonly PlayerStats[]> {
  return loadStats();
}

export async function getPlayerShots(
  slug: string,
): Promise<readonly ShotLocation[]> {
  const shots = await loadShots();
  const entry = shots.find((player) => player.slug === slug);
  return entry?.shots ?? [];
}

export async function getAllPlayerShots(): Promise<readonly PlayerShotCollection[]> {
  return loadShots();
}

export async function listEras(): Promise<readonly string[]> {
  const players = await loadPlayers();
  return Array.from(new Set(players.map((player) => player.era))).sort();
}

export async function listPositions(): Promise<readonly string[]> {
  const players = await loadPlayers();
  return Array.from(
    new Set(players.flatMap((player) => player.positions)),
  ).sort();
}
