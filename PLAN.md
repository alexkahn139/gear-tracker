# Gear Tracker — Build Plan

Work top to bottom. One task at a time. Test and commit after each task.

---

## Phase 1 — Skeleton & Auth

**Goal:** Running Docker container. Register, log in, see a page in the browser.

- [x] **1.1 Repo & workspaces**
  Create root `package.json` with npm workspaces (`src`, `web`).
  Create `tsconfig.base.json` (`strict: true`, `target: ES2022`, `module: NodeNext`).
  Create `.gitignore` (node_modules, data/, web/dist/).
  ✅ `npm install` succeeds. `npx tsc --noEmit` passes.

- [x] **1.2 Database layer**
  Create `src/db/schema.ts` (Drizzle tables matching CONTEXT.md §Data Model).
  Create `src/db/index.ts` (open better-sqlite3 at `data/gear.db`, wrap in Drizzle).
  Create `src/migrations/001_init.sql` (the CREATE TABLE statements).
  Create `src/db/migrate.ts` (runs .sql files in order, in a transaction).
  ✅ `sqlite3 data/gear.db ".tables"` shows all 5 tables.

- [x] **1.3 Hono server skeleton**
  Create `src/app.ts` (Hono instance, session middleware, error middleware).
  Create `src/server.ts` (mount routes, serve `web/dist/` as static fallback, listen :3000).
  Create `src/middleware/auth.ts` (session check, attach user to context).
  Create `src/middleware/error.ts` (catch → `{ error: msg }`).
  ✅ `curl localhost:3000/api/auth/me` returns `{"error":"Unauthorized"}`.

- [x] **1.3b Test harness**
  `node --test` + `tsx` runner. `src/test/fixtures.ts` (in-memory SQLite, fresh per
  test), `app.request()` helper. First test: `GET /api/auth/me` → 401.
  ✅ `npm run test` in src/ passes.

- [x] **1.4 Auth routes**
  Create `src/lib/utils.ts` (hashPassword/argon2, verifyPassword, generateShareToken).
  Create `src/routes/auth.ts` (register, login, logout, me).
  ✅ curl register → login → me returns user object. Session cookie set.

- [ ] **1.5 Frontend skeleton**
  Scaffold `web/` with Vite + React + TS. Add Tailwind, shadcn/ui,
  react-router-dom, TanStack Query, react-hook-form.
  Create `App.tsx` (router, QueryClientProvider, all routes).
  Create `lib/api.ts` (fetch wrapper, credentials: same-origin, parse { data }/{ error }).
  Create `pages/Login.tsx`, `pages/Register.tsx` (react-hook-form, redirect on success).
  Create `pages/Inventory.tsx` (placeholder heading).
  Create `components/layout/Sidebar.tsx` + `TopBar.tsx` (nav, user name, logout).
  ✅ Register → login → see Inventory page with sidebar in browser.

- [ ] **1.6 Docker**
  Write `Dockerfile` (multi-stage: build web/, copy into Node runtime + src/).
  Write `docker-compose.yml` (one service, 8080→3000, volume ./data).
  ✅ `docker compose up --build` → app on :8080. Data persists across restart.

---

## Phase 2 — Gear Inventory

**Goal:** Full CRUD on gear items with a usable table UI.

- [ ] **2.1 Gear API routes**
  Create `src/routes/gear.ts`.
  GET list (with active loan join), POST, GET by id (with loan history),
  PUT, DELETE (409 if active loan).
  ✅ All five endpoints pass curl tests.

- [ ] **2.2 Inventory page (list view)**
  Create `components/gear/GearTable.tsx` (Name, Category, Qty, Weight,
  Condition, Location, Status columns).
  Create `components/gear/ConditionBadge.tsx` (colored pill).
  Update `pages/Inventory.tsx` (GearTable + search + category filter + Add button).
  ✅ See items in table. Filter by category. Search by name.

- [ ] **2.3 Gear form (add/edit)**
  Create `components/gear/GearForm.tsx` (react-hook-form, all gear fields,
  optional `initialValues` prop for edit mode).
  Wire Add button → modal → POST → refetch.
  ✅ Add a gear item through the UI, see it in the table.

