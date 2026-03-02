from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import jwt
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from argon2 import PasswordHasher
from app.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(request: LoginRequest, db=Depends(get_db)):
    try:
        # check user in db
        db_user = (
            db.query(models.User).filter(models.User.email == request.email).first()
        )
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        if not check_password(request.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid password")

        # create token
        token = create_token(db_user.id)
        return {"message": "Login", "data": db_user, "token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register")
def register(request: RegisterRequest, db=Depends(get_db)):
    try:
        # check user in db
        db_user = (
            db.query(models.User).filter(models.User.email == request.email).first()
        )
        if db_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # create user
        db_user = models.User(
            email=request.email,
            hashed_password=hash_password(request.password),
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # create token
        token = create_token(db_user.id)
        return {"message": "Register success", "data": db_user, "token": token}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def check_password(password: str, hashed_password: str) -> bool:
    return PasswordHasher().verify(hashed_password, password)


def create_token(user_id: int) -> str:
    return jwt.encode({"user_id": user_id}, settings.JWT_SECRET_KEY, algorithm="HS256")


def hash_password(password: str) -> str:
    return PasswordHasher().hash(password)


@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
