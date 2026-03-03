from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import project, sow, qa, auth
from app.db.session import engine
from app.db import models
from pwdlib import PasswordHash

app = FastAPI(title="PM Agent API", version="1.0.0")

password_hash = PasswordHash.recommended()

# Configure CORS
origins = [
    "https://pm-agent-lyart.vercel.app",
    "http://localhost:3000",  # React app
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

# Register Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(project.router, prefix="/api/v1/project", tags=["Project"])
app.include_router(sow.router, prefix="/api/v1", tags=["SOW"])
app.include_router(qa.router, prefix="/api/v1/qa", tags=["QA Agent"])


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
