# Deployment Guide: Phantom FX Marketing Tool

This guide explains how to host your application for **FREE** using:
- **Database**: Supabase (PostgreSQL)
- **Backend**: Render.com (Python/FastAPI)
- **Frontend**: Vercel (React/Vite)

---

## 1. Database Setup (Supabase)

1.  Go to [supabase.com](https://supabase.com/) and sign up/login.
2.  Click **"New Project"**.
3.  Enter a Name (e.g., `phantom-fx-db`) and a strong Database Password.
4.  Choose a Region close to you (e.g., Mumbai, Singapore).
5.  Click **"Create new project"**.
6.  Once the project is ready (takes a few minutes), go to **Project Settings** (cog icon) -> **Database**.
7.  Under **Connection String**, select **URI**.
8.  **Copy this URL**. It will look like:
    `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
    *Note: You will need to replace `[YOUR-PASSWORD]` with the password you created in step 3.*

---

## 2. Backend Deployment (Render.com)

1.  Push your latest code to GitHub (you've already done this!).
2.  Go to [render.com](https://render.com/) and sign up/login.
3.  Click **"New"** -> **"Web Service"**.
4.  Connect your GitHub account and select your repository (`client_code_app`).
5.  Configure the service:
    -   **Name**: `phantom-fx-backend`
    -   **Region**: Same as Supabase if possible.
    -   **Branch**: `main`
    -   **Root Directory**: `backend` (Important!)
    -   **Runtime**: `Python 3`
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
    -   **Instance Type**: `Free`
6.  **Environment Variables** (Click "Advanced" or scroll down):
    Add the following keys and values:
    -   `DATABASE_URL`: Paste your Supabase URL from Step 1.
    -   `SECRET_KEY`: Generate a random string (e.g., `mysecretkey123`).
    -   `PYTHON_VERSION`: `3.9.0` (Optional, but good for stability).
7.  Click **"Create Web Service"**.
8.  Wait for the deployment to finish. You will get a URL like `https://phantom-fx-backend.onrender.com`. **Copy this URL**.

---

## 3. Frontend Deployment (Vercel)

1.  Go to [vercel.com](https://vercel.com/) and sign up/login.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository (`client_code_app`).
4.  Configure the project:
    -   **Framework Preset**: Vite
    -   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    -   Name: `VITE_API_URL`
    -   Value: Your Render Backend URL **without the trailing slash** (e.g., `https://phantom-fx-backend.onrender.com`).
    *Note: If you don't set this, the frontend won't be able to talk to the backend.*
6.  Click **"Deploy"**.
7.  Vercel will build and deploy your site. You will get a URL like `https://client-code-app.vercel.app`.

---

## 4. Final Verification

1.  Open your Vercel URL.
2.  Try to log in.
3.  If you see "Network Error" or nothing happens, check:
    -   Did you add `VITE_API_URL` in Vercel?
    -   Is the Render backend running (green status)?
    -   Check the Browser Console (F12) for errors.

**Enjoy your free hosted app!** 🚀
