"""
Incident Agent
Detects anomalies and creates incidents automatically
"""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import json

from core.base_agent import (
    BaseAgent,
    AgentType,
    AgentContext,
    AgentResult,
)


class IncidentAgent(BaseAgent):
    """
    AI Agent for incident detection and management.
    
    Capabilities:
    - Anomaly detection from metrics
    - Log analysis for errors
    - Alert correlation
    - Incident prioritization
    - Auto-escalation
    """
    
    def __init__(self, **kwargs):
        super().__init__(AgentType.INCIDENT, **kwargs)
        self.anomaly_thresholds = {
            "error_rate": 5.0,  # %
            "latency_increase": 2.0,  # multiplier
            "availability_drop": 99.0,  # %
        }
    
    @property
    def name(self) -> str:
        return "Incident Detection Agent"
    
    @property
    def description(self) -> str:
        return "Detects anomalies, correlates alerts, and manages incidents automatically."
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "Anomaly detection from metrics",
            "Log analysis for errors",
            "Alert correlation",
            "Incident prioritization with AI",
            "Auto-escalation",
        ]
    
    async def execute(self, context: AgentContext) -> AgentResult:
        """
        Analyze data sources and detect/manage incidents.
        """
        self.log_info(f"Starting incident detection for tenant {context.tenant_id}")
        
        try:
            incidents_created = []
            incidents_updated = []
            
            # 1. Analyze recent health checks for patterns
            health_incidents = await self._analyze_health_data(context.tenant_id)
            incidents_created.extend(health_incidents)
            
            # 2. Analyze metrics for anomalies
            metric_incidents = await self._analyze_metrics(context.tenant_id)
            incidents_created.extend(metric_incidents)
            
            # 3. Correlate and deduplicate incidents
            correlated = await self._correlate_incidents(incidents_created)
            
            # 4. Update existing incidents with new information
            updated = await self._update_existing_incidents(context.tenant_id)
            incidents_updated.extend(updated)
            
            # 5. Auto-resolve stale incidents
            resolved = await self._auto_resolve_incidents(context.tenant_id)
            
            return AgentResult(
                success=True,
                output={
                    "incidents_created": len(correlated),
                    "incidents_updated": len(incidents_updated),
                    "incidents_resolved": len(resolved),
                    "details": {
                        "created": correlated,
                        "updated": incidents_updated,
                        "resolved": resolved,
                    },
                },
                actions_taken=[
                    f"Created {len(correlated)} incidents",
                    f"Updated {len(incidents_updated)} incidents",
                    f"Auto-resolved {len(resolved)} incidents",
                ],
            )
            
        except Exception as e:
            self.log_error(f"Incident detection failed: {str(e)}")
            return AgentResult(
                success=False,
                output={},
                error=str(e),
            )
    
    async def _analyze_health_data(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Analyze health check data for incident patterns"""
        incidents = []
        
        try:
            # Get recent health checks
            response = await self.call_api("GET", f"/api/health-checks?tenantId={tenant_id}&limit=100")
            health_checks = response.get("healthChecks", [])
            
            # Group by website
            by_website: Dict[str, List] = {}
            for check in health_checks:
                website_id = check.get("websiteId")
                if website_id not in by_website:
                    by_website[website_id] = []
                by_website[website_id].append(check)
            
            # Analyze each website
            for website_id, checks in by_website.items():
                # Check for consecutive failures
                failures = [c for c in checks if c.get("status") in ["down", "error"]]
                if len(failures) >= 3:
                    # Use AI to analyze the pattern
                    analysis = await self.analyze_with_llm(
                        data={"failures": failures[-10:]},
                        analysis_type="incident detection",
                        context=f"Website has {len(failures)} failures in recent checks.",
                    )
                    
                    incidents.append({
                        "website_id": website_id,
                        "type": "availability",
                        "title": f"Website experiencing repeated failures",
                        "description": analysis.get("summary", "Multiple health check failures detected"),
                        "severity": analysis.get("severity", "high"),
                        "ai_analysis": analysis,
                    })
            
        except Exception as e:
            self.log_warn(f"Health data analysis failed: {e}")
        
        return incidents
    
    async def _analyze_metrics(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Analyze metrics for anomalies"""
        incidents = []
        
        try:
            # Get recent metrics
            response = await self.call_api("GET", f"/api/metrics?tenantId={tenant_id}&period=1h")
            metrics = response.get("metrics", [])
            
            if not metrics:
                return []
            
            # Use AI to detect anomalies
            analysis = await self.analyze_with_llm(
                data={"metrics": metrics},
                analysis_type="anomaly detection in infrastructure metrics",
                context="Look for unusual patterns, spikes, or degradation in these metrics.",
            )
            
            if analysis.get("severity") in ["critical", "high"]:
                for issue in analysis.get("issues", []):
                    incidents.append({
                        "type": "metric_anomaly",
                        "title": issue,
                        "description": f"Anomaly detected: {issue}",
                        "severity": analysis.get("severity", "medium"),
                        "ai_analysis": analysis,
                    })
            
        except Exception as e:
            self.log_warn(f"Metrics analysis failed: {e}")
        
        return incidents
    
    async def _correlate_incidents(self, incidents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Correlate related incidents to avoid duplicates"""
        if len(incidents) <= 1:
            return incidents
        
        try:
            # Use AI to correlate
            analysis = await self.analyze_with_llm(
                data={"incidents": incidents},
                analysis_type="incident correlation",
                context="Group related incidents that might have a common root cause.",
            )
            
            # For now, just return unique incidents
            # In production, would merge related incidents
            seen_titles = set()
            unique = []
            for inc in incidents:
                if inc["title"] not in seen_titles:
                    seen_titles.add(inc["title"])
                    unique.append(inc)
            
            return unique
            
        except Exception as e:
            self.log_warn(f"Correlation failed: {e}")
            return incidents
    
    async def _update_existing_incidents(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Update existing open incidents with new information"""
        updated = []
        
        try:
            # Get open incidents
            response = await self.call_api("GET", f"/api/incidents?tenantId={tenant_id}&status=open")
            open_incidents = response.get("incidents", [])
            
            for incident in open_incidents:
                # Check if issue is still ongoing
                # This would involve re-checking the affected resource
                pass
            
        except Exception as e:
            self.log_warn(f"Update existing incidents failed: {e}")
        
        return updated
    
    async def _auto_resolve_incidents(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Auto-resolve incidents that appear to be fixed"""
        resolved = []
        
        try:
            # Get investigating incidents older than 30 minutes
            response = await self.call_api(
                "GET",
                f"/api/incidents?tenantId={tenant_id}&status=investigating&olderThan=30m"
            )
            incidents = response.get("incidents", [])
            
            for incident in incidents:
                # Check if the underlying issue is resolved
                # For now, this is a placeholder
                pass
            
        except Exception as e:
            self.log_warn(f"Auto-resolve failed: {e}")
        
        return resolved


# Entry point
async def run_incident_agent(tenant_id: str):
    agent = IncidentAgent()
    context = AgentContext(tenant_id=tenant_id, trigger="scheduled")
    return await agent.execute(context)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python incident.py <tenant_id>")
        sys.exit(1)
    
    result = asyncio.run(run_incident_agent(sys.argv[1]))
    print(f"Result: {result}")
