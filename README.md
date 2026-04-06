# Finance dashboard backend

REST API for a personal finance dashboard: **users & roles**, **financial records**, **aggregated dashboard data**, and **JWT + RBAC**.

## Stack

- Node.js, Express  
- Prisma ORM + **SQLite** (`DATABASE_URL` in `.env`)  
- JWT auth, bcrypt passwords, Joi validation  

## Setup

1. **Clone** and install dependencies:

   ```bash
   npm install
   ```

2. **Database**:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   Seed creates an admin account for development and tests:

   - **Email:** `finance-admin@example.com`  
   - **Password:** `Admin123!`  

3. **Run**:

   ```bash
   npm run dev
   ```

   Health check: `GET http://localhost:3000/health`

## Roles & access

| Role     | Typical access |
|----------|----------------|
| `VIEWER` | Dashboard summaries only (`/dashboard/*`). **Cannot** list or mutate `/records`. |
| `ANALYST` | Dashboard + **read** financial records (`GET /records`). No create/update/delete. |
| `ADMIN`   | Full record CRUD + **user management** (`/users`). |

**Registration** (`POST /auth/register`) always creates a **VIEWER**. Only an admin can change roles or `ACTIVE` / `INACTIVE` status via `PATCH /users/:id`.

Inactive users receive **403** on login (`Account is inactive`).

## API overview

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Body: `name`, `email`, `password` → new **VIEWER** |
| `POST` | `/auth/login` | Body: `email`, `password` → `{ token }` |

Use header: `Authorization: Bearer <token>`.

### Users (admin only)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users` | List users (no passwords) |
| `PATCH` | `/users/:id` | Body (at least one field): `name`, `role`, `status`. Admins cannot set their own status to `INACTIVE`. |

### Records (auth required)

| Method | Path | Who |
|--------|------|-----|
| `POST` | `/records` | Admin |
| `GET` | `/records` | Analyst, Admin — query: `type`, `category`, `startDate`, `endDate`, `q` (search category/notes), `page`, `limit` |
| `PATCH` | `/records/:id` | Admin — **partial** body allowed |
| `DELETE` | `/records/:id` | Admin — **soft delete** (sets `deletedAt`) |

`GET /records` returns:

```json
{
  "items": [ /* records */ ],
  "page": 1,
  "limit": 50,
  "total": 123
}
```

### Dashboard (all authenticated roles)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/dashboard/summary` | `totalIncome`, `totalExpense`, `netBalance` |
| `GET` | `/dashboard/category` | Totals per category |
| `GET` | `/dashboard/trends` | Query: `granularity=month` (default) or `granularity=week` → `{ granularity, buckets }` |
| `GET` | `/dashboard/recent` | Query: `limit` (default 10, max 100) → `{ items }` |

### Dev-only RBAC probes

If `ENABLE_TEST_ROUTES=true` in the environment, `/test/view`, `/test/admin`, `/test/analyst` are mounted for quick RBAC checks. **Leave unset in production-like deploys.**

## Tests

Runs **Prisma seed** first (expects DB + schema), then integration scripts in order:

```bash
npm test
```

Single health test: `npm run test:health`.

## Assumptions & tradeoffs

- **SQLite** keeps the assignment easy to run locally; production would likely use PostgreSQL with the same Prisma schema.  
- **JWT** does not encode `status`; revoking access uses short TTL (`1h`) plus login checks. A stricter design would validate `status` on each request against the DB.  
- **Soft delete**: `DELETE /records/:id` marks records with `deletedAt`, and all dashboard/record queries exclude rows where `deletedAt != null`.  
- **Rate limiting**: simple in-memory `express-rate-limit` on `/auth`, `/records`, and `/dashboard` endpoints to mitigate brute force/abuse for this assignment.  
- **Category breakdown** sums amounts per category without combining income/expense dimensions; categories are treated as user-defined labels.  
- **Weekly trends** bucket by **Monday** of the week (UTC-based ISO date key in `buckets`).

