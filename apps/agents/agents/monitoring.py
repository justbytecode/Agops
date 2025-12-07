"""
Monitoring Agent
Continuously monitors websites and infrastructure for health issues
"""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import httpx

from core.base_agent import (
    BaseAgent,
    AgentType,
    AgentContext,
    AgentResult,
)


class MonitoringAgent(BaseAgent):
    """
    AI Agent for continuous monitoring of websites and infrastructure.
    
    Capabilities:
    - HTTP/HTTPS health checks
    - Response time monitoring
    - SSL certificate validation
    - Uptime tracking
    - Anomaly detection
    """
    
    def __init__(self, **kwargs):
        super().__init__(AgentType.MONITORING, **kwargs)
        self.check_timeout = 30.0
        self.thresholds = {
            "response_time_warning": 1000,  # ms
            "response_time_critical": 5000,  # ms
            "uptime_warning": 99.0,  # %
            "ssl_expiry_warning": 30,  # days
        }
    
    @property
    def name(self) -> str:
        return "Monitoring Agent"
    
    @property
    def description(self) -> str:
        return "Monitors websites and infrastructure for health issues, performance degradation, and availability."
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "HTTP/HTTPS health checks",
            "Response time monitoring",
            "SSL certificate validation",
            "Uptime tracking",
            "Anomaly detection with AI",
        ]
    
    async def execute(self, context: AgentContext) -> AgentResult:
        """
        Execute monitoring check for a website or all websites.
        """
        self.log_info(f"Starting monitoring for tenant {context.tenant_id}")
        
        try:
            # Get websites to monitor
            websites = await self._get_websites(context)
            
            if not websites:
                self.log_info("No websites to monitor")
                return AgentResult(
                    success=True,
                    output={"message": "No websites configured for monitoring"},
                )
            
            results = []
            issues_detected = []
            
            for website in websites:
                self.log_info(f"Checking {website['name']} ({website['url']})")
                check_result = await self._check_website(website)
                results.append(check_result)
                
                # Detect issues
                if check_result["status"] == "down":
                    issues_detected.append({
                        "website": website["name"],
                        "issue": "Website is down",
                        "severity": "critical",
                    })
                elif check_result["status"] == "degraded":
                    issues_detected.append({
                        "website": website["name"],
                        "issue": f"High response time: {check_result['response_time']}ms",
                        "severity": "high",
                    })
                
                if check_result.get("ssl_days_until_expiry") and check_result["ssl_days_until_expiry"] < self.thresholds["ssl_expiry_warning"]:
                    issues_detected.append({
                        "website": website["name"],
                        "issue": f"SSL expires in {check_result['ssl_days_until_expiry']} days",
                        "severity": "medium" if check_result["ssl_days_until_expiry"] > 7 else "high",
                    })
                
                # Store health check result
                await self._store_health_check(website["id"], check_result)
            
            # If there are issues, create incidents
            for issue in issues_detected:
                await self._create_incident_for_issue(context.tenant_id, issue)
            
            # Use AI to analyze patterns if we have history
            analysis = None
            if len(results) > 0:
                analysis = await self._analyze_health_patterns(results)
            
            return AgentResult(
                success=True,
                output={
                    "websites_checked": len(websites),
                    "issues_detected": len(issues_detected),
                    "results": results,
                    "analysis": analysis,
                },
                actions_taken=[f"Checked {len(websites)} websites"],
                recommendations=analysis.get("recommendations", []) if analysis else [],
            )
            
        except Exception as e:
            self.log_error(f"Monitoring failed: {str(e)}")
            return AgentResult(
                success=False,
                output={},
                error=str(e),
            )
    
    async def _get_websites(self, context: AgentContext) -> List[Dict[str, Any]]:
        """Get websites for the tenant"""
        try:
            if context.website_id:
                # Check specific website
                response = await self.call_api("GET", f"/api/websites/{context.website_id}")
                return [response["website"]] if response.get("website") else []
            else:
                # Check all websites
                response = await self.call_api("GET", f"/api/websites?tenantId={context.tenant_id}")
                return response.get("websites", [])
        except Exception as e:
            self.log_error(f"Failed to get websites: {e}")
            return []
    
    async def _check_website(self, website: Dict[str, Any]) -> Dict[str, Any]:
        """Perform health check on a website"""
        url = website["url"]
        start_time = datetime.utcnow()
        
        result = {
            "website_id": website["id"],
            "url": url,
            "checked_at": start_time.isoformat(),
            "status": "unknown",
            "response_time": None,
            "status_code": None,
            "error": None,
            "ssl_valid": None,
            "ssl_days_until_expiry": None,
        }
        
        try:
            async with httpx.AsyncClient(verify=True, follow_redirects=True) as client:
                response = await client.get(url, timeout=self.check_timeout)
                
                end_time = datetime.utcnow()
                response_time = int((end_time - start_time).total_seconds() * 1000)
                
                result["response_time"] = response_time
                result["status_code"] = response.status_code
                
                # Determine status
                if response.status_code >= 500:
                    result["status"] = "down"
                elif response.status_code >= 400:
                    result["status"] = "error"
                elif response_time > self.thresholds["response_time_critical"]:
                    result["status"] = "degraded"
                elif response_time > self.thresholds["response_time_warning"]:
                    result["status"] = "slow"
                else:
                    result["status"] = "up"
                
                # Check SSL if HTTPS
                if url.startswith("https://"):
                    ssl_info = await self._check_ssl(url)
                    result["ssl_valid"] = ssl_info.get("valid")
                    result["ssl_days_until_expiry"] = ssl_info.get("days_until_expiry")
                
        except httpx.TimeoutException:
            result["status"] = "down"
            result["error"] = "Connection timed out"
        except httpx.ConnectError as e:
            result["status"] = "down"
            result["error"] = f"Connection failed: {str(e)}"
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)
        
        return result
    
    async def _check_ssl(self, url: str) -> Dict[str, Any]:
        """Check SSL certificate validity and expiration"""
        import ssl
        import socket
        from urllib.parse import urlparse
        
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname
            port = parsed.port or 443
            
            context = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Get expiry date
                    not_after = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
                    days_until_expiry = (not_after - datetime.utcnow()).days
                    
                    return {
                        "valid": True,
                        "days_until_expiry": days_until_expiry,
                        "issuer": dict(x[0] for x in cert.get("issuer", [])),
                    }
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    async def _store_health_check(self, website_id: str, result: Dict[str, Any]):
        """Store health check result in database"""
        try:
            await self.call_api("POST", f"/api/websites/{website_id}/health-checks", {
                "status": result["status"],
                "statusCode": result["status_code"],
                "responseTime": result["response_time"],
                "errorMessage": result.get("error"),
                "sslValid": result.get("ssl_valid"),
                "sslExpiresAt": None,  # Would calculate from days_until_expiry
            })
        except Exception as e:
            self.log_warn(f"Failed to store health check: {e}")
    
    async def _create_incident_for_issue(self, tenant_id: str, issue: Dict[str, Any]):
        """Create an incident for a detected issue"""
        try:
            await self.create_incident(
                tenant_id=tenant_id,
                title=f"{issue['website']}: {issue['issue']}",
                description=f"The monitoring agent detected an issue with {issue['website']}. {issue['issue']}",
                severity=issue["severity"],
                source="monitoring_agent",
                metadata=issue,
            )
            self.log_info(f"Created incident for {issue['website']}: {issue['issue']}")
        except Exception as e:
            self.log_error(f"Failed to create incident: {e}")
    
    async def _analyze_health_patterns(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Use AI to analyze health patterns and detect anomalies"""
        try:
            analysis = await self.analyze_with_llm(
                data={"health_checks": results},
                analysis_type="website health monitoring",
                context="Analyze these health check results for patterns, anomalies, and potential issues.",
            )
            return analysis
        except Exception as e:
            self.log_warn(f"AI analysis failed: {e}")
            return {}


# Entry point for running the agent
async def run_monitoring_agent(tenant_id: str, website_id: Optional[str] = None):
    """Run the monitoring agent for a tenant"""
    agent = MonitoringAgent()
    context = AgentContext(
        tenant_id=tenant_id,
        website_id=website_id,
        trigger="scheduled",
    )
    result = await agent.execute(context)
    return result


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python monitoring.py <tenant_id> [website_id]")
        sys.exit(1)
    
    tenant_id = sys.argv[1]
    website_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = asyncio.run(run_monitoring_agent(tenant_id, website_id))
    print(f"Result: {result}")
