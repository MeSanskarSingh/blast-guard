import { useCallback, useEffect, useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const NODE_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const stylesheet = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "background-color": "#64748b",
      color: "#e2e8f0",
      "font-size": 10,
      "text-wrap": "wrap",
      "text-max-width": 100,
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 8,
      width: 36,
      height: 36,
      "border-width": 2,
      "border-color": "#334155",
      "overlay-opacity": 0,
    },
  },
  {
    selector: 'node[criticality = "low"]',
    style: { "background-color": NODE_COLORS.low },
  },
  {
    selector: 'node[criticality = "medium"]',
    style: { "background-color": NODE_COLORS.medium },
  },
  {
    selector: 'node[criticality = "high"]',
    style: { "background-color": NODE_COLORS.high },
  },
  {
    selector: 'node[criticality = "critical"]',
    style: {
      "background-color": NODE_COLORS.critical,
      "border-color": "#fecaca",
      "border-width": 3,
    },
  },
  {
    selector: 'node[compromised = true]',
    style: {
      "border-color": "#f8fafc",
      "border-width": 4,
      "background-color": "#dc2626",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "#475569",
      "target-arrow-color": "#64748b",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      "arrow-scale": 0.8,
      label: "data(label)",
      color: "#94a3b8",
      "font-size": 8,
      "text-rotation": "autorotate",
      "text-background-color": "#0f172a",
      "text-background-opacity": 0.8,
      "text-background-padding": 2,
    },
  },
  {
    selector: ".blast-unrelated",
    style: {
      opacity: 0.18,
    },
  },
  {
    selector: ".blast-source",
    style: {
      "background-color": "#dc2626",
      "border-color": "#fecaca",
      "border-width": 5,
      width: 48,
      height: 48,
      opacity: 1,
      "z-index": 20,
    },
  },
  {
    selector: ".blast-exposed",
    style: {
      "border-color": "#38bdf8",
      "border-width": 4,
      opacity: 1,
    },
  },
  {
    selector: ".blast-path",
    style: {
      width: 4,
      "line-color": "#38bdf8",
      "target-arrow-color": "#38bdf8",
      opacity: 1,
      "z-index": 10,
    },
  },
  {
    selector: ".selected-node",
    style: {
      "border-color": "#ffffff",
      "border-width": 5,
      "overlay-color": "#ffffff",
      "overlay-opacity": 0.12,
      "overlay-padding": 8,
      "z-index": 30,
    },
  },
];

function getNodeData(elements) {
  return elements
    .filter((element) => element?.data && !element.data.source)
    .map((element) => element.data);
}

function applyBlastRadiusClasses(cy, blastRadius) {
  cy.elements().removeClass(
    "blast-unrelated blast-source blast-exposed blast-path"
  );

  if (!blastRadius) return;

  const sourceId = blastRadius.source?.asset_id;
  const exposedAssets = blastRadius.exposed_assets || [];

  const exposedIds = new Set(
    exposedAssets.map((asset) => asset.asset_id).filter(Boolean)
  );

  const pathEdges = new Set();

  for (const asset of exposedAssets) {
    const path = asset.path || [];

    for (let index = 0; index < path.length - 1; index += 1) {
      const source = path[index]?.id;
      const target = path[index + 1]?.id;

      if (source && target) {
        pathEdges.add(`${source}|||${target}`);
      }
    }
  }

  cy.elements().addClass("blast-unrelated");

  if (sourceId) {
    cy.getElementById(sourceId)
      .removeClass("blast-unrelated")
      .addClass("blast-source");
  }

  for (const nodeId of exposedIds) {
    cy.getElementById(nodeId)
      .removeClass("blast-unrelated")
      .addClass("blast-exposed");
  }

  cy.edges().forEach((edge) => {
    const edgeKey = `${edge.data("source")}|||${edge.data("target")}`;

    if (pathEdges.has(edgeKey)) {
      edge.removeClass("blast-unrelated").addClass("blast-path");
    }
  });
}

export default function NetworkGraph({
  elements = [],
  onNodeSelect,
  blastRadius = null,
}) {
  const graphElements = useMemo(
    () => elements.filter((element) => element?.data),
    [elements]
  );

  const nodeData = useMemo(
    () => getNodeData(graphElements),
    [graphElements]
  );
  const cyRef = useRef(null);

  const handleCy = useCallback(
    (cy) => {
      if (!cy) return;
      cyRef.current = cy;

      cy.off("tap", "node");

      cy.on("tap", "node", (event) => {
        const node = event.target;

        cy.nodes().removeClass("selected-node");
        node.addClass("selected-node");

        if (onNodeSelect) {
          onNodeSelect(node.data());
        }
      });

      applyBlastRadiusClasses(cy, blastRadius);
    },
    [onNodeSelect, blastRadius]
  );

  useEffect(() => {
    if (cyRef.current) {
      applyBlastRadiusClasses(cyRef.current, blastRadius);
    }
  }, [blastRadius, graphElements]);

  const layout = useMemo(
    () => ({
      name: "cose",
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 40,
      nodeRepulsion: () => 7000,
      idealEdgeLength: () => 110,
      edgeElasticity: () => 100,
      gravity: 0.25,
      numIter: 1000,
    }),
    []
  );

  if (graphElements.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400">
        No graph data available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-300">
        <span className="font-semibold text-white">Node criticality:</span>

        {Object.entries(NODE_COLORS).map(([level, color]) => (
          <span key={level} className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        ))}
      </div>

      <div className="network-graph-container overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <CytoscapeComponent
          elements={graphElements}
          stylesheet={stylesheet}
          layout={layout}
          cy={handleCy}
          style={{ width: "100%", height: "650px" }}
          minZoom={0.3}
          maxZoom={2.5}
          wheelSensitivity={0.2}
          boxSelectionEnabled={false}
          autounselectify={false}
        />
      </div>

      {blastRadius && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-red-300 bg-red-600" />
            Analysis source
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-sky-400 bg-slate-500" />
            Reachable asset
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-5 rounded bg-sky-400" />
            Reachability path
          </span>

          <span className="text-slate-500">
            Faded elements are outside the analyzed blast radius.
          </span>
        </div>
      )}

      <p className="text-xs text-slate-500">
        {nodeData.length} nodes ·{" "}
        {graphElements.length - nodeData.length} relationships · Click a node
        to inspect its details.
      </p>
    </div>
  );
}