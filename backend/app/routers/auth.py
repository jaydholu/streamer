from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import get_db
from app.schemas.auth import (
    SignUpRequest,
    SignUpResponse,
    SignInRequest,
    TokenResponse,
    RefreshTokenRequest,
    DeleteAccountRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    MessageResponse,
)
from app.services import auth_service
from app.utils.dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=SignUpResponse, status_code=201)
async def signup(body: SignUpRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Register new user with invite code."""
    return await auth_service.signup_user(
        db=db,
        fullname=body.fullname,
        username=body.username,
        email=str(body.email),
        password=body.password,
        invite_code=body.invite_code,
    )


@router.post("/signin", response_model=TokenResponse)
async def signin(body: SignInRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Sign in with username or email + password."""
    return await auth_service.signin_user(
        db=db,
        login=body.login,
        password=body.password,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshTokenRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Refresh access token using refresh token."""
    return await auth_service.refresh_access_token(db, body.refresh_token)


@router.post("/signout", response_model=MessageResponse)
async def signout():
    """
    Sign out — client should discard tokens).
    Since JWTs are stateless, this is handled client-side.
    """
    return {"message": "Signed out successfully"}


@router.delete("/account", response_model=MessageResponse)
async def delete_account(
    body: DeleteAccountRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete own account and all associated data."""
    return await auth_service.delete_user_account(
        db=db,
        user_id=current_user["id"],
        password=body.password,
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Send password reset link to email."""
    return await auth_service.forgot_password(db, str(body.email))


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Reset password using valid reset token."""
    return await auth_service.reset_password(db, body.token, body.new_password)


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Change password from Settings page."""
    return await auth_service.change_password(
        db=db,
        user_id=current_user["id"],
        current_password=body.current_password,
        new_password=body.new_password,
    )
