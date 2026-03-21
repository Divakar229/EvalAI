from sqlalchemy import Column,String,Integer,DateTime,ForeignKey,Float,Text,Boolean
from db.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship



class Teacher(Base):
    __tablename__ = "teachers"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)
    evaluations   = relationship("Evaluation", back_populates="teacher")


class Evaluation(Base):
    __tablename__ = "evaluations"
    id              = Column(Integer, primary_key=True, index=True)
    teacher_id      = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    student_name    = Column(String, nullable=False)
    roll_number     = Column(String, nullable=False)
    subject         = Column(String, nullable=False)
    exam_name       = Column(String, nullable=False)
    total_marks     = Column(Integer, nullable=False)
    marks_obtained  = Column(Float, nullable=False)
    percentage      = Column(Float, nullable=False)
    grade           = Column(String, nullable=False)
    overall_remarks = Column(Text, nullable=False)
    evaluated_at    = Column(DateTime, default=datetime.utcnow)
    teacher         = relationship("Teacher", back_populates="evaluations")
    questions       = relationship("QuestionResult", back_populates="evaluation", cascade="all, delete")


class QuestionResult(Base):
    __tablename__ = "question_results"
    id              = Column(Integer, primary_key=True, index=True)
    evaluation_id   = Column(Integer, ForeignKey("evaluations.id"), nullable=False)
    question_number = Column(String, nullable=False)
    total_marks     = Column(Float, nullable=False)
    marks_awarded   = Column(Float, nullable=False)
    status          = Column(String, nullable=False)   # answered / blank / partial
    feedback        = Column(Text, nullable=False)
    is_choice       = Column(Boolean, default=False)
    evaluation      = relationship("Evaluation", back_populates="questions")

