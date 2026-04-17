from pydantic import BaseModel, Field
from datetime import datetime


# ── Profile CRUD ──────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=30)
    avatar: str = Field(default="avatar_1")
    is_kids: bool = Field(default=False)


class ProfileUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=30)
    avatar: str | None = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    name: str
    avatar: str
    is_locked: bool
    is_kids: bool
    created_at: datetime


class ProfileListResponse(BaseModel):
    profiles: list[ProfileResponse]


# ── PIN Lock ──────────────────────────

class PinSetRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class PinRemoveRequest(BaseModel):
    current_pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class PinVerifyRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class PinResponse(BaseModel):
    message: str
    verified: bool = True
