"use client";

import clsx from "clsx";
import { hexbin as d3Hexbin } from "d3-hexbin";
import { scaleLinear } from "d3-scale";
import { useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";

import type { ShotLocation } from "@/lib/data";
import { formatPercent } from "@/lib/format";

interface ShotChartProps {
  shots: readonly ShotLocation[];
  className?: string;
}

interface TooltipState {
  x: number;
  y: number;
  attempts: number;
  makes: number;
}

interface BinWithStats {
  x: number;
  y: number;
  points: readonly ShotLocation[];
  attempts: number;
  makes: number;
  accuracy: number;
}

type ChartMode = "hex" | "scatter";

const COURT_WIDTH = 500;
const COURT_HEIGHT = 470;
const COURT_DOMAIN_X: readonly [number, number] = [-25, 25] as const;
const COURT_DOMAIN_Y: readonly [number, number] = [0, 47] as const;

const useScales = () => {
  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain(COURT_DOMAIN_X)
        .range([0, COURT_WIDTH]),
    [],
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain(COURT_DOMAIN_Y)
        .range([COURT_HEIGHT, 0]),
    [],
  );

  return { xScale, yScale };
};

const attemptsAlpha = (attempts: number, maxAttempts: number): number => {
  if (maxAttempts === 0) return 0;
  return scaleLinear<number, number>()
    .domain([0, maxAttempts])
    .range([0.18, 0.78])(attempts);
};

const accuracyAlpha = (accuracy: number): number =>
  scaleLinear<number, number>().domain([0, 1]).range([0.2, 0.92])(accuracy);

const downloadSvgAsPng = async (svg: SVGSVGElement, filename: string) => {
  const { width, height } = svg.viewBox.baseVal;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas rendering context unavailable.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngUrl = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};

export function Court() {
  return (
    <g stroke="rgba(255,255,255,0.15)" strokeWidth={2} fill="none">
      <rect x={0} y={0} width={COURT_WIDTH} height={COURT_HEIGHT} rx={36} />
      <line x1={COURT_WIDTH / 2} y1={0} x2={COURT_WIDTH / 2} y2={150} />
      <circle cx={COURT_WIDTH / 2} cy={120} r={60} strokeDasharray="6 6" />
      <path d={`M0 ${COURT_HEIGHT} H${COURT_WIDTH}`} strokeDasharray="6 6" />
      <path d="M60 470 A190 190 0 0 1 440 470" strokeWidth={3} />
      <path d="M140 470 V320" />
      <path d="M360 470 V320" />
      <rect x={140} y={320} width={220} height={150} />
      <circle cx={COURT_WIDTH / 2} cy={420} r={4} fill="white" />
    </g>
  );
}

export function ShotChartLegend() {
  return (
    <div
      className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/60"
      role="presentation"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-3 w-12 rounded-full bg-gradient-to-r from-white/20 via-white/50 to-white/80" />
        Attempts intensity (darker = more volume)
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-3 w-12 rounded-full bg-gradient-to-r from-emerald-400/20 via-emerald-400/60 to-emerald-400/90" />
        Makes accuracy (brighter = higher FG%)
      </div>
      <p className="text-white/50">
        Coordinates map to an NBA half-court in feet. Toggle scatter to inspect individual
        makes (emerald) and misses (neutral).
      </p>
    </div>
  );
}

