"""
Agent Scheduler
Runs AI agents on a schedule and handles manual triggers
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from typing import Optional
import httpx

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.monitoring import MonitoringAgent
from agents.incident import IncidentAgent
from agents.rca import RCAAgent
from agents.remediation import RemediationAgent
from core.base_agent import AgentContext, AgentType


class AgentScheduler:
    """
    Scheduler that runs AI agents based on configured schedules.
    Also handles manual triggers via API polling.
    """
    
    def __init__(self, api_base_url: str = "http://localhost:3000"):
        self.api_base_url = api_base_url
        self.agents = {
            AgentType.MONITORING: MonitoringAgent(api_base_url=api_base_url),
            AgentType.INCIDENT: IncidentAgent(api_base_url=api_base_url),
            AgentType.RCA: RCAAgent(api_base_url=api_base_url),
            AgentType.REMEDIATION: RemediationAgent(api_base_url=api_base_url),
        }
        
        # Schedule configuration (in seconds)
        self.schedules = {
            AgentType.MONITORING: 60,       # Every minute
            AgentType.INCIDENT: 300,        # Every 5 minutes
        }
        
        self.last_run = {}
        self.running = False
    
    async def start(self):
        """Start the scheduler loop"""
        self.running = True
        print(f"[Scheduler] Starting agent scheduler at {datetime.utcnow()}")
        
        while self.running:
            try:
                # Check for pending manual tasks
                await self.process_pending_tasks()
                
                # Run scheduled agents
                await self.run_scheduled_agents()
                
                # Wait before next iteration
                await asyncio.sleep(10)
                
            except Exception as e:
                print(f"[Scheduler] Error: {e}")
                await asyncio.sleep(30)
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        print("[Scheduler] Stopping...")
    
    async def process_pending_tasks(self):
        """Check for and process pending manual tasks"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_base_url}/api/agent-tasks",
                    params={"status": "PENDING"},
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    return
                
                data = response.json()
                tasks = data.get("tasks", [])
                
                for task in tasks:
                    await self.execute_task(task)
                    
        except Exception as e:
            print(f"[Scheduler] Error fetching pending tasks: {e}")
    
    async def execute_task(self, task: dict):
        """Execute a single agent task"""
        task_id = task["id"]
        agent_type_str = task["agentType"]
        tenant_id = task.get("tenantId")
        website_id = task.get("websiteId")
        incident_id = task.get("incidentId")
        
        try:
            agent_type = AgentType(agent_type_str.lower())
        except ValueError:
            print(f"[Scheduler] Unknown agent type: {agent_type_str}")
            return
        
        agent = self.agents.get(agent_type)
        if not agent:
            print(f"[Scheduler] Agent not found: {agent_type}")
            return
        
        print(f"[Scheduler] Executing task {task_id} ({agent_type.value})")
        
        # Update task status to RUNNING
        await self.update_task_status(task_id, "RUNNING")
        
        try:
            context = AgentContext(
                tenant_id=tenant_id,
                website_id=website_id,
                incident_id=incident_id,
                trigger=task.get("trigger", "scheduled"),
                input_data=task.get("input", {}),
            )
            
            result = await agent.execute(context)
            
            # Update task with result
            await self.update_task_status(
                task_id,
                "COMPLETED" if result.success else "FAILED",
                output=result.output,
                error_message=result.error,
            )
            
            print(f"[Scheduler] Task {task_id} completed: {result.success}")
            
        except Exception as e:
            await self.update_task_status(task_id, "FAILED", error_message=str(e))
            print(f"[Scheduler] Task {task_id} failed: {e}")
    
    async def run_scheduled_agents(self):
        """Run agents based on their schedules"""
        now = datetime.utcnow()
        
        for agent_type, interval in self.schedules.items():
            last = self.last_run.get(agent_type)
            
            if last is None or (now - last).total_seconds() >= interval:
                self.last_run[agent_type] = now
                
                # Get all tenants and run agent for each
                # For now, we'll skip scheduled runs if no tenants are configured
                # In production, you'd fetch tenant list from database
                pass
    
    async def update_task_status(
        self,
        task_id: str,
        status: str,
        output: Optional[dict] = None,
        error_message: Optional[str] = None,
    ):
        """Update task status via API"""
        try:
            async with httpx.AsyncClient() as client:
                data = {"status": status}
                if output:
                    data["output"] = output
                if error_message:
                    data["errorMessage"] = error_message
                if status in ["COMPLETED", "FAILED"]:
                    data["completedAt"] = datetime.utcnow().isoformat()
                
                await client.patch(
                    f"{self.api_base_url}/api/agent-tasks/{task_id}",
                    json=data,
                    timeout=10.0,
                )
        except Exception as e:
            print(f"[Scheduler] Failed to update task status: {e}")


async def main():
    """Main entry point"""
    api_url = os.getenv("API_BASE_URL", "http://localhost:3000")
    
    scheduler = AgentScheduler(api_base_url=api_url)
    
    try:
        await scheduler.start()
    except KeyboardInterrupt:
        scheduler.stop()


if __name__ == "__main__":
    asyncio.run(main())
