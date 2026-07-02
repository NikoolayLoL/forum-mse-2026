# Forum — Help & Setup Guide

A practical guide to setting up, running, and using the Forum project
(Spring Boot API + Next.js frontend + Postgres, JWT auth, contract-first
OpenAPI). See also [DEVELOPMENT.md](DEVELOPMENT.md).

> **Terminology:** the requirements say *"Topic"*; the code calls it a **Post**
> (`/posts`, `PostEntity`). Topic = Post throughout.

---

## 1. Prerequisites

- **Docker** + **Docker Compose v2** — the only hard requirement for the dev stack.
- *(Optional, for host-side iteration)* **JDK 21**, **Node 22** (the Maven
  wrapper `./mvnw` is bundled, so no separate Maven install).

---

## 2. First-time setup

```bash
# 1. Clone your copy of the repo
gh repo clone NikoolayLoL/forum-mse-2026
cd forum-mse-2026

# 2. Ensure a .env exists (the dev stack reads it for DB creds + secrets).
#    If missing, copy the example:
cp .env.dev.example .env
```

> **⚠️ .env gotcha:** the example ships `SPRING_DATASOURCE_USERNAME=forum_app`,
> but nothing provisions that DB role, so the app can't connect on a fresh DB.
> Set it to the superuser the container actually creates:
> ```
> SPRING_DATASOURCE_USERNAME=admin
> ```
> (`POSTGRES_USER=admin`; both passwords are already `change-me-dev-db-password`.)
> Also set a real `JWT_SECRET` (≥ 32 chars) for anything beyond local play.

---

## 3. Run the project (DB + backend + frontend)

One command starts all three services with hot reload:

```bash
docker compose -f docker-compose.dev.yaml up
```

Then open **http://localhost:3001**.

| Service             | URL / Host              | Notes                                          |
|---------------------|-------------------------|------------------------------------------------|
| **Frontend** (Next) | http://localhost:3001   | `next dev` hot reload — edits reflect live     |
| **Backend / API**   | http://localhost:9000   | Spring Boot; starts after Postgres is healthy  |
| **Postgres**        | `localhost:5433` → 5432 | host port 5433 to avoid clashing with a local 5432 |

**Accounts:** a fresh database is seeded (Flyway migrations `V2`/`V4`) with a
default administrator — **username `admin`, password `admin`** (ADMIN role;
change it outside local dev). Log in as `admin` for admin-only features, or
**Sign up** to create your own regular user.

### Everyday commands

```bash
# Start the full dev stack (foreground; Ctrl-C to stop)
docker compose -f docker-compose.dev.yaml up

# Stop & remove containers + network  (⚠ wipes the DB — see below)
docker compose -f docker-compose.dev.yaml down

# Rebuild ONLY the backend after a Java / OpenAPI change (no Java hot reload)
docker compose -f docker-compose.dev.yaml up -d --build app

# Tail logs for one service
docker compose -f docker-compose.dev.yaml logs -f app
```

> **⚠️ Data loss:** the `postgres` service has **no named volume**, so
> `docker compose down` (or removing the container) **permanently wipes all
> data**. Dump first if it matters:
> `docker compose -f docker-compose.dev.yaml exec postgres pg_dump -U admin forum > dump.sql`

### Faster inner loops (optional, on the host)

```bash
# Backend (auto-restarts on recompile via spring-boot-devtools)
set -a; source .env; set +a
./mvnw spring-boot:run

# Frontend
cd frontend && NEXT_PUBLIC_API_BASE_URL=http://localhost:9000 npm run dev
```

---

## 4. Main API endpoints

Base URL: **`http://localhost:9000`**. Reads are public; creating or modifying
content requires a **JWT Bearer token**.

### How authentication works

1. **Register** or **log in** to receive a signed JWT.
2. Send it on every protected request: `Authorization: Bearer <accessToken>`.
3. The token is stateless (signed with `JWT_SECRET`, ~24 h expiry). Ownership
   rules — edit/delete your own content; moderators/admins may edit anyone's —
   are enforced server-side per request.

```bash
# Register (email optional) -> { accessToken, tokenType, expiresInSeconds }
curl -s -X POST http://localhost:9000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"ivan","password":"supersecret"}'

# Log in
TOKEN="$(curl -s -X POST http://localhost:9000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"ivan","password":"supersecret"}' | jq -r '.accessToken')"

# Create a topic with the token
curl -s -X POST http://localhost:9000/posts \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Hello","content":"My first topic"}'
```

### Topics (Posts)

| Method & path                 | Auth             | Description                                                    |
|-------------------------------|------------------|---------------------------------------------------------------|
| `GET /posts?page=0&size=15`   | public           | **Paginated**, newest first. Returns a `PostPage` (see below).|
| `GET /posts/{id}`             | public           | One topic. **Increments the view counter** on each open.      |
| `POST /posts`                 | authenticated    | Create a topic (title must be unique).                        |
| `PUT /posts/{id}`             | author/mod/admin | Update a topic.                                               |
| `DELETE /posts/{id}`          | author/mod/admin | Delete a topic.                                               |
| `POST /posts/{id}/likes`      | authenticated    | Like a topic.                                                 |
| `DELETE /posts/{id}/likes`    | authenticated    | Remove your like.                                             |