- [ ] **2.4 Gear detail page**
  Create `pages/GearDetail.tsx` (item display, edit button, loan history).
  Create `components/gear/LoanSection.tsx` (past loans list, current loan highlighted).
  ✅ View item, edit it, see loan history.

---

## Phase 3 — Lending

**Goal:** Check out / check in gear, see active and overdue loans.

- [ ] **3.1 Loan API routes**
  Create `src/routes/loans.ts`.
  POST check-out (409 if active loan exists), PUT check-in, GET with status filter.
  ✅ curl check-out → active list shows it → check-in → gone. Second check-out 409s.

- [ ] **3.2 Loans page**
  Create `pages/Loans.tsx` (active loans table, overdue in red,
  check-in button per row, Active/Overdue/History tabs).
  ✅ Check out and check in from the Loans page.

- [ ] **3.3 Check-out from Gear Detail**
  Extend `components/gear/LoanSection.tsx` with Check Out button + dialog
  (borrower select, due date, notes). Disable if already out.
  ✅ Check out / check in from item detail page.

- [ ] **3.4 Users list endpoint**
  Add `GET /api/users` (id, name) for the borrower dropdown.
  ✅ Borrower dropdown is populated.

---

## Phase 4 — Trips & Packing Lists

**Goal:** Create trips, build pack lists, check off items, share.

- [ ] **4.1 Trips API routes**
  Create `src/routes/trips.ts`.
  CRUD + `GET /api/trips/share/:token` (no auth).
  ✅ Create trip → get shareToken → share URL works without login.

- [ ] **4.2 Pack list API routes**
  Create `src/routes/packlist.ts`.
  GET (with totalWeightG), POST (enforce gear_item_id XOR ad_hoc_name),
  PUT (clamp qty_checked), DELETE.
  ✅ Add pack items, check off, verify totalWeightG.

- [ ] **4.3 Trips list page**
  Create `pages/Trips.tsx` + `components/trips/TripForm.tsx`.
  ✅ See trips, create one.

- [ ] **4.4 Trip detail / pack list editor**
  Create `pages/TripDetail.tsx` (header, share link, add-item section, pack list).
  Create `components/trips/PackListEditor.tsx` (add from inventory dropdown +
  ad-hoc input + pack list table).
  Create `components/trips/PackListItemRow.tsx` (checkbox, qty, notes, delete).
  Create `components/trips/WeightSummary.tsx` (total kg, X/Y items checked).
  ✅ Add 3 gear + 2 ad-hoc items, check off, see weight update. Persists on refresh.

- [ ] **4.5 Share view**
  Create `pages/ShareView.tsx` (no sidebar, no auth, clean pack list display).
  ✅ Open share URL in incognito, see pack list without login.

---

## Phase 5 — Polish & Hardening

- [ ] **5.1 Validation & error handling**
  Validate all POST/PUT bodies. 404 for missing IDs, 409 for conflicts.
  Create `components/shared/ConfirmDialog.tsx` and `EmptyState.tsx`.
  ✅ Empty form → friendly error. Delete with active loan → 409 shown.
  Bad ID → 404 page.

- [ ] **5.2 Mobile responsiveness**
  Audit all pages at 375px. Tables → cards or scroll. Large tap targets.
  ✅ Full flow works on phone browser without horizontal scroll.

- [ ] **5.3 Photo upload (optional)**
  POST photo per gear item. Serve from `data/photos/`. Show on detail page.
  ✅ Upload a photo, see it rendered.

- [ ] **5.4 PWA basics**
  manifest.json, Service Worker caching app shell.
  ✅ Installable on phone. Pack list viewable offline.

- [ ] **5.5 Backup script**
  `scripts/backup.sh` (sqlite3 .backup + 30-day retention).
  ✅ Run script, timestamped .db file appears.

---

## Definition of Done (whole project)

- [ ] `docker compose up --build` from clean clone → working app on :8080
- [ ] Register two users
- [ ] Add 5 gear items across categories
- [ ] Check item out → see "On Loan" → check in
- [ ] Create trip → add 4 gear + 2 ad-hoc items → check off → weight updates
- [ ] Share link works in incognito without login
- [ ] Usable on phone browser
- [ ] Database backup works
- [ ] `npx tsc --noEmit` passes in both src/ and web/
- [ ] No console.log in production code
- [ ] README.md: what it is, how to run, backup, env vars
