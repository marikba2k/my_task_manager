# Step 02 - Scaffold + Health Endpoint

## Goal

Backend has DRF installed and a health endpoint:
GET /api/health/ -> { "status": "ok" }

## Rules

- Put endpoints under /api/
- Keep it minimal (no auth yet)
- Use Django app named `api`

## Acceptance Criteria

- GET http://localhost:8000/api/health/ returns JSON { "status": "ok" }
