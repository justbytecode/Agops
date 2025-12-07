"""
AgentOps AI Agents Main Entry Point
"""
import asyncio
import logging
from workflows.monitoring_agent import MonitoringAgent
from workflows.rca_agent import RCAAgent
from workflows.remediation_agent import RemediationAgent
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    """Main entry point for AI agents"""
    logger.info("Starting AgentOps AI Agents...")

    # Initialize agents
    monitoring = MonitoringAgent()
    rca = RCAAgent()
    remediation = RemediationAgent()

    # Start monitoring loop
    while True:
        try:
            # Run monitoring agent
            await monitoring.run()
            await asyncio.sleep(60)  # Run every minute
        except Exception as e:
            logger.error(f"Error in agent loop: {e}")
            await asyncio.sleep(60)


if __name__ == "__main__":
    asyncio.run(main())
