import { useMemo, useState } from "react";

const PRIORITY_STYLES = {
  critical: {
    badge: "bg-red-500/15 text-red-300 ring-red-500/30",
    border: "border-red-500/30",
    label: "CRITICAL",
  },
  high: {
    badge: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
    border: "border-orange-500/30",
    label: "HIGH",
  },
  medium: {
    badge: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    border: "border-amber-500/30",
    label: "MEDIUM",
  },
  low: {
    badge: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
    border: "border-sky-500/30",
    label: "LOW",
  },
};

function RecommendationCard({ recommendation, index }) {
  const priority = PRIORITY_STYLES[recommendation.priority] ??
    PRIORITY_STYLES.medium;

  return (
    <article
      className={`rounded-xl border ${priority.border} bg-slate-900/80 p-5`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold tracking-wider ring-1 ${priority.badge}`}
        >
          {priority.label}
        </span>

        <span className="text-xs text-slate-500">
          Recommendation {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-100">
        {recommendation.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-300">
        {recommendation.description}
      </p>

      <div className="mt-4 rounded-lg bg-slate-950/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Why this matters
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-400">
          {recommendation.reason}
        </p>
      </div>

      <div className="mt-4">
        <span className="text-xs text-slate-500">CATEGORY</span>
        <p className="mt-1 text-sm text-slate-300">
          {(recommendation.category || "general").replaceAll("_", " ")}
        </p>
      </div>
    </article>
  );
}

export default function ContainmentRecommendations({
  recommendations = [],
  loading = false,
}) {
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredRecommendations = useMemo(() => {
    if (priorityFilter === "all") {
      return recommendations;
    }

    return recommendations.filter(
      (recommendation) => recommendation.priority === priorityFilter
    );
  }, [recommendations, priorityFilter]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <p className="text-sm text-slate-400">
          Generating containment recommendations...
        </p>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <h2 className="text-lg font-semibold text-white">
          Containment Recommendations
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Run a blast-radius analysis to generate investigation and
          containment recommendations.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Response guidance
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Containment Recommendations
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Prioritized actions based on the modeled blast radius.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-400">
          Priority

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="all">All priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="rounded-lg bg-slate-900 px-3 py-2">
          {recommendations.length} total recommendations
        </span>

        <span className="rounded-lg bg-slate-900 px-3 py-2">
          {recommendations.filter(
            (recommendation) => recommendation.priority === "critical"
          ).length}{" "}
          critical priority
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredRecommendations.map((recommendation, index) => (
          <RecommendationCard
            key={`${recommendation.category}-${recommendation.title}`}
            recommendation={recommendation}
            index={index}
          />
        ))}
      </div>

      <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
        These are advisory recommendations generated from graph relationships
        and heuristic risk scores. Validate findings against telemetry and
        organizational procedures before taking disruptive action.
      </p>
    </section>
  );
}