### Replies

| Method & path                                | Auth             | Description                                             |
|----------------------------------------------|------------------|---------------------------------------------------------|
| `GET /posts/{postId}/replies?page=0&size=10` | public           | **Paginated 10/page**, oldest first. Also returns `newest` (the single latest reply, for pinning at the top). |
| `POST /posts/{postId}/replies`               | authenticated    | Add a reply.                                            |
| `PUT /replies/{id}`                          | author/mod/admin | Edit a reply.                                           |
| `DELETE /replies/{id}`                       | author/mod/admin | Delete a reply.                                         |
| `POST` / `DELETE /replies/{id}/likes`        | authenticated    | Like / unlike a reply.                                  |

### Users (administration)

| Method & path         | Auth  | Description                     |
|-----------------------|-------|---------------------------------|
| `GET /users`          | admin | List users.                     |
| `POST /users`         | admin | Create a user.                  |
| `GET /users/{id}`     | admin | Get one user.                   |
| `PUT /users/{id}`     | admin | Update (role, email, password). |
| `DELETE /users/{id}`  | admin | Delete a user.                  |

### Theme customization

| Method & path                              | Auth       | Description               |
|--------------------------------------------|------------|---------------------------|
| `GET /theme-customizations/home`           | public     | Home-page background theme.|
| `PUT /theme-customizations/home`           | admin      | Update the home theme.    |
| `GET /theme-customizations/users/{userId}` | public     | A user's personal theme.  |
| `PUT /theme-customizations/users/{userId}` | self/admin | Update your own theme.    |

### Pagination shape

List endpoints return a page envelope:

```json
{
  "content": [ /* items for this page */ ],
  "page": 0,            // zero-based page index
  "size": 15,           // page size
  "totalElements": 42,  // total across all pages
  "totalPages": 3       // the UI hides its pager when this is <= 1
  // replies also include: "newest": { ...latest reply... }
}
```

---

## 5. Health, readiness & liveness (Actuator)

Production-style probe endpoints:

- `/livez` — liveness
- `/readyz` — readiness (stays up during restore/maintenance)
- `/actuator/health`, `/actuator/health/{liveness,readiness,startup}`

```bash
curl -i http://localhost:9000/livez
curl -i http://localhost:9000/readyz
```

Suggested orchestrator mapping: startupProbe → `/actuator/health/startup`,
livenessProbe → `/livez`, readinessProbe → `/readyz`.

---

## 6. Restore-maintenance API (admin)

Restore mode blocks traffic with `503` while the DB is being restored; toggle it
via API so scripts can switch it on/off:

- `POST /ops/restore/enable`
- `POST /ops/restore/disable`
- `GET  /ops/restore/status`

```bash
TOKEN="$(curl -sS -X POST 'http://localhost:9000/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}' | jq -r '.accessToken')"

curl -sS -X POST 'http://localhost:9000/ops/restore/enable' \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"reason":"database restore"}'
# ... run restore ...
curl -sS -X POST 'http://localhost:9000/ops/restore/disable' \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"reason":"restore complete"}'
```

---

## 7. Profiles & secret handling

Spring profiles: `dev`, `test`, `uat`, `prod` (files
`application-{profile}.yaml`). **No passwords are stored in any
`application*.yaml`** — secrets come only from environment variables.

Run a specific environment (same artifact, different env):

```bash
SPRING_PROFILES_ACTIVE=test ./mvnw spring-boot:run
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
```

In CI/CD, inject from your secret manager: `SPRING_DATASOURCE_URL`,
`SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`,
`JWT_EXPIRATION_MS`.

---

## 8. Contract-first workflow (OpenAPI)

The API is defined in `src/main/resources/openapi/openapi.yaml`. Editing it and
rebuilding regenerates the API interfaces + models under
`target/generated-sources/openapi`; controllers implement the generated
interfaces. **Never hand-edit generated code.** After a spec change, rebuild the
backend image: `docker compose -f docker-compose.dev.yaml up -d --build app`.

---

## 9. Troubleshooting

| Symptom                                               | Cause & fix                                                                 |
|-------------------------------------------------------|------------------------------------------------------------------------------|
| `POST /auth/login` returns `401`                      | Wrong credentials or unknown user. A seeded `admin`/`admin` exists; otherwise **register first**. |
| Browser "Failed to fetch" / CORS error               | The page must load from an allowed origin (`http://localhost:3001`). If you change the frontend port, add it to `FORUM_CORS_ALLOWED_ORIGINS` on the `app` service and recreate it. |
| `password authentication failed for user "forum_app"`| Set `SPRING_DATASOURCE_USERNAME=admin` in `.env` (see §2).                    |
| `UnknownHostException: postgres`                      | Stale containers on different networks — `docker compose ... down` then `up`.|
| `port is already allocated`                           | Another process/container owns the port; stop it or remap it in the compose file. |
| Java change not taking effect                         | The backend runs a built jar — rebuild: `... up -d --build app`.             |
| Lost my data                                          | `down` wiped the volume-less DB — restore from a `pg_dump` (see §3).         |
