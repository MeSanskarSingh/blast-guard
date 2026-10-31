import { useState } from "react";

export const ATTACK_SCENARIOS = [
  {
    id: "finance-workstation",
    name: "Finance Workstation Compromise",
    category: "Endpoint Compromise",
    severity: "High",
    compromised_node: "WS-042",
    max_hops: 4,
    description:
      "Investigate potential access from a compromised finance workstation to internal applications, identity infrastructure, financial databases, and connected assets.",
    objective:
      "Identify reachable critical assets and prioritize potential financial data exposure.",
  },
  {
    id: "privileged-account",
    name: "Privileged Account Compromise",
    category: "Identity Compromise",
    severity: "Critical",
    compromised_node: "USER-002",
    max_hops: 4,
    description:
      "Investigate the potential impact of a compromised privileged user account and its modeled relationships with workstations, identity services, and downstream infrastructure.",
    objective:
      "Identify high-impact assets reachable through the privileged identity's relationships.",
  },
  {
    id: "hr-workstation",
    name: "HR Workstation Compromise",
    category: "Endpoint Compromise",
    severity: "High",
    compromised_node: "WS-017",
    max_hops: 4,
    description:
      "Investigate potential exposure from an HR workstation to HR applications, identity infrastructure, HR databases, and connected assets.",
    objective:
      "Prioritize HR data exposure and downstream infrastructure risk.",
  },
  {
    id: "production-database",
    name: "Production Database Incident",
    category: "Data Infrastructure",
    severity: "Critical",
    compromised_node: "DB-01",
    max_hops: 3,
    description:
      "Investigate downstream reachability from the production FinanceDB asset, including connected backup infrastructure.",
    objective:
      "Identify downstream assets that may require investigation and protection.",
  },
];

const severityStyles = {
  Critical: "border-red-700/70 bg-red-950/40 text-red-300",
  High: "border-orange-700/70 bg-orange-950/40 text-orange-300",
  Medium: "border-yellow-700/70 bg-yellow-950/40 text-yellow-300",
};

export default function AttackScenarioSelector({
  nodes = [],
  loading = false,
  onApplyScenario,
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    ATTACK_SCENARIOS[0].id
  );

  const selectedScenario =
    ATTACK_SCENARIOS.find(
      (scenario) => scenario.id === selectedScenarioId
    ) || ATTACK_SCENARIOS[0];

  const sourceExists =
    nodes.length > 0 &&
    nodes.some(
      (node) => node.id === selectedScenario?.compromised_node
    );

  const handleApply = () => {
    if (!selectedScenario || !sourceExists || loading) {
      return;
    }

    onApplyScenario?.({
      ...selectedScenario,
    });
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Incident response
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            Attack scenario simulation
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Choose a predefined incident to configure the existing
            blast-radius investigation.
          </p>
        </div>

        {selectedScenario && (
          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
              severityStyles[selectedScenario.severity] ||
              severityStyles.Medium
            }`}
          >
            {selectedScenario.severity} severity
          </span>
        )}
      </div>

      <div className="mt-5">
        <label
          htmlFor="attack-scenario"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Select an incident scenario
        </label>

        <select
          id="attack-scenario"
          value={selectedScenarioId}
          onChange={(event) =>
            setSelectedScenarioId(event.target.value)
          }
          disabled={loading}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
        >
          {ATTACK_SCENARIOS.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      {selectedScenario && (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
              {selectedScenario.category}
            </span>

            <span className="rounded-md border border-slate-700 px-2 py-1 font-mono text-xs text-cyan-300">
              {selectedScenario.compromised_node}
            </span>

            <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400">
              Maximum hops: {selectedScenario.max_hops}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {selectedScenario.description}
          </p>

          <div className="mt-3 border-l-2 border-cyan-500 pl-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Investigation objective
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-400">
              {selectedScenario.objective}
            </p>
          </div>

          {!sourceExists && (
            <p className="mt-3 text-sm text-amber-300">
              The scenario&apos; starting asset is not present in the
              currently loaded graph.
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500">
          Applying a scenario configures an analysis. It does not
          execute an attack or modify network assets.
        </p>

        <button
          type="button"
          onClick={handleApply}
          disabled={!sourceExists || loading}
          className="shrink-0 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing..." : "Apply scenario"}
        </button>
      </div>
    </section>
  );
}