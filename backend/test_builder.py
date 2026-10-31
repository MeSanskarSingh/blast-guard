import networkx as nx

from app.models.graph_models import (
    AssetCriticality,
    GraphData,
    GraphNode,
    GraphRelationship,
    NodeType,
    RelationshipType,
)
from app.graph.builder import build_graph


def main():
    # Create sample security entities
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
            id="DB-01",
            label="Customer Database",
            type=NodeType.SERVER,
            criticality=AssetCriticality.CRITICAL,
        ),
    ]

    # Create relationships
    relationships = [
        GraphRelationship(
            source="WS-042",
            target="ADMIN-01",
            type=RelationshipType.AUTHENTICATED_TO,
            confidence=0.95,
        ),
        GraphRelationship(
            source="ADMIN-01",
            target="DB-01",
            type=RelationshipType.HAS_ACCESS_TO,
            confidence=0.90,
        ),
    ]

    graph_data = GraphData(
        nodes=nodes,
        relationships=relationships,
    )

    # Build the graph
    graph = build_graph(graph_data)

    # Verify the result
    assert isinstance(graph, nx.MultiDiGraph)
    assert graph.number_of_nodes() == 3
    assert graph.number_of_edges() == 2

    assert graph.has_edge("WS-042", "ADMIN-01")
    assert graph.has_edge("ADMIN-01", "DB-01")

    # Verify node attributes
    assert (
        graph.nodes["DB-01"]["criticality"]
        == AssetCriticality.CRITICAL.value
    )

    # Verify relationship attributes
    edge_data = graph.get_edge_data(
        "WS-042",
        "ADMIN-01",
    )

    relationship = next(iter(edge_data.values()))

    assert (
        relationship["type"]
        == RelationshipType.AUTHENTICATED_TO.value
    )

    assert relationship["confidence"] == 0.95

    print("All graph builder tests passed!")
    print(f"Nodes: {graph.number_of_nodes()}")
    print(f"Relationships: {graph.number_of_edges()}")

    print("\nNodes:")
    for node_id, attributes in graph.nodes(data=True):
        print(
            f"  {node_id}: "
            f"{attributes['type']} | "
            f"{attributes['criticality']}"
        )

    print("\nRelationships:")
    for source, target, attributes in graph.edges(data=True):
        print(
            f"  {source} -> {target}: "
            f"{attributes['type']}"
        )


if __name__ == "__main__":
    main()