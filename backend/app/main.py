"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Import all models so they register with Base.metadata
from app.models.user import User, Profile  # noqa
from app.models.skill import Skill, Category, UserSkill  # noqa
from app.models.booking import Booking  # noqa
from app.models.message import Conversation, Message  # noqa
from app.models.review import Review  # noqa
from app.models.notification import Notification  # noqa
from app.models.portfolio import Portfolio  # noqa

# Import routers
from app.routers import auth, users, skills, search, bookings, messages, reviews, notifications, admin

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A platform where users can exchange skills or hire local experts.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(skills.router)
app.include_router(search.router)
app.include_router(bookings.router)
app.include_router(messages.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(admin.router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}


# Seed categories on startup
@app.on_event("startup")
def seed_data():
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models.skill import Category
    import uuid

    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            categories = [
                {"name": "Programming", "slug": "programming", "icon": "💻", "description": "Software development and coding"},
                {"name": "Design", "slug": "design", "icon": "🎨", "description": "Graphic, UI/UX, and product design"},
                {"name": "Music", "slug": "music", "icon": "🎵", "description": "Musical instruments, production, and vocals"},
                {"name": "Languages", "slug": "languages", "icon": "🌍", "description": "Foreign language tutoring"},
                {"name": "Photography", "slug": "photography", "icon": "📷", "description": "Photo and video creation"},
                {"name": "Writing", "slug": "writing", "icon": "✍️", "description": "Content writing, copywriting, and editing"},
                {"name": "Marketing", "slug": "marketing", "icon": "📈", "description": "Digital marketing and SEO"},
                {"name": "Fitness", "slug": "fitness", "icon": "💪", "description": "Personal training and wellness"},
                {"name": "Cooking", "slug": "cooking", "icon": "🍳", "description": "Culinary arts and recipes"},
                {"name": "Business", "slug": "business", "icon": "💼", "description": "Consulting, finance, and strategy"},
                {"name": "Crafts", "slug": "crafts", "icon": "🧶", "description": "Handmade crafts and DIY projects"},
                {"name": "Education", "slug": "education", "icon": "📚", "description": "Tutoring and academic help"},
            ]
            for cat in categories:
                db.add(Category(id=uuid.uuid4(), **cat))
            db.commit()
            print("[SEED] Added default categories")
    except Exception as e:
        print(f"[SEED ERROR] {e}")
    finally:
        db.close()
