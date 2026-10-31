from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class NodeType(str, Enum):
    ENDPOINT = "endpoint"
    SERVER = "server"
    USER = "user"
    IP_ADDRESS = "ip_address"
    APPLICATION = "application"
    SECURITY_EVENT = "security_event"


class RelationshipType(str, Enum):
    COMMUNICATED_WITH = "communicated_with"
    AUTHENTICATED_TO = "authenticated_to"
    HAS_ACCESS_TO = "has_access_to"
    RUNS_ON = "runs_on"
    ACCESSED = "accessed"
    TRIGGERED_ALERT = "triggered_alert"


class AssetCriticality(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class GraphNode(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str = Field(min_length=1, description="Unique identifier")
    label: str = Field(min_length=1, description="Display name")
    type: NodeType
    criticality: AssetCriticality = AssetCriticality.MEDIUM
    compromised: bool = False
    properties: dict[str, Any] = Field(default_factory=dict)


class GraphRelationship(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    source: str = Field(min_length=1)
    target: str = Field(min_length=1)
    type: RelationshipType
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    observed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    properties: dict[str, Any] = Field(default_factory=dict)


class GraphData(BaseModel):
    nodes: list[GraphNode] = Field(default_factory=list)
    relationships: list[GraphRelationship] = Field(default_factory=list)