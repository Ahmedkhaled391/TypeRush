# TypeRush Backend

This backend powers the TypeRush typing platform and includes the lesson progress system, JWT-based auth, match creation, and real-time gameplay hooks.

## Architecture

The backend has been refactored to keep request handling thin and move business logic into dedicated modules:

```bash
backend/src/
├── config/
│   └── env.js
├── controllers/
│   ├── auth.controller.js
│   ├── match.controller.js
│   ├── progress.controller.js
│   └── health.controller.js
├── modules/
│   ├── auth/
│   │   └── auth.service.js
│   ├── matches/
│   │   └── match.service.js
│   ├── progress/
│   │   └── progress.service.js
│   └── shared/
│       └── validation.js
├── models/
│   ├── User.js
│   ├── Match.js
│   ├── Attempt.js
│   └── PendingRegistration.js
├── routes/
│   ├── auth.routes.js
│   ├── match.routes.js
│   ├── progress.routes.js
│   └── health.routes.js
├── sockets/
│   └── socket.js
├── utils/
│   ├── ApiError.js
│   ├── asyncHandler.js
│   ├── lessonScoring.js
│   ├── multiplayerLevel.js
│   └── tokens.js
├── validators/
│   ├── auth.validators.js
│   ├── match.validators.js
│   └── progress.validators.js
├── app.js
├── server.js
└── db/
    └── connectMongo.js
```

## Current behavior

- No email verification step is used in the auth flow
- Registration redirects users to the profile setup step before entering the app
- Refresh tokens are stored as hashed values and set via HTTP-only cookies
- Lesson progress and attempts are persisted per user
- Match creation and join flows are handled in dedicated service modules

## Environment variables

Create a `.env` file in the backend folder:

```env
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5174
NODE_ENV=development
```

## Install

```bash
cd backend
npm install
```

## Run locally

```bash
npm run dev
```

The backend listens on:

```bash
http://localhost:5001
```

## API routes

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`

### Progress

- `GET /api/progress`
- `POST /api/progress/attempts`
- `GET /api/progress/attempts/recent`
- `GET /api/progress/stats`

### Matches

- `POST /api/matches`
- `POST /api/matches/join`
- `GET /api/matches/:code`

## Notes

The backend intentionally keeps its public API stable while improving maintainability. Controllers remain thin wrappers around services, and validation logic is centralized so future changes can be made safely without altering the client contract.
