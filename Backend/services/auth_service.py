from sqlalchemy.orm import Session
from fastapi import HTTPException,status
from models.models import Teacher
from auth import hash_password,verify_password,create_token
from schemas.auth import RegisterRequest

def register_teacher(body:RegisterRequest,db:Session) -> dict:
    if db.query(Teacher).filter(Teacher.email==body.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    teacher = Teacher(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password)
    )  
    db.add(teacher)
    db.commit()
    db.refresh(teacher)


    token = create_token({"id": teacher.id, "email": teacher.email})
    return {"token": token, "name": teacher.name, "email": teacher.email}


def login_teacher(email:str,password:str,db:Session) -> dict:
    teacher=db.query(Teacher).filter(Teacher.email==email).first()
    if not teacher or not verify_password(password,teacher.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password")
    
    token = create_token({"id": teacher.id, "email": teacher.email})
    return {"token": token, "name": teacher.name, "email": teacher.email}
