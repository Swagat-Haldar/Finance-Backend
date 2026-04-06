# Finance dashboard backend

REST API for a personal finance dashboard: **users & roles**, **financial records**, **aggregated dashboard data**, and **JWT + RBAC**.

## Implemented features (assignment + enhancements)

- **Authentication using tokens**: JWT via `Authorization: Bearer <token>`.
- **Role-based access control (RBAC)**: `VIEWER`, `ANALYST`, `ADMIN` enforced at route level.
- **Pagination for record listing**: `GET /records?page=&limit=` returns `{ items, page, limit, total }`.
- **Search support**: `GET /records?q=` searches `category` and `notes`.
- **Soft delete functionality**: `DELETE /records/:id` sets `deletedAt` and excludes records from lists + dashboard analytics.
- **Rate limiting**: in-memory limits on `/auth`, `/records`, `/dashboard` (returns `429` on abuse).
- **Tests (integration scripts)**: `npm test` seeds DB then runs end-to-end HTTP tests.
- **API documentation**: Swagger UI at `/docs` + OpenAPI JSON at `/docs.json`, plus route tables in this README.

## Stack

- Node.js, Express  
- Prisma ORM + **SQLite** (`DATABASE_URL` in `.env`)  
- JWT auth, bcrypt passwords, Joi validation  

## Database choice (SQLite now, PostgreSQL later)

This project uses **SQLite** for simplicity and evaluator friendliness (single local file DB).
Because the data access is through **Prisma**, shifting to **PostgreSQL at deployment time** is straightforward:

- Update `prisma/schema.prisma` datasource provider to `postgresql`
- Change `DATABASE_URL` to a Postgres connection string
- Run Prisma migrations against the new database

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

3. **Run tests first (recommended for evaluators)**:

   ```bash
   npm test
   ```

   This will:
   - run Prisma seed
   - run the integration-style HTTP tests (auth, RBAC, records, dashboard, etc.)

4. **Run the server**:

   ```bash
   npm run dev
   ```

   Health check: `GET http://localhost:3000/health`

   If you see `EADDRINUSE: address already in use :::3000`, port 3000 is already occupied.
   Stop the other running server (or change `PORT` in `.env`) and restart.

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

## Swagger / OpenAPI (what evaluators should use)

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI JSON**: `http://localhost:3000/docs.json`

### Swagger step-by-step testing (full flow)

1. Start server: `npm run dev`
2. Open Swagger: `http://localhost:3000/docs`
3. Get admin token:
   - **Auth → POST `/auth/login`**
   - Body:
     ```json
     { "email": "finance-admin@example.com", "password": "Admin123!" }
     ```
   - Copy `token` from the response.
4. Click **Authorize** (top-right) and paste:
   - `Bearer <token>`
5. Now test endpoints in this suggested order:
   - **Users (admin)**: `GET /users` then `PATCH /users/{id}` (promote user role / set INACTIVE)
   - **Records (admin)**: `POST /records`, `PATCH /records/{id}` (partial), `DELETE /records/{id}` (soft delete)
   - **Records (analyst)**: `GET /records` with query params (`page`, `limit`, `q`, `type`, `category`)
   - **Dashboard (any role)**: `/dashboard/summary`, `/dashboard/category`, `/dashboard/trends?granularity=week`, `/dashboard/recent`
   - **Rate limiting**: repeat `POST /auth/login` with wrong password rapidly until `429` appears

## Tests

Runs **Prisma seed** first (expects DB + schema), then integration scripts in order:

```bash
npm test
```

Single health test: `npm run test:health`.

## Submitting a public Swagger link (not localhost)

In most local-machine submissions, you **cannot provide a truly permanent public Swagger link**:

- `http://localhost:3000/docs` works only on **my own PC**. Other people cannot reach my machine’s `localhost`.
- A tunnel (ngrok/Cloudflare tunnel/etc.) only works **while all of these are running**:
  - your computer is **online**
  - the backend server is **running**
  - the tunnel process is **running**
- If your system goes **offline** or you close the tunnel/server, the “public link” stops working.
- On **free** ngrok plans, the public URL typically **changes** each time you restart the tunnel. A stable URL generally requires a **paid** plan (reserved domain) or hosting the backend on an always-on server.

For evaluation, the safest approach is usually:
- Provide the Swagger UI locally at `/docs` and instructions to run it, or
- Deploy the API to a cloud host (Render/Railway/Fly.io/etc.) and share that hosted `/docs` URL.
- So for deploying we need to change database from SQLite to PostgreSQL, which I can shift easily, but it introduce unnecessary complexity that's why for evaluation purpose I am skiping it for now, as per assignment's requirements to keep it simple and clean.  

## Assumptions & tradeoffs

- **SQLite** keeps the assignment easy to run locally; production would likely use PostgreSQL with the same Prisma schema.  
- **JWT** does not encode `status`; revoking access uses short TTL (`1h`) plus login checks. A stricter design would validate `status` on each request against the DB.  
- **Soft delete**: `DELETE /records/:id` marks records with `deletedAt`, and all dashboard/record queries exclude rows where `deletedAt != null`.  
- **Rate limiting**: simple in-memory `express-rate-limit` on `/auth`, `/records`, and `/dashboard` endpoints to mitigate brute force/abuse for this assignment.  
- **Category breakdown** sums amounts per category without combining income/expense dimensions; categories are treated as user-defined labels.  
- **Weekly trends** bucket by **Monday** of the week (UTC-based ISO date key in `buckets`).

