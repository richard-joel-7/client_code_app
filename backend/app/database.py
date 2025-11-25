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
