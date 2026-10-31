
const RISK_BANDS = [
  {
    label: "Critical",
    min: 80,
    max: 100,
    color: "bg-red-500",
    text: "text-red-300",
  },
  {
    label: "High",
    min: 60,
    max: 79,
    color: "bg-orange-500",
    text: "text-orange-300",
  },
  {
    label: "Medium",
    min: 35,
    max: 59,
    color: "bg-yellow-500",
    text: "text-yellow-300",
  },
  {
    label: "Low",
    min: 0,
    max: 34,
    color: "bg-emerald-500",
    text: "text-emerald-300",
  },
];

export default function RiskDistribution({
  result = null,
  loading = false,
}) {
  const assets = result?.exposed_assets || [];

  const scoredAssets = assets.filter(
    (asset) =>
      typeof asset.risk_score === "number" &&
      Number.isFinite(asset.risk_score)
  );

  const total = scoredAssets.length;

  const distribution = RISK_BANDS.map((band) => {
    const count = scoredAssets.filter((asset) => {
      const score = asset.risk_score;

      return score >= band.min && score <= band.max;
    }).length;

    return {
      ...band,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    };
  });

  const averageRisk =
    total > 0
      ? scoredAssets.reduce(
          (sum, asset) => sum + asset.risk_score,
          0
        ) / total
      : null;

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-cyan-300">
          Calculating risk distribution...
        </p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Risk intelligence
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          Risk Distribution
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Run an investigation to view the distribution of risk
          across reachable assets.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Risk intelligence
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          Risk Distribution
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Breakdown of exposed assets by heuristic risk score.
        </p>
      </div>

      {total === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">
          No valid risk scores are available for this investigation.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Assets with risk scores
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {total}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Average risk score
              </p>
              <p className="mt-2 text-2xl font-bold text-cyan-300">
                {averageRisk.toFixed(1)}/100
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {distribution.map((band) => (
              <div key={band.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-sm font-medium ${band.text}`}>
                    {band.label}
                  </span>

                  <span className="text-sm tabular-nums text-slate-300">
                    {band.count} assets · {band.percentage.toFixed(1)}%
                  </span>
                </div>

                <div
                  className="h-3 overflow-hidden rounded-full bg-slate-800"
                  role="progressbar"
                  aria-label={`${band.label} risk assets`}
                  aria-valuenow={band.count}
                  aria-valuemin={0}
                  aria-valuemax={total}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${band.color}`}
                    style={{ width: `${band.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
            Risk categories are based on the heuristic score thresholds
            used by this visualization. Assets without a numeric risk
            score are excluded from the distribution.
          </p>
        </>
      )}
    </section>
  );
}
