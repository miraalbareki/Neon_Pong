# 🎮 Neon Pong — Retro-Futuristic Pong with Modern Web Stack

> A TypeScript SPA with a Fastify backend, JWT auth, tournaments, AI matches, dashboards, and a neon-themed UI.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

## 🌟 Overview

Neon Pong is a polished Single Page Application reimagining the classic Pong with a neon cyberpunk aesthetic. It combines a TypeScript + Vite frontend with a Fastify backend powered by SQLite. The app features secure auth (JWT + Google OAuth), user profiles, stats dashboards, AI and 1v1 matches, and tournament flows — all reverse-proxied via Nginx with local HTTPS.

> Note: After registration, you must log in to access authenticated features.

## 🎯 Highlights

- **TypeScript SPA** — Framework-free, modular architecture.
- **Fastify Backend** — High-performance API with JWT auth and SQLite.
- **Neon UI** — Responsive, animated, dark-theme neon design.
- **Game Modes** — 1v1, AI matches, and tournaments.
- **Dashboards & Stats** — KPIs, match history, and performance analytics.
- **Uploads & Avatars** — Static upload serving via Fastify.
- **Dockerized** — Nginx reverse proxy + backend container.
- **Local HTTPS** — Self-signed certs for `https://localhost`.

## 🚀 Features

### Frontend
- **Pong Core** — Smooth gameplay with TypeScript game engine (`pongGame.ts`, `gamePage.ts`).
- **Tournament Flow** — Create, join, and track tournaments.
- **AI Matches** — Play against an AI (integrates with backend `ai` route).
- **User Profiles** — Update username/alias, avatar upload, and presence.
- **Dashboard & Stats** — KPIs, win rate, streaks, match history.
- **Localization** — `translations.ts` for multi-language support.
- **Neon UX** — Animations, modals, hover states, and accessibility-minded patterns.

### Backend
- **Fastify API** — CORS, static uploads, multipart, JWT.
- **Auth** — JWT-based auth and Google OAuth flow.
- **Users** — Profile management, avatar support, presence heartbeat.
- **Matches** — 1v1 games (`onevone`) and AI matches (`ai`).
- **Tournaments** — Create/join/advance, with persistence.
- **Stats & Dashboards** — Aggregated metrics and performance KPIs.
- **SQLite** — Persistent local DB via `better-sqlite3`.

## 🏗️ Architecture

### Project Structure
```
neon-pong/
├── Back-end/
│   ├── server.js                 # Fastify app bootstrap
│   ├── controllers/              # Business logic (users, stats, tournaments, AI)
│   ├── routes/                   # Route definitions (auth, users, tournaments, onevone, ai)
│   ├── queries/
│   │   ├── database.js           # DB init and queries (better-sqlite3)
│   │   └── database.db           # SQLite database (generated/persisted)
│   └── Dockerfile
├── Front-end/
│   ├── src/
│   │   ├── components/           # UI building blocks
│   │   ├── services/             # API services
│   │   ├── styles/               # CSS
│   │   ├── types/                # TS types
│   │   ├── utils/                # Helpers
│   │   ├── pongGame.ts           # Game engine
│   │   ├── gamePage.ts           # Game page logic
│   │   └── main.ts               # App entry and SPA router
│   ├── index.html
│   ├── vite.config.ts
│   └── Dockerfile
├── nginx/
│   └── Dockerfile                # Nginx reverse proxy with HTTPS
├── Docker-compose.yml
├── Makefile
├── package.json                  # Root deps (passport, express-session for oauth proxying)
└── README.md
```

### Technology Stack

- **Frontend**: TypeScript, Vite, HTML5, CSS3
- **Backend**: Fastify, @fastify/jwt, @fastify/cors, @fastify/multipart, @fastify/static
- **Database**: SQLite via better-sqlite3
- **Auth**: JWT + Google OAuth 2.0
- **Infra**: Docker, Docker Compose, Nginx, local HTTPS

## 🔐 Authentication

- **JWT** — Issued on login, required for protected routes. Presence heartbeat updates `last_seen` and `current_status`.
- **Google OAuth** — Via `routes/auth.js` (requires Google credentials).
- **Note** — After registration, you must log in to use authenticated endpoints.

## 🧭 API Overview

- **/auth** — Google OAuth endpoints (login/callback).
- **/users** — Profile CRUD, avatar upload, presence, friends/social (where applicable).
- **/tournaments** — Create/join/advance, list brackets and results.
- **/onevone** — Standalone 1v1 matches API.
- **/ai** — Single-player AI match endpoints.
- **/uploads/** — Static serving of uploaded assets (avatars, etc.).

Protected routes use the reusable `authenticate` preHandler with JWT verification.



## 🎮 Using the App

- **Register** a new account.
- **Log in** to access protected features (required after registration).
- **Play**:
  - 1v1 matches (quick matches)
  - AI matches
  - Tournaments (create/join/advance)
- **Profile**:
  - Update alias/username
  - Upload avatar
  - Presence auto-updates on activity
- **Dashboards**:
  - KPIs (win rate, streaks)
  - Match history and aggregates

## 🛡️ Security & Privacy

- JWT tokens validated on every protected request.
- Presence/heartbeat updates `last_seen` and `current_status`.
- Avatars served from `/uploads/` with Fastify Static.
- SSL enabled locally via self-signed certs (not committed).

## 📦 Production Build

```bash
# Frontend
cd Front-end
npm install
npm run build

# Backend
cd ../Back-end
npm install
npm start
```

Or build and run via Docker:
```bash
make build
make start
```

## 📄 License

This project is part of the 42 School curriculum and follows their guidelines for student projects.


---

<div align="center">

Built with ❤️ and lots of ☕  
Experience the future of retro gaming with Neon Pong!

</div>
