from pydantic import BaseModel


class StudentDetails(BaseModel):
    student_name: str
    roll_number:  str
    subject:      str
    exam_name:    str