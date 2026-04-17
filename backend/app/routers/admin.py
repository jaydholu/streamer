from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import get_db
from app.schemas.admin import (
    AdminUserListResponse,
    PlatformStatsResponse,
    InviteCodeResponse,
    InviteCodeUpdateRequest,
    AdminResetPasswordRequest,
)
from app.schemas.auth import MessageResponse
from app.services import admin_service
from app.utils.dependencies import require_admin


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=AdminUserListResponse)
async def list_users(
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all registered users (FR-ADMIN-02)."""
    return await admin_service.list_users(db)


@router.patch("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: str,
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Deactivate a user account (FR-ADMIN-03)."""
    return await admin_service.deactivate_user(db, user_id)


@router.patch("/users/{user_id}/activate", response_model=MessageResponse)
async def activate_user(
    user_id: str,
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Reactivate a deactivated user (FR-ADMIN-04)."""
    return await admin_service.activate_user(db, user_id)


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete user and cascade delete all data (FR-ADMIN-05)."""
    return await admin_service.delete_user(db, user_id)


@router.patch("/users/{user_id}/reset-password", response_model=MessageResponse)
async def admin_reset_password(
    user_id: str,
    body: AdminResetPasswordRequest,
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Admin manually resets a user's password (FR-AUTH-11)."""
    return await admin_service.admin_reset_user_password(db, user_id, body.new_password)


@router.get("/stats", response_model=PlatformStatsResponse)
async def get_stats(
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get platform stats (FR-ADMIN-07)."""
    return await admin_service.get_platform_stats(db)


@router.get("/invite-code", response_model=InviteCodeResponse)
async def get_invite_code(
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get current invite code (FR-ADMIN-08)."""
    return await admin_service.get_invite_code(db)


@router.put("/invite-code", response_model=InviteCodeResponse)
async def update_invite_code(
    body: InviteCodeUpdateRequest,
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update invite code or toggle signups (FR-ADMIN-08)."""
    return await admin_service.update_invite_code(
        db=db,
        admin_id=admin["id"],
        invite_code=body.invite_code,
        signups_enabled=body.signups_enabled,
    )


@router.post("/invite-code/regenerate", response_model=InviteCodeResponse)
async def regenerate_invite_code(
    admin: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Generate a new random invite code."""
    return await admin_service.generate_random_invite_code(db, admin["id"])
