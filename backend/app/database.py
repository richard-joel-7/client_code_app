from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os

# In a real app, use environment variables. For this demo, we default to the user provided URL.
# The user can override this by setting DATABASE_URL in their environment.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/team_portal"
)

# FIX: Automatically switch to Transaction Pooler (Port 6543) for Supabase
# The "MaxClientsInSessionMode" error happens because port 5432 is the Session Pooler (limited connections).
# Port 6543 is the Transaction Pooler (thousands of connections).
if "pooler.supabase.com" in SQLALCHEMY_DATABASE_URL and ":5432" in SQLALCHEMY_DATABASE_URL:
    print("⚠️ Detected Supabase Session Pooler (5432). Switching to Transaction Pooler (6543) to fix connection limits.")
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(":5432", ":6543")

# Configure connection pooling to avoid "MaxClientsInSessionMode" errors
# We use NullPool to disable application-side pooling entirely.
# This ensures connections are closed immediately after use, preventing idle connections
# from consuming the limited Supabase slots (especially during deployments).
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=NullPool,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
