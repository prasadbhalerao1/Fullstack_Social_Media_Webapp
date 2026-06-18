# Backend — RUNTIME API Server

> Node.js + Express 5 REST API with Socket.IO real-time layer, JWT authentication, Cloudinary media uploads, and MongoDB via Mongoose.

← [Back to root README](../README.md)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Authentication](#authentication)
- [Middleware](#middleware)
- [API Reference](#api-reference)
  - [User Endpoints](#user-endpoints)
  - [Post Endpoints](#post-endpoints)
  - [Reel Endpoints](#reel-endpoints)
  - [Story Endpoints](#story-endpoints)
  - [Message Endpoints](#message-endpoints)
- [Socket.IO Events](#socketio-events)
- [Error Handling](#error-handling)
- [Database](#database)

---

## Tech Stack

| Package | Version | Role |
|---------|---------|------|
| Express | ^5.2.1 | HTTP framework |
| Mongoose | ^9.6.3 | MongoDB ODM |
| Socket.IO | ^4.8.3 | Real-time events |
| jsonwebtoken | ^9.0.3 | JWT auth |
| bcryptjs | ^2.4.3 | Password hashing |
| Cloudinary | ^1.41.3 | Media CDN |
| Multer | ^2.1.1 | Multipart/form-data |
| multer-storage-cloudinary | ^4.0.0 | Cloudinary storage engine for Multer |
| cookie-parser | ^1.4.7 | Cookie parsing |
| cors | ^2.8.6 | CORS headers |
| dotenv | ^17.4.2 | Env var loading |

---

## Directory Structure

```
backend/
├── config/
│   ├── db.js                  # Mongoose connection
│   └── cloudinary.js          # Cloudinary SDK init
│
├── controllers/
│   ├── user.controller.js     # Register, login, logout, profile, follow/unfollow, block
│   ├── post.controller.js     # CRUD, like, comment, bookmark
│   ├── reel.controller.js     # CRUD, like, comment
│   ├── story.controller.js    # CRUD, like, comment, view tracking
│   └── message.controller.js  # Conversations, messages, block toggle
│
├── middleware/
│   ├── auth.middleware.js     # JWT verification — attaches req.user
│   ├── cloudinaryUpload.js    # Multer + Cloudinary storage config
│   └── error.middleware.js    # 404 notFound + global errorHandler
│
├── models/
│   ├── user.model.js          # User schema
│   ├── post.model.js          # Post schema
│   ├── reel.model.js          # Reel schema
│   ├── story.model.js         # Story schema (TTL index, 24h expiry)
│   ├── message.model.js       # Message schema (delivery status, reactions, edit/delete)
│   └── conversation.model.js  # Conversation schema (group-chat-ready)
│
├── routes/
│   ├── user.routes.js
│   ├── post.routes.js
│   ├── reel.routes.js
│   ├── story.routes.js
│   └── message.routes.js
│
├── socket/
│   └── socket.js              # Socket.IO server — all real-time event handlers
│
├── utils/
│   └── controller.helpers.js  # Shared utility functions
│
└── index.js                   # App bootstrap: Express setup, route mounting, httpServer + Socket.IO
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | `development` or `production` | `development` |
| `PORT` | Port the server listens on | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/socialmedia` |
| `JWT_SECRET` | Secret key for signing JWTs | `a_very_long_random_secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcDEFghi...` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:5173,https://myapp.vercel.app` |
| `SMTP_HOST` | Hostname of the SMTP relay | `smtp.gmail.com` |
| `SMTP_PORT` | Port of the SMTP relay | `587` |
| `SMTP_USER` | Email address/Username of the SMTP account | `your_email@gmail.com` |
| `SMTP_PASS` | Password/App Password of the SMTP account | `your_gmail_app_password` |
| `EMAIL_FROM` | The displayed sender email header | `"RUNTIME Dev Social" <your_email@gmail.com>` |

---

## Running Locally

```powershell
cd backend
npm install
npm run dev        # uses node --watch for auto-restart
```

The server starts at `http://localhost:3000`.

---

## Authentication

All protected routes require a valid JWT. The token is issued as an `httpOnly` cookie on login/register and also returned in the JSON response body.

**Cookie settings:**
- `maxAge`: 30 days
- `httpOnly`: `true` (not accessible via JS)
- `secure`: `true` in production only
- `sameSite`: `"none"` in production (required for cross-origin Vercel ↔ Render), `"lax"` in development

**`authMiddleware`** reads the token from:
1. `req.cookies.token` (primary — cookie-based)
2. `Authorization: Bearer <token>` header (fallback)

It verifies the JWT, fetches the user from MongoDB (excluding the password), and attaches the full user object to `req.user`.

---

## Middleware

### `auth.middleware.js`
Validates the JWT and populates `req.user`. Returns `401 Unauthorized` if the token is missing or invalid.

### `cloudinaryUpload.js`
Configures `multer` with `multer-storage-cloudinary` as its storage engine. Exposes a single `uploadCloudinary` Multer instance used by routes that accept file uploads (posts, reels, stories, profile images, message media).

### `error.middleware.js`
Two handlers mounted at the end of the Express middleware chain:
- **`notFound`** — Catches any request that didn't match a route and responds with `404`.
- **`errorHandler`** — Global error catcher. Returns the error message and stack trace (stack omitted in production).

---

## API Reference

All routes are prefixed with `/api/v1`.  
🔐 = requires `authMiddleware`  
📎 = accepts `multipart/form-data` file upload

---

### User Endpoints

Base path: `/api/v1/user`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | — | Register a new user. Body: `{ username, email, password }`. Returns user object + sets auth cookie. |
| `POST` | `/login` | — | Login with `{ email, password }`. Returns user object + sets auth cookie. |
| `GET` | `/logout` | — | Clears the auth cookie. |
| `GET` | `/profile` | 🔐 | Get the currently authenticated user's profile. |
| `GET` | `/suggested` | 🔐 | Returns up to 5 users not yet followed by the current user. |
| `PUT` | `/update` | 🔐 | Update `username` and/or `bio`. |
| `POST` | `/upload-profile` | 🔐 📎 | Upload a new profile image to Cloudinary. Field name: `profileImage`. |
| `POST` | `/follow` | 🔐 | Follow a user. Body: `{ targetUserId }`. |
| `POST` | `/unfollow` | 🔐 | Unfollow a user. Body: `{ targetUserId }`. |
| `GET` | `/:id/followers` | 🔐 | Get a list of followers for user `:id`. |
| `GET` | `/:id/following` | 🔐 | Get a list of users that user `:id` follows. |
| `GET` | `/all` | — | Get all users (no auth required — used for exploration). |
| `GET` | `/:id` | 🔐 | Get a user's full profile by ID, including populated posts, followers, and following lists. |

---

### Post Endpoints

Base path: `/api/v1/post`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/create` | 🔐 📎 | Create a new post. Fields: `media` (file), `caption` (text), `mediaType` (`image`\|`video`). |
| `GET` | `/all` | 🔐 | Fetch all posts (for the feed). |
| `GET` | `/:id` | 🔐 | Get a single post by ID. |
| `DELETE` | `/:id` | 🔐 | Delete a post by ID (must be the post owner). |
| `PUT` | `/:id/like` | 🔐 | Toggle like on a post. Adds the user ID to `likes` if not present; removes it if already liked. |
| `PUT` | `/:id/bookmark` | 🔐 | Toggle bookmark/save on a post. Adds to or removes from `user.savedPosts`. |
| `POST` | `/:id/comment` | 🔐 | Add a comment to a post. Body: `{ text }`. |

---

### Reel Endpoints

Base path: `/api/v1/reel`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/create` | 🔐 📎 | Create a new reel (video only). Fields: `media` (file), `caption`. |
| `GET` | `/all` | 🔐 | Fetch all reels. |
| `GET` | `/:id` | 🔐 | Get a single reel by ID. |
| `DELETE` | `/:id` | 🔐 | Delete a reel (owner only). |
| `PUT` | `/:id/like` | 🔐 | Toggle like on a reel. |
| `POST` | `/:id/comment` | 🔐 | Add a comment to a reel. Body: `{ text }`. |

---

### Story Endpoints

Base path: `/api/v1/story`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/create` | 🔐 📎 | Create a new story. Auto-expires after **24 hours** (MongoDB TTL index). Fields: `media`, `mediaType`. |
| `GET` | `/all` | 🔐 | Fetch all active (non-expired) stories, grouped by user. |
| `GET` | `/:id/view` | 🔐 | Record the current user as a viewer of story `:id`. Adds to `story.viewers` array. |
| `DELETE` | `/:id` | 🔐 | Delete a story (owner only). |
| `PUT` | `/:id/like` | 🔐 | Toggle like on a story. |
| `POST` | `/:id/comment` | 🔐 | Add a comment to a story. |

---

### Message Endpoints

Base path: `/api/v1/message`

All routes in this group require authentication (`router.use(authMiddleware)`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/conversations` | Return all conversations for the current user, sorted by most recent activity. Each conversation includes the `lastMessage` and `participants`. |
| `POST` | `/conversation/:userId` | Get an existing conversation with user `:userId`, or create one if none exists. Returns the conversation object. |
| `GET` | `/:conversationId` | Fetch messages for a conversation. Supports **cursor-based pagination** via `?cursor=<lastMessageId>` (30 per page). Returns `{ messages, hasMore, nextCursor }`. |
| `POST` | `/send` | Send a message. Accepts `multipart/form-data`. Fields: `conversationId`, `receiverId`, `text`, `tempId` (client UUID for idempotency), `media` (optional file). On success, updates `Conversation.lastMessage`. |
| `DELETE` | `/:messageId` | Delete a message for the current user (soft delete via `deletedFor` array). |
| `POST` | `/block/:userId` | Toggle block/unblock for user `:userId`. Adds to or removes from `currentUser.blocked`. |

---

## Socket.IO Events

The Socket.IO server shares the same HTTP port as Express (`initSocket(httpServer)`). Authentication is performed in the connection middleware by verifying the JWT from the cookie or `socket.handshake.auth.token`.

### Connection & Presence

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | Server ← Client | — | User connects. Adds socket to `onlineUsers` Map, clears `lastSeen` in DB, delivers pending messages. |
| `disconnect` | Server ← Client | — | Removes socket. If no sockets remain for the user, writes `lastSeen` timestamp to DB. |
| `online_users` | Server → All | `string[]` (userIds) | Broadcast after any connect/disconnect. |
| `getOnlineUsers` | Server → All | `{ [userId]: socketId }` | Same timing as `online_users`. |
| `user_last_seen` | Server → All | `{ userId, lastSeen }` | Emitted when a user goes fully offline. |

### Conversation Rooms

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join_conversation` | Client → Server | `{ conversationId }` | Joins the socket room `conv_<conversationId>`. Required for message events to be received. |
| `leave_conversation` | Client → Server | `{ conversationId }` | Leaves the conversation room. |

### Typing Indicators

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `typing_start` | Client → Server | `{ conversationId, receiverId }` | Forwarded to `receiverId`'s personal room. |
| `typing_stop` | Client → Server | `{ conversationId, receiverId }` | Forwarded to `receiverId`'s personal room. |
| `typing_indicator` | Server → Client | `{ conversationId, userId, isTyping }` | Received by the other participant. |

### Message Delivery Status

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `messages_seen` | Client → Server | `{ conversationId }` | Marks all unread messages in the conversation as `"read"` in DB. Notifies senders. |
| `receive_message` | Server → Receiver | populated message object | Emitted to the receiver's personal room when a message is sent and the receiver is online. |
| `message_sent_ack` | Server → Sender | `{ tempId, message }` | Sent back to the sender after the message is saved — used to confirm and replace the optimistic message. |
| `message_status_update` | Server → Sender | `{ conversationId, messageIds, status }` | Sent to message senders after bulk read update. |
| `message_status_bulk_update` | Server → Sender | `{ updates: [{ messageId, conversationId, status }] }` | Sent on reconnect to batch-update pending "sent" → "delivered" messages. |

### Message Actions

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `delete_message` | Client → Server | `{ messageId, deleteFor: "me" \| "everyone" }` | Only the sender can delete for everyone. Soft-deletes by populating `deletedFor`. |
| `message_deleted` | Server → Client(s) | `{ messageId, conversationId, deleteFor }` | Emitted to relevant clients after deletion. |
| `edit_message` | Client → Server | `{ messageId, text }` | Sender-only. Updates `text`, sets `isEdited: true`, `editedAt`. |
| `message_edited` | Server → Both | `{ messageId, conversationId, text, editedAt }` | Emitted to both sender and receiver after edit. |
| `react_message` | Client → Server | `{ messageId, emoji }` | Toggles reaction: same emoji removes, different emoji replaces, new emoji adds. |
| `message_reaction` | Server → Both | `{ messageId, conversationId, reactions }` | Full reactions array emitted to both participants. |
| `user_blocked` | Server → Target | `{ userId }` | Emitted to the blocked user when someone blocks them. |

---

## Error Handling

All controllers use `try/catch`. Controller errors return a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

The global `errorHandler` middleware returns:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "stack": null
}
```
(`stack` is set to `null` in production, included in development.)

HTTP status codes used:
- `200` — OK
- `201` — Created
- `400` — Bad Request (validation / already exists)
- `401` — Unauthorized
- `403` — Forbidden (e.g. delete-for-everyone by non-sender)
- `404` — Not Found
- `422` — Unprocessable Entity (missing required fields)
- `500` — Internal Server Error

---

## Database

MongoDB is accessed via Mongoose. The connection is established in `config/db.js` and called from `index.js` at startup.

See [SCHEMA.md](../SCHEMA.md) for full collection schemas, field-level documentation, indexes, and the ER diagram.
