from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.api.routers import chat
from app.db.session import engine   
from app.db import models

app = FastAPI(title="PM Agent API", version="1.0.0")

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

# Register Routers
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])

@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
