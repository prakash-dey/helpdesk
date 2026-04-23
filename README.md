# SupportDesk Pro

A full-featured customer support platform (Zendesk clone) built with Node.js/TypeScript + Prisma + PostgreSQL on the backend and React 18 + TypeScript + Tailwind CSS on the frontend.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis)

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 15** on `localhost:5432`
- **Redis 7** on `localhost:6379`
- **pgAdmin** on `http://localhost:5050` (admin@supportdesk.dev / admin)

### 2. Backend

```bash
cd BE
cp .env.example .env        # already pre-filled for local dev
npm install
npx prisma migrate dev --name init
npm run dev
```

API available at: `http://localhost:4000/api/v1/health`

### 3. Frontend

```bash
cd FE
npm install
npm run dev
```

App available at: `http://localhost:5173`

---

## Environment Variables (BE/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing JWTs (change in production!) |
| `AWS_S3_BUCKET` | S3 bucket for attachments |
| `SMTP_*` | Outbound email settings |
| `IMAP_*` | Inbound email-to-ticket polling |

---

## Architecture

```
helpdesk_support/
├── docker-compose.yml        # PostgreSQL 15 + Redis 7 + pgAdmin
├── BE/                       # Express/TypeScript REST API
│   ├── prisma/schema.prisma  # Full DB schema (16 models)
│   └── src/
│       ├── modules/          # Feature modules (auth, tickets, kb, sla, ...)
│       ├── jobs/             # BullMQ workers (email, SLA, webhooks, IMAP)
│       ├── socket/           # Socket.io real-time layer
│       └── middleware/       # Auth, RBAC, rate limiting
└── FE/                       # React 18 SPA
    └── src/
        ├── modules/          # Pages (auth, dashboard, tickets, kb, settings, analytics)
        ├── components/       # Shared UI components
        ├── store/            # Zustand state
        └── hooks/            # useSocket, useAuth
```

## Roles

| Role | Permissions |
|---|---|
| **Admin** | Full access, org settings, billing, audit log |
| **Team Lead** | All ticket actions, team reports |
| **Agent** | Own-queue tickets, no admin settings |
| **Viewer** | Read-only |
| **Customer** | Own tickets, public KB, CSAT |

## API Base

All endpoints: `GET /api/v1/health` → `{ ok: true }`

Auth endpoints use `Bearer <JWT>` in the `Authorization` header.
Refresh tokens are stored in a `httpOnly SameSite=Strict` cookie.

## Database

Run studio: `cd BE && npm run prisma:studio` → `http://localhost:5555`

Reset and re-seed: `cd BE && npm run prisma:reset`
