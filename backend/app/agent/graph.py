from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.nodes import analyst_node, interviewer_node, writer_node

def should_continue(state: AgentState):
    """
    ฟังก์ชันตัดสินใจทางแยก (Router Logic)
    """
    missing_info = state.get("missing_info", [])
    
    # ถ้ามีข้อมูลที่ขาดอยู่ -> ไปสัมภาษณ์ต่อ
    if missing_info and len(missing_info) > 0:
        return "interviewer"
    
    # ถ้าข้อมูลครบแล้ว -> ไปเขียน SOW
    return "writer"

def build_graph(checkpointer=None):
    workflow = StateGraph(AgentState)

    # 1. Add Nodes
    workflow.add_node("analyst", analyst_node)
    workflow.add_node("interviewer", interviewer_node)
    workflow.add_node("writer", writer_node)

    # 2. Set Entry Point (จุดเริ่มคือ Analyst เสมอ)
    workflow.set_entry_point("analyst")

    # 3. Add Conditional Edges (ทางแยก)
    # จาก 'analyst' ให้เช็ค 'should_continue'
    # ผลลัพธ์ที่ได้ ("interviewer" หรือ "writer") จะเป็นชื่อ Node ปลายทาง
    workflow.add_conditional_edges(
        "analyst",
        should_continue,
        {
            "interviewer": "interviewer",
            "writer": "writer"
        }
    )

    # 4. Add Normal Edges (ทางตรง)
    # ถ้าถามเสร็จ (interviewer) -> จบรอบ (END) เพื่อรอ User ตอบกลับมาใหม่
    workflow.add_edge("interviewer", END)
    
    # ถ้าเขียนเสร็จ (writer) -> จบงาน (END)
    workflow.add_edge("writer", END)

    # Compile พร้อม Checkpointer
    return workflow.compile(checkpointer=checkpointer)