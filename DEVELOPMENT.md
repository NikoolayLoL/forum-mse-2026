# Development

## Start the dev stack (hot reload)

```bash
docker compose -f docker-compose.dev.yaml up
```

This is the day-to-day command. It starts Postgres (5432), the app (9000), and
the frontend (3000) with **`next dev` Fast Refresh** over a bind-mount — saving
a file in `frontend/` reflects in the browser with **no rebuild**.

Then open **http://localhost:3000**.

> Production `docker compose up --build` runs a `next build`, so it needs a
> rebuild on every change. Use the dev stack above instead while developing.

## Faster inner loops

- **Frontend on the host:** `cd frontend && npm run dev`
  (set `NEXT_PUBLIC_API_BASE_URL=http://localhost:9000`).
- **Java on the host:** `./mvnw spring-boot:run`. `spring-boot-devtools` is on
  the classpath (dev-only, excluded from the packaged jar), so it auto-restarts
  on recompile. Rebuilding the `app` image is only needed for
  dependency/Dockerfile changes.

## Gotchas

- **CORS / page origin.** The browser must load the frontend from an origin
  listed in `FORUM_CORS_ALLOWED_ORIGINS` (app env), or every API call fails with
  a browser "NetworkError" (a blocked CORS preflight). The dev stack allows
  `http://localhost:3000` **and** `http://forum:3000`. Prefer
  **http://localhost:3000**. If you change the list, recreate the app container:
  `docker compose -f docker-compose.dev.yaml up -d app`.
- **Register before login.** A fresh database has no users — `POST /auth/login`
  returns `401` for an unknown account. Use the Sign up page first.
- **Service is named `postgres`, not `db`.** Address it as `postgres`
  (`... logs postgres`). It has no named volume, so removing the container wipes
  all data.
- **Shared project name.** Both `docker-compose.yaml` and
  `docker-compose.dev.yaml` use the directory's project name, so they reuse the
  same containers. For a clean dev environment: `docker compose down` first,
  then bring up the dev stack.

## Ports

| Service  | URL                     |
|----------|-------------------------|
| frontend | http://localhost:3000   |
| app/API  | http://localhost:9000   |
| postgres | localhost:5432          |
| adminer  | http://localhost:8090 (base compose only, not started by default) |
