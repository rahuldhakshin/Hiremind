# HireMind — AI-Powered Campus Placement System

A full-stack campus placement platform with AI-driven features: resume parsing, skill-gap analysis, cover letter generation, placement prediction, and a 24/7 AI career coach.

## Architecture

```
hiremind/
├── backend/          ← Django REST + Channels + Celery + Groq AI  → Deploy on Railway
└── hiremind_nextjs/  ← Next.js 16 + TypeScript + Tailwind + Zustand → Deploy on Vercel
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Zustand, TanStack Query |
| Backend | Django 4.2, Django REST Framework, Simple JWT, Django Channels |
| AI | Groq (LLaMA 3), scikit-learn (placement predictor), pdfplumber (resume parser) |
| Async | Celery + Redis |
| Database | PostgreSQL (production) / SQLite (local dev) |
| Deployment | Vercel (frontend) + Railway (backend + DB + Redis) |

## Roles

- **Student** — Browse jobs, apply, AI resume analysis, skill-gap check, AI chat, placement prediction
- **Recruiter** — Post jobs, review applicants, update application status
- **Placement Officer** — Approve/reject jobs, manage drives, view analytics
- **Admin** — Full user management, system stats

## Local Development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # fill in your values
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd hiremind_nextjs
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm run dev
```

## Deployment

### Backend → Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select the `backend/` folder as the root directory (set in Railway settings)
4. Add a **PostgreSQL** plugin and a **Redis** plugin — Railway injects `DATABASE_URL` and `REDIS_URL` automatically
5. Add these environment variables in Railway dashboard:
   - `SECRET_KEY` — a long random string
   - `DEBUG` — `False`
   - `ALLOWED_HOSTS` — `your-app.up.railway.app`
   - `GROQ_API_KEY` — your Groq API key
   - `CORS_ALLOWED_ORIGINS` — `https://your-app.vercel.app`
6. Railway will auto-detect `Procfile` and start the server

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `hiremind_nextjs`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` — `https://your-backend.up.railway.app/api`
4. Deploy!

## Environment Variables

### Backend (`backend/.env`)
See `backend/.env.example`

### Frontend (`hiremind_nextjs/.env.local`)
See `hiremind_nextjs/.env.local.example`

---

Built with ❤️ using Django + Next.js + Groq AI
