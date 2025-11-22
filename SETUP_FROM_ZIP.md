# Setup Guide: Running from GitHub Zip

Follow these steps "inch by inch" to run the downloaded version of the app.

## Prerequisites
- **Python** (installed)
- **Node.js** (installed)
- **PostgreSQL** (installed and running)

---

## 1. Prepare the Folder
1.  **Unzip** the downloaded file (usually `client_code_app-main.zip`).
2.  Open this unzipped folder in **VS Code**.

---

## 2. Backend Setup (The Brain)

1.  Open a **Terminal** in VS Code (`Ctrl + ~`).
2.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
3.  **Create a Virtual Environment** (keeps dependencies isolated):
    ```bash
    python -m venv venv
    ```
4.  **Activate the Virtual Environment**:
    -   **Windows**: `.\venv\Scripts\activate`
    -   **Mac/Linux**: `source venv/bin/activate`
    *(You should see `(venv)` appear at the start of your command line)*
5.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
6.  **Configure Environment**:
    -   Create a new file named `.env` inside the `backend` folder.
    -   Add this line (update the password if yours is different):
        ```
        DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
        SECRET_KEY=your_secret_key_here
        ```
7.  **Run the Backend Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    *It should say: `Application startup complete.`*

---

## 3. Frontend Setup (The UI)

1.  Open a **New Terminal** (keep the backend running in the first one).
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Run the Frontend Server**:
    ```bash
    npm run dev
    ```
5.  **Open the App**:
    -   Ctrl + Click the link shown (usually `http://localhost:5173`).

---

## 4. Verification
-   Compare this running version with your previous local version.
-   The colors, buttons, and functionality should be **identical**.
