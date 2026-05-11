# SyncSpace

**Live Demo:** https://syncspace-sand.vercel.app  
**Demo credentials:** aman@syncspace.com / password123

Collaborative document editor for developers...

Collaborative document editor for developers. Real-time editing, AI assistance, voice rooms via WebRTC.

## Tech Stack
- **Backend**: Node.js, Express, Sequelize, PostgreSQL, Socket.io, PeerJS
- **Frontend**: React, Vite, TailwindCSS, Tiptap
- **AI**: Gemini API
- **Deploy**: Railway + Vercel

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Environment Variables (server/.env)
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
```