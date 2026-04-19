# Restaurant master admin

Next.js dashboard for chain-wide revenue, bills, and inventory. POS devices push snapshots to `POST /api/ingest/v1`; this app stores data in **PostgreSQL** and serves the admin UI.

## Requirements

- Node.js 20+
- PostgreSQL 14+ (or use Docker below)

## PostgreSQL with Docker

From this directory:

```bash
docker compose up -d
```

Optional: copy [`docker-postgres.env.example`](docker-postgres.env.example) to `docker-postgres.env`, change the password, then:

```bash
docker compose --env-file docker-postgres.env up -d
```

Wait until healthy (`docker compose ps`), then set `DATABASE_URL` to match the user, password, database, and port (defaults shown):

```bash
postgresql://restaurant_admin:restaurant_admin_dev@127.0.0.1:5432/restaurant_admin
```

Stop / remove container (data volume is kept until you remove it):

```bash
docker compose down
```

Remove the database volume as well:

```bash
docker compose down -v
```

## Environment variables

Create a `.env.local` (or set on the server):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@127.0.0.1:5432/restaurant_admin` |
| `ADMIN_DASHBOARD_PASSWORD` | Single shared password for signing into the admin UI |
| `ADMIN_SESSION_SECRET` | Long random string (16+ chars) used to sign the session cookie |

## Database setup

```bash
npm install
npm run db:migrate
```

Generate new SQL after schema edits:

```bash
npm run db:generate
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, then **Settings** to create a store and copy the **store id** and **sync secret** into each POS under **Settings → Cloud sync**.

## VPS deployment checklist

1. Install PostgreSQL and create a database and user with full rights on that database.
2. Set `DATABASE_URL`, `ADMIN_DASHBOARD_PASSWORD`, and `ADMIN_SESSION_SECRET` in the process environment (not committed to git).
3. Run migrations: `npm run db:migrate` (or run against the same `DATABASE_URL` in CI).
4. Build: `npm run build` then `npm run start`, or use your process manager / Docker.
5. Put **HTTPS** in front (Caddy, nginx, Traefik). The POS should call `https://your-admin-host/api/ingest/v1` only over TLS in production.
6. Ensure firewall allows **443** to the admin app; Postgres can stay private on `127.0.0.1` if the app runs on the same host.

## POS integration

- **Ingest URL:** `{ADMIN_BASE_URL}/api/ingest/v1`
- Each store is provisioned in **Settings**; the plain secret is shown once and stored hashed in Postgres.
- The desktop POS triggers sync on a timer and via **Sync now**; configure **Admin base URL**, **Store id**, and **Sync secret** under **Settings → Cloud sync**.
