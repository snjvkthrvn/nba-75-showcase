import Hero from "@/components/Hero";
import ParallaxStrip from "@/components/ParallaxStrip";
import { getPlayers } from "@/lib/data";

export default async function HomePage() {
  const players = await getPlayers();

  return (
    <div className="space-y-12">
      <Hero featuredPlayers={players} />
      <ParallaxStrip
        items={[
          "Iconic Performances",
          "Shot Charts",
          "Era Context",
          "Advanced Metrics",
          "Playmaking",
          "Dominance",
        ]}
      />
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Crafted for deep dives</h2>
          <p className="text-sm text-white/60">
            NBA 75 Showcase pairs cinematic presentation with fast, client-side motion. Each route loads dedicated JSON payloads so you only fetch the data you need.
          </p>
          <p className="text-sm text-white/60">
            Explore curated player profiles, crunch advanced shooting splits, and compare legends against one another with responsive charts optimized for 60fps rendering.
          </p>
        </div>
        <div className="grid gap-4 text-sm text-white/60">
          <div className="glass rounded-3xl p-5">
            <h3 className="text-base font-semibold text-white">Highlights</h3>
            <ul className="mt-3 space-y-2">
              <li>• D3 hexbin shot visualizations with scatter toggles.</li>
              <li>• Multi-select compare dashboard with radar and timeline charts.</li>
              <li>• Keyboard accessible filtering for the full roster.</li>
            </ul>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="text-base font-semibold text-white">Built for performance</h3>
            <ul className="mt-3 space-y-2">
              <li>• Static JSON sourced from the public directory.</li>
              <li>• Route-based dynamic imports for heavy visualizations.</li>
              <li>• Prefers-reduced-motion respected across animations.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
