# Frontend — RUNTIME Client

> React 19 single-page application built with Vite, Tailwind CSS v4, Redux Toolkit, React Router v7, and Socket.IO for real-time features.

← [Back to root README](../README.md)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Routing](#routing)
- [Pages](#pages)
- [Components](#components)
- [State Management (Redux)](#state-management-redux)
- [Real-time (Socket.IO)](#real-time-socketio)
- [Custom Hooks](#custom-hooks)
- [Lib Utilities](#lib-utilities)
- [Design System](#design-system)

---

## Tech Stack

| Package | Version | Role |
|---------|---------|------|
| React | ^19.2.6 | UI library |
| Vite | ^8.0.12 | Build tool and dev server |
| Tailwind CSS | ^4.3.0 | Utility-first styling |
| Redux Toolkit | ^2.12.0 | Global state management |
| React Redux | ^9.3.0 | React bindings for Redux |
| React Router DOM | ^7.17.0 | Client-side routing |
| Axios | ^1.17.0 | HTTP client |
| Socket.IO Client | ^4.8.3 | WebSocket connection to backend |
| Lucide React | ^1.17.0 | Icon library |
| react-hot-toast | ^2.6.0 | Toast notifications |
| date-fns | ^4.4.0 | Date formatting utilities |
| @base-ui/react | ^1.5.0 | Headless UI primitives |
| Geist variable font | ^5.2.9 | Primary typeface |
| class-variance-authority | ^0.7.1 | Type-safe class composition |
| clsx + tailwind-merge | — | Conditional class merging |

---

## Directory Structure

```
frontend/src/
├── App.jsx                      # Root component — router config, SocketProvider, ProtectedRoute
├── App.css                      # Global CSS (body resets, scrollbar, animations)
├── main.jsx                     # ReactDOM.createRoot — wraps in Redux <Provider>
│
├── pages/
│   ├── Home.jsx                 # Main feed
│   ├── Explore.jsx              # Discovery grid of all posts
│   ├── Reels.jsx                # Full-screen vertical reel viewer
│   ├── Profile.jsx              # User profile with post grid
│   ├── Message.jsx              # DM inbox — conversation list + chat window
│   └── Login.jsx                # Combined login and register form page
│
├── components/
│   ├── auth/
│   │   └── AuthForm.jsx         # Controlled register/login form with field validation
│   │
│   ├── layout/
│   │   └── Sidebar.jsx          # Left navigation with links, unread badge, Create button
│   │
│   ├── posts/
│   │   ├── Feed.jsx             # Renders list of PostCards
│   │   ├── PostCard.jsx         # Single post — media, like, comment, bookmark
│   │   └── PostDetailsModal.jsx # Full post detail overlay with comment thread
│   │
│   ├── stories/
│   │   ├── Stories.jsx          # Story viewer component
│   │   └── CommentsDrawer.jsx   # Slide-up comments panel for stories
│   │
│   ├── chat/
│   │   ├── ConversationList.jsx # Left panel — sortable conversation list
│   │   ├── ChatWindow.jsx       # Right panel — message list + socket listeners
│   │   ├── ChatInput.jsx        # Message composer — text, media attach, emoji
│   │   ├── MessageBubble.jsx    # Individual message with status, reactions, context menu
│   │   ├── MediaViewerModal.jsx # Full-screen viewer for message media
│   │   └── TypingIndicator.jsx  # Three-dot animated typing bubble
│   │
│   ├── common/
│   │   ├── Modal.jsx            # Generic portal-based modal
│   │   ├── Media.jsx            # Smart image/video renderer
│   │   ├── MediaIcons.jsx       # Play/image overlay badges on media thumbnails
│   │   ├── ProfileImage.jsx     # Avatar with online status ring and last-seen tooltip
│   │   ├── LikeButton.jsx       # Animated heart button
│   │   ├── SaveButton.jsx       # Bookmark button
│   │   ├── FollowButton.jsx     # Follow/unfollow with loading state
│   │   ├── CommentForm.jsx      # Comment input and submit
│   │   ├── CommentSection.jsx   # Comment list
│   │   ├── EditProfileModal.jsx # Edit username, bio, profile photo
│   │   ├── Suggestions.jsx      # "Suggested for you" sidebar panel
│   │   └── VideoModal.jsx       # Full-screen video player (used in Reels)
│   │
│   ├── media/
│   │   └── CreateMedia.jsx      # Unified upload form for posts, reels, stories
│   │
│   └── ui/
│       ├── button.jsx           # shadcn-style Button primitive
│       └── dialog.jsx           # shadcn-style Dialog primitive
│
├── context/
│   └── SocketContext.jsx        # SocketProvider + useSocket hook
│
├── hooks/
│   └── useInfiniteScroll.js     # IntersectionObserver-based infinite scroll
│
├── lib/
│   ├── axios.js                 # Pre-configured Axios instance
│   ├── socket.js                # Socket.IO client factory (connectSocket/disconnectSocket/getSocket)
│   ├── timeAgo.js               # Relative time formatter
│   └── utils.js                 # cn() helper (clsx + tailwind-merge)
│
└── redux/
    ├── store.js                 # RTK configureStore — combines all slices
    └── slices/
        ├── userSlice.js         # Auth state, profile, follow/unfollow, block, suggestions
        ├── postSlice.js         # Posts feed, like, bookmark, comment
        ├── reelsSlice.js        # Reels list, like, comment
        ├── storiesSlice.js      # Stories list, view, like, comment
        └── messageSlice.js      # Conversations, messages, pagination, optimistic sends
```

---

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env`.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for REST API calls | `http://localhost:3000/api/v1` |
| `VITE_SOCKET_URL` | URL for Socket.IO connection | `http://localhost:3000` |

---

## Running Locally

```powershell
cd frontend
npm install
npm run dev
```

Starts the Vite dev server at `http://localhost:5173`.

---

## Routing

Routes are defined in `App.jsx` using `createBrowserRouter` (React Router v7).

| Path | Component | Protected |
|------|-----------|-----------|
| `/` | `Home` | Yes |
| `/explore` | `Explore` | Yes |
| `/reels` | `Reels` | Yes |
| `/chats` | `Message` | Yes |
| `/profile/:id` | `Profile` | Yes |
| `/login` | `Login` | No |
| `/signup` | `Login` | No |
| `/register` | `Login` | No |

`ProtectedRoute` wraps all authenticated routes. It dispatches `getCurrentUser` on mount, shows a full-screen spinner while loading, and redirects to `/login` if no user is in Redux state.

---

## Pages

### `Home.jsx`
The main feed. Renders `Sidebar`, the `Stories` strip, and a `Feed` component that displays posts fetched from `/api/v1/post/all`. A `Suggestions` panel shows on the right side.

### `Explore.jsx`
Discovery page. Displays a grid of all posts. Clicking a post opens a `PostDetailsModal`. Also allows searching and browsing users.

### `Reels.jsx`
Full-screen vertical scrolling reel viewer. Each reel takes the full viewport height. Uses the `useInfiniteScroll` hook to load more reels as the user scrolls. Like, comment, and share controls are overlaid on the video.

### `Profile.jsx`
User profile page at `/profile/:id`. Fetches the full user document (posts, followers, following populated) using the `:id` param. Shows:
- Profile image, username, bio, verified badge
- Follower and following counts
- Post grid (images and videos)
- Follow/unfollow button on other users' profiles
- Edit profile button on own profile

### `Message.jsx`
Two-panel Direct Messages page:
- **Left panel** — `ConversationList`
- **Right panel** — `ChatWindow`

### `Login.jsx`
Combined authentication page that renders `AuthForm`. Toggling between login and register modes is handled inside `AuthForm`.

---

## Components

### `Sidebar.jsx`
Left sidebar on all protected pages. Collapses to icon-only on narrow viewports (`w-20`) and expands to `w-64` on `md+`. Contains:
- Logo and app name ("RUNTIME")
- Navigation: Home, Explore, Reels, Messages (with unread count badge), Profile
- Logout button (dispatches `logoutUser` thunk)
- Create button — opens `CreateMedia` modal

The unread badge is derived from `state.messages.conversations` by summing `unreadCount` across all conversations.

---

### Chat Components

#### `ChatWindow.jsx`
The message thread panel:
- Fetches messages via `fetchMessages` thunk when a conversation opens
- Joins the Socket.IO room (`join_conversation`) for real-time events
- Listens for: `new_message`, `message_status_update`, `message_status_bulk_update`, `message_deleted`, `message_edited`, `message_reaction`, `typing_indicator`
- Emits `messages_seen` when the conversation opens or the window regains focus
- Scrolls to bottom on new messages
- Renders `MessageBubble` for each message and `TypingIndicator` when the other user is typing

#### `MessageBubble.jsx`
Individual message component:
- Sent vs. received alignment
- Delivery status icons: 1 grey tick (sent), 2 grey ticks (delivered), 2 blue ticks (read)
- Inline media preview that opens `MediaViewerModal` on click
- `isEdited` label on edited messages
- Deleted-for-everyone placeholder text
- Emoji reactions bar below the bubble
- Context menu for: Edit, Delete for me, Delete for everyone, React with emoji

#### `ChatInput.jsx`
Message composer:
- Text input with Enter to send
- `typing_start` / `typing_stop` socket events with debounce
- Media attachment for images and videos
- Sends via `sendMessageThunk` with a client-generated `tempId` for optimistic UI
- Message appears immediately, then replaced with the confirmed server response

#### `ConversationList.jsx`
Left panel:
- Each row shows avatar (with online ring), username, last message preview, timestamp, unread badge
- Clicking dispatches `setActiveConversation` and calls `getOrCreateConversation`
- Sorted by `updatedAt`, re-sorted on each new message

#### `TypingIndicator.jsx`
Animated three-dot bubble shown when `typingUsers[conversationId][otherUserId]` is `true`.

#### `MediaViewerModal.jsx`
Full-screen modal for viewing image or video message attachments.

---

### Common Components

#### `Modal.jsx`
Generic portal-based modal. Props: `openModal`, `onClose`, `initialWidth`, `initialHeight`.

#### `ProfileImage.jsx`
Avatar with green online ring when `isOnline(userId)` from `useSocket()` returns true, and a last-seen tooltip using `lastSeenMap` from `SocketContext`. Falls back to a default avatar if no profile image is set.

#### `LikeButton.jsx`
Heart icon button. Dispatches the appropriate like toggle thunk. Optimistic toggle.

#### `SaveButton.jsx`
Bookmark icon button. Dispatches `toggleSavePost`. Optimistic toggle.

#### `FollowButton.jsx`
Follow/unfollow button with loading spinner while the request is in-flight.

#### `Media.jsx`
Reads `mediaType` prop (`"image"` | `"video"`) and renders either `<img>` or `<video>`.

#### `VideoModal.jsx`
Full-screen video player used in the Reels page. Overlays like, comment, and share controls on the video.

#### `CreateMedia.jsx`
Unified creation form for posts, reels, and stories. Accepts a `type` prop (`"post"` | `"reel"` | `"story"`). Handles file preview and upload, caption input, and dispatches the correct thunk.

#### `Suggestions.jsx`
Fetches suggested users from `/api/v1/user/suggested` and renders each with a `FollowButton`. Limits to 5 users not yet followed.

#### `EditProfileModal.jsx`
Modal form for editing `username`, `bio`, and profile image. Dispatches `updateUserProfile` and `uploadProfileImage` thunks.

---

### Stories Components

#### `Stories.jsx`
Story viewer. Displays story rings at the top of the feed. Clicking a ring opens the full-screen story viewer with navigation between stories.

#### `CommentsDrawer.jsx`
Slide-up comments panel used within the story viewer.

---

### UI Primitives

#### `ui/button.jsx`
shadcn-style Button component with variant and size support.

#### `ui/dialog.jsx`
shadcn-style Dialog/modal primitive.

---

## State Management (Redux)

The store is configured in `redux/store.js` and provided in `main.jsx`.

### `userSlice`

| State Key | Type | Description |
|-----------|------|-------------|
| `user` | Object or null | Currently authenticated user |
| `loading` | boolean | True while `getCurrentUser` is in-flight |
| `suggestedUsers` | Array | Result of `/user/suggested` |
| `profileUser` | Object or null | Profile being viewed at `/profile/:id` |

**Thunks:** `getCurrentUser`, `loginUser`, `registerUser`, `logoutUser`, `fetchSuggestedUsers`, `fetchProfileById`, `updateUserProfile`, `uploadProfileImage`, `followUser`, `unfollowUser`, `toggleBlockUser`

---

### `postSlice`

| State Key | Type | Description |
|-----------|------|-------------|
| `posts` | Array | All posts for the feed |
| `loading` | boolean | Feed loading state |

**Thunks:** `fetchAllPosts`, `createPost`, `deletePost`, `toggleLikePost`, `toggleSavePost`, `addCommentToPost`

---

### `reelsSlice`

| State Key | Type | Description |
|-----------|------|-------------|
| `reels` | Array | All reels |
| `loading` | boolean | Reels loading state |

**Thunks:** `fetchAllReels`, `createReel`, `deleteReel`, `toggleLikeReel`, `addCommentToReel`

---

### `storiesSlice`

| State Key | Type | Description |
|-----------|------|-------------|
| `stories` | Array | All active stories |
| `loading` | boolean | Stories loading state |

**Thunks:** `fetchAllStories`, `createStory`, `deleteStory`, `toggleLikeStory`, `addCommentToStory`, `viewStory`

---

### `messageSlice`

| State Key | Type | Description |
|-----------|------|-------------|
| `conversations` | Array | All conversations, sorted by `updatedAt` desc |
| `activeConversation` | Object or null | Currently open conversation |
| `messages` | Array | Messages for the active conversation |
| `hasMoreMessages` | boolean | False when all pages are loaded |
| `messagesLoading` | boolean | Loading state for message fetches |
| `conversationsLoading` | boolean | Loading state for conversation list |
| `typingUsers` | `{ [convId]: { [userId]: bool } }` | Per-conversation typing state |
| `error` | string or null | Last error message |

**Reducers called directly from socket event handlers in `ChatWindow`:**

| Reducer | Purpose |
|---------|---------|
| `addMessage` | Append new incoming message (deduplication built-in) |
| `addPendingMessage` | Optimistically add a message before server confirms |
| `confirmMessage` | Replace pending message (by `tempId`) with server response |
| `updateMessageStatus` | Update `status` for given message IDs |
| `bulkUpdateMessageStatus` | Batch version for reconnect delivery updates |
| `updateMessageDeleted` | Soft-delete a message in Redux state |
| `updateMessageEdited` | Update `text`, `isEdited`, `editedAt` |
| `updateMessageReactions` | Replace the full `reactions` array |
| `setTyping` | Set `typingUsers[conversationId][userId]` |
| `updateConversationLastMessage` | Update conversation list preview on new message |
| `incrementUnread` | Increment `unreadCount` for an inactive conversation |
| `clearUnread` | Reset `unreadCount` to 0 when a conversation is opened |
| `prependMessages` | Prepend older messages when paginating upward |

**Thunks:** `fetchConversations`, `fetchMessages` (cursor-based), `getOrCreateConversation`, `sendMessageThunk`

---

## Real-time (Socket.IO)

### `lib/socket.js`

Exports `connectSocket(userId)`, `disconnectSocket()`, and `getSocket()`. The socket is a module-level singleton — `connectSocket` returns the existing socket if already connected to the same user, otherwise disconnects the old socket and creates a new one.

Socket is created with:
- `withCredentials: true` — sends the JWT cookie
- `autoConnect: false` — connection is started manually via `socket.connect()`
- `reconnection: true`, `reconnectionAttempts: 5`, `reconnectionDelay: 2000`
- `query: { userId }` — used by the server's auth middleware

### `context/SocketContext.jsx`

`SocketProvider` wraps the entire app. It:
1. Calls `connectSocket(user._id)` when `state.user` is populated
2. Calls `disconnectSocket()` when the user logs out
3. Listens for `getOnlineUsers` → sets `onlineUsers` array
4. Listens for `user_last_seen` → updates `lastSeenMap`

Exposes via context: `socket`, `onlineUsers`, `lastSeenMap`, `isOnline(userId)`

Use the `useSocket()` hook to consume this anywhere in the tree.

---

## Custom Hooks

### `useInfiniteScroll.js`
Uses `IntersectionObserver` to detect when a sentinel element enters the viewport. Calls a provided callback. Used in the Reels page to trigger loading more reels.

---

## Lib Utilities

### `lib/axios.js`
Pre-configured Axios instance with `baseURL` set to `VITE_API_URL` and `withCredentials: true`.

### `lib/socket.js`
Socket.IO client singleton factory. See [Real-time](#real-time-socketio) section above.

### `lib/timeAgo.js`
Relative time formatter (e.g. "2 minutes ago").

### `lib/utils.js`
Exports a `cn()` helper that combines `clsx` and `tailwind-merge` for safe conditional class merging.

---

## Design System

- **Dark theme only** — `bg-black` base throughout
- **Font** — Geist Variable from `@fontsource-variable/geist`
- **Glassmorphism** — `backdrop-blur-xl`, `bg-white/10`, `border-white/10` on sidebar and modals
- **Shape** — `rounded-2xl` and `rounded-3xl` used consistently
- **Transitions** — `transition-all duration-300` on all interactive elements
- **Icons** — Lucide React (stroke-based, consistent weight)
- **Class utility** — `cn()` from `lib/utils.js` for all conditional class logic

---

## Deployment

`vercel.json` at the frontend root configures a catch-all SPA rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Build: `npm run build` → outputs to `dist/`.
