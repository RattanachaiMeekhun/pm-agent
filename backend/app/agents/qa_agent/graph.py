from langgraph.graph import StateGraph, END
from app.agents.qa_agent.state import QAState
from app.agents.qa_agent.nodes import qa_node

def build_qa_graph(checkpointer=None):
    workflow = StateGraph(QAState)

    # 1. Add Nodes
    workflow.add_node("qa", qa_node)

    # 2. Set Entry Point
    workflow.set_entry_point("qa")

    # 3. Add Edges 
    workflow.add_edge("qa", END)

    return workflow.compile(checkpointer=checkpointer)
