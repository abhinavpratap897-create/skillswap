"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


# ─── Auth ───────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class GoogleLoginRequest(BaseModel):
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class VerifyEmailRequest(BaseModel):
    token: str


# ─── User ───────────────────────────────────────────────────
class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None


# ─── Profile ────────────────────────────────────────────────
class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    bio: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class UserProfileResponse(BaseModel):
    user: UserResponse
    profile: Optional[ProfileResponse] = None
    skills: List["UserSkillResponse"] = []
    portfolios: List["PortfolioResponse"] = []
    avg_rating: float = 0.0
    total_reviews: int = 0

    class Config:
        from_attributes = True


# ─── Skill ──────────────────────────────────────────────────
class SkillTypeEnum(str, Enum):
    OFFER = "offer"
    REQUEST = "request"
    BOTH = "both"


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryCreateRequest(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None


class SkillResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class SkillCreateRequest(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    category_id: Optional[UUID] = None


class UserSkillResponse(BaseModel):
    id: UUID
    skill: SkillResponse
    skill_type: str
    proficiency_level: int
    hourly_rate: Optional[float] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserSkillCreateRequest(BaseModel):
    skill_id: UUID
    skill_type: SkillTypeEnum = SkillTypeEnum.OFFER
    proficiency_level: int = Field(ge=1, le=5, default=3)
    hourly_rate: Optional[float] = None
    description: Optional[str] = None


# ─── Booking ────────────────────────────────────────────────
class BookingStatusEnum(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingResponse(BaseModel):
    id: UUID
    client: UserResponse
    provider: UserResponse
    skill: SkillResponse
    status: str
    scheduled_at: datetime
    duration_minutes: float
    total_price: Optional[float] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BookingCreateRequest(BaseModel):
    provider_id: UUID
    skill_id: UUID
    scheduled_at: datetime
    duration_minutes: float = 60
    notes: Optional[str] = None
    location: Optional[str] = None


class BookingUpdateRequest(BaseModel):
    status: BookingStatusEnum


# ─── Message ────────────────────────────────────────────────
class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreateRequest(BaseModel):
    content: str = Field(min_length=1)


class ConversationResponse(BaseModel):
    id: UUID
    participant_one: UserResponse
    participant_two: UserResponse
    last_message_at: Optional[datetime] = None
    last_message: Optional[str] = None
    unread_count: int = 0

    class Config:
        from_attributes = True


class ConversationCreateRequest(BaseModel):
    recipient_id: UUID


# ─── Review ─────────────────────────────────────────────────
class ReviewResponse(BaseModel):
    id: UUID
    author: UserResponse
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCreateRequest(BaseModel):
    recipient_id: UUID
    booking_id: Optional[UUID] = None
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


# ─── Notification ───────────────────────────────────────────
class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    message: Optional[str] = None
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Portfolio ──────────────────────────────────────────────
class PortfolioResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    project_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    project_url: Optional[str] = None


# ─── Search ─────────────────────────────────────────────────
class SearchQuery(BaseModel):
    q: Optional[str] = None
    category: Optional[str] = None
    skill_type: Optional[SkillTypeEnum] = None
    min_rating: Optional[float] = None
    max_rate: Optional[float] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = 50
    page: int = 1
    per_page: int = 20


class SearchResultResponse(BaseModel):
    users: List[UserProfileResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# ─── Admin ──────────────────────────────────────────────────
class AdminStatsResponse(BaseModel):
    total_users: int
    total_skills: int
    total_bookings: int
    total_reviews: int
    recent_users: List[UserResponse]


# Resolve forward references
TokenResponse.model_rebuild()
UserProfileResponse.model_rebuild()
