# Project Management System

A full-stack project and task management application built for the Full Stack Developer Technical Assessment. The system includes a React web client, an Android application built with React Native and Expo, and a REST API backed by PostgreSQL. Both clients use the same API and database.

## Key features

- JWT-based authentication with account registration, login, and logout.
- Project create, read, update, and delete operations.
- Task create, read, update, and delete operations within projects.
- User-scoped dashboard statistics for projects and tasks.
- Case-insensitive project/task search and project status, task status, and priority filters.
- Task priorities: `LOW`, `MEDIUM`, `HIGH`.
- Project statuses: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.
- Task statuses: `PENDING`, `IN_PROGRESS`, `COMPLETED`.
- Responsive React web application and an Android app built with React Native and Expo.
- Web and mobile share the deployed backend and PostgreSQL database, so changes made in either client are available to the other after refresh.
- Mobile JWT storage uses Expo SecureStore.

## Technology stack

| Area | Technologies |
| --- | --- |
| Backend | Node.js, Express 5, Prisma ORM, PostgreSQL, Zod |
| Web | React, Vite, React Router |
| Mobile | React Native, Expo SDK 57, React Navigation, Expo SecureStore |
| Local database | PostgreSQL 16 using Docker Compose |
| Production hosting | Render for the web application and backend API; Expo EAS for Android builds |

## Architecture

The web and mobile clients call the same authenticated Express API. The API uses Prisma to read and write the shared PostgreSQL database.

```text
Web (React + Vite) ──────┐
                         ├──> Express REST API ───> PostgreSQL
Mobile (React Native) ───┘
```

The web client defaults to a local API URL and can be configured with `VITE_API_URL`. The mobile client is currently configured to use the deployed API URL in `mobile/src/api/client.js`.

## Repository structure

```text
.
├── backend/              Express API, Prisma schema, migrations, and environment example
├── web/                  React + Vite web application
├── mobile/               Expo React Native Android application
├── docs/                 Supplementary project documentation
├── docker-compose.yml    Local PostgreSQL service
└── README.md
```

## Prerequisites

- Node.js and npm versions supported by the packages in this repository.
- Docker Desktop (or Docker Engine with the Docker Compose plugin) for local PostgreSQL.
- An Android device/emulator or Expo Go for running the mobile app locally. Use the provided APK for a direct Android installation.

## Local PostgreSQL

From the repository root, start the database:

```bash
docker compose up -d postgres
```

The Compose service is PostgreSQL 16, published on host port `5433`, and persists data in a named Docker volume. The database name and local connection settings are defined in `docker-compose.yml`.

The backend `.env.example` uses a PostgreSQL URL with host port `5432`. For the supplied Compose setup, create `backend/.env` from that example and set `DATABASE_URL` to the local database using host `localhost` and port `5433`:

```text
postgresql://<local-user>:<local-password>@localhost:5433/project_management?schema=public
```

Replace the placeholders with the local values configured for your PostgreSQL service. Do not use local development credentials in production or commit `.env` files.

Stop the local database when finished:

```bash
docker compose down
```

## Backend setup

Install dependencies and configure the environment:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then set values for your environment. The backend supports these variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000`. |
| `DATABASE_URL` | PostgreSQL connection URL used by Prisma. |
| `JWT_SECRET` | Private signing secret; the API requires at least 32 bytes. Keep it secret and rotate it appropriately. |
| `JWT_EXPIRES_IN` | JWT lifetime using seconds, minutes, hours, or days; defaults to `1h` and is limited to 24 hours. |
| `CORS_ORIGINS` | Comma-separated list of allowed browser origins. Set this to the web application origin(s) in production. |

Apply the checked-in database migrations and start the API:

```bash
npx prisma migrate deploy
npm run dev
```

The API listens on `http://localhost:3000` by default. `GET http://localhost:3000/api/health` can be used to check that it is running.

For a production deployment, provide the production PostgreSQL URL and a strong private JWT secret through the hosting provider's environment configuration. Configure the web origin in `CORS_ORIGINS`, and run `npx prisma migrate deploy` as part of the deployment/release process.

## Web setup

Install and run the web application:

```bash
cd web
npm install
npm run dev
```

By default, the web client calls `http://localhost:3000/api`. To use another API, set `VITE_API_URL` to the full API base URL, including `/api`, before starting or building the web client. For local development, create `web/.env` based on `web/.env.example`. For the deployed backend, the value is:

```text
VITE_API_URL=https://project-management-api-jlmm.onrender.com/api
```

Available web checks:

```bash
npm run lint
npm run build
```

## Mobile setup

The Android client is in `mobile/`. It uses Expo SDK 57, React Navigation, and Expo SecureStore. Its API base URL is currently set in `mobile/src/api/client.js` to the deployed backend:

```text
https://project-management-api-jlmm.onrender.com/api
```

To run it locally against the shared production service:

```bash
cd mobile
npm install
npm start
```

Scan the Expo QR code using a compatible Expo Go app, or start on an Android emulator with:

```bash
npm run android
```

The mobile app stores the JWT in SecureStore, sends it as a bearer token, and clears it if the authenticated session expires. To point the app at a different API, update `API_BASE_URL` in `mobile/src/api/client.js` to the full API base URL, including `/api`.

### Android APK

An Expo EAS Android APK was generated for this assessment. The build page contains the APK and installation information:

