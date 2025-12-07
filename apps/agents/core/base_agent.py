"""
Base Agent Module
Foundation for all AI DevOps agents
"""

import asyncio
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
import httpx


class AgentType(Enum):
    MONITORING = "monitoring"
    INCIDENT = "incident"
    RCA = "rca"
    REMEDIATION = "remediation"
    DEPLOYMENT = "deployment"
    SECURITY = "security"


class AgentTaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AgentContext:
    """Context passed to agent for execution"""
    tenant_id: str
    user_id: Optional[str] = None
    website_id: Optional[str] = None
    incident_id: Optional[str] = None
    trigger: str = "scheduled"  # scheduled, incident, manual, webhook
    input_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentResult:
    """Result from agent execution"""
    success: bool
    output: Dict[str, Any]
    actions_taken: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    error: Optional[str] = None


class BaseAgent(ABC):
    """
    Abstract base class for all AI DevOps agents.
    Provides common functionality for LLM interaction, logging, and tool execution.
    """
    
    def __init__(
        self,
        agent_type: AgentType,
        api_base_url: str = "http://localhost:3000",
        llm_provider: str = "openai",
        llm_model: str = "gpt-4",
    ):
        self.agent_type = agent_type
        self.api_base_url = api_base_url
        self.llm_provider = llm_provider
        self.llm_model = llm_model
        self.task_id: Optional[str] = None
        self.logs: List[Dict[str, Any]] = []
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name for this agent"""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Description of what this agent does"""
        pass
    
    @property
    @abstractmethod
    def capabilities(self) -> List[str]:
        """List of capabilities this agent has"""
        pass
    
    @abstractmethod
    async def execute(self, context: AgentContext) -> AgentResult:
        """
        Main execution method for the agent.
        Must be implemented by each agent type.
        """
        pass
    
    # Logging methods
    def log(self, level: str, message: str, data: Optional[Dict] = None):
        """Add a log entry"""
        entry = {
            "level": level,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self.logs.append(entry)
        print(f"[{self.agent_type.value}] [{level.upper()}] {message}")
    
    def log_info(self, message: str, data: Optional[Dict] = None):
        self.log("info", message, data)
    
    def log_warn(self, message: str, data: Optional[Dict] = None):
        self.log("warn", message, data)
    
    def log_error(self, message: str, data: Optional[Dict] = None):
        self.log("error", message, data)
    
    def log_debug(self, message: str, data: Optional[Dict] = None):
        self.log("debug", message, data)
    
    # LLM interaction
    async def ask_llm(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        """
        Send a prompt to the LLM and get a response.
        Supports OpenAI and Anthropic.
        """
        import os
        
        if self.llm_provider == "openai":
            return await self._ask_openai(prompt, system_prompt, temperature, max_tokens)
        elif self.llm_provider == "anthropic":
            return await self._ask_anthropic(prompt, system_prompt, temperature, max_tokens)
        else:
            raise ValueError(f"Unknown LLM provider: {self.llm_provider}")
    
    async def _ask_openai(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> str:
        import os
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            self.log_error("OPENAI_API_KEY not set")
            return ""
        
        async with httpx.AsyncClient() as client:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": self.llm_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _ask_anthropic(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> str:
        import os
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            self.log_error("ANTHROPIC_API_KEY not set")
            return ""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                },
                json={
                    "model": self.llm_model,
                    "max_tokens": max_tokens,
                    "system": system_prompt or "",
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]
    
    async def analyze_with_llm(
        self,
        data: Dict[str, Any],
        analysis_type: str,
        context: str = "",
    ) -> Dict[str, Any]:
        """
        Use LLM to analyze data and return structured insights.
        """
        system_prompt = f"""You are an AI DevOps agent specialized in {analysis_type}.
Your role is to analyze the provided data and give actionable insights.
Always respond with valid JSON containing:
- "summary": Brief summary of findings
- "severity": "critical", "high", "medium", or "low"
- "issues": List of identified issues
- "recommendations": List of recommended actions
- "confidence": Confidence level 0-100
"""
        
        prompt = f"""Analyze the following data:
{json.dumps(data, indent=2)}

{f"Additional context: {context}" if context else ""}

Provide your analysis in JSON format."""

        response = await self.ask_llm(prompt, system_prompt, temperature=0.3)
        
        try:
            # Extract JSON from response
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            return json.loads(response.strip())
        except json.JSONDecodeError:
            return {
                "summary": response,
                "severity": "medium",
                "issues": [],
                "recommendations": [],
                "confidence": 50,
            }
    
    # API interaction with main application
    async def call_api(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Call the main application API"""
        async with httpx.AsyncClient() as client:
            url = f"{self.api_base_url}{endpoint}"
            response = await client.request(
                method,
                url,
                json=data,
                headers=headers or {},
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()
    
    async def create_incident(
        self,
        tenant_id: str,
        title: str,
        description: str,
        severity: str,
        source: str,
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Create an incident via API"""
        return await self.call_api("POST", "/api/incidents", {
            "tenantId": tenant_id,
            "title": title,
            "description": description,
            "severity": severity,
            "source": source,
            "metadata": metadata or {},
        })
    
    async def update_task_status(
        self,
        task_id: str,
        status: AgentTaskStatus,
        output: Optional[Dict] = None,
        error_message: Optional[str] = None,
    ):
        """Update the agent task status in the database"""
        await self.call_api("PATCH", f"/api/agent-tasks/{task_id}", {
            "status": status.value,
            "output": output,
            "errorMessage": error_message,
            "completedAt": datetime.utcnow().isoformat() if status in [AgentTaskStatus.COMPLETED, AgentTaskStatus.FAILED] else None,
        })
    
    async def save_logs(self, task_id: str):
        """Save agent logs to database"""
        for log in self.logs:
            await self.call_api("POST", f"/api/agent-tasks/{task_id}/logs", log)
