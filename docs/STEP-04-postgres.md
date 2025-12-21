# Step 04 - PostgreSQL via Docker

## Goal

Run PostgreSQL locally via Docker for Django backend.

## Requirements

- Use docker-compose
- Postgres 15+
- Credentials loaded from .env
- Expose port 5432 for local dev
- Persist data using a named volume

## Acceptance Criteria

- docker compose up starts Postgres
- Django can connect using env vars

## Django Integration

- Configure DATABASES using env vars
- Use psycopg2 or psycopg (whichever is standard)
- SQLite should not be used in dev anymore
