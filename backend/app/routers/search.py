"""Search router with location and filter support."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from typing import Optional, List
from math import radians, cos, sin, asin, sqrt
from app.database import get_db
from app.models.user import User, Profile
from app.models.skill import UserSkill, Skill, Category
from app.models.review import Review
from app.schemas.schemas import (
    UserProfileResponse, UserResponse, ProfileResponse,
    UserSkillResponse, PortfolioResponse, SearchResultResponse,
)

router = APIRouter(prefix="/api/search", tags=["Search"])


def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in km."""
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * 6371 * asin(sqrt(a))


@router.get("/", response_model=SearchResultResponse)
def search_skills(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    skill_type: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    max_rate: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    radius_km: float = Query(50),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(User).options(
        joinedload(User.profile),
        joinedload(User.skills).joinedload(UserSkill.skill).joinedload(Skill.category),
        joinedload(User.portfolios),
    ).filter(User.is_active == True)

    # Text search
    if q:
        search_term = f"%{q}%"
        query = query.join(User.skills).join(UserSkill.skill).filter(
            or_(
                Skill.name.ilike(search_term),
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.username.ilike(search_term),
            )
        )

    # Category filter
    if category:
        query = query.join(User.skills, isouter=True).join(UserSkill.skill, isouter=True).join(
            Skill.category, isouter=True
        ).filter(Category.slug == category)

    # Skill type filter
    if skill_type:
        if not q and not category:
            query = query.join(User.skills, isouter=True)
        query = query.filter(UserSkill.skill_type == skill_type)

    # City filter
    if city:
        query = query.join(User.profile, isouter=True).filter(Profile.city.ilike(f"%{city}%"))

    # Max hourly rate filter
    if max_rate is not None:
        query = query.join(User.profile, isouter=True).filter(Profile.hourly_rate <= max_rate)

    # Deduplicate
    query = query.distinct()

    # Count total
    total = query.count()

    # Pagination
    offset = (page - 1) * per_page
    users = query.offset(offset).limit(per_page).all()

    # Post-filter: location distance & min_rating
    results = []
    for user in users:
        # Rating filter
        avg_rating = db.query(func.avg(Review.rating)).filter(Review.recipient_id == user.id).scalar() or 0
        total_reviews = db.query(func.count(Review.id)).filter(Review.recipient_id == user.id).scalar()

        if min_rating and float(avg_rating) < min_rating:
            continue

        # Location distance filter
        if latitude and longitude and user.profile and user.profile.latitude and user.profile.longitude:
            distance = haversine(latitude, longitude, user.profile.latitude, user.profile.longitude)
            if distance > radius_km:
                continue

        results.append(UserProfileResponse(
            user=UserResponse.model_validate(user),
            profile=ProfileResponse.model_validate(user.profile) if user.profile else None,
            skills=[UserSkillResponse.model_validate(s) for s in user.skills] if user.skills else [],
            portfolios=[PortfolioResponse.model_validate(p) for p in user.portfolios] if user.portfolios else [],
            avg_rating=round(float(avg_rating), 1),
            total_reviews=total_reviews,
        ))

    total_pages = max(1, -(-total // per_page))

    return SearchResultResponse(
        users=results,
        total=len(results),
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )
