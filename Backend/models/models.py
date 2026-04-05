from db.database import Base
from datetime import datetime
from sqlalchemy import ForeignKey,Text
from sqlalchemy.orm import relationship,Mapped,mapped_column

class Teacher(Base):
    __tablename__="teachers"
    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    name:Mapped[str]=mapped_column()
    email:Mapped[str]=mapped_column(unique=True,index=True)
    password_hash:Mapped[str]=mapped_column()
    created_at:Mapped[datetime]=mapped_column(default=datetime.utcnow)
    evaluations:Mapped[list["Evaluation"]]=relationship(back_populates="teacher")


class Evaluation(Base):
    __tablename__="evaluations"
    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    teacher_id:Mapped[int]=mapped_column(ForeignKey("teachers.id"))
    student_name:Mapped[str]=mapped_column()
    roll_number:Mapped[str]=mapped_column()
    subject:Mapped[str]=mapped_column()
    exam_name:Mapped[str]=mapped_column()
    total_marks:Mapped[int]=mapped_column()
    marks_obtained:Mapped[float]=mapped_column()
    percentage:Mapped[float]=mapped_column()
    grade:Mapped[str]=mapped_column()
    overall_remarks:Mapped[str]=mapped_column(Text)
    evaluated_at:Mapped[datetime]=mapped_column(default=datetime.utcnow)
    teacher:Mapped["Teacher"]=relationship(back_populates="evaluations")
    questions:Mapped[list["QuestionResult"]]=relationship(back_populates="evaluation",cascade="all,delete")


class QuestionResult(Base):
    __tablename__="question_results"
    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    evaluation_id:Mapped[int]=mapped_column(ForeignKey("evaluations.id"))
    #"Que1","Que2 a"
    question_number:Mapped[str]=mapped_column()
    total_marks:Mapped[float]=mapped_column()
    marks_awarded:Mapped[float]=mapped_column()
    # answered/blank/partial
    status:Mapped[str]=mapped_column()
    feedback:Mapped[str]=mapped_column(Text)
    is_choice:Mapped[bool]=mapped_column(default=False)
    evaluation:Mapped["Evaluation"]=relationship(back_populates="questions")