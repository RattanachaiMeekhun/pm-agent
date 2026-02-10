from langchain_core.messages import SystemMessage, HumanMessage
from app.agent.state import AgentState
from app.agent.prompts import ANALYST_SYSTEM_PROMPT, INTERVIEWER_SYSTEM_PROMPT
from app.agent.llm import get_llm # <--- Import Factory ที่สร้างตะกี้

# Initialize LLM ครั้งเดียว
llm = get_llm()

def analyst_node(state: AgentState):
    """Node วิเคราะห์ความต้องการ"""
    messages = [SystemMessage(content=ANALYST_SYSTEM_PROMPT)] + state['messages']
    response = llm.invoke(messages)
    
    # Analyze the LLM response to see if it's asking for more info or if it's satisfied
    # Ideally, you should use structured output or check specific keywords.
    # For this MVP, let's assume if the LLM generates a question, it needs more info.
    
    missing = []
    
    # IMPROVED LOGIC: Check if the LLM thinks we need more info (conceptually)
    # Or simply do not rely on length. Let's force at least 2 turns of conversation based on logic.
    answer_text = response.content.lower()

    # Example fix: Ask LLM specifically via a prompt or check content
    # Ideally, ANALYST_SYSTEM_PROMPT should tell the LLM to output "MISSING: <info>" if incomplete.
    if "missing" in answer_text or "need" in answer_text or len(state['messages']) < 4: 
         missing = ["Need more details"]

    return {"requirements": {"raw": response.content}, "missing_info": missing,"stage": "analyzed"}

def interviewer_node(state: AgentState):
    """Node ถามคำถามกลับ"""
    system_msg = SystemMessage(content=INTERVIEWER_SYSTEM_PROMPT)
    # แปลง missing_info (list) เป็น string
    missing_text = ", ".join(state.get('missing_info', []))
    context_msg = HumanMessage(content=f"Context from Analyst - Missing info: {missing_text}")
    
    # ส่งข้อความล่าสุดจาก user ไปด้วยเพื่อให้คุยต่อเนื่อง
    user_latest = state['messages'][-1] if state['messages'] else HumanMessage(content="")
    
    response = llm.invoke([system_msg, user_latest, context_msg])
    
    return {"messages": [response],"stage": "interviewed"}

def writer_node(state: AgentState):
    """
    Node C: Writer
    ทำหน้าที่เขียนเอกสาร SOW เมื่อข้อมูลครบถ้วนแล้ว
    """
    # ดึงข้อมูลจากส่วน Analysis ที่ Analyst ทำไว้
    requirements = state.get("requirements", {})
    raw_analysis = requirements.get("raw", "No details provided.")
    
    # สร้าง SOW แบบง่ายๆ (MVP)
    # ในอนาคตเราจะใช้ LLM prompt เพื่อเขียนให้สวยหรู
    sow_content = f"""
# Scope of Work (Generated)

## 1. Executive Summary
Based on the analysis: {raw_analysis}

## 2. Deliverables
(To be defined based on deeper analysis)

## 3. Timeline & Budget
- Timeline: TBD
- Budget: TBD
"""
    
    # ส่งค่ากลับไป update ใน state
    return {
        "sow_content": sow_content,
        "stage": "complete" # บอกให้รู้ว่าจบงานแล้ว
    }