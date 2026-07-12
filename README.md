# SkillSwap 🤝

> A modern full-stack platform where users can exchange skills or hire local experts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TailwindCSS 4 |
| **Backend** | FastAPI (Python 3.11) |
| **Database** | PostgreSQL 15 |
| **Auth** | JWT + Google OAuth |
| **Images** | Cloudinary |
| **Maps** | Leaflet + OpenStreetMap |
| **Animations** | Framer Motion |
| **Infrastructure** | Docker + Docker Compose |

## Features

- 🔐 JWT Authentication + Google Login
- 👤 User Profiles with portfolios
- 🎯 Skill Categories (Offer & Request)
- 🔍 Search by keyword, location, category, filters
- 📅 Booking calendar system
- 💬 Messaging / Chat
- ⭐ Ratings & Reviews
- 🔔 Notification system
- 📧 Email verification & password reset
- 🎨 Dark / Light mode with glassmorphism UI
- 📱 Fully responsive (mobile-first)
- 🛡️ Admin dashboard & moderation

## Quick Start

### Prerequisites
- Node.js 20+ / npm
- Python 3.11+
- PostgreSQL 15+ (or Docker)

### With Docker (recommended)

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/docs
- Database: localhost:5432

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
skillswap/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── config.py         # Environment config
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   └── utils/            # JWT, email, cloudinary
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar)
│   │   ├── pages/            # 11 route pages
│   │   ├── context/          # Auth + Theme providers
│   │   └── services/         # Axios API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login |
| `POST /api/auth/google` | Google OAuth |
| `GET /api/users/me/profile` | Current user profile |
| `GET /api/skills/` | List skills |
| `GET /api/search` | Search users/skills |
| `POST /api/bookings` | Create booking |
| `GET /api/messages/conversations` | List chats |
| `POST /api/reviews` | Leave a review |
| `GET /api/notifications` | Get notifications |
| `GET /api/admin/stats` | Admin analytics |

Full docs: http://localhost:8000/api/docs

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` — PostgreSQL connection
- `JWT_SECRET` — Token signing key
- `GOOGLE_CLIENT_ID` — Google OAuth (optional)
- `CLOUDINARY_*` — Image uploads (optional)
- `SMTP_*` — Email sending (optional)

## License

MIT
