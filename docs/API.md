# Project Management System API

Reference for the Express REST API implemented in `backend/src/`.

## Base URLs

| Environment | Base URL |
| --- | --- |
| Local | `http://localhost:3000/api` |
| Production | `https://project-management-api-jlmm.onrender.com/api` |

Endpoints below are shown relative to the base URL. Requests with a JSON body must use `Content-Type: application/json`.

## Authentication

Registration and login are public. All project, task, dashboard, profile, and logout endpoints require a valid JWT:

```http
Authorization: Bearer <JWT>
```

The API returns errors in the form:

```json
{
  "success": false,
  "message": "Error description"
}
```

For validation errors, the response may also include an `errors` object containing field-specific messages. The server uses HTTP `400` for validation failures, `401` for missing/invalid/expired authentication, `404` when a requested resource is not found or not owned by the user, and `500` for unexpected server errors.

## Authentication endpoints

### `POST /auth/register`

- **Authentication:** Not required.
- **Purpose:** Create an account.
- **Request body:**

  | Field | Validation |
  | --- | --- |
  | `fullName` | Required string; trimmed; 2–100 characters. |
  | `email` | Required valid email; trimmed and lowercased. |
  | `password` | Required string; at least 8 characters. |

  Unknown fields are not explicitly rejected by the registration schema.

- **Success:** `201 Created`

  ```json
  {
    "success": true,
    "message": "Registration successful",
    "user": {
      "id": 1,
      "fullName": "Example User",
      "email": "user@example.com",
      "createdAt": "2026-01-01T12:00:00.000Z"
    }
  }
  ```

- **Important errors:** `400` invalid body; `409` email already exists; `429` authentication rate limit exceeded; `500` unexpected error.

### `POST /auth/login`

- **Authentication:** Not required.
- **Purpose:** Verify credentials and issue a JWT.
- **Request body:**

  | Field | Validation |
  | --- | --- |
  | `email` | Required valid email; trimmed and lowercased. |
  | `password` | Required string; at least 8 characters. |

- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "token": "<JWT>",
    "user": {
      "id": 1,
      "fullName": "Example User",
      "email": "user@example.com"
    }
  }
  ```

- **Important errors:** `400` invalid body; `401` invalid credentials; `429` authentication rate limit exceeded; `500` unexpected error.

### `POST /auth/logout`

- **Authentication:** Required.
- **Purpose:** Revoke the presented token in the current API process. The client should also delete its locally stored token.
- **Request body:** None.
- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "message": "Logout successful. Remove the stored token from the client."
  }
  ```

- **Important errors:** `401` missing, invalid, expired, or revoked token; `500` unexpected error.

Token revocation is held in memory by the API process, so it is not shared between replicas and does not persist across server restarts.

### `GET /auth/me`

- **Authentication:** Required.
- **Purpose:** Return the current authenticated user's public profile.
- **Parameters/body:** None.
- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "fullName": "Example User",
      "email": "user@example.com",
      "createdAt": "2026-01-01T12:00:00.000Z"
    }
  }
  ```

- **Important errors:** `401` missing, invalid, expired, or revoked token; `404` authenticated user no longer exists; `500` unexpected error.

## Projects

All project routes require authentication and are scoped to the authenticated user's projects.

### `GET /projects`

- **Authentication:** Required.
- **Purpose:** List the authenticated user's projects, newest first.
- **Query parameters:**

  | Parameter | Validation and behavior |
  | --- | --- |
  | `search` | Optional; trimmed string with 1–200 characters; case-insensitive substring search on project `name`. |
  | `status` | Optional; one of `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`. |

  Filters can be combined. Unknown query parameters are rejected.

- **Request body:** None.
- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "projects": [
      {
        "id": 1,
        "userId": 1,
        "name": "Example project",
        "description": null,
        "status": "IN_PROGRESS",
        "startDate": "2026-01-01T00:00:00.000Z",
        "endDate": null,
        "createdAt": "2026-01-01T12:00:00.000Z"
      }
    ]
  }
  ```

- **Important errors:** `400` invalid query parameter; `401` missing/invalid/expired token; `500` unexpected error.

### `GET /projects/:projectId`

- **Authentication:** Required.
- **Purpose:** Get one project owned by the authenticated user.
- **Path parameter:** `projectId` must be a positive safe integer. The route calls this parameter `id` internally.
- **Request body:** None.
- **Success:** `200 OK`, `{ "success": true, "project": { ... } }` using the project fields shown above.
- **Important errors:** `400` invalid ID; `401` missing/invalid/expired token; `404` project not found or not owned by the user; `500` unexpected error.

### `POST /projects`

