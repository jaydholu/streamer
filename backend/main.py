from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import (
    auth_router,
    profiles_router,
    watchlist_router,
    history_router,
    admin_router,
    tmdb_router,
)


# ── Lifespan ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: connect to MongoDB.
    Shutdown: close connection.
    """
    await connect_to_mongo()
    yield
    await close_mongo_connection()


# ── App ───────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    description="Private Netflix-style streaming web application",
    version="1.0.0",
    lifespan=lifespan,
)


# ── CORS ──────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ──────────────────────────────────────────────

API_PREFIX = settings.API_PREFIX

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(profiles_router, prefix=API_PREFIX)
app.include_router(watchlist_router, prefix=API_PREFIX)
app.include_router(history_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(tmdb_router, prefix=API_PREFIX)


# ── Health Check ──────────────────────────────────────────────────
@app.get("/", tags=["Root / Home"])
def root():
    return {"message": "Streamer API's are running. Got to /docs for more info."}


# ── Health Check ──────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
