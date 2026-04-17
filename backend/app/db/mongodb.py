from colorama import Fore

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.settings import settings


client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo():
    """Initialize MongoDB connection and create indexes."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI.get_secret_value())
    db = client[settings.DATABASE_NAME]

    # Create indexes
    await db.profiles.create_index("user_id")
    await db.watchlist.create_index("profile_id")
    await db.watch_history.create_index("profile_id")
    await db.watch_history.create_index(
        [("profile_id", 1), ("tmdb_id", 1), ("media_type", 1)],
        unique=True,
    )
    await db.users.create_index("username", unique=True)
    await db.users.create_index("email", unique=True)

    print(Fore.GREEN + "Connected to MongoDB Atlas")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print(Fore.RED + "Disconnected from MongoDB Atlas")


def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency that returns the database instance."""
    return db
