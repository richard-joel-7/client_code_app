from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Debugging: Print if DATABASE_URL is found
db_url = os.getenv("DATABASE_URL")
if db_url:
    print(f"SUCCESS: DATABASE_URL found starting with {db_url[:10]}...")
else:
    print("CRITICAL ERROR: DATABASE_URL environment variable is NOT set. Falling back to localhost (which will fail on Render).")

SQLALCHEMY_DATABASE_URL = db_url or "postgresql+psycopg2://postgres:postgres@localhost:5432/team_portal"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
