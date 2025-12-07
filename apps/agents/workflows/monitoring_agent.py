from typing import Dict, Any, TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, BaseMessage
import operator
from config import settings
from tools.integration_tools import IntegrationTools

# Define state
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    metrics: Dict[str, Any]
    anomalies: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]

# Initialize tools
integration_tools = IntegrationTools(settings.API_URL)
tools = integration_tools.get_tools()

# Initialize LLM
llm = ChatOpenAI(model=settings.MONITORING_MODEL, api_key=settings.OPENAI_API_KEY)

# Define nodes
def collect_metrics(state: AgentState):
    print("Collecting metrics...")
    # In a real scenario, we would use the fetch_metrics tool here
    # For now, we simulate data collection
    metrics = {
        "cpu": 85.5,
        "memory": 72.0,
        "requests": 1500,
        "error_rate": 0.05
    }
    return {"metrics": metrics, "messages": [SystemMessage(content=f"Collected metrics: {metrics}")]}

def analyze_metrics(state: AgentState):
    print("Analyzing metrics...")
    metrics = state["metrics"]
    anomalies = []
    
    # Simple threshold logic (would be replaced by LLM analysis)
    if metrics["cpu"] > 80:
        anomalies.append({"type": "high_cpu", "value": metrics["cpu"], "threshold": 80})
    if metrics["error_rate"] > 0.01:
        anomalies.append({"type": "high_error_rate", "value": metrics["error_rate"], "threshold": 0.01})
        
    return {"anomalies": anomalies, "messages": [SystemMessage(content=f"Found {len(anomalies)} anomalies")]}

def create_alerts(state: AgentState):
    print("Creating alerts...")
    anomalies = state["anomalies"]
    alerts = []
    
    for anomaly in anomalies:
        alert = {
            "title": f"Anomaly Detected: {anomaly['type']}",
            "severity": "high" if anomaly['type'] == 'high_error_rate' else "medium",
            "description": f"Value {anomaly['value']} exceeded threshold {anomaly['threshold']}"
        }
        alerts.append(alert)
        # Here we would call the API to create an incident
        
    return {"alerts": alerts, "messages": [SystemMessage(content=f"Created {len(alerts)} alerts")]}

# Build graph
workflow = StateGraph(AgentState)

workflow.add_node("collect_metrics", collect_metrics)
workflow.add_node("analyze_metrics", analyze_metrics)
workflow.add_node("create_alerts", create_alerts)

workflow.set_entry_point("collect_metrics")

workflow.add_edge("collect_metrics", "analyze_metrics")
workflow.add_edge("analyze_metrics", "create_alerts")
workflow.add_edge("create_alerts", END)

# Compile
app = workflow.compile()
