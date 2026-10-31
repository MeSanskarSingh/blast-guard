import { useMemo, useState } from "react";

const CRITICALITY_STYLES = {
  low: "bg-slate-500/10 text-slate-300 ring-slate-500/30",
  medium: "bg-blue-500/10 text-blue-300 ring-blue-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-orange-500/30",
  critical: "bg-red-500/10 text-red-300 ring-red-500/30",
};

function formatCriticality(value) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatConfidence(value) {
  if (typeof value !== "number") return "N/A";
  return `${(value * 100).toFixed(1)}%`;
}

function formatRiskScore(value) {
  if (typeof value !== "number") return "N/A";
  return `${Math.round(value)}/100`;
}

const getRiskStyles = (score) => {
  if (score >= 80) {
    return {
      label: "Critical",
      className: "bg-red-500/10 text-red-400 ring-red-500/20",
    };
  }

  if (score >= 60) {
    return {
      label: "High",
      className: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
    };
  }

  if (score >= 35) {
    return {
      label: "Medium",
      className: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
    };
  }

  return {
    label: "Low",
    className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  };
};

function Metric({ label, value, description, accent = "default" }) {
  const accents = {
    default: "border-slate-700",
    red: "border-red-500/40",
    orange: "border-orange-500/40",
    blue: "border-blue-500/40",
  };

  return (
    <div
      className={`rounded-xl border ${
        accents[accent] || accents.default
      } bg-slate-900/70 p-4`}
    >
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}

function CriticalityBadge({ value }) {
  const key = (value || "").toLowerCase();

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
        CRITICALITY_STYLES[key] ||
        "bg-slate-500/10 text-slate-300 ring-slate-500/30"
      }`}
    >
      {formatCriticality(value)}
    </span>
  );
}

function RiskBadge({ score }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskStyles(
        score
      )}`}
    >
      {formatRiskScore(score)}
    </span>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-10 text-center">
      <p className="text-sm text-slate-400">{children}</p>
    </div>
  );
}

