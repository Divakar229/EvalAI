from sqlalchemy.orm import Session
from models.models import Teacher
from fastapi import HTTPException, status
from schemas.auth import RegisterRequest
from auth import hash_password, verify_password, create_token

#------ Function for Teacher Registration---------
def register_teacher(body:RegisterRequest,db:Session) -> dict:
    # utf-8 is a encoding method to convert str to bytes
    if len(body.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long. Maximum 72 characters is allowed"
        )
    
    if db.query(Teacher).filter(Teacher.email==body.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already register. Try new one"
        )
    
    teacher=Teacher(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password)
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    token = create_token({"id":teacher.id,"email":teacher.email})
    return {"access_token":token,"token_type":"bearer","name":teacher.name}


#----------Function for Login of Teacher----------
def login_teacher(email:str,password:str,db:Session):
    teacher=db.query(Teacher).filter(Teacher.email == email).first()
    if not teacher or not verify_password(password,teacher.password_hash):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid email or password"
        )
    token = create_token({"id":teacher.id,"email":teacher.email})
    return {"access_token":token,"token_type":"bearer","name":teacher.name}
