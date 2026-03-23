from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import Teacher
from auth import get_current_teacher
from ai_engine import pdf_to_images, extract_text, parse_question_paper, evaluate_answers
from services.eval_service import save_evaluation

router = APIRouter(prefix="/evaluate", tags=["evaluate"])


@router.post("")
async def evaluate(
    question_paper: UploadFile = File(...),
    answer_key:     UploadFile = File(...),
    student_answer: UploadFile = File(...),
    student_name:   str = Form(...),
    roll_number:    str = Form(...),
    subject:        str = Form(...),
    exam_name:      str = Form(...),
    teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    try:
        qp_bytes = await question_paper.read()
        ak_bytes = await answer_key.read()
        st_bytes = await student_answer.read()

        qp_images = pdf_to_images(qp_bytes)
        ak_images = pdf_to_images(ak_bytes)
        st_images = pdf_to_images(st_bytes)

        qp_text = extract_text(qp_images, "This is a printed exam question paper.")
        ak_text = extract_text(ak_images, "This is a teacher's model answer key.")
        st_text = extract_text(st_images, "This is a student's handwritten answer sheet. Transcribe carefully including all question numbers.")

        questions_data = parse_question_paper(qp_text)
        result         = evaluate_answers(questions_data, ak_text, st_text)

        evaluation_id = save_evaluation(
            result=result,
            student_name=student_name,
            roll_number=roll_number,
            subject=subject,
            exam_name=exam_name,
            teacher_id=teacher.id,
            db=db
        )

        return {**result, "evaluation_id": evaluation_id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))