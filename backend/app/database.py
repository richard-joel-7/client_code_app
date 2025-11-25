from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# In a real app, use environment variables. For this demo, we default to the user provided URL.
# The user can override this by setting DATABASE_URL in their environment.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/team_portal"
)

# Configure connection pooling to avoid "MaxClientsInSessionMode" errors
# Supabase Transaction Pooler has a limit (e.g., 15-20 connections).
# We limit our app to 10 connections + 10 overflow to stay safe.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10,           # Keep 10 connections open
    max_overflow=10,        # Allow 10 more if needed (total 20)
    pool_timeout=30,        # Wait 30s for a connection before failing
    pool_recycle=1800,      # Recycle connections every 30 mins
    pool_pre_ping=True      # Check connection health before using
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
