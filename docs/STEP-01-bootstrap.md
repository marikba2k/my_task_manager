# Step 01 - Bootstrap Monorepo

## Goal

Create a monorepo with:

- /frontend (Vite React + TypeScript)
- /backend (Django + DRF)
- Root README with dev commands
- Root .env.example
- Basic CORS setup for local dev

## Constraints

- Keep everything minimal but production-structured.
- Backend must be ready for PostgreSQL later (not required in this step).
- Prefer clean, standard tooling.

## Acceptance criteria

- frontend runs: http://localhost:5173
- backend runs: http://localhost:8000
- README explains how to run both
- No secrets committed
