from datetime import datetime, timezone
import secrets

from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import hash_password
from app.services.auth_service import _cascade_delete_user


async def list_users(db: AsyncIOMotorDatabase) -> dict:
    """List all registered users."""
    users = []
    async for user in db.users.find(
        {},
        {
            "fullname": 1, "username": 1, "email": 1,
            "role": 1, "is_active": 1, "created_at": 1,
        },
    ):
        users.append({
            "id": str(user["_id"]),
            "fullname": user["fullname"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at", datetime.now(timezone.utc)),
        })

    return {"users": users, "total": len(users)}


async def deactivate_user(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    """Deactivate a user account — blocks sign-in."""
    user = await _get_user_or_404(db, user_id)

    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot deactivate an admin account")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}},
    )

    return {"message": f"User '{user['username']}' deactivated"}


async def activate_user(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    """Reactivate a deactivated user."""
    await _get_user_or_404(db, user_id)

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": True, "updated_at": datetime.now(timezone.utc)}},
    )

    return {"message": "User reactivated"}


async def delete_user(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    """
    Delete a user and cascade delete all data.
    Admin cannot delete themselves.
    """
    user = await _get_user_or_404(db, user_id)

    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete an admin account")

    await _cascade_delete_user(db, user_id)

    return {"message": f"User '{user['username']}' and all associated data deleted"}


async def admin_reset_user_password(
    db: AsyncIOMotorDatabase,
    user_id: str,
    new_password: str,
) -> dict:
    """Admin manually resets a user's password (FR-AUTH-11)."""
    user = await _get_user_or_404(db, user_id)

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "password_hash": hash_password(new_password),
            "updated_at": datetime.now(timezone.utc),
        }},
    )

    return {"message": f"Password reset for user '{user['username']}'"}


async def get_platform_stats(db: AsyncIOMotorDatabase) -> dict:
    """Get platform-wide stats."""
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    deactivated_users = total_users - active_users

    # Calculate total watch hours from all history entries
    pipeline = [
        {"$group": {"_id": None, "total_seconds": {"$sum": "$current_time"}}},
    ]
    result = await db.watch_history.aggregate(pipeline).to_list(1)
    total_seconds = result[0]["total_seconds"] if result else 0
    total_watch_hours = round(total_seconds / 3600, 1)

    return {
        "total_users": total_users,
        "active_users": active_users,
        "deactivated_users": deactivated_users,
        "total_watch_hours": total_watch_hours,
    }


async def get_invite_code(db: AsyncIOMotorDatabase) -> dict:
    """Get current invite code settings."""
    config = await db.app_config.find_one()
    if not config:
        return {"invite_code": "N/A", "signups_enabled": True}

    return {
        "invite_code": config.get("invite_code", "N/A"),
        "signups_enabled": config.get("signups_enabled", True),
    }


async def update_invite_code(
    db: AsyncIOMotorDatabase,
    admin_id: str,
    invite_code: str = None,
    signups_enabled: bool = None,
) -> dict:
    """Update invite code or toggle signups."""
    update_fields = {
        "updated_at": datetime.now(timezone.utc),
        "updated_by": ObjectId(admin_id)
    }

    if invite_code is not None:
        update_fields["invite_code"] = invite_code

    if signups_enabled is not None:
        update_fields["signups_enabled"] = signups_enabled

    await db.app_config.update_one({}, {"$set": update_fields}, upsert=True)

    config = await db.app_config.find_one()

    return {
        "invite_code": config["invite_code"],
        "signups_enabled": config.get("signups_enabled", True),
    }


async def generate_random_invite_code(db: AsyncIOMotorDatabase, admin_id: str) -> dict:
    """Generate a new random invite code."""
    new_code = secrets.token_urlsafe(8)
    return await update_invite_code(db, admin_id, invite_code=new_code)


# ── Helpers ───────────────────────────────────────────────────────

async def _get_user_or_404(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
