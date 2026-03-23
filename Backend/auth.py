from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError,jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from datetime import datetime,timedelta
from db.database import get_db
from models.models import Teacher
from config import SECRET_KEY,ALGORITHM,TOKEN_EXPIRE

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password:str)->str:
    return pwd_context.hash(password)

def verify_password(plain:str,hashed:str) -> bool:
    return pwd_context.verify(plain,hashed)

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_teacher(
    token: str = Depends(oauth2_scheme),
    db:  Session = Depends(get_db)
) -> Teacher:
    
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        teacher_id: int = payload.get("id")

        if teacher_id is None:
            raise credentials_error

    except JWTError:
        raise credentials_error

    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()

    if teacher is None:
        raise credentials_error

    return teacher
