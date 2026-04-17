from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import hash_pin, verify_pin


async def get_profiles(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    """Get all profiles for a user (FR-PROF-05)."""
    profiles = []
    async for profile in db.profiles.find({"user_id": ObjectId(user_id)}):
        profiles.append(_format_profile(profile))

    return profiles


async def create_profile(
    db: AsyncIOMotorDatabase,
    user_id: str,
    name: str,
    avatar: str,
    is_kids: bool = False,
) -> dict:
    """
    Create a new profile.
    Max 5 profiles per account.
    """
    oid = ObjectId(user_id)
    count = await db.profiles.count_documents({"user_id": oid})

    if count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 profiles per account",
        )

    # Check name uniqueness within this user's profiles
    existing = await db.profiles.find_one({"user_id": oid, "name": name})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A profile with this name already exists",
        )

    profile_doc = {
        "user_id": oid,
        "name": name,
        "avatar": avatar,
        "pin_hash": None,
        "is_locked": False,
        "is_kids": is_kids,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.profiles.insert_one(profile_doc)
    profile_doc["_id"] = result.inserted_id

    return _format_profile(profile_doc)


async def update_profile(
    db: AsyncIOMotorDatabase,
    user_id: str,
    profile_id: str,
    name: str = None,
    avatar: str = None,
) -> dict:
    """Update profile name or avatar."""
    profile = await _get_owned_profile(db, user_id, profile_id)

    update_fields = {}
    if name is not None:
        # Check name uniqueness
        existing = await db.profiles.find_one({
            "user_id": ObjectId(user_id),
            "name": name,
            "_id": {"$ne": ObjectId(profile_id)},
        })
        if existing:
            raise HTTPException(status_code=409, detail="Profile name already taken")
        update_fields["name"] = name

    if avatar is not None:
        update_fields["avatar"] = avatar

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.profiles.update_one(
        {"_id": ObjectId(profile_id)},
        {"$set": update_fields},
    )

    updated = await db.profiles.find_one({"_id": ObjectId(profile_id)})

    return _format_profile(updated)


async def delete_profile(
    db: AsyncIOMotorDatabase,
    user_id: str,
    profile_id: str,
) -> dict:
    """Delete a profile and its associated watchlist + history."""
    await _get_owned_profile(db, user_id, profile_id)
    pid = ObjectId(profile_id)

    await db.watchlist.delete_many({"profile_id": pid})
    await db.watch_history.delete_many({"profile_id": pid})
    await db.profiles.delete_one({"_id": pid})

    return {"message": "Profile deleted successfully"}


# ── PIN Lock ──────────────────────────────────────────────────────

async def set_pin(
    db: AsyncIOMotorDatabase,
    user_id: str,
    profile_id: str,
    pin: str,
) -> dict:
    """Set or update PIN lock on a profile."""
    await _get_owned_profile(db, user_id, profile_id)

    await db.profiles.update_one(
        {"_id": ObjectId(profile_id)},
        {"$set": {
            "pin_hash": hash_pin(pin),
            "is_locked": True,
        }},
    )

    return {"message": "PIN lock enabled"}


async def remove_pin(
    db: AsyncIOMotorDatabase,
    user_id: str,
    profile_id: str,
    current_pin: str,
) -> dict:
    """Remove PIN lock — requires current PIN."""
    profile = await _get_owned_profile(db, user_id, profile_id)

    if not profile.get("is_locked") or not profile.get("pin_hash"):
        raise HTTPException(status_code=400, detail="Profile is not locked")

    if not verify_pin(current_pin, profile["pin_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect PIN")

    await db.profiles.update_one(
        {"_id": ObjectId(profile_id)},
        {"$set": {"pin_hash": None, "is_locked": False}},
    )

    return {"message": "PIN lock removed"}


async def verify_profile_pin(
    db: AsyncIOMotorDatabase,
    user_id: str,
    profile_id: str,
    pin: str,
) -> dict:
    """
    Verify PIN to access a locked profile.
    Note: 3-attempt cooldown is enforced on the frontend.
    """
    profile = await _get_owned_profile(db, user_id, profile_id)

    if not profile.get("is_locked") or not profile.get("pin_hash"):
        return {"message": "Profile is not locked", "verified": True}

    if not verify_pin(pin, profile["pin_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect PIN")

    return {"message": "PIN verified", "verified": True}


# ── Helpers ───────────────────────────────────────────────────────

async def _get_owned_profile(
    db: AsyncIOMotorDatabase,
    user_id: str,
    profile_id: str,
) -> dict:
    """Get a profile and verify it belongs to the user."""
    try:
        profile = await db.profiles.find_one({"_id": ObjectId(profile_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid profile ID")

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if str(profile["user_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not your profile")

    return profile


def _format_profile(profile: dict) -> dict:
    """Convert MongoDB profile document to API response format."""
    return {
        "id": str(profile["_id"]),
        "user_id": str(profile["user_id"]),
        "name": profile["name"],
        "avatar": profile.get("avatar", "avatar_1"),
        "is_locked": profile.get("is_locked", False),
        "is_kids": profile.get("is_kids", False),
        "created_at": profile.get("created_at", datetime.now(timezone.utc)),
    }
