"""
Watch History document model

Collection: watch_history

Indexes:
  - profile_id
  - Compound: (profile_id, tmdb_id, media_type) — unique, for efficient upserts

Relationships:
  - Profile → Watch History: One-to-Many (1 profile has many history records)
  - Watch History → TMDB: References external TMDB IDs (fetched via API)
"""

from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, Field


class WatchHistoryDocument(BaseModel):
    """
    Represents a watch history item document in MongoDB.
    """

    profile_id: str = Field(..., description="Reference to Profiles collection")
    tmdb_id: int = Field(..., description="TMDB content ID")
    media_type: str = Field(..., pattern=r"^(movie|tv)$", description="'movie' or 'tv'")
    title: str = Field(..., description="Cached title")
    poster_path: str | None = Field(default=None, description="Cached poster path from TMDB")
    season: int | None = Field(default=None, description="Season number (TV only)")
    episode: int | None = Field(default=None, description="Episode number (TV only)")
    progress: float = Field(..., ge=0, le=100, description="Watch progress percentage (0-100)")
    current_time: float = Field(..., ge=0, description="Current playback position in seconds")
    duration: float = Field(..., gt=0, description="Total duration in seconds")
    last_watched: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_mongo(self) -> dict:
        """Convert to MongoDB document, casting profile_id to ObjectId."""
        data = self.model_dump(exclude_none=False)
        data["profile_id"] = ObjectId(data["profile_id"])

        return data

    @staticmethod
    def from_mongo(doc: dict) -> dict | None:
        """Convert MongoDB document to API-safe dict."""
        if not doc:
            return None

        return {
            "id": str(doc["_id"]),
            "profile_id": str(doc["profile_id"]),
            "tmdb_id": doc["tmdb_id"],
            "media_type": doc["media_type"],
            "title": doc["title"],
            "poster_path": doc.get("poster_path"),
            "season": doc.get("season"),
            "episode": doc.get("episode"),
            "progress": doc["progress"],
            "current_time": doc["current_time"],
            "duration": doc["duration"],
            "last_watched": doc["last_watched"],
        }

    class Config:
        json_schema_extra = {
            "example": {
                "profile_id": "6625a1b2c3d4e5f6a7b8c9d0",
                "tmdb_id": 550,
                "media_type": "movie",
                "title": "Fight Club",
                "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                "season": None,
                "episode": None,
                "progress": 45.5,
                "current_time": 3280.0,
                "duration": 7920.0,
                "last_watched": "2026-04-15T10:30:00Z",
            }
        }


# Continue watching threshold
CONTINUE_WATCHING_MAX_PROGRESS = 95
CONTINUE_WATCHING_MIN_PROGRESS = 0
