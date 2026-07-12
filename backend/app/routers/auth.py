"""Authentication router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile, UserRole
from app.schemas.schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest,
)
from app.utils.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    create_verification_token, create_reset_token, decode_token, get_current_user,
)
from app.utils.email import send_verification_email, send_reset_password_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        role=UserRole.USER,
    )
    db.add(user)
    db.flush()

    profile = Profile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_verification_token(str(user.id))
    send_verification_email(user.email, token)

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id)),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id)),
        user=UserResponse.model_validate(user),
    )


@router.post("/google", response_model=TokenResponse)
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Login or register via Google OAuth token."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        from app.config import settings
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), settings.GOOGLE_CLIENT_ID)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    google_id = idinfo.get("sub")
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
        else:
            user = User(
                email=email,
                username=email.split("@")[0],
                first_name=idinfo.get("given_name", ""),
                last_name=idinfo.get("family_name", ""),
                avatar_url=idinfo.get("picture"),
                google_id=google_id,
                is_verified=True,
                role=UserRole.USER,
            )
            db.add(user)
            db.flush()
            profile = Profile(user_id=user.id)
            db.add(profile)
        db.commit()
        db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id)),
        user=UserResponse.model_validate(user),
    )


@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.token)
    if payload.get("type") != "verify":
        raise HTTPException(status_code=400, detail="Invalid verification token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        token = create_reset_token(str(user.id))
        send_reset_password_email(user.email, token)
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.token)
    if payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
