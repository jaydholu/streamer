from app.models.user import UserDocument
from app.models.profile import ProfileDocument, AVAILABLE_AVATARS, MAX_PROFILES_PER_USER
from app.models.watchlist import WatchlistDocument
from app.models.watch_history import (
    WatchHistoryDocument,
    CONTINUE_WATCHING_MAX_PROGRESS,
    CONTINUE_WATCHING_MIN_PROGRESS,
)
from app.models.app_config import AppConfigDocument
