from pydantic import BaseModel, Field
from datetime import datetime


# ── User List (FR-ADMIN-02) ───────────────────────────────────────

class AdminUserResponse(BaseModel):
    id: str
    fullname: str
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime


class AdminUserListResponse(BaseModel):
    users: list[AdminUserResponse]
    total: int


# ── Platform Stats ─────────────────────────────────

class PlatformStatsResponse(BaseModel):
    total_users: int
    active_users: int
    deactivated_users: int
    total_watch_hours: float


# ── Invite Code ────────────────────────────────────

class InviteCodeResponse(BaseModel):
    invite_code: str
    signups_enabled: bool


class InviteCodeUpdateRequest(BaseModel):
    invite_code: str | None = Field(None, min_length=4, max_length=50)
    signups_enabled: bool | None = None


# ── Admin Password Reset ─────────────────────────────

class AdminResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6, max_length=128)
