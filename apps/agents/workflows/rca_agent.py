from typing import Dict, Any, TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, BaseMessage
import operator
from config import settings
from tools.integration_tools import IntegrationTools

# Define state
class RCAState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    incident_id: str
    logs: List[Dict[str, Any]]
    root_cause: str
    confidence: float

# Initialize tools
integration_tools = IntegrationTools(settings.API_URL)

# Initialize LLM
llm = ChatOpenAI(model=settings.RCA_MODEL, api_key=settings.OPENAI_API_KEY)

# Define nodes
def gather_context(state: RCAState):
    print(f"Gathering context for incident {state['incident_id']}...")
    # In a real scenario, we would fetch incident details
    return {"messages": [SystemMessage(content=f"Gathering context for incident {state['incident_id']}")], "logs": []}

def analyze_logs(state: RCAState):
    print("Analyzing logs...")
    # Simulate log analysis
    logs = [
        {"timestamp": "2024-03-10T10:00:00Z", "level": "ERROR", "message": "Connection refused to DB"},
        {"timestamp": "2024-03-10T10:00:01Z", "level": "ERROR", "message": "Retry failed"}
    ]
    return {"logs": logs, "messages": [SystemMessage(content=f"Analyzed {len(logs)} logs")]}

def determine_root_cause(state: RCAState):
    print("Determining root cause...")
    logs = state["logs"]
    # Simulate LLM analysis
    root_cause = "Database connection failure due to network partition"
    confidence = 0.95
    
    return {
        "root_cause": root_cause, 
        "confidence": confidence,
        "messages": [SystemMessage(content=f"Root cause identified: {root_cause} (Confidence: {confidence})")]
    }

# Build graph
workflow = StateGraph(RCAState)

workflow.add_node("gather_context", gather_context)
workflow.add_node("analyze_logs", analyze_logs)
workflow.add_node("determine_root_cause", determine_root_cause)

workflow.set_entry_point("gather_context")

workflow.add_edge("gather_context", "analyze_logs")
workflow.add_edge("analyze_logs", "determine_root_cause")
workflow.add_edge("determine_root_cause", END)

# Compile
app = workflow.compile()
