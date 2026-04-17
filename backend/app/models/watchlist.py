"""
Watchlist document model

Collection: watchlist

Indexes:
  - profile_id

Relationships:
  - Profile → Watchlist: One-to-Many (1 profile has many watchlist items)
  - Watchlist → TMDB: References external TMDB IDs (fetched via API)
"""

from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, Field


class WatchlistDocument(BaseModel):
    """
    Represents a watchlist item document in MongoDB.
    """

    profile_id: str = Field(..., description="Reference to Profiles collection")
    tmdb_id: int = Field(..., description="TMDB content ID")
    media_type: str = Field(..., pattern=r"^(movie|tv)$", description="'movie' or 'tv'")
    title: str = Field(..., description="Cached title for quick display")
    poster_path: str | None = Field(default=None, description="Cached poster path from TMDB")
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
            "added_at": doc["added_at"],
        }

    class Config:
        json_schema_extra = {
            "example": {
                "profile_id": "6625a1b2c3d4e5f6a7b8c9d0",
                "tmdb_id": 550,
                "media_type": "movie",
                "title": "Fight Club",
                "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                "added_at": "2026-04-15T10:00:00Z",
            }
        }
