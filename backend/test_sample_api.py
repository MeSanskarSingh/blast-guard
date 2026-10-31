from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_sample_network_endpoint_returns_success():
    response = client.get("/api/graph/sample")

    assert response.status_code == 200

    body = response.json()

    assert body["status"] == "success"
    assert "graph" in body


def test_sample_network_endpoint_returns_expected_counts():
    response = client.get("/api/graph/sample")

    graph = response.json()["graph"]

    assert len(graph["nodes"]) == 15
    assert len(graph["relationships"]) == 16


def test_sample_network_contains_production_database():
    response = client.get("/api/graph/sample")

    graph = response.json()["graph"]

    node_ids = {
        node["id"] for node in graph["nodes"]
    }

    assert "DB-01" in node_ids
    assert "BACKUP-01" in node_ids


def test_sample_network_contains_security_events():
    response = client.get("/api/graph/sample")

    graph = response.json()["graph"]

    node_ids = {
        node["id"] for node in graph["nodes"]
    }

    assert "EVT-001" in node_ids
    assert "EVT-002" in node_ids