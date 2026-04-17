"""
User document model

Collection: users

Indexes:
  - username (unique)
  - email (unique)
"""

from datetime import datetime, timezone
from pydantic import BaseModel, Field


class UserDocument(BaseModel):
    """
    Represents a user document in MongoDB.
    """

    fullname: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=30)
    email: str = Field(...)
    password_hash: str = Field(...)
    role: str = Field(default="member", pattern=r"^(admin|member)$")
    is_active: bool = Field(default=True)
    reset_token: str | None = Field(default=None)
    reset_token_expiry: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_mongo(self) -> dict:
        """Convert to MongoDB document (excludes _id, let Mongo generate it)."""
        return self.model_dump(exclude_none=False)

    @staticmethod
    def from_mongo(doc: dict) -> dict | None:
        """Convert MongoDB document to API-safe dict with string id."""
        if not doc:
            return None

        doc["id"] = str(doc.pop("_id"))

        if "password_hash" in doc:
            del doc["password_hash"]

        if "reset_token" in doc:
            del doc["reset_token"]

        if "reset_token_expiry" in doc:
            del doc["reset_token_expiry"]

        return doc

    class Config:
        json_schema_extra = {
            "example": {
                "fullname": "John Doe",
                "username": "johndoe",
                "email": "john@example.com",
                "password_hash": "$2b$12$...",
                "role": "member",
                "is_active": True,
                "reset_token": None,
                "reset_token_expiry": None,
                "created_at": "2026-04-15T10:00:00Z",
                "updated_at": "2026-04-15T10:00:00Z",
            }
        }
