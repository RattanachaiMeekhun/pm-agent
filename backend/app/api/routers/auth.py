from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
import jwt



router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    try:
        # check user in db
        db_user = db.query(models.User).filter(models.User.username == request.username).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        if not check_password(request.password, db_user.password):
            raise HTTPException(status_code=401, detail="Invalid password")

        # create token
        token = create_token(db_user.id)
        return {"message": "Login", "data": request}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def check_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_token(user_id: int) -> str:
    return jwt.encode({"user_id": user_id}, "secret", algorithm="HS256")