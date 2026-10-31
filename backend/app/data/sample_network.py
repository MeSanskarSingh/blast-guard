from app.models.graph_models import (
    AssetCriticality,
    GraphData,
    GraphNode,
    GraphRelationship,
    NodeType,
    RelationshipType,
)


def create_sample_network() -> GraphData:
    """Create a synthetic enterprise network for GraphOps testing."""

    nodes = [
        # Employee endpoints
        GraphNode(
            id="WS-042",
            label="Finance Workstation",
            type=NodeType.ENDPOINT,
            criticality=AssetCriticality.MEDIUM,
            properties={
                "hostname": "WS-042",
                "department": "Finance",
                "operating_system": "Windows 11",
                "ip_address": "10.0.1.42",
            },
        ),
        GraphNode(
            id="WS-017",
            label="HR Workstation",
            type=NodeType.ENDPOINT,
            criticality=AssetCriticality.LOW,
            properties={
                "hostname": "WS-017",
                "department": "Human Resources",
                "operating_system": "Windows 11",
                "ip_address": "10.0.1.17",
            },
        ),
        GraphNode(
            id="WS-063",
            label="Engineering Workstation",
            type=NodeType.ENDPOINT,
            criticality=AssetCriticality.MEDIUM,
            properties={
                "hostname": "WS-063",
                "department": "Engineering",
                "operating_system": "Ubuntu 24.04",
                "ip_address": "10.0.1.63",
            },
        ),

        # Users
        GraphNode(
            id="USER-001",
            label="Alice Morgan",
            type=NodeType.USER,
            criticality=AssetCriticality.MEDIUM,
            properties={
                "username": "alice.morgan",
                "department": "Finance",
                "privileged": False,
            },
        ),
        GraphNode(
            id="USER-002",
            label="David Chen",
            type=NodeType.USER,
            criticality=AssetCriticality.MEDIUM,
            properties={
                "username": "david.chen",
                "department": "IT",
                "privileged": True,
            },
        ),
        GraphNode(
            id="USER-003",
            label="Sarah Williams",
            type=NodeType.USER,
            criticality=AssetCriticality.LOW,
            properties={
                "username": "sarah.williams",
                "department": "Human Resources",
                "privileged": False,
            },
        ),

        # Identity infrastructure
        GraphNode(
            id="IDP-01",
            label="Identity Provider",
            type=NodeType.SERVER,
            criticality=AssetCriticality.CRITICAL,
            properties={
                "hostname": "idp-01.corp.local",
                "service": "Identity and Authentication",
                "ip_address": "10.0.2.10",
            },
        ),

        # Application servers
        GraphNode(
            id="APP-01",
            label="Internal Business Application",
            type=NodeType.SERVER,
            criticality=AssetCriticality.HIGH,
            properties={
                "hostname": "app-01.corp.local",
                "application": "Business Portal",
                "ip_address": "10.0.3.11",
            },
        ),
        GraphNode(
            id="APP-02",
            label="HR Application",
            type=NodeType.SERVER,
            criticality=AssetCriticality.MEDIUM,
            properties={
                "hostname": "app-02.corp.local",
                "application": "HR Portal",
                "ip_address": "10.0.3.12",
            },
        ),

        # Databases
        GraphNode(
            id="DB-01",
            label="Production Finance Database",
            type=NodeType.SERVER,
            criticality=AssetCriticality.CRITICAL,
            properties={
                "hostname": "db-01.corp.local",
                "database": "FinanceDB",
                "environment": "production",
                "contains_sensitive_data": True,
                "ip_address": "10.0.4.21",
            },
        ),
        GraphNode(
            id="DB-02",
            label="HR Database",
            type=NodeType.SERVER,
            criticality=AssetCriticality.HIGH,
            properties={
                "hostname": "db-02.corp.local",
                "database": "HRDB",
                "environment": "production",
                "contains_sensitive_data": True,
                "ip_address": "10.0.4.22",
            },
        ),

        # Backup infrastructure
        GraphNode(
            id="BACKUP-01",
            label="Central Backup Server",
            type=NodeType.SERVER,
            criticality=AssetCriticality.CRITICAL,
            properties={
                "hostname": "backup-01.corp.local",
                "service": "Enterprise Backup",
                "ip_address": "10.0.5.10",
            },
        ),

        # Network infrastructure
        GraphNode(
            id="IP-EXT-01",
            label="External IP Address",
            type=NodeType.IP_ADDRESS,
            criticality=AssetCriticality.LOW,
            properties={
                "address": "198.51.100.25",
                "scope": "external",
                "note": "Documentation-only IP address",
            },
        ),

        # Security events
        GraphNode(
            id="EVT-001",
            label="Unusual Authentication Activity",
            type=NodeType.SECURITY_EVENT,
            criticality=AssetCriticality.HIGH,
            properties={
                "event_category": "authentication",
                "severity": "high",
                "status": "investigating",
                "description": (
                    "Multiple failed authentication attempts "
                    "followed by a successful login."
                ),
            },
        ),
        GraphNode(
            id="EVT-002",
            label="Unexpected Database Connection",
            type=NodeType.SECURITY_EVENT,
            criticality=AssetCriticality.HIGH,
            properties={
                "event_category": "network",
                "severity": "high",
                "status": "open",
                "description": (
                    "A workstation initiated an unusual "
                    "connection toward a database service."
                ),
            },
        ),
    ]

    relationships = [
        # Users operate their workstations.
        GraphRelationship(
            source="USER-001",
            target="WS-042",
            type=RelationshipType.ACCESSED,
            confidence=0.99,
        ),
        GraphRelationship(
            source="USER-002",
            target="WS-063",
            type=RelationshipType.ACCESSED,
            confidence=0.95,
        ),
        GraphRelationship(
            source="USER-003",
            target="WS-017",
            type=RelationshipType.ACCESSED,
            confidence=0.99,
        ),

        # Workstations communicate with internal services.
        GraphRelationship(
            source="WS-042",
            target="APP-01",
            type=RelationshipType.COMMUNICATED_WITH,
            confidence=0.98,
        ),
        GraphRelationship(
            source="WS-017",
            target="APP-02",
            type=RelationshipType.COMMUNICATED_WITH,
            confidence=0.97,
        ),
        GraphRelationship(
            source="WS-063",
            target="APP-01",
            type=RelationshipType.COMMUNICATED_WITH,
            confidence=0.94,
        ),

        # Applications authenticate against identity infrastructure.
        GraphRelationship(
            source="APP-01",
            target="IDP-01",
            type=RelationshipType.AUTHENTICATED_TO,
            confidence=0.99,
        ),
        GraphRelationship(
            source="APP-02",
            target="IDP-01",
            type=RelationshipType.AUTHENTICATED_TO,
            confidence=0.99,
        ),
        GraphRelationship(
            source="USER-002",
            target="IDP-01",
            type=RelationshipType.AUTHENTICATED_TO,
            confidence=0.98,
        ),

        # Application-to-database access.
        GraphRelationship(
            source="APP-01",
            target="DB-01",
            type=RelationshipType.HAS_ACCESS_TO,
            confidence=0.96,
        ),
        GraphRelationship(
            source="APP-02",
            target="DB-02",
            type=RelationshipType.HAS_ACCESS_TO,
            confidence=0.97,
        ),

        # Backup infrastructure dependencies.
        GraphRelationship(
            source="DB-01",
            target="BACKUP-01",
            type=RelationshipType.COMMUNICATED_WITH,
            confidence=0.99,
        ),
        GraphRelationship(
            source="DB-02",
            target="BACKUP-01",
            type=RelationshipType.COMMUNICATED_WITH,
            confidence=0.95,
        ),

        # External communication observed from the business application.
        GraphRelationship(
            source="APP-01",
            target="IP-EXT-01",
            type=RelationshipType.COMMUNICATED_WITH,
            confidence=0.88,
        ),

        # Associate security events with relevant assets.
        GraphRelationship(
            source="EVT-001",
            target="IDP-01",
            type=RelationshipType.TRIGGERED_ALERT,
            confidence=0.97,
        ),
        GraphRelationship(
            source="EVT-002",
            target="DB-01",
            type=RelationshipType.TRIGGERED_ALERT,
            confidence=0.94,
        ),
    ]

    return GraphData(
        nodes=nodes,
        relationships=relationships,
    )