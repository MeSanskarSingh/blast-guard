import { useMemo, useState } from "react";
import AttackScenarioSelector from "./AttackScenarioSelector";

export default function BlastRadiusPanel({
  nodes = [],
  onAnalyze,
  loading = false,
}) {
  const [sourceNode, setSourceNode] = useState("");
  const [maxHops, setMaxHops] = useState(4);
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [activeScenario, setActiveScenario] = useState(null);

  const filteredNodes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return nodes;
    }

    return nodes.filter((node) => {
      const label = String(node.label || "").toLowerCase();
      const id = String(node.id || "").toLowerCase();
      const type = String(node.type || "").toLowerCase();

      return (
        label.includes(query) ||
        id.includes(query) ||
        type.includes(query)
      );
    });
  }, [nodes, search]);

  const handleApplyScenario = (scenario) => {
    setSourceNode(scenario.compromised_node);
    setMaxHops(scenario.max_hops);
    setSearch("");
    setFormError("");
    setActiveScenario(scenario);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!sourceNode) {
      setFormError("Select a starting asset before analyzing.");
      return;
    }

    const sourceExists = nodes.some(
      (node) => node.id === sourceNode
    );

    if (!sourceExists) {
      setFormError(
        "The selected starting asset is not present in the current graph."
      );
      return;
    }

    try {
      await onAnalyze?.({
        compromised_node: sourceNode,
        max_hops: Number(maxHops),
        scenario: activeScenario,
      });
    } catch (error) {
      setFormError(
        error.message || "Unable to start the blast-radius analysis."
      );
    }
  };

  const selectedNode = nodes.find(
    (node) => node.id === sourceNode
  );

  return (
    <div className="space-y-5">
      {/* Predefined incident scenarios */}
      <AttackScenarioSelector
        nodes={nodes}
        loading={loading}
        onApplyScenario={handleApplyScenario}
      />

      {/* Manual and scenario-configured analysis */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">
            Configure investigation
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Choose a starting asset and traversal depth. Applying
            a scenario above automatically fills these settings.
          </p>
        </div>

        {activeScenario && (
          <div className="mb-5 flex flex-col gap-2 rounded-lg border border-cyan-800/60 bg-cyan-950/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Selected scenario
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {activeScenario.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveScenario(null)}
              disabled={loading}
              className="w-fit text-xs font-medium text-slate-400 transition hover:text-white disabled:opacity-50"
            >
              Switch to manual setup
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Starting asset */}
          <div>
            <label
              htmlFor="asset-search"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Find a starting asset
            </label>

            <input
              id="asset-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by asset name, ID, or type..."
              disabled={loading}
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
            />

            <label
              htmlFor="source-node"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Starting asset
            </label>

            <select
              id="source-node"
              value={sourceNode}
              onChange={(event) => {
                setSourceNode(event.target.value);
                setActiveScenario(null);
                setFormError("");
              }}
              disabled={loading || nodes.length === 0}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
            >
              <option value="">
                Select an asset...
              </option>

              {filteredNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label || node.id} ({node.id})
                </option>
              ))}
            </select>

            {filteredNodes.length === 0 && nodes.length > 0 && (
              <p className="mt-2 text-xs text-amber-300">
                No assets match your search.
              </p>
            )}

            {selectedNode && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
                  {selectedNode.type || "Unknown type"}
                </span>

                <span className="rounded-md border border-slate-700 px-2 py-1 text-xs capitalize text-slate-300">
                  {selectedNode.criticality || "Unknown"} criticality
                </span>
              </div>
            )}
          </div>

          {/* Traversal depth */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="max-hops"
                className="text-sm font-medium text-slate-300"
              >
                Maximum traversal depth
              </label>

              <span className="rounded-md border border-cyan-800 bg-cyan-950/40 px-2.5 py-1 text-sm font-semibold text-cyan-300">
                {maxHops} {maxHops === 1 ? "hop" : "hops"}
              </span>
            </div>

            <input
              id="max-hops"
              type="range"
              min="1"
              max="8"
              step="1"
              value={maxHops}
              onChange={(event) => {
                setMaxHops(Number(event.target.value));
                setActiveScenario(null);
              }}
              disabled={loading}
              className="w-full cursor-pointer accent-cyan-400 disabled:cursor-not-allowed"
            />

            <div className="flex justify-between text-xs text-slate-500">
              <span>1 hop</span>
              <span>8 hops</span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              A hop represents one directed relationship in the
              modeled graph. Increasing the depth may reveal more
              potentially reachable assets.
            </p>
          </div>

          {/* Form errors */}
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-300"
            >
              {formError}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              This analysis evaluates modeled reachability. It
              does not execute an attack or isolate assets.
            </p>

            <button
              type="submit"
              disabled={loading || !sourceNode || nodes.length === 0}
              className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Analyzing network..."
                : "Run blast-radius analysis"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}