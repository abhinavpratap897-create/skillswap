"""Booking model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Float, default=60)
    total_price = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    location = Column(String(300), nullable=True)
    meeting_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("User", foreign_keys=[client_id], back_populates="bookings_as_client")
    provider = relationship("User", foreign_keys=[provider_id], back_populates="bookings_as_provider")
    skill = relationship("Skill")
