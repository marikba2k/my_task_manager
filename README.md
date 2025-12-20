# Task Manager

Monorepo for a task management application with React frontend and Django backend.

## Quick Start

### Prerequisites

- Node.js (for frontend)
- Python 3.11+ (for backend)

### Setup

1. Copy `.env.example` to `.env` and configure as needed
2. Install and run frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Frontend runs at http://localhost:5173

3. Install and run backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py runserver
   ```
   Backend runs at http://localhost:8000

## Project Structure

- `/frontend` - Vite React + TypeScript application
- `/backend` - Django + DRF API
- `/docs` - Project documentation
