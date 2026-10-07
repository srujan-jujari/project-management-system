# Backend

Node.js and Express REST API for the Project Management System.

## Requirements

- Node.js
- PostgreSQL

## Setup

Install dependencies from this directory:

```bash
npm install
```

Set `DATABASE_URL` in `.env` to your PostgreSQL connection string. Set `JWT_SECRET` to a private random value and optionally set `JWT_EXPIRES_IN` (defaults to `1h`). See `.env.example` for variable names and placeholders.

## Run

Start the development server with automatic restarts:

```bash
npm run dev
```

Start the server without automatic restarts:

```bash
npm start
```

The API listens on port `3000` by default. Set `PORT` in `.env` to use another port. Check `GET http://localhost:3000/api/health` for the health response.

## Prisma

The Prisma schema is configured for PostgreSQL. Validate the schema with:

```bash
npx prisma validate
```

## Authentication API

- `POST /api/auth/register` — create an account from `fullName`, `email`, and `password`.
- `POST /api/auth/login` — authenticate with `email` and `password`; returns a bearer token.
- `POST /api/auth/logout` — requires the bearer token and revokes it in the current server process; the client should also remove its stored token. The in-memory revocation list is not shared across replicas or server restarts.
- `GET /api/auth/me` — return the authenticated user's profile. Send `Authorization: Bearer <token>`.

Login and registration share a limit of 20 authentication requests per IP every 15 minutes. Example:

```powershell
curl.exe -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"fullName":"John Doe","email":"john@example.com","password":"Password123"}'
```

```powershell
curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"john@example.com","password":"Password123"}'
```

Use the returned `token` for the protected profile endpoint:

```powershell
curl.exe http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer <token>"
```