[View or download the Android build](https://expo.dev/accounts/srujan.jujari/projects/mobile/builds/c20949ac-f44a-4187-9a94-7a82a2eb186a)

## Production URLs

- **Web application:** [https://project-management-web-ab6p.onrender.com](https://project-management-web-ab6p.onrender.com)
- **Backend API:** [https://project-management-api-jlmm.onrender.com](https://project-management-api-jlmm.onrender.com)
- **API health check:** [https://project-management-api-jlmm.onrender.com/api/health](https://project-management-api-jlmm.onrender.com/api/health)

API endpoints are served under the `/api` prefix. The web and mobile clients use the same production backend and data store.

## API endpoint summary

All project, task, and dashboard endpoints require a valid bearer JWT. Registration and login are public.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account with `fullName`, `email`, and `password`. |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT. |
| `POST` | `/api/auth/logout` | Revoke the current token in the running API process. |
| `GET` | `/api/auth/me` | Return the authenticated user's profile. |

### Projects

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/projects` | Create a project. |
| `GET` | `/api/projects` | List the authenticated user's projects. Optional `search` and `status` query parameters can be combined. |
| `GET` | `/api/projects/:id` | Get a project owned by the authenticated user. |
| `PUT` | `/api/projects/:id` | Update a project owned by the authenticated user. |
| `DELETE` | `/api/projects/:id` | Delete a project owned by the authenticated user. |

Supported project `status` values are `NOT_STARTED`, `IN_PROGRESS`, and `COMPLETED`. Search is case-insensitive by project name.

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/tasks` | Create a task; the JSON body must include an owned `projectId`. |
| `GET` | `/api/tasks` | List tasks belonging to the authenticated user's projects. |
| `GET` | `/api/tasks/:id` | Get a task if its project belongs to the authenticated user. |
| `PUT` | `/api/tasks/:id` | Update a task if its project belongs to the authenticated user. |
| `DELETE` | `/api/tasks/:id` | Delete a task if its project belongs to the authenticated user. |
| `POST` | `/api/projects/:projectId/tasks` | Create a task through the nested project route. |
| `GET` | `/api/projects/:projectId/tasks` | List tasks for an owned project. Optional `search`, `status`, and `priority` filters can be combined. |

Task `status` values are `PENDING`, `IN_PROGRESS`, and `COMPLETED`; task `priority` values are `LOW`, `MEDIUM`, and `HIGH`. Task search is case-insensitive by task name.

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/dashboard` | Return `totalProjects`, `totalTasks`, `completedTasks`, `pendingTasks`, and `projectsInProgress` for the authenticated user. |

## Security measures

- Protected API routes require a signed JWT sent in the `Authorization: Bearer <token>` header.
- The API verifies JWTs using HS256, validates user identity and expiry, and requires a configured signing secret of at least 32 bytes.
- Passwords are hashed using bcrypt before storage; authentication inputs and project/task inputs are validated with Zod.
- Project and task queries enforce ownership through the authenticated user and the task-to-project relationship.
- Helmet sets common HTTP security headers; CORS uses an explicit origin allowlist.
- Login and registration share an IP-based rate limit of 20 requests per 15 minutes.
- The mobile app stores JWTs in Expo SecureStore. The web client stores its token in browser local storage.
- Logout revocation is held in memory by the API process; it is not shared between service replicas and does not survive a server restart. Clients also remove their local token on logout.
- Secrets and production database connection values must be supplied through environment configuration and must not be committed to the repository.

## Database schema summary

The Prisma schema defines three models:

- **User** — unique email, full name, password hash, and creation timestamp.
- **Project** — belongs to a user; includes name, optional description, project status, optional start/end dates, and creation timestamp.
- **Task** — belongs to a project; includes name, optional description, priority, task status, optional due date, and creation timestamp.

Deleting a user cascades to their projects, and deleting a project cascades to its tasks. The project owner and task project foreign keys are indexed. Project status, task status, and task priority are PostgreSQL enums generated from the Prisma schema.

## Testing and verification

- During assessment verification, the web and Android mobile clients were used with the same production account and shared backend/database. Changes made in one client appeared in the other after refreshing.
- Web checks available in the repository: `npm run lint` and `npm run build` from `web/`.
- Mobile check available in the repository: `npm run lint` from `mobile/`.
- The backend package currently has no `test` or `lint` script. Its Prisma schema can be checked with `npx prisma validate` from `backend/`.

## Deployment

- The web application and backend API are deployed at the production URLs listed above.
- The backend requires a production `DATABASE_URL`, a private `JWT_SECRET`, and an appropriate `CORS_ORIGINS` allowlist. Apply Prisma migrations during deployment.
- Set the web build-time variable `VITE_API_URL` to the deployed API base URL with `/api` included.
- The Android client is distributed through the EAS build page linked above. EAS build profiles are defined in `mobile/eas.json`.
- No deployment credentials are included in this repository. Configure secrets and service-specific settings in the relevant hosting dashboards.

For a new Render deployment using the current project layout, use `backend/` as the API service root with `npm install` as its build command and `npm start` as its start command. Provide the backend environment variables in the service configuration and run `npx prisma migrate deploy` as a pre-deploy/release command. Use `web/` as a static-site root with `npm install && npm run build` as its build command and `dist` as its publish directory; set `VITE_API_URL` in the static site's build environment.

## Submission and demo notes

For a straightforward demo:

1. Open the production web URL or install the Android APK from its EAS build page.
2. Register or sign in using the assessment account.
3. Create or update a project and tasks, and demonstrate dashboard statistics and search/filter controls.
4. Refresh the other client to show that both are using the same account data.

The API may need a short time to respond if its hosting service has been idle. Avoid including account passwords, API secrets, or database credentials in screenshots, recordings, or submitted documentation.