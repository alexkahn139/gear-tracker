# Gear Tracker — Project Context

## What

A self-hosted web app for tracking a shared pool of ~20 hiking/camping gear
items, managing who has what loaned out, and building per-trip packing lists
with check-off and weight tracking.

Users: 5–15 people in a hiking group. Small, trusted. No RBAC beyond "logged in."

## Tech Stack (do not deviate)

- Backend: Node.js 22, TypeScript (strict), Hono, Drizzle ORM,
  better-sqlite3, argon2 (passwords), hono session store
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui,
  react-hook-form, TanStack Query v5, react-router-dom v6
- DB: SQLite (single file at `data/gear.db`)
- Deploy: Docker, single container. Hono serves `/api/*` and
  falls through to the built React SPA.

## Conventions

- `src/` for backend, `web/` for frontend. Two npm workspaces under one root.
- All timestamps stored as UTC ISO-8601 strings (`datetime('now')`).
- IDs are auto-increment integers.
- API returns `{ data: T }` on success, `{ error: string }` on failure (4xx/5xx).
- No external services. No Redis. No queues. No microservices.
- Do not add dependencies not listed above unless explicitly requested.
- Keep every file under ~200 lines. Split if it grows.

## Do NOT

- No Express, NestJS, Koa, Fastify, or other frameworks. Hono only.
- No TypeORM, Prisma, Mongoose. Drizzle only.
- No Angular, Svelte, Vue. React only.
- No OAuth, JWT, refresh tokens. Session cookies only.
- No Nginx, Caddy, or separate reverse proxy.
- No state management library (Redux, Zustand, MobX).
  React state + TanStack Query is enough.

The app has exactly 5 tables and ~15 API routes. It is not a platform.
Do not over-engineer.

---

## Data Model

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE gear_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN
                ('tent','sleep','cook','safety','clothing','navigation','other')),
  description TEXT,
  photo_url   TEXT,
  weight_g    INTEGER,
  qty_owned   INTEGER NOT NULL DEFAULT 1,
  condition   TEXT NOT NULL DEFAULT 'good'
              CHECK (condition IN ('new','good','worn','damaged','broken')),
  location    TEXT,
  serial_id   TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE gear_loans (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  gear_item_id      INTEGER NOT NULL REFERENCES gear_items(id),
  borrower_id       INTEGER NOT NULL REFERENCES users(id),
  checked_out_at    TEXT NOT NULL DEFAULT (datetime('now')),
  due_date          TEXT,
  returned_at       TEXT,
  condition_on_return TEXT,
  notes             TEXT
);

CREATE TABLE trips (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  start_date  TEXT,
  end_date    TEXT,
  location    TEXT,
  notes       TEXT,
  share_token TEXT UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE pack_list_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id      INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  gear_item_id INTEGER REFERENCES gear_items(id),
  ad_hoc_name  TEXT,
  qty_needed   INTEGER NOT NULL DEFAULT 1,
  qty_checked  INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);
