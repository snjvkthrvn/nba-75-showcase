import dynamic from "next/dynamic";
import Image from "next/image";
import { notFound } from "next/navigation";

import StatBar from "@/components/StatBar";
import {
  getPlayerBySlug,
  getPlayerShots,
  getPlayerStats,
  getPlayers,
} from "@/lib/data";
import { formatDate, formatList, formatNumber, formatPercent, formatSpan } from "@/lib/format";
import {
  effectiveFieldGoalPercentage,
  per36,
  perGame,
  trueShootingPercentage,
  freeThrowRate,
} from "@/lib/metrics";

import type { Metadata } from "next";

const ShotChart = dynamic(() => import("@/components/ShotChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-sm text-white/60">
      Loading shot chart…
    </div>
  ),
});

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

interface PlayerPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const players = await getPlayers();
  return players.map((player) => ({ slug: player.slug }));
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const player = await getPlayerBySlug(params.slug);
  if (!player) {
    return { title: "Player not found" };
  }

  return {
    title: player.name,
    description: player.headline,
    openGraph: {
      title: player.name,
      description: player.headline,
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const player = await getPlayerBySlug(params.slug);
  if (!player) {
    notFound();
  }

  const [stats, shots] = await Promise.all([
    getPlayerStats(player.slug),
    getPlayerShots(player.slug),
  ]);

  const career = stats?.career;
  const metrics = career
    ? [
        {
          label: "PTS/G",
          value: perGame(career.pts, career.games),
          formatter: (value: number) => formatNumber(value, 1),
        },
        {
          label: "AST/G",
          value: perGame(career.ast, career.games),
          formatter: (value: number) => formatNumber(value, 1),
        },
        {
          label: "REB/G",
          value: perGame(career.reb, career.games),
          formatter: (value: number) => formatNumber(value, 1),
        },
        {
          label: "TS%",
          value: trueShootingPercentage(career.pts, career.fga, career.fta),
          formatter: (value: number) => formatPercent(value, 3),
        },
        {
          label: "eFG%",
          value: effectiveFieldGoalPercentage(career.fgm, career.fg3m, career.fga),
          formatter: (value: number) => formatPercent(value, 3),
        },
        {
          label: "FT Rate",
          value: freeThrowRate(career.fta, career.fga),
          formatter: (value: number) => formatPercent(value, 3),
        },
      ]
    : [];

  const per36Metrics = career
    ? [
        {
          label: "PTS/36",
          value: per36(career.pts, career.minutes),
          formatter: (value: number) => formatNumber(value, 1),
        },
        {
          label: "AST/36",
          value: per36(career.ast, career.minutes),
          formatter: (value: number) => formatNumber(value, 1),
        },
        {
          label: "REB/36",
          value: per36(career.reb, career.minutes),
          formatter: (value: number) => formatNumber(value, 1),
        },
      ]
    : [];

  const seasonMultiples = stats?.seasons.slice(0, 6).map((season) => {
    const pts = perGame(season.pts, season.games);
    const ast = perGame(season.ast, season.games);
    const reb = perGame(season.reb, season.games);

    return {
      label: season.season,
      team: season.team,
      metrics: [
        { label: "PTS", value: pts, max: 40 },
        { label: "AST", value: ast, max: 15 },
        { label: "REB", value: reb, max: 20 },
      ] as const,
    };
  });

  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-glass backdrop-blur-xl md:flex md:gap-10 md:p-12">
        <div className="relative h-80 w-full max-w-sm flex-shrink-0 overflow-hidden rounded-3xl border border-white/10">
          <Image
            src={player.image}
            alt={player.name}
            fill
            sizes="(min-width: 1024px) 320px, 70vw"
            className="object-cover object-top"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </div>
        <div className="relative mt-8 flex flex-1 flex-col gap-5 md:mt-0">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {player.positions.join(" • ")} · {formatSpan(player.years)}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white md:text-5xl">
              {player.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/70">
              {player.headline}
            </p>
          </div>
          <div className="grid gap-4 text-sm text-white/70 md:grid-cols-2">
            <div>
              <p className="text-white">Vitals</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="text-white/60">Height:</span> {player.height}
                </li>
                <li>
                  <span className="text-white/60">Weight:</span> {player.weight} lbs
                </li>
                <li>
                  <span className="text-white/60">Birth:</span> {formatDate(player.birthDate)}
                </li>
                <li>
                  <span className="text-white/60">Teams:</span> {player.teams.join(", ")}
                </li>
              </ul>
            </div>
            <div>
              <p className="text-white">Accolades</p>
              <p className="mt-2 text-white/70">{formatList(player.achievements)}</p>
            </div>
          </div>
          <blockquote className="rounded-2xl border border-white/15 bg-white/[0.05] p-5 text-sm text-white/70">
            “{player.heroQuote}”
            <cite className="mt-2 block text-xs uppercase tracking-[0.3em] text-white/50">
              {player.heroAttribution}
            </cite>
          </blockquote>
        </div>
      </header>

      {metrics.length > 0 && (
        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Career Efficiency</h2>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <StatBar
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  formatter={metric.formatter}
                  max={metric.label.includes("%") ? 1 : undefined}
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Per 36 Highlights</h2>
            <ul className="space-y-2 text-sm text-white/70">
              {per36Metrics.map((metric) => (
                <li key={metric.label} className="flex justify-between">
                  <span>{metric.label}</span>
                  <span className="text-white">{metric.formatter(metric.value)}</span>
                </li>
              ))}
              {career && (
                <li className="flex justify-between text-white/60">
                  <span>Career Games</span>
                  <span className="text-white">{formatNumber(career.games, 0)}</span>
                </li>
              )}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2 className="sr-only">Shot Chart</h2>
        {shots.length > 0 ? (
          <ShotChart shots={shots} />
        ) : (
          <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60 backdrop-blur-xl">
            Shot chart data is coming soon for {player.name}.
          </p>
        )}
      </section>

      {stats && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Season Snapshots</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/70">
              <thead className="text-xs uppercase tracking-[0.25em] text-white/50">
                <tr>
                  <th scope="col" className="px-3 py-2">Season</th>
                  <th scope="col" className="px-3 py-2">Team</th>
                  <th scope="col" className="px-3 py-2">G</th>
                  <th scope="col" className="px-3 py-2">PTS</th>
                  <th scope="col" className="px-3 py-2">AST</th>
                  <th scope="col" className="px-3 py-2">REB</th>
                  <th scope="col" className="px-3 py-2">TS%</th>
                  <th scope="col" className="px-3 py-2">eFG%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.seasons.map((season) => {
                  const ts = trueShootingPercentage(
                    season.pts,
                    season.fga,
                    season.fta,
                  );
                  const efg = effectiveFieldGoalPercentage(
                    season.fgm,
                    season.fg3m,
                    season.fga,
                  );

                  return (
                    <tr key={season.season} className="hover:bg-white/[0.04]">
                      <td className="px-3 py-2 font-medium text-white">{season.season}</td>
                      <td className="px-3 py-2">{season.team}</td>
                      <td className="px-3 py-2">{season.games}</td>
                      <td className="px-3 py-2">{formatNumber(perGame(season.pts, season.games), 1)}</td>
                      <td className="px-3 py-2">{formatNumber(perGame(season.ast, season.games), 1)}</td>
                      <td className="px-3 py-2">{formatNumber(perGame(season.reb, season.games), 1)}</td>
                      <td className="px-3 py-2">{formatPercent(ts, 3)}</td>
                      <td className="px-3 py-2">{formatPercent(efg, 3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {seasonMultiples && seasonMultiples.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Season Small Multiples</h2>
          <p className="mt-2 text-sm text-white/60">
            Highlighted seasons with per-game pacing across scoring, playmaking, and rebounding.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {seasonMultiples.map((season) => (
              <article
                key={season.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <header className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/60">
                  <span>{season.label}</span>
                  <span>{season.team}</span>
                </header>
                <div className="space-y-3">
                  {season.metrics.map((metric) => (
                    <StatBar
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      max={metric.max}
                      formatter={(value) => formatNumber(value, 1)}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
