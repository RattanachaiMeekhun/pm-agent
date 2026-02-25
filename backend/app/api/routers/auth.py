from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import jwt
from app.db.session import get_db
from app.db import models
from argon2 import PasswordHasher
from app.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db = Depends(get_db)):
    try:
        # check user in db
        db_user = db.query(models.User).filter(models.User.email == request.username).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        if not check_password(request.password, db_user.password):
            raise HTTPException(status_code=401, detail="Invalid password")

        # create token
        token = create_token(db_user.id)
        return {"message": "Login", "data": db_user, "token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def check_password(password: str, hashed_password: str) -> bool:
    return PasswordHasher().verify(hashed_password, password)

def create_token(user_id: int) -> str:
    return jwt.encode({"user_id": user_id},settings.JWT_SECRET_KEY, algorithm="HS256")