export default function BlastRadiusResults({
    result,
    onAssetSelect,
    selectedAssetId,
  }) {
  const [search, setSearch] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("risk");

  const assets = result?.exposed_assets || [];
  const summary = result?.summary || {};
  const source = result?.source || {};

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = assets.filter((asset) => {
      const assetId = (asset.asset_id || "").toLowerCase();
      const label = (asset.label || "").toLowerCase();

      const matchesSearch =
        !query || assetId.includes(query) || label.includes(query);

      const matchesCriticality =
        criticalityFilter === "all" ||
        (asset.criticality || "").toLowerCase() === criticalityFilter;

      return matchesSearch && matchesCriticality;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "risk":
          return (b.risk_score ?? 0) - (a.risk_score ?? 0);

        case "hops":
          return (
            (a.hop_distance ?? Number.POSITIVE_INFINITY) -
            (b.hop_distance ?? Number.POSITIVE_INFINITY)
          );

        case "confidence":
          return (b.confidence ?? 0) - (a.confidence ?? 0);

        case "name":
          return (a.label || a.asset_id || "").localeCompare(
            b.label || b.asset_id || ""
          );

        default:
          return 0;
      }
    });
  }, [assets, search, criticalityFilter, sortBy]);

  if (!result) return null;

  const hasActiveFilters =
    search.trim() !== "" || criticalityFilter !== "all";

  function clearFilters() {
    setSearch("");
    setCriticalityFilter("all");
    setSortBy("risk");
  }

  return (
    <section className="mt-6 space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Threat analysis
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Blast Radius Results
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Assets reachable from the selected starting point within the
            configured traversal depth.
          </p>
        </div>

        {source.asset_id && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
            <p className="text-xs text-slate-400">Analysis source</p>
            <p className="mt-1 text-sm font-semibold text-red-300">
              {source.label || source.asset_id}
            </p>
            <p className="text-xs text-slate-500">{source.asset_id}</p>
          </div>
        )}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Reachable assets"
          value={summary.reachable_assets ?? assets.length}
          description="Assets found by graph traversal"
          accent="blue"
        />

        <Metric
          label="Critical assets"
          value={summary.critical_assets ?? 0}
          description="Criticality marked as critical"
          accent="red"
        />

        <Metric
          label="High-priority assets"
          value={summary.high_priority_assets ?? 0}
          description="Assets prioritized by the analysis"
          accent="orange"
        />

        <Metric
          label="Maximum risk score"
          value={
            typeof summary.maximum_risk_score === "number"
              ? `${Math.round(summary.maximum_risk_score)}/100`
              : "N/A"
          }
          description="Highest heuristic risk score"
          accent="red"
        />
      </div>

      {/* Search, filter, and sort */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="mb-4">
          <h3 className="font-medium text-white">Explore exposed assets</h3>
          <p className="mt-1 text-sm text-slate-400">
            Search by asset ID or name, filter by criticality, and change the
            result order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label
              htmlFor="blast-search"
              className="mb-1.5 block text-xs font-medium text-slate-400"
            >
              Search assets
            </label>

            <input
              id="blast-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. DB-01 or FinanceDB"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label
              htmlFor="criticality-filter"
              className="mb-1.5 block text-xs font-medium text-slate-400"
            >
              Criticality
            </label>

            <select
              id="criticality-filter"
              value={criticalityFilter}
              onChange={(event) => setCriticalityFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All criticality levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="blast-sort"
              className="mb-1.5 block text-xs font-medium text-slate-400"
            >
              Sort by
            </label>

            <select
              id="blast-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="risk">Highest risk first</option>
              <option value="hops">Closest to source</option>
              <option value="confidence">Highest confidence first</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400" aria-live="polite">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredAssets.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">{assets.length}</span>{" "}
            reachable assets
          </p>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters && sortBy === "risk"}
            className="self-start rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Asset table */}
      {filteredAssets.length === 0 ? (
        <EmptyState>
          {assets.length === 0
            ? "No other assets were found within the selected traversal depth."
            : "No assets match the current search and filters. Try changing or resetting your filters."}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-3">
            <h3 className="font-medium text-white">Reachable asset inventory</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Criticality</th>
                  <th className="px-4 py-3 font-medium">Hops</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Risk score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.asset_id}
                    onClick={() => onAssetSelect?.(asset)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onAssetSelect?.(asset);
                      }
                    }}
                    tabIndex={0}
                    aria-selected={selectedAssetId === asset.asset_id}
                    className={`cursor-pointer transition hover:bg-slate-900/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 ${
                      selectedAssetId === asset.asset_id
                        ? "bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/40"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">
                        {asset.label || asset.asset_id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {asset.asset_id}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {(asset.type || "unknown").replaceAll("_", " ")}
                    </td>

                    <td className="px-4 py-3">
                      <CriticalityBadge value={asset.criticality} />
                    </td>

                    <td className="px-4 py-3 tabular-nums text-slate-300">
                      {asset.hop_distance ?? "N/A"}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-slate-300">
                      {formatConfidence(asset.confidence)}
                    </td>

                    <td className="px-4 py-3">
                      <RiskBadge score={asset.risk_score} />
                    </td>

                    <td className="px-4 py-3">
                      {asset.already_marked_compromised ? (
                        <span className="inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300">
                          Marked compromised
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">
                          Not marked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reachability paths */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-white">Reachability paths</h3>
          <p className="mt-1 text-sm text-slate-400">
            Graph paths showing how each listed asset is reachable from the
            analysis source.
          </p>
        </div>

        {filteredAssets.length === 0 ? (
          <EmptyState>
            No paths to display for the current result selection.
          </EmptyState>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => {
              const path = asset.path || [];

              return (
                <div
                  key={`path-${asset.asset_id}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {asset.label || asset.asset_id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {asset.asset_id}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        {asset.hop_distance ?? "?"} hops
                      </span>
                      <RiskBadge score={asset.risk_score} />
                    </div>
                  </div>

                  {path.length > 0 ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {path.map((node, index) => (
                        <span
                          key={`${asset.asset_id}-${node.id || node.label || index}-${index}`}
                          className="contents"
                        >
                          {index > 0 && (
                            <span
                              aria-hidden="true"
                              className="text-cyan-500"
                            >
                              →
                            </span>
                          )}

                          <span
                            className={`rounded-lg border px-3 py-2 text-xs ${
                              index === path.length - 1
                                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                                : "border-slate-700 bg-slate-950 text-slate-300"
                            }`}
                            title={node.id || ""}
                          >
                            {node.label || node.id || "Unknown node"}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">
                      No path details were returned for this asset.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interpretation note */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-sm font-medium text-amber-200">
          How to interpret these results
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Reachability indicates potential exposure through the relationships
          represented in the graph; it does not prove that an asset is
          compromised or exploitable. Risk scores are heuristic prioritization
          scores, not calibrated probabilities. Confidence reflects the
          relationship confidence values used by the analysis.
        </p>
      </div>
    </section>
  );
}