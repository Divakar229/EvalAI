from pydantic import BaseModel, EmailStr


# ── Requests (what comes IN) ──────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Responses (what goes OUT) ─────────────────────────────────────────────────

class AuthResponse(BaseModel):
    token: str
    name: str
    email: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    name: str