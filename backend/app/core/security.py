from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.settings import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


# Extract secret values
_JWT_SECRET = settings.JWT_SECRET.get_secret_value()
_JWT_REFRESH_SECRET = settings.JWT_REFRESH_SECRET.get_secret_value()
_JWT_ALGORITHM = settings.JWT_ALGORITHM


# ── Password Hashing ──────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_pin(pin: str) -> str:
    """Hash a 4-digit PIN using bcrypt (same as passwords)."""
    return pwd_context.hash(pin)


def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    return pwd_context.verify(plain_pin, hashed_pin)


# ── JWT Tokens ────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})

    return jwt.encode(to_encode, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh"})

    return jwt.encode(to_encode, _JWT_REFRESH_SECRET, algorithm=_JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=[_JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload

    except JWTError:
        return None


def decode_refresh_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, _JWT_REFRESH_SECRET, algorithms=[_JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload

    except JWTError:
        return None


# ── Password Reset Token ─────────────────────────────────────────

def create_reset_token(email: str) -> str:
    """Create a time-limited reset token (15 min expiry)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    return jwt.encode(
        {"sub": email, "exp": expire, "type": "reset"},
        _JWT_SECRET,
        algorithm=_JWT_ALGORITHM,
    )


def decode_reset_token(token: str) -> str | None:
    """Returns the email if token is valid, None otherwise."""
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=[_JWT_ALGORITHM])
        if payload.get("type") != "reset":
            return None
        return payload.get("sub")

    except JWTError:
        return None
