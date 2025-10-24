# 🧩 AuctionBay — Backend (NestJS + Prisma + PostgreSQL + AWS S3)

Secure backend API for the **AuctionBay** web auction platform.  
Provides user authentication, auctions & bidding logic, profile management, and image uploads to AWS S3.

> Frontend lives in a separate repo (**React + Vite + TypeScript**).  
> This repo contains the **API only**.

---

## ⚙️ Tech Stack

- **Runtime:** Node.js (18+) + TypeScript + NestJS  
- **Database:** PostgreSQL + Prisma ORM  
- **Auth:** JWT (access + refresh), Nest guards & strategies, bcrypt  
- **Validation:** `class-validator` / `class-transformer`  
- **Uploads:** Multer + AWS S3 integration (secure & scalable)  
- **Deployment:** Render (backend) + Netlify (frontend)  
- **Dev:** Prisma migrations, dotenv config, CORS for local and prod origins  

---

## ✨ Features

### 👤 Users & Auth
- Register / Login → JWT access + refresh tokens  
- Update profile (name, email, password)  
- Upload avatar → stored securely on AWS S3  

### 🧩 Auctions
- Create / edit / delete auctions (title, image, description, starting bid, end time)  
- Time-based status handling (“In progress” vs. “Done”)  
- Enforced editing rules (e.g., starting price locked after first bid)  

### 💰 Bidding
- Place bids with enforced minimum increment logic  
- Server rejects bids for ended auctions  
- Designed for “real-time-ish” UX (client re-fetch after each bid)  

### 🧾 User Lists
- **My Auctions** (created by user)  
- **Bidding** (active auctions user has bid on)  
- **Won** (ended auctions user has won)  

---

## 🧮 Business Rules

- **Minimum Bid:**  
  - No bids → must be ≥ `startingBid`  
  - Existing bids → must be > `highestBid + 1`  
- **Ended Auctions:** cannot receive new bids  
- **Starting Price:** locked after any bid  

---

## 🧰 Requirements
- Node.js 18+  
- npm / pnpm / yarn  
- PostgreSQL 13+  
- AWS S3 bucket and IAM keys  

---

## 🚀 Getting Started

### 1️⃣ Clone & install
```bash
git clone https://github.com/NikoKavas/auctionbay-backend.git
cd auctionbay-backend
npm install
```

### 2️⃣ Environment Variables
Create a `.env` file in the project root:

```ini
# --- Server ---
PORT=3000
NODE_ENV=development

# --- Database ---
DATABASE_URL="postgresql://user:password@localhost:5432/auctionbay?schema=public"

# --- JWT ---
JWT_SECRET=your-access-secret
JWT_SECRET_EXPIRES=7200
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_SECRET_EXPIRES=122400

# --- AWS S3 ---
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=auctionbay-uploads
```

> The backend automatically uploads files (avatars & auction images) to your AWS S3 bucket.  

### 3️⃣ Database & Prisma
```bash
npx prisma migrate dev
npx prisma studio   # optional
```

### 4️⃣ Run
```bash
npm run start:dev
# or production
npm run build && npm run start:prod
```

---

## 📜 NPM Scripts
```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "lint": "eslint .",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

## 🏗️ Project Structure
```
src/
  main.ts
  app.module.ts
  auth/         # JWT, guards, strategies, login/register
  users/        # profiles, password change, avatar upload
  auctions/     # CRUD, bids, filters, rules
  database/     # PrismaService
  utils/        # file utils, S3 storage
prisma/
  schema.prisma
```

---

## 💾 Data Model (Prisma)

**User**  
`id, first_name, last_name, email, password, avatar, role, createdAt`

**Auction**  
`id, title, description, image, startingBid, endTime, createdAt, userId`

**Bid**  
`id, auctionId, userId, amount, createdAt`

Relations: `User 1-N Auction`, `Auction 1-N Bid`, `User 1-N Bid`

---

## 🔗 API Overview

### Auth
- `POST /auth/register`
- `POST /auth/login` → `{ accessToken, refreshToken }`
- `POST /auth/signout`
- `GET /auth/me`
- `PATCH /auth/me/update-password`

### Auctions
- `GET /auctions`  
- `GET /auctions/:id`
- `POST /me/auction`
- `PATCH /me/auction/:id`
- `DELETE /auctions/:id`
- `POST /auctions/:id/bid`

### User Lists
- `GET /me/auction`
- `GET /me/bidding`
- `GET /me/won`

### Uploads
- `POST /users/upload/:id` → multipart form-data  
  - field: `avatar`  
  - destination: AWS S3 (`auctionbay-uploads` bucket)

---

## ☁️ File Uploads → AWS S3
- Managed via Multer S3 adapter.  
- Each upload is validated (extension & MIME type).  
- Files are stored under the configured S3 bucket.  
- Local storage (`./files`) is no longer used.  

---

## ⚙️ Environment Reference

| Key | Purpose | Example |
|-----|----------|----------|
| `PORT` | API port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | see above |
| `JWT_SECRET` | Access token secret | `abc123` |
| `JWT_SECRET_EXPIRES` | Access token TTL (s) | `7200` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `xyz456` |
| `JWT_REFRESH_SECRET_EXPIRES` | Refresh token TTL (s) | `122400` |
| `AWS_REGION` | AWS region | `eu-central-1` |
| `AWS_ACCESS_KEY_ID` | IAM access key | (your key) |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key | (your secret) |
| `AWS_S3_BUCKET` | S3 bucket name | `auctionbay-uploads` |

---

## 🧠 Notes & Best Practices

- Always include `withCredentials: true` on frontend requests for JWT cookies.  
- Keep CORS origins synced:  
  - `http://localhost:5173` (local)  
  - `https://auctionbay-frontend.netlify.app` (production)  
- Never commit your AWS keys to GitHub — store them as **Render environment variables**.  
- Use Prisma Studio to debug DB data during development.  

---

## 🌍 Deployment Overview

| Environment | Platform | URL |
|--------------|-----------|------|
| Backend | Render | [auctionbay-backend-dogi.onrender.com](https://auctionbay-backend-dogi.onrender.com) |
| Frontend | Netlify | [auctionbay-frontend.netlify.app](https://auctionbay-frontend.netlify.app) |
| Storage | AWS S3 | `auctionbay-uploads` |

---

Made with ❤️ using **NestJS**, **Prisma**, and **AWS**.
