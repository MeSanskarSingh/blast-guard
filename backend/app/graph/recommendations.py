from typing import Any


def generate_containment_recommendations(
    blast_radius_result: dict[str, Any],
) -> list[dict[str, str]]:
    """
    Generate explainable containment recommendations from blast-radius results.

    These are advisory recommendations for a simulated environment.
    They do not execute containment actions.
    """
    recommendations: list[dict[str, str]] = []

    source = blast_radius_result.get("source", {})
    exposed_assets = blast_radius_result.get("exposed_assets", [])
    summary = blast_radius_result.get("summary", {})

    source_id = source.get("asset_id", "unknown")
    source_label = source.get("label", source_id)

    recommendations.append({
        "priority": "critical",
        "category": "initial_containment",
        "title": "Investigate the suspected compromised asset",
        "description": (
            f"Prioritize investigation of {source_label} ({source_id}). "
            "Validate the alert, inspect endpoint telemetry, and preserve "
            "relevant evidence before taking disruptive action."
        ),
        "reason": "This asset was selected as the suspected compromise source.",
    })

    critical_assets = [
        asset
        for asset in exposed_assets
        if asset.get("criticality") == "critical"
    ]

    high_risk_assets = [
        asset
        for asset in exposed_assets
        if asset.get("risk_score", 0) >= 70
    ]

    if critical_assets:
        critical_ids = ", ".join(
            asset.get("asset_id", "unknown")
            for asset in critical_assets[:5]
        )

        recommendations.append({
            "priority": "critical",
            "category": "protect_critical_assets",
            "title": "Prioritize critical infrastructure",
            "description": (
                f"Review access paths to critical assets: {critical_ids}. "
                "Verify access controls, authentication activity, and "
                "recent changes before deciding on containment."
            ),
            "reason": (
                f"{len(critical_assets)} critical asset(s) appear in the "
                "modeled blast radius."
            ),
        })

    if high_risk_assets:
        recommendations.append({
            "priority": "high",
            "category": "investigation",
            "title": "Investigate high-risk reachable assets",
            "description": (
                f"Review {len(high_risk_assets)} reachable asset(s) with "
                "risk scores of 70 or higher. Examine relevant logs, "
                "authentication events, and network connections."
            ),
            "reason": (
                "These assets received high heuristic risk scores in the "
                "blast-radius analysis."
            ),
        })

    recommendations.append({
        "priority": "medium",
        "category": "identity_security",
        "title": "Review identity and privileged access",
        "description": (
            "Inspect authentication events, privileged sessions, and "
            "recent credential use associated with the affected environment. "
            "Consider credential rotation or session revocation if evidence "
            "supports compromise."
        ),
        "reason": (
            "Identity misuse and excessive privileges can expand the impact "
            "of an endpoint compromise."
        ),
    })

    recommendations.append({
        "priority": "medium",
        "category": "network_security",
        "title": "Validate suspicious network relationships",
        "description": (
            "Investigate unusual connections and unexpected access paths "
            "represented in the graph. Correlate them with firewall, DNS, "
            "endpoint, and application logs."
        ),
        "reason": (
            f"The analysis identified {summary.get('reachable_assets', 0)} "
            "reachable asset(s) in the modeled graph."
        ),
    })

    return recommendations