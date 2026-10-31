import { useMemo } from "react";

const FACTOR_STYLES = {
  critical: {
    bar: "bg-red-500",
    text: "text-red-300",
  },
  high: {
    bar: "bg-orange-500",
    text: "text-orange-300",
  },
  medium: {
    bar: "bg-amber-400",
    text: "text-amber-300",
  },
  low: {
    bar: "bg-emerald-500",
    text: "text-emerald-300",
  },
};

function getRiskLevel(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function getRiskStyle(level) {
  return FACTOR_STYLES[level.toLowerCase()] || FACTOR_STYLES.medium;
}

function formatLabel(value = "") {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatConfidence(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const percentage = numericValue <= 1 ? numericValue * 100 : numericValue;

  return Math.max(0, Math.min(100, percentage));
}

/**
 * Displays the available risk information for a selected asset.
 *
 * Important:
 * The component does not invent a risk-scoring formula.
 * It explains the available score through its associated context.
 * Any factor contributions shown here are descriptive indicators,
 * not claims about how much each factor mathematically contributed.
 */
export default function RiskBreakdown({
  asset = null,
  loading = false,
}) {
  const riskScore = useMemo(() => {
    const value = Number(asset?.risk_score);

    if (
      asset?.risk_score === null ||
      asset?.risk_score === undefined ||
      asset?.risk_score === "" ||
      !Number.isFinite(value)
    ) {
      return null;
    }

    return Math.max(0, Math.min(100, value));
  }, [asset]);

  const riskLevel = riskScore === null ? null : getRiskLevel(riskScore);
  const riskStyle = riskLevel ? getRiskStyle(riskLevel) : null;

  const confidence = formatConfidence(asset?.confidence);

  const factors = useMemo(() => {
    if (!asset) return [];

    const items = [];

    if (asset.criticality) {
      const criticality = String(asset.criticality).toLowerCase();

      items.push({
        label: "Asset criticality",
        value: formatLabel(criticality),
        description:
          "Indicates the importance of this asset in the modeled environment.",
        level: criticality,
      });
    }

    if (
      asset.hop_distance !== null &&
      asset.hop_distance !== undefined
    ) {
      items.push({
        label: "Hop distance",
        value: `${asset.hop_distance} ${
          Number(asset.hop_distance) === 1 ? "hop" : "hops"
        }`,
        description:
          "Shows the number of graph edges between the starting asset and this asset.",
        level: Number(asset.hop_distance) <= 2 ? "high" : "medium",
      });
    }

    if (confidence !== null) {
      items.push({
        label: "Path confidence",
        value: `${confidence.toFixed(1)}%`,
        description:
          "Represents the confidence associated with the modeled path, as provided by the analysis.",
        level:
          confidence >= 80
            ? "high"
            : confidence >= 50
              ? "medium"
              : "low",
      });
    }

    if (asset.type) {
      items.push({
        label: "Asset type",
        value: formatLabel(asset.type),
        description:
          "Identifies the category of asset reached in the graph.",
        level: "medium",
      });
    }

    return items;
  }, [asset, confidence]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <p className="text-sm text-slate-400">
          Calculating risk information...
        </p>
      </section>
    );
  }

  if (!asset) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <h2 className="text-lg font-semibold text-white">
          Risk Breakdown
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Select an asset from the blast-radius results to inspect its risk
          score and associated indicators.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Risk intelligence
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Risk Breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {asset.label || asset.asset_id || asset.id || "Selected asset"}
          </p>
        </div>

        {riskLevel && (
          <span
            className={`rounded-full border border-current/20 px-3 py-1 text-xs font-semibold ${riskStyle.text}`}
          >
            {riskLevel} risk
          </span>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Heuristic risk score
            </p>

            <p className="mt-2 text-4xl font-bold text-white">
              {riskScore === null ? "N/A" : riskScore.toFixed(1)}
              <span className="ml-1 text-base font-normal text-slate-500">
                / 100
              </span>
            </p>
          </div>

          {riskLevel && (
            <p className={`text-sm font-semibold ${riskStyle.text}`}>
              {riskLevel}
            </p>
          )}
        </div>

        {riskScore !== null && (
          <div
            className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label="Heuristic risk score"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={riskScore}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${riskStyle.bar}`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-slate-400">
          This score is a heuristic prioritization indicator, not a calibrated
          probability that an attack will succeed.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-white">
          Associated risk indicators
        </h3>

        {factors.length > 0 ? (
          <div className="mt-3 space-y-3">
            {factors.map((factor) => {
              const style = getRiskStyle(factor.level);

              return (
                <div
                  key={factor.label}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">
                      {factor.label}
                    </p>

                    <span className={`text-sm font-semibold ${style.text}`}>
                      {factor.value}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {factor.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            No additional risk indicators were supplied for this asset.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-sm font-semibold text-amber-200">
          Interpretation
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-300">
          {riskScore === null
            ? "The analysis did not provide a valid risk score for this asset."
            : `This asset has a heuristic risk score of ${riskScore.toFixed(
                1,
              )}/100. Consider its criticality, modeled reachability, and available path information when prioritizing investigation.`}
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          The indicators above provide context. They are not individual
          mathematical contributions to the score unless the backend
          explicitly supplies those contributions.
        </p>
      </div>
    </section>
  );
}