from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, marketing

# Create tables (for simplicity in this demo, instead of just Alembic)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Phantom FX Marketing Tool")

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*", # Allow all origins for production (Vercel)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(marketing.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
