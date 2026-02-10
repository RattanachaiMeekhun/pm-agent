from fastapi import APIRouter

router = APIRouter()

@router.post("/generate")
async def generate_sow():
    return {"message": "SOW Generation Endpoint"}
