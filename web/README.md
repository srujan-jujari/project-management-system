# Pivotal web app

React and Vite frontend for the Project Management System.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

The frontend defaults to `http://localhost:3000/api`. To use a different API,
set `VITE_API_URL` to the complete API base URL (including `/api`) in your
frontend environment. Start the backend separately before signing in or
registering.

## Routes

- `/login` — sign in with an existing account.
- `/register` — create an account.
- `/dashboard` — authenticated dashboard placeholder.

The access token is stored in browser local storage and sent as a bearer token
for authenticated API requests. Signing out clears the local token; server-side
JWT revocation is not implemented.

## Checks

```bash
npm run lint
npm run build
```
