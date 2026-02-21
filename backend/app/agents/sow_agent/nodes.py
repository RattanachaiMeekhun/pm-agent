from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.agents.sow_agent.state import AgentState
from app.agents.sow_agent.prompts import DRAFTER_SYSTEM_PROMPT, REFINER_SYSTEM_PROMPT,RESEARCHER_SYSTEM_PROMPT,REVIEWER_SYSTEM_PROMPT
from app.agents.llm import llm
import json
import re

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
    print("--- RUNNING DRAFT NODE ---")
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
    print("--- RUNNING REFINE NODE ---")
    current_sow = state.get("sow_content", "")
    user_feedback = "Please improve the SOW."
    if state['messages']:
        for msg in reversed(state['messages']):
             if isinstance(msg, HumanMessage):
                 user_feedback = msg.content
                 break
    
    if isinstance(current_sow, dict):
        current_sow = json.dumps(current_sow, indent=2)

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

def research_node(state: AgentState):
    """Node: Research the user's question"""
    print("--- RUNNING RESEARCH NODE ---")
    messages = [SystemMessage(content=RESEARCHER_SYSTEM_PROMPT)] + state['messages']
    response = llm.invoke(messages)
    data = _parse_json_response(response.content)
    
    return {
        "tsd_content": data.get("tsd_content", ""), # Note: output is tsd_content based on prompt
        "messages": [AIMessage(content=data.get("response", "Research completed."))],
        "stage": "research"
    }

def review_node(state: AgentState):
    """Node: Review the SOW and decide to continue or finish"""
    print("--- RUNNING REVIEW NODE ---")
    current_sow = state.get("sow_content", "")
    # Add the current SOW to the messages to review
    messages = [SystemMessage(content=REVIEWER_SYSTEM_PROMPT), HumanMessage(content=f"CURRENT CONTENT TO REVIEW:\n{current_sow}")]
    
    response = llm.invoke(messages)
    data = _parse_json_response(response.content)
    
    decision = data.get("decision", "complete")
    revision_count = state.get("revision_count", 0) + 1
    
    return {
        "sow_content": current_sow, # We MUST preserve the sow_content so it's not overwritten to ""
        "messages": [AIMessage(content=data.get("response", "Review completed."))],
        "stage": decision, # Store the decision in "stage" so the graph can route it
        "revision_count": revision_count
    }