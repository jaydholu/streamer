from pydantic import BaseModel, Field
from datetime import datetime


# ── Watchlist ───────────────────────────────

class WatchlistAddRequest(BaseModel):
    tmdb_id: int
    media_type: str = Field(..., pattern=r"^(movie|tv)$")
    title: str
    poster_path: str | None = None


class WatchlistItemResponse(BaseModel):
    id: str
    profile_id: str
    tmdb_id: int
    media_type: str
    title: str
    poster_path: str | None
    added_at: datetime


class WatchlistCheckResponse(BaseModel):
    in_watchlist: bool


# ── Watch History ───────────────────────────

class WatchHistoryUpsertRequest(BaseModel):
    tmdb_id: int
    media_type: str = Field(..., pattern=r"^(movie|tv)$")
    title: str
    poster_path: str | None = None
    season: int | None = None
    episode: int | None = None
    progress: float = Field(..., ge=0, le=100)
    current_time: float = Field(..., ge=0)
    duration: float = Field(..., gt=0)


class WatchHistoryItemResponse(BaseModel):
    id: str
    profile_id: str
    tmdb_id: int
    media_type: str
    title: str
    poster_path: str | None
    season: int | None
    episode: int | None
    progress: float
    current_time: float
    duration: float
    last_watched: datetime
