"""User and Profile management router."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models.user import User, Profile
from app.models.review import Review
from app.models.portfolio import Portfolio
from app.schemas.schemas import (
    UserResponse, UserUpdateRequest, ProfileResponse, ProfileUpdateRequest,
    UserProfileResponse, UserSkillResponse, PortfolioResponse, PortfolioCreateRequest,
)
from app.utils.security import get_current_user
from app.utils.cloudinary_util import upload_image

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me/profile", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).options(
        joinedload(User.profile),
        joinedload(User.skills),
        joinedload(User.portfolios),
    ).filter(User.id == current_user.id).first()

    avg_rating = db.query(func.avg(Review.rating)).filter(Review.recipient_id == user.id).scalar() or 0
    total_reviews = db.query(func.count(Review.id)).filter(Review.recipient_id == user.id).scalar()

    return UserProfileResponse(
        user=UserResponse.model_validate(user),
        profile=ProfileResponse.model_validate(user.profile) if user.profile else None,
        skills=[UserSkillResponse.model_validate(s) for s in user.skills] if user.skills else [],
        portfolios=[PortfolioResponse.model_validate(p) for p in user.portfolios] if user.portfolios else [],
        avg_rating=round(float(avg_rating), 1),
        total_reviews=total_reviews,
    )


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).options(
        joinedload(User.profile),
        joinedload(User.skills),
        joinedload(User.portfolios),
    ).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    avg_rating = db.query(func.avg(Review.rating)).filter(Review.recipient_id == user.id).scalar() or 0
    total_reviews = db.query(func.count(Review.id)).filter(Review.recipient_id == user.id).scalar()

    return UserProfileResponse(
        user=UserResponse.model_validate(user),
        profile=ProfileResponse.model_validate(user.profile) if user.profile else None,
        skills=[UserSkillResponse.model_validate(s) for s in user.skills] if user.skills else [],
        portfolios=[PortfolioResponse.model_validate(p) for p in user.portfolios] if user.portfolios else [],
        avg_rating=round(float(avg_rating), 1),
        total_reviews=total_reviews,
    )


@router.put("/me", response_model=UserResponse)
def update_user(data: UserUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.username and data.username != current_user.username:
        existing = db.query(User).filter(User.username == data.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.put("/me/profile", response_model=ProfileResponse)
def update_profile(data: ProfileUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return ProfileResponse.model_validate(profile)


@router.post("/me/avatar", response_model=UserResponse)
def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = upload_image(file.file, folder="skillswap/avatars")
    if result["url"]:
        current_user.avatar_url = result["url"]
        db.commit()
        db.refresh(current_user)
    return UserResponse.model_validate(current_user)


# ─── Portfolio ──────────────────────────────────────────────
@router.get("/me/portfolios", response_model=list[PortfolioResponse])
def get_my_portfolios(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    return [PortfolioResponse.model_validate(p) for p in portfolios]


@router.post("/me/portfolios", response_model=PortfolioResponse, status_code=201)
def create_portfolio(
    data: PortfolioCreateRequest,
    file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_url = None
    if file:
        result = upload_image(file.file, folder="skillswap/portfolios")
        image_url = result.get("url")

    portfolio = Portfolio(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        image_url=image_url,
        project_url=data.project_url,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return PortfolioResponse.model_validate(portfolio)


@router.delete("/me/portfolios/{portfolio_id}")
def delete_portfolio(portfolio_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio deleted"}
