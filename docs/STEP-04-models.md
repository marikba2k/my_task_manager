# Step 04 - Core Domain Models

## Models

### Project

- owner (FK → User)
- name (string, required)
- description (text, optional)
- created_at

### Task

- project (FK → Project)
- title (string, required)
- description (text, optional)
- status (todo | doing | done)
- priority (low | medium | high)
- due_date (date, optional)
- created_at
- updated_at

## Rules

- A user can only own their own projects
- Tasks belong to a project
- Use Django best practices

## Acceptance Criteria

- makemigrations succeeds
- migrate succeeds
- Models visible in Django admin
