# TypeRush Backend

Express + MongoDB backend for TypeRush.

## 1) Install

```bash
cd backend
npm install
```

## 2) Configure environment

`.env` is already created for local dev. Update:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Optional for real emails:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

If SMTP is empty, verification email is logged to server console.

## 3) Start MongoDB

You got this error because Mongo is not running:
`ECONNREFUSED 127.0.0.1:27017`

Pick one option:

### Option A: Local MongoDB service

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Option B: Docker

```bash
docker run -d --name typerush-mongo -p 27017:27017 mongo:7
```

### Option C: MongoDB Atlas

Use Atlas connection string in `MONGODB_URI`.

## 4) Run backend

```bash
npm run dev
```

## Base URL

`http://localhost:5000/api`

## Implemented endpoints

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/verify-email`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me` (Bearer token required)

### Progress (Bearer token required)

- `GET /api/progress`
- `POST /api/progress/attempts`
- `GET /api/progress/attempts/recent`
- `GET /api/progress/stats`

### Matches (Bearer token required)

- `POST /api/matches`
- `POST /api/matches/join`
- `GET /api/matches/:code`

