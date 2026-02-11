from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.agent.state import AgentState
from app.agent.prompts import DRAFTER_SYSTEM_PROMPT, REFINER_SYSTEM_PROMPT
from app.agent.llm import get_llm
import json
import re

llm = get_llm()

def _parse_json_response(content: str):
    content = content.strip()
    if "```" in content:
        match = re.search(r"```(?:json)?\s*(.*?)```", content, re.DOTALL)
        if match:
            content = match.group(1).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"sow_content": "", "response": content}

 
def draft_node(state: AgentState):
    """Node: Create the first Draft V1"""
    messages = [SystemMessage(content=DRAFTER_SYSTEM_PROMPT)] + state['messages']
    response = llm.invoke(messages)
    data = _parse_json_response(response.content)
    
    return {
        "sow_content": data.get("sow_content", ""),
        "messages": [AIMessage(content=data.get("response", "Draft generated."))],
        "stage": "writer"
    }

def refine_node(state: AgentState):
    """Node: Update the Draft based on feedback"""
    current_sow = state.get("sow_content", "")
    user_feedback = "Please improve the SOW."
    if state['messages']:
        for msg in reversed(state['messages']):
             if isinstance(msg, HumanMessage):
                 user_feedback = msg.content
                 break
    
    messages = [
        SystemMessage(content=REFINER_SYSTEM_PROMPT),
        HumanMessage(content=f"CURRENT SOW:\n{current_sow}\n\nUSER FEEDBACK:\n{user_feedback}")
    ]
    
    response = llm.invoke(messages)
    data = _parse_json_response(response.content)
    
    return {
        "sow_content": data.get("sow_content", current_sow),
        "messages": [AIMessage(content=data.get("response", "SOW Updated."))],
        "stage": "writer"
    }