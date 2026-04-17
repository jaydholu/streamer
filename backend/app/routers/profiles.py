from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import get_db
from app.schemas.profile import (
    ProfileCreate,
    ProfileUpdate,
    ProfileResponse,
    ProfileListResponse,
    PinSetRequest,
    PinRemoveRequest,
    PinVerifyRequest,
    PinResponse,
)
from app.schemas.auth import MessageResponse
from app.services import profile_service
from app.utils.dependencies import get_current_user


router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("", response_model=ProfileListResponse)
async def list_profiles(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all profiles for the authenticated user."""
    profiles = await profile_service.get_profiles(db, current_user["id"])
    return {"profiles": profiles}


@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(
    body: ProfileCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new profile (max 5 per account)."""
    return await profile_service.create_profile(
        db=db,
        user_id=current_user["id"],
        name=body.name,
        avatar=body.avatar,
        is_kids=body.is_kids,
    )


@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: str,
    body: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update profile name or avatar."""
    return await profile_service.update_profile(
        db=db,
        user_id=current_user["id"],
        profile_id=profile_id,
        name=body.name,
        avatar=body.avatar,
    )


@router.delete("/{profile_id}", response_model=MessageResponse)
async def delete_profile(
    profile_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a profile and its associated data."""
    return await profile_service.delete_profile(db, current_user["id"], profile_id)


# ── PIN Lock Endpoints ────────────────────────────────────────────

@router.post("/{profile_id}/pin", response_model=MessageResponse)
async def set_pin(
    profile_id: str,
    body: PinSetRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Set or update PIN lock on a profile."""
    return await profile_service.set_pin(
        db, current_user["id"], profile_id, body.pin
    )


@router.delete("/{profile_id}/pin", response_model=MessageResponse)
async def remove_pin(
    profile_id: str,
    body: PinRemoveRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove PIN lock (requires current PIN)."""
    return await profile_service.remove_pin(
        db, current_user["id"], profile_id, body.current_pin
    )


@router.post("/{profile_id}/verify-pin", response_model=PinResponse)
async def verify_pin(
    profile_id: str,
    body: PinVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Verify PIN to access a locked profile."""
    return await profile_service.verify_profile_pin(
        db, current_user["id"], profile_id, body.pin
    )
