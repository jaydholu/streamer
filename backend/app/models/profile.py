"""
Profile document model

Collection: profiles

Indexes:
  - user_id

Relationships:
  - User → Profiles: One-to-Many (1 user has up to 5 profiles)
"""

from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, Field


class ProfileDocument(BaseModel):
    """
    Represents a profile document in MongoDB.
    """

    user_id: str = Field(..., description="Reference to Users collection")
    name: str = Field(..., min_length=1, max_length=30)
    avatar: str = Field(default="avatar_1", description="Avatar identifier or URL")
    pin_hash: str | None = Field(default=None, description="Bcrypt hashed 4-digit PIN (null if no lock)")
    is_locked: bool = Field(default=False, description="Whether profile requires PIN to access")
    is_kids: bool = Field(default=False, description="Kid-friendly content filter flag")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_mongo(self) -> dict:
        """Convert to MongoDB document, casting user_id to ObjectId."""
        data = self.model_dump(exclude_none=False)
        data["user_id"] = ObjectId(data["user_id"])

        return data

    @staticmethod
    def from_mongo(doc: dict) -> dict | None:
        """Convert MongoDB document to API-safe dict."""
        if not doc:
            return None

        return {
            "id": str(doc["_id"]),
            "user_id": str(doc["user_id"]),
            "name": doc["name"],
            "avatar": doc.get("avatar", "avatar_1"),
            "is_locked": doc.get("is_locked", False),
            "is_kids": doc.get("is_kids", False),
            "created_at": doc.get("created_at", datetime.now(timezone.utc)),
        }

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "6625a1b2c3d4e5f6a7b8c9d0",
                "name": "John",
                "avatar": "avatar_3",
                "pin_hash": None,
                "is_locked": False,
                "is_kids": False,
                "created_at": "2026-04-15T10:00:00Z",
            }
        }


# Predefined avatar set
AVAILABLE_AVATARS = [f"avatar_{i}" for i in range(1, 21)]

MAX_PROFILES_PER_USER = 5
