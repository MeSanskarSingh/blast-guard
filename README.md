# GraphOps — Graph-Based Cyber Threat Hunting and Blast Radius Analysis

GraphOps is a demonstration application for exploring a synthetic enterprise network, analyzing directed asset reachability from a suspected compromise source, ranking potentially exposed assets, and presenting rule-based incident-response recommendations.

> **Important limitation:** Graph reachability is not proof of compromise or exploitability. Risk scores are heuristic prioritization scores, not calibrated probabilities. Recommendations are advisory; the application does not isolate endpoints, revoke sessions, or modify network assets.

## Features

- Interactive enterprise network visualization using Cytoscape.js.
- Asset details including ID, type, criticality, and properties.
- Predefined incident scenarios for finance and HR workstations, a privileged account, and a production database.
- Directed breadth-first reachability analysis with a configurable hop limit.
- Risk-ranked exposed-asset results and modeled paths.
- Rule-based recommendations for investigation, critical-asset protection, identity security, and network review.
- FastAPI backend with request validation and interactive API documentation.
- Synthetic sample network containing 15 nodes and 16 relationships.

## Architecture

```text
Next.js (Pages Router) + React + Tailwind CSS
                  |
                  | HTTP / JSON
                  v
FastAPI REST API
   |              |
   v              v
Pydantic models   Sample enterprise graph
   |              |
   v              v
NetworkX graph builder and directed traversal
                  |
                  v
Blast-radius result + rule-based recommendations
```

### Main routes

| Route | Purpose |
|---|---|
| `/` | GraphOps project landing page |
| `/graph` | Interactive investigation dashboard |
| `/docs` | FastAPI Swagger UI |
| `/health` | Backend health check |

### API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Return API health status |
| `POST` | `/api/graph/analyze` | Summarize a supplied graph's nodes, relationships, and criticality |
| `POST` | `/api/blast-radius/analyze` | Analyze directed reachability and return recommendations |
| `GET` | `/api/graph/sample` | Return the sample network in GraphOps graph schema |
| `GET` | `/api/graph/visualization` | Return sample network elements for Cytoscape.js |

## Requirements

- Node.js compatible with the installed Next.js 16 release
- npm
- Python 3.10 or newer (Python 3.13 is suitable)

## Run locally on Windows PowerShell

Open two PowerShell terminals from the project root.

### 1. Start the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If PowerShell blocks virtual-environment activation, use the Python executable directly after creating the environment:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is available at `http://127.0.0.1:8000`; documentation is at `http://127.0.0.1:8000/docs`.

### 2. Start the frontend

In a second terminal, from the project root:

```powershell
npm install
$env:NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:8000"
npm run dev
```

Open `http://localhost:3000`. The dashboard is available at `http://localhost:3000/graph`.

For a production build:

```powershell
npm run build
npm run start
```

Set `NEXT_PUBLIC_API_BASE_URL` to the deployed API's base URL before building if the backend is hosted elsewhere. Configure the backend CORS allowlist for the actual frontend origin before deployment.

## Run backend tests

From the `backend` directory with the environment activated:

```powershell
python -m pytest -q
```

## Demo walkthrough

1. Open the dashboard and inspect the sample network.
2. Choose an incident scenario or manually select a starting asset.
3. Set the maximum traversal depth and run the analysis.
4. Review highlighted nodes and paths in the graph.
5. Inspect the ranked asset results and recommendations.
6. Reset the investigation and try another scenario.

## How to interpret results

- **Reachable asset:** A node reachable from the source by following outgoing relationships in the directed graph, within the hop limit.
- **Hop distance:** Number of directed relationships in the modeled path from the source.
- **Confidence:** Derived from relationship confidence values along the modeled path; it should not be interpreted as a calibrated real-world probability.
- **Risk score:** A heuristic prioritization score based on modeled attributes and path information, not a probability of compromise.
- **Recommendation:** Rule-based guidance for a human investigator, not an executed response action.

The sample graph is synthetic and designed for demonstration. It is not connected to live endpoint telemetry, an identity provider, SIEM, EDR, or firewall. Relationship direction materially affects traversal results.

## Project structure

```text
blast-guard/
├── backend/
│   ├── app/
│   │   ├── data/sample_network.py
│   │   ├── graph/
│   │   │   ├── blast_radius.py
│   │   │   ├── builder.py
│   │   │   ├── recommendations.py
│   │   │   └── traversal.py
│   │   ├── models/graph_models.py
│   │   └── main.py
│   ├── requirements.txt
│   └── test_*.py
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   └── styles/globals.css
├── package.json
└── README.md
```

## Security and deployment notes

- The included network is synthetic; do not treat it as a live incident feed.
- The API currently has no authentication or authorization. Do not expose it publicly without adding appropriate access controls and deployment hardening.
- Configure CORS narrowly for the deployed frontend origin.
- Avoid sending real secrets, credentials, or sensitive telemetry to a demo deployment.
- Validate all scores and recommendations against operational data and domain expertise before using a similar approach in production.

## Technology stack

- Frontend: Next.js Pages Router, React, Tailwind CSS v4
- Graph visualization: Cytoscape.js and `react-cytoscapejs`
- Backend: FastAPI, Pydantic, NetworkX
- Tests: pytest and FastAPI TestClient
