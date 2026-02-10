from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from app.agent.graph import build_graph
from app.agent.checkpoint import get_checkpointer # <--- Import ใหม่

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default_thread"

@router.post("/consult")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. ใช้ Context Manager เปิด connection กับ DB
        async with get_checkpointer() as checkpointer:
            
            # 2. Compile Graph พร้อม Memory (Checkpointer)
            # หมายเหตุ: build_graph() เดิมเรา compile เลย ต้องแก้ให้รับ checkpointer
            # แต่เพื่อความง่าย เราจะขอแก้ build_graph() ใน step ถัดไป
            # ตอนนี้เอา logic compile มาไว้ตรงนี้ก่อน
            
            workflow = build_graph(checkpointer=checkpointer) 
            
            # 3. เตรียม Config (ระบุ thread_id)
            config = {"configurable": {"thread_id": request.thread_id}}
            
            # 4. Invoke Graph
            # ต้องดูสถานะปัจจุบันก่อน ถ้าเคยคุยแล้วจะดึง state เก่ามาต่อ
            # result = await workflow.ainvoke(...) # ใช้ ainvoke (Async)
            
            user_message = HumanMessage(content=request.message)
            result = await workflow.ainvoke(
                {"messages": [user_message]}, 
                config=config
            )
            
            # 5. Extract Response
            bot_response = result["messages"][-1].content
            return {
                "response": bot_response,
                "stage": result.get("stage", "unknown"),
                "missing_info": result.get("missing_info", []),
                "thread_id": request.thread_id
            }
            
    except Exception as e:
        print(f"Error: {e}") # Print log ดู error จริง
        raise HTTPException(status_code=500, detail=str(e))