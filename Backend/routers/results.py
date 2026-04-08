from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import Teacher
from auth import get_current_teacher
from services.eval_service import get_all_evaluations,get_evaluation_by_id,delete_evaluation


router=APIRouter(prefix="/results",tags=["results"])


@router.get("")
def list_results(teacher: Teacher=Depends(get_current_teacher), db: Session = Depends(get_db)):
    return get_all_evaluations(teacher.id,db)


@router.get("/{evaluation_id}")
def get_result(evaluation_id: int, teacher: Teacher = Depends(get_current_teacher),db: Session = Depends(get_db)):
    result=get_evaluation_by_id(evaluation_id,teacher.id, db)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not Found")
    return result

@router.delete("/{evaluation_id}")
def delete_result(evaluation_id: int, teacher: Teacher = Depends(get_current_teacher),db: Session = Depends(get_db)):
    deleted=delete_evaluation(evaluation_id,teacher.id,db)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found")
    return {"deleted": True}

