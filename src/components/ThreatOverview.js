
function MetricCard({ label, value, description, accent = "cyan" }) {
  const styles = {
    cyan: "border-cyan-500/30 text-cyan-300",
    red: "border-red-500/30 text-red-300",
    orange: "border-orange-500/30 text-orange-300",
    purple: "border-purple-500/30 text-purple-300",
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>

      <p
        className={`mt-3 text-3xl font-bold tracking-tight ${
          styles[accent] || styles.cyan
        }.split(" ")[1]`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function ThreatOverview({
  result = null,
  loading = false,
}) {
  const summary = result?.summary || {};
  const assets = result?.exposed_assets || [];

  const reachableAssets =
    summary.reachable_assets ?? assets.length;

  const criticalAssets = summary.critical_assets ?? 0;
  const highPriorityAssets = summary.high_priority_assets ?? 0;

  const maximumRiskScore =
    typeof summary.maximum_risk_score === "number"
      ? `${Math.round(summary.maximum_risk_score)}/100`
      : "N/A";

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-cyan-300">
          Updating threat overview...
        </p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Security operations
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          Threat Overview
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Run a blast-radius investigation or select an attack scenario
          to view threat intelligence metrics.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Security operations
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          Threat Overview
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Summary of potentially exposed assets in the current investigation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Reachable assets"
          value={reachableAssets}
          description="Assets identified through graph traversal"
          accent="cyan"
        />

        <MetricCard
          label="Critical assets"
          value={criticalAssets}
          description="Reachable assets marked critical"
          accent="red"
        />

        <MetricCard
          label="High-priority assets"
          value={highPriorityAssets}
          description="Assets requiring closer investigation"
          accent="orange"
        />

        <MetricCard
          label="Maximum risk score"
          value={maximumRiskScore}
          description="Highest heuristic risk score"
          accent="purple"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-300">
            Investigation status
          </p>

          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            Analysis completed
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          The analysis identified {reachableAssets} reachable assets.
          These represent potential exposure through modeled network
          relationships, not confirmed compromises.
        </p>
      </div>
    </section>
  );
}
