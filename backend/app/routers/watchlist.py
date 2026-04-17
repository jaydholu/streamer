from bson import ObjectId
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import get_db
from app.schemas.watchlist import (
    WatchlistAddRequest,
    WatchlistItemResponse,
    WatchlistCheckResponse,
)
from app.schemas.auth import MessageResponse
from app.utils.dependencies import get_current_user


router = APIRouter(prefix="/profiles/{pid}/watchlist", tags=["Watchlist"])


@router.get("", response_model=list[WatchlistItemResponse])
async def get_watchlist(
    pid: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get all watchlist items for a profile."""
    await _verify_profile_ownership(db, current_user["id"], pid)

    items = []
    async for item in db.watchlist.find(
        {"profile_id": ObjectId(pid)}
    ).sort("added_at", -1):
        items.append(_format_watchlist_item(item))

    return items


@router.post("", response_model=WatchlistItemResponse, status_code=201)
async def add_to_watchlist(
    pid: str,
    body: WatchlistAddRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Add item to watchlist."""
    await _verify_profile_ownership(db, current_user["id"], pid)

    # Check if already in watchlist
    existing = await db.watchlist.find_one({
        "profile_id": ObjectId(pid),
        "tmdb_id": body.tmdb_id,
        "media_type": body.media_type,
    })

    if existing:
        raise HTTPException(status_code=409, detail="Already in watchlist")

    doc = {
        "profile_id": ObjectId(pid),
        "tmdb_id": body.tmdb_id,
        "media_type": body.media_type,
        "title": body.title,
        "poster_path": body.poster_path,
        "added_at": datetime.now(timezone.utc),
    }

    result = await db.watchlist.insert_one(doc)
    doc["_id"] = result.inserted_id

    return _format_watchlist_item(doc)


@router.delete("/{tmdb_id}", response_model=MessageResponse)
async def remove_from_watchlist(
    pid: str,
    tmdb_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove item from watchlist."""
    await _verify_profile_ownership(db, current_user["id"], pid)

    result = await db.watchlist.delete_one({
        "profile_id": ObjectId(pid),
        "tmdb_id": tmdb_id,
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in watchlist")

    return {"message": "Removed from watchlist"}


@router.get("/check/{tmdb_id}", response_model=WatchlistCheckResponse)
async def check_watchlist(
    pid: str,
    tmdb_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Check if an item is in watchlist."""
    await _verify_profile_ownership(db, current_user["id"], pid)

    existing = await db.watchlist.find_one({
        "profile_id": ObjectId(pid),
        "tmdb_id": tmdb_id,
    })

    return {"in_watchlist": existing is not None}


# ── Helpers ───────────────────────────────────────────────────────

async def _verify_profile_ownership(
    db: AsyncIOMotorDatabase, user_id: str, profile_id: str
):
    """Verify the profile belongs to the authenticated user."""
    try:
        profile = await db.profiles.find_one({"_id": ObjectId(profile_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid profile ID")

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if str(profile["user_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not your profile")


def _format_watchlist_item(item: dict) -> dict:
    return {
        "id": str(item["_id"]),
        "profile_id": str(item["profile_id"]),
        "tmdb_id": item["tmdb_id"],
        "media_type": item["media_type"],
        "title": item["title"],
        "poster_path": item.get("poster_path"),
        "added_at": item["added_at"],
    }
