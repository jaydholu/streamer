from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import get_db
from app.schemas.watchlist import (
    WatchHistoryUpsertRequest,
    WatchHistoryItemResponse,
)
from app.schemas.auth import MessageResponse
from app.utils.dependencies import get_current_user


router = APIRouter(prefix="/profiles/{pid}/history", tags=["Watch History"])


@router.get("", response_model=list[WatchHistoryItemResponse])
async def get_history(
    pid: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get watch history for a profile."""
    await _verify_profile_ownership(db, current_user["id"], pid)

    items = []
    async for item in db.watch_history.find(
        {"profile_id": ObjectId(pid)}
    ).sort("last_watched", -1):
        items.append(_format_history_item(item))

    return items


@router.post("", response_model=WatchHistoryItemResponse)
async def upsert_history(
    pid: str,
    body: WatchHistoryUpsertRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Upsert watch progress.
    Uses compound index (profile_id, tmdb_id, media_type) for efficient upsert.
    For TV: also matches on season + episode.
    """
    await _verify_profile_ownership(db, current_user["id"], pid)

    now = datetime.now(timezone.utc)
    profile_oid = ObjectId(pid)

    # Build the filter for upsert
    filter_query = {
        "profile_id": profile_oid,
        "tmdb_id": body.tmdb_id,
        "media_type": body.media_type,
    }

    # For TV shows, match specific episode
    if body.media_type == "tv" and body.season is not None and body.episode is not None:
        filter_query["season"] = body.season
        filter_query["episode"] = body.episode

    update_doc = {
        "$set": {
            "profile_id": profile_oid,
            "tmdb_id": body.tmdb_id,
            "media_type": body.media_type,
            "title": body.title,
            "poster_path": body.poster_path,
            "season": body.season,
            "episode": body.episode,
            "progress": body.progress,
            "current_time": body.current_time,
            "duration": body.duration,
            "last_watched": now,
        },
    }

    await db.watch_history.update_one(filter_query, update_doc, upsert=True)

    # Fetch the upserted document
    item = await db.watch_history.find_one(filter_query)

    return _format_history_item(item)


@router.get("/continue", response_model=list[WatchHistoryItemResponse])
async def get_continue_watching(
    pid: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get items with progress < 95% for Continue Watching row."""
    await _verify_profile_ownership(db, current_user["id"], pid)

    items = []
    async for item in db.watch_history.find(
        {"profile_id": ObjectId(pid), "progress": {"$lt": 95, "$gt": 0}}
    ).sort("last_watched", -1).limit(20):
        items.append(_format_history_item(item))

    return items


@router.delete("/{tmdb_id}", response_model=MessageResponse)
async def delete_history_item(
    pid: str,
    tmdb_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove item from watch history."""
    await _verify_profile_ownership(db, current_user["id"], pid)

    result = await db.watch_history.delete_many({
        "profile_id": ObjectId(pid),
        "tmdb_id": tmdb_id,
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in history")

    return {"message": "Removed from watch history"}


# ── Helpers ───────────────────────────────────────────────────────

async def _verify_profile_ownership(
    db: AsyncIOMotorDatabase,
        user_id: str,
        profile_id: str
):
    try:
        profile = await db.profiles.find_one({"_id": ObjectId(profile_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid profile ID")

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if str(profile["user_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not your profile")


def _format_history_item(item: dict) -> dict:
    return {
        "id": str(item["_id"]),
        "profile_id": str(item["profile_id"]),
        "tmdb_id": item["tmdb_id"],
        "media_type": item["media_type"],
        "title": item["title"],
        "poster_path": item.get("poster_path"),
        "season": item.get("season"),
        "episode": item.get("episode"),
        "progress": item["progress"],
        "current_time": item["current_time"],
        "duration": item["duration"],
        "last_watched": item["last_watched"],
    }
