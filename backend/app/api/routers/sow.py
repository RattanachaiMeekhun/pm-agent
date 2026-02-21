from fastapi import APIRouter, HTTPException, Path
from app.agents.sow_agent.graph import build_graph
from app.agents.checkpoint import get_checkpointer

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
            tsd_content = state_snapshot.values.get("tsd_content")
            stage = state_snapshot.values.get("stage", "unknown")
            revision_count = state_snapshot.values.get("revision_count", 0)
            
            if not sow_content:
                return {
                    "status": "pending",
                    "message": "SOW is not yet generated. Please continue the consultation.",
                    "thread_id": thread_id,
                    "stage": stage,
                    "tsd_content": tsd_content,
                    "revision_count": revision_count
                }
            
            return {
                "status": "completed" if stage in ["complete", "refine"] else "drafting",
                "sow_content": sow_content,
                "thread_id": thread_id,
                "stage": stage,
                "tsd_content": tsd_content,
                "revision_count": revision_count
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
