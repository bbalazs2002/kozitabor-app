# Coolify Deployment

Use `docker-compose.coolify.yml` as the Compose file. Coolify clones the repo, builds the images in-place, and its built-in Traefik reverse proxy handles SSL and public routing.

## Prerequisites

Create a **PostgreSQL** database resource in Coolify and copy the internal connection string — you will need it as `DATABASE_URL` below.

## Setup Steps

1. Create a **Docker Compose** resource in Coolify pointing to this repository.
2. Set the **Compose file path** to `docker-compose.coolify.yml`.
3. Add the following **Environment Variables** in the Coolify UI:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Internal connection string from the Coolify PostgreSQL resource |
| `JWT_SECRET` | Random alphanumeric string, min. 64 characters |
| `JWT_EXPIRES_IN` | e.g. `1h` |
| `API_PORT` | e.g. `5000` |
| `CLIENT_URL` | Your public frontend URL, e.g. `https://yourdomain.com` |
| `CLIENT_PORT` | e.g. `80` |
| `VITE_API_BASE_URL` | Your public domain, e.g. `https://yourdomain.com` |

4. Mark `VITE_API_BASE_URL` as a **Build Variable** in Coolify so it is passed as a Docker `--build-arg` and baked into the React bundle at build time.
5. Configure the **domain** in Coolify and enable HTTPS — Traefik terminates SSL and routes traffic to port `80` of the `kozitabor-react` service.

## Notes

- `DB_USER`, `DB_PASS`, and `DB_NAME` from `.env.sample` are **not used** in this flow. The Coolify-managed PostgreSQL connection string replaces them via `DATABASE_URL`.
- `VITE_API_BASE_URL` is baked into the JS bundle at build time, so it **must** be set before the first deploy and requires a rebuild to change.
- Uploads and logs are persisted in Docker volumes (`kozitabor_uploads`, `kozitabor_logs`) managed by Coolify.
