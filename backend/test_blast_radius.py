from app.graph.builder import build_graph
from app.graph.blast_radius import (
    analyze_blast_radius,
    calculate_asset_risk,
)
from app.models.graph_models import (
    AssetCriticality,
    GraphData,
    GraphNode,
    GraphRelationship,
    NodeType,
    RelationshipType,
)


def create_test_graph():
    nodes = [
        GraphNode(
            id="WS-042",
            label="Employee Workstation",
            type=NodeType.ENDPOINT,
            criticality=AssetCriticality.MEDIUM,
            compromised=True,
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

    # Test 1: Basic blast radius
    result = analyze_blast_radius(
        graph=graph,
        compromised_node="WS-042",
        max_hops=5,
    )

    summary = result["summary"]

    assert summary["reachable_assets"] == 3
    assert summary["critical_assets"] == 1

    print("Test 1 passed: Blast radius calculated.")

    # Test 2: Critical database identified
    critical_ids = {
        asset["asset_id"]
        for asset in result["critical_assets"]
    }

    assert critical_ids == {"DB-01"}

    print("Test 2 passed: Critical asset identified.")

    # Test 3: Correct path to database
    database = next(
        asset
        for asset in result["exposed_assets"]
        if asset["asset_id"] == "DB-01"
    )

    assert database["path"] == [
        "WS-042",
        "ADMIN-01",
        "APP-01",
        "DB-01",
    ]

    assert database["hop_distance"] == 3

    print("Test 3 passed: Database exposure path identified.")

    # Test 4: Hop limit respected
    limited_result = analyze_blast_radius(
        graph=graph,
        compromised_node="WS-042",
        max_hops=1,
    )

    assert limited_result["summary"]["reachable_assets"] == 1

    print("Test 4 passed: Hop limit respected.")

    # Test 5: Disconnected asset excluded
    exposed_ids = {
        asset["asset_id"]
        for asset in result["exposed_assets"]
    }

    assert "WS-099" not in exposed_ids

    print("Test 5 passed: Disconnected asset excluded.")

    # Test 6: Risk score calculation
    score = calculate_asset_risk(
        criticality="critical",
        hop_distance=2,
        path_confidence=0.8,
    )

    assert score == 40.0

    print("Test 6 passed: Risk scoring works.")

    # Test 7: Invalid starting asset
    try:
        analyze_blast_radius(
            graph=graph,
            compromised_node="UNKNOWN",
        )
        raise AssertionError("Expected ValueError")

    except ValueError as exc:
        assert "Unknown compromised node" in str(exc)

    print("Test 7 passed: Invalid asset rejected.")

    print("\nAll blast radius tests passed!")

    print("\nSummary:")
    print(f"  Reachable assets: {summary['reachable_assets']}")
    print(f"  Critical assets: {summary['critical_assets']}")
    print(
        "  High-priority assets: "
        f"{summary['high_priority_assets']}"
    )
    print(
        "  Maximum risk score: "
        f"{summary['maximum_risk_score']}"
    )


if __name__ == "__main__":
    main()