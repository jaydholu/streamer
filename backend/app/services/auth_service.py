from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.settings import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    create_reset_token,
    decode_reset_token,
)
from app.utils.email import send_reset_email


async def signup_user(
    db: AsyncIOMotorDatabase,
    fullname: str,
    username: str,
    email: str,
    password: str,
    invite_code: str,
) -> dict:
    """
    Register a new user.
    Requires fullname, username, email, password, invite_code.
    Invite code validated against app config or env variable.
    The first account created is automatically assigned admin role.
    """
    # Validate invite code — check app_config collection first, fall back to env
    app_config = await db.app_config.find_one()
    valid_code = app_config["invite_code"] if app_config else settings.INVITE_CODE

    if app_config and not app_config.get("signups_enabled", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sign-ups are currently disabled",
        )

    if invite_code != valid_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invite code",
        )

    # Check duplicates
    existing_user = await db.users.find_one(
        {"$or": [{"username": username.lower()}, {"email": email.lower()}]}
    )
    if existing_user:
        if existing_user.get("username") == username.lower():
            raise HTTPException(status_code=409, detail="Username already taken")
        raise HTTPException(status_code=409, detail="Email already registered")

    # First user becomes admin
    user_count = await db.users.count_documents({})
    role = "admin" if user_count == 0 else "member"

    now = datetime.now(timezone.utc)
    user_doc = {
        "fullname": fullname,
        "username": username.lower(),
        "email": email.lower(),
        "password_hash": hash_password(password),
        "role": role,
        "is_active": True,
        "reset_token": None,
        "reset_token_expiry": None,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.users.insert_one(user_doc)

    # Initialize app_config if this is the first user
    if user_count == 0:
        await db.app_config.insert_one({
            "invite_code": settings.INVITE_CODE,
            "signups_enabled": True,
            "updated_at": now,
            "updated_by": result.inserted_id,
        })

    return {"message": "Account created successfully", "user_id": str(result.inserted_id)}


async def signin_user(
    db: AsyncIOMotorDatabase,
    login: str,
    password: str,
) -> dict:
    """
    Authenticate user with username OR email.
    Returns access + refresh tokens.
    """
    login_lower = login.lower()

    # Detect if login is email or username
    if "@" in login_lower:
        user = await db.users.find_one({"email": login_lower})
    else:
        user = await db.users.find_one({"username": login_lower})

    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Contact the admin.",
        )

    token_data = {"sub": str(user["_id"]), "role": user["role"]}

    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }


async def refresh_access_token(db: AsyncIOMotorDatabase, refresh_token: str) -> dict:
    """Issue a new access token using a valid refresh token (FR-AUTH-03)."""
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user or not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    token_data = {"sub": str(user["_id"]), "role": user["role"]}

    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }


async def delete_user_account(
    db: AsyncIOMotorDatabase,
    user_id: str,
    password: str,
) -> dict:
    """
    Self-service account deletion.
    Cascades: removes all profiles, watchlist items, and history.
    """
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    await _cascade_delete_user(db, user_id)

    return {"message": "Account and all associated data deleted successfully"}


async def forgot_password(db: AsyncIOMotorDatabase, email: str) -> dict:
    """
    Initiate password reset flow.
    Always returns success message to prevent email enumeration.
    """
    user = await db.users.find_one({"email": email.lower()})

    if user:
        token = create_reset_token(email.lower())
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "reset_token": token,
                "reset_token_expiry": datetime.now(timezone.utc),
            }},
        )
        await send_reset_email(email.lower(), token)

    # Always return same message to prevent email enumeration
    return {"message": "If an account with this email exists, a reset link has been sent"}


async def reset_password(
    db: AsyncIOMotorDatabase,
    token: str,
    new_password: str,
) -> dict:
    """Reset password using valid reset token."""
    email = decode_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash": hash_password(new_password),
            "reset_token": None,
            "reset_token_expiry": None,
            "updated_at": datetime.now(timezone.utc),
        }},
    )

    return {"message": "Password reset successfully"}


async def change_password(
    db: AsyncIOMotorDatabase,
    user_id: str,
    current_password: str,
    new_password: str,
) -> dict:
    """Change password from Settings page."""
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(current_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash": hash_password(new_password),
            "updated_at": datetime.now(timezone.utc),
        }},
    )

    return {"message": "Password changed successfully"}


# ── Shared Helpers ────────────────────────────────────────────────

async def _cascade_delete_user(db: AsyncIOMotorDatabase, user_id: str):
    """Delete a user and all associated data (profiles, watchlist, history)."""
    oid = ObjectId(user_id)

    # Get all profile IDs for this user
    profile_ids = []
    async for profile in db.profiles.find({"user_id": oid}, {"_id": 1}):
        profile_ids.append(profile["_id"])

    # Delete watchlist and history for all profiles
    if profile_ids:
        await db.watchlist.delete_many({"profile_id": {"$in": profile_ids}})
        await db.watch_history.delete_many({"profile_id": {"$in": profile_ids}})

    # Delete all profiles
    await db.profiles.delete_many({"user_id": oid})

    # Delete the user
    await db.users.delete_one({"_id": oid})
