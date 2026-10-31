from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_visualization_endpoint_returns_success():
    response = client.get("/api/graph/visualization")

    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_visualization_contains_expected_element_counts():
    response = client.get("/api/graph/visualization")
    body = response.json()

    assert body["summary"]["total_nodes"] == 15
    assert body["summary"]["total_relationships"] == 16
    assert len(body["elements"]) == 31


def test_visualization_nodes_have_required_fields():
    response = client.get("/api/graph/visualization")
    elements = response.json()["elements"]

    nodes = [
        element["data"]
        for element in elements
        if "source" not in element["data"]
    ]

    assert len(nodes) == 15

    database = next(
        node for node in nodes
        if node["id"] == "DB-01"
    )

    assert database["criticality"] == "critical"
    assert database["type"] == "server"


def test_visualization_relationships_reference_existing_nodes():
    response = client.get("/api/graph/visualization")
    elements = response.json()["elements"]

    node_ids = {
        element["data"]["id"]
        for element in elements
        if "source" not in element["data"]
    }

    edges = [
        element["data"]
        for element in elements
        if "source" in element["data"]
    ]

    for edge in edges:
        assert edge["source"] in node_ids
        assert edge["target"] in node_ids
        assert edge["id"]