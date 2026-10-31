from app.models.graph_models import (
    AssetCriticality,
    GraphData,
    GraphNode,
    GraphRelationship,
    NodeType,
    RelationshipType,
)

from app.graph.builder import build_graph
from app.graph.traversal import (
    find_shortest_path,
    get_reachable_nodes,
)


def create_test_graph():
    nodes = [
        GraphNode(
            id="WS-042",
            label="Employee Workstation",
            type=NodeType.ENDPOINT,
            criticality=AssetCriticality.MEDIUM,
        ),
        GraphNode(
            id="ADMIN-01",
            label="Administrator Account",
            type=NodeType.USER,
            criticality=AssetCriticality.HIGH,
        ),
        GraphNode(
            id="APP-01",
            label="Application Server",
            type=NodeType.SERVER,
            criticality=AssetCriticality.HIGH,
        ),
        GraphNode(
            id="DB-01",
            label="Customer Database",
            type=NodeType.SERVER,
            criticality=AssetCriticality.CRITICAL,
        ),
        GraphNode(
            id="WS-099",
            label="Unrelated Workstation",
            type=NodeType.ENDPOINT,
            criticality=AssetCriticality.LOW,
        ),
    ]

    relationships = [
        GraphRelationship(
            source="WS-042",
            target="ADMIN-01",
            type=RelationshipType.AUTHENTICATED_TO,
            confidence=0.95,
        ),
        GraphRelationship(
            source="ADMIN-01",
            target="APP-01",
            type=RelationshipType.HAS_ACCESS_TO,
            confidence=0.90,
        ),
        GraphRelationship(
            source="APP-01",
            target="DB-01",
            type=RelationshipType.HAS_ACCESS_TO,
            confidence=0.98,
        ),
    ]

    return build_graph(
        GraphData(
            nodes=nodes,
            relationships=relationships,
        )
    )


def main():
    graph = create_test_graph()

    # Test 1: Reachability with a two-hop limit
    reachable = get_reachable_nodes(
        graph,
        start_node="WS-042",
        max_hops=2,
    )

    reachable_ids = {
        item["node_id"] for item in reachable
    }

    assert reachable_ids == {"ADMIN-01", "APP-01"}

    print("Test 1 passed: BFS respects the hop limit.")

    # Test 2: Find a path to the critical database
    result = find_shortest_path(
        graph,
        source="WS-042",
        target="DB-01",
    )

    assert result is not None
    assert result["hops"] == 3

    path_ids = [
        node["id"] for node in result["nodes"]
    ]

    assert path_ids == [
        "WS-042",
        "ADMIN-01",
        "APP-01",
        "DB-01",
    ]

    print("Test 2 passed: Shortest path discovered.")

    # Test 3: Filter relationship types
    restricted_path = find_shortest_path(
        graph,
        source="WS-042",
        target="DB-01",
        relationship_types=[
            RelationshipType.AUTHENTICATED_TO
        ],
    )

    assert restricted_path is None

    print("Test 3 passed: Relationship filtering works.")

    # Test 4: An unrelated node should not be reachable
    assert not graph.has_edge("WS-042", "WS-099")

    unreachable = find_shortest_path(
        graph,
        source="WS-042",
        target="WS-099",
    )

    assert unreachable is None

    print("Test 4 passed: Unreachable nodes handled.")

    # Test 5: Unknown starting nodes should raise an error
    try:
        get_reachable_nodes(
            graph,
            start_node="UNKNOWN",
        )
        raise AssertionError("Expected ValueError")

    except ValueError as exc:
        assert "Unknown starting node" in str(exc)

    print("Test 5 passed: Invalid starting node rejected.")

    print("\nAll traversal tests passed!")


if __name__ == "__main__":
    main()