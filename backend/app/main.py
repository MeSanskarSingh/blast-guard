from collections import Counter

import networkx as nx

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.models.graph_models import GraphData
from app.graph.builder import build_graph
from app.graph.blast_radius import analyze_blast_radius
from app.data.sample_network import create_sample_network
from app.graph.recommendations import generate_containment_recommendations


# --------------------------------------------------
# Application configuration
# --------------------------------------------------

app = FastAPI(
    title="BlastGuard API",
    description=(
        "Graph-based cyber threat hunting "
        "and blast radius analysis platform."
    ),
    version="1.0.0",
)


# --------------------------------------------------
# CORS configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://blast-guard.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# --------------------------------------------------
# Request schemas
# --------------------------------------------------

class GraphAnalysisRequest(BaseModel):
    graph: GraphData


class BlastRadiusRequest(BaseModel):
    graph: GraphData
    compromised_node: str = Field(min_length=1)
    max_hops: int = Field(default=5, ge=1, le=20)


# --------------------------------------------------
# Health endpoint
# --------------------------------------------------

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "GraphOps API",
        "version": "0.1.0",
    }


# --------------------------------------------------
# Graph analysis endpoint
# --------------------------------------------------

@app.post("/api/graph/analyze", tags=["Graph"])
def analyze_graph(request: GraphAnalysisRequest):
    try:
        graph = build_graph(request.graph)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    node_types = Counter(
        attributes.get("type", "unknown")
        for _, attributes in graph.nodes(data=True)
    )

    relationship_types = Counter(
        attributes.get("type", "unknown")
        for _, _, attributes in graph.edges(data=True)
    )

    criticality_counts = Counter(
        attributes.get("criticality", "unknown")
        for _, attributes in graph.nodes(data=True)
    )

    return {
        "status": "success",
        "graph": {
            "name": graph.graph["name"],
            "total_nodes": graph.number_of_nodes(),
            "total_relationships": graph.number_of_edges(),
            "node_types": dict(node_types),
            "relationship_types": dict(relationship_types),
            "criticality_distribution": dict(criticality_counts),
            "is_directed": graph.is_directed(),
        },
    }


# --------------------------------------------------
# Blast radius analysis endpoint
# --------------------------------------------------

@app.post("/api/blast-radius/analyze", tags=["Blast Radius"])
def blast_radius_analysis(request: BlastRadiusRequest):
    try:
        graph = build_graph(request.graph)

        result = analyze_blast_radius(
            graph=graph,
            compromised_node=request.compromised_node,
            max_hops=request.max_hops,
        )

        recommendations = generate_containment_recommendations(result)

        return {
            "status": "success",
            "result": result,
            "recommendations": recommendations,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


# --------------------------------------------------
# Root endpoint
# --------------------------------------------------

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to GraphOps API",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/api/graph/sample", tags=["Graph"])
def get_sample_network():
    """
    Return the synthetic enterprise network.

    This dataset is intended for development and demonstration.
    """
    sample = create_sample_network()

    return {
        "status": "success",
        "graph": sample.model_dump(mode="json"),
    }

@app.get("/api/graph/visualization", tags=["Graph"])
def get_graph_visualization():
    """
    Return the synthetic enterprise network in Cytoscape.js format.
    """
    sample = create_sample_network()

    elements = []

    # Convert nodes into Cytoscape.js elements.
    for node in sample.nodes:
        elements.append({
            "data": {
                "id": node.id,
                "label": node.label,
                "type": node.type,
                "criticality": node.criticality,
                "compromised": node.compromised,
                "properties": node.properties,
            }
        })

    # Convert relationships into Cytoscape.js elements.
    for index, relationship in enumerate(sample.relationships):
        elements.append({
            "data": {
                "id": (
                    f"edge-{index}-"
                    f"{relationship.source}-"
                    f"{relationship.target}"
                ),
                "source": relationship.source,
                "target": relationship.target,
                "label": relationship.type,
                "type": relationship.type,
                "confidence": relationship.confidence,
            }
        })

    return {
        "status": "success",
        "elements": elements,
        "summary": {
            "total_nodes": len(sample.nodes),
            "total_relationships": len(sample.relationships),
            "total_elements": len(elements),
        },
    }