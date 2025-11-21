# Phantom FX Marketing Tool

A full-stack application for managing client codes and projects.

## Architecture

- **Backend**: FastAPI (Python) + SQLAlchemy + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Prerequisites

- **Python 3.9+**
- **Node.js 16+**
- **PostgreSQL 18** running on localhost:5432

## Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running. Create a database named `team_portal`.
If you need to change the password, update the `DATABASE_URL` in `backend/app/database.py` or set the `DATABASE_URL` environment variable.

Default connection: `postgresql+psycopg2://postgres:MY_PASSWORD@localhost:5432/team_portal`

### 2. Backend Setup

Open a terminal in the `backend` directory:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the application (this will also create tables):

```bash
uvicorn app.main:app --reload
```

Seed initial users (in a new terminal, same directory):

```bash
python -m app.seed_users
```

### 3. Frontend Setup

Open a new terminal in the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### 4. Usage

1. Open your browser to `http://localhost:5173`.
2. Login with one of the seeded users:
   - **Marketing**: `marketing_user` / `password123`
   - **Team 2**: `team2_user` / `password123`
   - **Team 3**: `team3_user` / `password123`
3. As a marketing user, you can:
   - Create new projects with realtime client code preview.
   - View the list of projects.
   - Edit projects.
   - Export data to Excel.

## Features

- **Role-based Auth**: JWT authentication with role protection.
- **Client Code Generation**: Unique code generation logic based on client name, region, territory, etc.
- **Realtime Preview**: See the generated code as you type.
- **Excel Export**: Download project data as .xlsx.
- **Modern UI**: Built with Tailwind CSS and Framer Motion for smooth animations.
