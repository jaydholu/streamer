from fastapi import APIRouter, Depends, HTTPException, Query
import httpx

from app.core.settings import settings
from app.utils.dependencies import get_current_user


router = APIRouter(prefix="/tmdb", tags=["TMDB Proxy"])

TMDB_BASE = settings.TMDB_BASE_URL
TMDB_HEADERS = {"Accept": "application/json"}


async def _tmdb_get(path: str, params: dict = None) -> dict:
    """Make a GET request to TMDB API."""
    if params is None:
        params = {}
    params["api_key"] = settings.TMDB_API_KEY.get_secret_value()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{TMDB_BASE}{path}",
                params=params,
                headers=TMDB_HEADERS,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"TMDB API error: {e.response.text}",
            )

        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Failed to reach TMDB API")


# ═══════════════════════════════════════════════════════════════
# IMPORTANT: Routes are ordered so SPECIFIC paths come BEFORE
# parameterized paths. Otherwise FastAPI matches "popular" as
# {tmdb_id} and returns 422.
#
# Order:  /trending  →  /search  →  /genre  →  /discover
#       →  /{type}/popular  →  /{type}/top_rated
#       →  /movie/{id}  →  /tv/{id}  →  /tv/{id}/season/{n}
# ═══════════════════════════════════════════════════════════════


@router.get("/trending/{media_type}/{time_window}")
async def get_trending(
    media_type: str,
    time_window: str,
    page: int = Query(1, ge=1),
    _: dict = Depends(get_current_user),
):
    """Get trending movies or TV shows."""
    return await _tmdb_get(
        f"/trending/{media_type}/{time_window}",
        {"page": page},
    )


@router.get("/search")
async def search(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    _: dict = Depends(get_current_user),
):
    """Search for movies and TV shows."""
    return await _tmdb_get("/search/multi", {"query": query, "page": page})


@router.get("/genre/{media_type}/list")
async def get_genres(
    media_type: str,
    _: dict = Depends(get_current_user),
):
    """Get genre list for movies or TV."""
    return await _tmdb_get(f"/genre/{media_type}/list")


@router.get("/discover/{media_type}")
async def discover(
    media_type: str,
    with_genres: str = Query(None),
    page: int = Query(1, ge=1),
    _: dict = Depends(get_current_user),
):
    """Discover movies or TV by genre."""
    params = {"page": page}
    if with_genres:
        params["with_genres"] = with_genres

    return await _tmdb_get(f"/discover/{media_type}", params)


# ── These MUST come BEFORE /movie/{tmdb_id} and /tv/{tmdb_id} ──

@router.get("/movie/popular")
async def get_popular_movies(
    page: int = Query(1, ge=1),
    _: dict = Depends(get_current_user),
):
    """Get popular movies."""
    return await _tmdb_get("/movie/popular", {"page": page})


@router.get("/movie/top_rated")
async def get_top_rated_movies(
    page: int = Query(1, ge=1),
    _: dict = Depends(get_current_user),
):
    """Get top-rated movies."""
    return await _tmdb_get("/movie/top_rated", {"page": page})


@router.get("/tv/popular")
async def get_popular_tv(
    page: int = Query(1, ge=1),
    _: dict = Depends(get_current_user),
):
    """Get popular TV shows."""
    return await _tmdb_get("/tv/popular", {"page": page})


@router.get("/tv/top_rated")
async def get_top_rated_tv(
    page: int = Query(1, ge=1),
    _: dict = Depends(get_current_user),
):
    """Get top-rated TV shows."""
    return await _tmdb_get("/tv/top_rated", {"page": page})


# ── Detail routes (parameterized — must come AFTER specific routes) ──

@router.get("/movie/{tmdb_id}")
async def get_movie_detail(
    tmdb_id: int,
    _: dict = Depends(get_current_user),
):
    """Get movie details with credits and similar titles."""
    return await _tmdb_get(
        f"/movie/{tmdb_id}",
        {"append_to_response": "credits,similar"},
    )


@router.get("/tv/{tmdb_id}")
async def get_tv_detail(
    tmdb_id: int,
    _: dict = Depends(get_current_user),
):
    """Get TV show details with credits and similar titles."""
    return await _tmdb_get(
        f"/tv/{tmdb_id}",
        {"append_to_response": "credits,similar"},
    )


@router.get("/tv/{tmdb_id}/season/{season_number}")
async def get_season_detail(
    tmdb_id: int,
    season_number: int,
    _: dict = Depends(get_current_user),
):
    """Get season details with episodes."""
    return await _tmdb_get(f"/tv/{tmdb_id}/season/{season_number}")
