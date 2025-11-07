"use client";

import { useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
 
import type { PlayerStats, PlayerSummary } from "@/lib/data";
import { formatPercent, formatPerGame } from "@/lib/format";
import {
  effectiveFieldGoalPercentage,
  perGame,
  trueShootingPercentage,
} from "@/lib/metrics";

export interface ComparisonSelection {
  readonly summary: PlayerSummary;
  readonly stats: PlayerStats;
}

interface CompareChartsProps {
  selections: ComparisonSelection[];
}

interface RadarDatum extends Record<string, number | string> {
  metric: string;
  metricKey: string;
}

interface TimelineDatum extends Record<string, number | string> {
  label: string;
  index: number;
}

interface RadarMetric {
  key: string;
  label: string;
  formatter: (value: number) => string;
  compute: (input: PlayerStats) => number;
}

interface TooltipEntry {
  color?: string;
  dataKey?: string | number;
  name?: string;
  value?: unknown;
  payload?: unknown;
}

const isTooltipPayload = (value: unknown): value is readonly TooltipEntry[] =>
  Array.isArray(value);

interface ChartTooltipArgs {
  payload?: readonly TooltipEntry[];
}

const radarMetrics: readonly RadarMetric[] = [
  {
    key: "pts",
    label: "PTS/G",
    formatter: formatPerGame,
    compute: (stats) => perGame(stats.career.pts, stats.career.games),
  },
  {
    key: "ast",
    label: "AST/G",
    formatter: formatPerGame,
    compute: (stats) => perGame(stats.career.ast, stats.career.games),
  },
  {
    key: "reb",
    label: "REB/G",
    formatter: formatPerGame,
    compute: (stats) => perGame(stats.career.reb, stats.career.games),
  },
  {
    key: "ts",
    label: "TS%",
    formatter: (value) => formatPercent(value, 3),
    compute: (stats) =>
      trueShootingPercentage(stats.career.pts, stats.career.fga, stats.career.fta),
  },
  {
    key: "efg",
    label: "eFG%",
    formatter: (value) => formatPercent(value, 3),
    compute: (stats) =>
      effectiveFieldGoalPercentage(
        stats.career.fgm,
        stats.career.fg3m,
        stats.career.fga,
      ),
  },
  {
    key: "fg3",
    label: "3P%",
    formatter: (value) => formatPercent(value, 3),
    compute: (stats) => (stats.career.fg3a ? stats.career.fg3m / stats.career.fg3a : 0),
  },
];

const buildRadarData = (
  selections: readonly ComparisonSelection[],
): readonly RadarDatum[] => {
  const maxima = new Map<string, number>();

  const frames = radarMetrics.map((metric) => {
    const values = selections.map(({ stats }) => metric.compute(stats));
    const max = Math.max(...values, 0.0001);
    maxima.set(metric.key, max);
    return { metric, values };
  });

  return frames.map(({ metric, values }) => {
    const record: RadarDatum = {
      metric: metric.label,
      metricKey: metric.key,
    };

    selections.forEach(({ summary }, index) => {
      const slug = summary.slug;
      const raw = values[index];
      const max = maxima.get(metric.key) ?? 1;
      const normalized = raw / max;
      record[slug] = normalized;
      record[`${slug}__raw`] = raw;
      record[`${slug}__normalized`] = normalized;
    });

    return record;
  });
};

const buildPtsData = (
  selections: readonly ComparisonSelection[],
): readonly TimelineDatum[] => {
  const longest = Math.max(0, ...selections.map(({ stats }) => stats.seasons.length));

  return Array.from({ length: longest }, (_, yearIndex) => {
    const entry: TimelineDatum = {
      label: `Year ${yearIndex + 1}`,
      index: yearIndex,
    };

    selections.forEach(({ summary, stats }) => {
      const season = stats.seasons[yearIndex];
      if (!season) return;
      entry[summary.slug] = perGame(season.pts, season.games);
      entry[`${summary.slug}__label`] = season.season;
    });

    return entry;
  });
};

const buildTsData = (
  selections: readonly ComparisonSelection[],
): readonly TimelineDatum[] => {
  const longest = Math.max(0, ...selections.map(({ stats }) => stats.seasons.length));

  return Array.from({ length: longest }, (_, yearIndex) => {
    const entry: TimelineDatum = {
      label: `Year ${yearIndex + 1}`,
      index: yearIndex,
    };

    selections.forEach(({ summary, stats }) => {
      const season = stats.seasons[yearIndex];
      if (!season) return;
      entry[summary.slug] = trueShootingPercentage(
        season.pts,
        season.fga,
        season.fta,
      );
      entry[`${summary.slug}__label`] = season.season;
    });

    return entry;
  });
};

const renderRadarTooltip = ({ payload }: ChartTooltipArgs) => {
  if (!isTooltipPayload(payload) || payload.length === 0) return null;

  const firstPayload = payload[0]?.payload;
  const metricKey =
    firstPayload && typeof firstPayload === "object"
      ? (firstPayload as RadarDatum).metricKey
      : undefined;
  const metric = radarMetrics.find((item) => item.key === metricKey);

  return (
    <div className="rounded-xl border border-white/10 bg-base/90 px-3 py-2 text-xs text-white/80">
      {payload.map((entry) => {
        if (!entry || typeof entry.dataKey !== "string") return null;
        if (!entry.payload || typeof entry.payload !== "object") return null;

        const datum = entry.payload as Record<string, unknown>;
        const rawCandidate = datum[`${entry.dataKey}__raw`];
        const normalizedCandidate = datum[`${entry.dataKey}__normalized`];

        const rawValue = typeof rawCandidate === "number" ? rawCandidate : undefined;
        const normalizedValue =
          typeof normalizedCandidate === "number" ? normalizedCandidate : undefined;

        const raw = rawValue !== undefined && metric ? metric.formatter(rawValue) : undefined;
        const normalized =
          normalizedValue !== undefined ? formatPercent(normalizedValue, 1) : undefined;

        return (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: entry.color ?? "#fff" }}
            />
            <span>
              {entry.name ?? "Unknown"}: {raw ?? "—"}
              {normalized ? ` · Axis ${normalized}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const renderPtsTooltip = ({ payload }: ChartTooltipArgs) => {
  if (!isTooltipPayload(payload) || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-base/90 px-3 py-2 text-xs text-white/80">
      {payload.map((entry) => {
        if (!entry || typeof entry.dataKey !== "string") return null;
        if (!entry.payload || typeof entry.payload !== "object") return null;

        const datum = entry.payload as Record<string, unknown>;
        const value = typeof entry.value === "number" ? entry.value : undefined;
        const labelCandidate = datum[`${entry.dataKey}__label`];
        const seasonLabel =
          typeof labelCandidate === "string" ? labelCandidate : undefined;

        return (
          <div key={entry.dataKey} className="flex flex-col">
            <span className="font-semibold">{entry.name ?? "Unknown"}</span>
            <span>
              {value !== undefined ? formatPerGame(value) : "—"} PPG
              {seasonLabel ? ` · ${seasonLabel}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const renderTsTooltip = ({ payload }: ChartTooltipArgs) => {
  if (!isTooltipPayload(payload) || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-base/90 px-3 py-2 text-xs text-white/80">
      {payload.map((entry) => {
        if (!entry || typeof entry.dataKey !== "string") return null;
        if (!entry.payload || typeof entry.payload !== "object") return null;

        const datum = entry.payload as Record<string, unknown>;
        const value = typeof entry.value === "number" ? entry.value : undefined;
        const labelCandidate = datum[`${entry.dataKey}__label`];
        const seasonLabel =
          typeof labelCandidate === "string" ? labelCandidate : undefined;

        return (
          <div key={entry.dataKey} className="flex flex-col">
            <span className="font-semibold">{entry.name ?? "Unknown"}</span>
            <span>
              {value !== undefined ? formatPercent(value, 3) : "—"} TS%
              {seasonLabel ? ` · ${seasonLabel}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export function CompareCharts({ selections }: CompareChartsProps) {
  const shouldReduceMotion = useReducedMotion();

  const radarData = useMemo(() => buildRadarData(selections), [selections]);
  const ptsData = useMemo(() => buildPtsData(selections), [selections]);
  const tsData = useMemo(() => buildTsData(selections), [selections]);
  const radarChartData = useMemo(() => Array.from(radarData), [radarData]);
  const ptsChartData = useMemo(() => Array.from(ptsData), [ptsData]);
  const tsChartData = useMemo(() => Array.from(tsData), [tsData]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        <h3 className="text-base font-semibold text-white">Career Profile Radar</h3>
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer>
            <RadarChart data={radarChartData} outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#e5e7eb", fontSize: 12 }} />
              <Tooltip content={renderRadarTooltip} />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
              {selections.map(({ summary }) => (
                <Radar
                  key={summary.slug}
                  name={summary.name}
                  dataKey={summary.slug}
                  strokeOpacity={0.85}
                  fillOpacity={0.25}
                  strokeWidth={2.4}
                  stroke={`hsl(${(summary.name.length * 47) % 360} 70% 70%)`}
                  fill={`hsl(${(summary.name.length * 47) % 360} 70% 52%)`}
                  isAnimationActive={!shouldReduceMotion}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white">Points per Game Timeline</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={ptsChartData} margin={{ left: 16, right: 24, top: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
                <Tooltip content={renderPtsTooltip} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                {selections.map(({ summary }) => (
                  <Line
                    key={summary.slug}
                    type="monotone"
                    name={summary.name}
                    dataKey={summary.slug}
                    strokeWidth={2.4}
                    stroke={`hsl(${(summary.name.length * 47) % 360} 70% 60%)`}
                    dot={false}
                    isAnimationActive={!shouldReduceMotion}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white">True Shooting% Timeline</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={tsChartData} margin={{ left: 16, right: 24, top: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  tickFormatter={(value) => formatPercent(Number(value), 2)}
                  tick={{ fill: "#cbd5f5", fontSize: 12 }}
                />
                <Tooltip content={renderTsTooltip} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                {selections.map(({ summary }) => (
                  <Line
                    key={summary.slug}
                    type="monotone"
                    name={summary.name}
                    dataKey={summary.slug}
                    strokeWidth={2.4}
                    stroke={`hsl(${(summary.name.length * 47) % 360} 80% 65%)`}
                    dot={false}
                    isAnimationActive={!shouldReduceMotion}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CompareCharts;
