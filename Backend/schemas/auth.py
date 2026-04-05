from pydantic import BaseModel, EmailStr

#----REQUEST-------
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email:EmailStr
    password:str


# ----RESPONSES----(output what will visible)

class AuthResponse(BaseModel):
    token: str
    name: str
    email: str

# helps pydantic to read sqlalchemy object attributes
    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    name: str