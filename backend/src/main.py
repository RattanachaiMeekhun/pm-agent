from fastapi import FastAPI,HTTPException, Depends
from typing import List,Annotated
from fastapi.responses import RedirectResponse
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

class UserCreate(BaseModel):
    email: str
    password: str

class ItemCreate(BaseModel):
    title: str
    description: str
    
class ItemResponse(BaseModel):
    id: int
    title: str
    description: str
    owner_id: int

    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

    class Config:
        orm_mode = True

        
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: db_dependency):
    try:
        db_user = models.User(email=user.email, hashed_password=user.password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

@app.post("/items/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: db_dependency):
    db_item = models.Item(title=item.title, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

