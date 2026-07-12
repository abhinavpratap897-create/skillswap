"""Bookings router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.skill import Skill
from app.models.notification import Notification, NotificationType
from app.schemas.schemas import BookingResponse, BookingCreateRequest, BookingUpdateRequest, UserResponse, SkillResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def booking_to_response(booking):
    return BookingResponse(
        id=booking.id,
        client=UserResponse.model_validate(booking.client),
        provider=UserResponse.model_validate(booking.provider),
        skill=SkillResponse.model_validate(booking.skill),
        status=booking.status.value if hasattr(booking.status, 'value') else booking.status,
        scheduled_at=booking.scheduled_at,
        duration_minutes=booking.duration_minutes,
        total_price=booking.total_price,
        notes=booking.notes,
        location=booking.location,
        meeting_link=booking.meeting_link,
        created_at=booking.created_at,
    )


@router.get("/", response_model=List[BookingResponse])
def list_bookings(
    status_filter: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Booking).options(
        joinedload(Booking.client), joinedload(Booking.provider), joinedload(Booking.skill)
    ).filter(
        (Booking.client_id == current_user.id) | (Booking.provider_id == current_user.id)
    )
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    bookings = query.order_by(Booking.scheduled_at.desc()).all()
    return [booking_to_response(b) for b in bookings]


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(data: BookingCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider = db.query(User).filter(User.id == data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    skill = db.query(Skill).filter(Skill.id == data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    booking = Booking(
        client_id=current_user.id,
        provider_id=data.provider_id,
        skill_id=data.skill_id,
        scheduled_at=data.scheduled_at,
        duration_minutes=data.duration_minutes,
        notes=data.notes,
        location=data.location,
    )
    db.add(booking)

    notification = Notification(
        user_id=data.provider_id,
        type=NotificationType.BOOKING_REQUEST,
        title="New Booking Request",
        message=f"{current_user.first_name} wants to book {skill.name}",
        link=f"/bookings",
    )
    db.add(notification)
    db.commit()
    db.refresh(booking)

    booking = db.query(Booking).options(
        joinedload(Booking.client), joinedload(Booking.provider), joinedload(Booking.skill)
    ).filter(Booking.id == booking.id).first()
    return booking_to_response(booking)


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_status(
    booking_id: str,
    data: BookingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).options(
        joinedload(Booking.client), joinedload(Booking.provider), joinedload(Booking.skill)
    ).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.provider_id != current_user.id and booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    booking.status = data.status

    # Create notification
    notify_user_id = booking.client_id if current_user.id == booking.provider_id else booking.provider_id
    ntype_map = {
        "accepted": NotificationType.BOOKING_ACCEPTED,
        "rejected": NotificationType.BOOKING_REJECTED,
        "completed": NotificationType.BOOKING_COMPLETED,
    }
    ntype = ntype_map.get(data.status.value, NotificationType.SYSTEM)
    notification = Notification(
        user_id=notify_user_id,
        type=ntype,
        title=f"Booking {data.status.value.capitalize()}",
        message=f"Your booking has been {data.status.value}",
        link="/bookings",
    )
    db.add(notification)
    db.commit()
    db.refresh(booking)
    return booking_to_response(booking)
