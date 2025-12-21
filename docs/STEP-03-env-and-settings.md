# Step 03 - Env-based settings + CORS

## Goal

Use environment variables for backend configuration.

## Requirements

- Load env vars from root `.env` (or backend `.env`) in dev
- Add `django-cors-headers` and allow http://localhost:5173 in dev
- Add `ALLOWED_HOSTS`, `DEBUG`, `SECRET_KEY` env support
- Keep changes minimal and documented

## Acceptance Criteria

- Backend starts successfully with env vars
- CORS works for frontend dev origin
- No secrets hardcoded
