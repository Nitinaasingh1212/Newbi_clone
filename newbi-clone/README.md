# NEWBI.LIVE — High-Fidelity Website Recreation & Platform

A production-ready recreation of the public [newbi.live](https://www.newbi.live/) website and creator/brand platform, built with React, Vite, Tailwind CSS, Framer Motion, Node.js, Express, and MongoDB.

---

## 🌟 Overview & Features

### 1. Public Experience (newbi.live)
- **High-Impact Hero**: "We make young India show up." with custom tilted editorial sticker, dynamic animated badge pills (`Campus activations`, `Creator campaigns`, `Artist shows`, `Guestlists & passes`), and radial neon green ambient glow.
- **Section 01 — Creators & Community**: Dedicated cards with tailored deliverables, free sign-up triggers, and verified perks.
- **Services Marquee**: Continuous smooth ticker highlighting all 8 pillars of Newbi event and experiential management.
- **Section 03 — For Brands & Colleges**: Detailed breakdown of all 8 core services:
  1. Complete Event Support
  2. On-Ground Management
  3. Artist Management & Booking
  4. Campus Activations
  5. Brand Activations & Pop-ups
  6. Influencer & Creator Campaigns
  7. PR & Media Relations
  8. Digital & Social Strategy
- **Section 04 — How It Works**: Stacking 4-stage process (`01 Brief` → `02 Plan` → `03 Run` → `04 Report`).
- **Section 05 — Why Newbi**: High-contrast typography statements emphasizing real execution over agency decks.
- **Section 06 — FAQ**: Animated accordion addressing common queries from brands and colleges.
- **Section 07 — Work With Us**: Interactive multi-role enquiry form with budget selector, timeline options, and backend MongoDB storage.
- **The Archive (`/work`)**: Production portfolio showcasing festivals, concerts, and brand tours with verified attendance metrics and an interactive video/reel player modal.
- **Creator Hub (`/creator`)**: Comprehensive guide on briefs, matching algorithms, payout structure, and FAQ.
- **Services Directory (`/services`)**: In-depth scope of work, deliverables, and customized quote requests.
- **Contact Hub (`/contact`)**: Regional hubs in Mumbai, Bengaluru, and Delhi NCR with direct line routing.

### 2. Creator Dashboard (`/dashboard`)
- **Real-Time KPIs**: Open Briefs, Active Applications, Approved Gigs, and Rewards Point Balance.
- **Profile & Pass**: Verified creator stats, follower count, engagement rate, primary city, and content niche tags.
- **Briefs Discovery**: Filterable campaign marketplace by city and category with a 1-click modal application.
- **Deliverables Tracker**: Track application reviews (`Pending` → `Approved` → `Content Submitted` → `Completed`) with reel URL proof submission.
- **Points Shop**: Redeem accumulated campaign points for festival VIP wristbands, artist backstage passes, and exclusive Newbi acid-wash hoodies with celebratory canvas confetti!

### 3. Admin Command Center (`/admin`)
- **System KPIs**: Live counts of users, active campaigns, pending creator pitches, and incoming client briefs.
- **Campaign Briefs Manager**: Add, edit, and manage campaign slot caps.
- **Pitches & Applications**: Instant 1-click Approve / Reject actions for creator submissions.
- **User Management**: Role badges (`creator`, `brand`, `admin`) and point allocation controls.
- **Client Inquiries**: Review submissions from the Work With Us form and track response statuses.
- **Rewards Inventory**: Manage stock and points costs for the perk shop.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router 6, Canvas Confetti |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT (jsonwebtoken), bcryptjs, Morgan, CORS |
| **Architecture** | RESTful API, Protected JWT Route Middleware, Modular Controllers, In-Memory Auto-Seed Fallback |
| **Deployment Targets** | Vercel (Frontend), Render / Railway (Backend), MongoDB Atlas (Database) |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18+ or v20+ installed
- **npm**: v9+ or v10+ installed
- **MongoDB**: (Optional) Local MongoDB or MongoDB Atlas URI. The backend includes automatic mock fallbacks so you can test immediately even without a database running!

### 2. Install Dependencies

Install both frontend and backend dependencies:
```bash
# Frontend
cd newbi-clone/frontend
npm install

# Backend
cd ../backend
npm install
```

---

## 💻 Running Locally

### Start Backend API Server
```bash
cd newbi-clone/backend
npm run dev
# Server will start on http://localhost:5000
# Health check available at: http://localhost:5000/api/health
```

### Start Frontend Dev Server
```bash
cd newbi-clone/frontend
npm run dev
# Vite server will start on http://localhost:5173
```

---

## 🔑 Fast Demo Logins

For rapid testing, one-click demo login buttons are built directly into the `/login` screen:

| Role | Email | Password |
|---|---|---|
| **Creator** | `creator@newbi.live` | `creator123` |
| **Brand Lead** | `brand@newbi.live` | `brand123` |
| **Admin** | `admin@newbi.live` | `admin123` |

---

## ⚙️ Environment Variables

Create a `.env` file in `newbi-clone/backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/newbi_live
JWT_SECRET=newbi_super_secure_jwt_secret_token_2026
```

In `newbi-clone/frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Production Build

Test the production bundle:
```bash
cd newbi-clone/frontend
npm run build
npm run preview
```

---

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. In Vercel, set root directory to `newbi-clone/frontend`.
3. Framework Preset: **Vite**.
4. Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://api.yourdomain.com/api`).
5. Click **Deploy**.

### Backend (Render / Railway)
1. Create a new Web Service pointing to `newbi-clone/backend`.
2. Build Command: `npm install`.
3. Start Command: `node server.js`.
4. Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret key.

---

## 🛡️ License & Copyright Notice
This project is an original recreation built from scratch with custom code, original copy, and licensed assets. No proprietary internal code or credentials were copied.
