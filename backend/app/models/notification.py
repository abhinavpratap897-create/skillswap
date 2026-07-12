"""Notification model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class NotificationType(str, enum.Enum):
    BOOKING_REQUEST = "booking_request"
    BOOKING_ACCEPTED = "booking_accepted"
    BOOKING_REJECTED = "booking_rejected"
    BOOKING_COMPLETED = "booking_completed"
    NEW_MESSAGE = "new_message"
    NEW_REVIEW = "new_review"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(SAEnum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)
    link = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