- **Authentication:** Required.
- **Purpose:** Create a project for the authenticated user.
- **Path/query parameters:** None.
- **Request body:** Strict JSON object; unknown fields are rejected.

  | Field | Validation |
  | --- | --- |
  | `name` | Required string; trimmed; 1–200 characters. |
  | `description` | Optional string up to 5,000 characters, or `null`. |
  | `status` | Optional; `NOT_STARTED`, `IN_PROGRESS`, or `COMPLETED`. Defaults to `NOT_STARTED`. |
  | `startDate` | Optional valid `YYYY-MM-DD` calendar date, or `null`. |
  | `endDate` | Optional valid `YYYY-MM-DD` calendar date, or `null`. |

- **Success:** `201 Created`, `{ "success": true, "project": { ... } }`.
- **Important errors:** `400` invalid body; `401` missing/invalid/expired token; `500` unexpected error.

### `PUT /projects/:projectId`

- **Authentication:** Required.
- **Purpose:** Update a project owned by the authenticated user.
- **Path parameter:** `projectId` must be a positive safe integer; called `id` internally.
- **Request body:** Strict JSON object containing at least one of `name`, `description`, `status`, `startDate`, or `endDate`. Each supplied field follows the same validation as project creation; fields not supplied remain unchanged. Unknown fields are rejected.
- **Success:** `200 OK`, `{ "success": true, "project": { ... } }`.
- **Important errors:** `400` invalid ID/body or empty update; `401` missing/invalid/expired token; `404` project not found or not owned by the user; `500` unexpected error.

### `DELETE /projects/:projectId`

- **Authentication:** Required.
- **Purpose:** Delete a project owned by the authenticated user. Its tasks are deleted by the database cascade.
- **Path parameter:** `projectId` must be a positive safe integer; called `id` internally.
- **Request body:** None.
- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "message": "Project deleted successfully"
  }
  ```

- **Important errors:** `400` invalid ID; `401` missing/invalid/expired token; `404` project not found or not owned by the user; `500` unexpected error.

## Tasks

All task routes require authentication. A task is accessible only if its associated project belongs to the authenticated user.

### Task fields and validation

Task creation accepts `name`, `description`, `priority`, `status`, and `dueDate`. The flat creation endpoint also requires `projectId`.

| Field | Validation |
| --- | --- |
| `projectId` | Flat `POST /tasks` only; JSON number that is a positive safe integer. The project must belong to the authenticated user. |
| `name` | Required on create; string trimmed to 1–200 characters. |
| `description` | Optional string up to 5,000 characters, or `null`. |
| `priority` | Optional on create (defaults to `MEDIUM`); otherwise `LOW`, `MEDIUM`, or `HIGH`. |
| `status` | Optional on create (defaults to `PENDING`); otherwise `PENDING`, `IN_PROGRESS`, or `COMPLETED`. |
| `dueDate` | Optional date-only `YYYY-MM-DD` value or ISO datetime with timezone offset; may be `null`. Date-only values must be valid calendar dates. |

Task create and update bodies are strict; unknown fields are rejected. Updates may include any subset of `name`, `description`, `priority`, `status`, and `dueDate`, but at least one field must be supplied.

### `GET /tasks`

- **Authentication:** Required.
- **Purpose:** List all tasks belonging to projects owned by the authenticated user, newest first.
- **Parameters/body:** None.
- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "tasks": [
      {
        "id": 1,
        "projectId": 1,
        "name": "Example task",
        "description": null,
        "priority": "MEDIUM",
        "status": "PENDING",
        "dueDate": null,
        "createdAt": "2026-01-01T12:00:00.000Z"
      }
    ]
  }
  ```

- **Important errors:** `401` missing/invalid/expired token; `500` unexpected error.

### `GET /tasks/:taskId`

- **Authentication:** Required.
- **Purpose:** Get one task if its project belongs to the authenticated user.
- **Path parameter:** `taskId` must be a positive safe integer; called `id` internally.
- **Request body:** None.
- **Success:** `200 OK`, `{ "success": true, "task": { ... } }` using the task fields shown above.
- **Important errors:** `400` invalid ID; `401` missing/invalid/expired token; `404` task not found or not owned by the user; `500` unexpected error.

### `POST /tasks`

- **Authentication:** Required.
- **Purpose:** Create a task for a project owned by the authenticated user.
- **Path/query parameters:** None.
- **Request body:** Strict JSON object containing required `projectId` and `name`, and optional `description`, `priority`, `status`, and `dueDate`, following the task field validation above.

  ```json
  {
    "projectId": 1,
    "name": "Example task",
    "description": "Task details",
    "priority": "HIGH",
    "status": "PENDING",
    "dueDate": "2026-12-31"
  }
  ```

- **Success:** `201 Created`, `{ "success": true, "task": { ... } }`.
- **Important errors:** `400` invalid/missing body field; `401` missing/invalid/expired token; `404` project not found or not owned by the user; `500` unexpected error.

### `PUT /tasks/:taskId`

