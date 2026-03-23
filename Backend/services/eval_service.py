from sqlalchemy.orm import Session
from models.models import Evaluation, QuestionResult
from schemas.evaluation import EvaluationResult


def save_evaluation(
    result: EvaluationResult,
    student_name: str,
    roll_number: str,
    subject: str,
    exam_name: str,
    teacher_id: int,
    db: Session
) -> int:
    evaluation = Evaluation(
        teacher_id=teacher_id,
        student_name=student_name,
        roll_number=roll_number,
        subject=subject,
        exam_name=exam_name,
        total_marks=result["total_marks"],
        marks_obtained=result["marks_obtained"],
        percentage=result["percentage"],
        grade=result["grade"],
        overall_remarks=result["overall_remarks"],
    )
    db.add(evaluation)
    db.flush()

    for q in result.get("questions", []):
        db.add(QuestionResult(
            evaluation_id=evaluation.id,
            question_number=str(q["question_number"]),
            total_marks=q["total_marks"],
            marks_awarded=q["marks_awarded"],
            status=q["status"],
            feedback=q["feedback"],
            is_choice=q.get("is_choice", False),
        ))

    db.commit()
    db.refresh(evaluation)
    return evaluation.id


def get_all_evaluations(teacher_id: int, db: Session) -> list:
    evals = (
        db.query(Evaluation)
        .filter(Evaluation.teacher_id == teacher_id)
        .order_by(Evaluation.evaluated_at.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "student_name": e.student_name,
            "roll_number": e.roll_number,
            "subject": e.subject,
            "exam_name": e.exam_name,
            "total_marks": e.total_marks,
            "marks_obtained": e.marks_obtained,
            "percentage": e.percentage,
            "grade": e.grade,
            "evaluated_at": e.evaluated_at.isoformat(),
        }
        for e in evals
    ]


def get_evaluation_by_id(evaluation_id: int, teacher_id: int, db: Session) -> dict:
    e = (
        db.query(Evaluation)
        .filter(Evaluation.id == evaluation_id, Evaluation.teacher_id == teacher_id)
        .first()
    )
    if not e:
        return None

    questions = db.query(QuestionResult).filter(QuestionResult.evaluation_id == e.id).all()
    return {
        "id": e.id,
        "student_name": e.student_name,
        "roll_number": e.roll_number,
        "subject": e.subject,
        "exam_name": e.exam_name,
        "total_marks": e.total_marks,
        "marks_obtained": e.marks_obtained,
        "percentage": e.percentage,
        "grade": e.grade,
        "overall_remarks": e.overall_remarks,
        "evaluated_at": e.evaluated_at.isoformat(),
        "questions": [
            {
                "question_number": q.question_number,
                "total_marks": q.total_marks,
                "marks_awarded": q.marks_awarded,
                "status": q.status,
                "feedback": q.feedback,
                "is_choice": q.is_choice,
            }
            for q in questions
        ],
    }


def delete_evaluation(evaluation_id: int, teacher_id: int, db: Session) -> bool:
    e = (
        db.query(Evaluation)
        .filter(Evaluation.id == evaluation_id, Evaluation.teacher_id == teacher_id)
        .first()
    )
    if not e:
        return False
    db.delete(e)
    db.commit()
    return True