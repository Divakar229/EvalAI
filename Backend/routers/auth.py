from fastapi import APIRouter,Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db.database import get_db
from services.auth_service import register_teacher,login_teacher
from schemas.auth import RegisterRequest


router=APIRouter(prefix="/auth",tags=["auth"])


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return register_teacher(data,db)


@router.post("/login")
def login(form: OAuth2PasswordRequestForm= Depends(), db: Session=Depends(get_db)):
    return login_teacher(form.username,form.password,db)