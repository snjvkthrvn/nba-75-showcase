"use client";

import dynamic from "next/dynamic";

const ShotChart = dynamic(() => import("./ShotChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-sm text-white/60">
      Loading shot chart…
    </div>
  ),
});

export default ShotChart;
