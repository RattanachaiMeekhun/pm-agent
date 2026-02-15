from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from requests import Session
from app.agent.graph import build_graph
from app.agent.checkpoint import get_checkpointer
from app.schemas.project import ProjectCreate, ProjectUpdate, Project, ProjectListItem
from app.db.session import get_db
from app.db import models
from sqlalchemy import func, desc
from typing import List
router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default_thread"

@router.get("/list",response_model=List[ProjectListItem])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).filter(models.Project.is_active == True).order_by(desc(models.Project.created_at)).all()

@router.post("/consult")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # 1. ใช้ Context Manager เปิด connection กับ DB
        async with get_checkpointer() as checkpointer:
            
            # 2. Compile Graph พร้อม Memory (Checkpointer)
            workflow = build_graph(checkpointer=checkpointer) 
            
            # 3. เตรียม Config (ระบุ thread_id)
            config = {"configurable": {"thread_id": request.thread_id}}
            
            # 4. Invoke Graph
            user_message = HumanMessage(content=request.message)
            result = await workflow.ainvoke(
                {"messages": [user_message]}, 
                config=config
            )
            
            # 5. Extract Response
            bot_response = result["messages"][-1].content
            
            # --- Save to ChatMessage history for indexing ---
            try:
                # Save User Message
                db.add(models.ChatMessage(
                    thread_id=request.thread_id,
                    role="user",
                    content=request.message
                ))
                # Save Assistant Message
                db.add(models.ChatMessage(
                    thread_id=request.thread_id,
                    role="assistant",
                    content=bot_response
                ))
                db.commit()
            except Exception as db_e:
                print(f"Error saving chat history: {db_e}")
                # Don't fail the request if saving history fails
            
            return {
                "response": bot_response,
                "stage": result.get("stage", "unknown"),
                "missing_info": result.get("missing_info", []),
                "thread_id": request.thread_id
            }
            
    except Exception as e:
        print(f"Error: {e}") # Print log ดู error จริง
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{thread_id}")
async def get_chat_history(thread_id: str):
    try:
        async with get_checkpointer() as checkpointer:
            workflow = build_graph(checkpointer=checkpointer)
            config = {"configurable": {"thread_id": thread_id}}
            
            state_snapshot = await workflow.aget_state(config)
            
            if not state_snapshot.values:
                 return {"messages": []}
            
            messages = state_snapshot.values.get("messages", [])
            
            # Serialize messages
            history = []
            for msg in messages:
                role = "user"
                if msg.type == "ai":
                    role = "assistant"
                elif msg.type == "human":
                    role = "user"
                elif msg.type == "system":
                    role = "system"
                
                history.append({
                    "role": role,
                    "content": msg.content,
                    "type": msg.type
                })
                
            return {"messages": history, "thread_id": thread_id}

    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create", response_model=Project)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    try:
        # Check if project name already exists
        db_project = db.query(models.Project).filter(models.Project.thread_id == project.thread_id).first()
        if db_project:
            raise HTTPException(status_code=400, detail="Project with this name already exists")
            
        # Check if thread_id is already associated with a project (optional check)
        # db_thread = db.query(models.Project).filter(models.Project.thread_id == project.thread_id).first()
        # if db_thread:
        #     raise HTTPException(status_code=400, detail="This chat session is already associated with a project")

        new_project = models.Project(
            is_active=project.is_active,
            status=project.status.value if project.status else None, 
            thread_id=project.thread_id,
            sow_structured=project.sow_structured,
            created_at=func.now(),
            updated_at=func.now()
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        return new_project
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.patch("/{project_id}", response_model=Project)
async def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if field == "status" and hasattr(value, 'value'):
                setattr(db_project, field, value.value)
            else:
                setattr(db_project, field, value)
    
    from sqlalchemy import func as sqla_func
    db_project.updated_at = sqla_func.now()
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/threads", response_model=list[dict])
def get_chat_threads(db: Session = Depends(get_db)):
    """
    Get a list of distinct chat threads (sessions) with their last activity time.
    """
    # 1. Find unique thread_ids and their most recent timestamp
    subquery = (
        db.query(
            models.ChatMessage.thread_id,
            func.max(models.ChatMessage.timestamp).label("max_time")
        )
        .group_by(models.ChatMessage.thread_id)
        .subquery()
    )

    # 2. Query to get the results sorted by time
    # We limit to last 20 sessions for performance
    results = (
        db.query(subquery.c.thread_id, subquery.c.max_time)
        .order_by(desc(subquery.c.max_time))
        .limit(20)
        .all()
    )

    threads = []
    for r in results:
        # 3. Fetch the first user message to use as a "Title"
        first_msg = (
            db.query(models.ChatMessage)
            .filter(
                models.ChatMessage.thread_id == r.thread_id,
                models.ChatMessage.role == "user"
            )
            .order_by(models.ChatMessage.timestamp.asc())
            .first()
        )
        
        # If no user message found (rare), use a generic title
        title_text = first_msg.content if first_msg else "New Session"
        # Truncate title
        title = (title_text[:40] + "...") if len(title_text) > 40 else title_text
        
        threads.append({
            "thread_id": r.thread_id,
            "title": title,
            "updated_at": r.max_time
        })

    return threads