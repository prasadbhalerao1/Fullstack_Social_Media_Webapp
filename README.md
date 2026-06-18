# RUNTIME — Full-Stack Social Media Platform

> A feature-rich social media application built with the MERN stack (MongoDB, Express, React, Node.js), featuring real-time messaging, stories, reels, and live presence indicators.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [Frontend README](./frontend/README.md) | React app architecture, pages, components, state management |
| [Backend README](./backend/README.md) | Express API design, middleware, socket events, deployment |
| [SCHEMA.md](./SCHEMA.md) | MongoDB schemas, ER diagram, collection relationships |

---

## Project Structure

```
SocialMedia/
├── backend/              # Node.js + Express REST API + Socket.IO server
│   ├── config/           # DB connection, Cloudinary setup
│   ├── controllers/      # Business logic for each resource
│   ├── middleware/       # JWT auth, Cloudinary upload, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── socket/           # Socket.IO server
│   ├── utils/            # Shared helper functions
│   └── index.js          # App entry point
│
├── frontend/             # React 19 + Vite + Tailwind CSS v4
│   ├── public/           # Static assets (logo)
│   └── src/
│       ├── components/   # UI components grouped by feature
│       ├── context/      # SocketContext
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Axios instance, socket factory, utils, timeAgo
│       ├── pages/        # Route-level page components
│       └── redux/        # RTK store + slices
│
└── media/                # Local media directory (dev only)
```

---

## High-Level Architecture

```
+--------------------------------------------------+
|               CLIENT (Vercel)                    |
|                                                  |
|  React 19 + Vite + Tailwind CSS                  |
|                                                  |
|  Pages: Home, Explore, Reels, Chats, Profile     |
|  State: Redux Toolkit (5 slices)                 |
|  Real-time: socket.io-client via SocketContext   |
|                                                  |
+--------+-----------------------+-----------------+
         |                       |
         | HTTP (Axios)          | WebSocket
         | withCredentials:true  | JWT via cookie
         |                       |
+--------+-----------------------+-----------------+
|               SERVER (Node.js + Express 5)       |
|                                                  |
|  REST API: /api/v1/user  /post  /reel            |
|            /story  /message                      |
|                                                  |
|  Auth: JWT httpOnly cookie + authMiddleware      |
|  Upload: Multer + multer-storage-cloudinary      |
|                                                  |
|  Socket.IO: online presence, typing,             |
|  delivery status, edit/delete/react              |
|                                                  |
+--------+--------------------------+--------------+
         |                          |
         v                          v
  +--------------+        +------------------+
  | MongoDB Atlas|        |  Cloudinary CDN  |
  |              |        |                  |
  | users        |        | Profile images   |
  | posts        |        | Post media       |
  | reels        |        | Reel videos      |
  | stories(TTL) |        | Story media      |
  | conversations|        | Message media    |
  | messages     |        |                  |
  +--------------+        +------------------+
```

---

## Core Feature Summary

| Feature | Frontend | Backend | Real-time |
|---------|----------|---------|-----------|
| Authentication (Register / Login / Logout) | Yes | Yes | — |
| Post Feed (image + video) | Yes | Yes | — |
| Post Likes, Comments, Bookmarks | Yes | Yes | — |
| Stories (24h auto-expiry via MongoDB TTL) | Yes | Yes | — |
| Short-form Reels | Yes | Yes | — |
| Follow / Unfollow users | Yes | Yes | Yes (notification) |
| User Profiles with post grid | Yes | Yes | — |
| Direct Messaging (text + media) | Yes | Yes | Yes |
| Message delivery status (sent/delivered/read) | Yes | Yes | Yes |
| Typing indicators | Yes | — | Yes |
| Message edit and delete (for me / for everyone) | Yes | Yes | Yes |
| Emoji reactions on messages | Yes | Yes | Yes |
| Online presence and last-seen timestamps | Yes | Yes | Yes |
| Block / Unblock users | Yes | Yes | — |
| Suggested users (people not yet followed) | Yes | Yes | — |
| Explore page (all posts grid) | Yes | Yes | — |
| Cloudinary media upload (images and videos) | Yes | Yes | — |
| Cursor-based message pagination | Yes | Yes | — |
| Infinite scroll hook | Yes | — | — |

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | — | Runtime |
| Express | ^5.2.1 | HTTP framework |
| Mongoose | ^9.6.3 | MongoDB ODM |
| Socket.IO | ^4.8.3 | Real-time bidirectional events |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| Cloudinary | ^1.41.3 | Media storage and CDN |
| multer | ^2.1.1 | Multipart file upload |
| multer-storage-cloudinary | ^4.0.0 | Cloudinary storage engine for Multer |
| cookie-parser | ^1.4.7 | Cookie parsing |
| dotenv | ^17.4.2 | Environment variables |
| cors | ^2.8.6 | Cross-origin resource sharing |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.2.6 | UI library |
| Vite | ^8.0.12 | Build tool and dev server |
| Tailwind CSS | ^4.3.0 | Utility-first CSS |
| Redux Toolkit | ^2.12.0 | Global state management |
| React Router DOM | ^7.17.0 | Client-side routing |
| Axios | ^1.17.0 | HTTP client |
| Socket.IO Client | ^4.8.3 | Real-time client |
| Lucide React | ^1.17.0 | Icon library |
| react-hot-toast | ^2.6.0 | Toast notifications |
| date-fns | ^4.4.0 | Date formatting |
| @base-ui/react | ^1.5.0 | Headless UI primitives |
| Geist (variable font) | ^5.2.9 | Primary typeface |
| class-variance-authority | ^0.7.1 | Type-safe class composition |
| clsx + tailwind-merge | — | Conditional class merging via `cn()` helper |

---

## Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account

### 1. Clone and install

```powershell
git clone <repo-url>
cd SocialMedia

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

**backend/.env** (copy from `.env.example`):

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/socialmedia
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ALLOWED_ORIGINS=http://localhost:5173

# SMTP Configurations (Gmail App Passwords or Brevo SMTP Relay)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="RUNTIME Dev Social" <your_email@gmail.com>
```

**frontend/.env** (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Run

```powershell
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel (`vercel.json` included, SPA rewrite configured) |
| Backend | Render (or any Node.js host) |
| Database | MongoDB Atlas |
| Media | Cloudinary |

In production the backend sets `sameSite: "none"` and `secure: true` on the JWT cookie for cross-origin cookie auth between Vercel and Render.

