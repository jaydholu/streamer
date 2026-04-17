"""
Database migration / seed script.

Run once to set up indexes and initial app config.
Usage:
    python -m app.migrations.seed

This is idempotent — safe to run multiple times.
"""

import asyncio
from datetime import datetime, timezone
from colorama import Fore

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.settings import settings


async def run_migrations():
    """Create indexes and seed initial data"""

    print(f"Connecting to MongoDB: {settings.DATABASE_NAME}")
    client = AsyncIOMotorClient(settings.MONGODB_URI.get_secret_value())
    db = client[settings.DATABASE_NAME]

    # ── Indexes (SRS 6.6) ────────────────────────────────────────

    print(Fore.CYAN + "Creating indexes...")

    # Users
    await db.users.create_index("username", unique=True)
    await db.users.create_index("email", unique=True)
    print(Fore.GREEN + "  ✓ users: username (unique), email (unique)")

    # Profiles
    await db.profiles.create_index("user_id")
    print(Fore.GREEN + "  ✓ profiles: user_id")

    # Watchlist
    await db.watchlist.create_index("profile_id")
    await db.watchlist.create_index(
        [("profile_id", 1), ("tmdb_id", 1), ("media_type", 1)],
        unique=True,
    )
    print(Fore.GREEN + "  ✓ watchlist: profile_id, compound (profile_id, tmdb_id, media_type)")

    # Watch History
    await db.watch_history.create_index("profile_id")
    await db.watch_history.create_index(
        [("profile_id", 1), ("tmdb_id", 1), ("media_type", 1)],
        unique=True,
    )
    print(Fore.GREEN + "  ✓ watch_history: profile_id, compound (profile_id, tmdb_id, media_type)")

    # ── Seed App Config (SRS 6.5) ────────────────────────────────

    existing_config = await db.app_config.find_one()
    if not existing_config:
        await db.app_config.insert_one({
            "invite_code": settings.INVITE_CODE,
            "signups_enabled": True,
            "updated_at": datetime.now(timezone.utc),
            "updated_by": None,
        })
        print(Fore.CYAN + f"  ✓ app_config seeded with invite code: {settings.INVITE_CODE}")

    else:
        print(Fore.YELLOW + f"  ✓ app_config already exists (invite code: {existing_config['invite_code']})")

    # ── Verify ────────────────────────────────────────────────────

    collections = await db.list_collection_names()
    print(Fore.CYAN + f"\nCollections in '{settings.DATABASE_NAME}': {', '.join(sorted(collections))}")

    client.close()
    print(Fore.GREEN + "\n✓ Migration complete!")


if __name__ == "__main__":
    asyncio.run(run_migrations())
