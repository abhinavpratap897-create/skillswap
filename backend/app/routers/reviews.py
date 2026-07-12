"""Reviews router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.notification import Notification, NotificationType
from app.schemas.schemas import ReviewResponse, ReviewCreateRequest, UserResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("/user/{user_id}", response_model=List[ReviewResponse])
def get_user_reviews(user_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.recipient_id == user_id).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        author = db.query(User).filter(User.id == r.author_id).first()
        results.append(ReviewResponse(
            id=r.id,
            author=UserResponse.model_validate(author),
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        ))
    return results


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    data: ReviewCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if str(data.recipient_id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot review yourself")

    review = Review(
        author_id=current_user.id,
        recipient_id=data.recipient_id,
        booking_id=data.booking_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)

    notification = Notification(
        user_id=data.recipient_id,
        type=NotificationType.NEW_REVIEW,
        title="New Review",
        message=f"{current_user.first_name} left you a {data.rating}-star review",
        link=f"/profile",
    )
    db.add(notification)
    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        author=UserResponse.model_validate(current_user),
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