- **Authentication:** Required.
- **Purpose:** Update a task if its project belongs to the authenticated user.
- **Path parameter:** `taskId` must be a positive safe integer; called `id` internally.
- **Request body:** Strict, non-empty partial task object. Allowed fields and validation are described in [Task fields and validation](#task-fields-and-validation). `projectId` cannot be changed through this endpoint.
- **Success:** `200 OK`, `{ "success": true, "task": { ... } }`.
- **Important errors:** `400` invalid ID/body or empty update; `401` missing/invalid/expired token; `404` task not found or not owned by the user; `500` unexpected error.

### `DELETE /tasks/:taskId`

- **Authentication:** Required.
- **Purpose:** Delete a task if its project belongs to the authenticated user.
- **Path parameter:** `taskId` must be a positive safe integer; called `id` internally.
- **Request body:** None.
- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

- **Important errors:** `400` invalid ID; `401` missing/invalid/expired token; `404` task not found or not owned by the user; `500` unexpected error.

### `GET /projects/:projectId/tasks`

- **Authentication:** Required.
- **Purpose:** List tasks for a project owned by the authenticated user, newest first.
- **Path parameter:** `projectId` must be a positive safe integer.
- **Query parameters:**

  | Parameter | Validation and behavior |
  | --- | --- |
  | `search` | Optional; trimmed string with 1–200 characters; case-insensitive substring search on task `name`. |
  | `status` | Optional; `PENDING`, `IN_PROGRESS`, or `COMPLETED`. |
  | `priority` | Optional; `LOW`, `MEDIUM`, or `HIGH`. |

  Filters can be combined. Unknown query parameters are rejected. The project is checked for ownership before tasks are returned.

- **Request body:** None.
- **Success:** `200 OK`, `{ "success": true, "tasks": [ ... ] }`.
- **Important errors:** `400` invalid project ID or query; `401` missing/invalid/expired token; `404` project not found or not owned by the user; `500` unexpected error.

### `POST /projects/:projectId/tasks`

- **Authentication:** Required.
- **Purpose:** Create a task under a project owned by the authenticated user.
- **Path parameter:** `projectId` must be a positive safe integer.
- **Request body:** Strict task object with required `name`, and optional `description`, `priority`, `status`, and `dueDate`. The project ID comes from the path; do not include it in the body. See [Task fields and validation](#task-fields-and-validation).
- **Success:** `201 Created`, `{ "success": true, "task": { ... } }`.
- **Important errors:** `400` invalid project ID or task body; `401` missing/invalid/expired token; `404` project not found or not owned by the user; `500` unexpected error.

## Dashboard

### `GET /dashboard`

- **Authentication:** Required.
- **Purpose:** Return counts for projects and tasks belonging to the authenticated user.
- **Parameters/body:** None.
- **Success:** `200 OK`

  ```json
  {
    "success": true,
    "totalProjects": 3,
    "totalTasks": 12,
    "completedTasks": 5,
    "pendingTasks": 4,
    "projectsInProgress": 2
  }
  ```

- **Important errors:** `401` missing/invalid/expired token; `500` unexpected error.

## Additional endpoint

### `GET /health`

- **Authentication:** Not required.
- **Purpose:** Confirm that the API process is responding.
- **Parameters/body:** None.
- **Success:** `200 OK`, `{ "success": true, "message": "API is running" }`.

## cURL examples

Examples use the production base URL by default. Set a different `API_BASE` value to use the local API. They use placeholder credentials and tokens only; provide your own values when running commands.

```sh
API_BASE="https://project-management-api-jlmm.onrender.com/api"
```

### Register and login

```sh
curl -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Example User","email":"user@example.com","password":"<YOUR_PASSWORD>"}'
```

```sh
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"<YOUR_PASSWORD>"}'
```

Copy the returned token into an environment variable for subsequent examples:

```sh
TOKEN="<JWT_FROM_LOGIN_RESPONSE>"
```

### List filtered projects

```sh
curl "$API_BASE/projects?search=website&status=IN_PROGRESS" \
  -H "Authorization: Bearer $TOKEN"
```

### Create a project

```sh
curl -X POST "$API_BASE/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Example project","description":"Project description","status":"NOT_STARTED","startDate":"2026-12-01","endDate":null}'
```

### Create a task

`projectId` must be an integer ID for a project owned by the authenticated account.

```sh
curl -X POST "$API_BASE/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId":1,"name":"Example task","description":"Task details","priority":"HIGH","status":"PENDING","dueDate":"2026-12-31"}'
```

### Search and filter project tasks

```sh
curl "$API_BASE/projects/1/tasks?search=review&status=IN_PROGRESS&priority=HIGH" \
  -H "Authorization: Bearer $TOKEN"
```

### Get dashboard statistics

```sh
curl "$API_BASE/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

### Logout

```sh
curl -X POST "$API_BASE/auth/logout" \
  -H "Authorization: Bearer $TOKEN"
```
