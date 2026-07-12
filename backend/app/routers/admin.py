"""Admin dashboard router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.booking import Booking
from app.models.review import Review
from app.schemas.schemas import UserResponse, AdminStatsResponse
from app.utils.security import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_skills = db.query(func.count(Skill.id)).scalar()
    total_bookings = db.query(func.count(Booking.id)).scalar()
    total_reviews = db.query(func.count(Review.id)).scalar()
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()

    return AdminStatsResponse(
        total_users=total_users,
        total_skills=total_skills,
        total_bookings=total_bookings,
        total_reviews=total_reviews,
        recent_users=[UserResponse.model_validate(u) for u in recent_users],
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(
    page: int = 1,
    per_page: int = 20,
    search: str = None,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if search:
        term = f"%{search}%"
        query = query.filter(
            User.email.ilike(term) | User.username.ilike(term) |
            User.first_name.ilike(term) | User.last_name.ilike(term)
        )
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: str, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


@router.put("/users/{user_id}/role")
def update_user_role(user_id: str, role: str, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if role not in ("user", "admin", "moderator"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}"}


@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: str, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    skill.is_active = False
    db.commit()
    return {"message": "Skill deactivated"}
