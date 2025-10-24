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
