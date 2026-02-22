from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from sqlalchemy.orm import Session
from app.agents.qa_agent.graph import build_qa_graph
from app.agents.checkpoint import get_checkpointer
from app.db.session import get_db
from app.db import models

router = APIRouter()

class QAAskRequest(BaseModel):
    project_id: int
    message: str
    thread_id: str

@router.post("/ask")
async def ask_qa(request: QAAskRequest, db: Session = Depends(get_db)):
    try:
        # 1. Look up the project by ID to retrieve the SOW
        db_project = db.query(models.Project).filter(models.Project.id == request.project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # SOW should be saved as structured dictionary
        sow_content = db_project.sow_structured
        if not sow_content:
            raise HTTPException(status_code=400, detail="No SOW found for this project")
        
        async with get_checkpointer() as checkpointer:
            # 2. Build QA Workflow
            workflow = build_qa_graph(checkpointer=checkpointer) 
            
            # 3. Setup config with thread_id
            config = {"configurable": {"thread_id": request.thread_id}}
            
            # 4. Invoke graph
            user_message = HumanMessage(content=request.message)
            
            # We must pass sow_content to the state 
            # Note: with Checkpointer, the first run needs initial state
            result = await workflow.ainvoke(
                {
                    "messages": [user_message],
                    "sow_content": sow_content
                },
                config=config
            )
            
            # 5. Extract Bot Response
            bot_response = result["messages"][-1].content
            
            # --- Save to ChatMessage history for QA (Optional but useful) ---
            try:
                db.add(models.ChatMessage(
                    thread_id=request.thread_id,
                    role="user",
                    content=request.message
                ))
                db.add(models.ChatMessage(
                    thread_id=request.thread_id,
                    role="assistant",
                    content=bot_response
                ))
                db.commit()
            except Exception as db_e:
                print(f"Error saving chat history: {db_e}")
            
            return {
                "response": bot_response,
                "thread_id": request.thread_id,
                "project_id": request.project_id
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in QA Ask: {e}")
        raise HTTPException(status_code=500, detail=str(e))
