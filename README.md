# TypeRush

A full-stack typing speed trainer with a structured lesson curriculum, real-time multiplayer (in progress), user authentication, and progress tracking.

**Live:** https://typerush-1-2dsa.onrender.com/

---

## Features

### Typing Lessons

- 100 structured lessons progressing from home row basics to advanced punctuation and literature passages
- Lessons unlock sequentially — you must pass one to move to the next
- Each lesson has a minimum WPM and accuracy requirement to pass
- Real-time WPM, accuracy, and progress tracking while you type
- Star rating system based on performance
- Lesson results summary with WPM, accuracy, and duration stats
- **Planned:** animated on-screen keyboard that highlights the correct finger to press in sync with your typing (inspired by TypingClub)

### Authentication

- Email/password sign up with email verification (6-digit code)
- JWT-based auth with short-lived access tokens and rotating refresh tokens stored in HTTP-only cookies
- Rate limiting on auth routes
- Optional profile photo upload (base64, stored in MongoDB)
- Username setup after email verification

### Progress Tracking

- Attempt history stored per user
- Stats page showing recent attempts, best WPM, and accuracy trends
- Progress persisted across sessions and devices

### Multiplayer

- 1v1 challenge mode UI built out
- Backend WebSocket handlers scaffolded with Socket.IO (match creation and joining not yet implemented)
- Real-time progress broadcast between players is wired up

### UI / UX

- Dark mode by default, user-togglable
- Fully responsive — mobile, tablet, and desktop
- Custom Tailwind CSS theme with mint-green accent palette
- Navbar with mobile menu and profile dropdown
- Contact page with EmailJS integration

---

## Tech Stack

### Frontend

| Tool             | Purpose                          |
| ---------------- | -------------------------------- |
| React 19         | UI framework                     |
| React Router 7   | Client-side routing              |
| Tailwind CSS 4   | Styling                          |
| Vite 8           | Build tool and dev server        |
| Axios            | HTTP client (facts service)      |
| Socket.IO Client | Multiplayer real-time connection |
| EmailJS          | Contact form emails              |
| SweetAlert2      | Alert dialogs                    |

### Backend

| Tool                | Purpose                          |
| ------------------- | -------------------------------- |
| Node.js + Express 5 | HTTP server and API              |
| MongoDB + Mongoose  | Database and ODM                 |
| Socket.IO           | WebSocket server for multiplayer |
| JWT (jsonwebtoken)  | Access and refresh token auth    |
| bcryptjs            | Password and token hashing       |
| Nodemailer          | Verification email delivery      |
| Zod                 | Environment variable validation  |
| Helmet              | HTTP security headers            |
| express-rate-limit  | Auth route rate limiting         |
| Morgan              | HTTP request logging             |

### Infrastructure

| Tool                 | Purpose          |
| -------------------- | ---------------- |
| MongoDB Atlas        | Cloud database   |
| Render (Static Site) | Frontend hosting |
| Render (Web Service) | Backend hosting  |

---

## Project Structure

```
TypeRush/
├── src/                        # React frontend
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Homepage/           # Hero, CTA, Multiplayer section
│   │   ├── Lessons/            # Lesson grid, practice view, results
│   │   ├── Multiplayer/        # 1v1 challenge UI
│   │   ├── Register/           # Signup, Login, EmailVerification, ProfileSetup
│   │   └── ui/                 # Reusable inputs
│   ├── context/
│   │   └── ThemeContext.jsx     # Dark/light mode state
│   ├── data/
│   │   └── lessons.json        # 100 lesson definitions
│   ├── pages/                  # Route-level page components
│   ├── services/               # API calls, typing metrics, facts
│   └── utils/                  # Validators
│
└── backend/                    # Express API
    └── src/
        ├── controllers/        # Auth, progress, match, health
        ├── middlewares/        # Auth guard, error handler
        ├── models/             # User, Attempt, Match, PendingRegistration
        ├── routes/             # API route definitions
        ├── services/           # Mail service
        ├── sockets/            # Socket.IO handlers
        ├── utils/              # JWT tokens, async handler, lesson scoring
        └── validators/         # Zod request validators
```

---

## API Endpoints

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/verify-email`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `PATCH /api/auth/profile`

### Progress _(requires auth)_

- `GET  /api/progress`
- `POST /api/progress/attempts`
- `GET  /api/progress/attempts/recent`
- `GET  /api/progress/stats`

### Matches _(requires auth)_

- `POST /api/matches`
- `POST /api/matches/join`
- `GET  /api/matches/:code`

---

## Running Locally

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Both together

```bash
npm run dev:full
```

Backend runs on port `5001`, frontend on port `5174`.

Copy `backend/.env.example` to `backend/.env` and fill in:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL=http://localhost:5174`
- SMTP vars (optional — verification codes are logged to console if SMTP is not set)

---

## Honest Notes

The backend was vibecoded I used AI assistance heavily to scaffold the Express API, JWT auth flow, Mongoose models, and middleware. The frontend was built by hand with AI used for reference and debugging.

Multiplayer is partially implemented the UI and backend routes exist, but the Socket.IO match logic (room creation, synced race start, live opponent progress) is still a work in progress.
