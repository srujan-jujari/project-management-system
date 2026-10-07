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

Set `DATABASE_URL` in `.env` to your PostgreSQL connection string. The checked-in `.env` contains a local development example; update its credentials and database name to match your PostgreSQL setup.

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

The Prisma schema is configured for PostgreSQL and currently defines no database models. Validate the schema with:

```bash
npx prisma validate
```
