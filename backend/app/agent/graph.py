from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.nodes import draft_node, refine_node

def determine_mode(state: AgentState):
    """
    Decide whether to Draft (first time) or Refine (subsequent times).
    """
    # If we already have SOW content, we are in 'refine' mode.
    if state.get("sow_content"):
        return "refine"
    # Otherwise, it's the first run -> 'draft'
    return "draft"

def build_graph(checkpointer=None):
    workflow = StateGraph(AgentState)

    # 1. Add Nodes
    workflow.add_node("draft", draft_node)
    workflow.add_node("refine", refine_node)

    # 2. Set Conditional Entry Point
    workflow.set_conditional_entry_point(
        determine_mode,
        {
            "draft": "draft",
            "refine": "refine"
        }
    )

    # 3. Add Edges 
    # Both nodes return to User (END) to wait for feedback
    workflow.add_edge("draft", END)
    workflow.add_edge("refine", END)

    return workflow.compile(checkpointer=checkpointer)