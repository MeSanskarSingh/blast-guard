from collections import deque
from typing import Iterable

import networkx as nx

from app.models.graph_models import RelationshipType


def _normalize_relationship_types(
    relationship_types: Iterable[str | RelationshipType] | None,
) -> set[str] | None:
    """
    Normalize relationship types into strings.

    If None is supplied, all relationship types are allowed.
    """
    if relationship_types is None:
        return None

    return {
        item.value if isinstance(item, RelationshipType) else item
        for item in relationship_types
    }


def _get_valid_relationships(
    graph: nx.MultiDiGraph,
    source: str,
    target: str,
    allowed_types: set[str] | None = None,
) -> list[dict]:
    """
    Retrieve relationships connecting two nodes.

    Filters relationships by type when requested.
    """
    edge_data = graph.get_edge_data(source, target, default={})
    relationships = []

    for attributes in edge_data.values():
        relationship_type = attributes.get("type")

        if (
            allowed_types is not None
            and relationship_type not in allowed_types
        ):
            continue

        relationships.append(attributes)

    return relationships


def get_reachable_nodes(
    graph: nx.MultiDiGraph,
    start_node: str,
    max_hops: int = 3,
    relationship_types: Iterable[str | RelationshipType] | None = None,
) -> list[dict]:
    """
    Find nodes reachable from a starting node using BFS.

    Parameters:
        graph: NetworkX directed multigraph.
        start_node: Node from which traversal begins.
        max_hops: Maximum number of edges to traverse.
        relationship_types: Optional relationship type filter.

    Returns:
        A list containing reachable node IDs and hop distances.

    Note:
        This follows outgoing edges only. Reachability represents
        graph connectivity, not confirmed attacker capability.
    """
    if start_node not in graph:
        raise ValueError(f"Unknown starting node: {start_node}")

    if max_hops < 0:
        raise ValueError("max_hops must be non-negative")

    allowed_types = _normalize_relationship_types(
        relationship_types
    )

    queue = deque([(start_node, 0)])
    visited = {start_node}
    reachable = []

    while queue:
        current_node, distance = queue.popleft()

        if distance >= max_hops:
            continue

        for neighbor in graph.successors(current_node):
            if neighbor in visited:
                continue

            relationships = _get_valid_relationships(
                graph,
                current_node,
                neighbor,
                allowed_types,
            )

            # The neighbor is traversable only if at least one
            # relationship satisfies the requested filter.
            if not relationships:
                continue

            visited.add(neighbor)
            next_distance = distance + 1

            queue.append((neighbor, next_distance))

            reachable.append(
                {
                    "node_id": neighbor,
                    "distance": next_distance,
                    "label": graph.nodes[neighbor].get(
                        "label", neighbor
                    ),
                    "type": graph.nodes[neighbor].get("type"),
                    "criticality": graph.nodes[neighbor].get(
                        "criticality", "medium"
                    ),
                }
            )

    return reachable


def find_shortest_path(
    graph: nx.MultiDiGraph,
    source: str,
    target: str,
    relationship_types: Iterable[str | RelationshipType] | None = None,
) -> dict | None:
    """
    Find the shortest directed path between two nodes.

    Returns:
        A dictionary containing the node sequence and the
        selected relationships, or None if no path exists.

    If multiple relationships connect two consecutive nodes,
    the relationship with the highest confidence is selected.
    """
    if source not in graph:
        raise ValueError(f"Unknown source node: {source}")

    if target not in graph:
        raise ValueError(f"Unknown target node: {target}")

    allowed_types = _normalize_relationship_types(
        relationship_types
    )

    # Build a filtered directed graph for path finding.
    filtered_graph = nx.DiGraph()
    filtered_graph.add_nodes_from(graph.nodes(data=True))

    for u, v in graph.edges():
        relationships = _get_valid_relationships(
            graph,
            u,
            v,
            allowed_types,
        )

        if relationships:
            filtered_graph.add_edge(u, v)

    try:
        path = nx.shortest_path(
            filtered_graph,
            source=source,
            target=target,
        )
    except nx.NetworkXNoPath:
        return None

    path_relationships = []

    for index in range(len(path) - 1):
        u = path[index]
        v = path[index + 1]

        candidates = _get_valid_relationships(
            graph,
            u,
            v,
            allowed_types,
        )

        # Prefer the relationship with the highest recorded
        # confidence when parallel relationships exist.
        selected = max(
            candidates,
            key=lambda item: item.get("confidence", 1.0),
        )

        path_relationships.append(
            {
                "source": u,
                "target": v,
                "type": selected.get("type"),
                "confidence": selected.get("confidence", 1.0),
                "observed_at": selected.get("observed_at"),
                "properties": selected.get("properties", {}),
            }
        )

    return {
        "source": source,
        "target": target,
        "hops": len(path) - 1,
        "nodes": [
            {
                "id": node_id,
                **graph.nodes[node_id],
            }
            for node_id in path
        ],
        "relationships": path_relationships,
    }