"""
Remediation Agent
Executes automated fixes and recovery actions
"""

import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional
import json

from core.base_agent import (
    BaseAgent,
    AgentType,
    AgentContext,
    AgentResult,
)


class RemediationAction:
    """Represents a remediation action that can be executed"""
    
    def __init__(
        self,
        action_type: str,
        target: str,
        description: str,
        risk_level: str,
        requires_approval: bool = True,
        parameters: Optional[Dict] = None,
    ):
        self.action_type = action_type
        self.target = target
        self.description = description
        self.risk_level = risk_level
        self.requires_approval = requires_approval
        self.parameters = parameters or {}


class RemediationAgent(BaseAgent):
    """
    AI Agent for automated remediation of incidents.
    
    Capabilities:
    - Service restart
    - Scaling (up/down)
    - Rollback deployments
    - Traffic rerouting
    - Cache clearing
    - Resource cleanup
    """
    
    def __init__(self, **kwargs):
        super().__init__(AgentType.REMEDIATION, **kwargs)
        
        # Define available actions and their risk levels
        self.available_actions = {
            "restart_service": {"risk": "medium", "approval_required": True},
            "scale_up": {"risk": "low", "approval_required": False},
            "scale_down": {"risk": "medium", "approval_required": True},
            "rollback_deployment": {"risk": "high", "approval_required": True},
            "clear_cache": {"risk": "low", "approval_required": False},
            "restart_pod": {"risk": "medium", "approval_required": True},
            "drain_node": {"risk": "high", "approval_required": True},
            "trigger_failover": {"risk": "critical", "approval_required": True},
        }
    
    @property
    def name(self) -> str:
        return "Remediation Agent"
    
    @property
    def description(self) -> str:
        return "Executes automated fixes and recovery actions to resolve incidents."
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "Auto-healing (service restarts)",
            "Horizontal scaling",
            "Deployment rollbacks",
            "Cache management",
            "Kubernetes pod recovery",
            "Failover triggering",
        ]
    
    async def execute(self, context: AgentContext) -> AgentResult:
        """
        Determine and execute remediation actions for an incident.
        """
        if not context.incident_id:
            return AgentResult(
                success=False,
                output={},
                error="No incident_id provided for remediation",
            )
        
        self.log_info(f"Starting remediation for incident {context.incident_id}")
        
        try:
            # 1. Get incident with RCA analysis
            incident = await self._get_incident(context.incident_id)
            if not incident:
                return AgentResult(success=False, output={}, error="Incident not found")
            
            # 2. Determine appropriate remediation actions
            actions = await self._determine_actions(incident)
            
            if not actions:
                return AgentResult(
                    success=True,
                    output={"message": "No automatic remediation actions available"},
                    recommendations=["Manual intervention required"],
                )
            
            # 3. Check which actions can be auto-executed
            auto_actions = [a for a in actions if not a.requires_approval]
            pending_approval = [a for a in actions if a.requires_approval]
            
            executed_actions = []
            failed_actions = []
            
            # 4. Execute auto-approved actions
            for action in auto_actions:
                result = await self._execute_action(context.tenant_id, action)
                if result["success"]:
                    executed_actions.append({
                        "action": action.action_type,
                        "target": action.target,
                        "result": result,
                    })
                else:
                    failed_actions.append({
                        "action": action.action_type,
                        "target": action.target,
                        "error": result.get("error"),
                    })
            
            # 5. Create approval requests for high-risk actions
            approval_requests = []
            for action in pending_approval:
                request = await self._create_approval_request(
                    context.tenant_id,
                    context.incident_id,
                    action,
                )
                approval_requests.append(request)
            
            # 6. Send notification about actions taken and pending
            await self._send_notification(
                context.tenant_id,
                incident,
                executed_actions,
                approval_requests,
            )
            
            return AgentResult(
                success=True,
                output={
                    "executed_actions": executed_actions,
                    "failed_actions": failed_actions,
                    "pending_approval": [
                        {"action": a.action_type, "target": a.target}
                        for a in pending_approval
                    ],
                },
                actions_taken=[
                    f"Executed {len(executed_actions)} auto-approved actions",
                    f"Created {len(approval_requests)} approval requests",
                ],
            )
            
        except Exception as e:
            self.log_error(f"Remediation failed: {str(e)}")
            return AgentResult(success=False, output={}, error=str(e))
    
    async def _get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        """Get incident with RCA analysis"""
        try:
            response = await self.call_api("GET", f"/api/incidents/{incident_id}")
            return response.get("incident")
        except Exception as e:
            self.log_error(f"Failed to get incident: {e}")
            return None
    
    async def _determine_actions(self, incident: Dict[str, Any]) -> List[RemediationAction]:
        """Use AI to determine appropriate remediation actions"""
        
        system_prompt = """You are a DevOps remediation expert. Based on the incident information,
suggest appropriate remediation actions. Available actions are:
- restart_service: Restart a service
- scale_up: Increase replicas/instances
- scale_down: Decrease replicas/instances  
- rollback_deployment: Roll back to previous version
- clear_cache: Clear application/CDN cache
- restart_pod: Restart a Kubernetes pod
- drain_node: Drain a Kubernetes node
- trigger_failover: Trigger failover to backup

Respond in JSON format with a list of actions:
[
  {
    "action_type": "action name",
    "target": "what to act on",
    "description": "why this action",
    "risk_level": "low/medium/high/critical"
  }
]"""

        prompt = f"""Incident Details:
Title: {incident.get('title')}
Description: {incident.get('description')}
Severity: {incident.get('severity')}
Root Cause: {incident.get('rootCause', 'Unknown')}

RCA Analysis: {json.dumps(incident.get('rcaAnalysis', {}), indent=2)}

Suggest remediation actions to resolve this incident."""

        response = await self.ask_llm(prompt, system_prompt, temperature=0.2)
        
        actions = []
        try:
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            
            action_data = json.loads(response.strip())
            
            for a in action_data:
                action_info = self.available_actions.get(a["action_type"], {})
                actions.append(RemediationAction(
                    action_type=a["action_type"],
                    target=a["target"],
                    description=a["description"],
                    risk_level=a.get("risk_level", action_info.get("risk", "high")),
                    requires_approval=action_info.get("approval_required", True),
                ))
        except (json.JSONDecodeError, KeyError) as e:
            self.log_warn(f"Failed to parse AI response: {e}")
        
        return actions
    
    async def _execute_action(self, tenant_id: str, action: RemediationAction) -> Dict[str, Any]:
        """Execute a single remediation action"""
        self.log_info(f"Executing action: {action.action_type} on {action.target}")
        
        try:
            # Get integration clients based on action type
            if action.action_type in ["restart_pod", "drain_node", "scale_up", "scale_down"]:
                # Kubernetes actions
                return await self._execute_k8s_action(tenant_id, action)
            elif action.action_type == "rollback_deployment":
                return await self._execute_rollback(tenant_id, action)
            elif action.action_type == "clear_cache":
                return await self._execute_cache_clear(tenant_id, action)
            elif action.action_type == "restart_service":
                return await self._execute_service_restart(tenant_id, action)
            else:
                return {"success": False, "error": f"Unknown action type: {action.action_type}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _execute_k8s_action(self, tenant_id: str, action: RemediationAction) -> Dict[str, Any]:
        """Execute Kubernetes action"""
        # In production, this would use the Kubernetes integration
        self.log_info(f"K8s action: {action.action_type} on {action.target}")
        return {"success": True, "message": f"Executed {action.action_type}"}
    
    async def _execute_rollback(self, tenant_id: str, action: RemediationAction) -> Dict[str, Any]:
        """Execute deployment rollback"""
        self.log_info(f"Rollback: {action.target}")
        return {"success": True, "message": "Rollback initiated"}
    
    async def _execute_cache_clear(self, tenant_id: str, action: RemediationAction) -> Dict[str, Any]:
        """Clear cache"""
        self.log_info(f"Cache clear: {action.target}")
        return {"success": True, "message": "Cache cleared"}
    
    async def _execute_service_restart(self, tenant_id: str, action: RemediationAction) -> Dict[str, Any]:
        """Restart service"""
        self.log_info(f"Service restart: {action.target}")
        return {"success": True, "message": "Service restart initiated"}
    
    async def _create_approval_request(
        self,
        tenant_id: str,
        incident_id: str,
        action: RemediationAction,
    ) -> Dict[str, Any]:
        """Create an approval request for high-risk actions"""
        try:
            response = await self.call_api("POST", "/api/remediations", {
                "incidentId": incident_id,
                "action": action.action_type,
                "target": action.target,
                "description": action.description,
                "riskLevel": action.risk_level,
                "status": "pending",
            })
            return response
        except Exception as e:
            self.log_error(f"Failed to create approval request: {e}")
            return {"error": str(e)}
    
    async def _send_notification(
        self,
        tenant_id: str,
        incident: Dict[str, Any],
        executed: List[Dict],
        pending: List[Dict],
    ):
        """Send notification about remediation actions"""
        try:
            # This would use the Slack integration
            message = f"🔧 Remediation Update for: {incident.get('title')}\n"
            
            if executed:
                message += f"\n✅ Executed {len(executed)} actions:\n"
                for a in executed:
                    message += f"  - {a['action']}: {a['target']}\n"
            
            if pending:
                message += f"\n⏳ Awaiting approval: {len(pending)} actions\n"
            
            self.log_info(message)
        except Exception as e:
            self.log_warn(f"Failed to send notification: {e}")


# Entry point
async def run_remediation_agent(tenant_id: str, incident_id: str):
    agent = RemediationAgent()
    context = AgentContext(
        tenant_id=tenant_id,
        incident_id=incident_id,
        trigger="incident",
    )
    return await agent.execute(context)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python remediation.py <tenant_id> <incident_id>")
        sys.exit(1)
    
    result = asyncio.run(run_remediation_agent(sys.argv[1], sys.argv[2]))
    print(f"Result: {result}")