```

### Invariants

- At most one `gear_loans` row per `gear_item_id` where `returned_at IS NULL`.
- A `pack_list_items` row has exactly one of `gear_item_id` or `ad_hoc_name` set.
- `qty_checked` must be >= 0 and <= `qty_needed`.
- `share_token` is a 16-char random hex string, generated on trip creation.

---

## API Contract

### Auth

| Method | Path                | Body                         | Response          |
|--------|---------------------|------------------------------|-------------------|
| POST   | /api/auth/register  | { name, email, password }    | 201 { data: user }|
| POST   | /api/auth/login     | { email, password }          | 200 { data: user }|
| POST   | /api/auth/logout    | —                            | 204               |
| GET    | /api/auth/me        | —                            | 200 { data: user }|

### Gear

| Method | Path             | Query / Body                           | Response                        |
|--------|------------------|----------------------------------------|---------------------------------|
| GET    | /api/gear        | ?category=&search=                     | 200 { data: { items, activeLoans } } |
| POST   | /api/gear        | { name, category, ... }                | 201 { data: item }              |
| GET    | /api/gear/:id    | —                                      | 200 { data: { item, loans } }   |
| PUT    | /api/gear/:id    | { name?, category?, ... }              | 200 { data: item }              |
| DELETE | /api/gear/:id    | — (409 if active loan)                 | 204                             |

### Loans

| Method | Path                          | Body / Query                          | Response            |
|--------|-------------------------------|---------------------------------------|---------------------|
| POST   | /api/gear/:id/loans           | { borrower_id, due_date?, notes? }    | 201 { data: loan }  |
| PUT    | /api/gear/:id/loans/:loanId   | { returned_at, condition_on_return?, notes? } | 200 { data: loan } |
| GET    | /api/loans                    | ?status=active\|overdue\|all          | 200 { data: loans } |

### Trips

| Method | Path                    | Body                              | Response              |
|--------|-------------------------|-----------------------------------|-----------------------|
| GET    | /api/trips              | —                                 | 200 { data: trips }   |
| POST   | /api/trips              | { name, start_date?, ... }        | 201 { data: trip }    |
| GET    | /api/trips/:id          | —                                 | 200 { data: { trip, packList } } |
| PUT    | /api/trips/:id          | { name?, start_date?, ... }       | 200 { data: trip }    |
| DELETE | /api/trips/:id          | —                                 | 204                   |
| GET    | /api/trips/share/:token | — (no auth)                       | 200 { data: { trip, packList } } |

### Pack List

| Method | Path                              | Body                                      | Response              |
|--------|-----------------------------------|-------------------------------------------|-----------------------|
| GET    | /api/trips/:id/packlist           | —                                         | 200 { data: { items, totalWeightG } } |
| POST   | /api/trips/:id/packlist           | { gear_item_id? \| ad_hoc_name?, qty_needed?, notes?, sort_order? } | 201 { data: item } |
| PUT    | /api/trips/:id/packlist/:itemId   | { qty_checked?, qty_needed?, notes? }     | 200 { data: item }    |
| DELETE | /api/trips/:id/packlist/:itemId   | —                                         | 204                   |

### Shared Types (TypeScript)

```ts
type User         = { id: number; name: string; email: string; phone?: string };
type GearCategory = 'tent'|'sleep'|'cook'|'safety'|'clothing'|'navigation'|'other';
type GearCondition= 'new'|'good'|'worn'|'damaged'|'broken';

type GearItem = {
  id: number; name: string; category: GearCategory;
  description?: string; photoUrl?: string; weightG?: number;
  qtyOwned: number; condition: GearCondition;
  location?: string; serialId?: string; notes?: string;
  createdAt: string;
};

type Loan = {
  id: number; gearItemId: number; borrowerId: number;
  borrowerName?: string; checkedOutAt: string; dueDate?: string;
  returnedAt?: string; conditionOnReturn?: string; notes?: string;
};

type Trip = {
  id: number; name: string; startDate?: string; endDate?: string;
  location?: string; notes?: string; shareToken: string;
  createdAt: string;
};

type PackItem = {
  id: number; tripId: number;
  gearItemId?: number; gearItemName?: string; adHocName?: string;
  qtyNeeded: number; qtyChecked: number; notes?: string; sortOrder: number;
};
```

---

## File Layout

```
gear-tracker/
├── package.json                  ← root workspace
├── tsconfig.base.json
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .gitignore
├── data/                         ← SQLite file (volume)
│
├── src/                          ← BACKEND
│   ├── server.ts
│   ├── app.ts
│   ├── types.ts
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── migrate.ts
│   ├── migrations/
│   │   └── 001_init.sql
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── gear.ts
│   │   ├── loans.ts
│   │   ├── trips.ts
│   │   └── packlist.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error.ts
│   └── lib/
│       └── utils.ts
│
└── web/                          ← FRONTEND
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── lib/
        │   ├── types.ts
        │   └── api.ts
        ├── hooks/
        │   └── useApi.ts
        ├── pages/
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── Inventory.tsx
        │   ├── GearDetail.tsx
        │   ├── Loans.tsx
        │   ├── Trips.tsx
        │   ├── TripDetail.tsx
        │   └── ShareView.tsx
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.tsx
        │   │   └── TopBar.tsx
        │   ├── gear/
        │   │   ├── GearForm.tsx
        │   │   ├── GearTable.tsx
        │   │   ├── ConditionBadge.tsx
        │   │   └── LoanSection.tsx
        │   ├── trips/
        │   │   ├── TripForm.tsx
        │   │   ├── PackListEditor.tsx
        │   │   ├── PackListItemRow.tsx
        │   │   └── WeightSummary.tsx
        │   └── shared/
        │       ├── ConfirmDialog.tsx
        │       └── EmptyState.tsx
        └── styles/
            └── globals.css
```
