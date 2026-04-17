# Streamer — Backend API

Private Netflix-style streaming web application backend built with FastAPI, MongoDB Atlas, and TMDB API.

## Tech Stack

- **Framework:** Python FastAPI (async)
- **Database:** MongoDB Atlas via Motor (async driver)
- **Auth:** JWT (access + refresh tokens) with bcrypt password hashing
- **Content API:** TMDB API v3 (proxied through backend)
- **Email:** aiosmtplib for password reset emails

## Project Structure

```
backend/
├── main.py                     # Uvicorn entrypoint, FastAPI app
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (not committed)
├── .env.example                # Template for .env
├── .gitignore
│
└── app/
    ├── __init__.py
    ├── core/
    │   ├── config.py           # Pydantic BaseSettings (loads .env)
    │   └── security.py         # JWT creation/validation, bcrypt hashing
    ├── db/
    │   └── mongodb.py          # Motor async client, get_db dependency
    ├── models/
    │   ├── user.py             # User document model (SRS 6.1)
    │   ├── profile.py          # Profile document model (SRS 6.2)
    │   ├── watchlist.py        # Watchlist document model (SRS 6.3)
    │   ├── watch_history.py    # Watch History document model (SRS 6.4)
    │   └── app_config.py       # App Config document model (SRS 6.5)
    ├── schemas/
    │   ├── auth.py             # Auth request/response schemas
    │   ├── profile.py          # Profile CRUD + PIN schemas
    │   ├── watchlist.py        # Watchlist & History schemas
    │   └── admin.py            # Admin dashboard schemas
    ├── routers/
    │   ├── auth.py             # /api/v1/auth/* endpoints (SRS 7.1)
    │   ├── profiles.py         # /api/v1/profiles/* endpoints (SRS 7.3)
    │   ├── watchlist.py        # /api/v1/profiles/{pid}/watchlist/* (SRS 7.4)
    │   ├── history.py          # /api/v1/profiles/{pid}/history/* (SRS 7.5)
    │   ├── admin.py            # /api/v1/admin/* endpoints (SRS 7.2)
    │   └── tmdb.py             # /api/v1/tmdb/* proxy endpoints (SRS 7.6)
    ├── services/
    │   ├── auth_service.py     # Auth business logic
    │   ├── profile_service.py  # Profile + PIN business logic
    │   └── admin_service.py    # Admin management business logic
    ├── utils/
    │   ├── dependencies.py     # FastAPI deps: get_current_user, require_admin
    │   └── email.py            # SMTP password reset email sender
    └── migrations/
        └── seed.py             # Index creation + initial config seed
```

## Setup

### 1. Clone & Install

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — random secret keys (min 32 chars)
- `TMDB_API_KEY` — get from https://www.themoviedb.org/settings/api
- `SMTP_*` — Gmail or other SMTP credentials for password reset emails

### 3. Run Migrations

```bash
python -m app.migrations.seed
```

This creates indexes and seeds the initial app config (idempotent, safe to re-run).

### 4. Start the Server

```bash
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## API Endpoints

All endpoints prefixed with `/api/v1`.

| Group      | Method | Endpoint                                 | Auth      |
|------------|--------|------------------------------------------|-----------|
| Auth       | POST   | /auth/signup                             | Public    |
| Auth       | POST   | /auth/signin                             | Public    |
| Auth       | POST   | /auth/refresh                            | Public    |
| Auth       | POST   | /auth/signout                            | Bearer    |
| Auth       | DELETE | /auth/account                            | Bearer    |
| Auth       | POST   | /auth/forgot-password                    | Public    |
| Auth       | POST   | /auth/reset-password                     | Public    |
| Auth       | POST   | /auth/change-password                    | Bearer    |
| Profiles   | GET    | /profiles                                | Bearer    |
| Profiles   | POST   | /profiles                                | Bearer    |
| Profiles   | PUT    | /profiles/{profile_id}                   | Bearer    |
| Profiles   | DELETE | /profiles/{profile_id}                   | Bearer    |
| Profiles   | POST   | /profiles/{profile_id}/pin               | Bearer    |
| Profiles   | DELETE | /profiles/{profile_id}/pin               | Bearer    |
| Profiles   | POST   | /profiles/{profile_id}/verify-pin        | Bearer    |
| Watchlist  | GET    | /profiles/{pid}/watchlist                | Bearer    |
| Watchlist  | POST   | /profiles/{pid}/watchlist                | Bearer    |
| Watchlist  | DELETE | /profiles/{pid}/watchlist/{tmdb_id}      | Bearer    |
| Watchlist  | GET    | /profiles/{pid}/watchlist/check/{tmdb_id}| Bearer    |
| History    | GET    | /profiles/{pid}/history                  | Bearer    |
| History    | POST   | /profiles/{pid}/history                  | Bearer    |
| History    | GET    | /profiles/{pid}/history/continue         | Bearer    |
| History    | DELETE | /profiles/{pid}/history/{tmdb_id}        | Bearer    |
| Admin      | GET    | /admin/users                             | Admin     |
| Admin      | PATCH  | /admin/users/{user_id}/deactivate        | Admin     |
| Admin      | PATCH  | /admin/users/{user_id}/activate          | Admin     |
| Admin      | DELETE | /admin/users/{user_id}                   | Admin     |
| Admin      | PATCH  | /admin/users/{user_id}/reset-password    | Admin     |
| Admin      | GET    | /admin/stats                             | Admin     |
| Admin      | GET    | /admin/invite-code                       | Admin     |
| Admin      | PUT    | /admin/invite-code                       | Admin     |
| Admin      | POST   | /admin/invite-code/regenerate            | Admin     |
| TMDB       | GET    | /tmdb/trending/{media_type}/{time_window}| Bearer    |
| TMDB       | GET    | /tmdb/search?query=...                   | Bearer    |
| TMDB       | GET    | /tmdb/movie/{tmdb_id}                    | Bearer    |
| TMDB       | GET    | /tmdb/tv/{tmdb_id}                       | Bearer    |
| TMDB       | GET    | /tmdb/tv/{tmdb_id}/season/{num}          | Bearer    |
| TMDB       | GET    | /tmdb/genre/{media_type}/list            | Bearer    |
| TMDB       | GET    | /tmdb/{media_type}/popular               | Bearer    |
| TMDB       | GET    | /tmdb/{media_type}/top_rated             | Bearer    |
| TMDB       | GET    | /tmdb/discover/{media_type}              | Bearer    |
| Health     | GET    | /health                                  | Public    |

## Deployment (Render.com)

See SRS Section 11 for full deployment configuration.

```yaml
# render.yaml
services:
  - type: web
    name: streamer-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
```
