"""
RCA (Root Cause Analysis) Agent
AI-powered analysis to identify root causes of incidents
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


class RCAAgent(BaseAgent):
    """
    AI Agent for Root Cause Analysis.
    
    Capabilities:
    - Analyze incident timeline
    - Correlate with deployment history
    - Log analysis
    - Metric correlation
    - Generate actionable insights
    """
    
    def __init__(self, **kwargs):
        super().__init__(AgentType.RCA, **kwargs)
    
    @property
    def name(self) -> str:
        return "Root Cause Analysis Agent"
    
    @property
    def description(self) -> str:
        return "Analyzes incidents to determine root cause using AI and historical data correlation."
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "Incident timeline analysis",
            "Deployment correlation",
            "Log pattern analysis",
            "Metric correlation",
            "AI-powered root cause identification",
        ]
    
    async def execute(self, context: AgentContext) -> AgentResult:
        """
        Perform root cause analysis for an incident.
        """
        if not context.incident_id:
            return AgentResult(
                success=False,
                output={},
                error="No incident_id provided for RCA",
            )
        
        self.log_info(f"Starting RCA for incident {context.incident_id}")
        
        try:
            # 1. Get incident details
            incident = await self._get_incident(context.incident_id)
            if not incident:
                return AgentResult(success=False, output={}, error="Incident not found")
            
            # 2. Gather contextual data
            timeline = await self._build_timeline(context.tenant_id, incident)
            deployments = await self._get_recent_deployments(context.tenant_id, incident)
            logs = await self._get_relevant_logs(context.tenant_id, incident)
            metrics = await self._get_related_metrics(context.tenant_id, incident)
            
            # 3. Use AI to analyze all data
            rca_result = await self._perform_ai_analysis(
                incident=incident,
                timeline=timeline,
                deployments=deployments,
                logs=logs,
                metrics=metrics,
            )
            
            # 4. Update incident with RCA findings
            await self._update_incident_with_rca(context.incident_id, rca_result)
            
            return AgentResult(
                success=True,
                output={
                    "incident_id": context.incident_id,
                    "root_cause": rca_result.get("root_cause"),
                    "confidence": rca_result.get("confidence"),
                    "contributing_factors": rca_result.get("contributing_factors", []),
                    "timeline": timeline,
                    "recommendations": rca_result.get("recommendations", []),
                },
                actions_taken=["Performed root cause analysis", "Updated incident with findings"],
                recommendations=rca_result.get("recommendations", []),
            )
            
        except Exception as e:
            self.log_error(f"RCA failed: {str(e)}")
            return AgentResult(success=False, output={}, error=str(e))
    
    async def _get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        """Get incident details"""
        try:
            response = await self.call_api("GET", f"/api/incidents/{incident_id}")
            return response.get("incident")
        except Exception as e:
            self.log_error(f"Failed to get incident: {e}")
            return None
    
    async def _build_timeline(self, tenant_id: str, incident: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Build a timeline of events around the incident"""
        timeline = []
        incident_time = datetime.fromisoformat(incident.get("createdAt", datetime.utcnow().isoformat()).replace("Z", "+00:00"))
        
        # Add incident creation
        timeline.append({
            "time": incident_time.isoformat(),
            "event": "Incident created",
            "type": "incident",
            "details": incident.get("title"),
        })
        
        # Get events from 1 hour before incident
        start_time = incident_time - timedelta(hours=1)
        
        try:
            # Get health checks around incident time
            response = await self.call_api(
                "GET",
                f"/api/health-checks?tenantId={tenant_id}&from={start_time.isoformat()}"
            )
            for check in response.get("healthChecks", []):
                timeline.append({
                    "time": check.get("checkedAt"),
                    "event": f"Health check: {check.get('status')}",
                    "type": "health_check",
                    "details": check,
                })
        except Exception as e:
            self.log_warn(f"Failed to get health checks: {e}")
        
        # Sort by time
        timeline.sort(key=lambda x: x["time"])
        return timeline
    
    async def _get_recent_deployments(self, tenant_id: str, incident: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get deployments that happened before the incident"""
        deployments = []
        
        try:
            incident_time = datetime.fromisoformat(incident.get("createdAt", datetime.utcnow().isoformat()).replace("Z", "+00:00"))
            start_time = incident_time - timedelta(hours=24)
            
            response = await self.call_api(
                "GET",
                f"/api/deployments?tenantId={tenant_id}&from={start_time.isoformat()}"
            )
            deployments = response.get("deployments", [])
        except Exception as e:
            self.log_warn(f"Failed to get deployments: {e}")
        
        return deployments
    
    async def _get_relevant_logs(self, tenant_id: str, incident: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get error logs around incident time"""
        logs = []
        
        try:
            response = await self.call_api(
                "GET",
                f"/api/logs?tenantId={tenant_id}&level=error&limit=50"
            )
            logs = response.get("logs", [])
        except Exception as e:
            self.log_warn(f"Failed to get logs: {e}")
        
        return logs
    
    async def _get_related_metrics(self, tenant_id: str, incident: Dict[str, Any]) -> Dict[str, Any]:
        """Get metrics around incident time"""
        metrics = {}
        
        try:
            response = await self.call_api(
                "GET",
                f"/api/metrics?tenantId={tenant_id}&period=1h"
            )
            metrics = response.get("metrics", {})
        except Exception as e:
            self.log_warn(f"Failed to get metrics: {e}")
        
        return metrics
    
    async def _perform_ai_analysis(
        self,
        incident: Dict[str, Any],
        timeline: List[Dict[str, Any]],
        deployments: List[Dict[str, Any]],
        logs: List[Dict[str, Any]],
        metrics: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Use AI to analyze data and determine root cause"""
        
        system_prompt = """You are an expert Site Reliability Engineer performing root cause analysis.
Analyze the provided incident data and determine:
1. The most likely root cause
2. Contributing factors
3. Timeline of events leading to the incident
4. Recommendations to prevent recurrence

Respond in JSON format with:
- root_cause: Brief description of the root cause
- confidence: 0-100 confidence level
- contributing_factors: List of factors that contributed
- timeline_summary: Brief summary of what happened
- recommendations: List of actionable recommendations
- evidence: Key evidence supporting your conclusion"""

        prompt = f"""Analyze this incident:

INCIDENT:
Title: {incident.get('title')}
Description: {incident.get('description')}
Severity: {incident.get('severity')}
Created: {incident.get('createdAt')}

TIMELINE:
{json.dumps(timeline[-20:], indent=2)}

RECENT DEPLOYMENTS:
{json.dumps(deployments[-5:], indent=2)}

ERROR LOGS:
{json.dumps(logs[-10:], indent=2)}

METRICS:
{json.dumps(metrics, indent=2)}

Determine the root cause and provide your analysis in JSON format."""

        response = await self.ask_llm(prompt, system_prompt, temperature=0.2)
        
        try:
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            return json.loads(response.strip())
        except json.JSONDecodeError:
            return {
                "root_cause": "Unable to determine with high confidence",
                "confidence": 30,
                "contributing_factors": [],
                "recommendations": ["Manual investigation recommended"],
            }
    
    async def _update_incident_with_rca(self, incident_id: str, rca_result: Dict[str, Any]):
        """Update incident with RCA findings"""
        try:
            await self.call_api("PATCH", f"/api/incidents/{incident_id}", {
                "rootCause": rca_result.get("root_cause"),
                "rcaAnalysis": rca_result,
                "status": "investigating",
            })
        except Exception as e:
            self.log_warn(f"Failed to update incident: {e}")


# Entry point
async def run_rca_agent(tenant_id: str, incident_id: str):
    agent = RCAAgent()
    context = AgentContext(
        tenant_id=tenant_id,
        incident_id=incident_id,
        trigger="incident",
    )
    return await agent.execute(context)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python rca.py <tenant_id> <incident_id>")
        sys.exit(1)
    
    result = asyncio.run(run_rca_agent(sys.argv[1], sys.argv[2]))
    print(f"Result: {result}")
