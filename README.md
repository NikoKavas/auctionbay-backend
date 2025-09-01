# AuctionBay — Backend (NestJS + Prisma + PostgreSQL)

Secure backend API for the **AuctionBay** web auction platform.  
Provides user auth (JWT access + refresh), auctions & bidding, profile management, and safe avatar uploads.

> Frontend lives in a separate repo (React + Vite + TypeScript). This repo is **API only**.

---

## Tech Stack

- **Runtime:** Node.js (TypeScript), **NestJS**
- **Database:** PostgreSQL + **Prisma ORM**
- **Auth:** JWT (access & refresh), Nest strategies/guards, **bcrypt**
- **Validation:** `class-validator` / `class-transformer`
- **Uploads:** **Multer** to `./files` with extension safety checks
- **Dev:** Prisma migrations, environment-based config

---

## Features

### Users & Auth
- Register / Login → **access** & **refresh** tokens
- Update profile (first/last name, email), change password
- Upload avatar (stored under `./files`)

### Auctions
- Create / edit / delete auctions (image, description, starting bid, end time)
- Status handling and time-left logic
- Editing rules enforced (e.g., **starting price locked once there’s a bid**)

### Bidding
- Place bids with enforced **minimum next bid**
- Server rejects bids for ended auctions
- Shape designed for “real-time-ish” UX (client re-fetch after a bid)

### Lists for current user
- **My auctions**
- **Bidding** (active auctions where user has bids)
- **Won** (ended auctions where user is the winner)

---

## Business Rules (high level)

- **Min bid logic**
  - If **no bids**: first bid must be **≥ `startingBid`**.
  - If **bids exist**: min allowed is **`highestBid + 1`**.
- **Ended auctions**: no further bids; marked **Done**.
- **Starting price**: cannot be edited once **any bid** exists (UI + API).

---

## Requirements

- **Node.js** 18+
- **npm** (or **pnpm/yarn**)
- **PostgreSQL** 13+

---

## Getting Started

### 1) Clone & install
```bash
git clone https://github.com/NikoKavas/auctionbay-backend.git
cd auctionbay-backend
npm install
```

### 2) Environment
Create a `.env` file in the project root:

```ini
# --- Server ---
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# --- Database ---
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auctionbay?schema=public"

# --- JWT ---
JWT_SECRET=super-secret-access
JWT_SECRET_EXPIRES=15m
JWT_REFRESH_SECRET=super-secret-refresh
JWT_REFRESH_SECRET_EXPIRES=7d

# --- File uploads ---
FILES_DIR=./files
```

> Adjust `DATABASE_URL` and `CORS_ORIGIN` to match your setup.

### 3) Database & Prisma
```bash
# Create DB schema and apply migrations
npx prisma migrate dev

# (Optional) browse data
npx prisma studio
```

### 4) Run
```bash
# Development (watch)
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## NPM Scripts (typical)
```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "lint": "eslint .",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```
> Script names may differ slightly from your `package.json`.

---

## Project Structure

```
src/
  main.ts
  app.module.ts
  prisma/              # PrismaService (DB connection)
  auth/                # strategies (JWT), guards, controller/service
  users/               # profile, password, avatar upload
  auctions/            # auctions CRUD, bids, lists & filters
  common/              # DTOs, pipes, decorators, file utils (e.g., isFileExtensionSafe)
prisma/
  schema.prisma        # User, Auction, Bid models
files/                 # Multer upload destination (avatars, images)
```

---

## Data Model (Prisma)

**User**  
`id, first_name, last_name, email (unique), password (hash), avatar, role, createdAt`

**Auction**  
`id, title, description, image, startingBid, endTime, createdAt, userId`

**Bid**  
`id, auctionId, userId, amount, maxAmount? (nullable), createdAt`

Relationships: `User 1—N Auction`, `Auction 1—N Bid`, `User 1—N Bid`.

---

## API Overview

### Auth
- `POST /auth/register`
- `POST /auth/login` → `{ accessToken, refreshToken }`

Example:
```bash
curl -X POST http://localhost:4000/auth/login   -H "Content-Type: application/json"   -d '{"email":"john@example.com","password":"secret"}'
```

### Public
- `GET /auctions` → list **active** auctions (ordered by `endTime`)
- `GET /auctions/:id` → single auction with bids (bid includes bidder’s `{ id, first_name, last_name, avatar }`)

### Auth required
- `GET /me/auction`
- `GET /me/bidding`
- `PATCH /me/profile`
- `PATCH /me/update-password`
- `POST /upload/:id` → avatar upload

### Owner actions
- `POST /auctions`
- `PATCH /me/auction/:id` → note: **starting price locked** if any bid exists
- `DELETE /auctions/:id` → cascades `bid.deleteMany` first

### Bidding
- `POST /auctions/:id/bid` → enforces min allowed bid; rejects if auction ended

---

## File Uploads

- Endpoint: `POST /upload/:id` (field name: `avatar`)
- Storage: `FILES_DIR` (default `./files`)
- Safety: extension validation via `isFileExtensionSafe`; failed validations remove temp files

---

## Validation & Errors

- DTO validation with `class-validator` (email format, password strength/match, etc.)
- Helpful errors for invalid bids (below minimum / auction ended), duplicate email, bad credentials
- Protected routes use Nest **guards** (JWT)

---

## Environment Reference

| Key                           | Purpose                     | Example                  |
|-------------------------------|-----------------------------|--------------------------|
| `PORT`                        | API port                    | `4000`                   |
| `CORS_ORIGIN`                 | Allowed frontend origin     | `http://localhost:5173`  |
| `DATABASE_URL`                | Postgres connection string  | see above                |
| `JWT_SECRET`                  | Access token secret         | `super-secret-access`    |
| `JWT_SECRET_EXPIRES`          | Access token TTL            | `15m`                    |
| `JWT_REFRESH_SECRET`          | Refresh token secret        | `super-secret-refresh`   |
| `JWT_REFRESH_SECRET_EXPIRES`  | Refresh token TTL           | `7d`                     |
| `FILES_DIR`                   | Upload directory            | `./files`                |

---

## Notes & Tips

- Keep **min-bid** and **starting price** rules in sync with the frontend UI.
- When user profile changes (name/avatar), FE re-renders bidding history; API already returns user data on bids.
- Prefer small PRs, meaningful commits, and run a migration for each schema change.


