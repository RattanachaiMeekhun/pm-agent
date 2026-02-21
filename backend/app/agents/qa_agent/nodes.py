from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.agents.qa_agent.state import QAState
from app.agents.qa_agent.prompts import QA_SYSTEM_PROMPT
from app.agents.llm import llm
import json

def qa_node(state: QAState):
    """Node: Answer the user's question based on the SOW"""
    current_sow = state.get("sow_content", {})
    
    if isinstance(current_sow, dict):
        current_sow_str = json.dumps(current_sow, indent=2, ensure_ascii=False)
    else:
        current_sow_str = str(current_sow)

    # Base messages: System + Context
    base_messages = [
        SystemMessage(content=QA_SYSTEM_PROMPT + f"\n\n--- SOW CONTENT ---\n{current_sow_str}")
    ]
    
    # We pass the history of messages
    messages_to_send = base_messages + state['messages']
    
    response = llm.invoke(messages_to_send)
    
    return {
        "messages": [AIMessage(content=response.content)]
    }
