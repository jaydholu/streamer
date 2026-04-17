from pydantic import BaseModel, EmailStr, Field


# ── Sign Up ──────────────────────────────────────────

class SignUpRequest(BaseModel):
    fullname: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    invite_code: str = Field(..., min_length=1)


class SignUpResponse(BaseModel):
    message: str
    user_id: str


# ── Sign In ──────────────────────────────────────────

class SignInRequest(BaseModel):
    """Username OR email login."""
    login: str = Field(..., min_length=1, description="Username or email")
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ── Token Refresh ────────────────────────────────────

class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Account Deletion ─────────────────────────────────

class DeleteAccountRequest(BaseModel):
    password: str = Field(..., min_length=1)


# ── Forgot / Reset Password ──────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)


class MessageResponse(BaseModel):
    message: str


# ── Change Password ───────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)
