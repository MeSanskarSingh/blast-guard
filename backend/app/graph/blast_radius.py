from typing import Any

import networkx as nx

from app.graph.traversal import (
    find_shortest_path,
    get_reachable_nodes,
)
from app.models.graph_models import AssetCriticality


# Preliminary impact weights, not calibrated probabilities.
CRITICALITY_WEIGHTS = {
    AssetCriticality.LOW.value: 20,
    AssetCriticality.MEDIUM.value: 40,
    AssetCriticality.HIGH.value: 70,
    AssetCriticality.CRITICAL.value: 100,
}


def calculate_asset_risk(
    criticality: str,
    hop_distance: int,
    path_confidence: float,
) -> float:
    """
    Calculate a preliminary prioritization score.

    Higher asset criticality increases the score.
    Greater hop distance reduces the score.
    Lower path confidence reduces the score.

    This is a heuristic prioritization score, not a
    probability that the asset has been compromised.
    """
    if hop_distance < 1:
        raise ValueError("hop_distance must be at least 1")

    if not 0.0 <= path_confidence <= 1.0:
        raise ValueError("path_confidence must be between 0 and 1")

    criticality_weight = CRITICALITY_WEIGHTS.get(
        criticality,
        CRITICALITY_WEIGHTS[AssetCriticality.MEDIUM.value],
    )

    distance_factor = 1 / hop_distance

    score = (
        criticality_weight
        * distance_factor
        * path_confidence
    )

    return round(min(max(score, 0.0), 100.0), 2)


def _calculate_path_confidence(
    relationships: list[dict[str, Any]],
) -> float:
    """
    Combine relationship confidence values along a path.

    The product is a conservative heuristic for path ranking.
    It is NOT a statistically calibrated probability.
    """
    confidence = 1.0

    for relationship in relationships:
        edge_confidence = relationship.get("confidence", 1.0)
        confidence *= float(edge_confidence)

    return round(confidence, 4)


def analyze_blast_radius(
    graph: nx.MultiDiGraph,
    compromised_node: str,
    max_hops: int = 5,
) -> dict[str, Any]:
    """
    Analyze potential exposure originating from an asset.

    Traversal follows outgoing graph edges only.

    The results describe modeled reachability. They do not
    establish that an attacker has compromised every reachable
    asset or can necessarily move through every relationship.
    """
    if compromised_node not in graph:
        raise ValueError(
            f"Unknown compromised node: {compromised_node}"
        )

    if max_hops < 1:
        raise ValueError("max_hops must be at least 1")

    source_attributes = graph.nodes[compromised_node]

    reachable_nodes = get_reachable_nodes(
        graph=graph,
        start_node=compromised_node,
        max_hops=max_hops,
    )

    exposed_assets = []

    for reachable in reachable_nodes:
        target_id = reachable["node_id"]

        path_result = find_shortest_path(
            graph=graph,
            source=compromised_node,
            target=target_id,
        )

        if path_result is None:
            continue

        path_confidence = _calculate_path_confidence(
            path_result["relationships"]
        )

        criticality = reachable["criticality"]

        risk_score = calculate_asset_risk(
            criticality=criticality,
            hop_distance=path_result["hops"],
            path_confidence=path_confidence,
        )

        exposed_assets.append(
            {
                "asset_id": target_id,
                "label": reachable["label"],
                "type": reachable["type"],
                "criticality": criticality,
                "hop_distance": path_result["hops"],
                "path_confidence": path_confidence,
                "risk_score": risk_score,
                "path": [
                    node["id"]
                    for node in path_result["nodes"]
                ],
                "relationships": path_result["relationships"],
                "already_marked_compromised": bool(
                    graph.nodes[target_id].get(
                        "compromised", False
                    )
                ),
            }
        )

    # Highest preliminary risk first.
    exposed_assets.sort(
        key=lambda asset: (
            asset["risk_score"],
            asset["hop_distance"],
        ),
        reverse=True,
    )

    critical_assets = [
        asset
        for asset in exposed_assets
        if asset["criticality"] == AssetCriticality.CRITICAL.value
    ]

    high_priority_assets = [
        asset
        for asset in exposed_assets
        if asset["risk_score"] >= 50
    ]

    return {
        "source": {
            "asset_id": compromised_node,
            "label": source_attributes.get(
                "label", compromised_node
            ),
            "type": source_attributes.get("type"),
            "criticality": source_attributes.get(
                "criticality", "medium"
            ),
        },
        "max_hops": max_hops,
        "summary": {
            "reachable_assets": len(exposed_assets),
            "critical_assets": len(critical_assets),
            "high_priority_assets": len(high_priority_assets),
            "maximum_risk_score": max(
                (
                    asset["risk_score"]
                    for asset in exposed_assets
                ),
                default=0.0,
            ),
        },
        "critical_assets": critical_assets,
        "exposed_assets": exposed_assets,
        "interpretation": (
            "Results represent potential exposure through modeled "
            "directed relationships. They do not confirm compromise "
            "or prove that every path is exploitable."
        ),
    }