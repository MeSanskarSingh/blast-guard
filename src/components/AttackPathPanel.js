
import { useMemo, useState } from "react";

function normalizePath(path) {
  if (!Array.isArray(path)) return [];

  return path.map((node) => {
    if (typeof node === "string") {
      return { id: node, label: node };
    }

    return {
      id: node?.id || node?.asset_id || "",
      label: node?.label || node?.id || node?.asset_id || "Unknown node",
    };
  });
}

export default function AttackPathPanel({
  result = null,
  loading = false,
}) {
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const assets = result?.exposed_assets || [];
  const source = result?.source || {};

  const selectedAsset = useMemo(
    () =>
      assets.find((asset) => asset.asset_id === selectedAssetId) ||
      null,
    [assets, selectedAssetId]
  );

  const availableAssets = useMemo(
    () =>
      [...assets].sort(
        (a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0)
      ),
    [assets]
  );

  const path = normalizePath(selectedAsset?.path);

  if (loading) {
    return (
      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-cyan-300">
          Loading attack path information...
        </p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Attack intelligence
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          Attack Path Analysis
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Run a blast-radius investigation to inspect the modeled
          paths between the investigation source and exposed assets.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Attack intelligence
        </p>

        <h2 className="mt-1 text-xl font-bold text-white">
          Attack Path Analysis
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Inspect the graph path connecting the investigation source
          to a reachable asset.
        </p>
      </div>

      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Investigation source
        </p>

        <p className="mt-1 font-semibold text-red-300">
          {source.label || source.asset_id || "Unknown source"}
        </p>

        {source.asset_id && (
          <p className="mt-1 font-mono text-xs text-slate-500">
            {source.asset_id}
          </p>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center">
          <p className="text-sm text-slate-400">
            No reachable assets were returned. There are no attack
            paths to inspect for this investigation.
          </p>
        </div>
      ) : (
        <>
          <div>
            <label
              htmlFor="attack-path-target"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Select target asset
            </label>

            <select
              id="attack-path-target"
              value={selectedAssetId}
              onChange={(event) =>
                setSelectedAssetId(event.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">Choose an exposed asset</option>

              {availableAssets.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.label || asset.asset_id} — Risk:{" "}
                  {typeof asset.risk_score === "number"
                    ? Math.round(asset.risk_score)
                    : "N/A"}
                </option>
              ))}
            </select>
          </div>

          {selectedAsset && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-500">Hop distance</p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    {selectedAsset.hop_distance ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-500">Risk score</p>
                  <p className="mt-1 text-xl font-semibold text-orange-300">
                    {typeof selectedAsset.risk_score === "number"
                      ? `${Math.round(selectedAsset.risk_score)}/100`
                      : "N/A"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="mt-1 text-xl font-semibold text-cyan-300">
                    {typeof selectedAsset.confidence === "number"
                      ? `${(selectedAsset.confidence * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Modeled attack path
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {path.length} nodes in the returned path
                </p>
              </div>

              {path.length > 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="space-y-0">
                    {path.map((node, index) => (
                      <div
                        key={`${node.id}-${index}`}
                        className="flex items-stretch gap-3"
                      >
                        <div className="flex w-7 shrink-0 flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                              index === 0
                                ? "border-red-500/50 bg-red-500/10 text-red-300"
                                : index === path.length - 1
                                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                                  : "border-slate-600 bg-slate-800 text-slate-300"
                            }`}
                          >
                            {index + 1}
                          </div>

                          {index < path.length - 1 && (
                            <div className="my-1 min-h-6 w-px flex-1 bg-slate-700" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pb-4">
                          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                            <p className="break-words text-sm font-medium text-white">
                              {node.label}
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-slate-500">
                              {node.id}
                            </p>

                            {index === 0 && (
                              <span className="mt-2 inline-block text-xs text-red-300">
                                Investigation source
                              </span>
                            )}

                            {index === path.length - 1 && (
                              <span className="mt-2 inline-block text-xs text-cyan-300">
                                Selected target
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-700 p-5 text-center">
                  <p className="text-sm text-slate-400">
                    The backend did not return path details for this asset.
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-amber-200">
                  Investigation note
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This path represents graph reachability through modeled
                  relationships. It does not establish that an attacker
                  traversed the path or that every transition is exploitable.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
