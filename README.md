# SyncSpace

> Real-time collaborative document editor built for developers

**Live Demo:** https://syncspace-sand.vercel.app  
**Demo:** aman@syncspace.com / password123

---

## Features

**Core**
- Real-time collaborative editing via Socket.io — changes sync instantly across all connected users
- Rich text editor (Tiptap/ProseMirror) with bold, italic, headings, lists, code blocks, blockquotes
- JWT authentication with access tokens (15m) and refresh tokens (7d httpOnly cookie)
- Document CRUD with autosave (3 second debounce)

**Collaboration**
- Live presence avatars — see who is in the document in real time
- Share links with configurable view or edit access
- Collaborator system — add users by email with role-based permissions
- Socket-level access control — unauthorized users cannot join document rooms

**Standout**
- Voice rooms via WebRTC/PeerJS — start a call directly inside the document with speaking detection
- AI writing assistant (Gemini API) — summarize, improve writing, fix grammar, review specs
- Version history — save snapshots, preview, and restore any previous version
- Export to Markdown or PDF

**Engineering**
- Layered backend architecture: routes → controllers → services → repositories
- CrudRepository base class extended by domain-specific repositories
- Consistent API shape via SuccessResponse/ErrorResponse
- AppError for typed error handling throughout the stack
- 24 Jest tests across auth, documents, middleware, and services
- GitHub Actions CI with PostgreSQL service container

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| ORM | Sequelize + PostgreSQL |
| Real-time | Socket.io |
| Voice | PeerJS (WebRTC) |
| AI | Google Gemini API |
| Frontend | React 18, Vite |
| Styling | TailwindCSS |
| Editor | Tiptap (ProseMirror) |
| Auth | JWT (access + refresh tokens) |
| Testing | Jest |
| CI/CD | GitHub Actions |
| Deploy | Railway (backend + DB), Vercel (frontend) |

---

## Architecture

```
client/                         # React + Vite frontend
├── src/
│   ├── components/
│   │   ├── editor/             # Tiptap, Toolbar, VoiceRoom, AISidebar, VersionHistory
│   │   ├── layout/             # Navbar
│   │   └── ui/                 # DocumentCard, PresenceAvatars, ShareModal, Toast
│   ├── context/                # AuthContext, SocketContext
│   ├── pages/                  # LandingPage, LoginPage, Dashboard, DocumentPage
│   └── services/               # api.js, documentService, aiService, versionService

server/                         # Node.js + Express backend
├── src/
│   ├── config/                 # database, server-config, socket
│   ├── controllers/            # auth, document
│   ├── middlewares/            # verifyToken, checkDocAccess, checkEditAccess
│   ├── models/                 # User, Document, Collaborator, Version, Comment
│   ├── repositories/           # CrudRepository base + domain repos
│   ├── routes/v1/              # auth-routes, document-routes
│   └── services/               # auth, document, ai, export
├── migrations/                 # Sequelize migrations for all 5 tables
└── seeders/                    # Demo users, documents, collaborators
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd server
npm install
cp .env.example .env        # fill in your values
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev                 # starts on port 5000
```

### Frontend

```bash
cd client
npm install
npm run dev                 # starts on port 5173
```

### Environment Variables (`server/.env`)

```
PORT=5000
NODE_ENV=development
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=syncspace_dev
DB_HOST=localhost
DB_PORT=5432
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GEMINI_API_KEY=your_key
CLIENT_URL=http://localhost:5173
```

### Running Tests

```bash
cd server
npm test
```

---

## API Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

GET    /api/v1/documents
GET    /api/v1/documents/accessible
POST   /api/v1/documents
GET    /api/v1/documents/:id
PATCH  /api/v1/documents/:id
DELETE /api/v1/documents/:id

POST   /api/v1/documents/:id/share
DELETE /api/v1/documents/:id/share
GET    /api/v1/documents/share/:token

GET    /api/v1/documents/:id/versions
POST   /api/v1/documents/:id/versions
POST   /api/v1/documents/:id/versions/:vId/restore

GET    /api/v1/documents/:id/export/markdown
GET    /api/v1/documents/:id/export/pdf

POST   /api/v1/ai/summarize
POST   /api/v1/ai/improve
POST   /api/v1/ai/fix-grammar
POST   /api/v1/ai/review-spec
```

---

## Socket Events

```
Client → Server
  join-document       join a document room (access verified server-side)
  leave-document      leave a document room
  document-change     broadcast content delta to room
  cursor-move         broadcast cursor position
  voice-start         start a voice room
  voice-join          join voice room with PeerJS peer ID
  voice-speaking      broadcast speaking state
  voice-leave         leave voice room
  voice-end           end voice room for all

Server → Client
  presence-update     list of users currently in the document
  document-update     content delta from another user
  cursor-update       cursor position from another user
  voice-room-started  a call has started in this document
  voice-user-joined   another user joined the call
  voice-speaking-update  speaking state update
  voice-user-left     a user left the call
  voice-room-ended    the call has ended
  access-denied       user does not have access to this document
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://syncspace-sand.vercel.app |
| Backend | Railway | https://syncspace-production-9f03.up.railway.app |
| Database | Railway PostgreSQL | — |

CI runs on every push to `main` via GitHub Actions — spins up a PostgreSQL container, runs migrations and seeds, then runs all 24 Jest tests.

---

Built by [Aman Negi](https://github.com/Negi2110)