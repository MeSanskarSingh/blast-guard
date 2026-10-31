import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import RiskBreakdown from "../components/RiskBreakdown";
import BlastRadiusPanel from "../components/BlastRadiusPanel";
import BlastRadiusResults from "../components/BlastRadiusResults";
import ContainmentRecommendations from "../components/ContainmentRecommendations";
import AttackScenarioSelector from "../components/AttackScenarioSelector";
import ThreatOverview from "../components/ThreatOverview";
import AttackPathPanel from "../components/AttackPathPanel";
import RiskDistribution from "../components/RiskDistribution";

const NetworkGraph = dynamic(
  () => import("../components/NetworkGraph"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[650px] items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-400">
        Loading network visualization...
      </div>
    ),
  }
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function GraphPage() {
  const [elements, setElements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [blastRadius, setBlastRadius] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [incidentContext, setIncidentContext] = useState(null);
  const [selectedRiskAsset, setSelectedRiskAsset] = useState(null);

  // Extract graph nodes from Cytoscape elements.
  const nodes = useMemo(
    () =>
      elements
        .filter((element) => element?.data && !element.data.source)
        .map((element) => element.data),
    [elements]
  );

  // Load the network topology from FastAPI.
  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError("");
    setAnalysisError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/graph/visualization`
      );

      if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
          `Backend returned HTTP ${response.status}: ${errorBody}`
        );
      }

      const data = await response.json();

      if (
        data?.status !== "success" ||
        !Array.isArray(data.elements)
      ) {
        throw new Error(
          "The backend returned an unexpected graph response."
        );
      }

      setElements(data.elements);
      setSummary(data.summary || null);

      // Clear results that belong to the previous graph.
      setSelectedNode(null);
      setBlastRadius(null);
      setRecommendations([]);
      setIncidentContext(null);
    } catch (err) {
      setError(
        `${err.message || "An unexpected error occurred."} Make sure the FastAPI backend is running and accessible.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGraph();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchGraph]);

  // Analyze potential exposure from a selected starting asset.
  const analyzeBlastRadius = useCallback(
    async ({ compromised_node, max_hops, scenario = null }) => {
      setAnalysisLoading(true);
      setAnalysisError("");
      setBlastRadius(null);
      setRecommendations([]);
      setIncidentContext(scenario || null);
      setSelectedRiskAsset(null);

      try {
        if (!elements.length) {
          throw new Error(
            "Load the network graph before running an analysis."
          );
        }

        if (!compromised_node) {
          throw new Error("Select a starting asset.");
        }

        const graph = {
          nodes: elements
            .filter(
              (element) =>
                element?.data && !element.data.source
            )
            .map((element) => ({
              id: element.data.id,
              label: element.data.label,
              type: element.data.type,
              criticality: element.data.criticality,
              compromised: element.data.compromised ?? false,
              properties: element.data.properties || {},
            })),

          relationships: elements
            .filter((element) => element?.data?.source)
            .map((element) => ({
              source: element.data.source,
              target: element.data.target,
              type: element.data.type,
              confidence: element.data.confidence,
            })),
        };

        const response = await fetch(
          `${API_BASE_URL}/api/blast-radius/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              graph,
              compromised_node,
              max_hops,
            }),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();

          throw new Error(
            `Backend returned HTTP ${response.status}: ${errorBody}`
          );
        }

        // The API returns a wrapper containing both the analysis
        // result and the containment recommendations.
        const data = await response.json();

        if (
          !data ||
          data.status !== "success" ||
          !data.result ||
          !Array.isArray(data.result.exposed_assets) ||
          !data.result.summary
        ) {
          throw new Error(
            "The backend returned an unexpected blast-radius response."
          );
        }

        setBlastRadius(data.result);

        setRecommendations(
          Array.isArray(data.recommendations)
            ? data.recommendations
            : []
        );

        const sourceNode = nodes.find(
          (node) => node.id === compromised_node
        );

        setSelectedNode(sourceNode || null);
      } catch (err) {
        setAnalysisError(
          err.message || "An unexpected analysis error occurred."
        );
      } finally {
        setAnalysisLoading(false);
      }
    },
    [elements, nodes]
  );

  const handleNodeSelect = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  // Clear the current investigation without reloading the graph.
  const resetAnalysis = useCallback(() => {
    setBlastRadius(null);
    setRecommendations([]);
    setIncidentContext(null);
    setAnalysisError("");
    setSelectedNode(null);
    setSelectedRiskAsset(null);
  }, []);

  const canReset =
    Boolean(blastRadius) ||
    Boolean(analysisError) ||
    Boolean(selectedNode) ||
    recommendations.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Dashboard header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              GraphOps / Threat Intelligence
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Network Attack Surface
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Explore asset relationships, investigate potential attack
              paths, and identify critical infrastructure within the
              modeled enterprise network.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetAnalysis}
              disabled={!canReset || analysisLoading}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset analysis
            </button>

            <button
              type="button"
              onClick={fetchGraph}
              disabled={loading || analysisLoading}
              className="rounded-lg border border-cyan-700 bg-cyan-950/40 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh graph"}
            </button>
          </div>
        </header>

        {/* Graph loading errors */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300"
          >
            <p className="font-semibold">
              Unable to load the network
            </p>

            <p className="mt-1 break-words">{error}</p>

            <button
              type="button"
              onClick={fetchGraph}
              disabled={loading}
              className="mt-3 rounded-md border border-red-800 px-3 py-1.5 font-medium transition hover:bg-red-900/40 disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}

        {/* Network summary cards */}
        {summary && (
          <section
            aria-label="Network summary"
            className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Network assets
              </p>

              <p className="mt-2 text-3xl font-bold">
                {summary.total_nodes ?? nodes.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Relationships
              </p>

              <p className="mt-2 text-3xl font-bold">
                {summary.total_relationships ??
                  elements.filter(
                    (element) => Boolean(element?.data?.source)
                  ).length}
              </p>
            </div>
          </section>
        )}

        {/* Initial loading state */}
        {loading && elements.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
            Fetching enterprise network...
          </div>
        ) : elements.length > 0 ? (
          <>
            {/* Network graph and selected asset details */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    Network topology
                  </h2>

                  <span className="text-xs text-slate-500">
                    {blastRadius
                      ? "Blast-radius analysis active"
                      : "Showing the complete network"}
                  </span>
                </div>

                <NetworkGraph
                  elements={elements}
                  onNodeSelect={handleNodeSelect}
                  blastRadius={blastRadius}
                />

                {/* Criticality legend */}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                  <span>
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500" />
                    Low
                  </span>

                  <span>
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-yellow-500" />
                    Medium
                  </span>

                  <span>
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-orange-500" />
                    High
                  </span>

                  <span>
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500" />
                    Critical
                  </span>
                </div>
              </div>

              {/* Selected asset details */}
              <aside className="h-fit rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-lg font-semibold">
                  Asset details
                </h2>

                {!selectedNode ? (
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Select any node in the graph to inspect its
                    attributes.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Asset name
                      </p>

                      <p className="mt-1 break-words font-semibold text-white">
                        {selectedNode.label || selectedNode.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Asset ID
                      </p>

                      <p className="mt-1 break-all font-mono text-sm">
                        {selectedNode.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Type
                      </p>

                      <p className="mt-1 text-sm capitalize">
                        {(selectedNode.type || "unknown").replaceAll(
                          "_",
                          " "
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Criticality
                      </p>

                      <p className="mt-1 text-sm capitalize">
                        {selectedNode.criticality || "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Compromised status
                      </p>

                      <p
                        className={`mt-1 text-sm ${
                          selectedNode.compromised
                            ? "text-red-300"
                            : "text-slate-300"
                        }`}
                      >
                        {selectedNode.compromised
                          ? "Marked as compromised"
                          : "Not marked as compromised"}
                      </p>
                    </div>

                    {selectedNode.properties &&
                      Object.keys(selectedNode.properties).length > 0 && (
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                            Additional properties
                          </p>

                          <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-300">
                            {JSON.stringify(
                              selectedNode.properties,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
                  </div>
                )}
              </aside>
            </section>

            {/* Blast-radius investigation */}
            <section className="mt-8 border-t border-slate-800 pt-8">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Incident investigation
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Blast-radius analysis
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Select a starting asset and traversal depth to
                  investigate which other assets are reachable through
                  the relationships represented in the network.
                </p>
              </div>
              <ThreatOverview
                result={blastRadius}
                loading={analysisLoading}
              />

              <div className="mt-6">
                <RiskDistribution
                  result={blastRadius}
                  loading={analysisLoading}
                />
              </div>

              <div className="mt-6">
                <BlastRadiusPanel
                  nodes={nodes}
                  onAnalyze={analyzeBlastRadius}
                  loading={analysisLoading}
                />
              </div>

              <div className="mt-6">
                <AttackScenarioSelector
                  nodes={nodes}
                  loading={analysisLoading}
                  onApplyScenario={({ compromised_node, max_hops }) => {
                    analyzeBlastRadius({
                      compromised_node,
                      max_hops,
                    });
                  }}
                />
              </div>

              {analysisLoading && (
                <div
                  role="status"
                  className="mt-4 rounded-lg border border-cyan-800/50 bg-cyan-950/20 p-4 text-sm text-cyan-200"
                >
                  Analyzing graph reachability and prioritizing
                  exposed assets...
                </div>
              )}

              {analysisError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300"
                >
                  <p className="font-semibold">
                    Blast-radius analysis failed
                  </p>

                  <p className="mt-1 break-words">
                    {analysisError}
                  </p>
                </div>
              )}

              {blastRadius && !analysisLoading && incidentContext && (
                <section className="mt-5 rounded-xl border border-cyan-800/60 bg-cyan-950/20 p-5" aria-label="Incident context">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Active incident scenario</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{incidentContext.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{incidentContext.description}</p>
                    </div>
                    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${incidentContext.severity === "Critical" ? "border-red-700 bg-red-950/50 text-red-300" : "border-orange-700 bg-orange-950/50 text-orange-300"}`}>
                      {incidentContext.severity} severity
                    </span>
                  </div>
                  <div className="mt-4 rounded-lg border-l-2 border-cyan-500 pl-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Investigation objective</p>
                    <p className="mt-1 text-sm text-slate-300">{incidentContext.objective}</p>
                  </div>
                </section>
              )}

              {blastRadius && !analysisLoading && (
                <BlastRadiusResults
                  result={blastRadius}
                  onAssetSelect={setSelectedRiskAsset}
                  selectedAssetId={selectedRiskAsset?.asset_id}
                />
                
              )}

              <AttackPathPanel
                result={blastRadius}
                loading={analysisLoading}
              />

              <RiskBreakdown
                asset={selectedRiskAsset}
                loading={analysisLoading}
              />
            </section>
          </>
        ) : (
          !error &&
          !loading && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              The backend returned no graph elements.
            </div>
          )
        )}

        {/* Rule-based containment guidance */}
        <ContainmentRecommendations
          recommendations={recommendations}
          loading={analysisLoading}
        />

        {/* Analysis limitations */}
        <footer className="mt-8 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
          Graph reachability represents potential exposure in the
          modeled network. It does not establish that an asset is
          compromised or that an attack is exploitable. Risk scores
          are heuristic prioritization scores, not calibrated
          probabilities. Containment recommendations are advisory;
          no assets are automatically isolated or modified.
        </footer>
      </div>
    </main>
  );
}