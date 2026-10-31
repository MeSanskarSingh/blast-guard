import networkx as nx

from app.models.graph_models import GraphData


def build_graph(graph_data: GraphData) -> nx.MultiDiGraph:
    """
    Build a directed NetworkX graph from GraphOps data.

    Nodes represent assets or security entities.
    Edges represent relationships between those entities.

    MultiDiGraph allows multiple relationships between
    the same pair of nodes.
    """

    graph = nx.MultiDiGraph()

    # Store graph metadata
    graph.graph["name"] = "GraphOps Security Graph"

    # Step 1: Add nodes
    for node in graph_data.nodes:
        if node.id in graph:
            raise ValueError(
                f"Duplicate node ID detected: {node.id}"
            )

        graph.add_node(
            node.id,
            **node.model_dump(mode="json")
        )

    # Step 2: Add relationships
    for relationship in graph_data.relationships:
        source = relationship.source
        target = relationship.target

        # Validate relationship endpoints
        if source not in graph:
            raise ValueError(
                f"Relationship references unknown source: {source}"
            )

        if target not in graph:
            raise ValueError(
                f"Relationship references unknown target: {target}"
            )

        graph.add_edge(
            source,
            target,
            **relationship.model_dump(
                mode="json",
                exclude={"source", "target"}
            )
        )

    return graph