"""
App Config document model

Collection: app_config
Stores application-level settings managed by the admin.
Uses a single document pattern (only one document in the collection).
"""

from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, Field


class AppConfigDocument(BaseModel):
    """
    Represents the app configuration document in MongoDB.
    Single document pattern — only one document exists in this collection.
    """

    invite_code: str = Field(
        ..., min_length=4,
        max_length=50,
        description="Current invite code required for sign-up",
    )
    signups_enabled: bool = Field(default=True, description="Whether new sign-ups are allowed")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: str | None = Field(default=None, description="Admin user ID who last updated the config")

    def to_mongo(self) -> dict:
        """Convert to MongoDB document."""
        data = self.model_dump(exclude_none=False)
        if data.get("updated_by"):
            data["updated_by"] = ObjectId(data["updated_by"])

        return data

    @staticmethod
    def from_mongo(doc: dict) -> dict | None:
        """Convert MongoDB document to API-safe dict."""
        if not doc:
            return None

        return {
            "id": str(doc["_id"]),
            "invite_code": doc["invite_code"],
            "signups_enabled": doc.get("signups_enabled", True),
            "updated_at": doc.get("updated_at"),
            "updated_by": str(doc["updated_by"]) if doc.get("updated_by") else None,
        }

    class Config:
        json_schema_extra = {
            "example": {
                "invite_code": "streamer2026",
                "signups_enabled": True,
                "updated_at": "2026-04-15T10:00:00Z",
                "updated_by": "6625a1b2c3d4e5f6a7b8c9d0",
            }
        }
