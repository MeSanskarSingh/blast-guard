from app.data.sample_network import create_sample_network
from app.graph.builder import build_graph
from app.graph.blast_radius import analyze_blast_radius


def test_sample_network_can_build_graph():
    sample = create_sample_network()
    graph = build_graph(sample)

    assert graph.number_of_nodes() == 15
    assert graph.number_of_edges() == 16


def test_sample_network_contains_critical_database():
    sample = create_sample_network()
    graph = build_graph(sample)

    assert "DB-01" in graph
    assert graph.nodes["DB-01"]["criticality"] == "critical"


def test_finance_workstation_can_reach_production_database():
    sample = create_sample_network()
    graph = build_graph(sample)

    result = analyze_blast_radius(
        graph=graph,
        compromised_node="WS-042",
        max_hops=5,
    )

    exposed_ids = {
        asset["asset_id"] for asset in result["exposed_assets"]
    }

    assert "APP-01" in exposed_ids
    assert "DB-01" in exposed_ids
    assert "BACKUP-01" in exposed_ids


def test_hr_workstation_does_not_reach_finance_database():
    sample = create_sample_network()
    graph = build_graph(sample)

    result = analyze_blast_radius(
        graph=graph,
        compromised_node="WS-017",
        max_hops=5,
    )

    exposed_ids = {
        asset["asset_id"] for asset in result["exposed_assets"]
    }

    assert "DB-02" in exposed_ids
    assert "DB-01" not in exposed_ids