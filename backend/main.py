from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Freelance PM Agent API")

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "active", "service": "Freelance PM Agent"}

@app.post("/chat")
def chat(request: ChatRequest):
    # Placeholder for connecting to agent_graph
    # result = agent_app.invoke({"raw_brief": request.message})
    return {"response": f"Echo: {request.message}"}