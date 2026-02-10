from fastapi import APIRouter, HTTPException, Path
from app.agent.graph import build_graph
from app.agent.checkpoint import get_checkpointer

router = APIRouter()

@router.get("/sow/{thread_id}")
async def get_sow(thread_id: str = Path(..., title="The ID of the conversation thread")):
    try:
        async with get_checkpointer() as checkpointer:
            # Reconstruct the graph to access state
            workflow = build_graph(checkpointer=checkpointer)
            config = {"configurable": {"thread_id": thread_id}}
            
            # Get current state
            state_snapshot = await workflow.aget_state(config)
            
            if not state_snapshot.values:
                 raise HTTPException(status_code=404, detail="Thread not found")

            sow_content = state_snapshot.values.get("sow_content")
            
            if not sow_content:
                return {
                    "status": "pending",
                    "message": "SOW is not yet generated. Please continue the consultation.",
                    "thread_id": thread_id
                }
            
            return {
                "status": "completed",
                "sow_content": sow_content,
                "thread_id": thread_id
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