export function ShotChart({ shots, className }: ShotChartProps) {
  const { xScale, yScale } = useScales();
  const [mode, setMode] = useState<ChartMode>("hex");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const hexbin = useMemo(() => {
    const generator = d3Hexbin<ShotLocation>();
    generator.x((shot) => xScale(shot.x));
    generator.y((shot) => yScale(shot.y));
    generator.radius(18);
    generator.extent([
      [0, 0],
      [COURT_WIDTH, COURT_HEIGHT],
    ]);
    return generator;
  }, [xScale, yScale]);

  const bins = useMemo(() => {
    if (!shots.length) return [] as BinWithStats[];
    return hexbin(Array.from(shots)).map((bin) => {
      const makes = bin.reduce((count, shot) => count + (shot.make ? 1 : 0), 0);

      return {
        x: bin.x,
        y: bin.y,
        points: bin,
        attempts: bin.length,
        makes,
        accuracy: bin.length ? makes / bin.length : 0,
      } satisfies BinWithStats;
    });
  }, [hexbin, shots]);

  const maxAttempts = useMemo(
    () => (bins.length ? Math.max(...bins.map((bin) => bin.attempts)) : 0),
    [bins],
  );

  const handleModeChange = useCallback(
    (nextMode: ChartMode) => {
      setMode(nextMode);
      if (nextMode === "scatter") {
        setTooltip(null);
      }
    },
    [setTooltip],
  );

  const handleHexEnter = useCallback((bin: BinWithStats) => {
    setTooltip({
      x: bin.x,
      y: bin.y,
      attempts: bin.attempts,
      makes: bin.makes,
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (!svgRef.current) return;
    void downloadSvgAsPng(svgRef.current, "shot-chart.png");
  }, []);

  return (
    <section className={clsx("space-y-4", className)} aria-label="Shot chart analysis">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">Shot Density</h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full border border-white/15 bg-white/[0.04] p-1">
            {[
              { id: "hex", label: "Hex" },
              { id: "scatter", label: "Scatter" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={clsx(
                  "rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.26em] transition",
                  option.id === mode
                    ? "bg-white text-base"
                    : "text-white/60 hover:text-white",
                )}
                onClick={() => handleModeChange(option.id as ChartMode)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-white/70 transition hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
          >
            Download PNG
          </button>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 lg:flex-row">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
          className="h-[420px] w-full flex-1 rounded-3xl border border-white/10 bg-black/10"
          role="img"
          aria-label="NBA half-court shot chart"
          onMouseLeave={() => setTooltip(null)}
        >
          <Court />

          {mode === "hex" && (
            <g>
              {bins.map((bin) => (
                <g
                  key={`${bin.x}-${bin.y}`}
                  transform={`translate(${bin.x},${bin.y})`}
                  onMouseEnter={() => handleHexEnter(bin)}
                >
                  <path
                    d={hexbin.hexagon()}
                    fill={`rgba(255,255,255, ${attemptsAlpha(bin.attempts, maxAttempts)})`}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1}
                  />
                  <path
                    d={hexbin.hexagon()}
                    transform="scale(0.7)"
                    fill={`rgba(74, 222, 128, ${accuracyAlpha(bin.accuracy)})`}
                    style={{ transition: shouldReduceMotion ? "none" : "opacity 140ms ease-out" }}
                  />
                </g>
              ))}
            </g>
          )}

          {mode === "scatter" && (
            <g>
              {shots.map((shot, index) => (
                <circle
                  key={`${shot.x}-${shot.y}-${index}`}
                  cx={xScale(shot.x)}
                  cy={yScale(shot.y)}
                  r={shot.make ? 4 : 3}
                  fill={shot.make ? "#4ade80" : "rgba(255,255,255,0.35)"}
                  opacity={shot.make ? 0.95 : 0.6}
                />
              ))}
            </g>
          )}
        </svg>
        <aside className="flex w-full max-w-xs flex-col gap-4">
          <ShotChartLegend />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/60">
            <p className="font-semibold uppercase tracking-[0.26em] text-white/70">
              Tooltip
            </p>
            {tooltip ? (
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt>Attempts</dt>
                  <dd>{tooltip.attempts}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Makes</dt>
                  <dd>{tooltip.makes}</dd>
                </div>
                <div className="flex justify-between text-white">
                  <dt>FG%</dt>
                  <dd>
                    {formatPercent(
                      tooltip.attempts ? tooltip.makes / tooltip.attempts : 0,
                      2,
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-white/50">
                Hover or focus a hex to reveal volume and efficiency details.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ShotChart;
