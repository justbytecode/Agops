from langchain.tools import Tool
from typing import List, Dict, Any
import requests
import json

class IntegrationTools:
    def __init__(self, api_url: str, api_key: str = None):
        self.api_url = api_url
        self.headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}

    def get_tools(self) -> List[Tool]:
        return [
            Tool(
                name="fetch_metrics",
                func=self.fetch_metrics,
                description="Fetch metrics from monitoring tools (Prometheus, Datadog). Input: query string."
            ),
            Tool(
                name="check_logs",
                func=self.check_logs,
                description="Search logs in logging systems (ELK, Splunk). Input: search query."
            ),
            Tool(
                name="list_incidents",
                func=self.list_incidents,
                description="List active incidents from the platform."
            ),
            Tool(
                name="scale_service",
                func=self.scale_service,
                description="Scale a Kubernetes deployment. Input: JSON string with 'deployment' and 'replicas'."
            ),
            Tool(
                name="restart_pod",
                func=self.restart_pod,
                description="Restart a Kubernetes pod. Input: pod name."
            ),
            Tool(
                name="create_github_issue",
                func=self.create_github_issue,
                description="Create a GitHub issue. Input: JSON string with 'title' and 'body'."
            )
        ]

    def fetch_metrics(self, query: str) -> str:
        # Mock implementation - would call actual API
        return json.dumps({"metric": "cpu_usage", "value": 85.5, "timestamp": "now"})

    def check_logs(self, query: str) -> str:
        # Mock implementation
        return json.dumps([
            {"level": "error", "message": "Connection timeout", "timestamp": "2024-03-10T10:00:00Z"},
            {"level": "warn", "message": "High latency", "timestamp": "2024-03-10T10:01:00Z"}
        ])

    def list_incidents(self, _=None) -> str:
        try:
            response = requests.get(f"{self.api_url}/incidents", headers=self.headers)
            return json.dumps(response.json())
        except Exception as e:
            return f"Error fetching incidents: {str(e)}"

    def scale_service(self, args: str) -> str:
        try:
            data = json.loads(args)
            return f"Scaled deployment {data.get('deployment')} to {data.get('replicas')} replicas."
        except Exception as e:
            return f"Error scaling service: {str(e)}"

    def restart_pod(self, pod_name: str) -> str:
        return f"Pod {pod_name} restarted successfully."

    def create_github_issue(self, args: str) -> str:
        try:
            data = json.loads(args)
            return f"Created GitHub issue: {data.get('title')}"
        except Exception as e:
            return f"Error creating issue: {str(e)}"
