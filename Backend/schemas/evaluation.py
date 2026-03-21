from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ── Question part (for choice questions) ─────────────────────────────────────

class QuestionPart(BaseModel):
    part:          str
    attempted:     bool
    marks_awarded: float
    feedback:      str
    marks:         Optional[float] = None


# ── Single question result ────────────────────────────────────────────────────

class QuestionResult(BaseModel):
    question_number:        str
    question_text:          Optional[str] = None
    total_marks:            float
    marks_awarded:          float
    status:                 str
    is_choice:              bool = False
    is_stepwise:            bool = False
    student_answer_summary: Optional[str] = None
    feedback:               str
    parts:                  Optional[list[QuestionPart]] = None


# ── Full evaluation result ────────────────────────────────────────────────────

class EvaluationResult(BaseModel):
    marks_obtained:  float
    total_marks:     float
    percentage:      float
    grade:           str
    overall_remarks: str
    questions:       list[QuestionResult]


# ── What API returns after saving to DB ──────────────────────────────────────

class EvaluationResponse(EvaluationResult):
    evaluation_id: int


# ── Single row in history list ────────────────────────────────────────────────

class EvaluationSummary(BaseModel):
    id:              int
    student_name:    str
    roll_number:     str
    subject:         str
    exam_name:       str
    total_marks:     float
    marks_obtained:  float
    percentage:      float
    grade:           str
    evaluated_at:    datetime

    class Config:
        from_attributes = True


# ── Full detail view ──────────────────────────────────────────────────────────

class EvaluationDetail(BaseModel):
    id:              int
    student_name:    str
    roll_number:     str
    subject:         str
    exam_name:       str
    total_marks:     float
    marks_obtained:  float
    percentage:      float
    grade:           str
    overall_remarks: str
    evaluated_at:    datetime
    questions:       list[QuestionResult]

    class Config:
        from_attributes = True